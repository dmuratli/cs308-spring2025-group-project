from django.template.loader import render_to_string
from weasyprint import HTML
from django.conf import settings
import tempfile

def render_invoice_pdf(invoice) -> bytes:
    html = render_to_string("invoices/invoice.html", {"invoice": invoice})
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        HTML(string=html, base_url=settings.BASE_DIR).write_pdf(tmp.name)
        tmp.seek(0)
        return tmp.read()
