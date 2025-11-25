import { pgTable, serial, integer, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stores } from './store';
import { products } from './product';

/**
 * Sales transaction table for comprehensive analytics tracking
 * Stores individual sales records with full traceability
 */
export const productSales = pgTable('product_sales', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  quantitySold: integer('quantity_sold').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  saleDate: timestamp('sale_date', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index('product_sales_product_id_idx').on(table.productId),
  storeIdIdx: index('product_sales_store_id_idx').on(table.storeId),
  saleDateIdx: index('product_sales_sale_date_idx').on(table.saleDate),
  dateStoreIdx: index('product_sales_date_store_idx').on(table.saleDate, table.storeId),
}));

/**
 * Relations for comprehensive data modeling
 */
export const productSalesRelations = relations(productSales, ({ one }) => ({
  product: one(products, {
    fields: [productSales.productId],
    references: [products.id],
  }),
  store: one(stores, {
    fields: [productSales.storeId],
    references: [stores.id],
  }),
}));

/**
 * TypeScript types for type safety
 */
export type ProductSale = typeof productSales.$inferSelect;
export type NewProductSale = typeof productSales.$inferInsert;

/**
 * Analytics aggregation types for stored procedure results
 */
export interface SalesAnalytics {
  timePeriod: Date;
  periodLabel: string;
  totalQuantity: number;
  totalRevenue: number;
  uniqueProducts: number;
  averageOrderValue: number;
  storeCount: number;
}

export interface StorePerformanceRanking {
  storeId: number;
  storeName: string;
  storeCity: string;
  storeState: string;
  totalProducts: number;
  activeProducts: number;
  totalInventoryValue: number;
  totalSalesRevenue: number;
  totalUnitsSold: number;
  averageProductPrice: number;
  inventoryTurnoverRatio: number;
  performanceScore: number;
  performanceRank: number;
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  productCategory: string;
  productSku: string;
  currentStock: number;
  currentPrice: number;
  totalUnitsSold: number;
  totalRevenue: number;
  averageSalePrice: number;
  salesFrequency: number;
  revenuePerDay: number;
  stockTurnoverRate: number;
  productRank: number;
}

/**
 * Analytics query parameters with comprehensive filtering options
 */
export interface AnalyticsTimeRange {
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}

export interface StoreAnalyticsOptions extends AnalyticsTimeRange {
  storeId?: number;
  limit?: number;
}

export interface ProductAnalyticsOptions extends AnalyticsTimeRange {
  storeId: number;
  limit?: number;
}