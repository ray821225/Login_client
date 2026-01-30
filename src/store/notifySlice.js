import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: null,
  type: "info",
  autoClose: true,
  duration: 3000,
};

const notifySlice = createSlice({
  name: "notify",
  initialState,
  reducers: {
    showNotify: (state, action) => {
      const {
        message,
        type = "info",
        autoClose = true,
        duration = 3000,
      } = typeof action.payload === "string"
        ? { message: action.payload }
        : action.payload;

      state.message = message;
      state.type = type;
      state.autoClose = autoClose;
      state.duration = duration;
    },
    hideNotify: (state) => {
      state.message = null;
    },
  },
});

export const { showNotify, hideNotify } = notifySlice.actions;

// 快捷方法
export const showSuccess = (message, options = {}) =>
  showNotify({ message, type: "success", ...options });

export const showError = (message, options = {}) =>
  showNotify({ message, type: "error", ...options });

export const showWarning = (message, options = {}) =>
  showNotify({ message, type: "warning", ...options });

export const showInfo = (message, options = {}) =>
  showNotify({ message, type: "info", ...options });

export default notifySlice.reducer;
