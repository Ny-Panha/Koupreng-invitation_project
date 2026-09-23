import { useEffect, useState } from "react";
import adminService from "../../shared/api/adminService";

export default function AdminPaymentsFeature() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminService.payments()
      .then((data) => active && setPayments(Array.isArray(data) ? data : []))
      .catch((loadError) => active && setError(loadError.message || "Could not load payments."));
    return () => { active = false; };
  }, []);

  return (
    <main className="admin-page">
      <header className="page-head"><div><h1 className="page-title">Payments</h1><p className="page-subtitle">Review payment orders.</p></div></header>
      {error && <p role="alert">{error}</p>}
      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Template</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{payments.map((item) => <tr key={item.orderCode || item.id}><td>{item.orderCode}</td><td>{item.templateName || item.itemType}</td><td>{item.amount} {item.currency}</td><td>{item.status}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}