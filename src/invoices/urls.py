from django.urls import path
from .api import InvoiceHTMLView

urlpatterns = [
    path("<int:pk>/html/", InvoiceHTMLView.as_view(), name="invoice-html"),
]