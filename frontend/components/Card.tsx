import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className = '' }: CardProps) {
  return (
    <div className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${className}`}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-2 truncate uppercase tracking-wide">{title}</p>
          <h3 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{value}</h3>
          {trend && (
            <div className={`inline-flex items-center gap-1 px-3 py-1 mt-3 rounded-full text-sm font-semibold ${
              trend.isPositive 
                ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' 
                : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
            }`}>
              <span className="text-base">{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl flex-shrink-0 ml-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Icon className="h-8 w-8 text-white" />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function InfoCard({ title, children, action, className = '' }: InfoCardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300 ${className}`}>
      <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <h3 className="relative text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
