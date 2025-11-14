-- SOLUSI LENGKAP: Perbaiki masalah UUID dengan menggunakan INTEGER user_id
-- Jalankan di SQL Editor Supabase Dashboard

-- ============================================================================
-- MASALAH: Error "invalid input syntax for type uuid: '1'"
-- PENYEBAB: Aplikasi menggunakan sistem login custom dengan ID integer (1, 2, 3...)
--           tapi tabel database menggunakan UUID yang memerlukan format seperti 
--           '550e8400-e29b-41d4-a716-446655440000'
-- SOLUSI: Ubah tabel untuk menggunakan INTEGER user_id
-- ============================================================================

-- 1. DROP tabel lama yang bermasalah
DROP TABLE IF EXISTS kegiatan CASCADE;
DROP TABLE IF EXISTS tugas CASCADE;

-- 2. BUAT TABEL TUGAS dengan user_id INTEGER
CREATE TABLE tugas (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id INTEGER NOT NULL, -- INTEGER bukan UUID!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BUAT TABEL KEGIATAN dengan user_id INTEGER
CREATE TABLE kegiatan (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  activity_type TEXT NOT NULL DEFAULT 'Lainnya',
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id INTEGER NOT NULL, -- INTEGER bukan UUID!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENABLE RLS untuk kedua tabel
ALTER TABLE tugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;

-- 5. BUAT POLICIES yang kompatibel dengan sistem login custom
-- Policy permissive untuk development (bisa diperketat nanti)
CREATE POLICY "Enable all access for tugas" ON tugas FOR ALL USING (true);
CREATE POLICY "Enable all access for kegiatan" ON kegiatan FOR ALL USING (true);

-- 6. BUAT INDEXES untuk performa
-- Indexes untuk tabel tugas
CREATE INDEX idx_tugas_user_id ON tugas(user_id);
CREATE INDEX idx_tugas_deadline ON tugas(deadline);
CREATE INDEX idx_tugas_subject ON tugas(subject);
CREATE INDEX idx_tugas_completed ON tugas(completed);

-- Indexes untuk tabel kegiatan
CREATE INDEX idx_kegiatan_user_id ON kegiatan(user_id);
CREATE INDEX idx_kegiatan_deadline ON kegiatan(deadline);
CREATE INDEX idx_kegiatan_activity_type ON kegiatan(activity_type);
CREATE INDEX idx_kegiatan_completed ON kegiatan(completed);

-- 7. TAMBAHKAN CONSTRAINTS
-- Constraints untuk tabel tugas
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
ADD CONSTRAINT check_tugas_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- Constraints untuk tabel kegiatan
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_activity_type 
CHECK (activity_type IN ('Lomba', 'IK', 'POLTEK', 'Luar', 'Lainnya'));

ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- 8. BUAT FUNCTION dan TRIGGERS untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tugas_updated_at BEFORE UPDATE
    ON tugas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE
    ON kegiatan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. TEST INSERT untuk memastikan tidak ada error UUID
-- Test tabel tugas
INSERT INTO tugas (name, deadline, subject, priority, user_id) 
VALUES 
  ('Test Tugas 1', '2025-12-01', 'Forensik Digital I', 'high', 1),
  ('Test Tugas 2', '2025-12-02', 'Etos Sandi V', 'medium', 1);

-- Test tabel kegiatan
INSERT INTO kegiatan (name, deadline, activity_type, priority, user_id) 
VALUES 
  ('Test Kegiatan 1', '2025-12-01', 'Lomba', 'high', 1),
  ('Test Kegiatan 2', '2025-12-02', 'IK', 'medium', 1);

-- 10. VERIFIKASI hasil
SELECT 'TUGAS:' as tabel, COUNT(*) as jumlah_data FROM tugas WHERE user_id = 1
UNION ALL
SELECT 'KEGIATAN:' as tabel, COUNT(*) as jumlah_data FROM kegiatan WHERE user_id = 1;

-- 11. TAMPILKAN struktur tabel untuk konfirmasi
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('tugas', 'kegiatan') 
AND column_name = 'user_id'
ORDER BY table_name;

-- ============================================================================
-- HASIL YANG DIHARAPKAN:
-- ✅ Tabel tugas dan kegiatan menggunakan INTEGER user_id
-- ✅ Tidak ada error "invalid input syntax for type uuid"
-- ✅ Aplikasi React bisa insert data dengan user.id = 1, 2, 3, dst
-- ✅ RLS aktif tapi dengan policy permissive untuk development
-- ============================================================================

SELECT '🎉 PERBAIKAN SELESAI! Tabel siap digunakan dengan INTEGER user_id' as status;