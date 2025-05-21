from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework import status, permissions
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from users.permissions import IsProductManager

from cart.models import Cart
from admin_panel.models import Product
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderStatusUpdateSerializer, OrderSerializer, OrderItemSerializer
from cart.models import Cart, CartItem

class OrderProductInfoView(APIView):
    """
    GET /api/orders/product-info/<order_id>/
      -> { "items": [ {product_id,product_slug,product_title,quantity}, … ] }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        # fetch all items for this order AND this user
        qs = (
            OrderItem.objects
            .filter(order_id=order_id, order__user=request.user)
            .select_related("product")
        )
        if not qs.exists():
            raise PermissionDenied("Order not found or you don't have access.")

        # build a list of items
        items = [
            {
                "product_id":   oi.product.id,
                "product_slug": oi.product.slug,
                "product_title": oi.product.title,
                "quantity":     oi.quantity,
            }
            for oi in qs
        ]

        return Response({"items": items})

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
        # 1) Check if the user has an active cart
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

        # 3) Create the order and order items
        with transaction.atomic():
            order = Order.objects.create(user=request.user, total_price=0)
            total = 0

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_at_purchase=item.product.current_price,
            )
            total += item.quantity * item.product.current_price

        order.total_price = total
        order.save()

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

class MyOrderListView(ListAPIView):
    """
    GET /api/orders/mine/
    Returns only the current user's orders, regardless of role.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderItemsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        items = OrderItem.objects.filter(order_id=order_id, order__user=request.user).select_related("product")
        serializer = OrderItemSerializer(items, many=True)
        return Response(serializer.data)