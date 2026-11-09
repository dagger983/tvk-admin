// d:\Project\TVK Admin\src\components\ComplaintTable.tsx
import React, { useState, useMemo } from 'react';
import {
  Complaint,
  ComplaintStatus,
  PriorityLevel,
} from '../types';
import {
  ExternalLink,
  UserPlus,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { MANAPPARAI_WARDS } from '../data/manapparaiWards';

interface ComplaintTableProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenAssignModal: (complaint: Complaint) => void;
  onBulkAssign: (selectedIds: string[]) => void;
  initialFilterStatus?: string;
}

const statusBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
  submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  administrative_verification: {
    label: 'Under Review',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  assigned_to_ward_manager: {
    label: 'Assigned',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  field_inspection: {
    label: 'In Progress',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

const priorityBadges: Record<PriorityLevel, { bg: string; text: string; dot: string }> = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  Medium: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  High: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  Urgent: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-600 animate-ping' },
};

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onSelectComplaint,
  onOpenAssignModal,
  onBulkAssign,
  initialFilterStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Filter complaints
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          const hours = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 3600);
          if (c.status === 'resolved' || c.status === 'rejected' || hours <= 48) return false;
        } else if (statusFilter === 'unassigned') {
          if (c.assigned_admin_id) return false;
        } else if (c.status !== statusFilter) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) {
        return false;
      }

      // Ward filter
      if (wardFilter !== 'all') {
        const matchesWard = (c.ward || '').toLowerCase().includes(wardFilter.toLowerCase());
        if (!matchesWard) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && c.category !== categoryFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          (c.title_en || '').toLowerCase().includes(q) ||
          (c.desc_en || '').toLowerCase().includes(q) ||
          (c.landmark_en || '').toLowerCase().includes(q) ||
          (c.citizen_name || '').toLowerCase().includes(q) ||
          (c.citizen_phone || '').includes(q) ||
          (c.ward || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [complaints, statusFilter, priorityFilter, wardFilter, categoryFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedComplaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedComplaints.map((c) => c.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Filter Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs font-medium">
            {[
              { id: 'all', label: 'All Complaints' },
              { id: 'unassigned', label: 'Unassigned' },
              { id: 'submitted', label: 'New' },
              { id: 'assigned_to_ward_manager', label: 'Assigned' },
              { id: 'field_inspection', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'overdue', label: 'Overdue' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bulk Action Button */}
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => onBulkAssign(selectedIds)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Assign Selected
              </button>
            </div>
          )}
        </div>

        {/* Dropdown Filters & Search */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Ward filter */}
          <select
            value={wardFilter}
            onChange={(e) => {
              setWardFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Wards (Manapparai)</option>
            {MANAPPARAI_WARDS.map((w) => (
              <option key={w.id} value={`Ward ${w.ward_number}`}>
                Ward {w.ward_number} - {w.key_localities[0]}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="streetLights">Street Lights</option>
            <option value="water">Drinking Water</option>
            <option value="drainage">Drainage & Sewage</option>
            <option value="garbage">Garbage & Sanitation</option>
            <option value="roads">Roads & Potholes</option>
            <option value="transport">Public Transport</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other Issues</option>
          </select>

          {/* Search bar inside table */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search table by ID, Citizen, Locality..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <span className="text-slate-500 font-medium text-xs ml-auto">
            Showing <strong className="text-slate-800">{filtered.length}</strong> complaints
          </span>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 select-none">
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedComplaints.length > 0 &&
                    selectedIds.length === paginatedComplaints.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Complaint ID</th>
              <th className="py-3 px-4">Citizen / Phone</th>
              <th className="py-3 px-4">Grievance Issue</th>
              <th className="py-3 px-4">Ward / Locality</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned Rep</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-xs">
            {paginatedComplaints.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No complaints found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your filters or search terms.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedComplaints.map((c) => {
                const sBadge = statusBadges[c.status] || statusBadges.submitted;
                const pBadge = priorityBadges[c.priority || 'Medium'] || priorityBadges.Medium;
                const isSelected = selectedIds.includes(c.id);
                const isOverdue =
                  c.status !== 'resolved' &&
                  c.status !== 'rejected' &&
                  (Date.now() - new Date(c.created_at).getTime()) / (1000 * 3600) > 48;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-blue-50/40 transition duration-150 ${
                      isSelected ? 'bg-blue-50/60' : ''
                    } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <td className="py-3 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(c.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Complaint ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        {c.id}
                        {c.photos && c.photos.length > 0 && (
                          <span
                            title={`${c.photos.length} photos uploaded`}
                            className="text-[10px] px-1 bg-slate-200 text-slate-700 rounded font-sans"
                          >
                            📷 {c.photos.length}
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Citizen Info */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{c.citizen_name || 'Citizen'}</div>
                      <div className="text-[11px] text-slate-500">{c.citizen_phone || c.alternate_phone || 'No phone'}</div>
                    </td>

                    {/* Issue Title & Category */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate" title={c.title_en}>
                        {c.title_en}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {c.category} · {c.landmark_en}
                      </div>
                    </td>

                    {/* Ward & Auto-Identified badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span>{c.ward || 'Ward 4 (Anna Nagar)'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        {c.ward_verified ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 rounded border border-emerald-200">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1 rounded border border-amber-200">
                            ⚠ Verify Needed
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${pBadge.bg} ${pBadge.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pBadge.dot}`} />
                        {c.priority || 'Medium'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sBadge.bg} ${sBadge.text} ${sBadge.border}`}
                        >
                          {sBadge.label}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Representative */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.assigned_admin_id ? (
                        <div>
                          <p className="font-semibold text-slate-800 truncate max-w-[130px]">
                            {c.admin_name || 'Assigned Officer'}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium">Assigned</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenAssignModal(c)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition"
                        >
                          <UserPlus className="w-3 h-3" />
                          Assign Now
                        </button>
                      )}
                    </td>

                    {/* Submission Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => onSelectComplaint(c)}
                        title="View Full Details"
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing page <strong className="text-slate-800">{currentPage}</strong> of{' '}
          <strong className="text-slate-800">{totalPages}</strong> ({filtered.length} total)
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border bg-white border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-7 h-7 rounded text-xs font-bold transition ${
                currentPage === num
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border bg-white border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

