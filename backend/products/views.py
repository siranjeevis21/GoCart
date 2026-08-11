from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer
from categories.views import IsAdminOrReadOnly

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Customers only see available products
        user = self.request.user
        is_admin = user and user.is_authenticated and user.role == 'ADMIN'
        if not is_admin:
            queryset = queryset.filter(is_available=True)

        # Category filter
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Price range filters
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=min_price)
            except ValueError:
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=max_price)
            except ValueError:
                pass

        # Text search
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(brand__icontains=search_query)
            )

        # Sorting
        ordering = self.request.query_params.get('ordering')
        if ordering:
            if ordering == 'price_asc':
                queryset = queryset.order_by('price')
            elif ordering == 'price_desc':
                queryset = queryset.order_by('-price')
            elif ordering == 'newest':
                queryset = queryset.order_by('-created_at')
            else:
                queryset = queryset.order_by(ordering)
        else:
            # Default sorting: Newest products first
            queryset = queryset.order_by('-created_at')

        return queryset
