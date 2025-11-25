import { z } from 'zod';

/**
 * Common validation schemas used across multiple routes
 */

/**
 * Schema for validating numeric ID parameters in routes
 * Usage: /api/resource/:id
 */
export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

/**
 * Schema for validating pagination query parameters
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Schema for validating date range query parameters
 */
export const DateRangeQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * Schema for validating search query parameter
 */
export const SearchQuerySchema = z.object({
  search: z.string().optional(),
});

export type IdParam = z.infer<typeof IdParamSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
