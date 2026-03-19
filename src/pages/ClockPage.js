import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { isAuthenticated, getCurrentUser, login } from "../services/authService";
import { clock, clockByCredentials } from "../services/attendanceService";

const ClockPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [phase, setPhase] = useState("loading"); // loading | login | clocking | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 已登入 → 直接打卡
  useEffect(() => {
    if (!token) {
      setErrorMsg("無效的打卡連結");
      setPhase("error");
      return;
    }

    if (isAuthenticated()) {
      doClock();
    } else {
      setPhase("login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doClock = async (email, password) => {
    setPhase("clocking");
    try {
      let data;
      if (isAuthenticated()) {
        data = await clock("qrcode", token);
      } else {
        data = await clockByCredentials(email, password, token);
      }
      setResult(data);
      setPhase("success");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "打卡失敗，請重新掃描");
      setPhase("error");
    }
  };

  return (
    <Page>
      <Card>
        <Logo>打卡系統</Logo>

        {phase === "loading" && <Message>讀取中...</Message>}

        {phase === "clocking" && <Message>打卡處理中...</Message>}

        {phase === "login" && (
          <LoginForm
            onSubmit={async ({ email, password }) => {
              try {
                await login(email, password);
                await doClock();
              } catch (err) {
                setErrorMsg(err.response?.data?.message || "登入失敗");
                setPhase("login");
              }
            }}
            error={errorMsg}
          />
        )}

        {phase === "success" && (
          <SuccessView result={result} user={getCurrentUser()} />
        )}

        {phase === "error" && (
          <ErrorView message={errorMsg} />
        )}
      </Card>
    </Page>
  );
};

const LoginForm = ({ onSubmit, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>請登入以完成打卡</FormTitle>
      <Input
        type="email"
        placeholder="電子郵件"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      <Input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <ErrorText>{error}</ErrorText>}
      <SubmitButton type="submit">登入並打卡</SubmitButton>
    </Form>
  );
};

const SuccessView = ({ result, user }) => {
  const isIn = result?.type === "clock_in";
  const username = result?.username || user?.username || "";
  const time = result?.attendance
    ? new Date(isIn ? result.attendance.clockIn : result.attendance.clockOut)
        .toLocaleTimeString("zh-TW", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
    : "";

  return (
    <SuccessBox>
      <CheckCircle>{isIn ? "↑" : "↓"}</CheckCircle>
      <UserName>{username}</UserName>
      <ActionLabel>{isIn ? "上班打卡" : "下班打卡"}成功</ActionLabel>
      {time && <TimeLabel>{time}</TimeLabel>}
    </SuccessBox>
  );
};

const ErrorView = ({ message }) => (
  <ErrorBox>
    <ErrorIcon>✕</ErrorIcon>
    <ErrorMessage>{message}</ErrorMessage>
    <Hint>請重新掃描 QR Code</Hint>
  </ErrorBox>
);

// --- Styled Components ---

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  width: 100%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 28px;
  letter-spacing: 2px;
`;

const Message = styled.div`
  font-size: 18px;
  color: #666;
  padding: 20px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormTitle = styled.div`
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  &:focus {
    border-color: #667eea;
  }
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 14px;
`;

const SubmitButton = styled.button`
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const CheckCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #48bb78;
  color: white;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserName = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #333;
`;

const ActionLabel = styled.div`
  font-size: 18px;
  color: #48bb78;
  font-weight: 600;
`;

const TimeLabel = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #555;
  font-family: "Courier New", monospace;
`;

const ErrorBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fc8181;
  color: white;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  font-size: 18px;
  color: #333;
  font-weight: 600;
`;

const Hint = styled.div`
  font-size: 14px;
  color: #999;
`;

export default ClockPage;
