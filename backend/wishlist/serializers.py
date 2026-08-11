from rest_framework import serializers
from .models import Wishlist
from products.serializers import ProductSerializer
from products.models import Product

class WishlistSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Wishlist
        fields = ('id', 'user', 'product', 'product_detail', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

    def validate(self, attrs):
        user = self.context['request'].user
        product = attrs['product']
        
        # Check if product is already in the user's wishlist
        if Wishlist.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("This product is already in your wishlist.")
            
        return attrs
