from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory

class OrderItemSerializer(serializers.ModelSerializer):
    # Include the product's title for convenience
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_title',
            'quantity',
            'price_at_purchase',
            # ─── Task 4: expose the snapshot discount_rate ───────────
            'discount_rate',
        ]


class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.CharField(source='user.username', read_only=True)
    total = serializers.DecimalField(
        source='total_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
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
        model = OrderStatusHistory
        fields = [
            'id',
            'order',
            'previous_status',
            'new_status',
            'changed_at',
        ]
