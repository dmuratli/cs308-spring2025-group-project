from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Order, OrderItem
from admin_panel.models import Product
from cart.models import Cart, CartItem

class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart = Cart.objects.filter(user=request.user, is_active=True).first()
        if not cart or not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        total = 0
        for item in cart.items.all():
            if item.quantity > item.product.stock:
                return Response({"error": f"Not enough stock for {item.product.title}"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(user=request.user, total_price=0)
        for item in cart.items.all():
            product = item.product
            product.decrease_stock(item.quantity)

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                price_at_purchase=product.price,
            )
            total += item.quantity * product.price

        order.total_price = total
        order.save()

        cart.is_active = False
        cart.save()

        return Response({"message": "Order placed successfully", "order_id": order.id}, status=status.HTTP_201_CREATED)
