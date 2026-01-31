import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "./shell.css";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => "A", []);

  return (
    <header className="topbar topbar--glass">
      {/* Mobile menu */}
      <button className="topbar-menu" onClick={onMenu} title="Menu" aria-label="Open menu">
        ☰
      </button>

      <div className="topbar-search" role="search">
        <span className="topbar-search-ico" aria-hidden="true">
          🔍
        </span>
        <input className="topbar-search-input" placeholder="Search here..." />
      </div>

      <div className="topbar-user">
        <button
          className="topbar-user-btn"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="topbar-avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="topbar-user-name">Admin</span>
          <span className="topbar-user-caret" aria-hidden="true">
            ▾
          </span>
        </button>

        {open && (
          <div className="topbar-user-menu" role="menu">
            <button className="topbar-user-item" onClick={() => setOpen(false)} role="menuitem">
              Profile
            </button>
            <button
              className="topbar-user-item danger"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              role="menuitem"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
