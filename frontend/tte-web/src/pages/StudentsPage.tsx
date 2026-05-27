import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createStudent,
  getStudentById,
  getStudents,
  Student,
} from "../api/studentsApi";

const RECENT_STUDENTS_KEY = "tte_recent_students";

function getTodayLocalDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

type RecentStudentItem = {
  id: string;
  fullName: string;
  email: string;
};

function isValidRecentStudent(item: any): item is RecentStudentItem {
  return (
    item &&
    typeof item.id === "string" &&
    item.id.trim() !== "" &&
    typeof item.fullName === "string" &&
    item.fullName.trim() !== "" &&
    typeof item.email === "string" &&
    item.email.trim() !== ""
  );
}

function loadRecentStudents(): RecentStudentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_STUDENTS_KEY);
    if (!raw) return [];

    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data.filter(isValidRecentStudent);
  } catch {
    return [];
  }
}

function saveRecentStudents(items: RecentStudentItem[]) {
  localStorage.setItem(RECENT_STUDENTS_KEY, JSON.stringify(items));
}

function addRecentStudent(item: RecentStudentItem): RecentStudentItem[] {
  const current = loadRecentStudents();

  const filtered = current.filter((x) => x.id !== item.id);

  const updated = [item, ...filtered]
    .filter(isValidRecentStudent)
    .slice(0, 10);

  saveRecentStudents(updated);
  return updated;
}

