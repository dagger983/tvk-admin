// d:\Project\TVK Admin\src\types\index.ts

export type ComplaintStatus =
  | 'submitted'
  | 'administrative_verification'
  | 'assigned_to_ward_manager'
  | 'field_inspection'
  | 'resolved'
  | 'rejected';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Complaint {
  id: string; // e.g. 'TN-2026-004821'
  user_id: string | null;
  category: string;
  category_key: string | null;
  status: ComplaintStatus;
  title_en: string;
  title_ta: string | null;
  desc_en: string;
  desc_ta: string | null;
  landmark_en: string;
  landmark_ta: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  photos: string[];
  alternate_phone: string | null;

  // Assignment & Admin
  assigned_admin_id: string | null;
  admin_name: string | null;
  admin_status: ComplaintStatus | null;
  admin_update_title_en: string | null;
  admin_update_title_ta: string | null;
  admin_update_message_en: string | null;
  admin_update_message_ta: string | null;
  admin_photos: string[];
  resolved_at: string | null;
  rejected_reason: string | null;

  // Metadata
  created_at: string;
  updated_at: string;

  // Enriched attributes (ward detection, priority, internal notes)
  ward?: string;
  detected_ward?: string;
  ward_verified?: boolean;
  priority?: PriorityLevel;
  internal_notes?: string;
  assigned_rep_name?: string;
  assigned_at?: string;
  citizen_name?: string;
  citizen_phone?: string;
}

export interface CitizenProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  ward: string | null;
  location: string | null;
  district: string | null;
  fcm_token: string | null;
  preferred_language: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: string;
  ward_number: number;
  ward_code: string;
  name_en: string;
  name_ta: string;
  key_localities: string[];
  center_lat: number;
  center_lng: number;
  representative_id: string;
  representative_name: string;
  representative_phone: string;
  is_active: boolean;
  total_complaints?: number;
  pending_complaints?: number;
  resolved_complaints?: number;
  overdue_complaints?: number;
  resolution_rate?: number;
}

export interface WardRepresentative {
  id: string; // e.g. 'REP-W04' or custom ID
  name: string;
  phone: string;
  email: string;
  password?: string;
  role?: string;
  ward_number: number | null;
  ward_name: string | null;
  status: 'active' | 'inactive';
  assigned_count?: number;
  acknowledged_count?: number;
  in_progress_count?: number;
  resolved_count?: number;
  overdue_count?: number;
  avg_resolution_hours?: number;
  last_active?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryItem {
  id: string;
  key: string;
  name_en: string;
  name_ta: string;
  icon: string;
  is_active: boolean;
  total_count: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  acting_user: string;
  action: string;
  complaint_id?: string;
  affected_record: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface SystemNotification {
  id: string;
  type: 'urgent' | 'unassigned' | 'overdue' | 'resolved' | 'new';
  title: string;
  message: string;
  timestamp: string;
  complaint_id?: string;
  is_read: boolean;
}

