from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "user", "product", "stars", "review_text", "created_at"]
        read_only_fields = ["id", "created_at", "user"] #burayı user modify edemesin diye ekledim

        #stars 0-5 arasında olduğunu kontrol et:
        def validate_stars(self, value):
            if value < 0 or value > 5:
                raise serializers.ValidationError("Stars must be between 0 and 5.")
            return value