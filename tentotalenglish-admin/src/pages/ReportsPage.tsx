import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "./reports.css";

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
    students.forEach((s) => m.set(s.id, `${s.firstName} ${s.lastName}`));
    return m;
  }, [students]);

  const loadStudents = async () => {
    const res = await http.get<Student[]>("/students");
    setStudents(res.data);
  };

  const loadGlobal = async () => {
    const params: any = {};
    if (year.trim()) params.year = Number(year);
    const res = await http.get<MonthlyPaymentsReportItem[]>("/reports/payments/monthly", { params });
    setGlobalRows(res.data);
  };

  const loadByStudent = async () => {
    if (!studentId) {
      setStudentRows([]);
      return;
    }
    const params: any = { studentId };
    if (year.trim()) params.year = Number(year);
    const res = await http.get<MonthlyPaymentsReportItem[]>("/reports/payments/monthly-by-student", { params });
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

  const globalFooter = useMemo(() => {
    const total = globalRows.length;
    return `Showing ${total} of ${total} results`;
  }, [globalRows.length]);

  const studentFooter = useMemo(() => {
    const total = studentRows.length;
    return `Showing ${total} of ${total} results`;
  }, [studentRows.length]);

  const selectedStudentName = studentId ? studentMap.get(studentId) : "";

  return (
    <div className="reports-page">
      <div className="reports-head">
        <h1 className="reports-title">Reports</h1>
      </div>

      <div className="reports-card">
        {/* Filters */}
        <div className="reports-filters">
          <input
            className="reports-input small"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year (optional)"
            type="number"
          />

          <div className="reports-field">
            <select
              className="reports-select"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">(Optional) Pick a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {studentMap.get(s.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="reports-buttons">
            <button className="reports-btn primary" onClick={refresh}>
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="reports-error">{String(error)}</div>}

        {/* Global table */}
        <div className="reports-section">
          <h3 className="reports-section-title">Global monthly payments</h3>

          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {globalRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.year}</td>
                    <td className="mono">{monthLabel(r.month)}</td>
                    <td className="reports-amount">{r.totalAmount}</td>
                    <td>{r.paymentsCount}</td>
                  </tr>
                ))}

                {globalRows.length === 0 && (
                  <tr>
                    <td className="reports-empty" colSpan={4}>
                      No data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="reports-footer">
            <div className="reports-foot-left">{globalFooter}</div>
          </div>
        </div>

        {/* Student table */}
        <div className="reports-section">
          <h3 className="reports-section-title">
            Monthly payments by student{" "}
            {selectedStudentName ? <span className="reports-muted">({selectedStudentName})</span> : ""}
          </h3>

          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.year}</td>
                    <td className="mono">{monthLabel(r.month)}</td>
                    <td className="reports-amount">{r.totalAmount}</td>
                    <td>{r.paymentsCount}</td>
                  </tr>
                ))}

                {studentId && studentRows.length === 0 && (
                  <tr>
                    <td className="reports-empty" colSpan={4}>
                      No data for this student.
                    </td>
                  </tr>
                )}

                {!studentId && (
                  <tr>
                    <td className="reports-empty" colSpan={4}>
                      Select a student to see this report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="reports-footer">
            <div className="reports-foot-left">{studentFooter}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
