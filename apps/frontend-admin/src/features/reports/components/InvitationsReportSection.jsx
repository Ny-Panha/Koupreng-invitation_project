import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  Eye,
  FilePenLine,
  MoreHorizontal,
  Archive,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ActionButton, StatusBadge } from "../../../shared/ui/AdminUI";
import { eventTypeLabel, EVENT_CATEGORIES } from "../reportConstants";
import { exportCsv } from "../../../shared/utils/csvExport";

export default function InvitationsReportSection({
  invitations = [],
  totalElements = 0,
  page = 0,
  size = 20,
  onPageChange = () => {},
  selectedCategory = null,
  onCategoryFilterChange = () => {},
  statusFilter = "ALL",
  onStatusFilterChange = () => {},
  searchQuery = "",
  onSearchChange = () => {},
  onUpdateStatus = () => {},
  isUpdating = false,
  lang = "km",
}) {
  const [actionMenuId, setActionMenuId] = useState(null);

  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Title",
      "Slug",
      "Event Type",
      "Owner",
      "Event Date",
      "Venue",
      "Status",
      "Moderation Status",
      "Created At",
      "Published At",
    ];
    const rows = invitations.map((inv) => [
      inv.id,
      inv.title,
      inv.slug,
      inv.eventType,
      inv.ownerName || `User #${inv.userId || "—"}`,
      inv.eventDate || "Unscheduled",
      inv.venueName || "—",
      inv.status,
      inv.moderationStatus,
      inv.createdAt,
      inv.publishedAt || "—",
    ]);
    exportCsv(`Koupreng-Invitations-Report-${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const totalPages = Math.ceil((totalElements || invitations.length) / size) || 1;

  return (
    <div className="card space-y-4">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {lang === "en" ? "Invitations & Events Ledger" : "បញ្ជីធៀបការ និងកម្មវិធីទាំងអស់"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {lang === "en"
              ? `Displaying ${invitations.length} invitations with moderation controls and audit history`
              : `បង្ហាញធៀបការចំនួន ${invitations.length} ព្រមទាំងការគ្រប់គ្រង និងត្រួតពិនិត្យ`}
          </p>
        </div>

        <ActionButton variant="secondary" size="sm" onClick={handleExportCsv}>
          <Download className="h-3.5 w-3.5" />
          <span>{lang === "en" ? "Export Invitations CSV" : "ទាញយក CSV ធៀបការ"}</span>
        </ActionButton>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder={lang === "en" ? "Search title, slug, owner, venue..." : "ស្វែងរកចំណងជើង, ម្ចាស់កម្មវិធី..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={selectedCategory || "ALL"}
          onChange={(e) => onCategoryFilterChange(e.target.value === "ALL" ? null : e.target.value)}
        >
          <option value="ALL">{lang === "en" ? "All Event Types (6 categories)" : "គ្រប់ប្រភេទកម្មវិធី (៦ ប្រភេទ)"}</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.icon} {lang === "en" ? cat.subLabel : cat.label} ({cat.key})
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="ALL">{lang === "en" ? "All Statuses" : "គ្រប់ស្ថានភាព"}</option>
          <option value="PUBLISHED">PUBLISHED (បានផ្សាយ)</option>
          <option value="DRAFT">DRAFT (ព្រាង)</option>
          <option value="UNPUBLISHED">UNPUBLISHED (មិនទាន់ផ្សាយ)</option>
          <option value="ARCHIVED">ARCHIVED (ទុកក្នុងបណ្ណសារ)</option>
        </select>
      </div>

      {/* Invitations Table */}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>{lang === "en" ? "Invitation / Event" : "កម្មវិធី / ធៀបការ"}</th>
              <th>{lang === "en" ? "Category" : "ប្រភេទ"}</th>
              <th>{lang === "en" ? "Owner / Host" : "ម្ចាស់កម្មវិធី"}</th>
              <th>{lang === "en" ? "Date & Venue" : "កាលបរិច្ឆេទ & ទីតាំង"}</th>
              <th>{lang === "en" ? "Status" : "ស្ថានភាព"}</th>
              <th>{lang === "en" ? "Moderation" : "ការត្រួតពិនិត្យ"}</th>
              <th className="text-right">{lang === "en" ? "Actions" : "សកម្មភាព"}</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                  {lang === "en"
                    ? "No invitations found matching the specified filters"
                    : "មិនមានធៀបការត្រូវនឹងលក្ខខណ្ឌចម្រាញ់ទេ"}
                </td>
              </tr>
            ) : (
              invitations.map((inv) => {
                const categoryMatch = EVENT_CATEGORIES.find((c) => c.key === inv.eventType);
                const isHidden =
                  inv.moderationStatus === "HIDDEN" || inv.moderationStatus === "SUSPENDED";

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                    <td>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-zinc-100">
                          {inv.title || (lang === "en" ? `Event #${inv.id}` : `កម្មវិធី #${inv.id}`)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          /{inv.slug || `invitation-${inv.id}`}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                          categoryMatch?.badgeColor ||
                          "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200"
                        }`}
                      >
                        <span>{categoryMatch?.icon || "✨"}</span>
                        <span>{eventTypeLabel(inv.eventType, lang)}</span>
                      </span>
                    </td>

                    <td>
                      <div className="text-xs text-slate-900 dark:text-zinc-100 font-medium">
                        {inv.ownerName || inv.organizationName || `User #${inv.userId || "—"}`}
                      </div>
                      {inv.hostName && (
                        <div className="text-[10px] text-slate-400">
                          {lang === "en" ? "Host:" : "ម្ចាស់ដើមការ:"} {inv.hostName}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="text-xs text-slate-700 dark:text-zinc-300">
                        {inv.eventDate || (lang === "en" ? "Unscheduled" : "មិនទាន់កំណត់")}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {inv.venueName || "—"}
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={inv.status} />
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          isHidden
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {inv.moderationStatus || "ACTIVE"}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="relative inline-flex items-center justify-end gap-1">
                        {inv.slug && (
                          <Link
                            to={`/i/${inv.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
                            title={lang === "en" ? "Preview Public Invitation" : "មើលធៀបការផ្ទាល់"}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActionMenuId(actionMenuId === inv.id ? null : inv.id)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>

                          {actionMenuId === inv.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-lg z-20 space-y-1">
                              {inv.status !== "PUBLISHED" && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => {
                                    onUpdateStatus(inv, "PUBLISHED");
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium"
                                >
                                  <CircleCheck className="h-3.5 w-3.5" />
                                  <span>{lang === "en" ? "Publish Event" : "ផ្សាយធៀបការ"}</span>
                                </button>
                              )}

                              {inv.status !== "ARCHIVED" && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => {
                                    onUpdateStatus(inv, "ARCHIVED");
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
                                >
                                  <Archive className="h-3.5 w-3.5" />
                                  <span>{lang === "en" ? "Archive Event" : "ទុកក្នុងបណ្ណសារ"}</span>
                                </button>
                              )}

                              {inv.status === "PUBLISHED" && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => {
                                    onUpdateStatus(inv, "DRAFT");
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium"
                                >
                                  <FilePenLine className="h-3.5 w-3.5" />
                                  <span>{lang === "en" ? "Revert to Draft" : "ដាក់ជាព្រាងវិញ"}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <span className="text-slate-500">
            {lang === "en"
              ? `Page ${page + 1} of ${totalPages} (${totalElements || invitations.length} total)`
              : `ទំព័រទី ${page + 1} នៃ ${totalPages} (សរុប ${totalElements || invitations.length})`}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

