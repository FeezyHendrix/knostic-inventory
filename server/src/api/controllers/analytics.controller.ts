import { Request, Response } from 'express';
import { AnalyticsService } from '../../services';
import catchAsync from '../../utils/catch-async';
import logger from '../../utils/logger';

/**
 * Analytics Controller
 * Provides comprehensive business intelligence endpoints
 * Implements enterprise-grade analytics with proper error handling
 */
export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get sales analytics data with flexible time grouping
   * Supports multiple aggregation levels for dashboard visualization
   */
  getSalesAnalytics = catchAsync(async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      storeId,
      groupBy = 'day',
    } = req.query;

    logger.info(
      { query: req.query },
      'Fetching sales analytics via API'
    );

    // Validate and parse query parameters
    const options = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      storeId: storeId ? parseInt(storeId as string) : undefined,
      groupBy: groupBy as 'hour' | 'day' | 'week' | 'month',
    };

    // Validate date parameters
    if (options.startDate && isNaN(options.startDate.getTime())) {
      logger.warn({ startDate }, 'Invalid start date provided');
      return res.status(400).json({
        success: false,
        error: 'Invalid start date format',
      });
    }

    if (options.endDate && isNaN(options.endDate.getTime())) {
      logger.warn({ endDate }, 'Invalid end date provided');
      return res.status(400).json({
        success: false,
        error: 'Invalid end date format',
      });
    }

    if (options.storeId && isNaN(options.storeId)) {
      logger.warn({ storeId }, 'Invalid store ID provided');
      return res.status(400).json({
        success: false,
        error: 'Invalid store ID',
      });
    }

    // Validate groupBy parameter
    if (!['hour', 'day', 'week', 'month'].includes(options.groupBy)) {
      logger.warn({ groupBy }, 'Invalid groupBy parameter');
      return res.status(400).json({
        success: false,
        error: 'groupBy must be one of: hour, day, week, month',
      });
    }

    const result = await this.analyticsService.getSalesAnalytics(options);

    if (!result.success) {
      logger.warn({ error: result.error }, 'Failed to fetch sales analytics');
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    logger.info(
      { recordCount: result.data?.length || 0 },
      'Sales analytics retrieved successfully via API'
    );

    res.json({
      success: true,
      data: result.data,
      meta: {
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        storeId: options.storeId,
        groupBy: options.groupBy,
        recordCount: result.data?.length || 0,
      },
    });
  });

  /**
   * Get store performance rankings with comprehensive metrics
   */
  getStorePerformanceRankings = catchAsync(async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      limit = '10',
    } = req.query;

    logger.info(
      { query: req.query },
      'Fetching store performance rankings via API'
    );

    const options = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: parseInt(limit as string),
    };

    // Validate parameters
    if (options.startDate && isNaN(options.startDate.getTime())) {
      logger.warn({ startDate }, 'Invalid start date provided');
      return res.status(400).json({
        success: false,
        error: 'Invalid start date format',
      });
    }

    if (options.endDate && isNaN(options.endDate.getTime())) {
      logger.warn({ endDate }, 'Invalid end date provided');
      return res.status(400).json({
        success: false,
        error: 'Invalid end date format',
      });
    }

    if (isNaN(options.limit) || options.limit <= 0 || options.limit > 100) {
      logger.warn({ limit }, 'Invalid limit parameter');
      return res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 100',
      });
    }

    const result = await this.analyticsService.getStorePerformanceRankings(options);

    if (!result.success) {
      logger.warn({ error: result.error }, 'Failed to fetch store performance rankings');
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    logger.info(
      { recordCount: result.data?.length || 0 },
      'Store performance rankings retrieved successfully via API'
    );

    res.json({
      success: true,
      data: result.data,
      meta: {
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        limit: options.limit,
        recordCount: result.data?.length || 0,
      },
    });
  });

}