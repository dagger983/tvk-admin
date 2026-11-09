// d:\Project\TVK Admin\src\components\Header.tsx
import React from 'react';
import {
  Search,
  Bell,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: 'all' | 'today' | '7days' | '30days';
  onDateFilterChange: (val: 'all' | 'today' | '7days' | '30days') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport: () => void;
  unreadAlertsCount: number;
  onToggleNotifications: () => void;
  isDbLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  onRefresh,
  isRefreshing,
  onExport,
  unreadAlertsCount,
  onToggleNotifications,
  isDbLive,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Live Status */}
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isDbLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDbLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isDbLive ? 'Supabase Live' : 'Connecting DB...'}
            </div>
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, citizen, ward, keyword..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => onDateFilterChange('all')}
              className={`px-2.5 py-1.5 rounded-md transition ${
                dateFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => onDateFilterChange('today')}
              className={`px-2.5 py-1.5 rounded-md transition ${
                dateFilter === 'today'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onDateFilterChange('7days')}
              className={`px-2.5 py-1.5 rounded-md transition ${
                dateFilter === '7days'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => onDateFilterChange('30days')}
              className={`px-2.5 py-1.5 rounded-md transition ${
                dateFilter === '30days'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh database records"
            className="p-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Notifications Toggle Button */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

