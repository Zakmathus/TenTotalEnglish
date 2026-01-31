import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "./enrollments.css";

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

function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 7h10v10H7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export function EnrollmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const studentMap = useMemo(() => {
    const m = new Map<string, string>();
    students.forEach((s) => m.set(s.id, `${s.firstName} ${s.lastName}`));
    return m;
  }, [students]);

  const courseMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [courses]);

  const loadStudents = async () => {
    const res = await http.get<Student[]>("/students");
    setStudents(res.data);
  };

  const loadCourses = async () => {
    const res = await http.get<Course[]>("/courses");
    setCourses(res.data);
  };

  const loadEnrollments = async () => {
    const params: any = {};
    if (studentId) params.studentId = studentId;
    if (courseId) params.courseId = courseId;
    if (activeOnly) params.activeOnly = true;

    const res = await http.get<Enrollment[]>("/enrollments", { params });
    setEnrollments(res.data);
  };

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  useEffect(() => {
    loadEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, courseId, activeOnly]);

  const createEnrollment = async () => {
    setError(null);
    try {
      if (!studentId) return setError("Select a student");
      if (!courseId) return setError("Select a course");

      await http.post("/enrollments", { studentId, courseId });
      await loadEnrollments();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error creating enrollment");
    }
  };

  const endEnrollment = async (id: string) => {
    setError(null);
    try {
      await http.post(`/api/enrollments/${id}/end`, { endDateUtc: null });
      await loadEnrollments();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error ending enrollment");
    }
  };

  const deleteEnrollment = async (id: string) => {
    setError(null);
    try {
      await http.delete(`/api/enrollments/${id}`);
      await loadEnrollments();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error deleting enrollment");
    }
  };

  const footerText = useMemo(() => {
    const total = enrollments.length;
    return `Showing ${total} of ${total} results`;
  }, [enrollments.length]);

  return (
    <div className="enrollments-page">
      <div className="enrollments-head">
        <h1 className="enrollments-title">Enrollments</h1>
      </div>

      <div className="enrollments-card">
        {/* Filters / Create */}
        <div className="enrollments-filters">
          <div className="enrollments-field">
            <select
              className="enrollments-select"
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

          <div className="enrollments-field">
            <select
              className="enrollments-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <label className="enrollments-check">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
            <span>Active only</span>
          </label>

          <div className="enrollments-buttons">
            <button className="enrollments-btn primary" onClick={createEnrollment}>
              Enroll
            </button>
            <button className="enrollments-btn ghost" onClick={loadEnrollments}>
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="enrollments-error">{String(error)}</div>}

        <div className="enrollments-table-wrap">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Start</th>
                <th className="center">Active</th>
                <th className="right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>{studentMap.get(e.studentId) ?? e.studentId}</td>
                  <td>{courseMap.get(e.courseId) ?? e.courseId}</td>
                  <td className="mono">{new Date(e.startDateUtc).toLocaleString()}</td>
                  <td className="center">
                    <span className={`status ${e.isActive ? "on" : "off"}`}>
                      {e.isActive ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="right">
                    <div className="enrollments-actions">
                      {e.isActive && (
                        <button
                          className="enrollments-action end"
                          onClick={() => endEnrollment(e.id)}
                        >
                          <StopIcon />
                          End
                        </button>
                      )}

                      <button
                        className="enrollments-action delete"
                        onClick={() => deleteEnrollment(e.id)}
                      >
                        <TrashIcon />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {enrollments.length === 0 && (
                <tr>
                  <td className="enrollments-empty" colSpan={5}>
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="enrollments-footer">
          <div className="enrollments-foot-left">{footerText}</div>

          <div className="enrollments-pager">
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
