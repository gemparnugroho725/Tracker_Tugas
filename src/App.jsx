import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!taskName || !deadline) return;
    const newTask = {
      id: Date.now(),
      name: taskName,
      deadline,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setTaskName("");
    setDeadline("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

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

      <ul>
        {tasks.length === 0 ? (
          <p className="empty">Belum ada tugas 📭</p>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              <span>
                {task.name} (📅 {task.deadline})
              </span>
              <div>
                <button onClick={() => toggleTask(task.id)}>✔️</button>
                <button onClick={() => deleteTask(task.id)}>🗑️</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
