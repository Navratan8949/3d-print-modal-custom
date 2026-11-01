# Prime 3D Printing Lab - Backend API & Studio Portal

Robust, production-ready Node.js, Express, and MongoDB backend for Prime 3D Printing Lab. Follows enterprise MVC architecture, modular routers, Nodemailer SMTP with Gmail App Password integration, Multer multipart file upload handling, JWT authentication, and WhatsApp order synchronization.

---

## 📁 Architecture & Folder Structure

```
backend/
├── .env                  # Environment variables with SMTP credentials & JWT secret
├── .env.example          # Environment sample template
├── package.json          # Dependencies & execution scripts
├── uploads/              # Upload storage directories
│   ├── products/         # Product showcase images
│   ├── orders/           # Customer reference 3D photos / assets
│   └── users/            # Customer avatar profiles
└── src/
    ├── server.js         # Entry point & graceful shutdown listener
    ├── app.js            # Express application setup, middlewares, routes, error handlers
    ├── seed.js           # Database seeder (Admin, demo customer, 31 catalog products)
    ├── config/
    │   └── db.js         # MongoDB connection client via Mongoose
    ├── middleware/
    │   ├── authMiddleware.js    # JWT Bearer token validator & req.user injector
    │   ├── roleMiddleware.js    # Role-based RBAC (admin / super_admin / customer)
    │   └── activityLogger.js    # Production request/response telemetry logger
    ├── utils/
    │   ├── sendMail.js          # Nodemailer SMTP email service (welcome, OTP, orders, updates)
    │   └── multer.js            # Multer diskStorage handlers with file type validation
    ├── models/
    │   ├── User.js              # User schema with bcrypt pre-save hashing & address book
    │   ├── Product.js           # 3D Product schema with specs, options, tags, images
    │   └── Order.js             # Order schema with items, customer info, tracking, WhatsApp
    ├── controllers/
    │   ├── authController.js       # Register, Login, Forgot Password (OTP), Reset, Profile
    │   ├── productController.js    # Product CRUD, category aggregation, featured toggle
    │   ├── orderController.js      # Order placement, WhatsApp formatting, tracking updates
    │   └── dashboardController.js  # Studio metrics (orders, pending, revenue, products)
    └── routes/
        ├── authRoutes.js        # /api/auth/*
        ├── productRoutes.js     # /api/products/*
        ├── orderRoutes.js       # /api/orders/*
        └── dashboardRoutes.js   # /api/dashboard/*
```

---

## 🔑 Configured Credentials

- **Admin Account**: `prime3dprintinglab@gmail.com`
- **Default Admin Password**: `Admin@Prime3D2026!`
- **SMTP Service**: Gmail SMTP (`smtp.gmail.com:465`)
- **SMTP User**: `prime3dprintinglab@gmail.com`
- **SMTP App Password**: `ordfiripqxfgclfk` *(Cleaned from screenshot)*
- **WhatsApp Support Number**: `+91 6376145171`
- **MongoDB URI**: `mongodb://localhost:27017/prime_3d_db`
- **Backend Port**: `5001` (avoids macOS AirPlay port 5000 conflict)

---

## 🚀 Running the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already installed)
npm install

# Seed Admin & initial 31 products from frontend catalog
npm run seed

# Run in Development mode with nodemon
npm run dev

# Or Start in Production mode
npm start
```

---

## 📡 API Endpoints Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & sends welcome email | Public |
| `POST` | `/api/auth/login` | Login with email & password, returns JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `POST` | `/api/auth/forgot-password` | Sends 6-digit OTP to user email via Nodemailer | Public |
| `POST` | `/api/auth/reset-password` | Verifies OTP / token and updates password | Public |
| `POST` | `/api/auth/update-profile` | Update profile info or upload avatar | Authenticated |
| `POST` | `/api/auth/change-password` | Change password with current password verification | Authenticated |

### 2. Products Catalog (`/api/products`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/products` | Get products with search, category & pagination | Public |
| `GET` | `/api/products/categories` | Get category breakdown & product counts | Public |
| `GET` | `/api/products/:identifier`| Get single product by slug, ID, or Mongo ID | Public |
| `POST` | `/api/products` | Create new product with image uploads | Admin |
| `PUT` | `/api/products/:id` | Update product details & specifications | Admin |
| `DELETE` | `/api/products/:id` | Delete product from catalog | Admin |
| `PATCH` | `/api/products/:id/toggle-featured` | Toggle featured showcase on homepage | Admin |

### 3. Orders & WhatsApp (`/api/orders`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Creates order in DB, dispatches admin alert email & customer confirmation, and returns formatted WhatsApp redirect URL | Public / Auth |
| `GET` | `/api/orders/my-orders` | Fetch orders placed by logged-in user | Authenticated |
| `GET` | `/api/orders/admin/all` | List all orders with status filters & search | Admin |
| `GET` | `/api/orders/:id` | Get order details by ID or order number (`P3D-...`) | Customer / Admin |
| `PATCH` | `/api/orders/:id/status` | Update status (`pending`, `confirmed`, `in_production`, `shipped`, `delivered`), add tracking info, sends email update | Admin |
| `DELETE` | `/api/orders/:id` | Remove order record | Admin |

### 4. Admin Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Get overview metrics (total orders, pending, revenue, products, recent orders) | Admin |

