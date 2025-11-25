import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from 'recharts';
import { SalesAnalytics, GroupBy } from '../../types/analytics';

interface SalesChartProps {
  data: SalesAnalytics[];
  groupBy: GroupBy;
  isLoading: boolean;
  height?: number;
  showComparison?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  groupBy: GroupBy;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, groupBy }) => {
  if (!active || !payload || !payload.length) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US').format(value);

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.name}:</span>
          </div>
          <span className="font-medium">
            {entry.dataKey === 'totalRevenue' || entry.dataKey === 'averageOrderValue'
              ? formatCurrency(entry.value)
              : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const LoadingChart: React.FC<{ height: number }> = ({ height }) => (
  <div 
    className="bg-gray-50 rounded-lg animate-pulse flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-gray-400 text-lg">Loading chart data...</div>
  </div>
);

export const SalesChart: React.FC<SalesChartProps> = ({
  data,
  groupBy,
  isLoading,
  height = 400,
  showComparison = false,
}) => {
  if (isLoading) {
    return <LoadingChart height={height} />;
  }

  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-gray-50 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div>No sales data available for the selected period</div>
        </div>
      </div>
    );
  }

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    switch (groupBy) {
      case 'hour':
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          hour12: true,
        }).format(date);
      case 'day':
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
        }).format(date);
      case 'week':
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
        }).format(date);
      case 'month':
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          year: '2-digit',
        }).format(date);
      default:
        return tickItem;
    }
  };

  const chartData = data.map((item) => ({
    date: item.timePeriod,
    label: item.periodLabel,
    revenue: item.totalRevenue,
    units: item.totalQuantity,
    products: item.uniqueProducts,
    aov: item.averageOrderValue,
    stores: item.storeCount,
  }));

  if (showComparison) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            stroke="#666"
            fontSize={12}
          />
          <YAxis yAxisId="revenue" orientation="left" stroke="#8884d8" fontSize={12} />
          <YAxis yAxisId="units" orientation="right" stroke="#82ca9d" fontSize={12} />
          <Tooltip content={<CustomTooltip groupBy={groupBy} />} />
          <Legend />
          <Bar 
            yAxisId="revenue" 
            dataKey="revenue" 
            fill="#8884d8" 
            name="Revenue" 
            opacity={0.7}
          />
          <Line
            yAxisId="units"
            type="monotone"
            dataKey="units"
            stroke="#82ca9d"
            strokeWidth={3}
            name="Units Sold"
            dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxisLabel}
          stroke="#666"
          fontSize={12}
        />
        <YAxis stroke="#666" fontSize={12} />
        <Tooltip content={<CustomTooltip groupBy={groupBy} />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={3}
          name="Revenue"
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#8884d8', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="units"
          stroke="#82ca9d"
          strokeWidth={3}
          name="Units Sold"
          dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#82ca9d', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="aov"
          stroke="#ffc658"
          strokeWidth={3}
          name="Avg Order Value"
          dot={{ fill: '#ffc658', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#ffc658', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};