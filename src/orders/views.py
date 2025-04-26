# src/orders/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import PermissionDenied
from django.db import transaction

from .models import Order, OrderItem
from cart.models import Cart
from admin_panel.models import Product


class OrderProductInfoView(APIView):
    """
    GET /api/orders/product-info/<order_id>/
    -> { "product_id": ..., "product_slug": ... }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        try:
            order_item = OrderItem.objects.get(order_id=order_id, order__user=request.user)
            return Response({
                "product_id": order_item.product.id,
                "product_slug": order_item.product.slug
            })
        except OrderItem.DoesNotExist:
            raise PermissionDenied("Order not found or you don't have access.")


class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
       
        cart = Cart.objects.filter(user=request.user, is_active=True).first()
        if not cart or not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        
        for item in cart.items.all():
            if item.quantity > item.product.stock:
                return Response(
                    {"error": f"Not enough stock for {item.product.title}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        
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

            
            cart.items.all().delete()
            cart.is_active = False
            cart.save()

        return Response(
            {"message": "Order placed successfully", "order_id": order.id},
            status=status.HTTP_201_CREATED
        )
