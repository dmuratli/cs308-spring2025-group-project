from rest_framework import generics, permissions
from rest_framework.response import Response
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
        product = serializer.validated_data['product']

        review = serializer.save(
            user=self.request.user,
            status='pending'
        )

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
