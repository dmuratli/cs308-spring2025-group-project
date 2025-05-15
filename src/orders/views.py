from decimal import Decimal
from django.utils import timezone, dateparse
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import F, Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework import status, permissions
from rest_framework.exceptions import PermissionDenied

from users.permissions import IsProductManager, IsSalesManager
from cart.models import Cart
from admin_panel.models import Product

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
    Refund,
    RefundRequest,
)
from .serializers import (
    OrderStatusUpdateSerializer,
    OrderSerializer,
    OrderItemSerializer,
    RefundRequestSerializer,
    RefundResponseSerializer,
    CreateRefundRequestSerializer,
    ProcessRefundRequestSerializer,
    InsRefundRequestSerializer,
)

VALID_TRANSITIONS = {
    'Processing': ['Shipped', 'Cancelled'],
    'Shipped':    ['Delivered'],
    'Delivered':  ['Refunded'],
    'Refunded':   [],
}

class OrderProductInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        qs = (
            OrderItem.objects
            .filter(order_id=order_id, order__user=request.user)
            .select_related("product")
        )
        if not qs.exists():
            raise PermissionDenied("Order not found or you don't have access.")

        items = [
            {
                "product_id": oi.product.id,
                "product_slug": oi.product.slug,
                "product_title": oi.product.title,
                "quantity": oi.quantity,
            }
            for oi in qs
        ]
        return Response({"items": items})


