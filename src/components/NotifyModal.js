import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideNotify } from "../store/notifySlice";
import "../styles/MessageModal.css";

const NotifyModal = () => {
  const dispatch = useDispatch();
  const { message, type, autoClose, duration } = useSelector(
    (state) => state.notify
  );

  useEffect(() => {
    if (message && autoClose && duration > 0) {
      const timer = setTimeout(() => {
        dispatch(hideNotify());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, autoClose, duration, dispatch]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ⓘ";
    }
  };

  return (
    <div className={`message-modal-overlay ${message ? "show" : ""}`}>
      <div className={`message-modal ${type}`}>
        <div className="message-icon">{getIcon()}</div>
        <div className="message-content">{message}</div>
        <button
          className="message-close"
          onClick={() => dispatch(hideNotify())}
          aria-label="關閉"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotifyModal;
