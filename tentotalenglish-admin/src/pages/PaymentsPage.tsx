import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type Student = { id: string; firstName: string; lastName: string; email: string };
type Payment = {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  paidAtUtc: string;
  notes?: string | null;
};

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
    students.forEach(s => m.set(s.id, `${s.firstName} ${s.lastName}`));
    return m;
  }, [students]);

  const loadStudents = async () => {
    const res = await http.get<Student[]>("/api/students");
    setStudents(res.data);
  };

  const loadPayments = async () => {
    const params: any = {};
    if (studentId) params.studentId = studentId;

    const res = await http.get<Payment[]>("/api/payments", { params });
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

      await http.post("/api/payments", { studentId, amount, currency, notes });
      await loadPayments();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error creating payment");
    }
  };

  const deletePayment = async (id: string) => {
    setError(null);
    try {
      await http.delete(`/api/payments/${id}`);
      await loadPayments();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error deleting payment");
    }
  };

  return (
    <div>
      <h2>Payments</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">All students</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        <input
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          type="number"
          placeholder="Amount"
        />

        <input
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder="Currency"
          style={{ width: 90 }}
        />

        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          style={{ width: 240 }}
        />

        <button onClick={createPayment}>Add payment</button>
        <button onClick={loadPayments}>Refresh</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{String(error)}</div>}

      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th align="left">Student</th>
            <th align="left">Amount</th>
            <th align="left">When</th>
            <th align="left">Notes</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
              <td>{studentMap.get(p.studentId) ?? p.studentId}</td>
              <td>{p.amount} {p.currency}</td>
              <td>{new Date(p.paidAtUtc).toLocaleString()}</td>
              <td>{p.notes ?? ""}</td>
              <td>
                <button onClick={() => deletePayment(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
