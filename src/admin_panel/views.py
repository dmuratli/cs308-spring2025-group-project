from rest_framework import viewsets, filters
from .models import Product, Order, User
from .serializers import ProductSerializer, OrderSerializer, UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser)
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    # Uncomment the following method for debugging:
    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     if serializer.is_valid():
    #         self.perform_create(serializer)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     else:
    #         # Log the errors for debugging
    #         print(serializer.errors)
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
@api_view(['GET'])
def product_detail_by_slug(request, slug):
    product = get_object_or_404(Product, slug=slug)
    serializer = ProductSerializer(product)
    return Response(serializer.data)