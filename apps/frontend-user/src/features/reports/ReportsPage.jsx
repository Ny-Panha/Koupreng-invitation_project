import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, FileDown, Printer, X, ZoomIn, ZoomOut } from "lucide-react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { ErrorState, Modal, SkeletonCard } from "@/shared/ui";
import { buildFinancialReport } from "./model/financialReport";
import { useActiveEventReport } from "./hooks/useActiveEventReport";
import OwnerReportSummary from "./components/OwnerReportSummary";
import "./ReportsPage.css";

export default function FinancialReport() {
  const { text: t, lang } = useBackendMessages("reports");
  const { sourceData, generatedAt, loading, error, reload } = useActiveEventReport();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const previewTrigger = useRef(null);
  const wasPreview = useRef(false);

  const report = useMemo(
    () => sourceData ? buildFinancialReport(sourceData) : null,
    [sourceData],
  );

  const event = sourceData?.invitation;
  const eventPeople = [event?.groomName, event?.brideName].filter(Boolean).join(" & ")
    || [event?.hostName, event?.partnerName].filter(Boolean).join(" & ")
    || event?.ownerName
    || "";
  const eventTitle = event?.title || eventPeople || `កម្មវិធី #${event?.id || ""}`;
  const invitationId = event?.id || event?.invitationId;
  const hasServerInvitation = Number.isInteger(Number(invitationId)) && Number(invitationId) > 0;

  useEffect(() => {
    if (wasPreview.current && !isPreviewMode) previewTrigger.current?.focus();
    wasPreview.current = isPreviewMode;
  }, [isPreviewMode]);

  const handlePrint = () => {
    window.print();
  };

  const handlePrintPdf = () => {
    const originalTitle = document.title;
    const safeTitle = (eventTitle || "Event")
      .replace(/[\s/\\?%*:|"'<>]/g, "_")
      .slice(0, 40);
    const dateStamp = new Date().toISOString().slice(0, 10);
    document.title = `Koupreng-Financial-Report-${safeTitle}-${dateStamp}`;
    try {
      window.print();
    } finally {
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  return (
    <ReportSurface preview={isPreviewMode} onClose={() => setIsPreviewMode(false)} label={t("preview")}>
      {isPreviewMode && (
        <aside className="report-preview-toolbar reports-screen-only" role="region" aria-label={t("previewControls")}>
          <div className="report-preview-toolbar-inner">
            <div className="report-preview-meta">
              <span className="report-preview-badge">{t("paper")}</span>
              <strong>{t("preview")}</strong>
              <span className="report-preview-hint text-xs text-gray-300 hidden md:inline">
                {t("previewHint")}
              </span>
            </div>
            <div className="report-preview-controls">
              <div className="report-zoom-controls">
                <button
                  type="button"
                  className="report-zoom-btn"
                  onClick={() => setPreviewZoom((z) => Math.max(70, z - 10))}
                  disabled={previewZoom <= 70}
                  title={t("zoomOut")}
                  aria-label={t("zoomOut")}
                >
                  <ZoomOut size={15} aria-hidden="true" />
                </button>
                <span className="report-zoom-level">{previewZoom}%</span>
                <button
                  type="button"
                  className="report-zoom-btn"
                  onClick={() => setPreviewZoom((z) => Math.min(140, z + 10))}
                  disabled={previewZoom >= 140}
                  title={t("zoomIn")}
                  aria-label={t("zoomIn")}
                >
                  <ZoomIn size={15} aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                className="report-preview-action report-preview-pdf"
                onClick={handlePrintPdf}
              >
                <FileDown size={15} aria-hidden="true" />
                <span>{t("pdf")}</span>
              </button>
              <button
                type="button"
                className="report-preview-action report-preview-print"
                onClick={handlePrint}
              >
                <Printer size={15} aria-hidden="true" />
                <span>{t("print")}</span>
              </button>
              <button
                type="button"
                className="report-preview-close"
                onClick={() => setIsPreviewMode(false)}
                aria-label={t("exit")}
              >
                <X size={17} aria-hidden="true" />
                <span>{t("exit")}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      <div
        className={`reports-content-container ${isPreviewMode ? "report-sheet-simulation" : ""}`}
        style={isPreviewMode && previewZoom !== 100 ? { transform: `scale(${previewZoom / 100})`, transformOrigin: "top center" } : undefined}
      >
        <header className="financial-report-header flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <span className="dash-kicker reports-screen-only">{t("kicker")}</span>
            <h1 className="font-bold text-gray-800">{t("title")}</h1>
            <p className="report-event-title">{eventTitle}</p>
            <div className="report-event-meta">
              {event?.eventType && <span><strong>{t("type")}</strong> {eventTypeLabel(event.eventType, lang)}</span>}
              {eventPeople && eventPeople !== eventTitle && <span><strong>{t("host")}</strong> {eventPeople}</span>}
              <span><strong>{t("date")}</strong> {formatDate(event?.eventDate, lang)}</span>
              <span><strong>{t("generated")}</strong> {formatDateTime(generatedAt, lang)}</span>
            </div>
          </div>
          <div className="report-header-actions reports-screen-only flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="report-action-btn report-preview-btn"
              ref={previewTrigger}
              onClick={() => setIsPreviewMode(true)}
              title={t("preview")}
            >
              <Eye aria-hidden="true" size={16} />
              {t("preview")}
            </button>
            <button
              type="button"
              className="report-action-btn report-pdf-btn"
              onClick={handlePrintPdf}
              title={t("pdf")}
            >
              <FileDown aria-hidden="true" size={16} />
              {t("pdf")}
            </button>
            <button
              type="button"
              className="report-action-btn report-print-button"
              onClick={handlePrint}
              title={t("print")}
            >
              <Printer aria-hidden="true" size={16} />
              {t("print")}
            </button>
          </div>
        </header>
      {hasServerInvitation && <OwnerReportSummary invitationId={invitationId} />}

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="report-loading reports-screen-only">
          <SkeletonCard height="60px" />
          <SkeletonCard height="120px" />
        </div>
      ) : !report ? (
        <p className="report-no-event">{t("noEvent")}</p>
      ) : (
        <>
          <section className="report-summary-grid grid grid-cols-1 md:grid-cols-3 gap-5" aria-label={t("financialSummary")}>
            <MoneyCard label={t("income")} amounts={report.totalIncome} tone="income" detail={t("incomeDetail")} />
            <MoneyCard label={t("estimated")} amounts={report.plannedBudget} tone="budget" detail={t("estimatedDetail")} />
            <MoneyCard label={t("expenses")} amounts={report.totalExpenses} tone="expense" detail={t("expensesDetail")} />
            <MoneyCard label={t("balance")} amounts={report.unpaidBalance} tone="balance" detail={t("balanceDetail")} />
            <StatCard label={t("invited")} value={report.guestStats.invited} />
            <StatCard label={t("attendees")} value={report.guestStats.attending} />
            <StatCard label={t("checkins")} value={report.guestStats.checkedIn} />
            <StatCard label={t("gifts")} value={report.guestStats.gifted} />
          </section>

          <section className="report-channel-grid" aria-label={t("channels")}>
            <MoneyCard label="ABA / KHQR" amounts={report.digitalIncome} tone="income" detail={t("digitalDetail")} />
            <MoneyCard label={t("cash")} amounts={report.cashIncome} tone="expense" detail={t("cashDetail")} />
          </section>

          <section className="report-section">
            <div className="report-section-heading">
              <div>
                <h2>{t("incomeTable")}</h2>
              </div>
              <strong>{report.incomeRows.length} {t("records")}</strong>
            </div>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>{t("name")}</th>
                    <th>{t("group")}</th>
                    <th className="is-numeric">{t("amount")}</th>
                    <th>{t("currency")}</th>
                    <th>{t("method")}</th>
                    <th>{t("note")}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.incomeRows.length ? report.incomeRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.name || "—"}</td>
                      <td>{row.side}</td>
                      <td className="is-numeric">{formatAmount(row.amount, row.currency)}</td>
                      <td>{row.currency}</td>
                      <td>{row.method}</td>
                      <td>{row.note || "—"}</td>
                    </tr>
                  )) : <EmptyTableRow columns={6} t={t} />}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-section">
            <div className="report-section-heading">
              <div>
                <h2>{t("expenseTable")}</h2>
              </div>
              <strong>{report.expenseRows.length} {t("records")}</strong>
            </div>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>{t("category")}</th>
                    <th>{t("vendor")}</th>
                    <th className="is-numeric">{t("planned")}</th>
                    <th className="is-numeric">{t("actual")}</th>
                    <th>{t("currency")}</th>
                    <th>{t("paidDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expenseRows.length ? report.expenseRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.category}</td>
                      <td>{row.vendor || "—"}</td>
                      <td className="is-numeric">{formatAmount(row.budget, row.currency)}</td>
                      <td className="is-numeric">{row.hasActual ? formatAmount(row.amount, row.currency) : "—"}</td>
                      <td>{row.currency}</td>
                      <td>{formatDate(row.date, lang)}</td>
                    </tr>
                  )) : <EmptyTableRow columns={6} t={t} />}
                </tbody>
              </table>
            </div>
          </section>

          <p className="report-data-note">
            {t("dataNote")}
          </p>

          <footer className="report-signatures">
            <SignatureBlock title={t("organizer")} subtitle={t("organizerSignature")} />
            <SignatureBlock title={t("owner")} subtitle={t("ownerSignature")} />
          </footer>
          <div className="report-page-number" aria-hidden="true" />
        </>
      )}
      </div>
    </ReportSurface>
  );
}

