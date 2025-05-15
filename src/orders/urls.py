from django.urls import path
from .views import PlaceOrderView, OrderStatusUpdateView, MyRefundsView, OrderListView, OrderProductInfoView, OrderItemsView, MyOrderListView, RefundOrderView, CreateRefundRequestView, ListRefundRequestsView, ProcessRefundRequestView
from .views import RevenueReportView


urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place-order"),
    path('product-info/<int:order_id>/', OrderProductInfoView.as_view(), name='order-product-info'),
    path("<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),
    path("<int:order_id>/items/",   OrderItemsView.as_view(), name="order-items"),
    path("", OrderListView.as_view(), name="order-list"),
    path('mine/', MyOrderListView.as_view(), name='my-orders'),
    path('<int:order_id>/refund/', RefundOrderView.as_view(), name='order-refund'),
    path("<int:order_id>/refund-requests/",     CreateRefundRequestView.as_view(), name="refund-requests-create"),
    path("refund-requests/pending/",            ListRefundRequestsView.as_view(),   name="refund-requests-list"),
    path("refund-requests/<int:pk>/process/",   ProcessRefundRequestView.as_view(),  name="refund-requests-process"),
    path("refunds/mine/", MyRefundsView.as_view(), name="my-refunds"),
    path("revenue-report/", RevenueReportView.as_view(), name="revenue-report"),

]