import React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>歡迎，{user?.detail.username || "Guest"}！</h2>
        <button onClick={handleLogout} className="btn-secondary">
          登出
        </button>
      </div>
      <div className="dashboard-content">
        <p>您已成功登入系統。</p>
      </div>
    </div>
  );
}

export default Dashboard;
