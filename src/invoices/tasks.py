from e_commerce_app.celery import shared_task
from .models import Invoice
from .pdf_utils import render_invoice_pdf
from .email_utils import email_invoice

@shared_task
def send_invoice_email(invoice_id: int):
    invoice = Invoice.objects.get(pk=invoice_id)
    pdf     = render_invoice_pdf(invoice)
    email_invoice(invoice, pdf)