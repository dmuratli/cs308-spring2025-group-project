# src/orders/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction

from .models import Order, OrderItem
from cart.models import Cart

class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 1) Fetch the active cart for the user
        cart = Cart.objects.filter(user=request.user, is_active=True).first()
        if not cart or not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # 2) Validate stock availability for every item
        for item in cart.items.all():
            if item.quantity > item.product.stock:
                return Response(
                    {"error": f"Not enough stock for {item.product.title}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3) Create order + items in one atomic block (no stock mutation here)
        with transaction.atomic():
            order = Order.objects.create(user=request.user, total_price=0)
            total = 0

            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase=item.product.price,
                )
                total += item.quantity * item.product.price

            order.total_price = total
            order.save()

            # 4) Clear the cart
            cart.items.all().delete()
            cart.is_active = False
            cart.save()

        return Response(
            {"message": "Order placed successfully", "order_id": order.id},
            status=status.HTTP_201_CREATED
        )
