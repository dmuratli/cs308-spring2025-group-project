from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Review
from .serializers import ReviewSerializer

# Create your views here.


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request, product_id):
    #buraya önce product page implemente edilmesi lazım
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    if Review.objects.filter(user=request.user, product=product).exists():
        return Response({"error": "You have already reviewed this product."}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data.copy()
    data['user'] = request.user.id
    data['product'] = product.id

    serializer = ReviewSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=request.user, product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_product_reviews(request, product_id):
    #buraya önce product page implemente edilmesi lazım
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    reviews = Review.objects.filter(product=product)
    serializer = ReviewSerializer(reviews, many=True)
    
    avg_stars = Review.get_average_stars(product)  # Calls the model method to get the avg rating
    
    return Response({"average_stars": avg_stars, "reviews": serializer.data}, status=status.HTTP_200_OK)