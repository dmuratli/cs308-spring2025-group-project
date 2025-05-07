from rest_framework import serializers
from .models import Order, OrderItem
from .models import Refund

class OrderItemSerializer(serializers.ModelSerializer):
    # Include the product's title for frontend display
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_title',
            'quantity',
            'price_at_purchase',
        ]

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

class RefundRequestSerializer(serializers.Serializer):
    items = RefundItemRequestSerializer(many=True)

class RefundResponseSerializer(serializers.Serializer):
    refunded_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status          = serializers.CharField()