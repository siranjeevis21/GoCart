from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')

custom_urlpatterns = [
    path('cart/add/', CartViewSet.as_view({'post': 'add_to_cart'}), name='cart_add_custom'),
    path('cart/update/<int:pk>/', CartViewSet.as_view({'put': 'update_quantity'}), name='cart_update_custom'),
    path('cart/remove/<int:pk>/', CartViewSet.as_view({'delete': 'remove_item'}), name='cart_remove_custom'),
    path('cart/clear/', CartViewSet.as_view({'delete': 'clear_cart'}), name='cart_clear_custom'),
]

urlpatterns = custom_urlpatterns + [
    path('', include(router.urls)),
]
