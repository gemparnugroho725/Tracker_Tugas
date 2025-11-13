import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import "./App.css";
import "react-calendar/dist/Calendar.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksOnSelectedDate, setTasksOnSelectedDate] = useState([]);
  const [currentPage, setCurrentPage] = useState("tasks");
  
  // ====== STATE UNTUK EDIT ======
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // ====== STATE UNTUK EXPAND/COLLAPSE ======
  const [expandedSections, setExpandedSections] = useState({});

  // ====== DAFTAR MATA KULIAH DENGAN WARNA ======
  const subjects = [
    { name: "Forensik Digital I", color: "#FF6B6B", bgColor: "#FFE8E8" },
    { name: "Etos Sandi V", color: "#4ECDC4", bgColor: "#E0F7F6" },
    { name: "Tata Kelola Keamanan Siber", color: "#FFD93D", bgColor: "#FFF9E6" },
    { name: "Analisis Aplikasi Berbahaya", color: "#6C5CE7", bgColor: "#F3E9FF" },
    { name: "Uji Penetrasi I", color: "#A29BFE", bgColor: "#F4F1FF" },
    { name: "Monitoring dan Deteksi I", color: "#00B894", bgColor: "#E8F8F0" },
    { name: "Hukum dan Etika Profesi", color: "#E17055", bgColor: "#FFECEB" },
  ];

  // ====== CHECK LOGIN STATUS ======
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      fetchTasks(JSON.parse(savedUser).id);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateTasksOnSelectedDate();
  }, [tasks, selectedDate]);

  // ====== FETCH TASKS BERDASARKAN USER ======
  async function fetchTasks(userId) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("deadline", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("❌ Error fetching:", err.message);
      showMessage("Gagal memuat data tugas ❗", "error");
    } finally {
      setLoading(false);
    }
  }

  function updateTasksOnSelectedDate() {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const filtered = tasks.filter((task) => task.deadline === dateString);
    setTasksOnSelectedDate(filtered);
  }

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  }

  // ====== ADD TASK DENGAN USER_ID ======
  async function addTask() {
    if (!taskName.trim() || !deadline || !subject) {
      showMessage("⚠️ Lengkapi semua kolom dulu ya 😅", "error");
      return;
    }

    try {
      const { error } = await supabase.from("tasks").insert([
        { 
          name: taskName, 
          deadline, 
          completed: false, 
          subject,
          user_id: user.id  // ✅ TAMBAH USER_ID
        },
      ]);
      if (error) throw error;

      setTaskName("");
      setDeadline("");
      setSubject("");
      showMessage("✅ Tugas berhasil ditambahkan!", "success");
      fetchTasks(user.id);
    } catch (err) {
      console.error("❌ Add Error:", err.message);
      showMessage("Gagal menambah tugas.", "error");
    }
  }

  // ====== OPEN EDIT MODAL ======
  function openEditModal(task) {
    setEditingId(task.id);
    setEditName(task.name);
    setEditDeadline(task.deadline);
    setEditSubject(task.subject);
    setShowEditModal(true);
  }

  // ====== CLOSE EDIT MODAL ======
  function closeEditModal() {
    setShowEditModal(false);
    setEditingId(null);
    setEditName("");
    setEditDeadline("");
    setEditSubject("");
  }

  // ====== UPDATE TASK ======
  async function handleUpdateTask() {
    if (!editName.trim() || !editDeadline || !editSubject) {
      showMessage("⚠️ Lengkapi semua kolom dulu ya 😅", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          name: editName,
          deadline: editDeadline,
          subject: editSubject,
        })
        .eq("id", editingId)
        .eq("user_id", user.id);  // ✅ PASTIKAN MILIK USER INI

      if (error) throw error;

      showMessage("✅ Tugas berhasil diperbarui!", "success");
      closeEditModal();
      fetchTasks(user.id);
    } catch (err) {
      console.error("❌ Update Error:", err.message);
      showMessage("Gagal memperbarui tugas.", "error");
    }
  }

  // ====== TOGGLE TASK ======
  async function toggleTask(id, completed) {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id)
        .eq("user_id", user.id);  // ✅ PASTIKAN MILIK USER INI
      if (error) throw error;
      fetchTasks(user.id);
    } catch (err) {
      console.error("❌ Toggle Error:", err.message);
    }
  }

  // ====== DELETE TASK ======
  async function deleteTask(id) {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);  // ✅ PASTIKAN MILIK USER INI
      if (error) throw error;
      fetchTasks(user.id);
      showMessage("✅ Tugas dihapus!", "success");
    } catch (err) {
      console.error("❌ Delete Error:", err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setTasks([]);
    showMessage("✅ Logout berhasil!", "success");
  }

  function handleLoginSuccess(userData) {
    setUser(userData);
    setIsLoggedIn(true);
    fetchTasks(userData.id);  // ✅ FETCH TASKS DENGAN USER_ID
  }

  // ====== TOGGLE EXPAND/COLLAPSE ======
  function toggleSection(sectionKey) {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }

  // ====== PISAHKAN TASK SELESAI & BELUM SELESAI ======
  const tasksBySubject = tasks.reduce((acc, task) => {
    if (!acc[task.subject]) {
      acc[task.subject] = { pending: [], completed: [] };
    }
    if (task.completed) {
      acc[task.subject].completed.push(task);
    } else {
      acc[task.subject].pending.push(task);
    }
    return acc;
  }, {});

  const formattedDate = selectedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ====== RENDER LOGIN PAGE ======
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ====== RENDER MAIN APP ======
  return (
    <main className="page">
      {/* ====== NAVBAR ====== */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h2 className="navbar-title">🧠 Task Tracker</h2>
            <div className="navbar-menu">
              <button
                className={`nav-link ${currentPage === "tasks" ? "active" : ""}`}
                onClick={() => setCurrentPage("tasks")}
              >
                📋 Tugas
              </button>
              <button
                className={`nav-link ${currentPage === "schedule" ? "active" : ""}`}
                onClick={() => setCurrentPage("schedule")}
              >
                📚 Jadwal Kuliah
              </button>
            </div>
          </div>
          <div className="navbar-user">
            <span className="user-info">👤 {user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ====== HALAMAN TUGAS ====== */}
      {currentPage === "tasks" && (
        <>
          {/* ====== BAGIAN ATAS - FORM ====== */}
          <div className="top-section">
            <div className="container-form">
              <h1>📝 Tambah Tugas</h1>

              <div className="form-wrapper">
                <div className="task-form">
                  <input
                    type="text"
                    placeholder="✏️ Nama tugas"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                  />

                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="subject-select"
                  >
                    <option value="">📚 Pilih Mata Kuliah</option>
                    {subjects.map((subj) => (
                      <option key={subj.name} value={subj.name}>
                        {subj.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />

                  <button onClick={addTask}>+ Tambah</button>
                </div>

                {message && <p className={`message ${messageType}`}>{message}</p>}
              </div>
            </div>
          </div>

          {/* ====== DIVIDER ====== */}
          <div className="divider"></div>

          {/* ====== BAGIAN BAWAH - 2 KOLOM (LIST KIRI + CALENDAR KANAN) ====== */}
          <div className="bottom-section">
            {/* ====== KOLOM KIRI - LIST TUGAS ====== */}
            <div className="container-list">
              {loading ? (
                <p className="empty">⏳ Memuat tugas...</p>
              ) : tasks.length === 0 ? (
                <p className="empty">📭 Belum ada tugas</p>
              ) : (
                <>
                  {/* Tampilkan tugas pada tanggal terpilih */}
                  {tasksOnSelectedDate.length > 0 && (
                    <div className="selected-date-tasks">
                      <h2 className="selected-date-title">
                        ✨ Tugas Terpilih ({tasksOnSelectedDate.length})
                      </h2>
                      <ul className="task-list">
                        {tasksOnSelectedDate.map((t) => (
                          <li key={t.id} className={t.completed ? "completed" : ""}>
                            <div className="task-info">
                              <strong>{t.name}</strong>
                              <div className="task-meta">
                                <span className="badge subject-badge">
                                  📚 {t.subject}
                                </span>
                                <span className="badge deadline-badge">
                                  📅 {t.deadline}
                                </span>
                              </div>
                            </div>
                            <div className="task-buttons">
                              <button
                                className="edit-btn"
                                onClick={() => openEditModal(t)}
                                title="Edit tugas"
                              >
                                ✏️
                              </button>
                              <button
                                className="done-btn"
                                onClick={() => toggleTask(t.id, t.completed)}
                                title={
                                  t.completed
                                    ? "Tandai belum selesai"
                                    : "Tandai selesai"
                                }
                              >
                                {t.completed ? "↩️" : "✅"}
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => deleteTask(t.id)}
                                title="Hapus tugas"
                              >
                                🗑️
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tampilkan semua tugas berdasarkan mata kuliah */}
                  <div className="subject-sections">
                    <h2 className="all-tasks-title">📋 Semua Tugas</h2>
                    {Object.keys(tasksBySubject).length === 0 ? (
                      <p className="empty">Tidak ada tugas</p>
                    ) : (
                      Object.keys(tasksBySubject).map((subjectName) => {
                        const { pending, completed } = tasksBySubject[subjectName];
                        const isExpanded = expandedSections[`${subjectName}_completed`];
                        const displayedPending = pending.slice(0, 3);
                        const hiddenPendingCount = pending.length - 3;

                        return (
                          <div key={subjectName} className="subject-section">
                            <h3 className="subject-title">📚 {subjectName}</h3>

                            {/* ====== TASK BELUM SELESAI ====== */}
                            {pending.length > 0 && (
                              <div className="task-group">
                                <div className="task-group-header">
                                  <span className="task-group-label">
                                    ⏳ Belum Selesai ({pending.length})
                                  </span>
                                </div>
                                <ul className="task-list">
                                  {displayedPending.map((t) => (
                                    <li key={t.id} className="pending">
                                      <div className="task-info">
                                        <strong>{t.name}</strong>
                                        <span className="badge deadline-badge">
                                          📅 {t.deadline}
                                        </span>
                                      </div>
                                      <div className="task-buttons">
                                        <button
                                          className="edit-btn"
                                          onClick={() => openEditModal(t)}
                                          title="Edit tugas"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          className="done-btn"
                                          onClick={() =>
                                            toggleTask(t.id, t.completed)
                                          }
                                          title="Tandai selesai"
                                        >
                                          ✅
                                        </button>
                                        <button
                                          className="delete-btn"
                                          onClick={() => deleteTask(t.id)}
                                          title="Hapus tugas"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>

                                {/* ====== SHOW MORE BUTTON ====== */}
                                {hiddenPendingCount > 0 && (
                                  <button
                                    className="show-more-btn"
                                    onClick={() =>
                                      toggleSection(`${subjectName}_pending`)
                                    }
                                  >
                                    👇 Tampilkan {hiddenPendingCount} tugas lagi
                                  </button>
                                )}

                                {/* ====== EXPANDED PENDING TASKS ====== */}
                                {expandedSections[`${subjectName}_pending`] && (
                                  <>
                                    <ul className="task-list">
                                      {pending.slice(3).map((t) => (
                                        <li key={t.id} className="pending">
                                          <div className="task-info">
                                            <strong>{t.name}</strong>
                                            <span className="badge deadline-badge">
                                              📅 {t.deadline}
                                            </span>
                                          </div>
                                          <div className="task-buttons">
                                            <button
                                              className="edit-btn"
                                              onClick={() => openEditModal(t)}
                                              title="Edit tugas"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              className="done-btn"
                                              onClick={() =>
                                                toggleTask(t.id, t.completed)
                                              }
                                              title="Tandai selesai"
                                            >
                                              ✅
                                            </button>
                                            <button
                                              className="delete-btn"
                                              onClick={() => deleteTask(t.id)}
                                              title="Hapus tugas"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                    <button
                                      className="show-less-btn"
                                      onClick={() =>
                                        toggleSection(`${subjectName}_pending`)
                                      }
                                    >
                                      👆 Tutup
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {/* ====== TASK SELESAI ====== */}
                            {completed.length > 0 && (
                              <div className="task-group">
                                <div className="task-group-header">
                                  <span className="task-group-label">
                                    ✅ Selesai ({completed.length})
                                  </span>
                                </div>

                                {/* ====== TOGGLE COMPLETED TASKS ====== */}
                                {!isExpanded && (
                                  <button
                                    className="show-more-btn completed"
                                    onClick={() =>
                                      toggleSection(`${subjectName}_completed`)
                                    }
                                  >
                                    👇 Tampilkan {completed.length} tugas selesai
                                  </button>
                                )}

                                {/* ====== EXPANDED COMPLETED TASKS ====== */}
                                {isExpanded && (
                                  <>
                                    <ul className="task-list">
                                      {completed.map((t) => (
                                        <li key={t.id} className="completed">
                                          <div className="task-info">
                                            <strong>{t.name}</strong>
                                            <span className="badge deadline-badge">
                                              📅 {t.deadline}
                                            </span>
                                          </div>
                                          <div className="task-buttons">
                                            <button
                                              className="edit-btn"
                                              onClick={() => openEditModal(t)}
                                              title="Edit tugas"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              className="done-btn"
                                              onClick={() =>
                                                toggleTask(t.id, t.completed)
                                              }
                                              title="Tandai belum selesai"
                                            >
                                              ↩️
                                            </button>
                                            <button
                                              className="delete-btn"
                                              onClick={() => deleteTask(t.id)}
                                              title="Hapus tugas"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                    <button
                                      className="show-less-btn"
                                      onClick={() =>
                                        toggleSection(`${subjectName}_completed`)
                                      }
                                    >
                                      👆 Tutup
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ====== KOLOM KANAN - CALENDAR ====== */}
            <div className="calendar-section">
              <div className="calendar-wrapper">
                <h3 className="calendar-title">📅 Pilih Tanggal</h3>
                <div className="calendar-container">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      const dateString = `${year}-${month}-${day}`;

                      const incompleteTask = tasks.find(
                        (task) => task.deadline === dateString && !task.completed
                      );

                      if (incompleteTask) {
                        return `calendar-date-with-task ${incompleteTask.subject.toLowerCase().replace(/\s+/g, "-")}`;
                      }
                      return null;
                    }}
                    className="custom-calendar"
                    minDetail="month"
                  />
                </div>
                <div className="selected-date-info">
                  <p className="date-display">{formattedDate}</p>
                  <p className="task-count">
                    {tasksOnSelectedDate.length > 0
                      ? `${tasksOnSelectedDate.length} tugas pada hari ini`
                      : "Tidak ada tugas"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ====== EDIT MODAL ====== */}
          {showEditModal && (
            <div className="modal-overlay" onClick={closeEditModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>✏️ Edit Tugas</h2>
                  <button
                    className="modal-close"
                    onClick={closeEditModal}
                    title="Tutup"
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>📝 Nama Tugas</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Masukkan nama tugas"
                    />
                  </div>

                  <div className="form-group">
                    <label>📚 Mata Kuliah</label>
                    <select
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                    >
                      <option value="">Pilih Mata Kuliah</option>
                      {subjects.map((subj) => (
                        <option key={subj.name} value={subj.name}>
                          {subj.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>📅 Deadline</label>
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" onClick={closeEditModal}>
                    Batal
                  </button>
                  <button className="btn-save" onClick={handleUpdateTask}>
                    💾 Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ====== HALAMAN JADWAL KULIAH ====== */}
      {currentPage === "schedule" && (
        <div className="schedule-page">
          <div className="schedule-container">
            <h1>📚 Jadwal Kuliah Bersama</h1>
            <p className="schedule-subtitle">Jadwal kuliah untuk semua mahasiswa</p>
            <div className="schedule-wrapper">
              <iframe
                src="https://calendar.google.com/calendar/embed?src=gemparnugroho725%40gmail.com&ctz=Asia%2FSeoul"
                className="schedule-iframe"
                title="Jadwal Kuliah"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
