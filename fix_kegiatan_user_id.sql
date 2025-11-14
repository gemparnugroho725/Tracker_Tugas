-- PERBAIKAN: Ubah tabel kegiatan untuk menggunakan INTEGER user_id bukan UUID
-- Jalankan di SQL Editor Supabase Dashboard

-- 1. Drop tabel kegiatan yang lama jika ada
DROP TABLE IF EXISTS kegiatan CASCADE;

-- 2. Buat tabel kegiatan baru dengan user_id INTEGER
CREATE TABLE kegiatan (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  activity_type TEXT NOT NULL DEFAULT 'Lainnya',
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id INTEGER NOT NULL, -- Ubah dari UUID ke INTEGER
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS (tapi dengan policy yang disesuaikan)
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;

-- 4. Buat policies yang disesuaikan untuk sistem login custom
-- Policy ini memungkinkan akses tanpa auth.uid() karena menggunakan sistem login custom
CREATE POLICY "Enable all access for authenticated users" ON kegiatan
  FOR ALL USING (true);

-- Alternatif: Jika ingin lebih ketat, uncomment policy di bawah dan comment yang di atas
-- CREATE POLICY "Users can access their own kegiatan" ON kegiatan
--   FOR ALL USING (user_id = current_setting('app.current_user_id')::INTEGER);

-- 5. Buat indexes
CREATE INDEX idx_kegiatan_user_id ON kegiatan(user_id);
CREATE INDEX idx_kegiatan_deadline ON kegiatan(deadline);
CREATE INDEX idx_kegiatan_activity_type ON kegiatan(activity_type);
CREATE INDEX idx_kegiatan_completed ON kegiatan(completed);

-- 6. Tambahkan constraints
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_activity_type 
CHECK (activity_type IN ('Lomba', 'IK', 'POLTEK', 'Luar', 'Lainnya'));

ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- 7. Tambahkan trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE
    ON kegiatan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Test insert untuk memastikan berfungsi
INSERT INTO kegiatan (name, deadline, activity_type, priority, user_id) 
VALUES ('Test Kegiatan', '2025-12-01', 'Lainnya', 'medium', 1);

-- 9. Verifikasi
SELECT * FROM kegiatan WHERE user_id = 1;

SELECT 'Tabel kegiatan berhasil diperbaiki dengan user_id INTEGER!' as status;