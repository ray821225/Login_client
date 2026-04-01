import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../services/authService";
import { getAllAttendance } from "../services/attendanceService";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const AdminPage = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");

  const filterRef = useRef({ year, month, username });

  const fetchRecords = async (page = 1, filters = filterRef.current) => {
    try {
      setLoading(true);
      const yearMonth = `${filters.year}-${String(filters.month).padStart(2, "0")}`;
      const data = await getAllAttendance(
        page,
        20,
        yearMonth,
        filters.username,
      );
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err) {
      console.error("取得出勤記錄失敗", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const user = getCurrentUser();
    if (user?.detail?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchRecords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const filters = { year, month, username: usernameInput };
    console.log(filters, "filters");
    filterRef.current = filters;
    setUsername(usernameInput);
    fetchRecords(1, filters);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    const filters = { year, month, username: "" };
    filterRef.current = filters;
    setUsernameInput("");
    setUsername("");
    fetchRecords(1, filters);
  };

  console.log("pull reqest");

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container>
      <Header>
        <h2>管理員 - 員工出勤總覽</h2>
        <BackBtn onClick={() => navigate("/dashboard")}>返回儀表板</BackBtn>
      </Header>

      <FilterRow>
        <FilterGroup>
          <label>年份</label>
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y} 年
              </option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup>
          <label>月份</label>
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m} 月
              </option>
            ))}
          </Select>
        </FilterGroup>

        <Divider />

        <FilterGroup>
          <label>員工姓名</label>
          <SearchInput
            type="text"
            placeholder="輸入姓名搜尋..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FilterGroup>

        <SearchBtn onClick={handleSearch}>搜尋</SearchBtn>
        {username && <ClearBtn onClick={handleClear}>清除</ClearBtn>}

        <TotalText>共 {pagination.total} 筆記錄</TotalText>
      </FilterRow>

      <Panel>
        {loading ? (
          <CenterText>載入中...</CenterText>
        ) : records.length === 0 ? (
          <CenterText>查無出勤記錄</CenterText>
        ) : (
          <>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>員工姓名</th>
                    <th>Email</th>
                    <th>日期</th>
                    <th>上班時間</th>
                    <th>下班時間</th>
                    <th>打卡方式</th>
                    <th>狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{r.user?.username || "—"}</td>
                      <td>{r.user?.email || "—"}</td>
                      <td>{r.date}</td>
                      <td>{formatTime(r.clockIn)}</td>
                      <td>{formatTime(r.clockOut)}</td>
                      <td>
                        {r.clockInMethod === "qrcode" ? "QR 掃碼" : "手動"}
                      </td>
                      <td>
                        <StatusDot $completed={r.status === "completed"} />
                        {r.status === "completed" ? "已下班" : "上班中"}
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
                  onClick={() => fetchRecords(pagination.page - 1)}
                >
                  上一頁
                </PageBtn>
                <span>
                  第 {pagination.page} 頁 / 共 {pagination.totalPages} 頁
                </span>
                <PageBtn
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchRecords(pagination.page + 1)}
                >
                  下一頁
                </PageBtn>
              </PaginationRow>
            )}
          </>
        )}
      </Panel>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1050px;
  margin: 0 auto;
  padding: 32px 16px;
  background: #f4f6f9;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: 0.5px;
  }
`;

const BackBtn = styled.button`
  padding: 9px 18px;
  border: 1.5px solid #c5cae9;
  border-radius: 8px;
  background: white;
  color: #3f51b5;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  &:hover {
    background: #e8eaf6;
    border-color: #3f51b5;
  }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: white;
  padding: 18px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);

  @media (max-width: 768px) {
    padding: 14px;
    gap: 10px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  label {
    font-size: 12px;
    font-weight: 600;
    color: #555;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
`;

const Select = styled.select`
  padding: 9px 12px;
  border: 1.5px solid #dde1f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #222;
  background: #f8f9ff;
  cursor: pointer;
  transition: border-color 0.15s;
  &:focus {
    outline: none;
    border-color: #3f51b5;
    background: white;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 38px;
  background: #dde1f0;
  align-self: flex-end;
  margin: 0 2px;
`;

const SearchInput = styled.input`
  padding: 9px 12px;
  border: 1.5px solid #dde1f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #222;
  background: #f8f9ff;
  width: 190px;
  transition: border-color 0.15s;
  &::placeholder {
    color: #aaa;
    font-weight: 400;
  }
  &:focus {
    outline: none;
    border-color: #3f51b5;
    background: white;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SearchBtn = styled.button`
  padding: 9px 20px;
  background: #3f51b5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  align-self: flex-end;
  transition: background 0.15s;
  &:hover {
    background: #303f9f;
  }
`;

const ClearBtn = styled.button`
  padding: 9px 14px;
  background: white;
  border: 1.5px solid #e57373;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #e53935;
  align-self: flex-end;
  transition: all 0.15s;
  &:hover {
    background: #ffebee;
  }
`;

const TotalText = styled.span`
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  align-self: flex-end;
  padding-bottom: 2px;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const Panel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
`;

const CenterText = styled.p`
  text-align: center;
  color: #aaa;
  padding: 40px 0;
  font-size: 15px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
  th {
    padding: 12px 14px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: #777;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #f8f9ff;
    border-bottom: 2px solid #eef0f8;
    white-space: nowrap;
  }
  td {
    padding: 13px 14px;
    text-align: center;
    border-bottom: 1px solid #f0f2f8;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
  }
  tbody tr:hover {
    background: #f5f7ff;
  }
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
  background: ${({ $completed }) => ($completed ? "#43a047" : "#fb8c00")};
`;

const PaginationRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  font-size: 14px;
  color: #555;
`;

const PageBtn = styled.button`
  padding: 7px 16px;
  border: 1.5px solid #dde1f0;
  border-radius: 8px;
  background: white;
  color: #3f51b5;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    color: #aaa;
  }
  &:hover:not(:disabled) {
    background: #e8eaf6;
    border-color: #3f51b5;
  }
`;

export default AdminPage;
