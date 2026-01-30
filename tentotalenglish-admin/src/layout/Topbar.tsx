import "./shell.css";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onMenu} title="Menu">
        ☰
      </button>

      <div className="topbar-right">
        <button className="icon-btn" title="Notifications">🔔</button>
        <button className="icon-btn" title="Messages">💬</button>

        <div className="user-chip">
          <div className="avatar">👤</div>
          <div className="user-meta">
            <div className="user-name">Admin</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
