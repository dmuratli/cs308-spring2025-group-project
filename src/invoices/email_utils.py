from django.core.mail import EmailMessage
from django.conf import settings

def send_invoice_email(to_email: str, pdf_bytes: bytes, order_id: int):
    subject = f"Your Invoice #{order_id}"
    body = "Thank you for your order! Please find your invoice attached."
    email = EmailMessage(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email])
    email.attach(f"invoice_{order_id}.pdf", pdf_bytes, "application/pdf")
    email.send(fail_silently=False)
