from django.urls import path
from .views import PlaceOrderView, OrderStatusUpdateView, OrderListView, OrderProductInfoView

urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place-order"),
    path('product-info/<int:order_id>/', OrderProductInfoView.as_view(), name='order-product-info'),
    path("<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),
    path("", OrderListView.as_view(), name="order-list"),
]