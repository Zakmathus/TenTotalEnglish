import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type Student = { id: string; firstName: string; lastName: string; email: string };
type MonthlyPaymentsReportItem = { year: number; month: number; totalAmount: number; paymentsCount: number };

export function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [globalRows, setGlobalRows] = useState<MonthlyPaymentsReportItem[]>([]);
  const [studentRows, setStudentRows] = useState<MonthlyPaymentsReportItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const studentMap = useMemo(() => {
    const m = new Map<string, string>();
    students.forEach(s => m.set(s.id, `${s.firstName} ${s.lastName}`));
    return m;
  }, [students]);

  const loadStudents = async () => {
    const res = await http.get<Student[]>("/api/students");
    setStudents(res.data);
  };

  const loadGlobal = async () => {
    const params: any = {};
    if (year.trim()) params.year = Number(year);
    const res = await http.get<MonthlyPaymentsReportItem[]>("/api/reports/payments/monthly", { params });
    setGlobalRows(res.data);
  };

  const loadByStudent = async () => {
    if (!studentId) {
      setStudentRows([]);
      return;
    }
    const params: any = { studentId };
    if (year.trim()) params.year = Number(year);
    const res = await http.get<MonthlyPaymentsReportItem[]>("/api/reports/payments/monthly-by-student", { params });
    setStudentRows(res.data);
  };

  const refresh = async () => {
    setError(null);
    try {
      await loadGlobal();
      await loadByStudent();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error loading reports");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, year]);

  const monthLabel = (m: number) => String(m).padStart(2, "0");

  return (
    <div>
      <h2>Reports</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year (optional)"
          type="number"
          style={{ width: 140 }}
        />

        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">(Optional) Pick a student</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {studentMap.get(s.id)}
            </option>
          ))}
        </select>

        <button onClick={refresh}>Refresh</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{String(error)}</div>}

      <h3>Global monthly payments</h3>
      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%", marginBottom: 18 }}>
        <thead>
          <tr>
            <th align="left">Year</th>
            <th align="left">Month</th>
            <th align="left">Total</th>
            <th align="left">Count</th>
          </tr>
        </thead>
        <tbody>
          {globalRows.map((r, idx) => (
            <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
              <td>{r.year}</td>
              <td>{monthLabel(r.month)}</td>
              <td>{r.totalAmount}</td>
              <td>{r.paymentsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Monthly payments by student {studentId ? `(${studentMap.get(studentId)})` : ""}</h3>
      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th align="left">Year</th>
            <th align="left">Month</th>
            <th align="left">Total</th>
            <th align="left">Count</th>
          </tr>
        </thead>
        <tbody>
          {studentRows.map((r, idx) => (
            <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
              <td>{r.year}</td>
              <td>{monthLabel(r.month)}</td>
              <td>{r.totalAmount}</td>
              <td>{r.paymentsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
