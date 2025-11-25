# Inventory Management System

A robust TypeScript Express.js inventory management system built with bulletproof Node.js architecture principles.

## Features

### 🏪 Store Management
- Create, read, update, and delete stores
- Store location and contact information
- Pagination and search functionality

### 📦 Product Management
- Full CRUD operations for products
- Product categorization and SKU management
- Advanced filtering and sorting capabilities
- Bulk stock updates
- Low stock alerts

### 🔧 Technical Features
- **Security**: Helmet, CORS, rate limiting
- **Performance**: Optimized queries with Drizzle ORM
- **Architecture**: Clean, layered bulletproof structure
- **Validation**: Comprehensive Zod schema validation
- **Database**: PostgreSQL with proper indexing
- **TypeScript**: Full type safety throughout

## API Endpoints

### Stores
- `POST /api/v1/stores` - Create a new store
- `GET /api/v1/stores` - Get all stores (with pagination/filtering)
- `GET /api/v1/stores/:id` - Get store by ID
- `PUT /api/v1/stores/:id` - Update store
- `DELETE /api/v1/stores/:id` - Delete store

### Products
- `POST /api/v1/products` - Create a new product
- `GET /api/v1/products` - Get all products (with pagination/filtering)
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `PATCH /api/v1/products/bulk-update-stock` - Bulk update stock quantities
- `GET /api/v1/products/low-stock` - Get low stock products
- `GET /api/v1/stores/:storeId/products` - Get products by store

## Query Parameters

### Products Filtering
```
?page=1&limit=10&category=electronics&minPrice=50&maxPrice=500&minStock=10&sortBy=price&sortOrder=asc
```

### Stores Filtering
```
?page=1&limit=10&city=NewYork&state=NY&search=walmart
```

## Database Schema

### Stores Table
- ID (Primary Key)
- Name, Address, City, State, Zip Code
- Phone Number, Email
- Created/Updated timestamps

### Products Table  
- ID (Primary Key)
- Store ID (Foreign Key)
- Name, Description, Category
- Price, Quantity in Stock, SKU
- Created/Updated timestamps
- **Indexes**: store_id, category, price, stock, sku

## Performance Optimizations

### N+1 Query Prevention
- Single query with JOIN for product-store relationships
- Eager loading of related data
- Proper indexing on frequently queried columns

### Database Indexes
- `products_store_id_idx`: Fast store-based filtering
- `products_category_idx`: Category-based queries
- `products_price_idx`: Price range filtering
- `products_stock_idx`: Stock level queries
- `products_sku_idx`: SKU lookups

## Setup Instructions

### 🐳 Docker Setup (Recommended)

1. **Quick Start with Docker**
   ```bash
   # Start development environment
   npm run docker:dev
   
   # Run database migrations and seed data
   npm run docker:setup
   ```

2. **Access the Application**
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/status
   - pgAdmin (optional): http://localhost:5050

3. **Docker Commands**
   ```bash
   # Development environment
   npm run docker:dev
   
   # Production environment  
   npm run docker:prod
   
   # Database management UI
   npm run docker:pgadmin
   
   # Run migrations only
   npm run docker:migrate
   
   # Seed database only
   npm run docker:seed
   
   # Stop containers
   npm run docker:down
   
   # Clean up everything
   npm run docker:clean
   ```

### 💻 Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. **Database Setup**
   ```bash
   # Generate migrations
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database with sample data
   npm run seed
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── api/                    # API routes and controllers
│   ├── controllers/       # Request handlers
│   └── routes/           # Route definitions
├── config/               # Configuration files
│   └── database.ts       # Database connection
├── interfaces/           # TypeScript interfaces & DTOs
│   ├── store.ts         # Store-related types
│   ├── product.ts       # Product-related types
│   └── common.ts        # Shared interfaces
├── loaders/             # Application initialization
│   ├── express.ts       # Express setup
│   └── index.ts         # Loader orchestration
├── models/              # Database models
│   ├── store.ts         # Store schema
│   ├── product.ts       # Product schema
│   └── index.ts         # Model exports
├── services/            # Business logic layer
│   ├── store.service.ts # Store operations
│   └── product.service.ts # Product operations
└── index.ts             # Application entry point
```

## 🗄️ Sample Data

The system comes with pre-configured seed data including:
- **8 Stores** across different US cities (NYC, LA, Chicago, Miami, etc.)
- **30 Products** across various categories:
  - Smartphones (iPhone 15, Galaxy S24, Pixel 8)
  - Laptops (MacBook Air M3, Dell XPS 13)
  - Gaming (PS5, Xbox Series X, Nintendo Switch)
  - Audio (AirPods Pro, Sony headphones)
  - Smart Home devices
  - PC Components and accessories

## 🐳 Docker Configuration

### Services
- **postgres**: PostgreSQL 15 database with health checks
- **api-dev**: Development API server with hot reload
- **api**: Production API server (profile: production)
- **migrate**: Database migration runner (profile: migrate) 
- **seed**: Database seeder (profile: seed)
- **pgadmin**: Database management UI (profile: pgadmin)

### Environment Variables
```env
DATABASE_URL=postgresql://inventory_user:inventory_password@postgres:5432/inventory_db
NODE_ENV=development
PORT=3000
```

### Profiles
- `default`: postgres + api-dev (development)
- `production`: postgres + api (production build)
- `migrate`: runs database migrations
- `seed`: populates database with sample data
- `pgadmin`: database management interface

## Sample API Calls

### Create Store
```bash
curl -X POST http://localhost:3000/api/v1/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Electronics",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "phoneNumber": "555-0123",
    "email": "contact@downtown.com"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": 1,
    "name": "iPhone 15",
    "description": "Latest Apple smartphone",
    "category": "Electronics",
    "price": "999.99",
    "quantityInStock": 50,
    "sku": "IP15-128GB-BLK"
  }'
```

### Get Products with Filtering
```bash
curl "http://localhost:3000/api/v1/products?category=Electronics&minPrice=100&maxPrice=1000&page=1&limit=20&sortBy=price&sortOrder=asc"
```