from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    date     = serializers.DateField(source='created_at', format='%Y-%m-%d')

    class Meta:
        model = Invoice
        fields = ['id', 'customer', 'total', 'date']

    def get_customer(self, obj):
        return obj.customer.get_full_name() or obj.customer.username
