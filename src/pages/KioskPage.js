import React, { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "react-qr-code";
import styled, { keyframes } from "styled-components";
import { generateQR, getQRStatus } from "../services/attendanceService";

const QR_TTL = 60; // 秒

const KioskPage = () => {
  const [qrData, setQrData] = useState(null);
  const [clockedUser, setClockedUser] = useState(null);
  const [error, setError] = useState(null);
  const qrSize = window.innerWidth <= 480 ? 180 : 240;

  const pollRef = useRef(null);
  const isRefreshingRef = useRef(false);

  const refreshQR = useCallback(async () => {
    // 防止多個 async callback 同時觸發刷新
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    clearInterval(pollRef.current);
    setClockedUser(null);
    setError(null);

    try {
      const data = await generateQR();
      setQrData(data);
      isRefreshingRef.current = false;

      // 輪詢打卡狀態，每 2 秒查一次
      pollRef.current = setInterval(async () => {
        try {
          const status = await getQRStatus(data.token);
          if (!status.exists) {
            clearInterval(pollRef.current);
            refreshQR();
            return;
          }
          if (status.status === "used") {
            clearInterval(pollRef.current);
            setClockedUser({ username: status.usedBy });
            setTimeout(() => refreshQR(), 3000);
          }
        } catch {
          // 忽略輪詢錯誤
        }
      }, 2000);
    } catch {
      isRefreshingRef.current = false;
      setError("無法產生 QR Code，請檢查網路連線");
    }
  }, []);

  useEffect(() => {
    refreshQR();
    return () => clearInterval(pollRef.current);
  }, [refreshQR]);

  return (
    <Kiosk>
      <Header>
        <CompanyName>員工打卡系統</CompanyName>
        <LiveClock />
      </Header>

      <Content>
        {clockedUser ? (
          <SuccessBox>
            <CheckIcon>✓</CheckIcon>
            <SuccessName>{clockedUser.username}</SuccessName>
            <SuccessText>打卡成功</SuccessText>
          </SuccessBox>
        ) : error ? (
          <ErrorBox>
            <p>{error}</p>
            <RetryButton onClick={refreshQR}>重試</RetryButton>
          </ErrorBox>
        ) : qrData ? (
          <>
            <Instruction>請用手機掃描 QR Code 打卡</Instruction>
            <QRWrapper>
              <QRCode value={qrData.qrContent} size={qrSize} />
            </QRWrapper>
            <CountdownText expiresAt={qrData.expiresAt} />
          </>
        ) : (
          <Loading>產生 QR Code 中...</Loading>
        )}
      </Content>
    </Kiosk>
  );
};

// 倒數計時（獨立組件，每秒更新不影響 QR Code）
const CountdownText = React.memo(({ expiresAt }) => {
  const calc = () =>
    Math.max(0, Math.round((new Date(expiresAt) - Date.now()) / 1000));
  const [seconds, setSeconds] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return <Countdown $urgent={seconds <= 10}>{seconds} 秒後更新</Countdown>;
});

// 平板上的即時時鐘（獨立組件避免整頁刷新）
const LiveClock = React.memo(() => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <ClockText>
      {now.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
      <DateText>
        {now.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </DateText>
    </ClockText>
  );
});

const Kiosk = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    text-align: center;
  }
`;

const CompanyName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 2px;

  @media (max-width: 480px) {
    font-size: 20px;
    letter-spacing: 1px;
  }
`;

const ClockText = styled.div`
  font-size: 32px;
  font-weight: 700;
  text-align: right;
  font-family: "Courier New", monospace;

  @media (max-width: 768px) {
    text-align: center;
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const DateText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const Instruction = styled.p`
  font-size: 22px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  letter-spacing: 1px;
  text-align: center;
  padding: 0 16px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const QRWrapper = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 0 60px rgba(102, 126, 234, 0.4);

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Countdown = styled.div`
  font-size: 16px;
  color: ${({ $urgent }) => ($urgent ? "#ff6b6b" : "rgba(255,255,255,0.5)")};
  animation: ${({ $urgent }) => ($urgent ? pulse : "none")} 1s infinite;
`;

const fadeIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeIn} 0.3s ease;
`;

const CheckIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
`;

const SuccessName = styled.div`
  font-size: 48px;
  font-weight: 700;
`;

const SuccessText = styled.div`
  font-size: 28px;
  color: #4caf50;
  font-weight: 600;
`;

const ErrorBox = styled.div`
  text-align: center;
  color: #ff6b6b;
`;

const RetryButton = styled.button`
  margin-top: 12px;
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
`;

const Loading = styled.div`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
`;

export default KioskPage;
