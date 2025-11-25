import axios from 'axios';
import {
  Product,
  Store,
  CreateProductDto,
  UpdateProductDto,
  ProductQuery,
  ApiResponse,
  PaginatedResponse,
  CreateStoreDto,
  UpdateStoreDto
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class ProductService {
  static async getProducts(query?: ProductQuery): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const response = await api.get('/products', { params: query });
    return response.data;
  }

  static async getProductById(id: number): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  static async createProduct(product: CreateProductDto): Promise<ApiResponse<Product>> {
    const response = await api.post('/products', product);
    return response.data;
  }

  static async updateProduct(id: number, product: UpdateProductDto): Promise<ApiResponse<Product>> {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  }

  static async deleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  static async getLowStockProducts(threshold?: number): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/products/low-stock', { 
      params: threshold ? { threshold } : undefined 
    });
    return response.data;
  }
}

export class StoreService {
  static async getStores(): Promise<ApiResponse<PaginatedResponse<Store>>> {
    const response = await api.get('/stores');
    return response.data;
  }

  static async getStoreById(id: number): Promise<ApiResponse<Store>> {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  }

  static async createStore(store: CreateStoreDto): Promise<ApiResponse<Store>> {
    const response = await api.post('/stores', store);
    return response.data;
  }

  static async updateStore(id: number, store: UpdateStoreDto): Promise<ApiResponse<Store>> {
    const response = await api.put(`/stores/${id}`, store);
    return response.data;
  }

  static async deleteStore(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  }

  static async getProductsByStore(storeId: number, query?: ProductQuery): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const response = await api.get(`/stores/${storeId}/products`, { params: query });
    return response.data;
  }
}