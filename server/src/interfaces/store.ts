import { z } from 'zod';

export const CreateStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(255, 'Store name too long'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  state: z.string().min(1, 'State is required').max(50, 'State name too long'),
  zipCode: z.string().min(1, 'Zip code is required').max(10, 'Zip code too long'),
  phoneNumber: z.string().max(20, 'Phone number too long').optional(),
  email: z.string().email('Invalid email format').optional(),
});

export const UpdateStoreSchema = CreateStoreSchema.partial();

export const StoreQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  city: z.string().optional(),
  state: z.string().optional(),
  search: z.string().optional(),
});

export type CreateStoreDto = z.infer<typeof CreateStoreSchema>;
export type UpdateStoreDto = z.infer<typeof UpdateStoreSchema>;
export type StoreQueryDto = z.infer<typeof StoreQuerySchema>;