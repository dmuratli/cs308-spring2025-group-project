from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "user", "product", "stars", "review_text", "created_at", "status"]
        read_only_fields = ["id", "created_at", "user", "status"]

    def validate_stars(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Stars must be between 1 and 5.")
        return value
