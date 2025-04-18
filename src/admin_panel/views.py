from rest_framework import viewsets, filters, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.parsers import JSONParser

from .models import Product, User
from .serializers import ProductSerializer, UserSerializer
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer
from cart.models import Cart

from users.permissions import IsProductManager, IsSalesManager, IsCustomer, IsProductManagerOrSalesManager

@method_decorator(csrf_exempt, name='dispatch')
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    # default fallback
    permission_classes = [permissions.AllowAny]

    # per‑action override
    permission_classes_by_action = {
        "list":       [permissions.AllowAny],
        "retrieve":   [permissions.AllowAny],
        "create":     [permissions.IsAuthenticated, IsProductManager],
        "update":     [permissions.IsAuthenticated, IsProductManager],
        "partial_update": [permissions.IsAuthenticated, IsProductManager],
        "destroy":    [permissions.IsAuthenticated, IsProductManager],
        "adjust_stock": [permissions.IsAuthenticated, IsProductManager],
    }

    def get_permissions(self):
        perms = self.permission_classes_by_action.get(self.action, self.permission_classes)
        return [p() for p in perms]

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        """
        Partial-style PUT: drop any non-file 'cover_image' values
        so JSON updates (price, stock, etc.) don't trigger that error.
        """
        # Copy data so we can mutate it
        data = request.data.copy()

        # If cover_image is present but not an uploaded file, remove it
        cover_val = data.get('cover_image', None)
        from django.core.files.uploadedfile import UploadedFile
        if cover_val is not None and not isinstance(cover_val, UploadedFile):
            data.pop('cover_image', None)

        instance   = self.get_object()
        serializer = self.get_serializer(instance,
                                         data=data,
                                         partial=True)  # behave like PATCH
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @method_decorator(csrf_exempt)
    @action(detail=True, methods=['post'], parser_classes=[JSONParser])
    def adjust_stock(self, request, slug=None):
        product = self.get_object()
        change = int(request.data.get("change", 0))

        if product.stock + change < 0:
            return Response({"error": "Stock cannot go below zero."}, status=400)

        product.stock += change
        product.save()
        return Response({"message": "Stock updated", "stock": product.stock})


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsProductManagerOrSalesManager()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def perform_create(self, serializer):
        # Handle custom creation via PlaceOrderView – prevent direct creation here
        raise NotImplementedError("Use the /api/orders/place/ endpoint to place orders.")

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
def product_detail_by_slug(request, slug):
    product = get_object_or_404(Product, slug=slug)
    serializer = ProductSerializer(product)
    return Response(serializer.data)