class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart = Cart.objects.filter(user=request.user, is_active=True).first()
        if not cart or not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        for item in cart.items.select_related("product"):
            if item.quantity > item.product.stock:
                return Response(
                    {"error": f"Not enough stock for {item.product.title}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        order = Order.objects.create(user=request.user, total_price=0)
        total = Decimal("0")
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

        return Response(
            {"message": "Order placed successfully", "order_id": order.id},
            status=status.HTTP_201_CREATED
        )


class OrderStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsProductManager]

    @transaction.atomic
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

        if new_status == "Cancelled":
            for item in order.items.select_related("product").all():
                Product.objects.filter(pk=item.product.pk).update(
                    stock=F("stock") + item.quantity
                )

        OrderStatusHistory.objects.create(order=order, status=new_status)

        return Response({'status': order.status}, status=status.HTTP_200_OK)


class RefundOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_id):
        order = Order.objects.filter(pk=order_id, user=request.user).first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        if order.status != 'Delivered':
            return Response(
                {'error': 'Only delivered orders can be refunded.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = InsRefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        total_refund = Decimal("0")
        for item_data in serializer.validated_data['items']:
            try:
                oi = OrderItem.objects.get(pk=item_data['order_item_id'], order=order)
            except OrderItem.DoesNotExist:
                return Response(
                    {'error': f"OrderItem {item_data['order_item_id']} not found."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            qty = item_data['quantity']
            if qty > oi.refundable_quantity():
                return Response(
                    {'error': f"Cannot refund {qty} of item#{oi.id}, only {oi.refundable_quantity()} refundable."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            refund_amount = oi.price_at_purchase * qty
            Refund.objects.create(
                order=order,
                order_item=oi,
                quantity=qty,
                refund_amount=refund_amount
            )

            OrderItem.objects.filter(pk=oi.pk).update(
                refunded_quantity=F("refunded_quantity") + qty
            )
            Product.objects.filter(pk=oi.product.pk).update(
                stock=F("stock") + qty
            )

            total_refund += refund_amount

        if all(i.quantity == i.refunded_quantity for i in order.items.all()):
            Order.objects.filter(pk=order.pk).update(status="Refunded")
            OrderStatusHistory.objects.create(order=order, status="Refunded")

        return Response(
            RefundResponseSerializer({
                'refunded_amount': total_refund,
                'status': order.status
            }).data,
            status=status.HTTP_200_OK
        )


class MyRefundsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        refunds = Refund.objects.filter(order__user=request.user).select_related('order_item__product')
        data = [
            {
                "id": r.id,
                "product_title": r.order_item.product.title,
                "quantity": r.quantity,
                "refund_amount": str(r.refund_amount),
                "created_at": r.created_at.isoformat(),
            }
            for r in refunds
        ]
        return Response(data)


class OrderListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsProductManager]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class MyOrderListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderItemsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        items = OrderItem.objects.filter(
            order_id=order_id, order__user=request.user
        ).select_related("product")
        serializer = OrderItemSerializer(items, many=True)
        return Response(serializer.data)


class CreateRefundRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_id):
        serializer = CreateRefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        oi = OrderItem.objects.filter(
            pk=serializer.validated_data['order_item_id'],
            order__id=order_id,
            order__user=request.user,
            order__status="Delivered"
        ).first()
        if not oi:
            return Response({"error": "Item not found or not delivered."}, status=status.HTTP_404_NOT_FOUND)

        qty = serializer.validated_data['quantity']
        if qty > oi.refundable_quantity():
            return Response({"error": "Exceeds refundable quantity."}, status=status.HTTP_400_BAD_REQUEST)
        if not oi.within_refund_window():
            return Response({"error": "Refund window expired."}, status=status.HTTP_400_BAD_REQUEST)

        rr = RefundRequest.objects.create(
            order_item=oi,
            user=request.user,
            quantity=qty
        )
        return Response(RefundRequestSerializer(rr).data, status=status.HTTP_201_CREATED)


class ListRefundRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSalesManager]

    def get(self, request):
        qs = RefundRequest.objects.filter(status="Pending").select_related(
            'order_item__product', 'user'
        )
        return Response(RefundRequestSerializer(qs, many=True).data)


class ProcessRefundRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSalesManager]

    @transaction.atomic
    def post(self, request, pk):
        rr = RefundRequest.objects.filter(pk=pk, status="Pending").first()
        if not rr:
            return Response({"error": "Not found or already processed."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProcessRefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rr.status = serializer.validated_data['status']
        rr.response_message = serializer.validated_data['response_message']
        rr.processed_at = timezone.now()
        rr.save()

        if rr.status == "Approved":
            oi = rr.order_item
            amount = oi.price_at_purchase * rr.quantity
            Refund.objects.create(
                order=oi.order,
                order_item=oi,
                quantity=rr.quantity,
                refund_amount=amount
            )

            OrderItem.objects.filter(pk=oi.pk).update(
                refunded_quantity=F("refunded_quantity") + rr.quantity
            )
            Product.objects.filter(pk=oi.product.pk).update(
                stock=F("stock") + rr.quantity
            )

            if not oi.order.items.exclude(refunded_quantity=F("quantity")).exists():
                Order.objects.filter(pk=oi.order.pk).update(status="Refunded")
                OrderStatusHistory.objects.create(order=oi.order, status="Refunded")

            send_mail(
                subject="Your refund is approved",
                message=(
                    f"Hello {rr.user.username},\n\n"
                    f"Your refund for {rr.quantity}× “{oi.product.title}” has been APPROVED.\n"
                    f"Amount refunded: {amount:.2f}\n\nThank you."
                ),
                from_email="no-reply@yourshop.com",
                recipient_list=[rr.user.email],
                fail_silently=False,
            )

        return Response(RefundRequestSerializer(rr).data, status=status.HTTP_200_OK)


# ✅ Revenue Report
class RevenueReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSalesManager]

    def get(self, request):
        start = dateparse.parse_date(request.GET.get("start"))
        end = dateparse.parse_date(request.GET.get("end"))

        if not start or not end or start > end:
            return Response({"error": "Invalid date range"}, status=status.HTTP_400_BAD_REQUEST)

        delivered_order_ids = OrderStatusHistory.objects.filter(
            status="Delivered",
            timestamp__date__range=(start, end)
        ).values_list("order_id", flat=True)

        orders = Order.objects.filter(id__in=delivered_order_ids)

        total_revenue = orders.aggregate(total=Sum("total_price"))["total"] or Decimal("0.0")
        total_cost = total_revenue * Decimal("0.5")
        profit = total_revenue - total_cost

        return Response({
            "revenue": float(total_revenue),
            "cost": float(total_cost),
            "profit": float(profit),
        })
