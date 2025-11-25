import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { StorePerformanceRanking } from '../../types/analytics';

interface StorePerformanceChartProps {
  data: StorePerformanceRanking[];
  isLoading: boolean;
  height?: number;
  chartType?: 'bar' | 'pie';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US').format(value);

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-3">{data.storeName}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium">{data.storeCity}, {data.storeState}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Rank:</span>
          <span className="font-medium">#{data.performanceRank}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Revenue:</span>
          <span className="font-medium">{formatCurrency(data.totalSalesRevenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Products:</span>
          <span className="font-medium">{formatNumber(data.totalProducts)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Performance Score:</span>
          <span className="font-medium">{data.performanceScore.toFixed(1)}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Turnover Ratio:</span>
          <span className="font-medium">{(data.inventoryTurnoverRatio * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const LoadingChart: React.FC<{ height: number }> = ({ height }) => (
  <div 
    className="bg-gray-50 rounded-lg animate-pulse flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-gray-400 text-lg">Loading performance data...</div>
  </div>
);

// Generate colors for performance ranking
const getPerformanceColor = (rank: number, total: number) => {
  const hue = 120 - (rank - 1) * (120 / (total - 1)); // Green to red
  return `hsl(${hue}, 70%, 60%)`;
};

export const StorePerformanceChart: React.FC<StorePerformanceChartProps> = ({
  data,
  isLoading,
  height = 400,
  chartType = 'bar',
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
          <div className="text-xl mb-2">🏪</div>
          <div>No store performance data available</div>
        </div>
      </div>
    );
  }

  const chartData = data.map((store) => ({
    name: store.storeName,
    shortName: store.storeName.length > 10 
      ? `${store.storeName.substring(0, 10)}...` 
      : store.storeName,
    revenue: store.totalSalesRevenue,
    performance: store.performanceScore,
    products: store.totalProducts,
    rank: store.performanceRank,
    ...store,
  }));

  if (chartType === 'pie') {
    const pieData = chartData.map((store, index) => ({
      name: store.shortName,
      value: store.revenue,
      rank: store.rank,
      color: getPerformanceColor(store.rank, data.length),
    }));

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const { name, percent } = props;
              if (!name || percent === undefined) return '';
              return `${name} (${(percent * 100).toFixed(0)}%)`;
            }}
            outerRadius={height * 0.3}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="shortName" 
          stroke="#666"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#666" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getPerformanceColor(entry.rank, data.length)} 
            />
          ))}
        </Bar>
        <Bar 
          dataKey="performance" 
          name="Performance Score" 
          fill="#82ca9d" 
          yAxisId="right"
          radius={[4, 4, 0, 0]}
          opacity={0.7}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};