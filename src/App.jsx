import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔹 Ambil data dari Supabase saat pertama kali render
  useEffect(() => {
    fetchTasks();
  }, []);

  // =====================================================
  // 🔹 FETCH TASKS
  // =====================================================
  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
      console.log("✅ Tasks fetched:", data);
    } catch (err) {
      console.error("❌ Fetch Error:", err.message);
      setMessage("Gagal memuat data tugas ❗ Coba cek koneksi Supabase.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // 🔹 TAMBAH TUGAS
  // =====================================================
  async function addTask() {
    if (!taskName.trim() || !deadline) {
      setMessage("⚠️ Isi nama & tanggal dulu ya 😅");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .insert([{ name: taskName, deadline, completed: false }]);

      if (error) throw error;

      setTaskName("");
      setDeadline("");
      setMessage("✅ Tugas berhasil ditambahkan!");
      fetchTasks();
    } catch (err) {
      console.error("❌ Add Error:", err.message);
      setMessage("Gagal menambah tugas. Cek koneksi Supabase!");
    }
  }

  // =====================================================
  // 🔹 UBAH STATUS SELESAI
  // =====================================================
  async function toggleTask(id, completed) {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error("❌ Toggle Error:", err.message);
      setMessage("Gagal memperbarui status tugas.");
    }
  }

  // =====================================================
  // 🔹 HAPUS TUGAS
  // =====================================================
  async function deleteTask(id) {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error("❌ Delete Error:", err.message);
      setMessage("Gagal menghapus tugas.");
    }
  }

  // =====================================================
  // 🔹 UI RENDER
  // =====================================================
  return (
    <main className="page">
      <div className="container">
        <h1>🧠 Task Tracker</h1>

        {/* Form tambah tugas */}
        <div className="card">
          <h3>Tambah Tugas Baru</h3>
          <div className="task-form">
            <input
              type="text"
              placeholder="✏️ Nama tugas"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <button onClick={addTask}>+ Tambah</button>
          </div>
          {message && <p className="message">{message}</p>}
        </div>

        {/* Daftar tugas */}
        {loading ? (
          <p className="empty">⏳ Memuat tugas...</p>
        ) : tasks.length === 0 ? (
          <p className="empty">📭 Belum ada tugas</p>
        ) : (
          <ul className="task-list">
            {tasks.map((t) => (
              <li key={t.id} className={t.completed ? "completed" : ""}>
                <div className="task-info">
                  <strong>{t.name}</strong>
                  <span>📅 {t.deadline}</span>
                </div>
                <div className="task-buttons">
                  <button
                    className="done-btn"
                    onClick={() => toggleTask(t.id, t.completed)}
                  >
                    {t.completed ? "↩️ Batal" : "✅ Selesai"}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(t.id)}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
