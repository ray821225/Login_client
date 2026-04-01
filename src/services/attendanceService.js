import axios from "axios";
import { getCurrentUser } from "./authService";

const API_URL = "/api/attendance";
const QR_URL = "/api/qr";

const getAuthHeaders = () => {
  const user = getCurrentUser();
  return {
    headers: { Authorization: `Bearer ${user?.token}` },
  };
};

// 已登入使用者打卡
export const clock = async (method = "manual", qrToken = null) => {
  const response = await axios.post(
    `${API_URL}/clock`,
    { method, qrToken },
    getAuthHeaders()
  );
  return response.data;
};

// 公用裝置打卡（輸入帳密）
export const clockByCredentials = async (email, password, qrToken = null) => {
  const response = await axios.post(`${API_URL}/clock-by-credentials`, {
    email,
    password,
    qrToken,
  });
  return response.data;
};

// 取得今日簽到狀態
export const getToday = async () => {
  const response = await axios.get(`${API_URL}/today`, getAuthHeaders());
  return response.data;
};

// 取得簽到歷史
export const getHistory = async (page = 1, limit = 10) => {
  const response = await axios.get(
    `${API_URL}/history?page=${page}&limit=${limit}`,
    getAuthHeaders()
  );
  return response.data;
};

// 取得新的 QR Token
export const generateQR = async () => {
  const response = await axios.get(`${QR_URL}/generate`);
  return response.data;
};

// Admin：查詢所有員工出勤
export const getAllAttendance = async (page = 1, limit = 20, yearMonth = "", username = "") => {
  const params = new URLSearchParams({ page, limit });
  if (yearMonth) params.append("yearMonth", yearMonth);
  if (username) params.append("username", username);
  const response = await axios.get(`${API_URL}/admin/all?${params}`, getAuthHeaders());
  return response.data;
};

// 查詢 QR Token 狀態
export const getQRStatus = async (token) => {
  const response = await axios.get(`${QR_URL}/status/${token}`);
  return response.data;
};
