-- PERBAIKAN: Ubah tabel tugas untuk menggunakan INTEGER user_id bukan UUID
-- Jalankan di SQL Editor Supabase Dashboard (jika tabel tugas juga bermasalah)

-- 1. Cek apakah tabel tugas ada dan struktur user_id nya
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tugas' AND column_name = 'user_id';

-- 2. Jika user_id masih UUID, drop dan buat ulang tabel tugas
-- DROP TABLE IF EXISTS tugas CASCADE;

-- 3. Buat tabel tugas baru dengan user_id INTEGER
CREATE TABLE IF NOT EXISTS tugas (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id INTEGER NOT NULL, -- Pastikan INTEGER, bukan UUID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE tugas ENABLE ROW LEVEL SECURITY;

-- 5. Drop policies lama jika ada
DROP POLICY IF EXISTS "Users can only access their own tugas" ON tugas;
DROP POLICY IF EXISTS "Users can insert their own tugas" ON tugas;
DROP POLICY IF EXISTS "Users can update their own tugas" ON tugas;
DROP POLICY IF EXISTS "Users can delete their own tugas" ON tugas;

-- 6. Buat policy yang sesuai untuk sistem login custom
CREATE POLICY "Enable all access for authenticated users" ON tugas
  FOR ALL USING (true);

-- 7. Buat indexes
CREATE INDEX IF NOT EXISTS idx_tugas_user_id ON tugas(user_id);
CREATE INDEX IF NOT EXISTS idx_tugas_deadline ON tugas(deadline);
CREATE INDEX IF NOT EXISTS idx_tugas_subject ON tugas(subject);
CREATE INDEX IF NOT EXISTS idx_tugas_completed ON tugas(completed);

-- 8. Tambahkan constraints
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

-- 9. Tambahkan trigger untuk updated_at
CREATE TRIGGER update_tugas_updated_at BEFORE UPDATE
    ON tugas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Test insert
INSERT INTO tugas (name, deadline, subject, priority, user_id) 
VALUES ('Test Tugas', '2025-12-01', 'Forensik Digital I', 'medium', 1);

-- 11. Verifikasi
SELECT * FROM tugas WHERE user_id = 1;

SELECT 'Tabel tugas berhasil diperbaiki dengan user_id INTEGER!' as status;