from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, AdminOrderViewSet, AdminStatsView

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # Customer specific endpoints
    path('orders/create/', OrderViewSet.as_view({'post': 'create'}), name='order_create_custom'),
    
    # Admin order management and analytics
    path('admin/orders/', AdminOrderViewSet.as_view({'get': 'list'}), name='admin_orders_list_custom'),
    path('admin/orders/<int:pk>/', AdminOrderViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='admin_order_detail_custom'),
    path('admin/orders/<int:pk>/status/', AdminOrderViewSet.as_view({'put': 'update_status'}), name='admin_order_status_update_custom'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats_custom'),
    
    path('', include(router.urls)),
]
