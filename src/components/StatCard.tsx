// d:\Project\TVK Admin\src\components\StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'purple' | 'slate';
  onClick?: () => void;
  badge?: string;
}

const variantStyles = {
  blue: {
    bg: 'bg-blue-50/60',
    border: 'border-blue-100 hover:border-blue-300',
    iconBg: 'bg-blue-600 text-white',
    text: 'text-blue-900',
    highlight: 'text-blue-600',
  },
  amber: {
    bg: 'bg-amber-50/60',
    border: 'border-amber-100 hover:border-amber-300',
    iconBg: 'bg-amber-500 text-white',
    text: 'text-amber-900',
    highlight: 'text-amber-600',
  },
  emerald: {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-100 hover:border-emerald-300',
    iconBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-900',
    highlight: 'text-emerald-600',
  },
  rose: {
    bg: 'bg-rose-50/60',
    border: 'border-rose-100 hover:border-rose-300',
    iconBg: 'bg-rose-600 text-white',
    text: 'text-rose-900',
    highlight: 'text-rose-600',
  },
  indigo: {
    bg: 'bg-indigo-50/60',
    border: 'border-indigo-100 hover:border-indigo-300',
    iconBg: 'bg-indigo-600 text-white',
    text: 'text-indigo-900',
    highlight: 'text-indigo-600',
  },
  purple: {
    bg: 'bg-purple-50/60',
    border: 'border-purple-100 hover:border-purple-300',
    iconBg: 'bg-purple-600 text-white',
    text: 'text-purple-900',
    highlight: 'text-purple-600',
  },
  slate: {
    bg: 'bg-slate-50/60',
    border: 'border-slate-200 hover:border-slate-300',
    iconBg: 'bg-slate-700 text-white',
    text: 'text-slate-900',
    highlight: 'text-slate-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  onClick,
  badge,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border bg-white shadow-sm transition-all duration-200 flex flex-col justify-between ${styles.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          {badge && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};

