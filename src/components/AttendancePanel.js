import React, { useState, useEffect, useCallback, memo } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { clock, getToday } from "../services/attendanceService";
import { showSuccess, showError } from "../store/notifySlice";

//HOC
const LiveClock = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <ClockDisplay>
        {currentTime.toLocaleTimeString("zh-TW", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </ClockDisplay>
      <DateDisplay>
        {currentTime.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </DateDisplay>
    </>
  );
});

const AttendancePanel = ({ fetchHistory }) => {
  const dispatch = useDispatch();
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);

  const fetchToday = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getToday();
      setTodayRecord(data.attendance);
    } catch (err) {
      console.error("取得今日狀態失敗", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const getStatus = () => {
    if (!todayRecord) return "not_clocked_in";
    if (!todayRecord.clockOut) return "clocked_in";
    return "completed";
  };

  const status = getStatus();

  const handleClock = async () => {
    try {
      setClocking(true);
      const result = await clock("manual");
      dispatch(showSuccess(result.message));
      await fetchToday();
      fetchHistory?.();
    } catch (err) {
      dispatch(showError(err.response?.data?.message || "打卡失敗"));
    } finally {
      setClocking(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <Panel>
        <p>載入中...</p>
      </Panel>
    );
  }

  return (
    <Panel>
      <LiveClock />

      <StatusBadge status={status}>
        {status === "not_clocked_in" && "尚未打卡"}
        {status === "clocked_in" && "已上班"}
        {status === "completed" && "今日完成"}
      </StatusBadge>

      <TimeRow>
        <TimeBlock>
          <TimeLabel>上班時間</TimeLabel>
          <TimeValue>{formatTime(todayRecord?.clockIn)}</TimeValue>
        </TimeBlock>
        <TimeBlock>
          <TimeLabel>下班時間</TimeLabel>
          <TimeValue>{formatTime(todayRecord?.clockOut)}</TimeValue>
        </TimeBlock>
      </TimeRow>

      {status !== "completed" && (
        <ClockButton onClick={handleClock} disabled={clocking} status={status}>
          {clocking
            ? "處理中..."
            : status === "not_clocked_in"
              ? "上班打卡"
              : "下班打卡"}
        </ClockButton>
      )}
    </Panel>
  );
};

const Panel = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ClockDisplay = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #333;
  font-family: "Courier New", monospace;
`;

const DateDisplay = styled.div`
  font-size: 16px;
  color: #666;
  margin: 8px 0 20px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  background: ${({ status }) =>
    status === "completed"
      ? "#e8f5e9"
      : status === "clocked_in"
        ? "#e3f2fd"
        : "#fff3e0"};
  color: ${({ status }) =>
    status === "completed"
      ? "#2e7d32"
      : status === "clocked_in"
        ? "#1565c0"
        : "#e65100"};
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 20px 0;
`;

const TimeBlock = styled.div``;

const TimeLabel = styled.div`
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
`;

const TimeValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const ClockButton = styled.button`
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background: ${({ status }) =>
    status === "clocked_in"
      ? "linear-gradient(135deg, #ff9800 0%, #f44336 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default AttendancePanel;
