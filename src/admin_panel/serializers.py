from rest_framework import serializers
from .models import Product, Order, User

class ProductSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=True)
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["created-at", "slug"]

    def validate_isbn(self, value):
        """Ensure ISBN is exactly 13 digits."""
        if not value.isdigit() or len(value) != 13:
            raise serializers.ValidationError("ISBN must be exactly 13 digits.")
        return value

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
