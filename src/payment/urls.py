from django.urls import path
from .views import ProcessPaymentView, TransactionHistoryView

urlpatterns = [
    path("process/<int:order_id>/", ProcessPaymentView.as_view(), name="process-payment"),
    path("transactions/", TransactionHistoryView.as_view(),  name="transaction-history"),
]
