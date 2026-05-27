import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ActiveEnrollment,
  createEnrollment,
  getActiveEnrollment,
} from "../api/enrollmentsApi";
import { getStudents, Student } from "../api/studentsApi";
import { getGroups, Group } from "../api/groupsApi";

function getTodayLocalDateTime(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value?: string): string {
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

export default function EnrollmentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state as { studentId?: string } | null;
  const studentIdFromState = routeState?.studentId ?? "";

  const [form, setForm] = useState({
    studentId: "",
    groupId: "",
    startDate: getTodayLocalDateTime(),
    priceAtEnrollment: "",
    chargeDayAtEnrollment: "",
  });

  const [searchStudentId, setSearchStudentId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [createLoading, setCreateLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [searchError, setSearchError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [groupsError, setGroupsError] = useState("");

  const [activeEnrollment, setActiveEnrollment] =
    useState<ActiveEnrollment | null>(null);

  useEffect(() => {
    loadStudents();
    loadGroups();
  }, []);

  useEffect(() => {
    if (!studentIdFromState) return;

    setForm((prev) => ({
      ...prev,
      studentId: studentIdFromState,
    }));

    setSearchStudentId(studentIdFromState);
    handleSearch(studentIdFromState);
  }, [studentIdFromState]);

  const selectedGroup = useMemo(() => {
    return groups.find((group) => group.id === form.groupId) ?? null;
  }, [groups, form.groupId]);

  const searchStudent = useMemo(() => {
    return students.find((student) => student.id === searchStudentId) ?? null;
  }, [students, searchStudentId]);

  const activeGroup = useMemo(() => {
    if (!activeEnrollment) return null;
    return groups.find((group) => group.id === activeEnrollment.groupId) ?? null;
  }, [groups, activeEnrollment]);

  useEffect(() => {
    if (!selectedGroup) return;

    setForm((prev) => ({
      ...prev,
      priceAtEnrollment: String(selectedGroup.monthlyPrice),
      chargeDayAtEnrollment: String(selectedGroup.chargeDay),
    }));
  }, [selectedGroup]);

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

  function clearForm() {
    setForm({
      studentId: "",
      groupId: "",
      startDate: getTodayLocalDateTime(),
      priceAtEnrollment: "",
      chargeDayAtEnrollment: "",
    });
    setMessage("");
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !form.studentId.trim() ||
      !form.groupId.trim() ||
      !form.startDate.trim() ||
      !form.priceAtEnrollment.trim() ||
      !form.chargeDayAtEnrollment.trim()
    ) {
      setMessage("Completa todos los campos.");
      return;
    }

    try {
      setCreateLoading(true);

      await createEnrollment({
        studentId: form.studentId.trim(),
        groupId: form.groupId.trim(),
        startDate: new Date(form.startDate).toISOString(),
        priceAtEnrollment: Number(form.priceAtEnrollment),
        chargeDayAtEnrollment: Number(form.chargeDayAtEnrollment),
      });

      setMessage("Inscripción guardada correctamente.");

      setSearchStudentId(form.studentId.trim());
      await handleSearch(form.studentId.trim());
    } catch (error: any) {
      setMessage(`Ocurrió un error: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSearch(studentIdParam?: string) {
    const studentId = (studentIdParam ?? searchStudentId).trim();

    if (!studentId) {
      setSearchError("Selecciona un alumno.");
      setActiveEnrollment(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const data = await getActiveEnrollment(studentId);
      setActiveEnrollment(data);
    } catch (error: any) {
      setActiveEnrollment(null);
      setSearchError(error.message);
    } finally {
      setSearchLoading(false);
    }
  }

  function useInPayments() {
    if (!activeEnrollment) return;

    navigate("/payments", {
      state: {
        studentId: activeEnrollment.studentId,
        enrollmentId: activeEnrollment.id,
        amount: activeEnrollment.priceAtEnrollment,
      },
    });
  }

  return (
    <div className="app-shell">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Enrollments</h1>
            <p className="muted">Crear y consultar inscripción activa.</p>
          </div>
        </div>

        <div className="grid">
          <section className="card">
            <div className="section-title-row">
              <h2>Crear inscripción</h2>

              <button
                type="button"
                className="button-secondary"
                onClick={clearForm}
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

            <form onSubmit={handleCreate} className="form-grid">
              <div className="field">
                <label>Alumno</label>
                <select
                  className="select-input"
                  value={form.studentId}
                  onChange={(e) =>
                    setForm({ ...form, studentId: e.target.value })
                  }
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

              <div className="field">
                <label>Grupo</label>
                <select
                  className="select-input"
                  value={form.groupId}
                  onChange={(e) =>
                    setForm({ ...form, groupId: e.target.value })
                  }
                  disabled={groupsLoading}
                >
                  <option value="">
                    {groupsLoading ? "Cargando grupos..." : "Selecciona un grupo"}
                  </option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.level} - {group.schedule} - {formatMoney(group.monthlyPrice)} - cobro día {group.chargeDay}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Fecha de inicio</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Precio al inscribir</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.priceAtEnrollment}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priceAtEnrollment: e.target.value,
                    })
                  }
                  placeholder="1500"
                />
              </div>

              <div className="field">
                <label>Día de cobro</label>
                <input
                  type="number"
                  value={form.chargeDayAtEnrollment}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      chargeDayAtEnrollment: e.target.value,
                    })
                  }
                  placeholder="15"
                />
              </div>

              {selectedGroup && (
                <div className="detail-item">
                  <strong>Grupo seleccionado</strong>
                  <span>
                    {selectedGroup.level} | {selectedGroup.schedule} |{" "}
                    {formatMoney(selectedGroup.monthlyPrice)} | cobro día{" "}
                    {selectedGroup.chargeDay}
                  </span>
                </div>
              )}

              <div className="actions">
                <button type="submit" disabled={createLoading}>
                  {createLoading ? "Guardando..." : "Crear inscripción"}
                </button>
              </div>
            </form>

            {message && <div className="message-box">{message}</div>}
          </section>

          <section className="card">
            <div className="section-title-row">
              <h2>Inscripción activa por alumno</h2>

              <button
                type="button"
                className="button-secondary"
                onClick={() => handleSearch()}
                disabled={searchLoading}
              >
                {searchLoading ? "Consultando..." : "Recargar"}
              </button>
            </div>

            <div className="field">
              <label>Alumno</label>
              <select
                className="select-input"
                value={searchStudentId}
                onChange={(e) => setSearchStudentId(e.target.value)}
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
                onClick={() => handleSearch()}
                disabled={searchLoading}
              >
                {searchLoading ? "Consultando..." : "Consultar"}
              </button>
            </div>

            {searchError && (
              <div className="message-box error">{searchError}</div>
            )}

            {activeEnrollment ? (
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Alumno</strong>
                  <span>
                    {searchStudent
                      ? `${searchStudent.fullName} - ${searchStudent.email}`
                      : "N/A"}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Grupo</strong>
                  <span>
                    {activeGroup
                      ? `${activeGroup.level} | ${activeGroup.schedule}`
                      : "N/A"}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Estatus</strong>
                  <span>{activeEnrollment.status}</span>
                </div>

                <div className="detail-item">
                  <strong>Precio</strong>
                  <span>{formatMoney(activeEnrollment.priceAtEnrollment)}</span>
                </div>

                <div className="detail-item">
                  <strong>Día de cobro</strong>
                  <span>{activeEnrollment.chargeDayAtEnrollment}</span>
                </div>

                <div className="detail-item">
                  <strong>Fecha de inicio</strong>
                  <span>{formatDate(activeEnrollment.startDate)}</span>
                </div>

                <div className="detail-item">
                  <strong>Creado</strong>
                  <span>{formatDate(activeEnrollment.createdAtUtc)}</span>
                </div>

                <div className="details-actions">
                  <button type="button" onClick={useInPayments}>
                    Usar en Payments
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-panel">Sin inscripción cargada</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}