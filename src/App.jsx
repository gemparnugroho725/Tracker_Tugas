import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Load data pertama kali
  useEffect(() => {
    fetchTasks();
  }, []);

  // 🔹 Ambil data dari Supabase
  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      console.log("✅ Tasks fetched:", data);
      setTasks(data || []);
    } catch (err) {
      console.error("❌ Error fetching tasks:", err.message);
      alert("Gagal mengambil data tugas. Cek koneksi Supabase.");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Tambah task baru
  async function addTask() {
    if (!taskName || !deadline) {
      alert("Isi nama dan tanggal dulu bro!");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .insert([{ name: taskName, deadline, completed: false }]);

      if (error) throw error;

      console.log("✅ Task added:", taskName);
      setTaskName("");
      setDeadline("");
      fetchTasks();
    } catch (err) {
      console.error("❌ Error adding task:", err.message);
      alert("Gagal menambah tugas.");
    }
  }

  // 🔹 Toggle status selesai
  async function toggleTask(id, completed) {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      console.log(`🔄 Updated task ID ${id} → completed: ${!completed}`);
      fetchTasks();
    } catch (err) {
      console.error("❌ Error updating task:", err.message);
      alert("Gagal update tugas.");
    }
  }

  // 🔹 Hapus task
  async function deleteTask(id) {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;

      console.log(`🗑️ Deleted task ID ${id}`);
      fetchTasks();
    } catch (err) {
      console.error("❌ Error deleting task:", err.message);
      alert("Gagal hapus tugas.");
    }
  }

  return (
    <div className="container">
      <h1>🗓️ Task Tracker</h1>

      <div className="task-input">
        <input
          type="text"
          placeholder="Nama tugas..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button onClick={addTask}>Tambah</button>
      </div>

      {loading ? (
        <p className="empty">Memuat data...</p>
      ) : tasks.length === 0 ? (
        <p className="empty">Belum ada tugas 📭</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              <span>
                {task.name} (📅 {task.deadline})
              </span>
              <div>
                <button onClick={() => toggleTask(task.id, task.completed)}>
                  ✔️
                </button>
                <button onClick={() => deleteTask(task.id)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
