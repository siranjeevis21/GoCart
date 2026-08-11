from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Sum
from decimal import Decimal

from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import CartItem
from products.models import Product
from django.contrib.auth import get_user_model
from users.views import IsAdminUserPermission

User = get_user_model()

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Customers can only access their own orders
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = CartItem.objects.filter(user=user)
        
        if not cart_items.exists():
            return Response({"error": "Your cart is empty. Cannot place an order."}, status=status.HTTP_400_BAD_REQUEST)
            
        shipping_name = request.data.get('shipping_name')
        shipping_phone = request.data.get('shipping_phone')
        shipping_address = request.data.get('shipping_address')
        shipping_city = request.data.get('shipping_city')
        shipping_state = request.data.get('shipping_state')
        shipping_zip_code = request.data.get('shipping_zip_code')
        
        if not all([shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip_code]):
            return Response({"error": "All shipping and contact fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = Decimal('0.00')
        items_to_create = []
        
        # Verify availability and stock
        for item in cart_items:
            product = item.product
            if not product.is_available:
                return Response(
                    {"error": f"Product '{product.name}' is currently unavailable."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if item.quantity > product.stock_quantity:
                return Response(
                    {"error": f"Product '{product.name}' only has {product.stock_quantity} items in stock. Your cart has {item.quantity}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            price = product.discount_price if product.discount_price is not None else product.price
            item_subtotal = price * item.quantity
            subtotal += item_subtotal
            items_to_create.append((product, item.quantity, price, item_subtotal))
            
        delivery = Decimal('50.00')
        total_amount = subtotal + delivery

        # Create Order
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            shipping_name=shipping_name,
            shipping_phone=shipping_phone,
            shipping_address=shipping_address,
            shipping_city=shipping_city,
            shipping_state=shipping_state,
            shipping_zip_code=shipping_zip_code,
            status='PENDING',
            payment_status='PENDING'
        )

        # Create OrderItems and deduct stock
        for product, quantity, price, item_subtotal in items_to_create:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price,
                subtotal=item_subtotal
            )
            # Deduct stock quantity
            product.stock_quantity -= quantity
            if product.stock_quantity <= 0:
                product.stock_quantity = 0
                product.is_available = False
            product.save()

        # Clear current customer's cart
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = (IsAdminUserPermission,)

    @action(detail=True, methods=['put'], url_path='status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        status_val = request.data.get('status')
        payment_status_val = request.data.get('payment_status')
        
        updated = False
        if status_val:
            valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
            if status_val not in valid_statuses:
                return Response(
                    {"error": f"Invalid status. Must be one of {valid_statuses}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            order.status = status_val
            updated = True
            
        if payment_status_val:
            valid_payment_statuses = [choice[0] for choice in Order.PAYMENT_STATUS_CHOICES]
            if payment_status_val not in valid_payment_statuses:
                return Response(
                    {"error": f"Invalid payment_status. Must be one of {valid_payment_statuses}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            order.payment_status = payment_status_val
            updated = True
            
        if updated:
            order.save()
            return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)
            
        return Response({"error": "Provide 'status' or 'payment_status' to update."}, status=status.HTTP_400_BAD_REQUEST)


class AdminStatsView(APIView):
    permission_classes = (IsAdminUserPermission,)

    def get(self, request):
        total_products = Product.objects.count()
        total_customers = User.objects.filter(role='CUSTOMER').count()
        
        orders = Order.objects.all()
        total_orders = orders.count()
        pending_orders = orders.filter(status='PENDING').count()
        completed_orders = orders.filter(status='DELIVERED').count()
        
        total_sales = orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        # Breakdown statistics for charts visualization
        status_counts = {
            'PENDING': orders.filter(status='PENDING').count(),
            'CONFIRMED': orders.filter(status='CONFIRMED').count(),
            'PROCESSING': orders.filter(status='PROCESSING').count(),
            'SHIPPED': orders.filter(status='SHIPPED').count(),
            'DELIVERED': orders.filter(status='DELIVERED').count(),
            'CANCELLED': orders.filter(status='CANCELLED').count(),
        }
        
        # Monthly sales breakdown (simple mock data or date group if needed, let's group by created_at date)
        # We can extract last 7 orders to give recent transaction activity log
        recent_orders = OrderSerializer(orders.order_by('-created_at')[:5], many=True).data

        return Response({
            'total_products': total_products,
            'total_customers': total_customers,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'total_sales': float(total_sales),
            'status_counts': status_counts,
            'recent_orders': recent_orders
        })
