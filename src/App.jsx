import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("tasks").select("*").order("id", { ascending: true });
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("❌ Error fetching:", err.message);
      setMessage("Gagal mengambil data tugas");
    } finally {
      setLoading(false);
    }
  }

  async function addTask() {
    if (!taskName || !deadline) {
      setMessage("Isi nama tugas dan tanggal dulu ya 😅");
      return;
    }

    try {
      const { error } = await supabase.from("tasks").insert([{ name: taskName, deadline, completed: false }]);
      if (error) throw error;
      setTaskName("");
      setDeadline("");
      setMessage("✅ Tugas berhasil ditambahkan!");
      fetchTasks();
    } catch (err) {
      console.error("❌ Error adding task:", err.message);
      setMessage("Gagal menambah tugas.");
    }
  }

  async function toggleTask(id, completed) {
    try {
      await supabase.from("tasks").update({ completed: !completed }).eq("id", id);
      fetchTasks();
    } catch (err) {
      console.error(err.message);
    }
  }

  async function deleteTask(id) {
    try {
      await supabase.from("tasks").delete().eq("id", id);
      fetchTasks();
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="container">
      <h1>🧠 Task Tracker</h1>

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

      {loading ? (
        <p className="empty">⏳ Memuat tugas...</p>
      ) : tasks.length === 0 ? (
        <p className="empty">📭 Belum ada tugas</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              <div className="task-info">
                <strong>{task.name}</strong>
                <span>📅 {task.deadline}</span>
              </div>
              <div className="task-buttons">
                <button
                  className="done-btn"
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  {task.completed ? "↩️ Batal" : "✅ Selesai"}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  🗑️ Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
