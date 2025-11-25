import { z } from 'zod';

export const CreateProductSchema = z.object({
  storeId: z.number().int().positive('Store ID must be a positive integer'),
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category name too long'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal with up to 2 decimal places'),
  quantityInStock: z.number().int().min(0, 'Quantity must be non-negative').default(0),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU too long'),
});

export const UpdateProductSchema = CreateProductSchema.omit({ storeId: true }).partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  storeId: z.coerce.number().int().positive().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  maxStock: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'quantityInStock', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const BulkUpdateStockSchema = z.object({
  products: z.array(z.object({
    id: z.number().int().positive(),
    quantityInStock: z.number().int().min(0),
  })).min(1, 'At least one product is required'),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type ProductQueryDto = z.infer<typeof ProductQuerySchema>;
export type BulkUpdateStockDto = z.infer<typeof BulkUpdateStockSchema>;