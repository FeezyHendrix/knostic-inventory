import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validateBody, validateQuery, validateParams } from '../../middleware';
import {
  SalesAnalyticsQuerySchema,
  StorePerformanceQuerySchema,
  ProductPerformanceQuerySchema,
  DashboardSummaryQuerySchema,
  StoreIdParamSchema,
  GenerateSampleDataSchema,
} from '../../interfaces/analytics';

/**
 * Analytics Routes
 * Provides comprehensive business intelligence endpoints
 * Designed for enterprise-grade analytics and reporting
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

/**
 * @route   GET /api/v1/analytics/stores/:storeId/products
 * @desc    Get product performance for specific store
 * @access  Private
 * @params  startDate, endDate, limit
 */
router.get('/stores/:storeId/products', validateParams(StoreIdParamSchema), validateQuery(ProductPerformanceQuerySchema), analyticsController.getProductPerformanceByStore);

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get dashboard summary with KPIs
 * @access  Private
 * @params  startDate, endDate
 */
router.get('/dashboard', validateQuery(DashboardSummaryQuerySchema), analyticsController.getDashboardSummary);

/**
 * @route   POST /api/v1/analytics/stores/:storeId/sample-data
 * @desc    Generate sample sales data for development/testing
 * @access  Private
 * @body    numberOfSales
 */
router.post('/stores/:storeId/sample-data', validateParams(StoreIdParamSchema), validateBody(GenerateSampleDataSchema), analyticsController.generateSampleData);

export default router;