import { useMemo } from "react";
import { Printer } from "lucide-react";
import { ErrorState, SkeletonCard } from "@/shared/ui";
import { buildFinancialReport } from "./model/financialReport";
import { useActiveEventReport } from "./hooks/useActiveEventReport";
import OwnerReportSummary from "./components/OwnerReportSummary";
import "./ReportsPage.css";

export default function FinancialReport() {
  const { sourceData, generatedAt, loading, error, reload } = useActiveEventReport();
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

  return (
    <main className="dash-main reports-page financial-report-page flex-1 flex justify-center w-full">
      <div className="reports-content-container min-h-screen bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <header className="financial-report-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <span className="dash-kicker reports-screen-only">Event finances</span>
          <h1 className="font-bold text-gray-800">របាយការណ៍សង្ខេបចំណូល និងចំណាយកម្មវិធី</h1>
          <p className="report-event-title">{eventTitle}</p>
          <div className="report-event-meta">
            {event?.eventType && <span><strong>ប្រភេទ:</strong> {eventTypeLabel(event.eventType)}</span>}
            {eventPeople && eventPeople !== eventTitle && <span><strong>ម្ចាស់កម្មវិធី:</strong> {eventPeople}</span>}
            <span><strong>ថ្ងៃកម្មវិធី:</strong> {formatDate(event?.eventDate)}</span>
            <span><strong>បង្កើតនៅ:</strong> {formatDateTime(generatedAt)}</span>
          </div>
        </div>
        <button type="button" className="reports-screen-only report-print-button" onClick={() => window.print()}>
          <Printer aria-hidden="true" size={17} />
          បោះពុម្ព / Print
        </button>
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
        <p className="report-no-event">មិនមានកម្មវិធីសកម្ម / No active event is available for this account.</p>
      ) : (
        <>
          <section className="report-summary-grid grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Financial summary">
            <MoneyCard label="ចំណូលសរុប / Total Income" amounts={report.totalIncome} tone="income" detail="ចំណងដៃ និងចំណូលដែលមានក្នុងទិន្នន័យ" />
            <MoneyCard label="ថវិកាប៉ាន់ស្មាន / Estimated Budget" amounts={report.plannedBudget} tone="budget" detail="ថវិកាដែលបានគ្រោងទុក" />
            <MoneyCard label="ចំណាយពិត / Actual Expenses" amounts={report.totalExpenses} tone="expense" detail="គិតតែចំណាយពិតដែលបានកត់ត្រា" />
            <MoneyCard label="នៅខ្វះ / Unpaid Balance" amounts={report.unpaidBalance} tone="balance" detail="ថវិកាគ្រោង ដកចំណាយពិត" />
            <StatCard label="ភ្ញៀវអញ្ជើញ / Total Invited" value={report.guestStats.invited} />
            <StatCard label="អ្នកចូលរួមបានបញ្ជាក់ / Confirmed Attendees" value={report.guestStats.attending} />
            <StatCard label="បានស្កេន QR / QR Check-ins" value={report.guestStats.checkedIn} />
            <StatCard label="អំណោយ / Gifts Recorded" value={report.guestStats.gifted} />
          </section>

          <section className="report-channel-grid" aria-label="Gift payment channels">
            <MoneyCard label="ABA / KHQR" amounts={report.digitalIncome} tone="income" detail="ចំណងដៃតាមធនាគារ និង QR" />
            <MoneyCard label="សាច់ប្រាក់ / Cash" amounts={report.cashIncome} tone="expense" detail="ចំណងដៃជាសាច់ប្រាក់" />
          </section>

          <section className="report-section">
            <div className="report-section-heading">
              <div>
                <span className="report-section-kicker">INCOME</span>
                <h2>តារាងអំណោយ និងចំណូលផ្សេងៗ</h2>
              </div>
              <strong>{report.incomeRows.length} records</strong>
            </div>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ឈ្មោះអ្នកផ្តល់</th>
                    <th>ក្រុម/ខាង</th>
                    <th className="is-numeric">ចំនួន</th>
                    <th>រូបិយប័ណ្ណ</th>
                    <th>វិធីបង់ប្រាក់</th>
                    <th>កំណត់សម្គាល់</th>
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
                  )) : <EmptyTableRow columns={6} />}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-section">
            <div className="report-section-heading">
              <div>
                <span className="report-section-kicker">EXPENSES</span>
                <h2>តារាងចំណាយ</h2>
              </div>
              <strong>{report.expenseRows.length} records</strong>
            </div>
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ប្រភេទចំណាយ</th>
                    <th>អ្នកផ្គត់ផ្គង់</th>
                    <th className="is-numeric">ថវិកាគ្រោង</th>
                    <th className="is-numeric">ចំណាយពិត</th>
                    <th>រូបិយប័ណ្ណ</th>
                    <th>ថ្ងៃបង់ប្រាក់</th>
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
                      <td>{formatDate(row.date)}</td>
                    </tr>
                  )) : <EmptyTableRow columns={6} />}
                </tbody>
              </table>
            </div>
          </section>

          <p className="report-data-note">
            កំណត់ត្រាចាស់ដែលមិនមាន currency ត្រូវបង្ហាញជា USD។ ប្រព័ន្ធមិនបម្លែងរវាង USD និង KHR ហើយចំណូលដែលបង្ហាញមានតែអំណោយដែលបានកត់ត្រាក្នុងប្រព័ន្ធ។
          </p>

          <footer className="report-signatures">
            <SignatureBlock title="អ្នករៀបចំកម្មវិធី" subtitle="ហត្ថលេខា / ស្នាមមេដៃអ្នករៀបចំ" />
            <SignatureBlock title="ម្ចាស់កម្មវិធី" subtitle="ហត្ថលេខា / ស្នាមមេដៃម្ចាស់កម្មវិធី" />
          </footer>
          <div className="report-page-number" aria-hidden="true" />
        </>
      )}
      </div>
    </main>
  );
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

function EmptyTableRow({ columns }) {
  return <tr><td className="report-table-empty" colSpan={columns}>មិនមានទិន្នន័យ / No records</td></tr>;
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

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function eventTypeLabel(type) {
  const labels = {
    WEDDING: "អាពាហ៍ពិពាហ៍",
    ENGAGEMENT: "ពិធីភ្ជាប់ពាក្យ",
    BIRTHDAY: "ខួបកំណើត",
    ANNIVERSARY: "ខួបអនុស្សាវរីយ៍",
    CORPORATE: "កម្មវិធីស្ថាប័ន",
    OTHER: "កម្មវិធីផ្សេងៗ",
  };
  return labels[type] || String(type || "កម្មវិធីផ្សេងៗ");
}
