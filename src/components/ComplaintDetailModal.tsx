// d:\Project\TVK Admin\src\components\ComplaintDetailModal.tsx
import React, { useState } from 'react';
import {
  Complaint,
  ComplaintStatus,
  PriorityLevel,
} from '../types';
import {
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Send,
  Save,
  Check,
  Camera,
} from 'lucide-react';
import { MANAPPARAI_WARDS, INITIAL_REPRESENTATIVES } from '../data/manapparaiWards';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  onClose: () => void;
  onUpdateStatus: (params: {
    status: ComplaintStatus;
    titleEn?: string;
    messageEn?: string;
    rejectedReason?: string;
    adminPhotos?: string[];
  }) => Promise<void>;
  onAssign: (params: {
    repId: string;
    repName: string;
    instructions?: string;
  }) => Promise<void>;
  onUpdateAdminDetails: (params: {
    priority?: PriorityLevel;
    internal_notes?: string;
    ward?: string;
    ward_verified?: boolean;
  }) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus,
  onAssign,
  onUpdateAdminDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'assignment' | 'resolution' | 'timeline'>('details');

  // Local state for admin modifications
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(complaint.priority || 'Medium');
  const [internalNotes, setInternalNotes] = useState<string>(complaint.internal_notes || '');
  const [selectedWard, setSelectedWard] = useState<string>(complaint.ward || 'Ward 4 - Anna Nagar');
  const [isWardVerified, setIsWardVerified] = useState<boolean>(complaint.ward_verified !== false);

  // Assignment fields
  const [selectedRepId, setSelectedRepId] = useState<string>(complaint.assigned_admin_id || 'REP-W04');
  const [assignInstructions, setAssignInstructions] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Resolution fields
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const selectedRep = INITIAL_REPRESENTATIVES.find(r => r.id === selectedRepId);

  const handleSaveAdminDetails = () => {
    onUpdateAdminDetails({
      priority: selectedPriority,
      internal_notes: internalNotes,
      ward: selectedWard,
      ward_verified: isWardVerified,
    });
    setSaveSuccessNotice('Administrative notes and priority saved.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleExecuteAssignment = async () => {
    if (!selectedRep) return;
    setIsAssigning(true);
    await onAssign({
      repId: selectedRep.id,
      repName: selectedRep.name,
      instructions: assignInstructions,
    });
    setIsAssigning(false);
    setSaveSuccessNotice(`Successfully assigned to ${selectedRep.name}`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleStatusChange = async (targetStatus: ComplaintStatus) => {
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus({
        status: targetStatus,
        messageEn: resolutionNote || undefined,
        rejectedReason: targetStatus === 'rejected' ? rejectionReason : undefined,
      });
      setSaveSuccessNotice(`Status successfully updated to ${targetStatus}`);
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="px-2.5 py-1 bg-blue-600 rounded-md font-mono font-bold text-sm tracking-wide">
              {complaint.id}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{complaint.title_en}</h2>
              <p className="text-xs text-slate-400 capitalize">
                {complaint.category} · Submitted on{' '}
                {new Date(complaint.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex space-x-1 text-xs font-semibold">
            {[
              { id: 'details', label: 'Complaint Overview' },
              { id: 'assignment', label: 'Ward & Representative Assignment' },
              { id: 'resolution', label: 'Resolution & Status Control' },
              { id: 'timeline', label: 'Audit Timeline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {saveSuccessNotice && (
            <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              {saveSuccessNotice}
            </div>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Grievance Description & Photos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Grievance Description (English)
                    </span>
                    <p className="text-sm text-slate-900 leading-relaxed font-normal">
                      {complaint.desc_en}
                    </p>
                    {complaint.desc_ta && (
                      <div className="pt-2 border-t border-slate-200/60 mt-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          விளக்கம் (Tamil):
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed font-normal">
                          {complaint.desc_ta}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Citizen Contact Card */}
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {complaint.citizen_name || 'Registered Citizen'}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{complaint.citizen_phone || 'No Primary Phone'}</span>
                          {complaint.alternate_phone && (
                            <span className="text-slate-500">
                              · Alt: {complaint.alternate_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">
                        {complaint.ward || 'Manapparai'}
                      </div>
                      <div className="text-[11px] text-slate-500">Citizen Profile Verified</div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Evidence Photos */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Citizen Photos ({complaint.photos?.length || 0})
                  </span>
                  {complaint.photos && complaint.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {complaint.photos.map((photoUrl, idx) => (
                        <a
                          key={idx}
                          href={typeof photoUrl === 'string' ? photoUrl : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:ring-2 hover:ring-blue-500 transition"
                        >
                          <img
                            src={typeof photoUrl === 'string' ? photoUrl : ''}
                            alt={`Complaint photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => {
                              (e.target as any).src =
                                'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                            View Full ↗
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="h-36 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 bg-slate-50">
                      No citizen photos attached
                    </div>
                  )}
                </div>
              </div>

              {/* Geographic Coordinates & Landmark */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    Location & GPS Pin
                  </span>
                  {complaint.google_maps_url ? (
                    <a
                      href={complaint.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : complaint.latitude && complaint.longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Open GPS in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {complaint.landmark_en}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>
                    Lat: <strong>{complaint.latitude || '10.6074'}</strong>
                  </span>
                  <span>
                    Lng: <strong>{complaint.longitude || '78.4336'}</strong>
                  </span>
                  <span className="text-blue-600 font-medium">Manapparai Municipality Jurisdiction</span>
                </div>
              </div>

              {/* Administrative Controls: Priority & Internal Notes */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Administrative Notes & Priority Assignment
                  </h3>
                  <button
                    onClick={handleSaveAdminDetails}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Priority selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Complaint Priority
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Low">Low - Routine issue</option>
                      <option value="Medium">Medium - Standard 48h resolution</option>
                      <option value="High">High - Impedes public utility</option>
                      <option value="Urgent">Urgent - Hazard / Emergency risk</option>
                    </select>
                  </div>

                  {/* Ward selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Assigned Ward
                    </label>
                    <select
                      value={selectedWard}
                      onChange={(e) => {
                        setSelectedWard(e.target.value);
                        setIsWardVerified(true);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {MANAPPARAI_WARDS.map((w) => (
                        <option key={w.id} value={`Ward ${w.ward_number} - ${w.key_localities[0]}`}>
                          Ward {w.ward_number} - {w.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Internal notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Internal Administrative Notes (Not visible to citizen)
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add internal notes, contractor info, or verification remarks..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignment' && (
            <div className="space-y-6">
              {/* Ward Detection Card */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-950">
                      Automatic Ward Identification System
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Verified Match
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Identified based on GPS coordinates ({complaint.latitude?.toFixed(4)},{' '}
                  {complaint.longitude?.toFixed(4)}) and landmark matching:
                </p>
                <div className="p-3 bg-white rounded-lg border border-blue-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">
                      Target Municipal Ward
                    </div>
                    <div className="text-sm font-extrabold text-blue-900">
                      {selectedWard}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-semibold uppercase">
                      Recommended Representative
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {selectedRep?.name || 'R. Senthil Kumar (TVK)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Form */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assign to Ward Representative
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Ward Representative
                  </label>
                  <select
                    value={selectedRepId}
                    onChange={(e) => setSelectedRepId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {INITIAL_REPRESENTATIVES.map((rep) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.name} · {rep.ward_name} ({rep.status === 'active' ? 'Active' : 'Inactive'} · {rep.in_progress_count} in progress)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRep && selectedRep.status === 'inactive' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Warning: This representative is currently marked as Inactive.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Special Instructions / Notes for Representative
                  </label>
                  <textarea
                    rows={3}
                    value={assignInstructions}
                    onChange={(e) => setAssignInstructions(e.target.value)}
                    placeholder="e.g. Please inspect the leaning electrical post immediately and coordinate with TNEB lineman..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleExecuteAssignment}
                    disabled={isAssigning}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isAssigning ? 'Dispatching...' : 'Dispatch Assignment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resolution' && (
            <div className="space-y-6">
              {/* Status Transition Control Card */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Update Grievance Status
                </h3>
                <p className="text-xs text-slate-500">
                  Changing status here automatically updates the citizen's mobile app and creates a timeline milestone.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleStatusChange('administrative_verification')}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => handleStatusChange('assigned_to_ward_manager')}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                  >
                    Mark Assigned
                  </button>
                  <button
                    onClick={() => handleStatusChange('field_inspection')}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 transition"
                  >
                    Mark In Progress (Field Work)
                  </button>
                </div>
              </div>

              {/* Complete / Resolve Section */}
              <div className="p-5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Verify & Mark Resolved</span>
                </div>
                <p className="text-xs text-slate-600">
                  Record resolution summary. Citizen will receive push alert and view resolution photos.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resolution Message for Citizen (English & Tamil)
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Field team has inspected and resolved the grievance. Repaired and tested on site."
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleStatusChange('resolved')}
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  Confirm Grievance Resolved
                </button>
              </div>

              {/* Reject Section */}
              <div className="p-5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Reject Grievance</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mandatory Rejection Reason
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Duplicate submission / Outside municipal jurisdiction / Invalid information..."
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isUpdatingStatus || !rejectionReason.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Grievance Lifecycle Timeline
              </h3>
              <div className="space-y-4 border-l-2 border-blue-600 ml-3 pl-5 py-2">
                <div className="relative">
                  <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="text-xs font-bold text-slate-900">Grievance Registered</div>
                  <div className="text-xs text-slate-500">
                    {new Date(complaint.created_at).toLocaleString()} by Citizen ({complaint.citizen_name || 'Citizen'})
                  </div>
                </div>

                {complaint.assigned_admin_id && (
                  <div className="relative">
                    <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white" />
                    <div className="text-xs font-bold text-slate-900">Assigned to Ward Representative</div>
                    <div className="text-xs text-slate-500">
                      Assigned to {complaint.admin_name || 'Ward Officer'} · {complaint.admin_update_message_en || 'Assigned'}
                    </div>
                  </div>
                )}

                {complaint.status === 'field_inspection' && (
                  <div className="relative">
                    <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-white" />
                    <div className="text-xs font-bold text-slate-900">Field Work In Progress</div>
                    <div className="text-xs text-slate-500">
                      Maintenance team deployed to site.
                    </div>
                  </div>
                )}

                {complaint.status === 'resolved' && (
                  <div className="relative">
                    <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                    <div className="text-xs font-bold text-emerald-800">Resolved & Closed</div>
                    <div className="text-xs text-slate-500">
                      {complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleString() : 'Resolved'}
                    </div>
                  </div>
                )}

                {complaint.status === 'rejected' && (
                  <div className="relative">
                    <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-rose-600 ring-4 ring-white" />
                    <div className="text-xs font-bold text-rose-800">Grievance Rejected</div>
                    <div className="text-xs text-slate-500">
                      Reason: {complaint.rejected_reason || 'Verified and closed by administrator.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Current Status: <strong className="text-slate-800 uppercase">{complaint.status}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

