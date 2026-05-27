import { NavLink, Route, Routes } from "react-router-dom";
import StudentsPage from "./pages/StudentsPage";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import PaymentsPage from "./pages/PaymentsPage";
import GroupsPage from "./pages/GroupsPage";

function HomePage() {
  return (
    <div className="app-shell">
      <div className="page">
        <section className="home-hero">
          <div className="card home-hero-card">
            <div className="hero-badge">MVP operativo</div>
            <h1 className="hero-title">TotalEnglish</h1>
            <p className="hero-text">
              Sistema simple para secretarias: alumnos, grupos, inscripciones y
              pagos manuales en un solo lugar.
            </p>

            <div className="kpi-strip">
              <div className="kpi-card">
                <div className="kpi-label">Students</div>
                <div className="kpi-value">Alta y consulta</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Groups</div>
                <div className="kpi-value">Horarios y cobro</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Enrollments</div>
                <div className="kpi-value">1 activo por alumno</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Payments</div>
                <div className="kpi-value">Registro manual</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid">
          <section className="card">
            <h2>Students</h2>
            <p className="muted">
              Registrar alumnos, consultarlos rápido y enviarlos a Enrollments
              o Payments sin capturar IDs manualmente.
            </p>
            <div className="home-actions">
              <NavLink className="button-link" to="/students">
                Abrir Students
              </NavLink>
            </div>
          </section>

          <section className="card">
            <h2>Groups</h2>
            <p className="muted">
              Crear grupos, definir horarios, mensualidad y día de cobro para
              cada nivel.
            </p>
            <div className="home-actions">
              <NavLink className="button-link" to="/groups">
                Abrir Groups
              </NavLink>
            </div>
          </section>

          <section className="card">
            <h2>Enrollments</h2>
            <p className="muted">
              Inscribir alumnos a grupos y consultar su inscripción activa con
              la información relevante.
            </p>
            <div className="home-actions">
              <NavLink className="button-link" to="/enrollments">
                Abrir Enrollments
              </NavLink>
            </div>
          </section>

          <section className="card">
            <h2>Payments</h2>
            <p className="muted">
              Registrar pagos manualmente, consultar historial y revisar pagos
              pendientes por mes.
            </p>
            <div className="home-actions">
              <NavLink className="button-link" to="/payments">
                Abrir Payments
              </NavLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <header className="top-nav">
        <div className="top-nav-inner">
          <div className="brand">
            <div className="brand-title">TotalEnglish</div>
            <div className="brand-subtitle">School Admin MVP</div>
          </div>

          <nav className="top-nav-links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              end
            >
              Home
            </NavLink>

            <NavLink
              to="/students"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Students
            </NavLink>

            <NavLink
              to="/groups"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Groups
            </NavLink>

            <NavLink
              to="/enrollments"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Enrollments
            </NavLink>

            <NavLink
              to="/payments"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Payments
            </NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/enrollments" element={<EnrollmentsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </>
  );
}