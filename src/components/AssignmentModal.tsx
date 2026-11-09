// d:\Project\TVK Admin\src\components\AssignmentModal.tsx
import React, { useState } from 'react';
import { Complaint, WardRepresentative } from '../types';
import { X, UserPlus, AlertTriangle, Send, Check } from 'lucide-react';
import { INITIAL_REPRESENTATIVES } from '../data/manapparaiWards';

interface AssignmentModalProps {
  complaints: Complaint[];
  onClose: () => void;
  onConfirmAssign: (params: {
    complaintIds: string[];
    repId: string;
    repName: string;
    instructions: string;
  }) => Promise<void>;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  complaints,
  onClose,
  onConfirmAssign,
}) => {
  const [selectedRepId, setSelectedRepId] = useState<string>('REP-W04');
  const [instructions, setInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedRep = INITIAL_REPRESENTATIVES.find(r => r.id === selectedRepId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRep) return;

    setIsSubmitting(true);
    try {
      await onConfirmAssign({
        complaintIds: complaints.map(c => c.id),
        repId: selectedRep.id,
        repName: selectedRep.name,
        instructions,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              {complaints.length > 1
                ? `Bulk Assign ${complaints.length} Complaints`
                : `Assign Complaint: ${complaints[0]?.id}`}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target complaints pills */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Target Complaints ({complaints.length})
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {complaints.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-semibold text-[11px]"
                >
                  {c.id}
                </span>
              ))}
            </div>
          </div>

          {/* Representative selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Assign To Ward Representative
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
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Warning: This representative is currently marked as Inactive.</span>
            </div>
          )}

          {/* Instructions */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Assignment Instructions / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide priority instructions, contact directions, or target completion time..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

