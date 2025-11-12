import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showMessage("⚠️ Username dan password tidak boleh kosong", "error");
      return;
    }

    try {
      setLoading(true);

      // Query ke tabel users
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !data) {
        showMessage("❌ Username atau password salah", "error");
        return;
      }

      // Simpan user info ke localStorage
      localStorage.setItem("user", JSON.stringify(data));
      showMessage("✅ Login berhasil! Mengalihkan...", "success");

      // Panggil callback untuk ubah state
      setTimeout(() => {
        onLoginSuccess(data);
      }, 1000);
    } catch (err) {
      console.error("❌ Login Error:", err.message);
      showMessage("❌ Terjadi kesalahan saat login", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Task Tracker Login</h1>
          <p>Masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">👤 Username</label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔑 Password</label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              onKeyPress={(e) => e.key === "Enter" && handleLogin(e)}
            />
          </div>

          {message && <p className={`message ${messageType}`}>{message}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "⏳ Sedang login..." : "🚀 Login"}
          </button>
        </form>
      </div>
    </div>
  );
}