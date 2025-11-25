import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Analytics Dashboard</h1>

      {/* Controls */}
      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ddd" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
          <Calendar style={{ width: "20px", height: "20px", marginRight: "0.5rem" }} />
          <h3>Filters</h3>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Date Range</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              />
              <span>→</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Group By</label>
            <select
              value={filters.groupBy}
              onChange={(e) => handleGroupByChange(e.target.value as GroupBy)}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div style={{ padding: "1rem", marginBottom: "2rem", backgroundColor: "#fee", border: "1px solid #fcc" }}>
          <h3 style={{ color: "#c00" }}>Error Loading Analytics Data</h3>
          <p style={{ color: "#c00" }}>{state.error}</p>
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
  );
};