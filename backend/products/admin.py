from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'discount_price', 'category', 'stock_quantity', 'brand', 'is_available')
    list_filter = ('category', 'is_available', 'brand')
    search_fields = ('name', 'brand')
