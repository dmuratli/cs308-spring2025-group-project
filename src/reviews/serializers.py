from rest_framework import serializers
from .models import Review
from orders.models import OrderItem


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "user", "product",
            "stars", "review_text",
            "created_at", "status", "approved",
            "username",
        ]
        read_only_fields = [
            "id", "created_at", "user",
            "status", "approved", "username",
        ]

    def validate(self, data):
        """
        Only allow a review if the requesting user has at least one
        delivered OrderItem for this product.
        """
        user = self.context["request"].user
        product = data.get("product")

        has_been_delivered = OrderItem.objects.filter(
            order__user=user,
            product=product,
            order__status="Delivered"
        ).exists()

        if not has_been_delivered:
            raise serializers.ValidationError(
                "You can only leave a review after the order has been delivered."
            )
        return data

    def validate_stars(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Stars must be between 1 and 5.")
        return value

    def get_username(self, obj):
        return getattr(obj.user, "username", "Anonymous")