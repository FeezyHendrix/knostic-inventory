import { db } from '../config/database';
import {
  SalesAnalytics,
  StorePerformanceRanking,
  AnalyticsTimeRange,
  StoreAnalyticsOptions,
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

}