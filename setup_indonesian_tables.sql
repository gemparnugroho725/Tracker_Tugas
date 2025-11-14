-- SQL LENGKAP untuk mengubah nama tabel ke bahasa Indonesia
-- dan membuat tabel baru jika diperlukan
-- Jalankan di SQL Editor Supabase Dashboard

-- ============================================================================
-- BAGIAN 1: RENAME TABEL YANG SUDAH ADA (jika sudah ada tabel tasks dan user_activities)
-- ============================================================================

-- 1.1. Rename tabel 'tasks' menjadi 'tugas' (jika tabel tasks sudah ada)
-- Uncomment baris berikut jika tabel tasks sudah ada:
-- ALTER TABLE tasks RENAME TO tugas;

-- 1.2. Rename tabel 'user_activities' menjadi 'kegiatan' (jika tabel user_activities sudah ada)
-- Uncomment baris berikut jika tabel user_activities sudah ada:
-- ALTER TABLE user_activities RENAME TO kegiatan;

-- ============================================================================
-- BAGIAN 2: MEMBUAT TABEL TUGAS (jika belum ada)
-- ============================================================================

-- 2.1. Buat tabel tugas
CREATE TABLE IF NOT EXISTS tugas (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2. Enable Row Level Security untuk tugas
ALTER TABLE tugas ENABLE ROW LEVEL SECURITY;

-- 2.3. Hapus policies lama jika ada (untuk kasus rename)
DROP POLICY IF EXISTS "Users can only access their own tasks" ON tugas;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tugas;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tugas;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tugas;

-- 2.4. Buat policies baru untuk tugas
CREATE POLICY "Users can only access their own tugas" ON tugas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tugas" ON tugas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tugas" ON tugas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tugas" ON tugas
  FOR DELETE USING (auth.uid() = user_id);

-- 2.5. Buat index untuk tugas
CREATE INDEX IF NOT EXISTS idx_tugas_user_id ON tugas(user_id);
CREATE INDEX IF NOT EXISTS idx_tugas_deadline ON tugas(deadline);
CREATE INDEX IF NOT EXISTS idx_tugas_subject ON tugas(subject);
CREATE INDEX IF NOT EXISTS idx_tugas_completed ON tugas(completed);

-- 2.6. Tambahkan constraint untuk tugas
ALTER TABLE tugas 
DROP CONSTRAINT IF EXISTS check_tugas_subject;
ALTER TABLE tugas 
ADD CONSTRAINT check_tugas_subject 
CHECK (subject IN (
  'Forensik Digital I', 
  'Etos Sandi V', 
  'Tata Kelola Keamanan Siber', 
  'Analisis Aplikasi Berbahaya', 
  'Uji Penetrasi I', 
  'Monitoring dan Deteksi I', 
  'Hukum dan Etika Profesi'
));

ALTER TABLE tugas 
DROP CONSTRAINT IF EXISTS check_tugas_priority;
ALTER TABLE tugas 
ADD CONSTRAINT check_tugas_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- ============================================================================
-- BAGIAN 3: MEMBUAT TABEL KEGIATAN
-- ============================================================================

-- 3.1. Buat tabel kegiatan
CREATE TABLE IF NOT EXISTS kegiatan (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  activity_type TEXT NOT NULL DEFAULT 'Lainnya',
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2. Enable Row Level Security untuk kegiatan
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;

-- 3.3. Hapus policies lama jika ada (untuk kasus rename)
DROP POLICY IF EXISTS "Users can only access their own activities" ON kegiatan;
DROP POLICY IF EXISTS "Users can insert their own activities" ON kegiatan;
DROP POLICY IF EXISTS "Users can update their own activities" ON kegiatan;
DROP POLICY IF EXISTS "Users can delete their own activities" ON kegiatan;

-- 3.4. Buat policies baru untuk kegiatan
CREATE POLICY "Users can only access their own kegiatan" ON kegiatan
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kegiatan" ON kegiatan
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kegiatan" ON kegiatan
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kegiatan" ON kegiatan
  FOR DELETE USING (auth.uid() = user_id);

-- 3.5. Buat/rename index untuk kegiatan
DROP INDEX IF EXISTS idx_user_activities_user_id;
DROP INDEX IF EXISTS idx_user_activities_deadline;
DROP INDEX IF EXISTS idx_user_activities_activity_type;
DROP INDEX IF EXISTS idx_user_activities_completed;

CREATE INDEX IF NOT EXISTS idx_kegiatan_user_id ON kegiatan(user_id);
CREATE INDEX IF NOT EXISTS idx_kegiatan_deadline ON kegiatan(deadline);
CREATE INDEX IF NOT EXISTS idx_kegiatan_activity_type ON kegiatan(activity_type);
CREATE INDEX IF NOT EXISTS idx_kegiatan_completed ON kegiatan(completed);

-- 3.6. Tambahkan constraint untuk kegiatan
ALTER TABLE kegiatan 
DROP CONSTRAINT IF EXISTS check_activity_type;
ALTER TABLE kegiatan 
DROP CONSTRAINT IF EXISTS check_kegiatan_activity_type;
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_activity_type 
CHECK (activity_type IN ('Lomba', 'IK', 'POLTEK', 'Luar', 'Lainnya'));

ALTER TABLE kegiatan 
DROP CONSTRAINT IF EXISTS check_priority;
ALTER TABLE kegiatan 
DROP CONSTRAINT IF EXISTS check_kegiatan_priority;
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- ============================================================================
-- BAGIAN 4: TRIGGERS UNTUK UPDATED_AT
-- ============================================================================

-- 4.1. Buat function untuk updated_at (jika belum ada)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4.2. Hapus triggers lama jika ada
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tugas;
DROP TRIGGER IF EXISTS update_user_activities_updated_at ON kegiatan;

-- 4.3. Buat triggers baru
CREATE TRIGGER update_tugas_updated_at BEFORE UPDATE
    ON tugas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE
    ON kegiatan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BAGIAN 5: VERIFIKASI
-- ============================================================================

-- 5.1. Tampilkan daftar tabel yang ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tugas', 'kegiatan', 'tasks', 'user_activities')
ORDER BY table_name;

-- ============================================================================
-- SELESAI!
-- ============================================================================

-- Tabel yang sekarang tersedia:
-- ✅ tugas (untuk tugas mata kuliah)
-- ✅ kegiatan (untuk kegiatan mahasiswa)
-- 
-- Aplikasi React sudah dikonfigurasi untuk menggunakan nama tabel ini.
-- Pastikan untuk menjalankan aplikasi dan test semua fitur!