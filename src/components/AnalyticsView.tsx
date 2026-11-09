// d:\Project\TVK Admin\src\components\AnalyticsView.tsx
import React, { useMemo } from 'react';
import { Complaint } from '../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Download,
  Printer,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { MANAPPARAI_WARDS, INITIAL_REPRESENTATIVES } from '../data/manapparaiWards';

interface AnalyticsViewProps {
  complaints: Complaint[];
  dateFilter: string;
  onExport: () => void;
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  complaints,
  dateFilter,
  onExport,
}) => {
  // 1. Status Distribution
  const statusData = useMemo(() => {
    let submitted = 0;
    let assigned = 0;
    let inProgress = 0;
    let resolved = 0;
    let rejected = 0;

    for (const c of complaints) {
      if (c.status === 'submitted' || c.status === 'administrative_verification') submitted++;
      else if (c.status === 'assigned_to_ward_manager') assigned++;
      else if (c.status === 'field_inspection') inProgress++;
      else if (c.status === 'resolved') resolved++;
      else if (c.status === 'rejected') rejected++;
    }

    return [
      { name: 'Submitted', value: Math.max(submitted, 0), color: '#3B82F6' },
      { name: 'Assigned', value: Math.max(assigned, 0), color: '#F59E0B' },
      { name: 'In Progress', value: Math.max(inProgress, 0), color: '#EC4899' },
      { name: 'Resolved', value: Math.max(resolved, 0), color: '#10B981' },
      { name: 'Rejected', value: Math.max(rejected, 0), color: '#EF4444' },
    ];
  }, [complaints]);

  // 2. Category Breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of complaints) {
      const cat = c.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    }

    const labels: Record<string, string> = {
      roads: 'Roads & Potholes',
      streetLights: 'Streetlights',
      water: 'Drinking Water',
      drainage: 'Drainage & Sewage',
      garbage: 'Garbage & Waste',
      transport: 'Transport',
      electricity: 'Electricity',
      other: 'Other Issues',
    };

    return Object.entries(counts).map(([k, v]) => ({
      name: labels[k] || k,
      count: v,
    }));
  }, [complaints]);

  // 3. Ward Performance Bar Chart
  const wardData = useMemo(() => {
    return MANAPPARAI_WARDS.slice(0, 8).map((w) => {
      let total = 0;
      let resolved = 0;
      for (const c of complaints) {
        if ((c.ward || '').toLowerCase().includes(`ward ${w.ward_number}`)) {
          total++;
          if (c.status === 'resolved') resolved++;
        }
      }
      return {
        ward: `W${w.ward_number}`,
        fullName: w.name_en,
        total: total,
        resolved: resolved,
        pending: total - resolved,
      };
    });
  }, [complaints]);

  // 4. Daily Submissions Trend (Last 7 Days)
  const trendData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days[key] = 0;
    }

    for (const c of complaints) {
      const d = new Date(c.created_at);
      const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      if (days[key] !== undefined) {
        days[key]++;
      }
    }

    return Object.entries(days).map(([day, submissions]) => ({
      day,
      submissions,
    }));
  }, [complaints]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Executive Grievance Analytics & Intelligence Report
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data computed directly from live Supabase database records · Range: {dateFilter.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Raw CSV
          </button>
        </div>
      </div>

      {/* Row 1: Submissions Trend & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Grievance Submission Velocity (Last 7 Days)
            </h3>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Live Flow
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563EB' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Status Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Ward Performance & Category Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Breakdown Bar Chart */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Ward Grievance Volume & Resolution Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="ward" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" stackId="a" />
                <Bar dataKey="pending" fill="#3B82F6" name="Pending Action" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Volume Horizontal Bar */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Most Frequently Reported Categories
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" name="Complaints" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Representative Performance Matrix */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Representative Performance & Field Resolution Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Representative</th>
                <th className="py-2.5 px-3">Ward</th>
                <th className="py-2.5 px-3 text-center">Assigned</th>
                <th className="py-2.5 px-3 text-center">In Progress</th>
                <th className="py-2.5 px-3 text-center">Resolved</th>
                <th className="py-2.5 px-3 text-center">Resolution Rate</th>
                <th className="py-2.5 px-3 text-center">Avg Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_REPRESENTATIVES.map((rep) => {
                const total = rep.assigned_count || 1;
                const rate = Math.round(((rep.resolved_count || 0) / total) * 100);
                return (
                  <tr key={rep.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{rep.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{rep.ward_name}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{rep.assigned_count}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-amber-600">{rep.in_progress_count}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-600">{rep.resolved_count}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600">{rate}%</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{rep.avg_resolution_hours} hours</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

