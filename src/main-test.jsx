// Temporary test main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import TestComponent from "./TestComponent.jsx";
import "./index.css";

console.log("📍 main.jsx loading...");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TestComponent />
  </React.StrictMode>
);