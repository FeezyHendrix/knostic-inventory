# Inventory Management System

A full-stack inventory management application with a Node.js/TypeScript backend and React/TypeScript frontend.

## Features

### Backend (API)
- **Products Management**: CRUD operations with pagination, filtering, and search
- **Stores Management**: CRUD operations for store locations
- **Data Validation**: Input validation using Zod schemas
- **Database**: PostgreSQL with Drizzle ORM
- **Error Handling**: Comprehensive error responses
- **Rate Limiting**: Built-in protection against abuse

### Frontend (Web App)
- **Two Main Views**: 
  - Products List/Detail view with filtering and pagination
  - Stores List/Detail view for managing store locations
- **Loading & Error States**: Graceful handling of all states
- **Form Validation**: Client-side validation with clear error messages
- **Responsive Design**: Mobile-friendly interface
- **Real-time Filtering**: Search and filter products by various criteria

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker (Recommended)

```bash
# Start the full application stack
docker compose up

# Or run in detached mode
docker compose up -d
```

This will start:
- **Frontend**: http://localhost:3001 (React dev server)
- **Backend API**: http://localhost:3000 (Node.js/Express)
- **Database**: PostgreSQL on port 5432

The application will automatically:
1. Set up the PostgreSQL database
2. Run migrations
3. Seed the database with sample data
4. Start both frontend and backend in development mode

### Production Mode

```bash
# Run production build
docker compose --profile production up
```

This will serve:
- **Frontend**: http://localhost:80 (Nginx)
- **Backend API**: http://localhost:3002

### Database Management

View database with pgAdmin:
```bash
docker compose --profile pgadmin up postgres pgadmin
```
- **pgAdmin**: http://localhost:5050
- **Login**: admin@inventory.com / admin123

## API Endpoints

### Products
- `GET /products` - List products with filtering
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/low-stock` - Get low stock products

### Stores
- `GET /stores` - List stores
- `GET /stores/:id` - Get store by ID
- `POST /stores` - Create store
- `PUT /stores/:id` - Update store
- `DELETE /stores/:id` - Delete store
- `GET /stores/:id/products` - Get products by store

## Sample Data

The application includes comprehensive seed data:
- **8 Sample Stores** across different US cities
- **30+ Sample Products** including electronics, gaming, audio, smart home devices
- **Various Categories**: Smartphones, Laptops, Gaming, Audio, Smart Home, etc.
- **Realistic Inventory**: Different stock levels and pricing

## Development

### Local Development Setup

1. **Backend Setup**:
```bash
cd server
npm install
npm run dev
```

2. **Frontend Setup**:
```bash
cd web
npm install
npm start
```

3. **Database Setup**:
```bash
cd server
npm run db:generate
npm run db:migrate
npm run seed
```

### Project Structure

```
knostic/
├── server/                 # Backend API
│   ├── src/
│   │   ├── api/           # Controllers and routes
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── interfaces/    # Type definitions
│   │   └── seeds/         # Sample data
│   └── Dockerfile
├── web/                   # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript types
│   └── Dockerfile
└── docker-compose.yml    # Full stack orchestration
```

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern features
- **Build**: Create React App

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload for both frontend and backend
- **Production**: Nginx for frontend, optimized builds