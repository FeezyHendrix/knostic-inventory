# Tiny Inventory - Inventory Management System

A full-stack inventory management application that tracks stores and their products, built with TypeScript throughout. The system provides complete CRUD operations, advanced filtering with pagination, and analytics.

## Run Instructions

```bash
docker compose up --build
```

This single command starts the entire application stack. The system will automatically run database migrations and seed sample data.

Once running, access the application at http://localhost:3001 for the frontend and http://localhost:3000/api/v1 for the API.

## API Sketch

```
GET    /api/v1/stores                      List stores with pagination
GET    /api/v1/stores/:id                  Get store details
POST   /api/v1/stores                      Create store
PUT    /api/v1/stores/:id                  Update store
DELETE /api/v1/stores/:id                  Delete store

GET    /api/v1/products                    List products (filterable, paginated)
GET    /api/v1/products/:id                Get product details
POST   /api/v1/products                    Create product
PUT    /api/v1/products/:id                Update product
DELETE /api/v1/products/:id                Delete product
GET    /api/v1/products/low-stock          Get products below stock threshold

GET    /api/v1/analytics/sales             Sales aggregations by time period
GET    /api/v1/analytics/stores/performance   Store performance rankings
```

## Decisions and Trade-offs

### Why PostgreSQL and Stored Procedures

The choice of PostgreSQL over SQLite or in-memory storage stems from wanting to push complex analytical computations into the database layer rather than handling them in application code. Inventory analytics involve time-series aggregations, window functions for rankings, and multi-table joins that become unwieldy when implemented in JavaScript.

Consider the store performance ranking calculation: it needs to aggregate sales by store, compute inventory turnover ratios, calculate weighted performance scores, and rank stores against each other. Implementing this in application code would require fetching all sales records, all products, and all stores into memory, then performing multiple passes to group, aggregate, and sort the data. As the dataset grows, this approach consumes increasing amounts of memory and CPU on the application server while the database sits idle.

By encapsulating this logic in the `get_store_performance_rankings` stored procedure, the computation happens where the data lives. PostgreSQL can use indexes to accelerate the aggregations, perform the ranking with window functions in a single pass, and return only the final ranked results. The application receives a compact response rather than raw data it needs to process.

The trade-off is reduced portability. These stored procedures are PostgreSQL-specific and would require rewriting for MySQL or another database. However, for an inventory system where the database choice is unlikely to change frequently, optimizing for query performance and keeping complex business logic close to the data seemed like the right trade-off.

SQLite was considered but lacks stored procedure support entirely. An in-memory solution would lose data between restarts and couldn't demonstrate the query patterns that matter in a real inventory system.

### The Service Layer Pattern

The backend follows a three-layer architecture: controllers handle HTTP concerns, services contain business logic, and the database layer manages persistence. This separation exists because inventory operations often involve multiple steps that shouldn't be coupled to HTTP request handling.

For example, the bulk stock update operation validates all products exist before updating any of them. Placing this logic in a service means it could be reused if the application later needs CLI tools or background jobs that modify inventory. The cost is additional files and indirection, but the benefit is testable business logic isolated from framework concerns.

### Knex Over a Full ORM

The project uses Knex.js as a query builder rather than a full ORM like Prisma or TypeORM. This decision came from the need to write complex analytics queries involving aggregations, window functions, and date manipulations. Full ORMs often make simple queries easier but complex queries harder, requiring escape hatches to raw SQL anyway.

Knex provides SQL familiarity while still offering query composition and parameterized queries for security. The analytics queries use raw SQL through Knex since they involve window functions and complex aggregations that would be awkward to express in an ORM's query language.

### Zod for Validation

Input validation uses Zod schemas that serve dual purposes: runtime validation and TypeScript type inference. This eliminates the common problem of validation rules drifting from type definitions. When the schema changes, the types change automatically.

The validation middleware rejects malformed requests before they reach business logic, returning structured error responses that identify which fields failed and why. This front-loads error handling rather than scattering validation checks throughout the codebase.

### Frontend State Management

The React frontend uses local component state rather than a global state management library. For an application of this size, the added complexity of Redux or similar libraries would outweigh the benefits. Each page fetches its own data and manages its own loading and error states.

This approach means some data might be refetched when navigating between pages, but it keeps the mental model simple. Each component is self-contained and doesn't depend on global state being initialized correctly.

### Simple Styling Over Framework

The frontend uses basic HTML tables and inline styles rather than a CSS framework. This was a conscious choice to focus development time on functionality rather than visual polish. The tables display data clearly, support the required interactions, and work without additional dependencies.

A production application would benefit from a design system, but for demonstrating inventory management concepts, readable code mattered more than pixel-perfect styling.

## Testing Approach

The backend includes API tests using Jest and Supertest with a mocked database layer. To run the tests:

```bash
cd server && npm test
```

The tests mock the Knex database module rather than hitting a real database. This approach uses Jest's module mocking to replace the database connection with a mock function that returns chainable query builders. Each test configures the mock to return specific data, allowing tests to run quickly without database setup.

The mock creates a chainable object that mimics Knex's fluent API:

```typescript
const mockBuilder = {
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  first: jest.fn().mockResolvedValue(mockData),
  // ... other chainable methods
};
```

For error path tests, the mock is configured to return `undefined` from `.first()` to simulate a not-found scenario, or validation is tested by sending incomplete request bodies that fail before reaching the database layer.

The tests cover both success and failure scenarios. Happy path tests verify that stores and products can be created and retrieved with filters working correctly. Error path tests verify that validation rejects incomplete data and that requests for non-existent resources return appropriate 404 responses.

## If I Had More Time

**Global state management with Zustand or Redux Toolkit.** Currently, the frontend uses local component state and refetches data after mutations. A global store would enable optimistic updates, shared state across components, and better cache management. Zustand would be the lighter choice for an application of this size, while Redux Toolkit would provide more structure if the application grew significantly.

**End-to-end testing with Cypress.** The current test suite covers API endpoints with mocked database calls. Adding Cypress would enable testing the full user flow from the browser through the API to the database, catching integration issues that unit tests miss. Tests would cover scenarios like creating a store, adding products, and verifying the data appears correctly in the UI.

**Comprehensive error recovery.** The application handles errors by displaying messages, but it doesn't help users recover. For example, if a product creation fails due to a duplicate SKU, the form could suggest an alternative SKU rather than just reporting the error.

**Redis caching for list endpoints.** The product and store list endpoints currently hit the database on every request. Adding a Redis caching layer would reduce database load for frequently accessed data. The cache would store paginated results with keys based on the query parameters, and cache invalidation would occur on any write operation to the relevant table. This becomes increasingly valuable as the dataset grows and multiple users access the same filtered views.
