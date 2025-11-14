-- Migration: Create subjects and activity_types tables
-- File: supabase_create_subjects_and_activity_types.sql
-- Date: 2025-11-14
-- Description: Creates database tables and functions for managing subjects and activity types
-- Access: All roles can use data in forms, only admin can manage via dashboard

-- ====== CREATE SUBJECTS TABLE ======
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL DEFAULT '📚',
    color VARCHAR(7) NOT NULL DEFAULT '#4ECDC4',
    bg_color VARCHAR(7) NOT NULL DEFAULT '#E0F7F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====== CREATE ACTIVITY_TYPES TABLE ======
CREATE TABLE IF NOT EXISTS activity_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL DEFAULT '📝',
    color VARCHAR(7) NOT NULL DEFAULT '#A29BFE',
    bg_color VARCHAR(7) NOT NULL DEFAULT '#F4F1FF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====== INSERT DEFAULT SUBJECTS ======
INSERT INTO subjects (name, icon, color, bg_color) VALUES
('Forensik Digital I', '🔍', '#FF6B6B', '#FFE8E8'),
('Etos Sandi V', '🔐', '#4ECDC4', '#E0F7F6'),
('Tata Kelola Keamanan Siber', '🛡️', '#FFD93D', '#FFF9E6'),
('Analisis Aplikasi Berbahaya', '🦠', '#6C5CE7', '#F3E9FF'),
('Etika Profesi', '⚖️', '#A29BFE', '#F4F1FF'),
('Statistika dan Probabilitas', '📊', '#00B894', '#E8F8F0'),
('Sistem Operasi Keamanan', '💻', '#E17055', '#FFECEB')
ON CONFLICT (name) DO NOTHING;

-- ====== INSERT DEFAULT ACTIVITY_TYPES ======
INSERT INTO activity_types (name, icon, color, bg_color) VALUES
('Lomba', '🏆', '#FF6B6B', '#FFE8E8'),
('IK', '🎓', '#4ECDC4', '#E0F7F6'),
('POLTEK', '🏫', '#6C5CE7', '#F3E9FF'),
('Luar', '🌍', '#FFD93D', '#FFF9E6'),
('Lainnya', '📝', '#A29BFE', '#F4F1FF')
ON CONFLICT (name) DO NOTHING;

-- ====== CREATE INDEXES FOR PERFORMANCE ======
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);
CREATE INDEX IF NOT EXISTS idx_activity_types_name ON activity_types(name);
CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON subjects(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_types_created_at ON activity_types(created_at);

-- ====== UPDATE TRIGGER FOR updated_at ======
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to subjects table
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to activity_types table
DROP TRIGGER IF EXISTS update_activity_types_updated_at ON activity_types;
CREATE TRIGGER update_activity_types_updated_at
    BEFORE UPDATE ON activity_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====== ROW LEVEL SECURITY (RLS) POLICIES ======
-- Enable RLS on both tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;

-- Policy for subjects: Allow all operations for authenticated users, but controlled by app logic
CREATE POLICY "Allow all operations for authenticated users on subjects"
ON subjects FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for activity_types: Allow all operations for authenticated users, but controlled by app logic
CREATE POLICY "Allow all operations for authenticated users on activity_types"
ON activity_types FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for subjects: Allow read access for anonymous users
CREATE POLICY "Allow read access for anonymous users on subjects"
ON subjects FOR SELECT
TO anon
USING (true);

-- Policy for activity_types: Allow read access for anonymous users
CREATE POLICY "Allow read access for anonymous users on activity_types"
ON activity_types FOR SELECT
TO anon
USING (true);

-- ====== HELPER FUNCTIONS ======
-- Function to get all subjects
CREATE OR REPLACE FUNCTION get_all_subjects()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    icon VARCHAR(10),
    color VARCHAR(7),
    bg_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, name, icon, color, bg_color, created_at
    FROM subjects
    ORDER BY name ASC;
$$;

-- Function to get all activity types
CREATE OR REPLACE FUNCTION get_all_activity_types()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    icon VARCHAR(10),
    color VARCHAR(7),
    bg_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, name, icon, color, bg_color, created_at
    FROM activity_types
    ORDER BY name ASC;
$$;

-- Function to add new subject
CREATE OR REPLACE FUNCTION add_subject(
    subject_name VARCHAR(255),
    subject_icon VARCHAR(10),
    subject_color VARCHAR(7),
    subject_bg_color VARCHAR(7)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_subject_id UUID;
BEGIN
    INSERT INTO subjects (name, icon, color, bg_color)
    VALUES (subject_name, subject_icon, subject_color, subject_bg_color)
    RETURNING id INTO new_subject_id;
    
    RETURN new_subject_id;
END;
$$;

-- Function to add new activity type
CREATE OR REPLACE FUNCTION add_activity_type(
    activity_type_name VARCHAR(255),
    activity_type_icon VARCHAR(10),
    activity_type_color VARCHAR(7),
    activity_type_bg_color VARCHAR(7)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_activity_type_id UUID;
BEGIN
    INSERT INTO activity_types (name, icon, color, bg_color)
    VALUES (activity_type_name, activity_type_icon, activity_type_color, activity_type_bg_color)
    RETURNING id INTO new_activity_type_id;
    
    RETURN new_activity_type_id;
END;
$$;

-- Function to delete subject by id
CREATE OR REPLACE FUNCTION delete_subject_by_id(subject_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM subjects WHERE id = subject_id;
    RETURN FOUND;
END;
$$;

-- Function to delete activity type by id
CREATE OR REPLACE FUNCTION delete_activity_type_by_id(activity_type_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM activity_types WHERE id = activity_type_id;
    RETURN FOUND;
END;
$$;

-- ====== GRANT PERMISSIONS ======
-- Grant usage on functions to authenticated users (access controlled by app logic)
GRANT EXECUTE ON FUNCTION get_all_subjects() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_activity_types() TO authenticated;
GRANT EXECUTE ON FUNCTION add_subject(VARCHAR(255), VARCHAR(10), VARCHAR(7), VARCHAR(7)) TO authenticated;
GRANT EXECUTE ON FUNCTION add_activity_type(VARCHAR(255), VARCHAR(10), VARCHAR(7), VARCHAR(7)) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_subject_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_activity_type_by_id(UUID) TO authenticated;

-- Grant read access to anonymous users for helper functions
GRANT EXECUTE ON FUNCTION get_all_subjects() TO anon;
GRANT EXECUTE ON FUNCTION get_all_activity_types() TO anon;

-- Note: Access Control Strategy:
-- - ALL authenticated users can read subjects and activity types (for form dropdowns)
-- - ALL authenticated users can technically call CRUD functions (database level)
-- - BUT only ADMIN role can access dashboard interface (frontend app level)
-- - This ensures data consistency while maintaining role-based UI access control

-- ====== VERIFICATION QUERIES ======
-- Uncomment these lines to verify the migration worked correctly:
-- SELECT 'Subjects table created successfully' AS status;
-- SELECT COUNT(*) AS subjects_count FROM subjects;
-- SELECT COUNT(*) AS activity_types_count FROM activity_types;
-- SELECT * FROM subjects ORDER BY name;
-- SELECT * FROM activity_types ORDER BY name;