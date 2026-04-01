import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  logout,
  isAuthenticated,
} from "../services/authService";
import { getHistory } from "../services/attendanceService";
import AttendancePanel from "../components/AttendancePanel";
import AttendanceHistory from "../components/AttendanceHistory";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const data = await getHistory(page, 7);
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err) {
      console.error("取得歷史失敗", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (isAuthenticated()) return;
    navigate("/login");
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>歡迎，{user?.detail.username || "Guest"}！</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {user?.detail?.role === "admin" && (
            <button onClick={() => navigate("/admin")} className="btn-secondary">
              管理員後台
            </button>
          )}
          <button onClick={handleLogout} className="btn-secondary">
            登出
          </button>
        </div>
      </div>
      <AttendancePanel fetchHistory={fetchHistory} />
      <AttendanceHistory
        records={records}
        pagination={pagination}
        loading={historyLoading}
        onPageChange={fetchHistory}
      />
    </div>
  );
};

export default Dashboard;
