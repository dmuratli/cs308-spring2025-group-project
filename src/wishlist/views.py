from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from .models import WishlistItem
from .serializers import WishlistItemSerializer, WishlistResponseSerializer


class WishlistViewSet(viewsets.GenericViewSet):
    """
    Routes produced by the router:

        GET  /wishlist/          – list current user’s wishlist
        POST /wishlist/add/      – body: { "product_id": <int> }
        POST /wishlist/remove/   – body: { "product_id": <int> }
    """
    permission_classes = [permissions.IsAuthenticated]

    # ----- helpers ----------------------------------------------------------
    def _items_qs(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related("product")

    def _response(self, *, status_code=status.HTTP_200_OK):
        """
        Standardised JSON wrapper:
            { "id": <user_id>, "items": [ … ] }
        """
        payload = {
            "id": self.request.user.id,
            "items": self._items_qs(),
        }
        return Response(WishlistResponseSerializer(payload).data, status=status_code)

    # ----- endpoints --------------------------------------------------------
    def list(self, request, *args, **kwargs):
        """GET /wishlist/"""
        return self._response()

    @action(detail=False, methods=["post"], url_path="add")
    def add(self, request, *args, **kwargs):
        """POST /wishlist/add/   { product_id }"""
        serializer = WishlistItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save(user=request.user)  # will raise IntegrityError on duplicate
        except IntegrityError:
            pass  # Ignore if already in wishlist
        return self._response(status_code=status.HTTP_201_CREATED)


    @action(detail=False, methods=["post"], url_path="remove")
    def remove(self, request, *args, **kwargs):
        """POST /wishlist/remove/   { product_id }"""
        product_id = request.data.get("product_id")
        if product_id is None:
            return Response({"detail": "product_id is required."},
                            status=status.HTTP_400_BAD_REQUEST)

        obj = get_object_or_404(WishlistItem,
                                user=request.user,
                                product_id=product_id)
        obj.delete()
        return self._response()
