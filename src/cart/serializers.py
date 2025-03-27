from rest_framework import serializers
from .models import Cart, CartItem
from admin_panel.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_title', 'product_price', 'quantity', 'total_price']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    def get_total(self, obj):
        return sum(item.total_price for item in obj.items.all())

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'is_active', 'items', 'total']