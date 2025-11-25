/**
 * Analytics Type Definitions
 */

export interface SalesAnalytics {
  timePeriod: string;
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

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  storeId?: number;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    startDate?: string;
    endDate?: string;
    storeId?: number;
    groupBy?: string;
    limit?: number;
    recordCount?: number;
  };
  error?: string;
}

export type GroupBy = 'hour' | 'day' | 'week' | 'month';