import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Store, AlertTriangle } from 'lucide-react';
import { DashboardSummary } from '../../types/analytics';

interface DashboardKPIsProps {
  data: DashboardSummary | null;
  isLoading: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'red';
  format?: 'currency' | 'number' | 'percentage';
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  format = 'number' 
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-2">{formatValue(value)}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-white ${iconColorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const LoadingCard: React.FC = () => (
  <div className="p-6 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
    </div>
  </div>
);

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue"
        value={data.totalRevenue}
        change={data.growthRate}
        icon={DollarSign}
        color="green"
        format="currency"
      />
      
      <KPICard
        title="Units Sold"
        value={data.totalUnits}
        icon={Package}
        color="blue"
        format="number"
      />
      
      <KPICard
        title="Average Order Value"
        value={data.averageOrderValue}
        icon={TrendingUp}
        color="orange"
        format="currency"
      />
      
      <KPICard
        title="Active Stores"
        value={data.totalStores}
        icon={Store}
        color="blue"
        format="number"
      />
      
      <KPICard
        title="Total Products"
        value={data.totalProducts}
        icon={Package}
        color="green"
        format="number"
      />
      
      <KPICard
        title="Top Performing Store"
        value={data.topPerformingStore}
        icon={TrendingUp}
        color="green"
      />
      
      <KPICard
        title="Growth Rate"
        value={data.growthRate}
        icon={data.growthRate >= 0 ? TrendingUp : TrendingDown}
        color={data.growthRate >= 0 ? 'green' : 'red'}
        format="percentage"
      />
      
      <KPICard
        title="Low Stock Alerts"
        value={data.lowStockAlerts}
        icon={AlertTriangle}
        color={data.lowStockAlerts > 0 ? 'red' : 'green'}
        format="number"
      />
    </div>
  );
};