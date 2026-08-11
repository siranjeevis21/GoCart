from rest_framework import serializers
from .models import CartItem
from products.serializers import ProductSerializer
from products.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = CartItem
        fields = ('id', 'user', 'product', 'product_detail', 'quantity', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def validate(self, attrs):
        product = attrs.get('product') or (self.instance.product if self.instance else None)
        quantity = attrs.get('quantity')

        if product:
            if not product.is_available:
                raise serializers.ValidationError("This product is currently unavailable.")
            
            # Verify stock availability
            if quantity is not None and quantity > product.stock_quantity:
                raise serializers.ValidationError(
                    f"Requested quantity {quantity} exceeds available stock of {product.stock_quantity}."
                )

        return attrs
