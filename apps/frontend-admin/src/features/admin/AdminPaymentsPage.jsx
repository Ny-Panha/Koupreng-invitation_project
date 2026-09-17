import { useMemo, useState } from "react";
import { Loading, ErrorState, Empty } from "../../components/States";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../lib/format";
import adminManagementService from "./adminManagementService";
import "./AdminFeature.css";

const ABA_PAYWAY_STATIC_LINK = "https://pay.ababank.com/oRF8/vx2dp884";

function money(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = Number(amount);
  const formatted = isNaN(num) ? amount : num.toFixed(2);
  return `${currency || "USD"} ${formatted}`;
}

export default function AdminPaymentsPage() {
  const { data, loading, error, reload } = useResource(adminManagementService.payments);
  const [query, setQuery] = useState("");
  const [confirmingCode, setConfirmingCode] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const handleConfirm = async (payment) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់ Confirm Payment សម្រាប់ Order ${payment.orderCode} មែនទេ?`)) {
      return;
    }
    setConfirmingCode(payment.orderCode);
    setActionMessage("");
    try {
      await adminManagementService.confirmPayment({
        orderCode: payment.orderCode,
        amount: payment.amount || 0.01,
        confirmedBy: "admin",
      });
      setActionMessage(`Order ${payment.orderCode} បាន Confirm ជោគជ័យ!`);
      await reload();
    } catch (err) {
      alert(err.message || "Failed to confirm payment");
    } finally {
      setConfirmingCode(null);
    }
  };

  const payments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((payment) => {
      if (!q) return true;
      return [
        payment.orderCode,
        payment.templateName,
        payment.packageName,
        payment.status,
        payment.provider,
        payment.itemType,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
    });
  }, [data, query]);

  const totals = useMemo(() => {
    const rows = data || [];
    return {
      total: rows.length,
      pending: rows.filter((row) => String(row.status || "").includes("PENDING")).length,
      paid: rows.filter((row) => String(row.status || "") === "PAID").length,
      failed: rows.filter((row) => ["FAILED", "REJECTED", "CANCELLED", "EXPIRED"].includes(String(row.status || ""))).length,
    };
  }, [data]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Payments</h2>
          <p className="page-subtitle">Template and subscription payment orders from the active admin API.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <a
            href={ABA_PAYWAY_STATIC_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
          >
            <span>🔗 ABA Pay Link</span>
          </a>
          <button type="button" className="btn btn-ghost" onClick={reload}>Refresh</button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ marginBottom: "16px", padding: "10px 16px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderRadius: "8px", fontWeight: "600" }}>
          {actionMessage}
        </div>
      )}

      <section className="admin-feature-grid">
        <article className="admin-feature-card"><span>Total</span><strong>{totals.total}</strong></article>
        <article className="admin-feature-card"><span>Pending</span><strong>{totals.pending}</strong></article>
        <article className="admin-feature-card"><span>Paid</span><strong>{totals.paid}</strong></article>
        <article className="admin-feature-card"><span>Failed</span><strong>{totals.failed}</strong></article>
      </section>

      <section className="card">
        <div className="toolbar">
          <input className="text-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payments..." />
        </div>

        {loading ? <Loading /> : error ? <ErrorState onRetry={reload} /> : payments.length === 0 ? <Empty label="រកមិនឃើញទិន្នន័យការទូទាត់ទេ" /> : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Created</th>
                  <th>Paid</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.orderCode}>
                    <td><strong>{payment.orderCode || "—"}</strong></td>
                    <td>{payment.templateName || payment.packageName || "—"}</td>
                    <td>{payment.itemType || (payment.orderCode?.startsWith("SUB") ? "SUBSCRIPTION" : "TEMPLATE")}</td>
                    <td>{money(payment.amount, payment.currency)}</td>
                    <td>
                      <span className={`badge ${payment.status === "PAID" ? "badge-green" : String(payment.status || "").includes("PENDING") ? "badge-amber" : "badge-gray"}`}>
                        {payment.status || "—"}
                      </span>
                    </td>
                    <td>{payment.provider || "—"}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td>
                      {String(payment.status || "").includes("PENDING") ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={confirmingCode === payment.orderCode}
                          onClick={() => handleConfirm(payment)}
                          style={{ padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer" }}
                        >
                          {confirmingCode === payment.orderCode ? "..." : "Confirm"}
                        </button>
                      ) : (
                        <span style={{ color: "#888", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
