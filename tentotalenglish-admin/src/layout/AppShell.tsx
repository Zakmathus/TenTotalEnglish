import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./shell.css";

export default function AppShell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <div className="app-shell">
        <Sidebar open={open} onClose={() => setOpen(false)} />

        <div className="app-main">
          <Topbar onMenu={() => setOpen(true)} />
          <div className="app-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
