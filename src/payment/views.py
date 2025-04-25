# src/payment/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from datetime import datetime
from orders.models import Order, OrderItem
from admin_panel.models import Product
from .models import Transaction
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer
from django.db import transaction

class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        # 1) Load the order
        order = get_object_or_404(Order, id=order_id, user=request.user)
        if order.status != "Processing":
            return Response({"message":"Order already processed."}, status=status.HTTP_200_OK)

        # 2) Pull out card data (accept either naming)
        data = request.data
        card_number = data.get("card_number") or data.get("cardNumber")
        expiry      = data.get("expiry")      or data.get("expiryDate")
        cvv         = data.get("cvv")

        # 3) Validation block—nothing below runs until ALL checks pass
        # 3a) All present?
        if not (card_number and expiry and cvv):
            return Response({"error":"Missing payment fields"}, status=status.HTTP_400_BAD_REQUEST)

        card_number = card_number.strip()
        expiry      = expiry.strip()
        cvv         = cvv.strip()

        # 3b) Card number format
        if not (card_number.isdigit() and len(card_number) == 16):
            return Response({"error":"Invalid card number"}, status=status.HTTP_400_BAD_REQUEST)

        # 3c) Expiry format & freshness
        try:
            month_str, year_str = expiry.split("/")
            month = int(month_str)
            year  = int(year_str) if len(year_str)>2 else int("20"+year_str)
            exp_date = datetime(year, month, 1)
            if exp_date < datetime.now():
                return Response({"error":"Card expired"}, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({"error":"Invalid expiry format, expected MM/YY"}, status=status.HTTP_400_BAD_REQUEST)

        # 3d) CVV format
        if not (cvv.isdigit() and len(cvv)==3):
            return Response({"error":"Invalid CVV"}, status=status.HTTP_400_BAD_REQUEST)

        # --- All validations passed; **now** we mutate the DB ---
        with transaction.atomic():
            # 4) Retrieve items
            items = OrderItem.objects.filter(order=order).select_related("product")

            # 5) Decrement stock (rolls back if any item fails)
            for item in items:
                prod: Product = item.product
                if prod.stock < item.quantity:
                    return Response(
                        {"error":f"Not enough stock for {prod.title}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                prod.stock -= item.quantity
                prod.save()

            # 6) Mark paid and record
            order.status = "Processing"
            order.save()
            Transaction.objects.create(user=request.user, order=order, status="Completed")

        # 7) Success
        return Response({"message":"Payment processed successfully"}, status=status.HTTP_200_OK)



class TransactionHistoryView(generics.ListAPIView):
    """
    GET /api/payment/transactions/
    Returns all transactions for the current user, most recent first.
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-created_at')