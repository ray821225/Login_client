import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, isAuthenticated } from "../services/authService";
import { useDispatch } from "react-redux";
import { showSuccess, showError } from "../store/notifySlice";

const Login = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      dispatch(showSuccess("登入成功！即將跳轉到儀表板..."));
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      dispatch(
        showError(
          err.response?.data?.message || "登入失敗，請檢查您的帳號和密碼"
        )
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>登入</h2>
        <form onSubmit={handleSubmit}>
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
            />
          </div>
          <button type="submit" className="btn-primary">
            登入
          </button>
        </form>
        <p className="auth-link">
          還沒有帳號？<Link to="/register">註冊</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