function ReportSurface({ preview, onClose, label, children }) {
  return preview
    ? <Modal isOpen onClose={onClose} ariaLabel={label} showHeader={false} size="full" className="workspace-dialog reports-page financial-report-page is-print-preview" backdropClassName="report-preview-backdrop">{children}</Modal>
    : <main className="dash-main reports-page financial-report-page">{children}</main>;
}

function MoneyCard({ label, amounts, tone, detail }) {
  const amountColor = tone === "income"
    ? "text-emerald-600"
    : tone === "balance"
      ? "text-rose-500"
      : "text-amber-600";

  return (
    <article className={`report-summary-card money-card is-${tone} bg-white border border-[#f0e8dd] shadow-sm hover:shadow-md transition-all rounded-2xl p-5`}>
      <span>{label}</span>
      <div className="money-card-amounts">
        <strong className={amountColor}>{formatAmount(amounts.USD, "USD")}</strong>
        <strong className={amountColor}>{formatAmount(amounts.KHR, "KHR")}</strong>
      </div>
      <small className="text-xs text-gray-500">{detail}</small>
    </article>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="report-summary-card stat-card bg-white border border-[#f0e8dd] shadow-sm hover:shadow-md transition-all rounded-2xl p-5">
      <span>{label}</span>
      <strong>{new Intl.NumberFormat("en-US").format(value)}</strong>
    </article>
  );
}

