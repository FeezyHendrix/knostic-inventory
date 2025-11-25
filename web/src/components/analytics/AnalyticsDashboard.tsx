import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { SalesChart } from './SalesChart';
import analyticsApi from '../../services/analytics';
import {
  SalesAnalytics,
  StorePerformanceRanking,
  AnalyticsFilters,
  GroupBy,
} from '../../types/analytics';

interface AnalyticsDashboardState {
  salesAnalytics: SalesAnalytics[];
  storePerformance: StorePerformanceRanking[];
  isLoading: {
    sales: boolean;
    stores: boolean;
  };
  error: string | null;
}

const initialState: AnalyticsDashboardState = {
  salesAnalytics: [],
  storePerformance: [],
  isLoading: {
    sales: false,
    stores: false,
  },
  error: null,
};

export const AnalyticsDashboard: React.FC = () => {
  const [state, setState] = useState<AnalyticsDashboardState>(initialState);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    groupBy: 'day',
    limit: 10,
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const setLoading = (key: keyof typeof state.isLoading, value: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, [key]: value },
    }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const fetchSalesAnalytics = useCallback(async () => {
    try {
      setLoading('sales', true);

      const salesFilters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        groupBy: filters.groupBy,
        storeId: filters.storeId,
      };

      const salesAnalytics = await analyticsApi.getSalesAnalytics(salesFilters);

      setState(prev => ({ ...prev, salesAnalytics }));
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to fetch sales analytics:', error);
    } finally {
      setLoading('sales', false);
    }
  }, [dateRange, filters.groupBy, filters.storeId]);

  const fetchStorePerformance = useCallback(async () => {
    try {
      setLoading('stores', true);

      const storeFilters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: filters.limit,
      };

      const storePerformance = await analyticsApi.getStorePerformanceRankings(storeFilters);

      setState(prev => ({ ...prev, storePerformance }));
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to fetch store performance:', error);
    } finally {
      setLoading('stores', false);
    }
  }, [dateRange, filters.limit]);

  const refreshAllData = useCallback(() => {
    fetchSalesAnalytics();
    fetchStorePerformance();
  }, [fetchSalesAnalytics, fetchStorePerformance]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleGroupByChange = (groupBy: GroupBy) => {
    setFilters(prev => ({ ...prev, groupBy }));
  };

  const exportData = () => {
    const dataToExport = {
      sales: state.salesAnalytics,
      stores: state.storePerformance,
      exportedAt: new Date().toISOString(),
      filters: { ...filters, ...dateRange },
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isAnyLoading = Object.values(state.isLoading).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={refreshAllData}
                disabled={isAnyLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-blue-900">
              <Calendar className="w-5 h-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Filters</h3>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Date Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                  <span className="text-gray-400 font-medium">→</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Group By</label>
                <select
                  value={filters.groupBy}
                  onChange={(e) => handleGroupByChange(e.target.value as GroupBy)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Analytics Data</h3>
                <p className="text-red-600 text-sm mt-1">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sales Trends */}
        <div style={{ marginBottom: "2rem" }}>
          <h3>Sales Trends</h3>
          <SalesChart
            data={state.salesAnalytics}
            groupBy={filters.groupBy!}
            isLoading={state.isLoading.sales}
            height={400}
          />
        </div>

        {/* Store Performance Table */}
        <div style={{ marginBottom: "2rem" }}>
          <h3>Store Performance Rankings</h3>
          {state.isLoading.stores ? (
            <p>Loading...</p>
          ) : (
            <table border={1} cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Store</th>
                  <th>Revenue</th>
                  <th>Products</th>
                  <th>Performance Score</th>
                  <th>Turnover Ratio</th>
                </tr>
              </thead>
              <tbody>
                {state.storePerformance.map((store) => (
                  <tr key={store.storeId}>
                    <td>#{store.performanceRank}</td>
                    <td>{store.storeName} ({store.storeCity}, {store.storeState})</td>
                    <td>${new Intl.NumberFormat('en-US').format(store.totalSalesRevenue)}</td>
                    <td>{new Intl.NumberFormat('en-US').format(store.totalProducts)}</td>
                    <td>{store.performanceScore.toFixed(0)}</td>
                    <td>{(store.inventoryTurnoverRatio * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};