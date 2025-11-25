import request from 'supertest';
import { createTestApp } from './app';
import { db } from '../config/database';

const mockDb = db as jest.MockedFunction<typeof db>;
const app = createTestApp();

// Mock data
const mockStore = {
  id: 1,
  name: 'Test Store',
  address: '123 Test Street',
  city: 'Test City',
  state: 'TS',
  zip_code: '12345',
  phone_number: '555-0100',
  email: 'test@store.com',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockProduct = {
  id: 1,
  store_id: 1,
  name: 'Test Product',
  description: 'A product for testing',
  category: 'Electronics',
  price: '99.99',
  quantity_in_stock: 50,
  sku: 'TEST-SKU-001',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockSalesData = {
  period: '2024-01',
  total_revenue: '15000.00',
  total_orders: 150,
  avg_order_value: '100.00',
};

const mockStorePerformance = {
  store_id: 1,
  store_name: 'Test Store',
  total_revenue: '15000.00',
  total_products: 50,
  rank: 1,
};

// Helper to create chainable mock
function createMockQueryBuilder(resolvedValue: any) {
  const mockBuilder: any = {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    whereILike: jest.fn().mockReturnThis(),
    whereBetween: jest.fn().mockReturnThis(),
    whereIn: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(resolvedValue),
    returning: jest.fn().mockResolvedValue([resolvedValue]),
    count: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    then: jest.fn((resolve) => resolve(Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue])),
    raw: jest.fn().mockResolvedValue({ rows: Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue] }),
  };
  return mockBuilder;
}

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Happy Path 1: Create a store successfully
  describe('POST /api/v1/stores - Create Store (Happy Path)', () => {
    it('should create a new store with valid data', async () => {
      const mockBuilder = createMockQueryBuilder(mockStore);
      mockDb.mockReturnValue(mockBuilder as any);

      const storeData = {
        name: 'Test Store',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phoneNumber: '555-0100',
        email: 'test@store.com',
      };

      const response = await request(app)
        .post('/api/v1/stores')
        .send(storeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(storeData.name);
      expect(mockDb).toHaveBeenCalledWith('stores');
      expect(mockBuilder.insert).toHaveBeenCalled();
    });
  });

  // Happy Path 2: Get products with filtering
  describe('GET /api/v1/products - List Products (Happy Path)', () => {
    it('should retrieve products with pagination', async () => {
      const mockProducts = [mockProduct];
      const mockCount = { count: '1' };

      // Mock db.raw for the JSON aggregation query
      (mockDb as any).raw = jest.fn().mockResolvedValue({ rows: mockProducts });

      mockDb.mockImplementation(((table: string) => {
        const builder = createMockQueryBuilder(mockProducts);
        builder.first = jest.fn().mockResolvedValue(mockCount);
        return builder;
      }) as any);

      const response = await request(app)
        .get('/api/v1/products')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  // Error Path 1: Create store with missing required fields
  describe('POST /api/v1/stores - Validation Error', () => {
    it('should return 400 when required fields are missing', async () => {
      const invalidStoreData = {
        name: 'Incomplete Store',
        // Missing: address, city, state, zipCode
      };

      const response = await request(app)
        .post('/api/v1/stores')
        .send(invalidStoreData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      // Database should not be called for invalid data
      expect(mockDb).not.toHaveBeenCalled();
    });
  });

  // Error Path 2: Get non-existent product returns 404
  describe('GET /api/v1/products/:id - Not Found', () => {
    it('should return 404 for non-existent product', async () => {
      // Mock the chainable query to return undefined from .first()
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.first = jest.fn().mockResolvedValue(undefined);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .get('/api/v1/products/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Store endpoints
  describe('GET /api/v1/stores - List Stores', () => {
    it('should retrieve stores with pagination', async () => {
      const mockStores = [mockStore];
      const mockCount = { count: '1' };

      mockDb.mockImplementation((() => {
        const builder = createMockQueryBuilder(mockStores);
        builder.first = jest.fn().mockResolvedValue(mockCount);
        return builder;
      }) as any);

      const response = await request(app)
        .get('/api/v1/stores')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  describe('GET /api/v1/stores/:id - Get Store by ID', () => {
    it('should retrieve a store by ID', async () => {
      const mockBuilder = createMockQueryBuilder(mockStore);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .get('/api/v1/stores/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return 404 for non-existent store', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.first = jest.fn().mockResolvedValue(undefined);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .get('/api/v1/stores/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/stores/:id - Update Store', () => {
    it('should update an existing store', async () => {
      const updatedStore = { ...mockStore, name: 'Updated Store' };
      const mockBuilder = createMockQueryBuilder(updatedStore);
      mockBuilder.first = jest.fn().mockResolvedValue(mockStore);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .put('/api/v1/stores/1')
        .send({ name: 'Updated Store' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when updating non-existent store', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.first = jest.fn().mockResolvedValue(undefined);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .put('/api/v1/stores/999999')
        .send({ name: 'Updated Store' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/stores/:id - Delete Store', () => {
    it('should delete an existing store', async () => {
      const mockBuilder = createMockQueryBuilder(mockStore);
      mockBuilder.first = jest.fn().mockResolvedValue(mockStore);
      mockBuilder.del = jest.fn().mockResolvedValue(1);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .delete('/api/v1/stores/1')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existent store', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.first = jest.fn().mockResolvedValue(undefined);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .delete('/api/v1/stores/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // Product endpoints
  describe('POST /api/v1/products - Create Product', () => {
    it('should create a new product with valid data', async () => {
      const mockBuilder = createMockQueryBuilder(mockProduct);
      mockBuilder.first = jest.fn().mockResolvedValue(mockStore); // Store exists check
      mockDb.mockReturnValue(mockBuilder as any);

      const productData = {
        storeId: 1,
        name: 'Test Product',
        description: 'A product for testing',
        category: 'Electronics',
        price: '99.99',
        quantityInStock: 50,
        sku: 'TEST-SKU-001',
      };

      const response = await request(app)
        .post('/api/v1/products')
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Incomplete Product' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(mockDb).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/products/:id - Get Product by ID', () => {
    it('should retrieve a product by ID', async () => {
      const mockBuilder = createMockQueryBuilder(mockProduct);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .get('/api/v1/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('PUT /api/v1/products/:id - Update Product', () => {
    it('should update an existing product', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      const mockBuilder = createMockQueryBuilder(updatedProduct);
      mockBuilder.first = jest.fn().mockResolvedValue(mockProduct);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .put('/api/v1/products/1')
        .send({ name: 'Updated Product' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when updating non-existent product', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.first = jest.fn().mockResolvedValue(undefined);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .put('/api/v1/products/999999')
        .send({ name: 'Updated Product' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/products/:id - Delete Product', () => {
    it('should delete an existing product', async () => {
      const mockBuilder = createMockQueryBuilder(mockProduct);
      mockBuilder.first = jest.fn().mockResolvedValue(mockProduct);
      mockBuilder.del = jest.fn().mockResolvedValue(1);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .delete('/api/v1/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existent product', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.first = jest.fn().mockResolvedValue(undefined);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .delete('/api/v1/products/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products/low-stock - Low Stock Products', () => {
    it('should retrieve low stock products', async () => {
      const lowStockProduct = { ...mockProduct, quantity_in_stock: 5 };
      const mockBuilder = createMockQueryBuilder([lowStockProduct]);
      mockDb.mockReturnValue(mockBuilder as any);

      const response = await request(app)
        .get('/api/v1/products/low-stock')
        .query({ threshold: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Store products endpoint
  describe('GET /api/v1/stores/:storeId/products - Get Products by Store', () => {
    it('should retrieve products for a specific store', async () => {
      const mockProducts = [mockProduct];
      const mockCount = { count: '1' };

      mockDb.mockImplementation((() => {
        const builder = createMockQueryBuilder(mockProducts);
        builder.first = jest.fn().mockResolvedValue(mockCount);
        return builder;
      }) as any);

      const response = await request(app)
        .get('/api/v1/stores/1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  // Analytics endpoints
  describe('GET /api/v1/analytics/sales - Sales Analytics', () => {
    it('should retrieve sales analytics', async () => {
      (mockDb as any).raw = jest.fn().mockResolvedValue({ rows: [mockSalesData] });

      const response = await request(app)
        .get('/api/v1/analytics/sales')
        .query({ period: 'monthly' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/stores/performance - Store Performance', () => {
    it('should retrieve store performance rankings', async () => {
      (mockDb as any).raw = jest.fn().mockResolvedValue({ rows: [mockStorePerformance] });

      const response = await request(app)
        .get('/api/v1/analytics/stores/performance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