export default function StudentsPage() {
  const navigate = useNavigate();

  const [createForm, setCreateForm] = useState({
    fullName: "",
    birthDate: "",
    phone: "",
    email: "",
    occupation: "",
    neighborhood: "",
    companyName: "",
    companySupport: false,
    companySupportAmount: "",
  });

  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [studentSearchText, setStudentSearchText] = useState("");

  const [createLoading, setCreateLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [createMessage, setCreateMessage] = useState("");
  const [searchError, setSearchError] = useState("");
  const [listError, setListError] = useState("");

  const [studentResult, setStudentResult] = useState<Student | null>(null);
  const [recentStudents, setRecentStudents] = useState<RecentStudentItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const cleaned = loadRecentStudents();
    setRecentStudents(cleaned);
    saveRecentStudents(cleaned);
  }, []);

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const search = studentSearchText.trim().toLowerCase();

    if (!search) return students;

    return students.filter((student) => {
      return (
        student.fullName.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.id.toLowerCase().includes(search)
      );
    });
  }, [students, studentSearchText]);

  function clearCreateForm() {
    setCreateForm({
      fullName: "",
      birthDate: "",
      phone: "",
      email: "",
      occupation: "",
      neighborhood: "",
      companyName: "",
      companySupport: false,
      companySupportAmount: "",
    });
    setCreateMessage("");
  }

  function goToPayments(studentId: string) {
    navigate("/payments", {
      state: {
        studentId,
      },
    });
  }

  function goToEnrollments(studentId: string) {
    navigate("/enrollments", {
      state: {
        studentId,
      },
    });
  }

  async function loadStudents() {
    try {
      setListLoading(true);
      setListError("");

      const data = await getStudents();
      setStudents(data);
    } catch (error: any) {
      setListError(error.message);
      setStudents([]);
    } finally {
      setListLoading(false);
    }
  }

  async function handleCreateStudent(e: FormEvent) {
    e.preventDefault();
    setCreateMessage("");

    if (!createForm.fullName.trim() || !createForm.email.trim()) {
      setCreateMessage("Full Name y Email son obligatorios.");
      return;
    }

    try {
      setCreateLoading(true);

      const fullName = createForm.fullName.trim();
      const email = createForm.email.trim();

      const result = await createStudent({
        fullName,
        birthDate: createForm.birthDate || undefined,
        phone: createForm.phone.trim() || undefined,
        email,
        occupation: createForm.occupation.trim() || undefined,
        neighborhood: createForm.neighborhood.trim() || undefined,
        companyName: createForm.companyName.trim() || undefined,
        companySupport: createForm.companySupport,
        companySupportAmount: createForm.companySupportAmount
          ? Number(createForm.companySupportAmount)
          : undefined,
      });

      setCreateMessage("Alumno guardado correctamente.");
      setStudentIdSearch(result.id);

      const updated = addRecentStudent({
        id: result.id,
        fullName,
        email,
      });

      setRecentStudents(updated);

      clearCreateForm();
      await handleSearchStudent(result.id);
      await loadStudents();
    } catch (error: any) {
      setCreateMessage(`Ocurrió un error: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSearchStudent(studentId?: string) {
    const id = (studentId ?? studentIdSearch).trim();

    if (!id) {
      setSearchError("Selecciona un alumno.");
      setStudentResult(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const data = await getStudentById(id);
      setStudentResult(data);

      const updated = addRecentStudent({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
      });

      setRecentStudents(updated);
      setStudentIdSearch(data.id);
    } catch (error: any) {
      setStudentResult(null);
      setSearchError(error.message);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Students</h1>
            <p className="muted">Registro y consulta básica de alumnos.</p>
          </div>
        </div>

        <div className="grid">
          <section className="card">
            <div className="section-title-row">
              <h2>Registrar alumno</h2>

              <button
                type="button"
                className="button-secondary"
                onClick={clearCreateForm}
              >
                Limpiar
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="form-grid">
              <div className="field">
                <label>Nombre completo *</label>
                <input
                  value={createForm.fullName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fullName: e.target.value })
                  }
                  placeholder="Nombre completo"
                />
              </div>

              <div className="field">
                <label>Email *</label>
                <input
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="correo@dominio.com"
                />
              </div>

              <div className="field">
                <label>Fecha de nacimiento</label>
                <input
                  type="date"
                  value={createForm.birthDate}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, birthDate: e.target.value })
                  }
                  max={getTodayLocalDate()}
                />
              </div>

              <div className="field">
                <label>Teléfono</label>
                <input
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder="6641234567"
                />
              </div>

              <div className="field">
                <label>Ocupación</label>
                <input
                  value={createForm.occupation}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, occupation: e.target.value })
                  }
                  placeholder="Occupation"
                />
              </div>

              <div className="field">
                <label>Colonia</label>
                <input
                  value={createForm.neighborhood}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      neighborhood: e.target.value,
                    })
                  }
                  placeholder="Neighborhood"
                />
              </div>

              <div className="field">
                <label>Empresa</label>
                <input
                  value={createForm.companyName}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      companyName: e.target.value,
                    })
                  }
                  placeholder="Company"
                />
              </div>

              <div className="field">
                <label>Apoyo de empresa</label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.companySupportAmount}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      companySupportAmount: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={createForm.companySupport}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        companySupport: e.target.checked,
                      })
                    }
                  />
                  <span>La empresa apoya al alumno</span>
                </label>
              </div>

              <div className="actions">
                <button type="submit" disabled={createLoading}>
                  {createLoading ? "Guardando..." : "Registrar alumno"}
                </button>
              </div>
            </form>

            {createMessage && <div className="message-box">{createMessage}</div>}
          </section>

          <section className="card">
            <div className="section-title-row">
              <h2>Consulta rápida</h2>

              <button
                type="button"
                className="button-secondary"
                onClick={() => handleSearchStudent()}
                disabled={searchLoading}
              >
                {searchLoading ? "Consultando..." : "Consultar"}
              </button>
            </div>

            <div className="field">
              <label>Seleccionar alumno</label>
              <select
                className="select-input"
                value={studentIdSearch}
                onChange={(e) => {
                  setStudentIdSearch(e.target.value);
                  setSearchError("");
                }}
              >
                <option value="">Selecciona un alumno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} - {student.email}
                  </option>
                ))}
              </select>
            </div>

            {searchError && (
              <div className="message-box error">{searchError}</div>
            )}

            {studentResult ? (
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Alumno ID</strong>
                  <span>{studentResult.id}</span>
                </div>

                <div className="detail-item">
                  <strong>Nombre</strong>
                  <span>{studentResult.fullName}</span>
                </div>

                <div className="detail-item">
                  <strong>Email</strong>
                  <span>{studentResult.email}</span>
                </div>

                <div className="detail-item">
                  <strong>Teléfono</strong>
                  <span>{studentResult.phone || "-"}</span>
                </div>

                <div className="detail-item">
                  <strong>Fecha de nacimiento</strong>
                  <span>{studentResult.birthDate || "-"}</span>
                </div>

                <div className="detail-item">
                  <strong>Ocupación</strong>
                  <span>{studentResult.occupation || "-"}</span>
                </div>

                <div className="detail-item">
                  <strong>Colonia</strong>
                  <span>{studentResult.neighborhood || "-"}</span>
                </div>

                <div className="detail-item">
                  <strong>Creado</strong>
                  <span>{formatDate(studentResult.createdAtUtc)}</span>
                </div>

                <div className="details-actions">
                  <button
                    type="button"
                    onClick={() => goToPayments(studentResult.id)}
                  >
                    Usar en Payments
                  </button>

                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => goToEnrollments(studentResult.id)}
                  >
                    Usar en Enrollments
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-panel">Sin alumno cargado</div>
            )}
          </section>

          <section className="card card-full">
            <div className="section-title-row">
              <h2>Listado de alumnos</h2>

              <div className="section-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={loadStudents}
                  disabled={listLoading}
                >
                  {listLoading ? "Cargando..." : "Recargar"}
                </button>
              </div>
            </div>

            <div className="inline-bar">
              <input
                value={studentSearchText}
                onChange={(e) => setStudentSearchText(e.target.value)}
                placeholder="Buscar por nombre, email o ID"
              />
            </div>

            {listError && <div className="message-box error">{listError}</div>}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Colonia</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-cell">
                        {listLoading ? "Cargando..." : "Sin resultados"}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              onClick={() => handleSearchStudent(student.id)}
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              className="button-secondary"
                              onClick={() => goToPayments(student.id)}
                            >
                              Payments
                            </button>
                            <button
                              type="button"
                              className="button-secondary"
                              onClick={() => goToEnrollments(student.id)}
                            >
                              Enroll
                            </button>
                          </div>
                        </td>
                        <td>{student.fullName}</td>
                        <td>{student.email}</td>
                        <td>{student.phone || "-"}</td>
                        <td>{student.neighborhood || "-"}</td>
                        <td>{formatDate(student.createdAtUtc)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card card-full">
            <div className="section-title-row">
              <h2>Recientes</h2>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Alumno ID</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-cell">
                        Sin recientes
                      </td>
                    </tr>
                  ) : (
                    recentStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              onClick={() => handleSearchStudent(student.id)}
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              className="button-secondary"
                              onClick={() => goToPayments(student.id)}
                            >
                              Payments
                            </button>
                          </div>
                        </td>
                        <td>{student.fullName}</td>
                        <td>{student.email}</td>
                        <td>{student.id}</td>
                      </tr>
                    ))
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