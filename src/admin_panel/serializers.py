from rest_framework import serializers
from .models import Product, Order, User, Genre
from django.db.models import Avg

class ProductSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=True)
    rating = serializers.SerializerMethodField()
    genre_name = serializers.CharField(source="genre.name", read_only=True)

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("price",)

    def validate_isbn(self, value):
        """Ensure ISBN is exactly 13 digits."""
        if not value.isdigit() or len(value) != 13:
            raise serializers.ValidationError("ISBN must be exactly 13 digits.")
        return value

    def get_rating(self, obj):
        avg = (
            obj.reviews
               .filter(approved=True)
               .aggregate(Avg('stars'))
               .get('stars__avg')
        )
        return round(avg or 0, 2)

class ProductPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("price",)

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Genre name cannot be empty."
            )
        return value