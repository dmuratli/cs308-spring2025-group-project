# src/payment/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from datetime import datetime
from orders.models import Order, OrderItem
from admin_panel.models import Product
from .models import Transaction
from cart.models import Cart
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer
from django.db import transaction
from invoices.models import Invoice
from invoices.pdf_utils import generate_invoice_pdf  # Import the missing function
from invoices.email_utils import send_invoice_email
from django.template.loader import render_to_string

class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        # 1) Load the order
        order = get_object_or_404(Order, id=order_id, user=request.user)
        if Transaction.objects.filter(order=order).exists():
            return Response(
                {"message": "Order already processed."},
                status=status.HTTP_200_OK,
            )

        # 2) Pull out card data (accept either naming)
        data = request.data
        card_number = data.get("card_number") or data.get("cardNumber")
        expiry      = data.get("expiry")      or data.get("expiryDate")
        cvv         = data.get("cvv")

        # 3) Validation block—nothing below runs until ALL checks pass
        # 3a) All present?
        if not (card_number and expiry and cvv):
            order.delete()
            return Response({"error":"Missing payment fields"}, status=status.HTTP_400_BAD_REQUEST)

        card_number = card_number.strip()
        expiry      = expiry.strip()
        cvv         = cvv.strip()

        # 3b) Card number format
        if not (card_number.isdigit() and len(card_number) == 16):
            order.delete()
            return Response({"error":"Invalid card number"}, status=status.HTTP_400_BAD_REQUEST)

        # 3c) Expiry format & freshness
        try:
            month_str, year_str = expiry.split("/")
            month = int(month_str)
            year  = int(year_str) if len(year_str)>2 else int("20"+year_str)
            exp_date = datetime(year, month, 1)
            if exp_date < datetime.now():
                order.delete()
                return Response({"error":"Card expired"}, status=status.HTTP_400_BAD_REQUEST)
        except:
            order.delete()
            return Response({"error":"Invalid expiry format, expected MM/YY"}, status=status.HTTP_400_BAD_REQUEST)

        # 3d) CVV format
        if not (cvv.isdigit() and len(cvv)==3):
            order.delete()
            return Response({"error":"Invalid CVV"}, status=status.HTTP_400_BAD_REQUEST)

        # --- All validations passed; **now** we mutate the DB ---
        try:
            with transaction.atomic():
                # 4) Retrieve items
                items = OrderItem.objects.filter(order=order).select_related("product")

                # 5) Decrement stock (rolls back if any item fails)
                for item in items:
                    prod: Product = item.product
                    if prod.stock < item.quantity:
                        raise serializers.ValidationError(f"Not enough stock for {prod.title}")
                    prod.stock -= item.quantity
                    prod.ordered_number += item.quantity
                    prod.save()

                # 6) Mark paid and record
                order.status = "Processing"
                order.save()
                Transaction.objects.create(user=request.user, order=order, status="Completed")

                # 7) Clear the cart
                cart = Cart.objects.filter(user=request.user, is_active=True).first()
                if cart:
                    cart.items.all().delete()
                    cart.is_active = False
                    cart.save()

                # 8) Create Invoice record
                invoice = Invoice.objects.create(order=order)
                # 9) Schedule email with PDF attachment
                # Generate PDF
                pdf_bytes = generate_invoice_pdf(invoice.order)

                # Send email immediately
                send_invoice_email(
                    invoice.order.user.email,   # to_email
                    pdf_bytes,                  # pdf
                    invoice.order.id            # order_id
                )

                invoice_html = render_to_string("invoices/invoice.html",
                                {"order": order})
        
        except serializers.ValidationError as e:
            order.delete()
            return Response({"error": str(e.detail)}, status=status.HTTP_400_BAD_REQUEST)

        # 10) Success JSON returned to the frontend
        return Response(
            {
                "message": "Payment processed successfully",
                "invoice_html": invoice_html,
            },
            status=status.HTTP_200_OK,
        )

class TransactionHistoryView(generics.ListAPIView):
    """
    GET /api/payment/transactions/
    Returns all transactions for the current user, most recent first.
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-created_at')