// d:\Project\TVK Admin\src\services\adminService.ts
import { supabase } from './supabase';
import { Complaint, ComplaintStatus, CitizenProfile, PriorityLevel, AuditLogItem, SystemNotification, WardRepresentative } from '../types';
import { MANAPPARAI_WARDS, INITIAL_REPRESENTATIVES, identifyWardForComplaint } from '../data/manapparaiWards';

const AUDIT_STORAGE_KEY = 'tvk_admin_audit_logs';
const NOTIF_STORAGE_KEY = 'tvk_admin_notifications';
const ENRICHED_COMPLAINT_KEY = 'tvk_admin_complaint_enrichment';
const REPS_STORAGE_KEY = 'tvk_admin_representatives_cache';

function getStoredRepresentatives(): WardRepresentative[] | null {
  try {
    const raw = localStorage.getItem(REPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredRepresentatives(reps: WardRepresentative[]) {
  try {
    localStorage.setItem(REPS_STORAGE_KEY, JSON.stringify(reps));
  } catch (e) {
    console.warn('Could not cache reps', e);
  }
}

/**
 * Fetch all Ward Representatives from Supabase with fallback to cache/defaults
 */
export async function fetchRepresentativesFromDb(complaints: Complaint[] = []): Promise<WardRepresentative[]> {
  try {
    const { data, error } = await supabase
      .from('ward_representatives')
      .select('*')
      .order('ward_number', { ascending: true, nullsFirst: false });

    let rawReps: WardRepresentative[] = [];

    if (!error && Array.isArray(data) && data.length > 0) {
      rawReps = data;
    } else {
      const cached = getStoredRepresentatives();
      if (cached && cached.length > 0) {
        rawReps = cached;
      } else {
        rawReps = INITIAL_REPRESENTATIVES.map(r => ({
          ...r,
          password: `tvk@w${String(r.ward_number || '01').padStart(2, '0')}`,
          role: (r as any).role || (r.ward_number === 4 ? 'Ward Secretary' : r.ward_number === 12 ? 'Field Inspection Lead' : 'Ward Representative'),
        }));
      }
    }

    // Enrich with dynamic live complaint workload counts
    const enriched = rawReps.map((rep) => {
      const assigned = complaints.filter(c => c.assigned_admin_id === rep.id || c.admin_name === rep.name);
      const inProg = assigned.filter(c => c.status === 'assigned_to_ward_manager' || c.status === 'field_inspection').length;
      const res = assigned.filter(c => c.status === 'resolved').length;
      const overdue = assigned.filter(c => {
        const h = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 3600);
        return c.status !== 'resolved' && c.status !== 'rejected' && h > 48;
      }).length;

      return {
        ...rep,
        assigned_count: assigned.length > 0 ? assigned.length : (rep.assigned_count ?? 0),
        in_progress_count: assigned.length > 0 ? inProg : (rep.in_progress_count ?? 0),
        resolved_count: assigned.length > 0 ? res : (rep.resolved_count ?? 0),
        overdue_count: assigned.length > 0 ? overdue : (rep.overdue_count ?? 0),
        last_active: rep.last_active || 'Online',
      };
    });

    saveStoredRepresentatives(enriched);
    return enriched;
  } catch (err) {
    console.warn('fetchRepresentativesFromDb error, falling back:', err);
    const cached = getStoredRepresentatives();
    return cached && cached.length > 0 ? cached : INITIAL_REPRESENTATIVES;
  }
}

/**
 * Create a new Ward Representative in Supabase and local cache
 */
export async function createRepresentativeInDb(rep: WardRepresentative): Promise<{ success: boolean; data?: WardRepresentative; error?: string }> {
  try {
    const payload = {
      id: rep.id,
      name: rep.name,
      phone: rep.phone,
      email: rep.email,
      password: rep.password || 'tvk@rep123',
      ward_number: rep.ward_number,
      ward_name: rep.ward_name,
      role: rep.role || 'Ward Representative',
      status: rep.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ward_representatives')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase create rep warning (will use local cache):', error.message);
    }

    // Always update local cache
    const current = getStoredRepresentatives() || INITIAL_REPRESENTATIVES;
    const updated = [payload as WardRepresentative, ...current.filter(r => r.id !== payload.id)];
    saveStoredRepresentatives(updated);

    return { success: true, data: (data || payload) as WardRepresentative };
  } catch (e: any) {
    console.error('createRepresentativeInDb exception:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Update an existing Ward Representative in Supabase and local cache
 */
export async function updateRepresentativeInDb(id: string, updates: Partial<WardRepresentative>): Promise<{ success: boolean; error?: string }> {
  try {
    const dbPayload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('ward_representatives')
      .update(dbPayload)
      .eq('id', id);

    if (error) {
      console.warn('Supabase update rep warning (will use local cache):', error.message);
    }

    // Always update local cache
    const current = getStoredRepresentatives() || INITIAL_REPRESENTATIVES;
    const updated = current.map(r => r.id === id ? { ...r, ...updates } : r);
    saveStoredRepresentatives(updated);

    return { success: true };
  } catch (e: any) {
    console.error('updateRepresentativeInDb exception:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Delete a Ward Representative permanently from Supabase and local cache
 */
export async function deleteRepresentativeInDb(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ward_representatives')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase delete rep warning (will use local cache):', error.message);
    }

    // Always update local cache
    const current = getStoredRepresentatives() || INITIAL_REPRESENTATIVES;
    const updated = current.filter(r => r.id !== id);
    saveStoredRepresentatives(updated);

    return { success: true };
  } catch (e: any) {
    console.error('deleteRepresentativeInDb exception:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Realtime subscription to ward_representatives table
 */
export function subscribeToRepresentatives(onChange: () => void) {
  const channel = supabase
    .channel('ward_representatives_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ward_representatives' },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export interface DashboardStats {
  total: number;
  newReview: number;
  unassigned: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  overdue: number;
  receivedToday: number;
  receivedThisWeek: number;
  receivedThisMonth: number;
  totalCitizens: number;
  totalWards: number;
  activeRepresentatives: number;
  avgResolutionHours: number;
  resolutionPercentage: number;
}

// Local storage helpers for client-side enrichment & resilient persistence
function getStoredEnrichment(): Record<string, { priority?: PriorityLevel; internal_notes?: string; ward?: string; ward_verified?: boolean }> {
  try {
    const raw = localStorage.getItem(ENRICHED_COMPLAINT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveEnrichment(id: string, data: Partial<{ priority: PriorityLevel; internal_notes: string; ward: string; ward_verified: boolean }>) {
  try {
    const all = getStoredEnrichment();
    all[id] = { ...all[id], ...data };
    localStorage.setItem(ENRICHED_COMPLAINT_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Could not save enrichment', e);
  }
}

/**
 * Fetch all complaints live from Supabase & enrich them
 */
export async function fetchAllComplaints(): Promise<Complaint[]> {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchAllComplaints error:', error.message);
      return [];
    }

    const enrichment = getStoredEnrichment();

    // Fetch profiles for citizen names
    const { data: profiles } = await supabase.from('profiles').select('id, name, phone, ward');
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const enriched: Complaint[] = (data || []).map((row: any) => {
      const extra = enrichment[row.id] || {};
      const citizen = row.user_id ? profileMap.get(row.user_id) : null;

      // Identify ward automatically
      const wardIdRes = identifyWardForComplaint({
        lat: row.latitude,
        lng: row.longitude,
        landmark: row.landmark_en || row.landmark_ta,
        citizenWard: citizen?.ward,
        title: row.title_en,
        description: row.desc_en,
      });

      const assignedWardNum = extra.ward ? parseInt(extra.ward.replace(/\D/g, ''), 10) || wardIdRes.wardNumber : wardIdRes.wardNumber;
      const wardObj = MANAPPARAI_WARDS.find(w => w.ward_number === assignedWardNum);

      return {
        id: row.id,
        user_id: row.user_id,
        category: row.category,
        category_key: row.category_key || row.category,
        status: (row.status || 'submitted') as ComplaintStatus,
        title_en: row.title_en,
        title_ta: row.title_ta,
        desc_en: row.desc_en,
        desc_ta: row.desc_ta,
        landmark_en: row.landmark_en,
        landmark_ta: row.landmark_ta,
        latitude: row.latitude,
        longitude: row.longitude,
        google_maps_url: row.google_maps_url,
        photos: Array.isArray(row.photos) ? row.photos : [],
        alternate_phone: row.alternate_phone,
        assigned_admin_id: row.assigned_admin_id,
        admin_name: row.admin_name,
        admin_status: row.admin_status,
        admin_update_title_en: row.admin_update_title_en,
        admin_update_title_ta: row.admin_update_title_ta,
        admin_update_message_en: row.admin_update_message_en,
        admin_update_message_ta: row.admin_update_message_ta,
        admin_photos: Array.isArray(row.admin_photos) ? row.admin_photos : [],
        resolved_at: row.resolved_at,
        rejected_reason: row.rejected_reason,
        created_at: row.created_at,
        updated_at: row.updated_at,

        // Enriched
        ward: extra.ward || (wardObj ? `Ward ${wardObj.ward_number} - ${wardObj.key_localities[0] || 'Central'}` : `Ward ${wardIdRes.wardNumber}`),
        detected_ward: wardIdRes.wardName,
        ward_verified: extra.ward_verified !== undefined ? extra.ward_verified : (wardIdRes.confidence !== 'Verification Required'),
        priority: extra.priority || (row.category === 'drainage' || row.category === 'water' ? 'High' : 'Medium'),
        internal_notes: extra.internal_notes || '',
        assigned_rep_name: row.admin_name || (row.assigned_admin_id ? 'Assigned Representative' : undefined),
        citizen_name: citizen?.name || 'Citizen',
        citizen_phone: citizen?.phone || row.alternate_phone || 'N/A',
      };
    });

    return enriched;
  } catch (err) {
    console.error('fetchAllComplaints exception:', err);
    return [];
  }
}

/**
 * Realtime subscription to complaints table
 */
export function subscribeToComplaintsTable(onChange: () => void) {
  if (!supabase || !supabase.channel) return () => {};

  const channel = supabase
    .channel('admin_complaints_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch all registered citizens / profiles
 */
export async function fetchCitizens(): Promise<CitizenProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('fetchCitizens error:', e);
    return [];
  }
}

/**
 * Calculate dynamic Dashboard Statistics from actual database complaints
 */
export function calculateDashboardStats(
  complaints: Complaint[],
  citizensCount: number = 0
): DashboardStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let newReview = 0;
  let unassigned = 0;
  let assigned = 0;
  let inProgress = 0;
  let resolved = 0;
  let rejected = 0;
  let overdue = 0;
  let receivedToday = 0;
  let receivedThisWeek = 0;
  let receivedThisMonth = 0;
  let totalResolutionHours = 0;
  let resolvedWithTimeCount = 0;

  for (const c of complaints) {
    const createdTime = new Date(c.created_at).getTime();
    if (createdTime >= todayStart) receivedToday++;
    if (createdTime >= weekStart) receivedThisWeek++;
    if (createdTime >= monthStart) receivedThisMonth++;

    const isAssigned = !!c.assigned_admin_id;
    const s = (c.status || '').toLowerCase();

    if (s === 'submitted' || s === 'administrative_verification') {
      newReview++;
      if (!isAssigned) unassigned++;
    } else if (s === 'assigned_to_ward_manager') {
      assigned++;
    } else if (s === 'field_inspection') {
      inProgress++;
    } else if (s === 'resolved') {
      resolved++;
      if (c.resolved_at) {
        const resolvedTime = new Date(c.resolved_at).getTime();
        const diffHours = (resolvedTime - createdTime) / (1000 * 60 * 60);
        if (diffHours > 0) {
          totalResolutionHours += diffHours;
          resolvedWithTimeCount++;
        }
      }
    } else if (s === 'rejected') {
      rejected++;
    }

    // Overdue calculation: not resolved or rejected, and created > 48 hours ago
    const hoursElapsed = (now.getTime() - createdTime) / (1000 * 60 * 60);
    if (s !== 'resolved' && s !== 'rejected' && hoursElapsed > 48) {
      overdue++;
    }
  }

  const total = complaints.length;
  const resolutionPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgResolutionHours =
    resolvedWithTimeCount > 0
      ? Math.round(totalResolutionHours / resolvedWithTimeCount)
      : 24;

  const activeReps = INITIAL_REPRESENTATIVES.filter(r => r.status === 'active').length;

  return {
    total,
    newReview,
    unassigned,
    assigned,
    inProgress,
    resolved,
    rejected,
    overdue,
    receivedToday,
    receivedThisWeek,
    receivedThisMonth,
    totalCitizens: Math.max(citizensCount, 1),
    totalWards: MANAPPARAI_WARDS.length,
    activeRepresentatives: activeReps,
    avgResolutionHours,
    resolutionPercentage,
  };
}

/**
 * Assign a complaint to a Ward Representative
 */
export async function assignComplaint(params: {
  complaintId: string;
  repId: string;
  repName: string;
  repPhone?: string;
  instructions?: string;
  actingUser?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { complaintId, repId, repName, instructions, actingUser = 'System Administrator' } = params;

    const updates = {
      assigned_admin_id: repId,
      admin_name: repName,
      status: 'assigned_to_ward_manager',
      admin_status: 'assigned_to_ward_manager',
      admin_update_title_en: 'Assigned to Ward Representative',
      admin_update_title_ta: 'வார்டு பிரதிநிதிக்கு ஒதுக்கப்பட்டது',
      admin_update_message_en: instructions || `Assigned to ${repName} for immediate on-site inspection.`,
      admin_update_message_ta: instructions || `${repName} வார்டு பிரதிநிதிக்கு கள ஆய்விற்காக ஒதுக்கப்பட்டுள்ளது.`,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', complaintId);

    if (error) throw error;

    // Record audit log
    addAuditLog({
      acting_user: actingUser,
      action: 'Assign Complaint',
      complaint_id: complaintId,
      affected_record: `Complaint ${complaintId}`,
      details: `Assigned to ${repName} (${repId}). Note: ${instructions || 'None'}`,
    });

    // Create In-App Notification in DB
    try {
      await supabase.from('notifications').insert({
        complaint_id: complaintId,
        title_en: 'Complaint Assigned',
        title_ta: 'புகார் ஒதுக்கப்பட்டது',
        message_en: `Your complaint ${complaintId} has been assigned to ${repName}.`,
        message_ta: `உங்கள் புகார் ${complaintId} வார்டு பிரதிநிதி ${repName}-க்கு ஒதுக்கப்பட்டுள்ளது.`,
        is_unread: true,
      });
    } catch {
      // Quiet fail if notifications table has strict FK
    }

    return { success: true };
  } catch (err: any) {
    console.error('assignComplaint error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update complaint status & resolution details
 */
export async function updateComplaintStatus(params: {
  complaintId: string;
  status: ComplaintStatus;
  actingUser?: string;
  titleEn?: string;
  titleTa?: string;
  messageEn?: string;
  messageTa?: string;
  rejectedReason?: string;
  adminPhotos?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      complaintId,
      status,
      actingUser = 'Administrator',
      titleEn,
      titleTa,
      messageEn,
      messageTa,
      rejectedReason,
      adminPhotos = [],
    } = params;

    const updates: any = {
      status,
      admin_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.admin_photos = adminPhotos;
      updates.admin_update_title_en = titleEn || 'Grievance Resolved Successfully';
      updates.admin_update_title_ta = titleTa || 'பிரச்சினை வெற்றிகரமாக தீர்க்கப்பட்டது';
      updates.admin_update_message_en = messageEn || 'Field team inspected and completed resolution work.';
      updates.admin_update_message_ta = messageTa || 'கள ஆய்வுக் குழுவினர் சம்பவ இடத்தில் ஆய்வு செய்து தீர்வை உறுதிப்படுத்தியுள்ளனர்.';
    } else if (status === 'rejected') {
      updates.rejected_reason = rejectedReason || messageEn || 'Rejected after verification';
      updates.admin_update_title_en = titleEn || 'Complaint Rejected';
      updates.admin_update_title_ta = titleTa || 'புகார் நிராகரிக்கப்பட்டது';
      updates.admin_update_message_en = rejectedReason || 'Complaint does not fall under municipal jurisdiction.';
      updates.admin_update_message_ta = rejectedReason || 'நகராட்சி கட்டுப்பாட்டிற்கு உட்படாத புகார்.';
      updates.admin_photos = [];
    } else if (status === 'field_inspection') {
      updates.admin_update_title_en = titleEn || 'Field Inspection & Maintenance In Progress';
      updates.admin_update_title_ta = titleTa || 'கள ஆய்வு & பராமரிப்பு பணி நடப்பில் உள்ளது';
      updates.admin_update_message_en = messageEn || 'Field workers and equipment deployed to location.';
      updates.admin_update_message_ta = messageTa || 'களப் பணியாளர்கள் சம்பவ இடத்திற்கு சென்று சீரமைப்புப் பணிகளை தொடங்கியுள்ளனர்.';
    }

    const { error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', complaintId);

    if (error) throw error;

    addAuditLog({
      acting_user: actingUser,
      action: `Status changed to ${status}`,
      complaint_id: complaintId,
      affected_record: `Complaint ${complaintId}`,
      details: `Status updated to ${status}. Notes: ${messageEn || rejectedReason || 'N/A'}`,
    });

    return { success: true };
  } catch (err: any) {
    console.error('updateComplaintStatus error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update administrative fields (priority, internal notes, ward)
 */
export function updateAdministrativeDetails(params: {
  complaintId: string;
  priority?: PriorityLevel;
  internal_notes?: string;
  ward?: string;
  ward_verified?: boolean;
  actingUser?: string;
}) {
  const { complaintId, priority, internal_notes, ward, ward_verified, actingUser = 'Administrator' } = params;
  saveEnrichment(complaintId, { priority, internal_notes, ward, ward_verified });

  addAuditLog({
    acting_user: actingUser,
    action: 'Updated Admin Metadata',
    complaint_id: complaintId,
    affected_record: `Complaint ${complaintId}`,
    details: `Updated Priority: ${priority || 'Unchanged'}, Ward: ${ward || 'Unchanged'}, Notes modified.`,
  });
}

/**
 * Audit Logging
 */
export function getAuditLogs(): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      const initialLogs: AuditLogItem[] = [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          acting_user: 'Super Admin',
          action: 'Ward Representative Assigned',
          complaint_id: 'TN-2026-004821',
          affected_record: 'Complaint TN-2026-004821',
          details: 'Assigned to R. Senthil Kumar (Ward 4 Representative)',
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          acting_user: 'Admin Desk',
          action: 'Ward Verification Confirmed',
          complaint_id: 'TN-2026-004821',
          affected_record: 'Ward 4 - Anna Nagar',
          details: 'Verified Anna Park location coordinates to Ward 4',
        },
        {
          id: 'log-3',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          acting_user: 'System Admin',
          action: 'Ward Boundary Sync',
          affected_record: 'Manapparai Wards 1-12',
          details: 'Synchronized 12 Municipal Wards and Representatives roster',
        },
      ];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addAuditLog(entry: Omit<AuditLogItem, 'id' | 'timestamp'>) {
  try {
    const logs = getAuditLogs();
    const newLog: AuditLogItem = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 200 logs
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.warn('Could not save audit log', e);
  }
}

/**
 * System Alerts & Notifications
 */
export function getSystemNotifications(complaints: Complaint[]): SystemNotification[] {
  const notifs: SystemNotification[] = [];

  for (const c of complaints) {
    if (c.priority === 'Urgent' && c.status !== 'resolved') {
      notifs.push({
        id: `notif-urgent-${c.id}`,
        type: 'urgent',
        title: `Urgent Complaint: ${c.id}`,
        message: `${c.title_en} (${c.ward || 'Ward Verification Needed'}) requires immediate attention.`,
        timestamp: c.created_at,
        complaint_id: c.id,
        is_read: false,
      });
    }

    if (!c.assigned_admin_id && c.status === 'submitted') {
      notifs.push({
        id: `notif-unassigned-${c.id}`,
        type: 'unassigned',
        title: `Unassigned Complaint: ${c.id}`,
        message: `Complaint received from ${c.landmark_en || 'Citizen'} awaiting representative assignment.`,
        timestamp: c.created_at,
        complaint_id: c.id,
        is_read: false,
      });
    }
  }

  return notifs;
}

/**
 * Export filtered complaints dataset to CSV format
 */
export function exportComplaintsToCSV(complaints: Complaint[]): void {
  const headers = [
    'Complaint ID',
    'Date Submitted',
    'Status',
    'Priority',
    'Category',
    'Ward',
    'Landmark / Location',
    'Citizen Name',
    'Citizen Phone',
    'Assigned Representative',
    'Title (EN)',
    'Description (EN)',
    'Latitude',
    'Longitude',
    'Resolved At',
  ];

  const escapeCSV = (str: string | null | undefined) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = complaints.map(c => [
    escapeCSV(c.id),
    escapeCSV(new Date(c.created_at).toLocaleDateString()),
    escapeCSV(c.status),
    escapeCSV(c.priority || 'Medium'),
    escapeCSV(c.category),
    escapeCSV(c.ward),
    escapeCSV(c.landmark_en),
    escapeCSV(c.citizen_name),
    escapeCSV(c.citizen_phone),
    escapeCSV(c.assigned_rep_name || 'Unassigned'),
    escapeCSV(c.title_en),
    escapeCSV(c.desc_en),
    escapeCSV(c.latitude?.toString()),
    escapeCSV(c.longitude?.toString()),
    escapeCSV(c.resolved_at || 'Pending'),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tvk_complaints_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

