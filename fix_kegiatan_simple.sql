-- SOLUSI CEPAT: Fix tabel kegiatan - Ubah user_id dari UUID ke INTEGER
-- Copy dan paste kode ini ke SQL Editor Supabase, lalu klik RUN

-- Langkah 1: Drop tabel kegiatan yang bermasalah
DROP TABLE IF EXISTS kegiatan;

-- Langkah 2: Buat tabel kegiatan baru dengan user_id INTEGER
CREATE TABLE kegiatan (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  activity_type TEXT DEFAULT 'Lainnya',
  priority TEXT DEFAULT 'medium',
  user_id INTEGER NOT NULL,  -- INTEGER, bukan UUID!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Langkah 3: Disable RLS untuk sekarang (supaya tidak ada masalah akses)
ALTER TABLE kegiatan DISABLE ROW LEVEL SECURITY;

-- Langkah 4: Test insert
INSERT INTO kegiatan (name, deadline, activity_type, priority, user_id) 
VALUES ('Test Kegiatan Berhasil', CURRENT_DATE, 'Lainnya', 'medium', 1);

-- Langkah 5: Cek hasil
SELECT * FROM kegiatan;

-- Langkah 6: Hapus test data
DELETE FROM kegiatan WHERE name = 'Test Kegiatan Berhasil';

SELECT 'Tabel kegiatan siap digunakan!' as result;