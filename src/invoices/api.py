from rest_framework import viewsets

from invoices.pdf_utils import generate_invoice_pdf
from users.permissions import IsSalesManager
from .models import Invoice
from .serializers import InvoiceSerializer
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    sales‑manager endpoint: /api/invoices/?start=2025‑04‑01&end=2025‑04‑18
    """
    serializer_class  = InvoiceSerializer
    permission_classes = [IsSalesManager]

    def get_queryset(self):
        qs = Invoice.objects.all().order_by("-created_at")
        s  = self.request.query_params.get("start")
        e  = self.request.query_params.get("end")
        if s:
            qs = qs.filter(created_at__date__gte=datetime.fromisoformat(s).date())
        if e:
            qs = qs.filter(created_at__date__lte=datetime.fromisoformat(e).date())
        return qs

class MyInvoicePDF(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        invoice = get_object_or_404(Invoice, pk=pk)
        if invoice.customer != request.user and request.user.role != "sales_manager":
            return Response(status=403)
        pdf_bytes = generate_invoice_pdf(invoice)
        return HttpResponse(
            pdf_bytes,
            headers={"Content-Disposition": f'inline; filename="invoice_{pk}.pdf"'},
            content_type="application/pdf",
        )
    
class InvoiceHTMLView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        invoice = get_object_or_404(
            Invoice, pk=pk, order__user=request.user
        )
        html = render_to_string(
            "invoices/invoice.html",
            {"order": invoice.order}
        )
        return HttpResponse(html, content_type="text/html")
