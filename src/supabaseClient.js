import { createClient } from "@supabase/supabase-js";

// 🔹 Hardcode URL dan anon key (aman untuk public project)
const supabaseUrl = "https://yfsdwvztbyqjfurnpseu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc2R3dnp0YnlxamZ1cm5wc2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE1NDAsImV4cCI6MjA3ODQ0NzU0MH0.7rInhxnDSvRF7mBvRroCWgsWjWOe8-zuPbjn2AMC2pg";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Debug info (bisa lo hapus nanti)
console.log("✅ Supabase initialized:", supabaseUrl);
