import axios from "axios";
import store from "../store";
import { showError } from "../store/notifySlice";

const API_URL = "/api/auth";

// 攔截器：處理被其他裝置踢出的情況
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "SESSION_REPLACED"
    ) {
      localStorage.removeItem("user");
      store.dispatch(showError("帳號已在其他裝置登入，請重新登入"));
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

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
