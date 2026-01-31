import { useEffect, useState } from "react";
import { http } from "../api/http";

export function Dashboard() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    http.get("/api/me").then((r) => setMe(r.data)).catch(() => setMe(null));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <pre>{JSON.stringify(me, null, 2)}</pre>
    </div>
  );
}
