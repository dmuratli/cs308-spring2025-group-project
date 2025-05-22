from decimal import Decimal
from rest_framework import serializers
from .models import Cart, CartItem
from admin_panel.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(
        source='product.price', max_digits=10, decimal_places=2, read_only=True
    )
    cover_image = serializers.ImageField(source='product.cover_image', read_only=True)
    stock = serializers.IntegerField(source='product.stock', read_only=True)
    # ◀ Add the raw discount %
    discount_percent = serializers.DecimalField(
        source='product.discount_percent',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    # ◀ Compute the unit price after discount
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product',
            'product_title',
            'product_price',
            'discount_percent',
            'discounted_price',
            'quantity',
            'total_price',
            'cover_image',
            'stock',
        ]

    def get_discounted_price(self, obj):
        discount = obj.product.discount_percent or Decimal("0")
        price = obj.product.price
        return (
            price * (Decimal("100") - discount) / Decimal("100")
        ).quantize(Decimal("0.01"))


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    def get_total(self, obj):
        return sum(item.total_price for item in obj.items.all())

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'is_active', 'items', 'total']
