from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    # 1) Pull customer name off the related Order → User
    customer = serializers.SerializerMethodField()

    # 2) Expose order.total_price under the field name "total"
    total = serializers.DecimalField(
        source='order.total_price',
        max_digits=10,
        decimal_places=2
    )

    # 3) Render created_at as a date-only ISO string
    date = serializers.SerializerMethodField()

    class Meta:
        model  = Invoice
        fields = ['id', 'customer', 'total', 'date']

    def get_customer(self, obj):
        # prefer full name, fallback to username
        user = obj.order.user
        return user.get_full_name() or user.username

    def get_date(self, obj):
        # ensure we return "YYYY-MM-DD"
        return obj.created_at.date().isoformat()
