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

/**
 * Analytics query parameters
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
