import { Printer, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { formatMoney, eventTypeLabel } from "../reportConstants";

export default function ReportPrintPreviewModal({
  isOpen = false,
  onClose = () => {},
  onPrint = () => {},
  zoom = 100,
  onZoomChange = () => {},
  platformReport = null,
  paymentsReport = null,
  invitations = [],
  categoryBreakdown = [],
  lang = "km",
}) {
  if (!isOpen) return null;

  const summary = platformReport?.summary || {};
  const paymentsSummary = paymentsReport?.summary || {};

  const paidUsd = Number(summary.paidRevenueByCurrency?.USD ?? summary.revenueByCurrency?.USD ?? paymentsSummary.paidAmountUsd ?? 0);
  const paidKhr = Number(summary.paidRevenueByCurrency?.KHR ?? summary.revenueByCurrency?.KHR ?? paymentsSummary.paidAmountKhr ?? 0);

  const totalInvitations = Number(summary.totalInvitations || invitations.length || 0);
  const publishedInvitations = Number(summary.publishedInvitations || 0);
  const publishRate = totalInvitations > 0 ? Math.round((publishedInvitations / totalInvitations) * 100) : 0;

  const totalGuests = Number(summary.totalGuests || 0);
  const totalCheckIns = Number(summary.totalCheckIns || 0);

  const nowPhnomPenh = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "Asia/Phnom_Penh",
  }).format(new Date());

  return (
    <div className="reports-page is-print-preview fixed inset-0 z-50 overflow-y-auto">
      {/* Top Floating Toolbar */}
      <header className="report-preview-toolbar fixed top-0 left-0 right-0 h-14 bg-slate-900 text-white z-50 shadow-lg flex items-center px-4">
        <div className="report-preview-toolbar-inner flex items-center justify-between w-full max-w-5xl mx-auto gap-4">
          <div className="report-preview-meta flex items-center gap-3">
            <span className="report-preview-badge bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
              A4 Print Preview
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              {lang === "en" ? "Review document before printing or exporting to PDF" : "ពិនិត្យឯកសារមុនពេលបោះពុម្ព ឬទាញយក PDF"}
            </span>
          </div>

          <div className="report-preview-controls flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="report-zoom-controls flex items-center bg-white/10 rounded-lg px-2 py-1 gap-1">
              <button
                type="button"
                className="report-zoom-btn text-slate-300 hover:text-white p-1"
                disabled={zoom <= 60}
                onClick={() => onZoomChange(Math.max(60, zoom - 10))}
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="report-zoom-level text-xs font-mono font-bold min-w-[36px] text-center text-slate-200">
                {zoom}%
              </span>
              <button
                type="button"
                className="report-zoom-btn text-slate-300 hover:text-white p-1"
                disabled={zoom >= 150}
                onClick={() => onZoomChange(Math.min(150, zoom + 10))}
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="report-zoom-btn text-slate-300 hover:text-white p-1 ml-1"
                onClick={() => onZoomChange(100)}
                title="Reset Zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={onPrint}
              className="report-preview-action inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow"
            >
              <Printer className="h-4 w-4" />
              <span>{lang === "en" ? "Print / Save PDF" : "បោះពុម្ព / រក្សាទុក PDF"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="report-preview-close inline-flex items-center gap-1 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Preview (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Simulated A4 Paper Sheets Container */}
      <div className="pt-20 pb-16 flex justify-center">
        <article
          className="report-sheet-simulation bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] transition-transform origin-top space-y-6"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Document Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="text-xl font-black tracking-widest text-amber-600 uppercase">
              KOUPRENG E-INVITATION PLATFORM
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              របាយការណ៍គ្រប់គ្រង និងវិភាគទិន្នន័យ (Executive Platform Report)
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap justify-between items-center">
              <span>Timezone: Asia/Phnom_Penh ({nowPhnomPenh})</span>
              <span>Classification: Internal Administrative Audit</span>
            </div>
          </div>

          {/* Executive KPI Summary */}
          <section className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              I. Executive Summary & KPIs
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] uppercase font-bold text-slate-500">Invitations</div>
                <div className="text-lg font-black text-slate-900">{totalInvitations}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">{publishedInvitations} Published ({publishRate}%)</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] uppercase font-bold text-slate-500">Revenue (USD)</div>
                <div className="text-lg font-black text-emerald-700">{formatMoney(paidUsd, "USD")}</div>
                <div className="text-[10px] text-slate-500">Confirmed Paid</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] uppercase font-bold text-slate-500">Revenue (KHR)</div>
                <div className="text-lg font-black text-slate-900">{formatMoney(paidKhr, "KHR")}</div>
                <div className="text-[10px] text-slate-500">Independent Ledger</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] uppercase font-bold text-slate-500">Guests & Check-in</div>
                <div className="text-lg font-black text-slate-900">{totalGuests}</div>
                <div className="text-[10px] text-cyan-600 font-semibold">{totalCheckIns} Checked In</div>
              </div>
            </div>
          </section>

          {/* Event Category Breakdown Table */}
          <section className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              II. Event Categories Distribution (6 Categories)
            </h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2 border-b">Category / ប្រភេទ</th>
                  <th className="p-2 border-b text-center">Total Events</th>
                  <th className="p-2 border-b text-center">Published</th>
                  <th className="p-2 border-b text-center">Drafts</th>
                  <th className="p-2 border-b text-right">Publishing Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.category || cat.key} className="border-b border-slate-100">
                    <td className="p-2 font-semibold text-slate-800">
                      {eventTypeLabel(cat.category || cat.key, lang)} ({cat.category || cat.key})
                    </td>
                    <td className="p-2 text-center font-bold">{cat.total ?? cat.count ?? 0}</td>
                    <td className="p-2 text-center text-emerald-600 font-medium">{cat.published ?? 0}</td>
                    <td className="p-2 text-center text-slate-500 font-medium">{cat.draft ?? 0}</td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      {cat.publishRate ?? 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Invitations Ledger Table */}
          <section className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              III. Event & Invitation Records
            </h4>
            <table className="w-full text-left text-[11px] border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2 border-b">Title / កម្មវិធី</th>
                  <th className="p-2 border-b">Category</th>
                  <th className="p-2 border-b">Owner</th>
                  <th className="p-2 border-b">Date</th>
                  <th className="p-2 border-b">Venue</th>
                  <th className="p-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {invitations.slice(0, 15).map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100">
                    <td className="p-1.5 font-bold text-slate-900">{inv.title || `Event #${inv.id}`}</td>
                    <td className="p-1.5">{eventTypeLabel(inv.eventType, lang)}</td>
                    <td className="p-1.5 text-slate-600">{inv.ownerName || `User #${inv.userId || "—"}`}</td>
                    <td className="p-1.5 text-slate-600">{inv.eventDate || "Unscheduled"}</td>
                    <td className="p-1.5 text-slate-600 truncate max-w-[120px]">{inv.venueName || "—"}</td>
                    <td className="p-1.5 font-semibold text-[10px]">
                      <span className={inv.status === "PUBLISHED" ? "text-emerald-700" : "text-slate-600"}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invitations.length > 15 && (
              <p className="text-[10px] text-slate-400 italic text-right">
                * Showing first 15 of {invitations.length} events in executive print summary.
              </p>
            )}
          </section>

          {/* Footer & Confidentiality */}
          <footer className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] text-slate-400">
            <span>Koupreng E-Invitation Admin Platform</span>
            <span>Confidential — Internal Administrative Use Only</span>
            <span>Page 1 of 1</span>
          </footer>
        </article>
      </div>
    </div>
  );
}

