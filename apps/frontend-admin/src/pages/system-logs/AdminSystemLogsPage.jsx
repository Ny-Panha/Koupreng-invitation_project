import { useEffect, useState } from "react";
import adminService from "../../shared/api/adminService";

export default function AdminSystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminService.systemLogs()
      .then((data) => active && setLogs(Array.isArray(data) ? data : []))
      .catch((loadError) => active && setError(loadError.message || "Could not load system logs."));
    return () => { active = false; };
  }, []);

  return (
    <main className="admin-page">
      <header className="page-head"><div><h1 className="page-title">System Logs</h1><p className="page-subtitle">Monitor system activity and exceptions.</p></div></header>
      {error && <p role="alert">{error}</p>}
      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Event</th><th>Level</th><th>Message</th><th>Created</th></tr></thead>
          <tbody>{logs.map((item, index) => <tr key={item.id || index}><td>{item.eventType || item.event || "-"}</td><td>{item.level || item.severity || "-"}</td><td>{item.message || item.details || "-"}</td><td>{item.createdAt || "-"}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}