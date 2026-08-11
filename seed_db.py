import os
import sys
from decimal import Decimal

# Set up Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from categories.models import Category
from products.models import Product

User = get_user_model()

def seed():
    print("Seeding database...")
    
    # 1. Create Admin user
    admin_username = "admin"
    admin_email = "admin@example.com"
    admin_password = "adminpassword123"
    
    admin_user, created = User.objects.get_or_create(
        username=admin_username,
        defaults={
            'email': admin_email,
            'first_name': 'Shop',
            'last_name': 'Admin',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True,
            'phone': '1234567890',
            'address': 'Main HQ Office, Commerce City'
        }
    )
    if created:
        admin_user.set_password(admin_password)
        admin_user.save()
        print(f"Admin created: username='{admin_username}', password='{admin_password}'")
    else:
        print(f"Admin already exists: username='{admin_username}'")

    # 2. Create Customer user
    cust_username = "customer"
    cust_email = "customer@example.com"
    cust_password = "customerpassword123"
    
    cust_user, created = User.objects.get_or_create(
        username=cust_username,
        defaults={
            'email': cust_email,
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'CUSTOMER',
            'phone': '9876543210',
            'address': '123 Customer Street, Shopping Town'
        }
    )
    if created:
        cust_user.set_password(cust_password)
        cust_user.save()
        print(f"Customer created: username='{cust_username}', password='{cust_password}'")
    else:
        print(f"Customer already exists: username='{cust_username}'")

    # 3. Create Categories
    categories = [
        {"name": "Electronics", "description": "Laptops, phones, headphones and smart gadgets."},
        {"name": "Apparel & Clothing", "description": "Modern shirts, jackets, trousers and stylish wear."},
        {"name": "Home & Living", "description": "Kitchen tools, furniture, decorations, and sheets."},
        {"name": "Books & Stationery", "description": "Fiction novels, academic textbooks, notebooks and pens."}
    ]
    
    cat_objs = {}
    for cat_data in categories:
        cat, created = Category.objects.get_or_create(
            name=cat_data["name"],
            defaults={"description": cat_data["description"]}
        )
        cat_objs[cat.name] = cat
        if created:
            print(f"Category created: '{cat.name}'")
            
    # 4. Create Products
    products = [
        {
            "name": "SuperBass Wireless Headphones",
            "description": "Premium active noise-cancelling wireless headphones with 40-hour battery life and deep bass boost.",
            "price": Decimal("2499.00"),
            "discount_price": Decimal("1999.00"),
            "category": cat_objs["Electronics"],
            "stock_quantity": 25,
            "brand": "SonicSound",
            "is_available": True
        },
        {
            "name": "Developer Pro Mechanical Keyboard",
            "description": "Ergonomic tactile blue switches mechanical keyboard with RGB backlights and durable PBT keycaps.",
            "price": Decimal("4999.00"),
            "discount_price": None,
            "category": cat_objs["Electronics"],
            "stock_quantity": 10,
            "brand": "ClickyTech",
            "is_available": True
        },
        {
            "name": "Classic Denim Jacket",
            "description": "Timeless unisex blue denim jacket made of 100% premium cotton with dual breast pockets.",
            "price": Decimal("1899.00"),
            "discount_price": Decimal("1499.00"),
            "category": cat_objs["Apparel & Clothing"],
            "stock_quantity": 50,
            "brand": "FitWear",
            "is_available": True
        },
        {
            "name": "Minimalist Ceramic Coffee Mug",
            "description": "Handcrafted matte grey ceramic mug with comfortable handle. Microwave and dishwasher safe.",
            "price": Decimal("450.00"),
            "discount_price": Decimal("399.00"),
            "category": cat_objs["Home & Living"],
            "stock_quantity": 100,
            "brand": "ClayArt",
            "is_available": True
        },
        {
            "name": "Agentic AI & Future of Code",
            "description": "Bestselling paperback book outlining the rise of autonomous coding agents and LLM architectures.",
            "price": Decimal("799.00"),
            "discount_price": None,
            "category": cat_objs["Books & Stationery"],
            "stock_quantity": 5,
            "brand": "TechPress Publishing",
            "is_available": True
        }
    ]

    for prod_data in products:
        prod, created = Product.objects.get_or_create(
            name=prod_data["name"],
            defaults={
                "description": prod_data["description"],
                "price": prod_data["price"],
                "discount_price": prod_data["discount_price"],
                "category": prod_data["category"],
                "stock_quantity": prod_data["stock_quantity"],
                "brand": prod_data["brand"],
                "is_available": prod_data["is_available"]
            }
        )
        if created:
            print(f"Product created: '{prod.name}'")
            
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
