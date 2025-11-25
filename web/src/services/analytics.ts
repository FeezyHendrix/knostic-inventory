import axios from 'axios';
import {
  ApiResponse,
  SalesAnalytics,
  StorePerformanceRanking,
  AnalyticsFilters,
} from '../types/analytics';

/**
 * Analytics API Service
 * Enterprise-grade API client for analytics data
 * Implements proper error handling and type safety
 */
class AnalyticsApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Build query string from filters with proper encoding
   */
  private buildQueryString(filters: AnalyticsFilters): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return params.toString();
  }

  /**
   * Handle API errors with consistent error messages
   */
  private handleError(error: any): never {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.response?.status === 404) {
      throw new Error('Analytics endpoint not found');
    }
    if (error.response?.status >= 500) {
      throw new Error('Analytics service temporarily unavailable');
    }
    throw new Error(error.message || 'Failed to fetch analytics data');
  }

  /**
   * Get sales analytics with time-based grouping
   */
  async getSalesAnalytics(filters: AnalyticsFilters = {}): Promise<SalesAnalytics[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await axios.get<ApiResponse<SalesAnalytics[]>>(
        `${this.baseURL}/analytics/sales?${queryString}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch sales analytics');
      }

      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get store performance rankings
   */
  async getStorePerformanceRankings(filters: AnalyticsFilters = {}): Promise<StorePerformanceRanking[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await axios.get<ApiResponse<StorePerformanceRanking[]>>(
        `${this.baseURL}/analytics/stores/performance?${queryString}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch store performance data');
      }

      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const analyticsApi = new AnalyticsApiService();
export default analyticsApi;