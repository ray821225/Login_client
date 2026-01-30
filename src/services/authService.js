import axios from "axios";

const API_URL = "/api/auth";

// 登入
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// 註冊
export const register = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/register`, {
    username,
    email,
    password,
  });
  return response.data;
};

// 登出
export const logout = () => {
  localStorage.removeItem("user");
};

// 獲取當前使用者
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// 檢查是否已認證
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!user?.token;
};
