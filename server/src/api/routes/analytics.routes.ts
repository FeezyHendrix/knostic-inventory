import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validateQuery } from '../../middleware';
import {
  SalesAnalyticsQuerySchema,
  StorePerformanceQuerySchema,
} from '../../interfaces/analytics';

/**
 * Analytics Routes
 * Provides comprehensive business intelligence endpoints
 */
const router = Router();
const analyticsController = new AnalyticsController();

/**
 * @route   GET /api/v1/analytics/sales
 * @desc    Get sales analytics with flexible time grouping
 * @access  Private
 * @params  startDate, endDate, storeId, groupBy
 */
router.get('/sales', validateQuery(SalesAnalyticsQuerySchema), analyticsController.getSalesAnalytics);

/**
 * @route   GET /api/v1/analytics/stores/performance
 * @desc    Get store performance rankings
 * @access  Private
 * @params  startDate, endDate, limit
 */
router.get('/stores/performance', validateQuery(StorePerformanceQuerySchema), analyticsController.getStorePerformanceRankings);

export default router;