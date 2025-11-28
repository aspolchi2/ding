from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = [
            'uuid',
            'created_at',
            'first_viewed_at',
            'last_viewed_at'
        ]

class OrderPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            'order_id',
            'customer_name',
            'status',
        )