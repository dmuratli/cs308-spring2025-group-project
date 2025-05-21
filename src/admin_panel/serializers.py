from rest_framework import serializers
from .models import Product
from users.models import User

class ProductSerializer(serializers.ModelSerializer):
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'author', 'price', 'stock', 'isbn', 'genre', 'description',
            'publisher', 'publication_date', 'cover_image', 'pages', 'language',
            'discount_rate', 'discount_start', 'discount_end', 'current_price', 'slug'
        ]

    def get_current_price(self, obj):
        return obj.current_price


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'created_at']
