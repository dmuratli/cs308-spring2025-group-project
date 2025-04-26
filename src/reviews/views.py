from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer
from orders.models import OrderItem
from admin_panel.models import Product  # <-- bunu da ekle

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        user = self.request.user

        # geçici olarak teslimat kontrolü kaldırıldı:
        serializer.save(user=user, approved=True, status='approved')

class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        return Review.objects.filter(product_id=product_id)