function EmptyTableRow({ columns, t }) {
  return <tr><td className="report-table-empty" colSpan={columns}>{t("empty")}</td></tr>;
}

function SignatureBlock({ title, subtitle }) {
  return (
    <div className="report-signature-block">
      <div className="report-signature-line" />
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function formatAmount(value, currency) {
  const number = Number(value) || 0;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: currency === "KHR" ? 0 : 2,
    minimumFractionDigits: currency === "KHR" ? 0 : 2,
  }).format(number);
  return currency === "KHR" ? `${formatted} ៛` : `$${formatted}`;
}

function formatDate(value, lang) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "km-KH", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value, lang) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "km-KH", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function eventTypeLabel(type, lang) {
  const labels = {
    WEDDING: "អាពាហ៍ពិពាហ៍",
    ENGAGEMENT: "ពិធីភ្ជាប់ពាក្យ",
    BIRTHDAY: "ខួបកំណើត",
    ANNIVERSARY: "ខួបអនុស្សាវរីយ៍",
    CORPORATE: "កម្មវិធីស្ថាប័ន",
    OTHER: "កម្មវិធីផ្សេងៗ",
  };
  const en = { WEDDING: "Wedding", ENGAGEMENT: "Engagement", BIRTHDAY: "Birthday", ANNIVERSARY: "Anniversary", CORPORATE: "Corporate event", OTHER: "Other event" };
  return (lang === "en" ? en[type] : labels[type]) || String(type || "—");
}
