// ✅ Import React (WAJIB untuk JSX)
import React from "react";
import ReactDOM from "react-dom/client";

// ✅ Import komponen utama dan styling
import App from "./App.jsx";
import "./index.css";

// ✅ Render aplikasi React ke elemen root di index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
