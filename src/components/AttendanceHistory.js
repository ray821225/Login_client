import React from "react";
import styled from "styled-components";

const AttendanceHistory = ({ records, pagination, loading, onPageChange }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    const [, m, d] = dateStr.split("-");
    return `${m}/${d}`;
  };

  const getMethodLabel = (method) => {
    return method === "qrcode" ? "QR" : "手動";
  };

  if (loading) {
    return (
      <HistoryPanel>
        <p>載入中...</p>
      </HistoryPanel>
    );
  }

  return (
    <HistoryPanel>
      <Title>近期簽到紀錄</Title>
      {records.length === 0 ? (
        <EmptyText>尚無簽到紀錄</EmptyText>
      ) : (
        <>
          <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>日期</th>
                <th>上班</th>
                <th>下班</th>
                <th>方式</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{formatTime(r.clockIn)}</td>
                  <td>{formatTime(r.clockOut)}</td>
                  <td>{getMethodLabel(r.clockInMethod)}</td>
                  <td>
                    <StatusDot $completed={r.status === "completed"} />
                    {r.status === "completed" ? "完成" : "進行中"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </TableWrapper>
          {pagination.totalPages > 1 && (
            <PaginationRow>
              <PageBtn
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                上一頁
              </PageBtn>
              <span>
                {pagination.page} / {pagination.totalPages}
              </span>
              <PageBtn
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                下一頁
              </PageBtn>
            </PaginationRow>
          )}
        </>
      )}
    </HistoryPanel>
  );
};

const HistoryPanel = styled.div`
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Title = styled.h3`
  color: #333;
  margin: 0 0 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 360px;

  th,
  td {
    padding: 10px 12px;
    text-align: center;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    white-space: nowrap;
  }

  th {
    color: #999;
    font-weight: 500;
  }

  td {
    color: #333;
  }
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
  background: ${({ $completed }) => ($completed ? "#4caf50" : "#ff9800")};
`;

const EmptyText = styled.p`
  text-align: center;
  color: #999;
  padding: 20px 0;
`;

const PaginationRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
`;

const PageBtn = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f5f5f5;
  }
`;

export default AttendanceHistory;
