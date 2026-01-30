import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo.png";
import "./shell.css";

const items = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/teachers", label: "Teachers" },
  { to: "/courses", label: "Courses" },
  { to: "/enrollments", label: "Enrollments" },
  { to: "/payments", label: "Payments" },
  { to: "/reports", label: "Reports" },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useAuth();

  return (
    <aside className={"sidebar" + (open ? " open" : "")}>
      <div className="sidebar-brand">
        <img className="brand-logo" src={logo} alt="Total English" />
        <div className="brand-text">
          <div className="brand-title">TOTAL</div>
          <div className="brand-subtitle">ENGLISH</div>
        </div>
      </div>

      <nav className="sidebar-nav" onClick={onClose}>
        {items.map((x) => (
          <NavLink
            key={x.to}
            to={x.to}
            className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          >
            <span className="nav-dot" />
            {x.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-pill" onClick={() => alert("Settings (pendiente)")}>
          Settings
        </div>

        <div
          className="footer-pill logout"
          onClick={() => {
            logout();
            onClose();
          }}
        >
          Logout
        </div>
      </div>
    </aside>
  );
}
