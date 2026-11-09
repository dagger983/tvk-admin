-- ==============================================================================
-- MANAVAI TVK (V) OFFICIAL SUPABASE DATABASE SCHEMA (INTEGRATED PRODUCTION)
-- Covers:
--   1. app_config             -> Version Control & Maintenance Mode
--   2. profiles               -> Citizen Users
--   3. wards                  -> 12 Municipal Wards of Manapparai
--   4. ward_representatives   -> Ward Members / Reps with ID, Email, Phone, Password & Ward
--   5. complaints             -> Civic Grievances, Photos & Resolution Details
--   6. notifications          -> Citizen In-App Notifications & Alerts
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLE: app_config (Remote Version Control & Maintenance Mode Switch)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_config (
  id TEXT PRIMARY KEY DEFAULT 'app_settings',
  min_version TEXT DEFAULT '1.0.0' NOT NULL,
  latest_version TEXT DEFAULT '1.0.0' NOT NULL,
  force_update BOOLEAN DEFAULT false NOT NULL,
  update_url TEXT DEFAULT 'https://tvk.org.in/app-update' NOT NULL,
  update_title_ta TEXT DEFAULT 'புதிய பதிப்பு கிடைக்கிறது' NOT NULL,
  update_title_en TEXT DEFAULT 'New App Version Available' NOT NULL,
  update_message_ta TEXT DEFAULT 'MANAVAI TVK செயலியைத் தொடர்ந்து தடையின்றி பயன்படுத்த, புதிய பதிப்பிற்கு உடனடியாகப் புதுப்பிக்கவும்.' NOT NULL,
  update_message_en TEXT DEFAULT 'Please update to the latest version of MANAVAI TVK to continue using the app with new features and fixes.' NOT NULL,
  is_maintenance_mode BOOLEAN DEFAULT false NOT NULL,
  maintenance_title_ta TEXT DEFAULT 'சேவையக பராமரிப்பு பணியில் உள்ளது' NOT NULL,
  maintenance_title_en TEXT DEFAULT 'System Under Maintenance' NOT NULL,
  maintenance_message_ta TEXT DEFAULT 'சேவையக பராமரிப்பு மற்றும் தொழில்நுட்ப மேம்பாட்டு பணி நடைபெற்று வருகிறது. இன்னும் சில நாட்களில் செயலி மீண்டும் பயன்பாட்டுக்கு வரும். அவசர உதவிக்கு TVK மக்கள் சேவை மையத்தை தொடர்பு கொள்ளவும்.' NOT NULL,
  maintenance_message_en TEXT DEFAULT 'Our servers are currently undergoing scheduled maintenance. The app will be back online in a few days. For urgent assistance, please contact the TVK Helpline.' NOT NULL,
  helpline_phone TEXT DEFAULT '+917904950915' NOT NULL,
  helpline_whatsapp TEXT DEFAULT '+919042541054' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed app_config
INSERT INTO public.app_config (
  id, min_version, latest_version, force_update, update_url, is_maintenance_mode, helpline_phone, helpline_whatsapp
) VALUES (
  'app_settings', '1.0.0', '1.0.0', false, 'https://tvk.org.in/app-update', false, '+917904950915', '+919042541054'
) ON CONFLICT (id) DO UPDATE SET
  min_version = EXCLUDED.min_version,
  latest_version = EXCLUDED.latest_version;

-- ------------------------------------------------------------------------------
-- 2. TABLE: profiles (Citizen user accounts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  ward TEXT DEFAULT 'வார்டு 1',
  location TEXT DEFAULT 'மணப்பாறை',
  district TEXT DEFAULT 'திருச்சிராப்பள்ளி',
  fcm_token TEXT,
  preferred_language TEXT DEFAULT 'ta',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Seed default citizen profiles
INSERT INTO public.profiles (id, name, email, phone, ward, location, district, preferred_language)
VALUES 
  ('114812943299513325809', 'K Modha Vignesh', 'vicky03.exe@gmail.com', '+91 9442011620', 'வார்டு 1', 'மணப்பாறை', 'திருச்சிராப்பள்ளி', 'ta'),
  ('user_tvk_demo', 'Karthik Selvam', 'karthik.selvam@gmail.com', '+91 98765 43210', 'வார்டு 1', 'மணப்பாறை', 'திருச்சிராப்பள்ளி', 'ta')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. TABLE: wards (Manapparai Municipal Wards)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wards (
  id TEXT PRIMARY KEY,
  ward_number INT NOT NULL UNIQUE,
  ward_code TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  key_localities JSONB DEFAULT '[]'::jsonb NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  representative_id TEXT,
  representative_name TEXT,
  representative_phone TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed 12 Municipal Wards
INSERT INTO public.wards (id, ward_number, ward_code, name_en, name_ta, key_localities, center_lat, center_lng, representative_id, representative_name, representative_phone, is_active)
VALUES
  ('W01', 1, 'MNP-W01', 'Ward 1 - Gandhi Nagar & Bharathiyar Street', 'வார்டு 1 - காந்தி நகர் & பாரதியார் தெரு', '["Gandhi Nagar", "Bharathiyar Street", "Kamaraj Colony", "Weekly Market"]', 10.6052, 78.4231, 'REP-W01', 'M. Vijayakumar', '+91 9442011621', true),
  ('W02', 2, 'MNP-W02', 'Ward 2 - Old Bus Stand & Bazaar Street', 'வார்டு 2 - பழைய பேருந்து நிலையம் & பஜார்', '["Old Bus Stand", "Bazaar Street", "Post Office Road", "Big Mosque Area"]', 10.6083, 78.4255, 'REP-W02', 'S. Selvaraj', '+91 9442011622', true),
  ('W03', 3, 'MNP-W03', 'Ward 3 - Railway Station & Railway Colony', 'வார்டு 3 - ரயில்வே நிலையம் & காலனி', '["Railway Feeder Road", "Railway Colony", "Station Road", "Goods Shed Area"]', 10.6061, 78.4289, 'REP-W03', 'K. Anbalagan', '+91 9442011623', true),
  ('W04', 4, 'MNP-W04', 'Ward 4 - Anna Nagar & Anna Park', 'வார்டு 4 - அண்ணா நகர் & அண்ணா பூங்கா', '["Anna Nagar", "Anna Park", "Park Main Road", "VIP Nagar", "Teacher Colony"]', 10.6074, 78.4336, 'REP-W04', 'R. Senthil Kumar (TVK)', '+91 9442011624', true),
  ('W05', 5, 'MNP-W05', 'Ward 5 - Sevalur North & Kovilpatti Road', 'வார்டு 5 - செவலூர் வடக்கு & கோவில்பட்டி சாலை', '["Sevalur North", "Kovilpatti Road", "Mariamman Kovil St", "MGR Nagar"]', 10.6150, 78.4280, 'REP-W05', 'P. Murugesan', '+91 9442011625', true),
  ('W06', 6, 'MNP-W06', 'Ward 6 - Sevalur South & Checkpost Area', 'வார்டு 6 - செவலூர் தெற்கு & சோதனைச்சாவடி', '["Sevalur South", "Old Checkpost", "Panchayat Union Office", "Kaveri Street"]', 10.6180, 78.4240, 'REP-W06', 'A. Francis Xavier', '+91 9442011626', true),
  ('W07', 7, 'MNP-W07', 'Ward 7 - Dindigul Main Road & By-pass', 'வார்டு 7 - திண்டுக்கல் பிரதான சாலை & பைபாஸ்', '["Dindigul Road", "Four Road Junction", "Bypass Ring Road", "Murugan Talkies"]', 10.6010, 78.4270, 'REP-W07', 'G. Jayakumar', '+91 9442011627', true),
  ('W08', 8, 'MNP-W08', 'Ward 8 - Madurai Road & Chettiapatti', 'வார்டு 8 - மதுரை சாலை & செட்டியாபட்டி', '["Madurai Road", "Chettiapatti Road", "Kannan Nagar", "Government Hospital Cross"]', 10.5980, 78.4320, 'REP-W08', 'N. Radhakrishnan', '+91 9442011628', true),
  ('W09', 9, 'MNP-W09', 'Ward 9 - Government Hospital & Court Complex', 'வார்டு 9 - அரசு மருத்துவமனை & நீதிமன்ற வளாகம்', '["GH Main Road", "Court Complex Road", "Advocate Colony", "Taluk Office Road"]', 10.6025, 78.4360, 'REP-W09', 'M. Chelladurai', '+91 9442011629', true),
  ('W10', 10, 'MNP-W10', 'Ward 10 - SIDCO Industrial Estate & Viralimalai Rd', 'வார்டு 10 - சிட்கோ தொழிற்பேட்டை & விராலிமலை சாலை', '["SIDCO Industrial Area", "Viralimalai Main Road", "Small Scale Units", "Kamarajar Nagar"]', 10.6120, 78.4350, 'REP-W10', 'T. Sivakumar', '+91 9442011630', true),
  ('W11', 11, 'MNP-W11', 'Ward 11 - Usilampatti & Poolankulathupatti', 'வார்டு 11 - உசிலம்பட்டி & பூலாங்குளத்துப்பட்டி', '["Usilampatti", "Poolankulathupatti", "Amman Nagar", "Lake View Road"]', 10.6220, 78.4310, 'REP-W11', 'K. Muthusamy', '+91 9442011631', true),
  ('W12', 12, 'MNP-W12', 'Ward 12 - Ponnaniyar Road & New Bus Stand', 'வார்டு 12 - பொன்னணியாறு சாலை & புதிய பேருந்து நிலையம்', '["New Bus Stand", "Ponnaniyar Dam Road", "Depot Colony", "Uzhavar Santhai"]', 10.6090, 78.4375, 'REP-W12', 'V. Sundaram (TVK Lead)', '+91 9442011632', true)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ta = EXCLUDED.name_ta;

-- ------------------------------------------------------------------------------
-- 4. TABLE: ward_representatives (Ward Members with ID, Email, Phone, Password)
-- Admins can create, view plain password, edit password, reassign/unassign ward, or delete.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ward_representatives (
  id TEXT PRIMARY KEY,                                      -- e.g. 'REP-W01', 'REP-W02' or custom
  name TEXT NOT NULL,                                       -- Full Name
  phone TEXT NOT NULL,                                      -- Contact Phone Number
  email TEXT NOT NULL,                                      -- Login Email
  password TEXT NOT NULL DEFAULT 'tvk@rep123',              -- Login Password (Admin viewable & editable)
  ward_number INT,                                          -- Assigned Ward number (NULL if unassigned)
  ward_name TEXT,                                           -- Assigned Ward Name
  role TEXT DEFAULT 'Ward Representative' NOT NULL,         -- Designation / Role
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ward_reps_ward ON public.ward_representatives(ward_number);
CREATE INDEX IF NOT EXISTS idx_ward_reps_email ON public.ward_representatives(email);
CREATE INDEX IF NOT EXISTS idx_ward_reps_status ON public.ward_representatives(status);

-- Seed initial 12 Ward Representatives with IDs and Passwords
INSERT INTO public.ward_representatives (id, name, phone, email, password, ward_number, ward_name, role, status)
VALUES
  ('REP-W01', 'M. Vijayakumar', '+91 9442011621', 'rep.ward01@tvk.org.in', 'tvk@w01', 1, 'Ward 1 - Gandhi Nagar', 'Ward Representative', 'active'),
  ('REP-W02', 'S. Selvaraj', '+91 9442011622', 'rep.ward02@tvk.org.in', 'tvk@w02', 2, 'Ward 2 - Old Bus Stand', 'Ward Representative', 'active'),
  ('REP-W03', 'K. Anbalagan', '+91 9442011623', 'rep.ward03@tvk.org.in', 'tvk@w03', 3, 'Ward 3 - Railway Station', 'Ward Representative', 'active'),
  ('REP-W04', 'R. Senthil Kumar (TVK)', '+91 9442011624', 'rep.ward04@tvk.org.in', 'tvk@w04', 4, 'Ward 4 - Anna Nagar & Anna Park', 'Ward Secretary', 'active'),
  ('REP-W05', 'P. Murugesan', '+91 9442011625', 'rep.ward05@tvk.org.in', 'tvk@w05', 5, 'Ward 5 - Sevalur North', 'Ward Representative', 'active'),
  ('REP-W06', 'A. Francis Xavier', '+91 9442011626', 'rep.ward06@tvk.org.in', 'tvk@w06', 6, 'Ward 6 - Sevalur South', 'Ward Representative', 'active'),
  ('REP-W07', 'G. Jayakumar', '+91 9442011627', 'rep.ward07@tvk.org.in', 'tvk@w07', 7, 'Ward 7 - Dindigul Main Road', 'Ward Representative', 'active'),
  ('REP-W08', 'N. Radhakrishnan', '+91 9442011628', 'rep.ward08@tvk.org.in', 'tvk@w08', 8, 'Ward 8 - Madurai Road', 'Ward Representative', 'active'),
  ('REP-W09', 'M. Chelladurai', '+91 9442011629', 'rep.ward09@tvk.org.in', 'tvk@w09', 9, 'Ward 9 - Government Hospital', 'Ward Representative', 'active'),
  ('REP-W10', 'T. Sivakumar', '+91 9442011630', 'rep.ward10@tvk.org.in', 'tvk@w10', 10, 'Ward 10 - SIDCO Industrial Estate', 'Ward Representative', 'active'),
  ('REP-W11', 'K. Muthusamy', '+91 9442011631', 'rep.ward11@tvk.org.in', 'tvk@w11', 11, 'Ward 11 - Usilampatti', 'Ward Representative', 'active'),
  ('REP-W12', 'V. Sundaram (TVK Lead)', '+91 9442011632', 'rep.ward12@tvk.org.in', 'tvk@w12', 12, 'Ward 12 - Ponnaniyar Road & New Bus Stand', 'Field Inspection Lead', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  ward_number = EXCLUDED.ward_number,
  ward_name = EXCLUDED.ward_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 5. TABLE: complaints (Civic Grievances & Resolution Details)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  category_key TEXT,
  status TEXT DEFAULT 'submitted' NOT NULL CHECK (
    status IN (
      'submitted',
      'administrative_verification',
      'assigned_to_ward_manager',
      'field_inspection',
      'resolved',
      'rejected'
    )
  ),
  title_en TEXT NOT NULL,
  title_ta TEXT,
  desc_en TEXT NOT NULL,
  desc_ta TEXT,
  landmark_en TEXT NOT NULL,
  landmark_ta TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  google_maps_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb NOT NULL,
  alternate_phone TEXT,

  -- Admin workflow & Resolution fields
  assigned_admin_id TEXT REFERENCES public.ward_representatives(id) ON DELETE SET NULL,
  admin_name TEXT DEFAULT 'Ward Manager / TVK Grievance Cell',
  admin_status TEXT DEFAULT 'submitted' CHECK (
    admin_status IS NULL OR admin_status IN (
      'submitted',
      'administrative_verification',
      'assigned_to_ward_manager',
      'field_inspection',
      'resolved',
      'rejected'
    )
  ),
  admin_update_title_en TEXT,
  admin_update_title_ta TEXT,
  admin_update_message_en TEXT,
  admin_update_message_ta TEXT,
  admin_photos JSONB DEFAULT '[]'::jsonb NOT NULL,
  resolved_at TIMESTAMPTZ,
  rejected_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_admin_status ON public.complaints(admin_status);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_admin ON public.complaints(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- Seed verified sample complaint
INSERT INTO public.complaints (
  id, user_id, category, category_key, status,
  title_en, title_ta, desc_en, desc_ta,
  landmark_en, landmark_ta, latitude, longitude,
  photos, alternate_phone, assigned_admin_id, admin_name,
  admin_status, admin_update_title_en, admin_update_title_ta,
  admin_update_message_en, admin_update_message_ta,
  admin_photos, resolved_at
) VALUES (
  'TN-2026-322703',
  'user_tvk_demo',
  'streetLights',
  'streetLights',
  'resolved',
  'Broken Pole and Exposed Sparking Cables',
  'உடைந்த மின்கம்பம் மற்றும் ஆபத்தான மின் கம்பி',
  'Damaged concrete pole causing sparks during rain, high risk for school students.',
  'சேதமடைந்த கான்கிரீட் கம்பம் மழையின் போது தீப்பொறிகளை ஏற்படுத்துகிறது, பள்ளி மாணவர்களுக்கு ஆபத்து.',
  'Anna Park Main Road, Ward 4, Anna Nagar, Manapparai',
  'அண்ணா பூங்கா மெயின் ரோடு, வார்டு 4, அண்ணா நகர், மணப்பாறை',
  10.6074,
  78.4336,
  '["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"]'::jsonb,
  '+91 9442011624',
  'REP-W04',
  'R. Senthil Kumar (TVK)',
  'resolved',
  'Resolved by Municipal Electrical Crew',
  'மின்வாரிய ஊழியர்களால் சரிசெய்யப்பட்டது',
  'New composite electric pole installed, high tension cables insulated and power supply safely restored.',
  'புதிய மின்கம்பம் நடப்பட்டு, மின்கம்பிகள் மாற்றப்பட்டு மின் விநியோகம் சீரமைக்கப்பட்டது.',
  '["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80"]'::jsonb,
  timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. TABLE: notifications (Alerts sent to citizens)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ta TEXT,
  message_en TEXT NOT NULL,
  message_ta TEXT,
  icon TEXT DEFAULT 'notifications',
  icon_color TEXT DEFAULT '#D32F2F',
  is_unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Enables seamless SELECT, INSERT, UPDATE, DELETE for Apps
-- ------------------------------------------------------------------------------
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ward_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- app_config
DROP POLICY IF EXISTS "Allow public read access on app_config" ON public.app_config;
CREATE POLICY "Allow public read access on app_config" ON public.app_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write on app_config" ON public.app_config;
CREATE POLICY "Allow public write on app_config" ON public.app_config FOR ALL USING (true) WITH CHECK (true);

-- profiles
DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write on profiles" ON public.profiles;
CREATE POLICY "Allow public write on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- wards
DROP POLICY IF EXISTS "Allow public read on wards" ON public.wards;
CREATE POLICY "Allow public read on wards" ON public.wards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write on wards" ON public.wards;
CREATE POLICY "Allow public write on wards" ON public.wards FOR ALL USING (true) WITH CHECK (true);

-- ward_representatives (CRUD by Admin)
DROP POLICY IF EXISTS "Allow public read on ward_representatives" ON public.ward_representatives;
CREATE POLICY "Allow public read on ward_representatives" ON public.ward_representatives FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write on ward_representatives" ON public.ward_representatives;
CREATE POLICY "Allow public write on ward_representatives" ON public.ward_representatives FOR ALL USING (true) WITH CHECK (true);

-- complaints
DROP POLICY IF EXISTS "Allow public read access on complaints" ON public.complaints;
CREATE POLICY "Allow public read access on complaints" ON public.complaints FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write on complaints" ON public.complaints;
CREATE POLICY "Allow public write on complaints" ON public.complaints FOR ALL USING (true) WITH CHECK (true);

-- notifications
DROP POLICY IF EXISTS "Allow public read access on notifications" ON public.notifications;
CREATE POLICY "Allow public read access on notifications" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write on notifications" ON public.notifications;
CREATE POLICY "Allow public write on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. REALTIME REPLICATION (For live UI updates on Web & Mobile)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'app_config') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_config;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ward_representatives') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ward_representatives;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'wards') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wards;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'complaints') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

SELECT 'MANAVAI TVK Complete Database Schema (with Ward Representatives) Executed Successfully!' AS result;
