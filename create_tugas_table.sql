-- SQL untuk membuat tabel tugas di Supabase (jika belum ada)
-- Jalankan di SQL Editor Supabase Dashboard

-- 1. Buat tabel tugas (jika belum ada, atau rename dari tasks)
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE tugas ENABLE ROW LEVEL SECURITY;

-- 3. Buat policy agar user hanya bisa akses data mereka sendiri
CREATE POLICY "Users can only access their own tugas" ON tugas
  FOR ALL USING (auth.uid() = user_id);

-- 4. Buat policy khusus untuk INSERT
CREATE POLICY "Users can insert their own tugas" ON tugas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Buat policy khusus untuk UPDATE
CREATE POLICY "Users can update their own tugas" ON tugas
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Buat policy khusus untuk DELETE
CREATE POLICY "Users can delete their own tugas" ON tugas
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Buat index untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_tugas_user_id ON tugas(user_id);
CREATE INDEX IF NOT EXISTS idx_tugas_deadline ON tugas(deadline);
CREATE INDEX IF NOT EXISTS idx_tugas_subject ON tugas(subject);
CREATE INDEX IF NOT EXISTS idx_tugas_completed ON tugas(completed);

-- 8. Tambahkan constraint untuk subject (mata kuliah)
ALTER TABLE tugas 
ADD CONSTRAINT IF NOT EXISTS check_tugas_subject 
CHECK (subject IN (
  'Forensik Digital I', 
  'Etos Sandi V', 
  'Tata Kelola Keamanan Siber', 
  'Analisis Aplikasi Berbahaya', 
  'Uji Penetrasi I', 
  'Monitoring dan Deteksi I', 
  'Hukum dan Etika Profesi'
));

-- 9. Tambahkan constraint untuk priority
ALTER TABLE tugas 
ADD CONSTRAINT IF NOT EXISTS check_tugas_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- 10. Tambahkan trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tugas_updated_at BEFORE UPDATE
    ON tugas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Selesai! Tabel tugas sudah siap digunakan.