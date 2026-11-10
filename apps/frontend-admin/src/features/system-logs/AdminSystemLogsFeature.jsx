import { RefreshStatus } from "../../shared/ui/AdminSkeleton";
import { useMemo, useState, useEffect } from "react";
import AdminDialog from "../../layouts/components/AdminDialog";
import {
  FileText,
  Search,
  RotateCw,
  ShieldCheck,
  User,
  Clock,
  X,
  Copy,
  Check,
  Eye,
} from "lucide-react";
import { Loading, ErrorState, Empty } from "../../shared/ui";
import { useResource } from "../../shared/hooks";
import {
  formatDateTime,
  redactSecrets,
  formatAndRedactMetadata,
} from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

export default function AdminSystemLogsPage() {
  const { lang, t } = useAdminLanguage();
  const { data, loading, refreshing, error, reload } = useResource(
    adminManagementService.systemLogs
  );
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [activeLog, setActiveLog] = useState(null);
  const [copied, setCopied] = useState(false);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveLog(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const logs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((log) => {
      if (actionFilter !== "ALL") {
        const act = String(log.action || "").toUpperCase();
        if (!act.includes(actionFilter)) return false;
      }
      if (resourceFilter !== "ALL") {
        const res = String(log.resourceType || "").toUpperCase();
        if (res !== resourceFilter) return false;
      }
      if (!q) return true;
      return [
        log.action,
        log.resourceType,
        log.actorEmail,
        log.actorUserId,
        log.description,
        log.ipAddress,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [data, query, actionFilter, resourceFilter]);

  const copyMetadata = (text) => {
    if (!navigator.clipboard || !text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetFilters = () => {
    setQuery("");
    setActionFilter("ALL");
    setResourceFilter("ALL");
  };

  return (
    <div className="space-y-6">
      <RefreshStatus
        active={refreshing}
        error={Boolean(error && data)}
        onRetry={reload}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            {t("systemLogs.title", "System Logs")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t(
              "systemLogs.subtitle",
              "Auditable administrative actions and system security events"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            {lang === "en" ? "Immutable Audit Trail" : "កំណត់ហេតុមិនអាចកែប្រែ"}
          </span>
          <button
            type="button"
            className="btn btn-ghost inline-flex items-center gap-1.5 text-xs"
            onClick={reload}
          >
            <RotateCw className="h-3.5 w-3.5" />
            {t("common.refresh", "Refresh")}
          </button>
        </div>
      </div>

      <section className="card p-5 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        {/* Filters Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px] sm:min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="text-input pl-8 py-1.5 text-xs w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(
                  "systemLogs.searchPlaceholder",
                  "Search logs..."
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Action Filter */}
            <select
              className="select py-1.5 text-xs"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label={t("systemLogs.filterAction", "All Actions")}
            >
              <option value="ALL">
                {t("systemLogs.filterAction", "All Actions")}
              </option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE">CREATE / ADD</option>
              <option value="UPDATE">UPDATE / CHANGE</option>
              <option value="DELETE">DEACTIVATE / DELETE</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="NOTIFICATION">NOTIFICATION</option>
              <option value="REPORT">REPORT EXPORT</option>
            </select>

            {/* Resource Filter */}
            <select
              className="select py-1.5 text-xs"
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              aria-label={t("systemLogs.filterResource", "All Resources")}
            >
              <option value="ALL">
                {t("systemLogs.filterResource", "All Resources")}
              </option>
              <option value="USER">USER</option>
              <option value="TEMPLATE">TEMPLATE</option>
              <option value="INVITATION">INVITATION</option>
              <option value="NOTIFICATION">NOTIFICATION</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="PACKAGE">PACKAGE</option>
              <option value="REPORT">REPORT</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>

            {(query || actionFilter !== "ALL" || resourceFilter !== "ALL") && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost py-1 px-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
              >
                {lang === "en" ? "Reset" : "កំណត់ឡើងវិញ"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
            <span>
              {lang === "en" ? "Showing" : "បង្ហាញ"}{" "}
              <strong className="text-slate-900 dark:text-zinc-100">
                {logs.length}
              </strong>{" "}
              {lang === "en" ? "events" : "ព្រឹត្តិការណ៍"}
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="h-3 w-3 text-amber-500" />
              Asia/Phnom_Penh (ICT)
            </span>
          </div>
        </div>

        {/* Sensitive data note banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>
            {t(
              "systemLogs.redactedNotice",
              "Sensitive tokens, passwords, and secrets are automatically redacted."
            )}
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : error && !data ? (
          <ErrorState onRetry={reload} />
        ) : logs.length === 0 ? (
          <Empty
            label={
              lang === "en" ? "No audit logs found" : "មិនមានកំណត់ហេតុទេ"
            }
          />
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-label="System Audit Logs Table"
            className="table-wrap overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/80"
          >
            <table className="data w-full text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="whitespace-nowrap">
                    {t("systemLogs.colTimestamp", "Timestamp (ICT)")}
                  </th>
                  <th scope="col">{t("systemLogs.colActor", "Actor")}</th>
                  <th scope="col">{t("systemLogs.colAction", "Action")}</th>
                  <th scope="col">{t("systemLogs.colResource", "Resource")}</th>
                  <th scope="col">{t("systemLogs.colDescription", "Description")}</th>
                  <th scope="col">{t("systemLogs.colIp", "IP Address")}</th>
                  <th scope="col" className="text-right">
                    {lang === "en" ? "Details" : "លម្អិត"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {logs.map((log) => {
                  const sanitizedDescription = redactSecrets(log.description);
                  const actionUpper = String(log.action || "").toUpperCase();
                  const isCreate = actionUpper.includes("CREATE");
                  const isDelete =
                    actionUpper.includes("DELETE") ||
                    actionUpper.includes("DEACTIVATE");
                  const isPayment = actionUpper.includes("PAYMENT");
                  const isLogin = actionUpper.includes("LOGIN");

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="whitespace-nowrap font-mono text-slate-500 text-[11px]">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {log.actorEmail ||
                              (log.actorUserId ? `User #${log.actorUserId}` : (
                                <span className="text-slate-400 italic">
                                  {lang === "en" ? "System" : "ប្រព័ន្ធ"}
                                </span>
                              ))}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge font-mono text-[10px] ${
                            isCreate
                              ? "badge-green"
                              : isDelete
                              ? "badge-rose bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : isPayment
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                              : isLogin
                              ? "badge-sky bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                              : "badge-gray"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">
                          {log.resourceType || "—"}
                        </span>
                        {log.resourceId && (
                          <span className="ml-1 font-mono text-[10px] text-slate-400">
                            #{log.resourceId}
                          </span>
                        )}
                      </td>
                      <td>
                        <div
                          className="max-w-md truncate text-slate-600 dark:text-zinc-300"
                          title={sanitizedDescription}
                        >
                          {sanitizedDescription || "—"}
                        </div>
                      </td>
                      <td className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ipAddress || "—"}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
                          title={t("systemLogs.inspectDetails", "Inspect Details")}
                        >
                          <Eye className="h-3 w-3 text-amber-500" />
                          <span>{t("systemLogs.inspectDetails", "Inspect")}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail Inspection Drawer / Dialog */}
      {activeLog && (
        <AdminDialog
          label={`${t("systemLogs.drawerTitle", "Audit Log Entry")} #${activeLog.id}`}
          onClose={() => setActiveLog(null)}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col p-0 border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3
                  id="audit-drawer-title"
                  className="text-sm font-bold text-slate-900 dark:text-zinc-100"
                >
                  {t("systemLogs.drawerTitle", "Audit Log Entry")} #{activeLog.id}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {formatDateTime(activeLog.createdAt)} · Asia/Phnom_Penh (ICT)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveLog(null)}
              aria-label="Close drawer"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
            {/* Overview Card */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-zinc-800/80 dark:bg-zinc-800/40 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t("systemLogs.colAction", "Action")}
                  </span>
                  <div className="mt-0.5 font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {activeLog.action}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t("systemLogs.colResource", "Resource")}
                  </span>
                  <div className="mt-0.5 font-semibold text-slate-800 dark:text-zinc-200">
                    {activeLog.resourceType || "—"}{" "}
                    {activeLog.resourceId && `#${activeLog.resourceId}`}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t("systemLogs.colActor", "Actor")}
                  </span>
                  <div className="mt-0.5 font-medium text-slate-800 dark:text-zinc-200">
                    {activeLog.actorEmail ||
                      (activeLog.actorUserId
                        ? `User #${activeLog.actorUserId}`
                        : "System")}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t("systemLogs.colIp", "IP Address")}
                  </span>
                  <div className="mt-0.5 font-mono text-slate-800 dark:text-zinc-200">
                    {activeLog.ipAddress || "—"}
                  </div>
                </div>
              </div>

              {activeLog.userAgent && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                  <span className="text-[11px] text-slate-400 font-medium">
                    User Agent
                  </span>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400 break-all">
                    {activeLog.userAgent}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {t("systemLogs.colDescription", "Description")}
              </h4>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 select-text leading-relaxed">
                {redactSecrets(activeLog.description) || "—"}
              </div>
            </div>

            {/* Metadata JSON */}
            {activeLog.metadataJson && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Metadata (JSON)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      copyMetadata(formatAndRedactMetadata(activeLog.metadataJson))
                    }
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>
                      {copied
                        ? t("systemLogs.copiedJson", "Copied!")
                        : t("systemLogs.copyJson", "Copy JSON")}
                    </span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto select-all max-h-60">
                  {formatAndRedactMetadata(activeLog.metadataJson)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => setActiveLog(null)}
            >
              {lang === "en" ? "Close" : "បិទ"}
            </button>
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
