from rest_framework import serializers
from .models import Product, Order, User

class ProductSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=True)
    
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["ordered_count"]
    def validate_isbn(self, value):
        """Ensure ISBN is exactly 13 digits."""
        if not value.isdigit() or len(value) != 13:
            raise serializers.ValidationError("ISBN must be exactly 13 digits.")
        return value


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"
    def create(self, validated_data):
        products = validated_data.pop('products')  # Siparişteki ürünleri al
        order = Order.objects.create(**validated_data)  # Siparişi oluştur
        order.products.set(products)  # Ürünleri siparişle ilişkilendir

        # Sipariş edilen ürünlerin ordered_count'ını artır
        for product in products:
            product.ordered_count += 1
            product.save()

        return order
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
