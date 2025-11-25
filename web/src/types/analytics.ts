/**
 * Analytics Type Definitions
 * Principal Engineer-level type safety for analytics dashboard
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

export interface DashboardSummary {
  totalRevenue: number;
  totalUnits: number;
  averageOrderValue: number;
  topPerformingStore: string;
  growthRate: number;
  totalStores: number;
  totalProducts: number;
  lowStockAlerts: number;
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
    generatedAt?: string;
  };
  error?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  revenue: number;
  units: number;
  products: number;
  aov: number;
}

export interface StoreComparisonData {
  storeName: string;
  revenue: number;
  products: number;
  performance: number;
  rank: number;
}

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type GroupBy = 'hour' | 'day' | 'week' | 'month';

export interface AnalyticsContextType {
  filters: AnalyticsFilters;
  dateRange: DateRange;
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  updateDateRange: (dateRange: DateRange) => void;
  isLoading: boolean;
  error: string | null;
}