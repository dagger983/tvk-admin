// d:\Project\TVK Admin\src\components\WardManager.tsx
import React, { useState, useMemo } from 'react';
import { Ward, Complaint, WardRepresentative } from '../types';
import { MANAPPARAI_WARDS, INITIAL_REPRESENTATIVES } from '../data/manapparaiWards';
import {
  MapPin,
  Search,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Save,
  X,
  Building,
} from 'lucide-react';

interface WardManagerProps {
  complaints: Complaint[];
  onOpenComplaintFilterByWard: (wardName: string) => void;
}

export const WardManager: React.FC<WardManagerProps> = ({
  complaints,
  onOpenComplaintFilterByWard,
}) => {
  const [wards, setWards] = useState<Ward[]>(MANAPPARAI_WARDS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingWardId, setEditingWardId] = useState<string | null>(null);
  const [editRepId, setEditRepId] = useState<string>('');

  // Calculate live statistics for each ward from actual database complaints
  const enrichedWards = useMemo(() => {
    return wards.map((w) => {
      let total = 0;
      let pending = 0;
      let resolved = 0;
      let overdue = 0;

      for (const c of complaints) {
        const matches = (c.ward || '').toLowerCase().includes(`ward ${w.ward_number}`);
        if (matches) {
          total++;
          if (c.status === 'resolved') {
            resolved++;
          } else if (c.status !== 'rejected') {
            pending++;
            const hours = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 3600);
            if (hours > 48) overdue++;
          }
        }
      }

      const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      return {
        ...w,
        total_complaints: total,
        pending_complaints: pending,
        resolved_complaints: resolved,
        overdue_complaints: overdue,
        resolution_rate: resRate,
      };
    });
  }, [wards, complaints]);

  const filteredWards = useMemo(() => {
    if (!searchTerm.trim()) return enrichedWards;
    const q = searchTerm.toLowerCase();
    return enrichedWards.filter(
      (w) =>
        w.name_en.toLowerCase().includes(q) ||
        w.name_ta.toLowerCase().includes(q) ||
        w.key_localities.some((loc) => loc.toLowerCase().includes(q)) ||
        w.representative_name.toLowerCase().includes(q) ||
        `ward ${w.ward_number}`.includes(q)
    );
  }, [enrichedWards, searchTerm]);

  const handleStartEdit = (ward: Ward) => {
    setEditingWardId(ward.id);
    setEditRepId(ward.representative_id);
  };

  const handleSaveEdit = (wardId: string) => {
    const rep = INITIAL_REPRESENTATIVES.find((r) => r.id === editRepId);
    if (!rep) return;

    setWards((prev) =>
      prev.map((w) =>
        w.id === wardId
          ? {
              ...w,
              representative_id: rep.id,
              representative_name: rep.name,
              representative_phone: rep.phone,
            }
          : w
      )
    );
    setEditingWardId(null);
  };

  const toggleWardActive = (wardId: string) => {
    setWards((prev) =>
      prev.map((w) => (w.id === wardId ? { ...w, is_active: !w.is_active } : w))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Manapparai Municipality - 12 Municipal Wards
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure ward boundaries, representative assignments, and monitor real-time resolution metrics.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ward, locality, or representative..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Wards Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 select-none">
                <th className="py-3 px-4">Ward No.</th>
                <th className="py-3 px-4">Ward Name & Key Localities</th>
                <th className="py-3 px-4">Assigned Representative</th>
                <th className="py-3 px-4 text-center">Complaints</th>
                <th className="py-3 px-4 text-center">Pending</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Resolution %</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredWards.map((w) => {
                const isEditing = editingWardId === w.id;

                return (
                  <tr key={w.id} className="hover:bg-blue-50/40 transition">
                    {/* Ward Number Badge */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-xs">
                        {w.ward_number}
                      </span>
                    </td>

                    {/* Ward Name & Localities */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div className="font-bold text-slate-900">{w.name_en}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{w.name_ta}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {w.key_localities.map((loc, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200"
                          >
                            {loc}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Representative */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <select
                            value={editRepId}
                            onChange={(e) => setEditRepId(e.target.value)}
                            className="px-2 py-1 bg-white border border-blue-500 rounded text-xs font-semibold"
                          >
                            {INITIAL_REPRESENTATIVES.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.ward_name})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveEdit(w.id)}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingWardId(null)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-800">{w.representative_name}</div>
                          <div className="text-[11px] text-slate-500">{w.representative_phone}</div>
                        </div>
                      )}
                    </td>

                    {/* Total complaints */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      <button
                        onClick={() => onOpenComplaintFilterByWard(`Ward ${w.ward_number}`)}
                        className="hover:underline hover:text-blue-600"
                      >
                        {w.total_complaints || 0}
                      </button>
                    </td>

                    {/* Pending */}
                    <td className="py-3.5 px-4 text-center font-semibold text-amber-600">
                      {w.pending_complaints || 0}
                    </td>

                    {/* Resolved */}
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                      {w.resolved_complaints || 0}
                    </td>

                    {/* Resolution % progress bar */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${w.resolution_rate || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px]">
                          {w.resolution_rate || 0}%
                        </span>
                      </div>
                    </td>

                    {/* Active toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleWardActive(w.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                          w.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {w.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(w)}
                          title="Change Representative"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
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

