from django.urls import path
from .views import PlaceOrderView, OrderStatusUpdateView, OrderListView

urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place-order"),
    path("<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),
    path("", OrderListView.as_view(), name="order-list"),
]