import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createPayment,
  getPendingPayments,
  getStudentPayments,
  PendingPayment,
  StudentPayment,
} from "../api/paymentsApi";
import { getStudents, Student } from "../api/studentsApi";
import { getGroups, Group } from "../api/groupsApi";
import { ActiveEnrollment, getActiveEnrollment } from "../api/enrollmentsApi";

function getTodayLocalDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function getCurrentMonth(): string {
  return getTodayLocalDate().slice(0, 7);
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function shortId(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return value;
  return `${value.slice(0, 8)}...`;
}

function isSamePending(
  a: PendingPayment | null,
  b: PendingPayment | null
): boolean {
  if (!a || !b) return false;

  return (
    a.studentId === b.studentId &&
    a.enrollmentId === b.enrollmentId &&
    a.month === b.month
  );
}

export default function PaymentsPage() {
  const location = useLocation();

  const state = location.state as {
    studentId?: string;
    enrollmentId?: string;
    amount?: number;
  } | null;

  const studentIdFromState = state?.studentId ?? "";
  const enrollmentIdFromState = state?.enrollmentId ?? "";
  const amountFromState = state?.amount ?? 0;

  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeEnrollment, setActiveEnrollment] =
    useState<ActiveEnrollment | null>(null);

  const [createForm, setCreateForm] = useState({
    studentId: "",
    enrollmentId: "",
    amount: "",
    paymentDate: getTodayLocalDate(),
    month: getCurrentMonth(),
  });

  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [pendingMonth, setPendingMonth] = useState(getCurrentMonth());

  const [createLoading, setCreateLoading] = useState(false);
  const [studentPaymentsLoading, setStudentPaymentsLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const [createMessage, setCreateMessage] = useState("");
  const [studentPaymentsError, setStudentPaymentsError] = useState("");
  const [pendingError, setPendingError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [groupsError, setGroupsError] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");

  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPending, setSelectedPending] = useState<PendingPayment | null>(
    null
  );

  const canCreatePayment = useMemo(() => {
    return (
      createForm.studentId.trim() !== "" &&
      createForm.enrollmentId.trim() !== "" &&
      createForm.amount.trim() !== "" &&
      createForm.paymentDate.trim() !== "" &&
      createForm.month.trim() !== ""
    );
  }, [createForm]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === createForm.studentId) ?? null;
  }, [students, createForm.studentId]);

  const activeStudent = useMemo(() => {
    if (!activeEnrollment) return null;
    return students.find((s) => s.id === activeEnrollment.studentId) ?? null;
  }, [students, activeEnrollment]);

  const activeGroup = useMemo(() => {
    if (!activeEnrollment) return null;
    return groups.find((g) => g.id === activeEnrollment.groupId) ?? null;
  }, [groups, activeEnrollment]);

  useEffect(() => {
    loadStudents();
    loadGroups();
    loadPendingPayments(getCurrentMonth());
  }, []);

  useEffect(() => {
    if (!studentIdFromState) return;

    setStudentIdSearch(studentIdFromState);

    setCreateForm((prev) => ({
      ...prev,
      studentId: studentIdFromState,
      enrollmentId: enrollmentIdFromState || prev.enrollmentId,
      amount: amountFromState ? String(amountFromState) : prev.amount,
    }));

    if (studentIdFromState) {
      loadActiveEnrollment(studentIdFromState, {
        keepAmountIfProvided: Boolean(amountFromState),
        keepEnrollmentIfProvided: Boolean(enrollmentIdFromState),
      });
      loadStudentPayments(studentIdFromState);
    }
  }, [studentIdFromState, enrollmentIdFromState, amountFromState]);

  async function loadStudents() {
    try {
      setStudentsLoading(true);
      setStudentsError("");

      const data = await getStudents();
      setStudents(data);
    } catch (error: any) {
      setStudents([]);
      setStudentsError(error.message);
    } finally {
      setStudentsLoading(false);
    }
  }

  async function loadGroups() {
    try {
      setGroupsLoading(true);
      setGroupsError("");

      const data = await getGroups();
      setGroups(data);
    } catch (error: any) {
      setGroups([]);
      setGroupsError(error.message);
    } finally {
      setGroupsLoading(false);
    }
  }

  function clearCreateForm() {
    setCreateForm({
      studentId: "",
      enrollmentId: "",
      amount: "",
      paymentDate: getTodayLocalDate(),
      month: getCurrentMonth(),
    });
    setActiveEnrollment(null);
    setEnrollmentError("");
    setSelectedPending(null);
    setCreateMessage("");
  }

  async function loadActiveEnrollment(
    studentId: string,
    options?: {
      keepAmountIfProvided?: boolean;
      keepEnrollmentIfProvided?: boolean;
    }
  ) {
    const id = studentId.trim();

    if (!id) {
      setActiveEnrollment(null);
      setEnrollmentError("Selecciona un alumno.");
      return;
    }

    try {
      setEnrollmentLoading(true);
      setEnrollmentError("");

      const data = await getActiveEnrollment(id);
      setActiveEnrollment(data);

      setCreateForm((prev) => ({
        ...prev,
        studentId: id,
        enrollmentId:
          options?.keepEnrollmentIfProvided && prev.enrollmentId.trim() !== ""
            ? prev.enrollmentId
            : data.id,
        amount:
          options?.keepAmountIfProvided && prev.amount.trim() !== ""
            ? prev.amount
            : String(data.priceAtEnrollment),
      }));
    } catch (error: any) {
      setActiveEnrollment(null);
      setEnrollmentError(error.message);

      setCreateForm((prev) => ({
        ...prev,
        studentId: id,
        enrollmentId: "",
        amount: "",
      }));
    } finally {
      setEnrollmentLoading(false);
    }
  }

  async function fillFormFromPending(item: PendingPayment) {
    setSelectedPending(item);
    setEnrollmentError("");
    setActiveEnrollment(null);

    setCreateForm({
      studentId: item.studentId,
      enrollmentId: item.enrollmentId,
      amount: String(item.expectedAmount),
      paymentDate: getTodayLocalDate(),
      month: item.month,
    });

    setStudentIdSearch(item.studentId);
    setCreateMessage("Formulario cargado correctamente.");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    await loadStudentPayments(item.studentId);
    await loadActiveEnrollment(item.studentId, {
      keepAmountIfProvided: true,
      keepEnrollmentIfProvided: true,
    });
  }

  async function handleStudentChange(studentId: string) {
    setSelectedPending(null);
    setCreateMessage("");

    setCreateForm((prev) => ({
      ...prev,
      studentId,
      enrollmentId: "",
      amount: "",
    }));

    if (!studentId.trim()) {
      setActiveEnrollment(null);
      setEnrollmentError("");
      return;
    }

    await loadActiveEnrollment(studentId);
  }

  async function handleCreatePayment(e: FormEvent) {
    e.preventDefault();
    setCreateMessage("");

    if (!canCreatePayment) {
      setCreateMessage("Completa todos los campos.");
      return;
    }

    try {
      setCreateLoading(true);

      await createPayment({
        studentId: createForm.studentId.trim(),
        enrollmentId: createForm.enrollmentId.trim(),
        amount: Number(createForm.amount),
        paymentDate: createForm.paymentDate,
        month: createForm.month.trim(),
      });

      setCreateMessage("Pago registrado correctamente.");

      const createdStudentId = createForm.studentId.trim();
      const createdMonth = createForm.month.trim();

      setCreateForm((prev) => ({
        ...prev,
        amount: activeEnrollment
          ? String(activeEnrollment.priceAtEnrollment)
          : prev.amount,
      }));

      await loadStudentPayments(createdStudentId);
      await loadPendingPayments(createdMonth);

      setSelectedPending(null);
    } catch (error: any) {
      setCreateMessage(`Ocurrió un error: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  }

  async function loadStudentPayments(studentId?: string) {
    const id = (studentId ?? studentIdSearch).trim();

    if (!id) {
      setStudentPaymentsError("Selecciona un alumno.");
      setStudentPayments([]);
      return;
    }

    try {
      setStudentPaymentsLoading(true);
      setStudentPaymentsError("");

      const data = await getStudentPayments(id);
      setStudentPayments(data);
    } catch (error: any) {
      setStudentPayments([]);
      setStudentPaymentsError(error.message);
    } finally {
      setStudentPaymentsLoading(false);
    }
  }

  async function loadPendingPayments(month?: string) {
    const selectedMonth = (month ?? pendingMonth).trim();

    if (!selectedMonth) {
      setPendingError("Ingresa un mes en formato YYYY-MM.");
      setPendingPayments([]);
      return;
    }

    try {
      setPendingLoading(true);
      setPendingError("");

      const data = await getPendingPayments(selectedMonth);
      setPendingPayments(data);
    } catch (error: any) {
      setPendingPayments([]);
      setPendingError(error.message);
    } finally {
      setPendingLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Payments</h1>
            <p className="muted">Registro manual y consultas de pagos.</p>
          </div>
        </div>

        <div className="grid">
          <section className="card">
            <div className="section-title-row">
              <h2>Registrar pago</h2>

              <button
                type="button"
                className="button-secondary"
                onClick={clearCreateForm}
              >
                Limpiar
              </button>
            </div>

            {studentsError && (
              <div className="message-box error">{studentsError}</div>
            )}

            {groupsError && (
              <div className="message-box error">{groupsError}</div>
            )}

            <form onSubmit={handleCreatePayment} className="form-grid">
              <div className="field">
                <label>Alumno</label>
                <select
                  className="select-input"
                  value={createForm.studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  disabled={studentsLoading || enrollmentLoading}
                >
                  <option value="">
                    {studentsLoading
                      ? "Cargando alumnos..."
                      : "Selecciona un alumno"}
                  </option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName} - {student.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Alumno seleccionado</label>
                <input
                  value={
                    selectedStudent
                      ? `${selectedStudent.fullName} - ${selectedStudent.email}`
                      : ""
                  }
                  readOnly
                  placeholder="Se llena automáticamente"
                />
              </div>

              {activeEnrollment && (
                <div className="detail-item">
                  <strong>Alumno</strong>
                  <span>
                    {activeStudent
                      ? `${activeStudent.fullName} - ${activeStudent.email}`
                      : "N/A"}
                  </span>
                </div>
              )}

              {activeEnrollment && (
                <div className="detail-item">
                  <strong>Grupo</strong>
                  <span>
                    {activeGroup
                      ? `${activeGroup.level} | ${activeGroup.schedule}`
                      : "N/A"}
                  </span>
                </div>
              )}

              <div className="field">
                <label>Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.amount}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, amount: e.target.value })
                  }
                  placeholder="1500"
                />
              </div>

              <div className="field">
                <label>Fecha de pago</label>
                <input
                  type="date"
                  value={createForm.paymentDate}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      paymentDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Mes de pago (YYYY-MM)</label>
                <input
                  value={createForm.month}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, month: e.target.value })
                  }
                  placeholder="2026-03"
                />
              </div>

              {enrollmentLoading && (
                <div className="message-box">Cargando inscripción activa...</div>
              )}

              {enrollmentError && (
                <div className="message-box error">{enrollmentError}</div>
              )}

              {activeEnrollment && (
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Precio vigente</strong>
                    <span>{formatMoney(activeEnrollment.priceAtEnrollment)}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Día de cobro</strong>
                    <span>{activeEnrollment.chargeDayAtEnrollment}</span>
                  </div>
                </div>
              )}

              <div className="actions">
                <button type="submit" disabled={createLoading || !canCreatePayment}>
                  {createLoading ? "Guardando..." : "Registrar pago"}
                </button>
              </div>
            </form>

            {createMessage && <div className="message-box">{createMessage}</div>}
          </section>

          <section className="card">
            <div className="section-title-row">
              <h2>Consultar pagos por alumno</h2>

              <button
                type="button"
                className="button-secondary"
                onClick={() => loadStudentPayments()}
                disabled={studentPaymentsLoading}
              >
                {studentPaymentsLoading ? "Consultando..." : "Recargar"}
              </button>
            </div>

            <div className="field">
              <label>Alumno</label>
              <select
                className="select-input"
                value={studentIdSearch}
                onChange={(e) => setStudentIdSearch(e.target.value)}
                disabled={studentsLoading}
              >
                <option value="">
                  {studentsLoading
                    ? "Cargando alumnos..."
                    : "Selecciona un alumno"}
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} - {student.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="actions">
              <button
                type="button"
                onClick={() => loadStudentPayments()}
                disabled={studentPaymentsLoading}
              >
                {studentPaymentsLoading ? "Consultando..." : "Consultar"}
              </button>
            </div>

            {studentPaymentsError && (
              <div className="message-box error">{studentPaymentsError}</div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pago ref.</th>
                    <th>Mes</th>
                    <th>Monto</th>
                    <th>Fecha de pago</th>
                    <th>Estatus</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {studentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-cell">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    studentPayments.map((item) => (
                      <tr key={item.id}>
                        <td>{shortId(item.id)}</td>
                        <td>{item.month}</td>
                        <td>{formatMoney(item.amount)}</td>
                        <td>{formatDate(item.paymentDate)}</td>
                        <td>{item.status}</td>
                        <td>{formatDate(item.createdAtUtc)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card card-full">
            <div className="section-title-row">
              <h2>Pagos pendientes por mes</h2>

              <div className="section-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    const month = getCurrentMonth();
                    setPendingMonth(month);
                    loadPendingPayments(month);
                  }}
                  disabled={pendingLoading}
                >
                  Mes actual
                </button>

                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => loadPendingPayments()}
                  disabled={pendingLoading}
                >
                  {pendingLoading ? "Consultando..." : "Recargar"}
                </button>
              </div>
            </div>

            <div className="inline-bar">
              <input
                value={pendingMonth}
                onChange={(e) => setPendingMonth(e.target.value)}
                placeholder="YYYY-MM"
              />
              <button
                type="button"
                onClick={() => loadPendingPayments()}
                disabled={pendingLoading}
              >
                {pendingLoading ? "Consultando..." : "Ver pendientes"}
              </button>
            </div>

            {pendingError && (
              <div className="message-box error">{pendingError}</div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Alumno</th>
                    <th>Grupo</th>
                    <th>Monto esperado</th>
                    <th>Día de cobro</th>
                    <th>Mes</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-cell">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    pendingPayments.map((item, index) => {
                      const isSelected = isSamePending(item, selectedPending);
                      const student = students.find((s) => s.id === item.studentId);
                      const group = groups.find((g) => g.id === item.groupId);

                      return (
                        <tr
                          key={`${item.studentId}-${item.enrollmentId}-${index}`}
                          className={isSelected ? "row-selected" : ""}
                        >
                          <td>
                            <button
                              type="button"
                              onClick={() => fillFormFromPending(item)}
                            >
                              Usar
                            </button>
                          </td>
                          <td>
                            {student
                              ? `${student.fullName} - ${student.email}`
                              : "N/A"}
                          </td>
                          <td>
                            {group
                              ? `${group.level} | ${group.schedule}`
                              : "N/A"}
                          </td>
                          <td>{formatMoney(item.expectedAmount)}</td>
                          <td>{item.chargeDay}</td>
                          <td>{item.month}</td>
                          <td>{item.status}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}