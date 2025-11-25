export interface Product {
  id: number;
  storeId: number;
  name: string;
  description?: string;
  category: string;
  price: string;
  quantityInStock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
  store?: Store;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  storeId: number;
  name: string;
  description?: string;
  category: string;
  price: string;
  quantityInStock: number;
  sku: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  quantityInStock?: number;
  sku?: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  storeId?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'quantityInStock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateStoreDto {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
}

export interface UpdateStoreDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
}