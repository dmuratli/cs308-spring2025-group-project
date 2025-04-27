from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer
from orders.models import OrderItem
from admin_panel.models import Product
from django.db.models import Avg
from users.permissions import IsProductManager
from rest_framework.views import APIView
from rest_framework import status

class ReviewCreateView(generics.CreateAPIView):
    """
    POST /api/reviews/create/
    Any authenticated user can submit a star-rating + text.
    The rating immediately updates the product's average,
    but the text remains pending until approved.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product: Product = serializer.validated_data['product']
        user = self.request.user

        # 🚧 Enforce delivered-only reviews
        has_been_delivered = OrderItem.objects.filter(
            order__user=user,
            order__status='Delivered',
            product=product
        ).exists()

        if not has_been_delivered:
            raise ValidationError({
                "detail": "You can only review products that have been delivered."
            })

        # 1) save pending review
        review = serializer.save(
            user=user,
            status='pending',
            approved=False
        )

        # 2) immediately update product.rating from all stars (incl. pending)
        avg = Review.objects.filter(product=product).aggregate(avg=Avg('stars'))['avg'] or 0
        product.rating = round(avg, 2)
        product.save()

class ReviewListView(generics.ListAPIView):
    """
    GET /api/reviews/?product=<id>
    Only returns approved reviews for public display.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        return Review.objects.filter(
            product_id=product_id,
            approved=True,
            status="approved"
        )
    
class PendingReviewListView(generics.ListAPIView):
    """
    GET /api/reviews/pending/
    Admins/ProductManagers see all pending reviews.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsProductManager]

    def get_queryset(self):
        return Review.objects.filter(status='pending').order_by('created_at')
    
class ReviewApproveView(APIView):
    """
    POST /api/reviews/{pk}/approve/
    """
    permission_classes = [permissions.IsAuthenticated, IsProductManager]

    def post(self, request, pk):
        review = get_object_or_404(Review, pk=pk, status='pending')
        review.status = 'approved'
        review.save()
        return Response({'status':'approved'}, status=status.HTTP_200_OK)

class ReviewRejectView(APIView):
    """
    POST /api/reviews/{pk}/reject/
    or DELETE
    """
    permission_classes = [permissions.IsAuthenticated, IsProductManager]

    def post(self, request, pk):
        review = get_object_or_404(Review, pk=pk, status='pending')
        review.status = 'rejected'
        review.save()
        return Response({'status':'rejected'}, status=status.HTTP_200_OK)
