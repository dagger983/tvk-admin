// d:\Project\TVK Admin\src\components\RepManager.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { WardRepresentative, Complaint } from '../types';
import { MANAPPARAI_WARDS } from '../data/manapparaiWards';
import {
  fetchRepresentativesFromDb,
  createRepresentativeInDb,
  updateRepresentativeInDb,
  deleteRepresentativeInDb,
  subscribeToRepresentatives,
} from '../services/adminService';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Search,
  Sparkles,
  RefreshCw,
  MapPinOff,
} from 'lucide-react';

interface RepManagerProps {
  complaints: Complaint[];
  representatives?: WardRepresentative[];
  onRepresentativesChange?: (reps: WardRepresentative[]) => void;
}

export const RepManager: React.FC<RepManagerProps> = ({
  complaints,
  representatives: initialReps,
  onRepresentativesChange,
}) => {
  const [reps, setReps] = useState<WardRepresentative[]>(initialReps || []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRep, setEditingRep] = useState<WardRepresentative | null>(null);
  const [deletingRep, setDeletingRep] = useState<WardRepresentative | null>(null);

  // Password visibility tracking per representative id
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formId, setFormId] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formWardNumber, setFormWardNumber] = useState<number | null>(4);
  const [formRole, setFormRole] = useState<string>('Ward Representative');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formShowPassword, setFormShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Representatives from Supabase DB
  const loadReps = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRepresentativesFromDb(complaints);
      setReps(data);
      if (onRepresentativesChange) onRepresentativesChange(data);
    } catch (e) {
      console.warn('Error loading reps:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReps();
    const unsub = subscribeToRepresentatives(() => {
      loadReps();
    });
    return () => unsub();
  }, [complaints]);

  // Toggle Password Visibility
  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy password to clipboard
  const handleCopyPassword = (id: string, pwd?: string) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopiedId(id);
    showToast('Password copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate random secure password
  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789!@#$';
    let res = 'tvk@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(res);
  };

  // Open Add Modal
  const openAddModal = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormId(`REP-W04-${randomSuffix}`);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword(`tvk@${randomSuffix}`);
    setFormWardNumber(4);
    setFormRole('Ward Representative');
    setFormStatus('active');
    setFormShowPassword(true);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (rep: WardRepresentative) => {
    setEditingRep(rep);
    setFormId(rep.id);
    setFormName(rep.name);
    setFormPhone(rep.phone);
    setFormEmail(rep.email);
    setFormPassword(rep.password || 'tvk@123');
    setFormWardNumber(rep.ward_number ?? null);
    setFormRole(rep.role || 'Ward Representative');
    setFormStatus(rep.status || 'active');
    setFormShowPassword(false);
  };

  // Save new representative
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formEmail.trim() || !formPassword.trim()) {
      alert('Please fill in Name, Phone, Email and Password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const wardObj = formWardNumber ? MANAPPARAI_WARDS.find(w => w.ward_number === Number(formWardNumber)) : null;
      const wardName = wardObj ? wardObj.name_en : formWardNumber ? `Ward ${formWardNumber}` : 'Unassigned';

      const newRep: WardRepresentative = {
        id: formId.trim() || `REP-${Date.now().toString().slice(-6)}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        password: formPassword.trim(),
        ward_number: formWardNumber ? Number(formWardNumber) : null,
        ward_name: wardName,
        role: formRole.trim() || 'Ward Representative',
        status: formStatus,
        assigned_count: 0,
        acknowledged_count: 0,
        in_progress_count: 0,
        resolved_count: 0,
        overdue_count: 0,
        avg_resolution_hours: 24,
        last_active: 'Just now',
      };

      const res = await createRepresentativeInDb(newRep);
      if (res.success) {
        showToast(`Representative ${newRep.name} added successfully!`);
        setShowAddModal(false);
        await loadReps();
      } else {
        alert('Failed to save representative: ' + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save edited representative
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRep) return;

    setIsSubmitting(true);
    try {
      const wardObj = formWardNumber ? MANAPPARAI_WARDS.find(w => w.ward_number === Number(formWardNumber)) : null;
      const wardName = wardObj ? wardObj.name_en : formWardNumber ? `Ward ${formWardNumber}` : 'Unassigned';

      const updates: Partial<WardRepresentative> = {
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        password: formPassword.trim(),
        ward_number: formWardNumber ? Number(formWardNumber) : null,
        ward_name: wardName,
        role: formRole.trim(),
        status: formStatus,
      };

      const res = await updateRepresentativeInDb(editingRep.id, updates);
      if (res.success) {
        showToast(`Updated ${formName} successfully!`);
        setEditingRep(null);
        await loadReps();
      } else {
        alert('Failed to update representative: ' + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Remove / Unassign Ward from representative
  const handleUnassignWard = async (rep: WardRepresentative) => {
    if (!window.confirm(`Are you sure you want to remove the assigned ward from ${rep.name}?`)) {
      return;
    }

    const res = await updateRepresentativeInDb(rep.id, {
      ward_number: null,
      ward_name: 'Unassigned',
    });

    if (res.success) {
      showToast(`Ward unassigned from ${rep.name}`);
      await loadReps();
    } else {
      alert('Failed to unassign ward: ' + res.error);
    }
  };

  // Toggle representative active/inactive status
  const handleToggleStatus = async (rep: WardRepresentative) => {
    const nextStatus = rep.status === 'active' ? 'inactive' : 'active';
    const res = await updateRepresentativeInDb(rep.id, { status: nextStatus });
    if (res.success) {
      showToast(`${rep.name} marked as ${nextStatus}`);
      await loadReps();
    }
  };

  // Confirm and delete representative
  const handleConfirmDelete = async () => {
    if (!deletingRep) return;
    setIsSubmitting(true);
    try {
      const res = await deleteRepresentativeInDb(deletingRep.id);
      if (res.success) {
        showToast(`Representative ${deletingRep.name} permanently deleted.`);
        setDeletingRep(null);
        await loadReps();
      } else {
        alert('Failed to delete representative: ' + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter representatives
  const filteredReps = useMemo(() => {
    return reps.filter((rep) => {
      if (statusFilter !== 'all' && rep.status !== statusFilter) return false;
      if (wardFilter !== 'all') {
        if (wardFilter === 'unassigned') {
          if (rep.ward_number !== null && rep.ward_number !== undefined && rep.ward_number !== 0) return false;
        } else {
          if (String(rep.ward_number) !== wardFilter) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          rep.name.toLowerCase().includes(q) ||
          rep.id.toLowerCase().includes(q) ||
          rep.phone.toLowerCase().includes(q) ||
          rep.email.toLowerCase().includes(q) ||
          (rep.ward_name && rep.ward_name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [reps, statusFilter, wardFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Ward Representative & Member Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, authenticate, update credentials, configure ward allocation, or remove ward officers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadReps}
            title="Refresh from Database"
            className="p-2.5 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            Add New Representative
          </button>
        </div>
      </div>

      {/* Roster Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Reps</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{reps.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Active Officers</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">
            {reps.filter(r => r.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Assigned Wards</p>
          <p className="text-xl font-extrabold text-amber-700 mt-1">
            {new Set(reps.filter(r => r.ward_number).map(r => r.ward_number)).size} / 12
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Unassigned Reps</p>
          <p className="text-xl font-extrabold text-rose-700 mt-1">
            {reps.filter(r => !r.ward_number).length}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Wards</option>
            <option value="unassigned">Unassigned Only</option>
            {MANAPPARAI_WARDS.map((w) => (
              <option key={w.id} value={w.ward_number}>
                Ward {w.ward_number} - {w.name_en}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Representatives Cards Grid */}
      {filteredReps.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No representatives found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new representative.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReps.map((rep) => {
            const isRevealed = !!revealedPasswords[rep.id];
            const hasWard = rep.ward_number !== null && rep.ward_number !== undefined && rep.ward_number > 0;

            return (
              <div
                key={rep.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                {/* Top Row: Name, Status & Avatar */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                        {rep.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900">{rep.name}</h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold">
                            {rep.id}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 font-semibold">{rep.role || 'Ward Representative'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(rep)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                        rep.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {rep.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Ward Allocation Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      {hasWard ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {rep.ward_name || `Ward ${rep.ward_number}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          <MapPinOff className="w-3.5 h-3.5 text-amber-600" />
                          No Ward Assigned
                        </span>
                      )}
                    </div>

                    {hasWard && (
                      <button
                        onClick={() => handleUnassignWard(rep)}
                        title="Remove Ward Assignment"
                        className="text-[11px] text-slate-400 hover:text-amber-700 hover:underline flex items-center gap-1 transition"
                      >
                        <MapPinOff className="w-3 h-3" />
                        Unassign Ward
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{rep.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{rep.email}</span>
                  </div>
                </div>

                {/* Password Box (View, Show/Hide, Copy) */}
                <div className="bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between text-xs shadow-inner">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">PWD:</span>
                    <span className="font-mono font-bold tracking-wider truncate text-emerald-300">
                      {isRevealed ? (rep.password || 'tvk@123') : '••••••••••••'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => togglePasswordVisibility(rep.id)}
                      title={isRevealed ? 'Hide Password' : 'Show Password'}
                      className="p-1 text-slate-400 hover:text-white rounded transition"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopyPassword(rep.id, rep.password || 'tvk@123')}
                      title="Copy Password"
                      className="p-1 text-slate-400 hover:text-emerald-400 rounded transition"
                    >
                      {copiedId === rep.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Workload Stats Bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-1 border-t border-b border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Assigned</div>
                    <div className="text-sm font-extrabold text-slate-800">{rep.assigned_count ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-500">In Progress</div>
                    <div className="text-sm font-extrabold text-amber-600">{rep.in_progress_count ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-500">Resolved</div>
                    <div className="text-sm font-extrabold text-emerald-600">{rep.resolved_count ?? 0}</div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-slate-500 text-[11px]">
                    Last active: <strong className="text-slate-700">{rep.last_active || 'Online'}</strong>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(rep)}
                      title="Edit Representative & Credentials"
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingRep(rep)}
                      title="Delete Representative"
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD REPRESENTATIVE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                Add New Ward Representative
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Representative ID</label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. REP-W04-1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Ward Representative"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. R. Senthil Kumar (TVK)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (+91)</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 9442011624"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="rep.ward04@tvk.org.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password configuration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Account Password</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter login password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">This password can be viewed, changed, or deleted by admins at any time.</p>
              </div>

              {/* Ward assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Ward</label>
                  <select
                    value={formWardNumber ?? ''}
                    onChange={(e) => setFormWardNumber(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">None (Unassigned / Floating)</option>
                    {MANAPPARAI_WARDS.map((w) => (
                      <option key={w.id} value={w.ward_number}>
                        Ward {w.ward_number} - {w.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="active">Active (Permitted to Inspect & Resolve)</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Representative to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REPRESENTATIVE MODAL */}
      {editingRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  Edit Representative & Password
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">ID: {editingRep.id}</p>
              </div>
              <button onClick={() => setEditingRep(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (+91)</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Edit with Show/Hide */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Account Password</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate New
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Ward</label>
                  <select
                    value={formWardNumber ?? ''}
                    onChange={(e) => setFormWardNumber(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">None (Remove / Unassign Ward)</option>
                    {MANAPPARAI_WARDS.map((w) => (
                      <option key={w.id} value={w.ward_number}>
                        Ward {w.ward_number} - {w.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingRep(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Ward Representative?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to permanently delete <strong>{deletingRep.name}</strong> ({deletingRep.id})?
                  This action cannot be undone. Any complaints assigned to this representative will be marked as unassigned.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-3">
                <button
                  onClick={() => setDeletingRep(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Yes, Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
