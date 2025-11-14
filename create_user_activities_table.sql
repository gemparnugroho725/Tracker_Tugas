-- SQL untuk membuat tabel kegiatan di Supabase
-- Jalankan di SQL Editor Supabase Dashboard

-- 1. Buat tabel kegiatan
CREATE TABLE kegiatan (
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;

-- 3. Buat policy agar user hanya bisa akses data mereka sendiri
CREATE POLICY "Users can only access their own kegiatan" ON kegiatan
  FOR ALL USING (auth.uid() = user_id);

-- 4. Buat policy khusus untuk INSERT
CREATE POLICY "Users can insert their own kegiatan" ON kegiatan
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Buat policy khusus untuk UPDATE
CREATE POLICY "Users can update their own kegiatan" ON kegiatan
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Buat policy khusus untuk DELETE
CREATE POLICY "Users can delete their own kegiatan" ON kegiatan
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Buat index untuk performa yang lebih baik
CREATE INDEX idx_kegiatan_user_id ON kegiatan(user_id);
CREATE INDEX idx_kegiatan_deadline ON kegiatan(deadline);
CREATE INDEX idx_kegiatan_activity_type ON kegiatan(activity_type);
CREATE INDEX idx_kegiatan_completed ON kegiatan(completed);

-- 8. Tambahkan constraint untuk activity_type
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_activity_type 
CHECK (activity_type IN ('Lomba', 'IK', 'POLTEK', 'Luar', 'Lainnya'));

-- 9. Tambahkan constraint untuk priority
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- 10. Tambahkan trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE
    ON kegiatan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Opsional: Tambahkan beberapa data sample (hapus jika tidak diperlukan)
-- INSERT INTO kegiatan (name, deadline, activity_type, priority, user_id) VALUES
-- ('Lomba Programming Contest', '2025-12-01', 'Lomba', 'high', auth.uid()),
-- ('Presentasi Tugas Akhir', '2025-11-30', 'IK', 'high', auth.uid()),
-- ('Workshop Teknologi', '2025-12-15', 'POLTEK', 'medium', auth.uid()),
-- ('Seminar Nasional IT', '2025-12-20', 'Luar', 'low', auth.uid()),
-- ('Rapat Organisasi', '2025-11-25', 'Lainnya', 'medium', auth.uid());

-- Selesai! Tabel kegiatan sudah siap digunakan.