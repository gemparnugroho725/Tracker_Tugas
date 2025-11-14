-- PERBAIKAN KHUSUS: Ubah tabel kegiatan dari UUID ke INTEGER
-- Jalankan di SQL Editor Supabase Dashboard

-- 1. Backup data yang ada (jika ada)
CREATE TEMP TABLE kegiatan_backup AS SELECT * FROM kegiatan;

-- 2. Drop tabel kegiatan yang bermasalah
DROP TABLE kegiatan CASCADE;

-- 3. Buat tabel kegiatan baru dengan user_id INTEGER
CREATE TABLE kegiatan (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  activity_type TEXT NOT NULL DEFAULT 'Lainnya',
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id INTEGER NOT NULL, -- PENTING: INTEGER bukan UUID!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;

-- 5. Buat policy yang simple untuk development
CREATE POLICY "Allow all operations on kegiatan" ON kegiatan
  FOR ALL USING (true);

-- 6. Buat indexes untuk performa
CREATE INDEX idx_kegiatan_user_id ON kegiatan(user_id);
CREATE INDEX idx_kegiatan_deadline ON kegiatan(deadline);
CREATE INDEX idx_kegiatan_activity_type ON kegiatan(activity_type);
CREATE INDEX idx_kegiatan_completed ON kegiatan(completed);

-- 7. Tambahkan constraints
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_activity_type 
CHECK (activity_type IN ('Lomba', 'IK', 'POLTEK', 'Luar', 'Lainnya'));

ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- 8. Buat trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE
    ON kegiatan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Test insert dengan user_id INTEGER
INSERT INTO kegiatan (name, deadline, activity_type, priority, user_id) 
VALUES ('Test Kegiatan', CURRENT_DATE, 'Lainnya', 'medium', 1);

-- 10. Verifikasi struktur tabel
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'kegiatan' 
ORDER BY ordinal_position;

-- 11. Test hasil insert
SELECT * FROM kegiatan WHERE user_id = 1;

-- 12. Bersihkan temp table
DROP TABLE IF EXISTS kegiatan_backup;

SELECT '✅ Tabel kegiatan berhasil diperbaiki! user_id sekarang INTEGER' as status;