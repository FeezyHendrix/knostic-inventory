import { z } from 'zod';

/**
 * Common date range schema for analytics queries
 * Query params come as strings, so we transform them to Date objects
 */
const DateRangeSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
});

/**
 * Schema for sales analytics query parameters
 */
export const SalesAnalyticsQuerySchema = DateRangeSchema.extend({
  storeId: z.coerce.number().int().positive().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

/**
 * Schema for store performance rankings query parameters
 */
export const StorePerformanceQuerySchema = DateRangeSchema.extend({
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type SalesAnalyticsQuery = z.infer<typeof SalesAnalyticsQuerySchema>;
export type StorePerformanceQuery = z.infer<typeof StorePerformanceQuerySchema>;
