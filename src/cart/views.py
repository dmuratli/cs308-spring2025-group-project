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

         # Convert override parameter properly (if override is "true", then True, else False)
        override_param = request.data.get("override", "false")
        if isinstance(override_param, str):
            override = override_param.lower() == "true"
        else:
            override = bool(override_param)
        product = get_object_or_404(Product, id=product_id)

        # Handle item removal when quantity is 0
        if quantity == 0:
            item = CartItem.objects.filter(cart=cart, product=product).first()
            if item:
                item.delete()
                serializer = CartSerializer(cart)
                return Response(serializer.data)
            return Response({"message": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        # Get or create the cart item
        item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product, 
            defaults={'quantity': quantity}
        )

        if created:
            if product.stock < quantity:
                return Response(
                    {"error": "Not enough stock available for this product."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            if override:
                if product.stock < quantity:
                    return Response(
                        {"error": "Not enough stock available for this product."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # Set the quantity to the exact amount provided (may decrease quantity)
                item.quantity = quantity
            else:
                new_quantity = item.quantity + quantity
                if product.stock < new_quantity:
                    return Response(
                        {"error": "Not enough stock available for this product."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                item.quantity = new_quantity
            item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
