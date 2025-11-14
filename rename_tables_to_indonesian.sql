-- SQL untuk mengubah nama tabel ke bahasa Indonesia
-- Jalankan di SQL Editor Supabase Dashboard

-- 1. Rename tabel 'tasks' menjadi 'tugas'
ALTER TABLE tasks RENAME TO tugas;

-- 2. Rename tabel 'user_activities' menjadi 'kegiatan'
ALTER TABLE user_activities RENAME TO kegiatan;

-- 3. Update RLS policies untuk tabel 'tugas' (karena nama tabel berubah, policies perlu dibuat ulang)
-- Hapus policies lama untuk tasks
DROP POLICY IF EXISTS "Users can only access their own tasks" ON tugas;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tugas;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tugas;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tugas;

-- Buat policies baru untuk tabel 'tugas'
CREATE POLICY "Users can only access their own tugas" ON tugas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tugas" ON tugas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tugas" ON tugas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tugas" ON tugas
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Update RLS policies untuk tabel 'kegiatan'
-- Hapus policies lama untuk user_activities
DROP POLICY IF EXISTS "Users can only access their own activities" ON kegiatan;
DROP POLICY IF EXISTS "Users can insert their own activities" ON kegiatan;
DROP POLICY IF EXISTS "Users can update their own activities" ON kegiatan;
DROP POLICY IF EXISTS "Users can delete their own activities" ON kegiatan;

-- Buat policies baru untuk tabel 'kegiatan'
CREATE POLICY "Users can only access their own kegiatan" ON kegiatan
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kegiatan" ON kegiatan
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kegiatan" ON kegiatan
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kegiatan" ON kegiatan
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Update indexes untuk tabel 'tugas' (indexes akan otomatis ter-rename, tapi untuk kepastian)
-- Index untuk tabel tugas sudah ada dari sebelumnya dan akan otomatis ter-rename

-- 6. Update indexes untuk tabel 'kegiatan'
-- Rename indexes untuk kegiatan (jika ada)
ALTER INDEX IF EXISTS idx_user_activities_user_id RENAME TO idx_kegiatan_user_id;
ALTER INDEX IF EXISTS idx_user_activities_deadline RENAME TO idx_kegiatan_deadline;
ALTER INDEX IF EXISTS idx_user_activities_activity_type RENAME TO idx_kegiatan_activity_type;
ALTER INDEX IF EXISTS idx_user_activities_completed RENAME TO idx_kegiatan_completed;

-- 7. Update constraint names untuk kegiatan
ALTER TABLE kegiatan RENAME CONSTRAINT check_activity_type TO check_kegiatan_activity_type;
ALTER TABLE kegiatan RENAME CONSTRAINT check_priority TO check_kegiatan_priority;

-- 8. Update trigger name untuk kegiatan
DROP TRIGGER IF EXISTS update_user_activities_updated_at ON kegiatan;
CREATE TRIGGER update_kegiatan_updated_at BEFORE UPDATE
    ON kegiatan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Verifikasi tabel sudah berubah nama
-- Jalankan query ini untuk memastikan:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('tugas', 'kegiatan');

-- Selesai! Tabel sudah diubah ke bahasa Indonesia:
-- - tasks → tugas
-- - user_activities → kegiatan