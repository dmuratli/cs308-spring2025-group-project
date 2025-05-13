from rest_framework import serializers
from .models import Order, OrderItem, Refund, RefundRequest

class OrderItemSerializer(serializers.ModelSerializer):
    # Include the product's title for frontend display
    product_title = serializers.CharField(source='product.title', read_only=True)
    refundable_quantity = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_title',
            'quantity',
            'price_at_purchase',
            'refundable_quantity',
        ]
    def get_refundable_quantity(self, obj):
        return obj.quantity - obj.refunded_quantity

class OrderSerializer(serializers.ModelSerializer):
    # Expose the actual username of the customer (the Order model uses a `user` FK)
    customer = serializers.CharField(source='user.username', read_only=True)
    # Expose the total price as a decimal field
    total = serializers.DecimalField(
        source='total_price',
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'items',
            'total',
            'status',
            'created_at',
        ]

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

class RefundItemRequestSerializer(serializers.Serializer):
    order_item_id = serializers.IntegerField()
    quantity      = serializers.IntegerField(min_value=1)

class InsRefundRequestSerializer(serializers.Serializer):
    items = RefundItemRequestSerializer(many=True)

class RefundResponseSerializer(serializers.Serializer):
    refunded_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status          = serializers.CharField()

class RefundRequestSerializer(serializers.ModelSerializer):
    order_item_details = serializers.SerializerMethodField()

    class Meta:
        model = RefundRequest
        fields = [
            'id',
            'order_item',
            'quantity',
            'status',
            'requested_at',
            'processed_at',
            'response_message',
            'order_item_details',  
        ]

    def get_order_item_details(self, obj):
        return {
            "product_title": obj.order_item.product.title,
            "price_at_purchase": obj.order_item.price_at_purchase,
        }


class CreateRefundRequestSerializer(serializers.Serializer):
    order_item_id = serializers.IntegerField()
    quantity      = serializers.IntegerField(min_value=1)

class ProcessRefundRequestSerializer(serializers.Serializer):
    status          = serializers.ChoiceField(choices=["Approved","Rejected"])
    response_message= serializers.CharField(allow_blank=True)