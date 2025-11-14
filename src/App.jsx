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
  const [deadline, setDeadline] = useState(getTodayDate());
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksOnSelectedDate, setTasksOnSelectedDate] = useState([]);
  const [currentPage, setCurrentPage] = useState("tasks");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  
  // ====== STATE UNTUK KEGIATAN ======
  const [activities, setActivities] = useState([]);
  const [activityName, setActivityName] = useState("");
  const [activityDeadline, setActivityDeadline] = useState(getTodayDate());
  const [activityType, setActivityType] = useState("Lainnya");
  const [activityPriority, setActivityPriority] = useState("medium");
  const [activitiesOnSelectedDate, setActivitiesOnSelectedDate] = useState([]);
  
  // ====== STATE UNTUK EDIT ======
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  // ====== STATE UNTUK EDIT KEGIATAN ======
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editActivityName, setEditActivityName] = useState("");
  const [editActivityDeadline, setEditActivityDeadline] = useState("");
  const [editActivityType, setEditActivityType] = useState("");
  const [editActivityPriority, setEditActivityPriority] = useState("");
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [isUpdatingActivity, setIsUpdatingActivity] = useState(false);

  // ====== STATE UNTUK EXPAND/COLLAPSE ======
  const [expandedSections, setExpandedSections] = useState({});

  // ====== HELPER FUNCTION - GET TODAY DATE ======
  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // ====== HELPER FUNCTION UNTUK ROLE ======
  function getRoleDisplay(role) {
    const roleMap = {
      'admin': '👑 Admin',
      'moderator': '🛡️ Moderator', 
      'user': '🎯 User'
    };
    return roleMap[role] || '🎯 User';
  }

  // ====== ADMIN FUNCTIONS - MANAGE SUBJECTS ======
  async function addSubject() {
    if (!newSubjectName.trim()) {
      showMessage("⚠️ Nama mata kuliah tidak boleh kosong", "error");
      return;
    }

    if (!newSubjectIcon) {
      showMessage("⚠️ Silakan pilih icon untuk mata kuliah", "error");
      return;
    }

    try {
      // Pilih preset warna secara random atau berdasarkan index
      const randomColorIndex = Math.floor(Math.random() * subjectColorPresets.length);
      const selectedColorPreset = subjectColorPresets[randomColorIndex];

      const { data, error } = await supabase.rpc('add_subject', {
        subject_name: newSubjectName.trim(),
        subject_icon: newSubjectIcon,
        subject_color: selectedColorPreset.color,
        subject_bg_color: selectedColorPreset.bgColor
      });

      if (error) {
        console.error('Error adding subject:', error);
        showMessage("❌ Gagal menambahkan mata kuliah!", "error");
        return;
      }

      // Refresh data dari database
      await fetchSubjects();
      showMessage("✅ Mata kuliah berhasil ditambahkan!", "success");
      
      // Reset form
      setNewSubjectName("");
      setNewSubjectIcon("");
    } catch (error) {
      console.error('Error:', error);
      showMessage("❌ Terjadi kesalahan saat menambahkan mata kuliah!", "error");
    }
  }

  async function deleteSubject(index) {
    const subject = adminSubjects[index];
    if (!subject) return;

    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus mata kuliah "${subject.name}"?\n\nTindakan ini tidak dapat dibatalkan.`);
    
    if (confirmDelete) {
      try {
        const { error } = await supabase.rpc('delete_subject_by_id', {
          subject_id: subject.id
        });

        if (error) {
          console.error('Error deleting subject:', error);
          showMessage("❌ Gagal menghapus mata kuliah!", "error");
          return;
        }

        // Refresh data dari database
        await fetchSubjects();
        showMessage("✅ Mata kuliah berhasil dihapus!", "success");
      } catch (error) {
        console.error('Error:', error);
        showMessage("❌ Terjadi kesalahan saat menghapus mata kuliah!", "error");
      }
    }
  }

  // Fetch subjects from database
  async function fetchSubjects() {
    setLoadingSubjects(true);
    try {
      const { data, error } = await supabase.rpc('get_all_subjects');
      
      if (error) {
        console.error('Error fetching subjects:', error);
        showMessage("❌ Gagal memuat mata kuliah!", "error");
        return;
      }

      // Convert database format to component format
      const formattedSubjects = data.map(subject => ({
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        bgColor: subject.bg_color
      }));

      setAdminSubjects(formattedSubjects);
    } catch (error) {
      console.error('Error:', error);
      showMessage("❌ Terjadi kesalahan saat memuat mata kuliah!", "error");
    } finally {
      setLoadingSubjects(false);
    }
  }

  // Fetch activity types from database
  async function fetchActivityTypes() {
    setLoadingActivityTypes(true);
    try {
      const { data, error } = await supabase.rpc('get_all_activity_types');
      
      if (error) {
        console.error('Error fetching activity types:', error);
        showMessage("❌ Gagal memuat jenis kegiatan!", "error");
        return;
      }

      // Convert database format to component format
      const formattedActivityTypes = data.map(activityType => ({
        id: activityType.id,
        name: activityType.name,
        icon: activityType.icon,
        color: activityType.color,
        bgColor: activityType.bg_color
      }));

      setAdminActivityTypes(formattedActivityTypes);
    } catch (error) {
      console.error('Error:', error);
      showMessage("❌ Terjadi kesalahan saat memuat jenis kegiatan!", "error");
    } finally {
      setLoadingActivityTypes(false);
    }
  }

  // Helper function untuk mendapatkan info mata kuliah berdasarkan nama
  function getSubjectInfo(subjectName) {
    const subjectInfo = adminSubjects.find(subject => subject.name === subjectName);
    return subjectInfo || { name: subjectName, icon: "📚", color: "#4ECDC4", bgColor: "#E0F7F6" };
  }

  // Update subject icon
  async function updateSubjectIcon(subjectId, newIcon) {
    // Jika user memilih "Pilih Icon" (value kosong), tutup editor tanpa update
    if (!newIcon) {
      setEditingSubjectIcon(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .update({ icon: newIcon })
        .eq('id', subjectId);

      if (error) {
        console.error('Error updating subject icon:', error);
        showMessage("❌ Gagal mengubah icon mata kuliah!", "error");
        return;
      }

      await fetchSubjects();
      setEditingSubjectIcon(null);
      showMessage("✅ Icon mata kuliah berhasil diubah!", "success");
    } catch (error) {
      console.error('Error:', error);
      showMessage("❌ Terjadi kesalahan saat mengubah icon!", "error");
    }
  }

  // Update activity type icon
  async function updateActivityTypeIcon(activityTypeId, newIcon) {
    // Jika user memilih "Pilih Icon" (value kosong), tutup editor tanpa update
    if (!newIcon) {
      setEditingActivityIcon(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_types')
        .update({ icon: newIcon })
        .eq('id', activityTypeId);

      if (error) {
        console.error('Error updating activity type icon:', error);
        showMessage("❌ Gagal mengubah icon jenis kegiatan!", "error");
        return;
      }

      await fetchActivityTypes();
      setEditingActivityIcon(null);
      showMessage("✅ Icon jenis kegiatan berhasil diubah!", "success");
    } catch (error) {
      console.error('Error:', error);
      showMessage("❌ Terjadi kesalahan saat mengubah icon!", "error");
    }
  }

  // ====== ADMIN FUNCTIONS - MANAGE ACTIVITY TYPES ======
  async function addActivityType() {
    if (!newActivityTypeName.trim()) {
      showMessage("⚠️ Nama jenis kegiatan tidak boleh kosong", "error");
      return;
    }

    if (!newActivityTypeIcon) {
      showMessage("⚠️ Silakan pilih icon untuk jenis kegiatan", "error");
      return;
    }

    try {
      // Pilih preset warna secara random
      const activityColorPresets = [
        { color: "#FF6B6B", bgColor: "#FFE8E8" },
        { color: "#4ECDC4", bgColor: "#E0F7F6" },
        { color: "#6C5CE7", bgColor: "#F3E9FF" },
        { color: "#FFD93D", bgColor: "#FFF9E6" },
        { color: "#A29BFE", bgColor: "#F4F1FF" }
      ];
      const randomColorIndex = Math.floor(Math.random() * activityColorPresets.length);
      const selectedColorPreset = activityColorPresets[randomColorIndex];

      const { data, error } = await supabase.rpc('add_activity_type', {
        activity_type_name: newActivityTypeName.trim(),
        activity_type_icon: newActivityTypeIcon,
        activity_type_color: selectedColorPreset.color,
        activity_type_bg_color: selectedColorPreset.bgColor
      });

      if (error) {
        console.error('Error adding activity type:', error);
        showMessage("❌ Gagal menambahkan jenis kegiatan!", "error");
        return;
      }

      // Refresh data dari database
      await fetchActivityTypes();
      showMessage("✅ Jenis kegiatan berhasil ditambahkan!", "success");
      
      // Reset form
      setNewActivityTypeName("");
      setNewActivityTypeIcon("");
    } catch (error) {
      console.error('Error:', error);
      showMessage("❌ Terjadi kesalahan saat menambahkan jenis kegiatan!", "error");
    }
  }

  async function deleteActivityType(index) {
    const activityType = adminActivityTypes[index];
    if (!activityType) return;

    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus jenis kegiatan "${activityType.name}"?\n\nTindakan ini tidak dapat dibatalkan.`);
    
    if (confirmDelete) {
      try {
        const { error } = await supabase.rpc('delete_activity_type_by_id', {
          activity_type_id: activityType.id
        });

        if (error) {
          console.error('Error deleting activity type:', error);
          showMessage("❌ Gagal menghapus jenis kegiatan!", "error");
          return;
        }

        // Refresh data dari database
        await fetchActivityTypes();
        showMessage("✅ Jenis kegiatan berhasil dihapus!", "success");
      } catch (error) {
        console.error('Error:', error);
        showMessage("❌ Terjadi kesalahan saat menghapus jenis kegiatan!", "error");
      }
    }
  }

  // ====== DATA SUBJECTS DAN ACTIVITY TYPES SEKARANG DARI DATABASE ======
  // adminSubjects dan adminActivityTypes diload dari Supabase
  // dan digunakan oleh semua user untuk dropdown form

  // ====== PRIORITY LEVELS ======
  const priorityLevels = [
    { value: "low", label: "Rendah", color: "#00B894", icon: "🟢" },
    { value: "medium", label: "Sedang", color: "#FFD93D", icon: "🟡" },
    { value: "high", label: "Tinggi", color: "#FF6B6B", icon: "🔴" },
  ];

  // ====== PRESET WARNA UNTUK MATA KULIAH ======
  const subjectColorPresets = [
    { color: "#FF6B6B", bgColor: "#FFE8E8" },
    { color: "#4ECDC4", bgColor: "#E0F7F6" },
    { color: "#FFD93D", bgColor: "#FFF9E6" },
    { color: "#6C5CE7", bgColor: "#F3E9FF" },
    { color: "#A29BFE", bgColor: "#F4F1FF" },
    { color: "#00B894", bgColor: "#E8F8F0" },
    { color: "#E17055", bgColor: "#FFECEB" },
  ];

  // ====== STATE UNTUK ADMIN DASHBOARD ======
  const [adminSubjects, setAdminSubjects] = useState([]);
  const [adminActivityTypes, setAdminActivityTypes] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingActivityTypes, setLoadingActivityTypes] = useState(false);
  
  // Form states untuk admin
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectIcon, setNewSubjectIcon] = useState("");
  
  const [newActivityTypeName, setNewActivityTypeName] = useState("");
  const [newActivityTypeIcon, setNewActivityTypeIcon] = useState("");
  
  // Edit states untuk icon picker
  const [editingSubjectIcon, setEditingSubjectIcon] = useState(null);
  const [editingActivityIcon, setEditingActivityIcon] = useState(null);

  // ====== CHECK LOGIN STATUS ======
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      fetchTasks(JSON.parse(savedUser).id);
      fetchActivities(JSON.parse(savedUser).id);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateTasksOnSelectedDate();
    updateActivitiesOnSelectedDate();
  }, [tasks, activities, selectedDate]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Load subjects and activity types data for all logged in users (for dropdowns)
  // But only admin can access dashboard to manage the data
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchSubjects();
      fetchActivityTypes();
    }
  }, [isLoggedIn, user]);

  // ====== FETCH TASKS BERDASARKAN USER ======
  async function fetchTasks(userId) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tugas")
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

  function updateActivitiesOnSelectedDate() {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const filtered = activities.filter((activity) => activity.deadline === dateString);
    setActivitiesOnSelectedDate(filtered);
  }

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  }

  // ====== FETCH ACTIVITIES BERDASARKAN USER ======
  async function fetchActivities(userId) {
    try {
      const { data, error } = await supabase
        .from("kegiatan")
        .select("*")
        .eq("user_id", userId)
        .order("deadline", { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error("❌ Error fetching activities:", err.message);
      showMessage("Gagal memuat data kegiatan ❗", "error");
    }
  }

  // ====== ADD TASK DENGAN USER_ID ======
  async function addTask() {
    if (!taskName.trim() || !deadline || !subject || !priority) {
      showMessage("⚠️ Lengkapi semua kolom dulu ya 😅", "error");
      return;
    }

    try {
      const { error } = await supabase.from("tugas").insert([
        { 
          name: taskName, 
          deadline, 
          completed: false, 
          subject,
          priority: priority,
          user_id: user.id
        },
      ]);
      if (error) throw error;

      setTaskName("");
      setDeadline(getTodayDate());
      setSubject("");
      setPriority("");
      showMessage("✅ Tugas berhasil ditambahkan!", "success");
      fetchTasks(user.id);
    } catch (err) {
      console.error("❌ Add Error:", err.message);
      showMessage("Gagal menambah tugas.", "error");
    }
  }

  // ====== ADD ACTIVITY DENGAN USER_ID ======
  async function addActivity() {
    if (!activityName.trim() || !activityDeadline) {
      showMessage("⚠️ Nama kegiatan dan tanggal harus diisi!", "error");
      return;
    }

    // Pastikan ada nilai default jika kosong
    const finalActivityType = activityType || "Lainnya";
    const finalActivityPriority = activityPriority || "medium";

    try {
      // Pastikan user.id adalah integer
      const userId = parseInt(user.id);
      console.log("🔍 Sending to database:", {
        name: activityName,
        deadline: activityDeadline,
        activity_type: finalActivityType,
        priority: finalActivityPriority,
        user_id: userId,
        user_id_type: typeof userId
      });

      const { error } = await supabase.from("kegiatan").insert([
        { 
          name: activityName, 
          deadline: activityDeadline, 
          completed: false, 
          activity_type: finalActivityType,
          priority: finalActivityPriority,
          user_id: userId
        },
      ]);
      if (error) throw error;

      setActivityName("");
      setActivityDeadline(getTodayDate());
      setActivityType("Lainnya");
      setActivityPriority("medium");
      showMessage("✅ Kegiatan berhasil ditambahkan!", "success");
      fetchActivities(user.id);
    } catch (err) {
      console.error("❌ Add Activity Error:", err.message);
      showMessage(`Gagal menambah kegiatan: ${err.message}`, "error");
    }
  }

  // ====== OPEN EDIT MODAL ======
  function openEditModal(task) {
    setEditingId(task.id);
    setEditName(task.name);
    setEditDeadline(task.deadline);
    setEditSubject(task.subject);
    setEditPriority(task.priority || "");
    setShowEditModal(true);
  }

  // ====== CLOSE EDIT MODAL ======
  function closeEditModal() {
    setShowEditModal(false);
    setEditingId(null);
    setEditName("");
    setEditDeadline("");
    setEditSubject("");
    setEditPriority("");
  }

  // ====== UPDATE TASK ======
  async function handleUpdateTask() {
    console.log("🔍 Edit Task Debug:", {
      editName: editName.trim(),
      editDeadline,
      editSubject,
      editPriority,
      editingId
    });

    if (!editName.trim() || !editDeadline || !editSubject || !editPriority) {
      showMessage("⚠️ Lengkapi semua kolom dulu ya 😅", "error");
      return;
    }

    setIsUpdatingTask(true);
    try {
      const { error } = await supabase
        .from("tugas")
        .update({
          name: editName,
          deadline: editDeadline,
          subject: editSubject,
          priority: editPriority,
        })
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) throw error;

      showMessage("✅ Tugas berhasil diperbarui!", "success");
      closeEditModal();
      fetchTasks(user.id);
    } catch (err) {
      console.error("❌ Update Error:", err.message);
      showMessage("Gagal memperbarui tugas.", "error");
    } finally {
      setIsUpdatingTask(false);
    }
  }

  // ====== TOGGLE TASK ======
  async function toggleTask(id, completed) {
    try {
      const { error } = await supabase
        .from("tugas")
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
        .from("tugas")
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

  // ====== OPEN EDIT ACTIVITY MODAL ======
  function openEditActivityModal(activity) {
    setEditingActivityId(activity.id);
    setEditActivityName(activity.name);
    setEditActivityDeadline(activity.deadline);
    setEditActivityType(activity.activity_type || "Lainnya");
    setEditActivityPriority(activity.priority || "");
    setShowEditActivityModal(true);
  }

  // ====== CLOSE EDIT ACTIVITY MODAL ======
  function closeEditActivityModal() {
    setShowEditActivityModal(false);
    setEditingActivityId(null);
    setEditActivityName("");
    setEditActivityDeadline("");
    setEditActivityType("");
    setEditActivityPriority("");
  }

  // ====== UPDATE ACTIVITY ======
  async function handleUpdateActivity() {
    console.log("🔍 Edit Activity Debug:", {
      editActivityName: editActivityName.trim(),
      editActivityDeadline,
      editActivityType,
      editActivityPriority,
      editingActivityId
    });

    if (!editActivityName.trim() || !editActivityDeadline || !editActivityType || !editActivityPriority) {
      showMessage("⚠️ Lengkapi semua kolom dulu ya 😅", "error");
      return;
    }

    setIsUpdatingActivity(true);
    try {
      const { error } = await supabase
        .from("kegiatan")
        .update({
          name: editActivityName,
          deadline: editActivityDeadline,
          activity_type: editActivityType,
          priority: editActivityPriority,
        })
        .eq("id", editingActivityId)
        .eq("user_id", user.id);

      if (error) throw error;

      showMessage("✅ Kegiatan berhasil diperbarui!", "success");
      closeEditActivityModal();
      fetchActivities(user.id);
    } catch (err) {
      console.error("❌ Update Activity Error:", err.message);
      showMessage("Gagal memperbarui kegiatan.", "error");
    } finally {
      setIsUpdatingActivity(false);
    }
  }

  // ====== TOGGLE ACTIVITY ======
  async function toggleActivity(id, completed) {
    try {
      const { error } = await supabase
        .from("kegiatan")
        .update({ completed: !completed })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      fetchActivities(user.id);
    } catch (err) {
      console.error("❌ Toggle Activity Error:", err.message);
    }
  }

  // ====== DELETE ACTIVITY ======
  async function deleteActivity(id) {
    try {
      const { error } = await supabase
        .from("kegiatan")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      fetchActivities(user.id);
      showMessage("✅ Kegiatan dihapus!", "success");
    } catch (err) {
      console.error("❌ Delete Activity Error:", err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setTasks([]);
    setActivities([]);
    showMessage("✅ Logout berhasil!", "success");
  }

  function handleLoginSuccess(userData) {
    setUser(userData);
    setIsLoggedIn(true);
    fetchTasks(userData.id);  // ✅ FETCH TASKS DENGAN USER_ID
    fetchActivities(userData.id);  // ✅ FETCH ACTIVITIES DENGAN USER_ID
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

  // ====== PISAHKAN ACTIVITY SELESAI & BELUM SELESAI ======
  const activitiesByType = activities.reduce((acc, activity) => {
    const activityType = activity.activity_type || "Lainnya";
    if (!acc[activityType]) {
      acc[activityType] = { pending: [], completed: [] };
    }
    if (activity.completed) {
      acc[activityType].completed.push(activity);
    } else {
      acc[activityType].pending.push(activity);
    }
    return acc;
  }, {});

  // ====== HELPER FUNCTION - GET UNCOMPLETED SUBJECTS FOR DATE ======
  function getUncompletedSubjectsForDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const tasksOnDate = tasks.filter(
      (task) => task.deadline === dateString && !task.completed
    );
    const uniqueSubjects = [...new Set(tasksOnDate.map((t) => t.subject))];
    return uniqueSubjects;
  }

  // ====== HELPER FUNCTION - GET UNCOMPLETED ACTIVITIES FOR DATE ======
  function getUncompletedActivitiesForDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const activitiesOnDate = activities.filter(
      (activity) => activity.deadline === dateString && !activity.completed
    );
    return activitiesOnDate;
  }

  // ====== UPDATE TILE CLASS NAME UNTUK CALENDAR ======
  const getTileClassName = ({ date }) => {
    const uncompletedSubjects = getUncompletedSubjectsForDate(date);
    const uncompletedActivities = getUncompletedActivitiesForDate(date);
    const hasTask = uncompletedSubjects.length > 0;
    const hasActivity = uncompletedActivities.length > 0;
    
    let classes = [];
    
    // Tambahkan class untuk tugas (titik merah)
    if (hasTask) {
      classes.push("calendar-date-with-task");
      classes.push(`task-count-${uncompletedSubjects.length}`);
      
      if (date.toDateString() === selectedDate.toDateString()) {
        classes.push("calendar-date-with-task--active");
      }
      
      if (date.toDateString() === new Date().toDateString()) {
        classes.push("calendar-date-with-task--now");
      }
    }

    // Tambahkan class untuk kegiatan (titik biru)
    if (hasActivity) {
      classes.push("calendar-date-with-activity");
      classes.push(`activity-count-${uncompletedActivities.length}`);
      
      if (date.toDateString() === selectedDate.toDateString()) {
        classes.push("calendar-date-with-activity--active");
      }
      
      if (date.toDateString() === new Date().toDateString()) {
        classes.push("calendar-date-with-activity--now");
      }
    }

    return classes.join(" ");
  };

  // ====== GENERATE DATA ATTRIBUTES UNTUK CALENDAR TILES ======
  const getTileDataAttributes = ({ date }) => {
    const uncompletedSubjects = getUncompletedSubjectsForDate(date);
    const uncompletedActivities = getUncompletedActivitiesForDate(date);
    let attributes = {};
    
    uncompletedSubjects.forEach((subject, index) => {
      attributes[`data-subject-${index}`] = subject;
    });

    uncompletedActivities.forEach((activity, index) => {
      attributes[`data-activity-${index}`] = activity.activity_type || "Lainnya";
    });

    return attributes;
  };

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
    <main className={`page ${darkMode ? "dark-mode" : ""}`}>
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
                className={`nav-link ${currentPage === "activities" ? "active" : ""}`}
                onClick={() => setCurrentPage("activities")}
              >
                🎯 Kegiatan
              </button>
              <button
                className={`nav-link ${currentPage === "schedule" ? "active" : ""}`}
                onClick={() => setCurrentPage("schedule")}
              >
                📚 Jadwal Kuliah
              </button>
              {user?.role === "admin" && (
                <button
                  className={`nav-link admin-nav ${currentPage === "admin" ? "active" : ""}`}
                  onClick={() => setCurrentPage("admin")}
                >
                  👑 Dashboard Admin
                </button>
              )}
            </div>
          </div>
          <div className="navbar-user">
            <div className="user-info">
              <span>👤 {user?.username}</span>
              <span className="user-role">{getRoleDisplay(user?.role)}</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="theme-toggle-btn"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
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
                    {adminSubjects.map((subj) => (
                      <option key={subj.name} value={subj.name}>
                        {subj.icon} {subj.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />

                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="subject-select"
                  >
                    <option value="">⭐ Pilih Prioritas</option>
                    {priorityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.icon} {level.label}
                      </option>
                    ))}
                  </select>

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
                        {tasksOnSelectedDate.map((t) => {
                          const priorityInfo = priorityLevels.find(p => p.value === (t.priority || "medium"));
                          return (
                            <li key={t.id} className={t.completed ? "completed" : ""}>
                              <div className="task-info">
                                <strong>{t.name}</strong>
                                <div className="task-meta">
                                  <span className={`badge priority-badge priority-${t.priority || "medium"}`}>
                                    {priorityInfo?.icon} {priorityInfo?.label}
                                  </span>
                                  <span className="badge subject-badge">
                                    {getSubjectInfo(t.subject).icon} {t.subject}
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
                          );
                        })}
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

                        const subjectInfo = getSubjectInfo(subjectName);
                        return (
                          <div key={subjectName} className="subject-section">
                            <h3 className="subject-title">{subjectInfo.icon} {subjectName}</h3>

                            {/* ====== TASK BELUM SELESAI ====== */}
                            {pending.length > 0 && (
                              <div className="task-group">
                                <div className="task-group-header">
                                  <span className="task-group-label">
                                    ⏳ Belum Selesai ({pending.length})
                                  </span>
                                </div>
                                <ul className="task-list">
                                  {displayedPending.map((t) => {
                                    const priorityInfo = priorityLevels.find(p => p.value === (t.priority || "medium"));
                                    return (
                                      <li key={t.id} className="pending">
                                        <div className="task-info">
                                          <strong>{t.name}</strong>
                                          <div className="task-meta">
                                            <span className={`badge priority-badge priority-${t.priority || "medium"}`}>
                                              {priorityInfo?.icon} {priorityInfo?.label}
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
                                    );
                                  })}
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
                                      {pending.slice(3).map((t) => {
                                        const priorityInfo = priorityLevels.find(p => p.value === (t.priority || "medium"));
                                        return (
                                          <li key={t.id} className="pending">
                                            <div className="task-info">
                                              <strong>{t.name}</strong>
                                              <div className="task-meta">
                                                <span className={`badge priority-badge priority-${t.priority || "medium"}`}>
                                                  {priorityInfo?.icon} {priorityInfo?.label}
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
                                        );
                                      })}
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
                                      {completed.map((t) => {
                                        const priorityInfo = priorityLevels.find(p => p.value === (t.priority || "medium"));
                                        return (
                                          <li key={t.id} className="completed">
                                            <div className="task-info">
                                              <strong>{t.name}</strong>
                                              <div className="task-meta">
                                                <span className={`badge priority-badge priority-${t.priority || "medium"}`}>
                                                  {priorityInfo?.icon} {priorityInfo?.label}
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
                                        );
                                      })}
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
                    tileClassName={getTileClassName}
                    className="custom-calendar"
                    minDetail="month"
                    // Custom tile element untuk menambah data attributes
                    tileContent={({ date }) => {
                      const attrs = getTileDataAttributes({ date });
                      return (
                        <div
                          style={{
                            display: "contents",
                            ...Object.fromEntries(
                              Object.entries(attrs).map(([key, value]) => [
                                `data-${key.replace("data-", "")}`,
                                value,
                              ])
                            ),
                          }}
                        />
                      );
                    }}
                  />
                </div>
                <div className="selected-date-info">
                  <p className="date-display">{formattedDate}</p>
                  <div className="task-activity-count">
                    <p className="task-count">
                      {tasksOnSelectedDate.length > 0
                        ? `${tasksOnSelectedDate.length} tugas`
                        : "Tidak ada tugas"}
                    </p>
                    <p className="activity-count">
                      {activitiesOnSelectedDate.length > 0
                        ? `${activitiesOnSelectedDate.length} kegiatan`
                        : "Tidak ada kegiatan"}
                    </p>
                  </div>
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
                      {adminSubjects.map((subj) => (
                        <option key={subj.name} value={subj.name}>
                          {subj.icon} {subj.name}
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

                  <div className="form-group">
                    <label>⭐ Prioritas</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="">Pilih Prioritas</option>
                      {priorityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.icon} {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    className="btn-cancel" 
                    onClick={closeEditModal}
                    disabled={isUpdatingTask}
                  >
                    Batal
                  </button>
                  <button 
                    className="btn-save" 
                    onClick={handleUpdateTask}
                    disabled={isUpdatingTask}
                  >
                    {isUpdatingTask ? (
                      <>⏳ Menyimpan...</>
                    ) : (
                      <>💾 Simpan Perubahan</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ====== HALAMAN KEGIATAN ====== */}
      {currentPage === "activities" && (
        <>
          {/* ====== BAGIAN ATAS - FORM ====== */}
          <div className="top-section">
            <div className="container-form">
              <h1>🎯 Tambah Kegiatan</h1>

              <div className="form-wrapper">
                <div className="task-form">
                  <input
                    type="text"
                    placeholder="✏️ Nama kegiatan"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addActivity()}
                  />

                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="subject-select"
                  >
                    {adminActivityTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={activityDeadline}
                    onChange={(e) => setActivityDeadline(e.target.value)}
                  />

                  <select
                    value={activityPriority}
                    onChange={(e) => setActivityPriority(e.target.value)}
                    className="subject-select"
                  >
                    {priorityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.icon} {level.label}
                      </option>
                    ))}
                  </select>

                  <button onClick={addActivity}>+ Tambah</button>
                </div>

                {message && <p className={`message ${messageType}`}>{message}</p>}
              </div>
            </div>
          </div>

          {/* ====== DIVIDER ====== */}
          <div className="divider"></div>

          {/* ====== BAGIAN BAWAH - 2 KOLOM (LIST KIRI + CALENDAR KANAN) ====== */}
          <div className="bottom-section">
            {/* ====== KOLOM KIRI - LIST KEGIATAN ====== */}
            <div className="container-list">
              {loading ? (
                <p className="empty">⏳ Memuat kegiatan...</p>
              ) : activities.length === 0 ? (
                <p className="empty">📭 Belum ada kegiatan</p>
              ) : (
                <>
                  {/* Tampilkan kegiatan pada tanggal terpilih */}
                  {activitiesOnSelectedDate.length > 0 && (
                    <div className="selected-date-tasks">
                      <h2 className="selected-date-title">
                        ✨ Kegiatan Terpilih ({activitiesOnSelectedDate.length})
                      </h2>
                      <ul className="task-list">
                        {activitiesOnSelectedDate.map((a) => {
                          const priorityInfo = priorityLevels.find(p => p.value === (a.priority || "medium"));
                          return (
                            <li key={a.id} className={a.completed ? "completed" : ""}>
                              <div className="task-info">
                                <strong>{a.name}</strong>
                                <div className="task-meta">
                                  <span className={`badge priority-badge priority-${a.priority || "medium"}`}>
                                    {priorityInfo?.icon} {priorityInfo?.label}
                                  </span>
                                  <span className="badge subject-badge">
                                    {adminActivityTypes.find(t => t.name === (a.activity_type || "Lainnya"))?.icon || "�"} {a.activity_type || "Lainnya"}
                                  </span>
                                  <span className="badge deadline-badge">
                                    📅 {a.deadline}
                                  </span>
                                </div>
                              </div>
                              <div className="task-buttons">
                                <button
                                  className="edit-btn"
                                  onClick={() => openEditActivityModal(a)}
                                  title="Edit kegiatan"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="done-btn"
                                  onClick={() => toggleActivity(a.id, a.completed)}
                                  title={
                                    a.completed
                                      ? "Tandai belum selesai"
                                      : "Tandai selesai"
                                  }
                                >
                                  {a.completed ? "↩️" : "✅"}
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => deleteActivity(a.id)}
                                  title="Hapus kegiatan"
                                >
                                  🗑️
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Tampilkan semua kegiatan berdasarkan jenis kegiatan */}
                  <div className="subject-sections">
                    <h2 className="all-tasks-title">🎯 Semua Kegiatan</h2>
                    {Object.keys(activitiesByType).length === 0 ? (
                      <p className="empty">Tidak ada kegiatan</p>
                    ) : (
                      Object.keys(activitiesByType).map((typeName) => {
                        const { pending, completed } = activitiesByType[typeName];
                        const isExpanded = expandedSections[`${typeName}_activity_completed`];
                        const displayedPending = pending.slice(0, 3);
                        const hiddenPendingCount = pending.length - 3;
                        const typeInfo = adminActivityTypes.find(t => t.name === typeName) || { icon: "📝", name: typeName };

                        return (
                          <div key={typeName} className="subject-section">
                            <h3 className="subject-title">{typeInfo.icon} {typeName}</h3>

                            {/* ====== KEGIATAN BELUM SELESAI ====== */}
                            {pending.length > 0 && (
                              <div className="task-group">
                                <div className="task-group-header">
                                  <span className="task-group-label">
                                    ⏳ Belum Selesai ({pending.length})
                                  </span>
                                </div>
                                <ul className="task-list">
                                  {displayedPending.map((a) => {
                                    const priorityInfo = priorityLevels.find(p => p.value === (a.priority || "medium"));
                                    return (
                                      <li key={a.id} className="pending">
                                        <div className="task-info">
                                          <strong>{a.name}</strong>
                                          <div className="task-meta">
                                            <span className={`badge priority-badge priority-${a.priority || "medium"}`}>
                                              {priorityInfo?.icon} {priorityInfo?.label}
                                            </span>
                                            <span className="badge deadline-badge">
                                              📅 {a.deadline}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="task-buttons">
                                          <button
                                            className="edit-btn"
                                            onClick={() => openEditActivityModal(a)}
                                            title="Edit kegiatan"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            className="done-btn"
                                            onClick={() =>
                                              toggleActivity(a.id, a.completed)
                                            }
                                            title="Tandai selesai"
                                          >
                                            ✅
                                          </button>
                                          <button
                                            className="delete-btn"
                                            onClick={() => deleteActivity(a.id)}
                                            title="Hapus kegiatan"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>

                                {/* ====== SHOW MORE BUTTON ====== */}
                                {hiddenPendingCount > 0 && (
                                  <button
                                    className="show-more-btn"
                                    onClick={() =>
                                      toggleSection(`${typeName}_activity_pending`)
                                    }
                                  >
                                    👇 Tampilkan {hiddenPendingCount} kegiatan lagi
                                  </button>
                                )}

                                {/* ====== EXPANDED PENDING ACTIVITIES ====== */}
                                {expandedSections[`${typeName}_activity_pending`] && (
                                  <>
                                    <ul className="task-list">
                                      {pending.slice(3).map((a) => {
                                        const priorityInfo = priorityLevels.find(p => p.value === (a.priority || "medium"));
                                        return (
                                          <li key={a.id} className="pending">
                                            <div className="task-info">
                                              <strong>{a.name}</strong>
                                              <div className="task-meta">
                                                <span className={`badge priority-badge priority-${a.priority || "medium"}`}>
                                                  {priorityInfo?.icon} {priorityInfo?.label}
                                                </span>
                                                <span className="badge deadline-badge">
                                                  📅 {a.deadline}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="task-buttons">
                                              <button
                                                className="edit-btn"
                                                onClick={() => openEditActivityModal(a)}
                                                title="Edit kegiatan"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                className="done-btn"
                                                onClick={() =>
                                                  toggleActivity(a.id, a.completed)
                                                }
                                                title="Tandai selesai"
                                              >
                                                ✅
                                              </button>
                                              <button
                                                className="delete-btn"
                                                onClick={() => deleteActivity(a.id)}
                                                title="Hapus kegiatan"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                    <button
                                      className="show-less-btn"
                                      onClick={() =>
                                        toggleSection(`${typeName}_activity_pending`)
                                      }
                                    >
                                      👆 Tutup
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {/* ====== KEGIATAN SELESAI ====== */}
                            {completed.length > 0 && (
                              <div className="task-group">
                                <div className="task-group-header">
                                  <span className="task-group-label">
                                    ✅ Selesai ({completed.length})
                                  </span>
                                </div>

                                {/* ====== TOGGLE COMPLETED ACTIVITIES ====== */}
                                {!isExpanded && (
                                  <button
                                    className="show-more-btn completed"
                                    onClick={() =>
                                      toggleSection(`${typeName}_activity_completed`)
                                    }
                                  >
                                    👇 Tampilkan {completed.length} kegiatan selesai
                                  </button>
                                )}

                                {/* ====== EXPANDED COMPLETED ACTIVITIES ====== */}
                                {isExpanded && (
                                  <>
                                    <ul className="task-list">
                                      {completed.map((a) => {
                                        const priorityInfo = priorityLevels.find(p => p.value === (a.priority || "medium"));
                                        return (
                                          <li key={a.id} className="completed">
                                            <div className="task-info">
                                              <strong>{a.name}</strong>
                                              <div className="task-meta">
                                                <span className={`badge priority-badge priority-${a.priority || "medium"}`}>
                                                  {priorityInfo?.icon} {priorityInfo?.label}
                                                </span>
                                                <span className="badge subject-badge">
                                                  {adminActivityTypes.find(t => t.name === (a.activity_type || "Lainnya"))?.icon || "�"} {a.activity_type || "Lainnya"}
                                                </span>
                                                <span className="badge deadline-badge">
                                                  📅 {a.deadline}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="task-buttons">
                                              <button
                                                className="edit-btn"
                                                onClick={() => openEditActivityModal(a)}
                                                title="Edit kegiatan"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                className="done-btn"
                                                onClick={() =>
                                                  toggleActivity(a.id, a.completed)
                                                }
                                                title="Tandai belum selesai"
                                              >
                                                ↩️
                                              </button>
                                              <button
                                                className="delete-btn"
                                                onClick={() => deleteActivity(a.id)}
                                                title="Hapus kegiatan"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                    <button
                                      className="show-less-btn"
                                      onClick={() =>
                                        toggleSection(`${typeName}_activity_completed`)
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
                    tileClassName={getTileClassName}
                    className="custom-calendar"
                    minDetail="month"
                    // Custom tile element untuk menambah data attributes
                    tileContent={({ date }) => {
                      const attrs = getTileDataAttributes({ date });
                      return (
                        <div
                          style={{
                            display: "contents",
                            ...Object.fromEntries(
                              Object.entries(attrs).map(([key, value]) => [
                                `data-${key.replace("data-", "")}`,
                                value,
                              ])
                            ),
                          }}
                        />
                      );
                    }}
                  />
                </div>
                <div className="selected-date-info">
                  <p className="date-display">{formattedDate}</p>
                  <div className="task-activity-count">
                    <p className="task-count">
                      {tasksOnSelectedDate.length > 0
                        ? `${tasksOnSelectedDate.length} tugas`
                        : "Tidak ada tugas"}
                    </p>
                    <p className="activity-count">
                      {activitiesOnSelectedDate.length > 0
                        ? `${activitiesOnSelectedDate.length} kegiatan`
                        : "Tidak ada kegiatan"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====== EDIT ACTIVITY MODAL ====== */}
          {showEditActivityModal && (
            <div className="modal-overlay" onClick={closeEditActivityModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>✏️ Edit Kegiatan</h2>
                  <button
                    className="modal-close"
                    onClick={closeEditActivityModal}
                    title="Tutup"
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>🎯 Nama Kegiatan</label>
                    <input
                      type="text"
                      value={editActivityName}
                      onChange={(e) => setEditActivityName(e.target.value)}
                      placeholder="Masukkan nama kegiatan"
                    />
                  </div>

                  <div className="form-group">
                    <label>🎯 Jenis Kegiatan</label>
                    <select
                      value={editActivityType}
                      onChange={(e) => setEditActivityType(e.target.value)}
                    >
                      <option value="">Pilih Jenis Kegiatan</option>
                      {adminActivityTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>📅 Deadline</label>
                    <input
                      type="date"
                      value={editActivityDeadline}
                      onChange={(e) => setEditActivityDeadline(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>⭐ Prioritas</label>
                    <select
                      value={editActivityPriority}
                      onChange={(e) => setEditActivityPriority(e.target.value)}
                    >
                      <option value="">Pilih Prioritas</option>
                      {priorityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.icon} {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    className="btn-cancel" 
                    onClick={closeEditActivityModal}
                    disabled={isUpdatingActivity}
                  >
                    Batal
                  </button>
                  <button 
                    className="btn-save" 
                    onClick={handleUpdateActivity}
                    disabled={isUpdatingActivity}
                  >
                    {isUpdatingActivity ? (
                      <>⏳ Menyimpan...</>
                    ) : (
                      <>💾 Simpan Perubahan</>
                    )}
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

      {/* ====== HALAMAN DASHBOARD ADMIN ====== */}
      {currentPage === "admin" && user?.role === "admin" && (
        <div className="admin-page">
          <div className="admin-container">
            <div className="admin-header">
              <h1>👑 Dashboard Admin</h1>
              <p className="admin-subtitle">Kelola mata kuliah dan jenis kegiatan</p>
            </div>

            <div className="admin-content">
              {/* ====== SECTION: MATA KULIAH ====== */}
              <div className="admin-section">
                <div className="section-header">
                  <h2>📚 Kelola Mata Kuliah</h2>
                  <div className="add-form">
                    <input
                      type="text"
                      placeholder="Nama mata kuliah baru"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="admin-input"
                    />
                    <select
                      value={newSubjectIcon}
                      onChange={(e) => setNewSubjectIcon(e.target.value)}
                      className="icon-select"
                    >
                      <option value="">Pilih Icon</option>
                      <option value="📚">📚 Buku</option>
                      <option value="💻">💻 Komputer</option>
                      <option value="🔬">🔬 Sains</option>
                      <option value="📐">📐 Matematika</option>
                      <option value="🎨">🎨 Seni</option>
                      <option value="🌐">🌐 Web</option>
                      <option value="⚡">⚡ Elektro</option>
                      <option value="🏗️">🏗️ Teknik</option>
                      <option value="💼">💼 Bisnis</option>
                      <option value="🧪">🧪 Laboratorium</option>
                      <option value="📊">📊 Data</option>
                      <option value="🔧">🔧 Praktikum</option>
                    </select>
                    <button onClick={addSubject} className="add-btn">
                      ➕ Tambah
                    </button>
                  </div>
                </div>
                
                <div className="items-grid">
                  {loadingSubjects ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Memuat mata kuliah...</p>
                    </div>
                  ) : adminSubjects.length === 0 ? (
                    <div className="empty-state">
                      <p>Belum ada mata kuliah. Tambahkan yang pertama!</p>
                    </div>
                  ) : (
                    adminSubjects.map((subject, index) => (
                      <div key={subject.id || index} className="admin-item">
                        <div className="item-preview">
                          {editingSubjectIcon === subject.id ? (
                            <div className="icon-picker-inline">
                              <select
                                defaultValue=""
                                onChange={(e) => updateSubjectIcon(subject.id, e.target.value)}
                                className="icon-select-small"
                                autoFocus
                                onBlur={() => setEditingSubjectIcon(null)}
                              >
                                <option value="">Pilih Icon</option>
                                <option value="📚">📚 Buku</option>
                                <option value="💻">💻 Komputer</option>
                                <option value="🔬">🔬 Sains</option>
                                <option value="📐">📐 Matematika</option>
                                <option value="🎨">🎨 Seni</option>
                                <option value="🌐">🌐 Web</option>
                                <option value="⚡">⚡ Elektro</option>
                                <option value="🏗️">🏗️ Teknik</option>
                                <option value="💼">💼 Bisnis</option>
                                <option value="🧪">🧪 Laboratorium</option>
                                <option value="📊">📊 Data</option>
                                <option value="🔧">🔧 Praktikum</option>
                                <option value="🔍">🔍 Forensik</option>
                                <option value="🔐">🔐 Keamanan</option>
                                <option value="🛡️">🛡️ Cyber Security</option>
                                <option value="🦠">🦠 Malware</option>
                                <option value="⚖️">⚖️ Hukum</option>
                              </select>
                            </div>
                          ) : (
                            <span 
                              className="icon-clickable" 
                              onClick={() => setEditingSubjectIcon(subject.id)}
                              title="Klik untuk mengubah icon"
                            >
                              {subject.icon}
                            </span>
                          )}
                          <span>{subject.name}</span>
                        </div>
                      <button 
                        onClick={() => deleteSubject(index)} 
                        className="delete-btn"
                        title="Hapus mata kuliah"
                      >
                        🗑️
                      </button>
                    </div>
                    ))
                  )}
                </div>
              </div>

              {/* ====== SECTION: JENIS KEGIATAN ====== */}
              <div className="admin-section">
                <div className="section-header">
                  <h2>🎯 Kelola Jenis Kegiatan</h2>
                  <div className="add-form">
                    <input
                      type="text"
                      placeholder="Nama jenis kegiatan baru"
                      value={newActivityTypeName}
                      onChange={(e) => setNewActivityTypeName(e.target.value)}
                      className="admin-input"
                    />
                    <select
                      value={newActivityTypeIcon}
                      onChange={(e) => setNewActivityTypeIcon(e.target.value)}
                      className="icon-select"
                    >
                      <option value="">Pilih Icon</option>
                      <option value="📝">📝 Default</option>
                      <option value="🏆">🏆 Lomba</option>
                      <option value="🎓">🎓 Akademik</option>
                      <option value="🏫">🏫 Kampus</option>
                      <option value="🌍">🌍 Eksternal</option>
                      <option value="💼">💼 Profesional</option>
                      <option value="🎨">🎨 Kreatif</option>
                      <option value="⚽">⚽ Olahraga</option>
                      <option value="🎪">🎪 Event</option>
                    </select>
                    <button onClick={addActivityType} className="add-btn">
                      ➕ Tambah
                    </button>
                  </div>
                </div>
                
                <div className="items-grid">
                  {loadingActivityTypes ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Memuat jenis kegiatan...</p>
                    </div>
                  ) : adminActivityTypes.length === 0 ? (
                    <div className="empty-state">
                      <p>Belum ada jenis kegiatan. Tambahkan yang pertama!</p>
                    </div>
                  ) : (
                    adminActivityTypes.map((activityType, index) => (
                      <div key={activityType.id || index} className="admin-item">
                        <div className="item-preview">
                          {editingActivityIcon === activityType.id ? (
                            <div className="icon-picker-inline">
                              <select
                                defaultValue=""
                                onChange={(e) => updateActivityTypeIcon(activityType.id, e.target.value)}
                                className="icon-select-small"
                                autoFocus
                                onBlur={() => setEditingActivityIcon(null)}
                              >
                                <option value="">Pilih Icon</option>
                                <option value="🏆">🏆 Lomba</option>
                                <option value="🎓">🎓 Akademik</option>
                                <option value="🏫">🏫 Institusi</option>
                                <option value="🌍">🌍 Eksternal</option>
                                <option value="📝">📝 Tugas</option>
                                <option value="🎯">🎯 Target</option>
                                <option value="🚀">🚀 Proyek</option>
                                <option value="💡">💡 Inovasi</option>
                                <option value="⭐">⭐ Prestasi</option>
                                <option value="🎪">🎪 Event</option>
                                <option value="🎊">🎊 Perayaan</option>
                                <option value="🎉">🎉 Achievement</option>
                              </select>
                            </div>
                          ) : (
                            <span 
                              className="icon-clickable" 
                              onClick={() => setEditingActivityIcon(activityType.id)}
                              title="Klik untuk mengubah icon"
                            >
                              {activityType.icon}
                            </span>
                          )}
                          <span>{activityType.name}</span>
                        </div>
                      <button 
                        onClick={() => deleteActivityType(index)} 
                        className="delete-btn"
                        title="Hapus jenis kegiatan"
                      >
                        🗑️
                      </button>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

