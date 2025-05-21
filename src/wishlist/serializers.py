from rest_framework import serializers
from .models import WishlistItem
from .models import Product
from admin_panel.serializers import ProductSerializer   # reuse your existing product schema

class ProductMiniSerializer(serializers.ModelSerializer):
    product_price = serializers.DecimalField(source="price", max_digits=10, decimal_places=2)
    product_cover_image = serializers.ImageField(source="cover_image")

    class Meta:
        model  = Product
        fields = ("id", "title", "slug", "product_price", "product_cover_image")

class WishlistItemSerializer(serializers.ModelSerializer):
    product    = ProductMiniSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True,
    )

    class Meta:
        model = WishlistItem
        fields = ("id", "product", "product_id", "added_at")
        read_only_fields = ("id", "added_at")


class WishlistResponseSerializer(serializers.Serializer):
    """Wrapper ↔ matches what the frontend expects."""
    id = serializers.IntegerField()                  # let's expose the user-id as wishlist id
    items = WishlistItemSerializer(many=True, read_only=True)