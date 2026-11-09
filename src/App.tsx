// d:\Project\TVK Admin\src\App.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Complaint,
  ComplaintStatus,
  PriorityLevel,
  CitizenProfile,
  WardRepresentative,
} from './types';
import {
  fetchAllComplaints,
  fetchCitizens,
  calculateDashboardStats,
  subscribeToComplaintsTable,
  assignComplaint,
  updateComplaintStatus,
  updateAdministrativeDetails,
  getSystemNotifications,
  exportComplaintsToCSV,
} from './services/adminService';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { ComplaintTable } from './components/ComplaintTable';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { AssignmentModal } from './components/AssignmentModal';
import { WardManager } from './components/WardManager';
import { RepManager } from './components/RepManager';
import { CategoryManager } from './components/CategoryManager';
import { AnalyticsView } from './components/AnalyticsView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin,
  TrendingUp,
  Percent,
  Layers,
  ShieldCheck,
  Send,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [citizens, setCitizens] = useState<CitizenProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDbLive, setIsDbLive] = useState<boolean>(false);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Modals & Drawers
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assigningComplaints, setAssigningComplaints] = useState<Complaint[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Load Data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [compList, citList] = await Promise.all([
        fetchAllComplaints(),
        fetchCitizens(),
      ]);

      setComplaints(compList);
      setCitizens(citList);
      setIsDbLive(true);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load & realtime subscription
  useEffect(() => {
    loadData();

    const unsubscribe = subscribeToComplaintsTable(() => {
      console.log('⚡ Live DB change detected on Supabase complaints table - Refreshing');
      loadData(true);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadData]);

  // Derived Stats
  const stats = useMemo(() => {
    return calculateDashboardStats(complaints, citizens.length);
  }, [complaints, citizens]);

  // Derived Notifications
  const notifications = useMemo(() => {
    return getSystemNotifications(complaints);
  }, [complaints]);

  // Handlers
  const handleAssignConfirm = async (params: {
    complaintIds: string[];
    repId: string;
    repName: string;
    instructions: string;
  }) => {
    for (const id of params.complaintIds) {
      await assignComplaint({
        complaintId: id,
        repId: params.repId,
        repName: params.repName,
        instructions: params.instructions,
      });
    }
    await loadData(true);
    if (selectedComplaint && params.complaintIds.includes(selectedComplaint.id)) {
      setSelectedComplaint((prev) =>
        prev
          ? {
              ...prev,
              assigned_admin_id: params.repId,
              admin_name: params.repName,
              status: 'assigned_to_ward_manager',
            }
          : null
      );
    }
  };

  const handleUpdateStatus = async (params: {
    status: ComplaintStatus;
    titleEn?: string;
    messageEn?: string;
    rejectedReason?: string;
    adminPhotos?: string[];
  }) => {
    if (!selectedComplaint) return;
    await updateComplaintStatus({
      complaintId: selectedComplaint.id,
      ...params,
    });
    await loadData(true);
    setSelectedComplaint((prev) => (prev ? { ...prev, status: params.status } : null));
  };

  const handleUpdateAdminDetails = (params: {
    priority?: PriorityLevel;
    internal_notes?: string;
    ward?: string;
    ward_verified?: boolean;
  }) => {
    if (!selectedComplaint) return;
    updateAdministrativeDetails({
      complaintId: selectedComplaint.id,
      ...params,
    });
    setComplaints((prev) =>
      prev.map((c) => (c.id === selectedComplaint.id ? { ...c, ...params } : c))
    );
    setSelectedComplaint((prev) => (prev ? { ...prev, ...params } : null));
  };

  const handleExportCSV = () => {
    exportComplaintsToCSV(complaints);
  };

  const openAssignModalForOne = (complaint: Complaint) => {
    setAssigningComplaints([complaint]);
  };

  const openAssignModalForBulk = (selectedIds: string[]) => {
    const list = complaints.filter((c) => selectedIds.includes(c.id));
    if (list.length > 0) setAssigningComplaints(list);
  };

  const unassignedList = useMemo(() => {
    return complaints.filter((c) => !c.assigned_admin_id && c.status === 'submitted');
  }, [complaints]);

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased overflow-hidden text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unassignedCount={stats.unassigned}
        urgentCount={complaints.filter((c) => c.priority === 'Urgent').length}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          title={
            currentTab === 'dashboard'
              ? 'Executive Command Dashboard'
              : currentTab === 'complaints'
              ? 'Central Grievance Repository'
              : currentTab === 'queue'
              ? 'Ward Assignment Dispatch Queue'
              : currentTab === 'wards'
              ? 'Manapparai Municipality Wards'
              : currentTab === 'representatives'
              ? 'Ward Representatives & Member Management'
              : currentTab === 'categories'
              ? 'Grievance Categories'
              : 'Real-Time Grievance Analytics'
          }
          subtitle="Manapparai TVK Grievance Redressal & Field Operations Management"
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          onRefresh={() => loadData(false)}
          isRefreshing={isRefreshing}
          onExport={handleExportCSV}
          unreadAlertsCount={notifications.length}
          onToggleNotifications={() => setIsNotificationsOpen(true)}
          isDbLive={isDbLive}
        />

        <main className="p-8 space-y-8 flex-1">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Primary KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Total Complaints"
                  value={stats.total}
                  subtitle={`${stats.receivedToday} received today`}
                  icon={FileText}
                  variant="blue"
                  onClick={() => setCurrentTab('complaints')}
                />
                <StatCard
                  title="Unassigned Queue"
                  value={stats.unassigned}
                  subtitle="Awaiting ward officer assignment"
                  icon={Clock}
                  variant="amber"
                  badge={stats.unassigned > 0 ? 'Action Required' : undefined}
                  onClick={() => setCurrentTab('queue')}
                />
                <StatCard
                  title="Field Work in Progress"
                  value={stats.inProgress + stats.assigned}
                  subtitle={`${stats.assigned} assigned · ${stats.inProgress} on-site`}
                  icon={TrendingUp}
                  variant="indigo"
                />
                <StatCard
                  title="Resolution Rate"
                  value={`${stats.resolutionPercentage}%`}
                  subtitle={`${stats.resolved} resolved (${stats.avgResolutionHours}h avg time)`}
                  icon={CheckCircle2}
                  variant="emerald"
                />
              </div>

              {/* Secondary Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      Registered Citizens
                    </div>
                    <div className="text-lg font-bold text-slate-900">{stats.totalCitizens}</div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      Municipal Wards
                    </div>
                    <div className="text-lg font-bold text-slate-900">{stats.totalWards}</div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      Active Field Reps
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {stats.activeRepresentatives}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      Overdue (&gt;48h)
                    </div>
                    <div className="text-lg font-bold text-rose-600">{stats.overdue}</div>
                  </div>
                </div>
              </div>

              {/* Fast Assignment Prompt Banner (If unassigned exist) */}
              {stats.unassigned > 0 && (
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-sm">
                        {stats.unassigned} New Complaints Awaiting Ward Officer Assignment
                      </h4>
                      <p className="text-xs text-amber-100">
                        Dispatch unassigned complaints to representatives to accelerate citizen turnaround.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('queue')}
                    className="px-4 py-2 bg-white text-amber-900 font-bold text-xs rounded-lg shadow hover:bg-amber-50 transition"
                  >
                    Open Assignment Queue →
                  </button>
                </div>
              )}

              {/* Main Complaints Stream Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Recent Grievances Stream</h3>
                  <button
                    onClick={() => setCurrentTab('complaints')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All {complaints.length} Records →
                  </button>
                </div>

                <ComplaintTable
                  complaints={complaints}
                  onSelectComplaint={setSelectedComplaint}
                  onOpenAssignModal={openAssignModalForOne}
                  onBulkAssign={openAssignModalForBulk}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ALL COMPLAINTS */}
          {currentTab === 'complaints' && (
            <div className="space-y-4">
              <ComplaintTable
                complaints={complaints}
                onSelectComplaint={setSelectedComplaint}
                onOpenAssignModal={openAssignModalForOne}
                onBulkAssign={openAssignModalForBulk}
              />
            </div>
          )}

          {/* TAB 3: ASSIGNMENT QUEUE */}
          {currentTab === 'queue' && (
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Unassigned Grievance Queue ({unassignedList.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Complaints submitted by citizens waiting for verified ward matching and representative assignment.
                  </p>
                </div>

                {unassignedList.length > 0 && (
                  <button
                    onClick={() => openAssignModalForBulk(unassignedList.map((c) => c.id))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                  >
                    Bulk Assign All ({unassignedList.length})
                  </button>
                )}
              </div>

              <ComplaintTable
                complaints={complaints}
                initialFilterStatus="unassigned"
                onSelectComplaint={setSelectedComplaint}
                onOpenAssignModal={openAssignModalForOne}
                onBulkAssign={openAssignModalForBulk}
              />
            </div>
          )}

          {/* TAB 4: WARD MANAGEMENT */}
          {currentTab === 'wards' && (
            <WardManager
              complaints={complaints}
              onOpenComplaintFilterByWard={(ward) => {
                setCurrentTab('complaints');
              }}
            />
          )}

          {/* TAB 5: WARD REPRESENTATIVES */}
          {currentTab === 'representatives' && <RepManager complaints={complaints} />}

          {/* TAB 6: CATEGORIES */}
          {currentTab === 'categories' && <CategoryManager complaints={complaints} />}

          {/* TAB 7: ANALYTICS */}
          {currentTab === 'analytics' && (
            <AnalyticsView
              complaints={complaints}
              dateFilter={dateFilter}
              onExport={handleExportCSV}
            />
          )}
        </main>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssign={async ({ repId, repName, instructions }) => {
            await handleAssignConfirm({
              complaintIds: [selectedComplaint.id],
              repId,
              repName,
              instructions: instructions || '',
            });
          }}
          onUpdateAdminDetails={handleUpdateAdminDetails}
        />
      )}

      {/* Assignment Modal */}
      {assigningComplaints.length > 0 && (
        <AssignmentModal
          complaints={assigningComplaints}
          onClose={() => setAssigningComplaints([])}
          onConfirmAssign={handleAssignConfirm}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onSelectComplaintId={(id) => {
          const found = complaints.find((c) => c.id === id);
          if (found) setSelectedComplaint(found);
        }}
      />
    </div>
  );
}
