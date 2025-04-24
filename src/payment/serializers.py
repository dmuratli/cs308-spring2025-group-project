# src/payment/serializers.py

from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    order_id   = serializers.IntegerField(source='order.id', read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    status     = serializers.CharField(read_only=True)

    class Meta:
        model  = Transaction
        fields = ['id', 'order_id', 'status', 'created_at']
