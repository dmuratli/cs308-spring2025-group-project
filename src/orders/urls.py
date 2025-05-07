from django.urls import path
from .views import PlaceOrderView, OrderStatusUpdateView, OrderListView, OrderProductInfoView, OrderItemsView, MyOrderListView, RefundOrderView

urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place-order"),
    path('product-info/<int:order_id>/', OrderProductInfoView.as_view(), name='order-product-info'),
    path("<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),
    path("<int:order_id>/items/",   OrderItemsView.as_view(), name="order-items"),
    path("", OrderListView.as_view(), name="order-list"),
    path('mine/', MyOrderListView.as_view(), name='my-orders'),
    path('<int:order_id>/refund/', RefundOrderView.as_view(), name='order-refund'),
]