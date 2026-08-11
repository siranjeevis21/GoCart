from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_detail', 'quantity', 'price', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'user_username', 'user_email', 'total_amount', 
            'shipping_name', 'shipping_phone', 'shipping_address', 
            'shipping_city', 'shipping_state', 'shipping_zip_code', 
            'status', 'payment_status', 'items', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'total_amount', 'status', 'payment_status', 'created_at', 'updated_at')
