-- SQL untuk troubleshooting tabel kegiatan
-- Jalankan di SQL Editor Supabase untuk debug

-- 1. Cek apakah tabel kegiatan ada
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name = 'kegiatan';

-- 2. Cek struktur tabel kegiatan
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'kegiatan' 
ORDER BY ordinal_position;

-- 3. Cek RLS policies untuk tabel kegiatan
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'kegiatan';

-- 4. Test insert manual (ganti YOUR_USER_ID dengan user ID yang valid)
-- SELECT auth.uid(); -- Jalankan ini dulu untuk dapat user ID
-- INSERT INTO kegiatan (name, deadline, activity_type, priority, user_id) 
-- VALUES ('Test Kegiatan', '2025-12-01', 'Lainnya', 'medium', 'YOUR_USER_ID');

-- 5. Cek data yang ada di tabel kegiatan
SELECT * FROM kegiatan LIMIT 10;

-- 6. Cek apakah RLS aktif
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'kegiatan';