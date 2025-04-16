from rest_framework import generics, permissions, serializers
from .models import Review
from .serializers import ReviewSerializer
from orders.models import OrderItem  # 
from rest_framework.permissions import IsAuthenticated

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        user = self.request.user

        # Check if user received the product
        delivered_items = OrderItem.objects.filter(
            order__user=user,
            order__status="Delivered",
            product=product
        )

        if not delivered_items.exists():
            raise serializers.ValidationError("You can only review a product after it has been delivered.")

        # Create review with "pending" status
        serializer.save(user=user, status='pending')
