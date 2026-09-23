import { useEffect, useState } from "react";
import adminService from "../../shared/api/adminService";

export default function AdminNotificationsFeature() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminService.notifications()
      .then((data) => active && setNotifications(Array.isArray(data) ? data : []))
      .catch((loadError) => active && setError(loadError.message || "Could not load notifications."));
    return () => { active = false; };
  }, []);

  return (
    <main className="admin-page">
      <header className="page-head"><div><h1 className="page-title">Notifications</h1><p className="page-subtitle">Send and monitor system notifications.</p></div></header>
      {error && <p role="alert">{error}</p>}
      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Message</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>{notifications.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.message}</td><td>{item.type}</td><td>{item.status}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}