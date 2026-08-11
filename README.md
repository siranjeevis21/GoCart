# Full-Stack E-Commerce Web Application

A complete, production-style full-stack E-Commerce Web Application built using a modern decoupled architecture. The backend is powered by Python, Django, and Django REST Framework, connected to a MySQL database. The customer-facing frontend is built in React.js using Vite.

## 1. Technology Stack

* **Frontend**: React.js, React Router, Axios, Custom HSL Vanilla CSS
* **Backend**: Python, Django, Django REST Framework, PyMySQL, DRF SimpleJWT
* **Database**: MySQL (version 8.0+)
* **Environment Configuration**: python-dotenv

## 2. Project Architecture

```text
       React.js Frontend (Vite) [Port 5173]
                    │
            HTTPS REST Requests
                    ▼
  Django REST Framework API Server [Port 8000]
                    │
              PyMySQL Driver
                    ▼
         MySQL Database [Port 3306]
```

## 3. Folder Structure

```text
ecommerce/
│
├── backend/                  # Django REST Framework Backend
│   ├── manage.py
│   ├── config/               # Main configuration files
│   ├── users/                # User authentication & roles
│   ├── products/             # Product catalog & stock
│   ├── categories/           # Category configurations
│   ├── cart/                 # Shopping cart items & calculations
│   ├── wishlist/             # Customer wishlist items
│   ├── orders/               # Orders & order items
│   └── payments/             # Payments stubs (Cash on Delivery)
│
├── frontend/                 # React.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/          # Auth, Cart, and Wishlist Contexts
│   │   ├── hooks/
│   │   ├── layouts/          # Common components (e.g. Navbar)
│   │   ├── pages/            # Page layouts (Customer & Admin)
│   │   ├── services/         # Axios wrapper config (api.js)
│   │   ├── App.css
│   │   ├── App.jsx           # Main routing and guards
│   │   ├── index.css         # Styling system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .env                      # Local configuration values
├── .env.example              # Config template
├── seed_db.py                # Database seeder utility
└── README.md
```

---

## 4. Requirements & Prerequisites

Ensure the following tools are installed on your machine:

1. **Python** (version 3.10 or later)
2. **Node.js** (version 20 or later)
3. **MySQL Server** (version 8.0 or later, with a running database service)

---

## 5. Installation & Setup

### Step 1: Environment Configuration

Copy the sample environment file to `.env` in the workspace root:

```bash
cp .env.example .env
```

Configure your local database credentials inside the `.env` file:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_NAME=ecommerce
DATABASE_USER=root
DATABASE_PASSWORD=your-mysql-password
DATABASE_HOST=localhost
DATABASE_PORT=3306
JWT_SECRET=your-jwt-secret-key
API_URL=http://localhost:8000
```

### Step 2: MySQL Configuration

Make sure your MySQL service is running, and log into your client to create the database:

```sql
CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

*(Note: The database is automatically created if you run the `seed_db.py` seeding script.)*

### Step 3: Backend Setup & Migrations

1. Activate your virtual environment:
   ```powershell
   .venv\Scripts\activate
   ```
2. Install Python packages:
   ```bash
   pip install django djangorestframework django-cors-headers djangorestframework-simplejwt pymysql python-dotenv Pillow
   ```
3. Make and run database migrations:
   ```bash
   python backend/manage.py makemigrations
   python backend/manage.py migrate
   ```

### Step 4: Seed Database & Create Accounts

Pre-populate the database with test categories, featured products, a customer account, and an administrator account:

```bash
python seed_db.py
```

This command creates the following default login accounts:
* **Admin Account**:
  * **Username**: `admin` (or email: `admin@example.com`)
  * **Password**: `adminpassword123`
* **Customer Account**:
  * **Username**: `customer` (or email: `customer@example.com`)
  * **Password**: `customerpassword123`

---

## 6. Running the Project

### Running the Backend REST API Server

Start the Django local development server on port 8000:

```bash
python backend/manage.py runserver
```

### Running the React Frontend

Open a new terminal session, navigate to the `frontend` folder, install JavaScript dependencies, and start the Vite server:

```bash
cd frontend
npm install
npm run dev
```

The React frontend will be running locally at `http://localhost:5173`.

---

## 7. API Documentation & Endpoints

### Authentication

* `POST /api/auth/register/` - Create a new user profile
* `POST /api/auth/login/` - Login to obtain access and refresh tokens (supports username or email)
* `POST /api/auth/refresh/` - Refresh expired access token
* `GET /api/auth/profile/` - View profile details (Authenticated users only)
* `PUT /api/auth/profile/` - Update profile details (Authenticated users only)

### Products & Categories

* `GET /api/categories/` - List all category folders
* `POST /api/categories/` - Create a category (Admin only)
* `GET /api/products/` - List all available products (supports searching, category filtering, price filtering, and sorting)
* `POST /api/products/` - Create a product catalog entry with image file upload (Admin only)
* `PATCH /api/products/<id>/` - Partially update a product (Admin only)
* `DELETE /api/products/<id>/` - Delete a product (Admin only)

### Cart & Wishlist

* `GET /api/cart/` - View cart items, subtotal, shipping fee, and grand total
* `POST /api/cart/add/` - Add a product to cart (Validates stock limits)
* `PUT /api/cart/update/<id>/` - Update quantity of an item
* `DELETE /api/cart/remove/<id>/` - Delete item from cart
* `DELETE /api/cart/clear/` - Clear all cart items
* `GET /api/wishlist/` - View wishlist products
* `POST /api/wishlist/add/` - Add product to wishlist (Prevents duplicates)
* `DELETE /api/wishlist/<id>/` - Remove item from wishlist

### Orders & Administration

* `POST /api/orders/create/` - Placed order from cart (Checks stock, subtracts quantities, clears cart, and records shipping details)
* `GET /api/orders/` - Retrieve order history for current customer
* `GET /api/orders/<id>/` - Retrieve customer order details
* `GET /api/admin/orders/` - List all system orders (Admin only)
* `PUT /api/admin/orders/<id>/status/` - Update order dispatch or payment status (Admin only)
* `GET /api/admin/stats/` - Fetch total sales and counts for dashboard charts (Admin only)

---

## 8. Testing Instructions

To run the automated test suite for the authentication API endpoints:

```bash
cd backend
python manage.py test
```
