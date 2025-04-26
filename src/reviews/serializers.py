from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "user", "product", "stars", "review_text", "created_at", "status", "username"]
        read_only_fields = ["id", "created_at", "user", "status", "username"]

    def validate_stars(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Stars must be between 1 and 5.")
        return value

    def get_username(self, obj):
        return obj.user.username if obj.user else "Anonymous"
