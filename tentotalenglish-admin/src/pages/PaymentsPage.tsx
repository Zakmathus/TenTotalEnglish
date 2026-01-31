import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "./payments.css";

type Student = { id: string; firstName: string; lastName: string; email: string };
type Payment = {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  paidAtUtc: string;
  notes?: string | null;
};

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 6h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 6l1 16h10l1-16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [items, setItems] = useState<Payment[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [amount, setAmount] = useState<number>(300);
  const [currency, setCurrency] = useState<string>("MXN");
  const [notes, setNotes] = useState<string>("Pago");
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

  const loadPayments = async () => {
    const params: any = {};
    if (studentId) params.studentId = studentId;

    const res = await http.get<Payment[]>("/payments", { params });
    setItems(res.data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const createPayment = async () => {
    setError(null);
    try {
      if (!studentId) return setError("Select a student");
      if (amount <= 0) return setError("Amount must be > 0");

      await http.post("/payments", { studentId, amount, currency, notes });
      await loadPayments();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error creating payment");
    }
  };

  const deletePayment = async (id: string) => {
    setError(null);
    try {
      const ok = confirm("Delete this payment?");
      if (!ok) return;

      await http.delete(`/api/payments/${id}`);
      await loadPayments();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error deleting payment");
    }
  };

  const footerText = useMemo(() => {
    const total = items.length;
    return `Showing ${total} of ${total} results`;
  }, [items.length]);

  return (
    <div className="payments-page">
      <div className="payments-head">
        <h1 className="payments-title">Payments</h1>
      </div>

      <div className="payments-card">
        {/* Filters / Create */}
        <div className="payments-filters">
          <div className="payments-field">
            <select
              className="payments-select"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">All students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          <input
            className="payments-input"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            type="number"
            placeholder="Amount"
          />

          <input
            className="payments-input small"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="Currency"
          />

          <input
            className="payments-input notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
          />

          <div className="payments-buttons">
            <button className="payments-btn primary" onClick={createPayment}>
              Add payment
            </button>
            <button className="payments-btn ghost" onClick={loadPayments}>
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="payments-error">{String(error)}</div>}

        <div className="payments-table-wrap">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>When</th>
                <th>Notes</th>
                <th className="right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{studentMap.get(p.studentId) ?? p.studentId}</td>
                  <td className="payments-amount">
                    {p.amount} {p.currency}
                  </td>
                  <td className="mono">{new Date(p.paidAtUtc).toLocaleString()}</td>
                  <td>{p.notes ?? ""}</td>
                  <td className="right">
                    <div className="payments-actions">
                      <button className="payments-action delete" onClick={() => deletePayment(p.id)}>
                        <TrashIcon />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="payments-empty" colSpan={5}>
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="payments-footer">
          <div className="payments-foot-left">{footerText}</div>

          <div className="payments-pager">
            <button className="pager-btn" disabled title="Previous page">
              ‹
            </button>
            <div className="pager-mid">
              <span className="pager-page">1</span>
              <span className="pager-of">of</span>
              <span className="pager-total">1</span>
            </div>
            <button className="pager-btn" disabled title="Next page">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
