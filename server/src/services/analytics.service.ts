import { db } from '../config/database';
import {
  SalesAnalytics,
  StorePerformanceRanking,
  ProductPerformance,
  AnalyticsTimeRange,
  StoreAnalyticsOptions,
  ProductAnalyticsOptions,
} from '../models';
import { ServiceResult } from '../interfaces';
import logger from '../utils/logger';

/**
 * Advanced Analytics Service
 * Provides comprehensive business intelligence and data analytics capabilities
 * Implements enterprise-grade analytics with performance optimization
 */
export class AnalyticsService {
  /**
   * Get comprehensive sales analytics with flexible time grouping
   * Supports multiple aggregation levels for dashboard visualization
   */
  async getSalesAnalytics(
    options: StoreAnalyticsOptions = {}
  ): Promise<ServiceResult<SalesAnalytics[]>> {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate = new Date(),
        storeId,
        groupBy = 'day',
      } = options;

      logger.info(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          storeId,
          groupBy,
        },
        'Fetching sales analytics data'
      );

      const result = await db.raw(`
        SELECT * FROM get_product_sales_analytics(?, ?, ?, ?)
      `, [
        startDate.toISOString(),
        endDate.toISOString(),
        storeId || null,
        groupBy
      ]);

      const analyticsData = result.rows.map((row: any) => ({
        timePeriod: new Date(row.time_period),
        periodLabel: row.period_label,
        totalQuantity: parseInt(row.total_quantity),
        totalRevenue: parseFloat(row.total_revenue),
        uniqueProducts: parseInt(row.unique_products),
        averageOrderValue: parseFloat(row.average_order_value),
        storeCount: parseInt(row.store_count),
      })) as SalesAnalytics[];

      logger.info(
        { recordCount: analyticsData.length },
        'Sales analytics data retrieved successfully'
      );

      return {
        success: true,
        data: analyticsData,
      };
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          stack: error.stack,
          options,
        },
        'Failed to fetch sales analytics'
      );

      return {
        success: false,
        error: 'Failed to fetch sales analytics data',
      };
    }
  }

  /**
   * Get comprehensive store performance rankings
   * Provides weighted performance scoring and comparative analysis
   */
  async getStorePerformanceRankings(
    options: AnalyticsTimeRange & { limit?: number } = {}
  ): Promise<ServiceResult<StorePerformanceRanking[]>> {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        limit = 10,
      } = options;

      logger.info(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit,
        },
        'Fetching store performance rankings'
      );

      const result = await db.raw(`
        SELECT * FROM get_store_performance_rankings(?, ?, ?)
      `, [
        startDate.toISOString(),
        endDate.toISOString(),
        limit
      ]);

      const rankingsData = result.rows.map((row: any) => ({
        storeId: parseInt(row.store_id),
        storeName: row.store_name,
        storeCity: row.store_city,
        storeState: row.store_state,
        totalProducts: parseInt(row.total_products),
        activeProducts: parseInt(row.active_products),
        totalInventoryValue: parseFloat(row.total_inventory_value),
        totalSalesRevenue: parseFloat(row.total_sales_revenue),
        totalUnitsSold: parseInt(row.total_units_sold),
        averageProductPrice: parseFloat(row.average_product_price),
        inventoryTurnoverRatio: parseFloat(row.inventory_turnover_ratio),
        performanceScore: parseFloat(row.performance_score),
        performanceRank: parseInt(row.performance_rank),
      })) as StorePerformanceRanking[];

      logger.info(
        { recordCount: rankingsData.length },
        'Store performance rankings retrieved successfully'
      );

      return {
        success: true,
        data: rankingsData,
      };
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          stack: error.stack,
          options,
        },
        'Failed to fetch store performance rankings'
      );

      return {
        success: false,
        error: 'Failed to fetch store performance data',
      };
    }
  }

  /**
   * Get detailed product performance analytics for a specific store
   * Provides comprehensive product-level insights for optimization
   */
  async getProductPerformanceByStore(
    options: ProductAnalyticsOptions
  ): Promise<ServiceResult<ProductPerformance[]>> {
    try {
      const {
        storeId,
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        limit = 10,
      } = options;

      if (!storeId) {
        logger.warn('Store ID is required for product performance analysis');
        return {
          success: false,
          error: 'Store ID is required',
        };
      }

      logger.info(
        {
          storeId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit,
        },
        'Fetching product performance data for store'
      );

      const result = await db.raw(`
        SELECT * FROM get_top_products_by_store(?, ?, ?, ?)
      `, [
        storeId,
        startDate.toISOString(),
        endDate.toISOString(),
        limit
      ]);

      const productData = result.rows.map((row: any) => ({
        productId: parseInt(row.product_id),
        productName: row.product_name,
        productCategory: row.product_category,
        productSku: row.product_sku,
        currentStock: parseInt(row.current_stock),
        currentPrice: parseFloat(row.current_price),
        totalUnitsSold: parseInt(row.total_units_sold),
        totalRevenue: parseFloat(row.total_revenue),
        averageSalePrice: parseFloat(row.average_sale_price),
        salesFrequency: parseFloat(row.sales_frequency),
        revenuePerDay: parseFloat(row.revenue_per_day),
        stockTurnoverRate: parseFloat(row.stock_turnover_rate),
        productRank: parseInt(row.product_rank),
      })) as ProductPerformance[];

      logger.info(
        { storeId, recordCount: productData.length },
        'Product performance data retrieved successfully'
      );

      return {
        success: true,
        data: productData,
      };
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          stack: error.stack,
          options,
        },
        'Failed to fetch product performance data'
      );

      return {
        success: false,
        error: 'Failed to fetch product performance data',
      };
    }
  }

  /**
   * Get aggregated dashboard summary metrics
   * Provides high-level KPIs for executive dashboards
   */
  async getDashboardSummary(
    options: AnalyticsTimeRange = {}
  ): Promise<ServiceResult<{
    totalRevenue: number;
    totalUnits: number;
    averageOrderValue: number;
    topPerformingStore: string;
    growthRate: number;
    totalStores: number;
    totalProducts: number;
    lowStockAlerts: number;
  }>> {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
      } = options;

      logger.info(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        'Fetching dashboard summary metrics'
      );

      // Execute multiple queries in parallel for optimal performance
      const [salesData, storeRankings, previousPeriodSales, inventoryStats] =
        await Promise.all([
          this.getSalesAnalytics({ startDate, endDate, groupBy: 'day' }),
          this.getStorePerformanceRankings({ startDate, endDate, limit: 1 }),
          this.getSalesAnalytics({
            startDate: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            endDate: startDate,
            groupBy: 'day',
          }),
          db.raw(`
            SELECT 
              COUNT(DISTINCT s.id) as total_stores,
              COUNT(DISTINCT p.id) as total_products,
              COUNT(CASE WHEN p.quantity_in_stock <= 10 THEN 1 END) as low_stock_count
            FROM stores s
            LEFT JOIN products p ON s.id = p.store_id
          `),
        ]);

      if (!salesData.success || !storeRankings.success) {
        throw new Error('Failed to fetch required analytics data');
      }

      const totalRevenue = salesData.data?.reduce((sum, item) => sum + item.totalRevenue, 0) || 0;
      const totalUnits = salesData.data?.reduce((sum, item) => sum + item.totalQuantity, 0) || 0;
      const averageOrderValue = totalUnits > 0 ? totalRevenue / totalUnits : 0;

      const previousRevenue = previousPeriodSales.success && previousPeriodSales.data
        ? previousPeriodSales.data.reduce((sum, item) => sum + item.totalRevenue, 0)
        : 0;

      const growthRate = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      const inventoryRow = inventoryStats.rows[0];
      const summary = {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalUnits,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        topPerformingStore: storeRankings.data?.[0]?.storeName || 'N/A',
        growthRate: Math.round(growthRate * 100) / 100,
        totalStores: parseInt(String(inventoryRow?.total_stores)) || 0,
        totalProducts: parseInt(String(inventoryRow?.total_products)) || 0,
        lowStockAlerts: parseInt(String(inventoryRow?.low_stock_count)) || 0,
      };

      logger.info({ summary }, 'Dashboard summary computed successfully');

      return {
        success: true,
        data: summary,
      };
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          stack: error.stack,
          options,
        },
        'Failed to compute dashboard summary'
      );

      return {
        success: false,
        error: 'Failed to compute dashboard metrics',
      };
    }
  }

  /**
   * Generate sample sales data for demonstration purposes
   * Creates realistic test data for development and testing
   */
  async generateSampleSalesData(
    storeId: number,
    numberOfSales: number = 100
  ): Promise<ServiceResult<{ salesCreated: number }>> {
    try {
      logger.info(
        { storeId, numberOfSales },
        'Generating sample sales data'
      );

      // This would typically be called from a data seeding script
      // Implementation depends on your specific requirements
      const result = await db.raw(`
        INSERT INTO product_sales (product_id, store_id, quantity_sold, unit_price, total_amount, sale_date)
        SELECT 
          p.id,
          ?,
          (random() * 5 + 1)::integer,
          p.price,
          p.price * (random() * 5 + 1)::integer,
          now() - (random() * interval '30 days')
        FROM products p 
        WHERE p.store_id = ?
        AND p.quantity_in_stock > 0
        LIMIT ?
        RETURNING id
      `, [storeId, storeId, numberOfSales]);

      const salesCreated = result.rowCount || 0;

      logger.info(
        { storeId, salesCreated },
        'Sample sales data generated successfully'
      );

      return {
        success: true,
        data: { salesCreated },
      };
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          stack: error.stack,
          storeId,
          numberOfSales,
        },
        'Failed to generate sample sales data'
      );

      return {
        success: false,
        error: 'Failed to generate sample data',
      };
    }
  }
}