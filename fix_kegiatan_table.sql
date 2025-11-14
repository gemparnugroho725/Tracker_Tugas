-- SOLUSI: Buat tabel kegiatan dengan benar
-- Copy dan paste ke SQL Editor Supabase, lalu klik RUN

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

-- 2. Enable RLS
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;

-- 3. Buat policies
CREATE POLICY "Users can access their own kegiatan" ON kegiatan
  FOR ALL USING (auth.uid() = user_id);

-- 4. Buat indexes
CREATE INDEX idx_kegiatan_user_id ON kegiatan(user_id);
CREATE INDEX idx_kegiatan_deadline ON kegiatan(deadline);

-- 5. Tambahkan constraints
ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_activity_type 
CHECK (activity_type IN ('Lomba', 'IK', 'POLTEK', 'Luar', 'Lainnya'));

ALTER TABLE kegiatan 
ADD CONSTRAINT check_kegiatan_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- 6. Test insert (opsional - hapus setelah test)
-- INSERT INTO kegiatan (name, deadline, activity_type, priority, user_id) 
-- VALUES ('Test Kegiatan', '2025-12-01', 'Lainnya', 'medium', auth.uid());

SELECT 'Tabel kegiatan berhasil dibuat!' as status;