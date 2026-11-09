// d:\Project\TVK Admin\src\components\AuditLogView.tsx
import React, { useState, useMemo } from 'react';
import { AuditLogItem } from '../types';
import { ShieldCheck, Search, ShieldAlert, Clock, User, FileText } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLogItem[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (l) =>
        l.acting_user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        (l.complaint_id && l.complaint_id.toLowerCase().includes(q)) ||
        l.affected_record.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Security & Operational Audit Log
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of all administrative actions, complaint assignments, status transitions, and roster modifications.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit records by actor, ID, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Acting User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{log.acting_user}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {log.affected_record}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

