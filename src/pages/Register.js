import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import { useDispatch } from "react-redux";
import { showSuccess, showError } from "../store/notifySlice";

function Register() {
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(username, email, password);
      dispatch(showSuccess("註冊成功！正在跳轉到登入頁面..."));
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      dispatch(
        showError(err.response?.data?.message || "註冊失敗，請稍後再試")
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>註冊</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>使用者名稱</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>電子郵件</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="btn-primary">
            註冊
          </button>
        </form>
        <p className="auth-link">
          已有帳號？<Link to="/login">登入</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
