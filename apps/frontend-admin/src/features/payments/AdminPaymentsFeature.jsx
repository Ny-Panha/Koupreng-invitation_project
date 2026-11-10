import { RefreshStatus } from '../../shared/ui/AdminSkeleton';
import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Loading, ErrorState, Empty, Toast } from "../../shared/ui";
import { useResource, useToast } from "../../shared/hooks";
import { formatDate } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

const ABA_PAYWAY_STATIC_LINK = "https://pay.ababank.com/oRF8/vx2dp884";

function money(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = Number(amount);
  const formatted = isNaN(num) ? amount : num.toFixed(2);
  return `${currency || "USD"} ${formatted}`;
}

export default function AdminPaymentsPage() {
  const { lang, t } = useAdminLanguage();
  const { data, loading, refreshing, error, reload } = useResource(adminManagementService.payments);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, show, clear } = useToast();

  const handleOpenVerifyModal = (payment) => {
    setVerifyingPayment(payment);
    setTransactionReference(payment.paywayTransactionId || "");
    setModalError("");
  };

  const handleManualVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyingPayment) return;
    const trimmedTx = transactionReference.trim();
    if (!trimmedTx) {
      setModalError(lang === "en" ? "Transaction reference is required" : "សូមបញ្ចូលលេខប្រតិបត្តិការ");
      return;
    }

    setIsSubmitting(true);
    setModalError("");
    try {
      // Invariant: Server-authoritative amount, never fabricate 0.01
      const payload = {
        orderCode: verifyingPayment.orderCode,
        confirmedBy: "admin",
        itemType: verifyingPayment.itemType || (verifyingPayment.orderCode?.startsWith("SUB") ? "SUBSCRIPTION" : "TEMPLATE"),
        paywayTransactionId: trimmedTx,
      };
      if (verifyingPayment.amount != null) {
        payload.amount = Number(verifyingPayment.amount);
      }

      await adminManagementService.confirmPayment(payload);

      show(
        t("payments.confirmSuccess", `Order ${verifyingPayment.orderCode} confirmed successfully!`, {
          code: verifyingPayment.orderCode,
        })
      );
      setVerifyingPayment(null);
      setTransactionReference("");
      await reload();
    } catch (err) {
      setModalError(err?.message || (lang === "en" ? "Failed to confirm payment" : "បរាជ័យក្នុងការបញ្ជាក់ការទូទាត់"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const payments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((payment) => {
      // Status tab filter
      if (statusFilter === "PENDING") {
        const isPending = String(payment.status || "").includes("PENDING") || payment.status === "REVIEW_REQUIRED";
        if (!isPending) return false;
      } else if (statusFilter === "REVIEW") {
        const isReview = payment.status === "REVIEW_REQUIRED" || payment.status === "PAID_PENDING_REVIEW";
        if (!isReview) return false;
      } else if (statusFilter === "PAID") {
        if (payment.status !== "PAID") return false;
      } else if (statusFilter === "FAILED") {
        const isFailed = ["FAILED", "REJECTED", "CANCELLED", "EXPIRED"].includes(String(payment.status || ""));
        if (!isFailed) return false;
      }

      if (!q) return true;
      return [
        payment.orderCode,
        payment.templateName,
        payment.packageName,
        payment.status,
        payment.provider,
        payment.itemType,
        payment.paywayTransactionId,
        payment.payerName,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
    });
  }, [data, query, statusFilter]);

  const totals = useMemo(() => {
    const rows = data || [];
    return {
      total: rows.length,
      pending: rows.filter((row) => String(row.status || "").includes("PENDING") || row.status === "REVIEW_REQUIRED").length,
      paid: rows.filter((row) => String(row.status || "") === "PAID").length,
      failed: rows.filter((row) => ["FAILED", "REJECTED", "CANCELLED", "EXPIRED"].includes(String(row.status || ""))).length,
      review: rows.filter((row) => row.status === "REVIEW_REQUIRED" || row.status === "PAID_PENDING_REVIEW").length,
    };
  }, [data]);

  return (
    <div>
      <RefreshStatus active={refreshing} error={Boolean(error && data)} onRetry={reload} />
      <div className="page-head">
        <div>
          <h2 className="page-title">{t("payments.title", "Payments")}</h2>
          <p className="page-subtitle">{t("payments.subtitle", "Template and subscription payment orders from the active admin API.")}</p>
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
          <button type="button" className="btn btn-ghost" onClick={reload}>
            {t("common.refresh", "Refresh")}
          </button>
        </div>
      </div>

      <section className="admin-feature-grid">
        <article className="admin-feature-card">
          <span>{t("payments.statTotal", "Total")}</span>
          <strong>{totals.total}</strong>
        </article>
        <article className="admin-feature-card">
          <span>{t("payments.statPending", "Pending")}</span>
          <strong>{totals.pending}</strong>
        </article>
        <article className="admin-feature-card">
          <span>{t("payments.statPaid", "Paid")}</span>
          <strong>{totals.paid}</strong>
        </article>
        <article className="admin-feature-card">
          <span>{t("payments.statFailed", "Failed")}</span>
          <strong>{totals.failed}</strong>
        </article>
      </section>

      <section className="card">
        <div className="toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("payments.statusFilters", "Filter payments by status")}>
            {[
              ["ALL", lang === "en" ? `All (${totals.total})` : `ទាំងអស់ (${totals.total})`],
              ["PENDING", lang === "en" ? `Pending (${totals.pending})` : `កំពុងរង់ចាំ (${totals.pending})`],
              ["REVIEW", lang === "en" ? `Review Required (${totals.review})` : `ត្រូវការផ្ទៀងផ្ទាត់ (${totals.review})`],
              ["PAID", lang === "en" ? `Paid (${totals.paid})` : `បានទូទាត់ (${totals.paid})`],
              ["FAILED", lang === "en" ? `Failed / Expired (${totals.failed})` : `បរាជ័យ / ផុតកំណត់ (${totals.failed})`],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={statusFilter === value}
                className={`btn btn-sm ${statusFilter === value ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className="text-input"
            style={{ maxWidth: "260px" }}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("payments.searchPlaceholder", "Search payments...")}
          />
        </div>

        {loading ? (
          <Loading />
        ) : error && !data ? (
          <ErrorState onRetry={reload} />
        ) : payments.length === 0 ? (
          <Empty label={t("payments.empty", "រកមិនឃើញទិន្នន័យការទូទាត់ទេ")} />
        ) : (
          <div className="table-wrap" tabIndex={0} role="region" aria-label={t("payments.title", "Payments")}>
            <table className="data">
              <thead>
                <tr>
                  <th>{t("payments.colOrder", "Order")}</th>
                  <th>{t("payments.colItem", "Item")}</th>
                  <th>{t("payments.colType", "Type")}</th>
                  <th>{t("payments.colAmount", "Amount")}</th>
                  <th>{t("payments.colStatus", "Status")}</th>
                  <th>{t("payments.colMethod", "Provider")}</th>
                  <th>{lang === "en" ? "Payer / Reference" : "អ្នកបង់ / លេខកូដ"}</th>
                  <th>{lang === "en" ? "Created" : "បង្កើត"}</th>
                  <th>{lang === "en" ? "Paid" : "ទូទាត់"}</th>
                  <th>{t("payments.colActions", "Action")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.orderCode}>
                    <td><strong className="font-mono">{payment.orderCode || "—"}</strong></td>
                    <td>{payment.templateName || payment.packageName || "—"}</td>
                    <td>{payment.itemType || (payment.orderCode?.startsWith("SUB") ? "SUBSCRIPTION" : "TEMPLATE")}</td>
                    <td>{money(payment.amount, payment.currency)}</td>
                    <td>
                      <span className={`badge ${payment.status === "PAID" ? "badge-green" : String(payment.status || "").includes("PENDING") || payment.status === "REVIEW_REQUIRED" ? "badge-amber" : "badge-gray"}`}>
                        {payment.status || "—"}
                      </span>
                    </td>
                    <td>{payment.provider || "—"}</td>
                    <td>
                      <div className="text-xs">
                        {payment.payerName && <span className="font-medium">{payment.payerName}</span>}
                        {payment.payerAccountLast3 && <span className="text-slate-500 font-mono"> (*{payment.payerAccountLast3})</span>}
                        {payment.paywayTransactionId && (
                          <div className="font-mono text-[11px] text-slate-500 truncate max-w-[140px]" title={payment.paywayTransactionId}>
                            Tx: {payment.paywayTransactionId}
                          </div>
                        )}
                        {!payment.payerName && !payment.paywayTransactionId && "—"}
                      </div>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td>
                      {String(payment.status || "").includes("PENDING") || payment.status === "REVIEW_REQUIRED" ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenVerifyModal(payment)}
                          style={{ padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer" }}
                        >
                          {t("payments.confirmBtn", "Confirm")}
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

      {/* Manual Payment Verification Modal */}
      {verifyingPayment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => !isSubmitting && setVerifyingPayment(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#151518]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
                <ShieldAlert size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 id="verify-modal-title" className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {lang === "en" ? "Manual Payment Verification" : "ផ្ទៀងផ្ទាត់ការទូទាត់ដោយដៃ"}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Privileged
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  {lang === "en"
                    ? "Verify bank evidence before settling this order manually."
                    : "សូមពិនិត្យមើលភស្តុតាងធនាគារមុននឹងបញ្ជាក់ការទូទាត់ដោយដៃ។"}
                </p>
              </div>
            </div>

            {modalError && (
              <div role="alert" className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-500">
                {modalError}
              </div>
            )}

            {/* Order Details Grid */}
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 dark:bg-zinc-900/60 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Order Code:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{verifyingPayment.orderCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Item / Package:</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">{verifyingPayment.templateName || verifyingPayment.packageName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Order Type:</span>
                <span className="font-mono text-slate-800 dark:text-zinc-300">{verifyingPayment.itemType || (verifyingPayment.orderCode?.startsWith("SUB") ? "SUBSCRIPTION" : "TEMPLATE")}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 font-semibold">Authoritative Amount:</span>
                <strong className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400 font-mono">
                  {money(verifyingPayment.amount, verifyingPayment.currency)}
                </strong>
              </div>
            </div>

            <form onSubmit={handleManualVerifySubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="tx-ref" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {lang === "en" ? "ABA PayWay Transaction Reference / Merchant Alert ID" : "លេខកូដប្រតិបត្តិការ ABA PayWay / សារធនាគារ"} *
                </label>
                <input
                  id="tx-ref"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. 2026110598765432"
                  className="text-input w-full font-mono text-xs"
                />
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 block">
                  {lang === "en"
                    ? "Must match the official ABA Bank notification received in merchant alert channel."
                    : "ត្រូវតែត្រូវគ្នានឹងសារផ្លូវការរបស់ធនាគារ ABA ដែលទទួលបានក្នុង Telegram Channel។"}
                </span>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                ⚠️ <strong>{lang === "en" ? "Audit Invariant:" : "គោលការណ៍សវនកម្ម៖"}</strong>{" "}
                {lang === "en"
                  ? "Manual verification activates access entitlements immediately. The action is audited with your admin ID."
                  : "ការផ្ទៀងផ្ទាត់ដោយដៃនឹងបើកសិទ្ធិប្រើប្រាស់ភ្លាមៗ។ សកម្មភាពនេះត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធសវនកម្ម។"}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                  onClick={() => setVerifyingPayment(null)}
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting || !transactionReference.trim()}
                >
                  {isSubmitting
                    ? (lang === "en" ? "Verifying..." : "កំពុងផ្ទៀងផ្ទាត់...")
                    : (lang === "en" ? "Confirm & Settle Order" : "បញ្ជាក់ការទូទាត់")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
