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

/**
 * Schema for product performance query parameters
 */
export const ProductPerformanceQuerySchema = DateRangeSchema.extend({
  limit: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Schema for dashboard summary query parameters
 */
export const DashboardSummaryQuerySchema = DateRangeSchema;

/**
 * Schema for store ID parameter
 */
export const StoreIdParamSchema = z.object({
  storeId: z.coerce.number().int().positive('Store ID must be a positive integer'),
});

/**
 * Schema for generate sample data request body
 */
export const GenerateSampleDataSchema = z.object({
  numberOfSales: z.number().int().min(1).max(1000).default(100),
});

export type SalesAnalyticsQuery = z.infer<typeof SalesAnalyticsQuerySchema>;
export type StorePerformanceQuery = z.infer<typeof StorePerformanceQuerySchema>;
export type ProductPerformanceQuery = z.infer<typeof ProductPerformanceQuerySchema>;
export type DashboardSummaryQuery = z.infer<typeof DashboardSummaryQuerySchema>;
export type GenerateSampleData = z.infer<typeof GenerateSampleDataSchema>;
