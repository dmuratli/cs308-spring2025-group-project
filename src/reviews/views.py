from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer
from orders.models import Order  # make sure your app is named correctly

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        user = self.request.user

        # Check if user received the product
        delivered_orders = Order.objects.filter(user=user, product=product, status='delivered')
        if not delivered_orders.exists():
            raise serializers.ValidationError("You can only review a product after delivery.")

        # Create review with "pending" status
        serializer.save(user=user, status='pending')
