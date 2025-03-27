from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from admin_panel.models import Product
from .serializers import CartSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated

class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get_cart(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user, is_active=True)
        return cart

    def get(self, request):
        cart = self.get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        cart = self.get_cart(request)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        product = get_object_or_404(Product, id=product_id)

        if product.stock < quantity:
            return Response({"error": "Not enough stock."}, status=status.HTTP_400_BAD_REQUEST)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
