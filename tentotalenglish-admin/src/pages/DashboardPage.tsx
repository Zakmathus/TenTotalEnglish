import "./dashboard.css";

export default function DashboardPage() {
  return (
    <div className="dash">
      <h1>Dashboard</h1>

      <div className="cards">
        <div className="kpi orange">
          <div className="kpi-title">Total Students</div>
          <div className="kpi-value">320</div>
        </div>

        <div className="kpi blue">
          <div className="kpi-title">Courses</div>
          <div className="kpi-value">12</div>
        </div>

        <div className="kpi teal">
          <div className="kpi-title">Class Avg. Score</div>
          <div className="kpi-value">86/100</div>
        </div>

        <div className="kpi yellow">
          <div className="kpi-title">Enrollments</div>
          <div className="kpi-value">28</div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Students Overview</div>
            <button className="chip">Last 7 days ▾</button>
          </div>

          <div className="chart-placeholder">
            📈 Aquí va tu chart (luego metemos Recharts)
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent Payments</div>
            <button className="link">View all →</button>
          </div>

          <div className="list">
            <div className="row">
              <div className="ico">💳</div>
              <div className="row-main">
                <div className="row-title">Payment - Emma Johnson</div>
                <div className="row-sub">Jan 12 • $1200</div>
              </div>
              <div className="row-meta">2h ago</div>
            </div>

            <div className="row">
              <div className="ico">💳</div>
              <div className="row-main">
                <div className="row-title">Payment - David Smith</div>
                <div className="row-sub">Jan 11 • $900</div>
              </div>
              <div className="row-meta">1d ago</div>
            </div>
          </div>
        </section>

        <section className="panel span-2">
          <div className="panel-head">
            <div className="panel-title">Student List</div>
            <button className="chip">View all</button>
          </div>

          <div className="table">
            <div className="thead">
              <div>Name</div>
              <div>Course</div>
              <div>Status</div>
              <div>Avg. Score</div>
            </div>

            {[
              { name: "Emma Johnson", course: "Intermediate English", status: "Active", score: 92 },
              { name: "David Smith", course: "Business English", status: "Active", score: 88 },
              { name: "James Lee", course: "TOEFL Prep", status: "Inactive", score: 0 },
            ].map((s) => (
              <div className="trow" key={s.name}>
                <div className="name">
                  <span className="mini-avatar">🙂</span>
                  {s.name}
                </div>
                <div>{s.course}</div>
                <div>
                  <span className={`badge ${s.status === "Active" ? "ok" : "off"}`}>
                    {s.status}
                  </span>
                </div>
                <div>{s.score}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
