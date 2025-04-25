from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework import status, permissions
from django.db import transaction
from users.permissions import IsProductManager

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderStatusUpdateSerializer, OrderSerializer
from cart.models import Cart, CartItem

VALID_TRANSITIONS = {
    'Processing': ['Shipped', 'Cancelled'],
    'Shipped':    ['Delivered'],
    'Delivered':  ['Refunded'],
    'Refunded':   [],
}

class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # 1) Fetch the active cart for the user
        cart = Cart.objects.filter(user=request.user, is_active=True).first()
        if not cart or not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # 2) Validate stock availability for every item
        for item in cart.items.select_related('product'):
            if item.quantity > item.product.stock:
                return Response(
                    {"error": f"Not enough stock for {item.product.title}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3) Create order + items, calculate total
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
            # decrement stock
            item.product.decrease_stock(item.quantity)

        order.total_price = total
        order.save()

        # 4) Clear the cart: remove items and deactivate
        cart.items.all().delete()
        cart.is_active = False
        cart.save()

        return Response(
            {"message": "Order placed successfully", "order_id": order.id},
            status=status.HTTP_201_CREATED
        )

class OrderStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsProductManager]

    def patch(self, request, pk):
        order = Order.objects.filter(pk=pk).first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in VALID_TRANSITIONS[order.status]:
            return Response(
                {'error': f"Invalid transition: {order.status} → {new_status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()
        OrderStatusHistory.objects.create(order=order, status=new_status)

        return Response({'status': order.status}, status=status.HTTP_200_OK)
    
class OrderListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsProductManager]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer