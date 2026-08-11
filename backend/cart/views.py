from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
from .models import CartItem
from .serializers import CartItemSerializer
from products.models import Product

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Prevent unauthorized access to another customer's cart
        return CartItem.objects.filter(user=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Calculate totals on the backend for security
        subtotal = Decimal('0.00')
        for item in queryset:
            price = item.product.discount_price if item.product.discount_price is not None else item.product.price
            subtotal += price * item.quantity
            
        delivery = Decimal('50.00') if subtotal > 0 else Decimal('0.00')
        total = subtotal + delivery

        return Response({
            'items': serializer.data,
            'subtotal': float(subtotal),
            'delivery': float(delivery),
            'total': float(total)
        })

    @action(detail=False, methods=['post'], url_path='add')
    def add_to_cart(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']
            quantity = serializer.validated_data.get('quantity', 1)
            user = request.user
            
            # Check if product is already in the cart
            cart_item = CartItem.objects.filter(user=user, product=product).first()
            if cart_item:
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock_quantity:
                    return Response(
                        {"error": f"Cannot add quantity. Available stock is only {product.stock_quantity}."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_quantity
                cart_item.save()
                return Response(self.get_serializer(cart_item).data, status=status.HTTP_200_OK)
            else:
                cart_item = serializer.save(user=user)
                return Response(self.get_serializer(cart_item).data, status=status.HTTP_201_CREATED)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'], url_path='update')
    def update_quantity(self, request, pk=None):
        cart_item = self.get_object()
        quantity = request.data.get('quantity')
        
        if quantity is None:
            return Response({"quantity": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({"quantity": "Quantity must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"quantity": "Quantity must be a valid integer."}, status=status.HTTP_400_BAD_REQUEST)

        # Check stock limits
        product = cart_item.product
        if quantity > product.stock_quantity:
            return Response(
                {"error": f"Cannot update quantity to {quantity}. Only {product.stock_quantity} left in stock."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        cart_item.quantity = quantity
        cart_item.save()
        return Response(self.get_serializer(cart_item).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['delete'], url_path='remove')
    def remove_item(self, request, pk=None):
        cart_item = self.get_object()
        cart_item.delete()
        return Response({"message": "Item removed from cart."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_cart(self, request):
        self.get_queryset().delete()
        return Response({"message": "Cart cleared successfully."}, status=status.HTTP_204_NO_CONTENT)
