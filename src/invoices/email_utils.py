from django.core.mail import EmailMessage
from django.conf import settings

def email_invoice(invoice, pdf_bytes):
    msg = EmailMessage(
        subject=f"Invoice #{invoice.pk}",
        body="Thanks for your order – the invoice is attached.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[invoice.customer.email],
    )
    msg.attach(f"invoice_{invoice.pk}.pdf", pdf_bytes, "application/pdf")
    msg.send(fail_silently=False)