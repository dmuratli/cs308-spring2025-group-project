from rest_framework import viewsets, filters
from .models import Product, Order, User
from .serializers import ProductSerializer, OrderSerializer, UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser)  # ✅ Allow file uploads
    
     # Arama desteği
    filter_backends = [filters.SearchFilter]  
    search_fields = ['title', 'description']  # Kullanıcı başlık ve açıklama üzerinden arama yapabilir

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
