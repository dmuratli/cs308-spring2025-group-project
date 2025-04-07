from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from admin_panel.models import Product
from .serializers import CartSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny

class CartView(APIView):
    permission_classes = [AllowAny]

    def get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user, is_active=True)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            cart, _ = Cart.objects.get_or_create(session_key=session_key, is_active=True)
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

        # ❌ Prevent adding out-of-stock products
        if product.stock <= 0:
            return Response({"error": "This product is out of stock."}, status=status.HTTP_400_BAD_REQUEST)

        # ❌ Prevent exceeding available stock
        existing_item = CartItem.objects.filter(cart=cart, product=product).first()
        current_quantity = existing_item.quantity if existing_item else 0
        if product.stock < current_quantity + quantity:
            return Response(
                {"error": f"Only {product.stock - current_quantity} more item(s) available in stock."},
                status=status.HTTP_400_BAD_REQUEST
            )

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        item.quantity += quantity if not created else quantity
        item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
