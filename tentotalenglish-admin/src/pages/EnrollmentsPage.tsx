import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

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
    students.forEach(s => m.set(s.id, `${s.firstName} ${s.lastName}`));
    return m;
  }, [students]);

  const courseMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach(c => m.set(c.id, c.name));
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

  return (
    <div>
      <h2>Enrollments</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">All students</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">All courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active only
        </label>

        <button onClick={createEnrollment}>Enroll</button>
        <button onClick={loadEnrollments}>Refresh</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{String(error)}</div>}

      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th align="left">Student</th>
            <th align="left">Course</th>
            <th align="left">Start</th>
            <th align="left">Active</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map(e => (
            <tr key={e.id} style={{ borderTop: "1px solid #eee" }}>
              <td>{studentMap.get(e.studentId) ?? e.studentId}</td>
              <td>{courseMap.get(e.courseId) ?? e.courseId}</td>
              <td>{new Date(e.startDateUtc).toLocaleString()}</td>
              <td>{e.isActive ? "Yes" : "No"}</td>
              <td style={{ display: "flex", gap: 8 }}>
                {e.isActive && (
                  <button onClick={() => endEnrollment(e.id)}>End</button>
                )}
                <button onClick={() => deleteEnrollment(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
