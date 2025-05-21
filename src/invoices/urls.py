# src/invoices/urls.py

from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import InvoiceViewSet, InvoiceHTMLView, MyInvoicePDF

router = DefaultRouter()
# ──> registers:
#        GET  /api/invoices/       → InvoiceViewSet.list()
#        GET  /api/invoices/{pk}/  → InvoiceViewSet.retrieve()
router.register(r'', InvoiceViewSet, basename='invoice')

urlpatterns = [
    # 1) list & detail from ViewSet
    *router.urls,

    # 2) print-friendly HTML (will open and auto-print)
    path('<int:pk>/html/', InvoiceHTMLView.as_view(), name='invoice-html'),

    # 3) inline PDF (browser will render or download)
    path('<int:pk>/pdf/',  MyInvoicePDF.as_view(),   name='invoice-pdf'),
]