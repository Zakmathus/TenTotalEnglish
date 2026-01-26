import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { CoursesPage } from "./pages/CoursesPage";
import { EnrollmentsPage } from "./pages/EnrollmentsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReportsPage } from "./pages/ReportsPage";

function Shell() {
  const { logout } = useAuth();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
      <aside style={{ padding: 16, borderRight: "1px solid #ddd" }}>
        <h3>tentotalenglish</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/students">Students</Link>
          <Link to="/teachers">Teachers</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/enrollments">Enrollments</Link>
          <Link to="/payments">Payments</Link>
          <Link to="/reports">Reports</Link>
          <button onClick={logout} style={{ marginTop: 16 }}>Logout</button>
        </nav>
      </aside>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/enrollments" element={<EnrollmentsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <Shell />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
