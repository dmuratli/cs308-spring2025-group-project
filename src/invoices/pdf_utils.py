import tempfile
from django.template.loader import render_to_string
from weasyprint import HTML

def generate_invoice_pdf(order) -> bytes:
    """
    Renders an HTML template to PDF bytes for the given Order.
    """
    html_string = render_to_string("invoices/invoice.html", {"order": order})
    html = HTML(string=html_string)
    return html.write_pdf()
