from django.urls import path
from .views import PlaceOrderView,OrderProductInfoView

urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place-order"),
    path('product-info/<int:order_id>/', OrderProductInfoView.as_view(), name='order-product-info'),
]