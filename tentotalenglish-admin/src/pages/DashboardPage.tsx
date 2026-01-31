import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import "./dashboard.css";

type Student = { id: string; firstName: string; lastName: string; email: string };
type Course = { id: string; name: string; monthlyPrice: number };
type Enrollment = {
  id: string;
  studentId: string;
  courseId: string;
  startDateUtc: string;
  endDateUtc?: string | null;
  isActive: boolean;
};
type Payment = {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  paidAtUtc: string;
  notes?: string | null;
};

function formatMoney(amount: number, currency?: string) {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency || "MXN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency || ""}`.trim();
  }
}

function formatRelative(dateIso: string) {
  const d = new Date(dateIso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);

  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    setError(null);
    try {
      const [s, c, e, p] = await Promise.all([
        http.get<Student[]>("/students"),
        http.get<Course[]>("/courses"),
        http.get<Enrollment[]>("/enrollments"),
        http.get<Payment[]>("/payments"),
      ]);

      setStudents(s.data);
      setCourses(c.data);
      setEnrollments(e.data);
      setPayments(p.data);
    } catch (err: any) {
      setError(err?.response?.data ?? "Error loading dashboard data");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const studentNameMap = useMemo(() => {
    const m = new Map<string, string>();
    students.forEach((s) => m.set(s.id, `${s.firstName} ${s.lastName}`));
    return m;
  }, [students]);

  const courseNameMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [courses]);

  const totalStudents = students.length;
  const totalCourses = courses.length;
  const activeEnrollments = enrollments.filter((x) => x.isActive).length;

  const paymentsSorted = useMemo(() => {
    return [...payments].sort(
      (a, b) => new Date(b.paidAtUtc).getTime() - new Date(a.paidAtUtc).getTime()
    );
  }, [payments]);

  const recentPayments = paymentsSorted.slice(0, 6);

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    let sum = 0;
    for (const p of payments) {
      const d = new Date(p.paidAtUtc);
      if (d.getFullYear() === y && d.getMonth() === m) sum += p.amount;
    }
    return sum;
  }, [payments]);

  const dashboardCurrency = useMemo(() => {
    // If you have mixed currencies, we keep the first currency found
    return payments[0]?.currency || "MXN";
  }, [payments]);

  // Mini chart: last 7 days (including today) by payments total
  const last7DaysBars = useMemo(() => {
    const today = new Date();
    const days: { key: string; label: string; total: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dayKey(d);
      const label = d.toLocaleDateString("es-MX", { weekday: "short" });
      days.push({ key, label, total: 0 });
    }

    const idx = new Map(days.map((x, i) => [x.key, i]));
    for (const p of payments) {
      const d = new Date(p.paidAtUtc);
      const k = dayKey(d);
      const pos = idx.get(k);
      if (pos !== undefined) days[pos].total += p.amount;
    }

    const max = Math.max(1, ...days.map((x) => x.total));
    return days.map((x) => ({
      ...x,
      pct: Math.round((x.total / max) * 100),
    }));
  }, [payments]);

  // Student table: show course (active enrollment) + status + last payment
  const lastPaymentByStudent = useMemo(() => {
    const m = new Map<string, Payment>();
    for (const p of paymentsSorted) {
      if (!m.has(p.studentId)) m.set(p.studentId, p);
    }
    return m;
  }, [paymentsSorted]);

  const activeCourseByStudent = useMemo(() => {
    // choose most recent active enrollment per student
    const m = new Map<string, Enrollment>();
    const actives = enrollments.filter((x) => x.isActive);
    actives.sort((a, b) => new Date(b.startDateUtc).getTime() - new Date(a.startDateUtc).getTime());
    for (const e of actives) {
      if (!m.has(e.studentId)) m.set(e.studentId, e);
    }
    return m;
  }, [enrollments]);

  const studentsTableRows = useMemo(() => {
    return students.slice(0, 6).map((s) => {
      const active = activeCourseByStudent.get(s.id);
      const courseName = active ? courseNameMap.get(active.courseId) || active.courseId : "—";
      const status = active ? "Active" : "Inactive";

      const lp = lastPaymentByStudent.get(s.id);
      const lastPay = lp ? formatMoney(lp.amount, lp.currency) : "—";
      const lastPayWhen = lp ? new Date(lp.paidAtUtc).toLocaleDateString("es-MX") : "";

      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        course: courseName,
        status,
        lastPay,
        lastPayWhen,
      };
    });
  }, [students, activeCourseByStudent, courseNameMap, lastPaymentByStudent]);

  return (
    <div className="dash">
      <div className="dash-head">
        <h1 className="dash-title">Dashboard</h1>
        <button className="dash-refresh" onClick={loadAll}>
          Refresh
        </button>
      </div>

      {error && <div className="dash-error">{String(error)}</div>}

      <div className="cards">
        <div className="kpi orange" role="button" onClick={() => nav("/students")} tabIndex={0}>
          <div className="kpi-title">Total Students</div>
          <div className="kpi-value">{totalStudents}</div>
          <div className="kpi-sub">View students →</div>
        </div>

        <div className="kpi blue" role="button" onClick={() => nav("/courses")} tabIndex={0}>
          <div className="kpi-title">Courses</div>
          <div className="kpi-value">{totalCourses}</div>
          <div className="kpi-sub">View courses →</div>
        </div>

        <div className="kpi teal" role="button" onClick={() => nav("/enrollments")} tabIndex={0}>
          <div className="kpi-title">Active Enrollments</div>
          <div className="kpi-value">{activeEnrollments}</div>
          <div className="kpi-sub">View enrollments →</div>
        </div>

        <div className="kpi yellow" role="button" onClick={() => nav("/payments")} tabIndex={0}>
          <div className="kpi-title">Payments (this month)</div>
          <div className="kpi-value">{formatMoney(thisMonthTotal, dashboardCurrency)}</div>
          <div className="kpi-sub">View payments →</div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Payments last 7 days</div>
            <button className="chip" onClick={() => nav("/reports")}>
              Reports ▾
            </button>
          </div>

          <div className="mini-chart">
            {last7DaysBars.map((b) => (
              <div className="bar-col" key={b.key} title={`${b.label}: ${formatMoney(b.total, dashboardCurrency)}`}>
                <div className="bar" style={{ height: `${b.pct}%` }} />
                <div className="bar-label">{b.label}</div>
              </div>
            ))}
          </div>

          <div className="mini-chart-foot">
            <span className="muted">Totals based on /payments</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent Payments</div>
            <button className="link" onClick={() => nav("/payments")}>
              View all →
            </button>
          </div>

          <div className="list">
            {recentPayments.map((p) => {
              const name = studentNameMap.get(p.studentId) || p.studentId;
              const when = new Date(p.paidAtUtc).toLocaleDateString("es-MX", {
                month: "short",
                day: "2-digit",
              });

              return (
                <div className="row" key={p.id}>
                  <div className="ico">💳</div>
                  <div className="row-main">
                    <div className="row-title">Payment - {name}</div>
                    <div className="row-sub">
                      {when} • {formatMoney(p.amount, p.currency)}
                    </div>
                  </div>
                  <div className="row-meta">{formatRelative(p.paidAtUtc)}</div>
                </div>
              );
            })}

            {recentPayments.length === 0 && (
              <div className="row empty">
                <div className="row-main">
                  <div className="row-title">No payments yet</div>
                  <div className="row-sub">Create your first payment in Payments</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel span-2">
          <div className="panel-head">
            <div className="panel-title">Students snapshot</div>
            <button className="chip" onClick={() => nav("/students")}>
              View all
            </button>
          </div>

          <div className="table">
            <div className="thead">
              <div>Name</div>
              <div>Active Course</div>
              <div>Status</div>
              <div>Last Payment</div>
            </div>

            {studentsTableRows.map((s) => (
              <div className="trow" key={s.id}>
                <div className="name">
                  <span className="mini-avatar">🙂</span>
                  {s.name}
                </div>
                <div>{s.course}</div>
                <div>
                  <span className={`badge ${s.status === "Active" ? "ok" : "off"}`}>{s.status}</span>
                </div>
                <div className="lastpay">
                  <div className="lastpay-amt">{s.lastPay}</div>
                  {s.lastPayWhen && <div className="lastpay-date">{s.lastPayWhen}</div>}
                </div>
              </div>
            ))}

            {students.length === 0 && (
              <div className="trow empty">
                <div>No students yet</div>
                <div>—</div>
                <div>—</div>
                <div>—</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
