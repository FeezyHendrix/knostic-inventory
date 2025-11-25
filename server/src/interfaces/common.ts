export interface PaginationResult<T> {
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

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProductWithStore {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price: string;
  quantityInStock: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
  store: {
    id: number;
    name: string;
    city: string;
    state: string;
  };
}