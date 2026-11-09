// d:\Project\TVK Admin\src\components\NotificationsDrawer.tsx
import React from 'react';
import { SystemNotification, Complaint } from '../types';
import { Bell, X, AlertTriangle, UserCheck, Clock, ExternalLink } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onSelectComplaintId: (id: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectComplaintId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">System Alerts & Notifications</h3>
            <span className="text-[10px] font-bold bg-blue-600 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-slate-600">All caught up!</p>
              <p>No pending alerts or urgent unassigned complaints.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUrgent = notif.type === 'urgent';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                    isUrgent
                      ? 'bg-red-50/70 border-red-200 hover:bg-red-50'
                      : 'bg-amber-50/70 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 ${
                        isUrgent ? 'text-red-700' : 'text-amber-800'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      {notif.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900">{notif.title}</div>
                  <p className="text-slate-600 leading-relaxed">{notif.message}</p>

                  {notif.complaint_id && (
                    <button
                      onClick={() => {
                        onSelectComplaintId(notif.complaint_id!);
                        onClose();
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 pt-1"
                    >
                      Open Complaint {notif.complaint_id} ↗
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

