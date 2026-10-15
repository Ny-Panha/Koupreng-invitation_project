import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileDown,
  FilePenLine,
  MoreHorizontal,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ActionButton, AdminPageHeader, ErrorStateView, LoadingState, StatCard, StatusBadge } from "../../shared/ui/AdminUI";
import adminService from "../../shared/api/adminService";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";

function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

const EVENT_CATEGORIES = [
  {
    key: "WEDDING",
    label: "អាពាហ៍ពិពាហ៍",
    subLabel: "Wedding",
    icon: "💍",
    color: "#f43f5e",
    barColor: "bg-rose-500",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    description: "ពិធីមង្គលការ និងអាពាហ៍ពិពាហ៍",
  },
  {
    key: "ENGAGEMENT",
    label: "ភ្ជាប់ពាក្យ",
    subLabel: "Engagement",
    icon: "💐",
    color: "#f59e0b",
    barColor: "bg-amber-500",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    description: "ពិធីស្តីដណ្តឹង និងភ្ជាប់ពាក្យ",
  },
  {
    key: "BIRTHDAY",
    label: "ខួបកំណើត",
    subLabel: "Birthday",
    icon: "🎂",
    color: "#a855f7",
    barColor: "bg-purple-500",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    description: "ពិធីជប់លៀងខួបកំណើត",
  },
  {
    key: "ANNIVERSARY",
    label: "ខួបអនុស្សាវរីយ៍",
    subLabel: "Anniversary",
    icon: "🥂",
    color: "#06b6d4",
    barColor: "bg-cyan-500",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    description: "ខួបអាពាហ៍ពិពាហ៍ និងការចងចាំ",
  },
  {
    key: "CORPORATE",
    label: "ស្ថាប័ន",
    subLabel: "Corporate",
    icon: "🏢",
    color: "#10b981",
    barColor: "bg-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "ពិធីសម្ពោធ និងកម្មវិធីស្ថាប័ន",
  },
  {
    key: "OTHER",
    label: "ផ្សេងៗ",
    subLabel: "Other",
    icon: "✨",
    color: "#94a3b8",
    barColor: "bg-slate-400",
    badgeColor: "bg-slate-500/10 text-slate-700 dark:text-zinc-400 border-slate-500/20",
    description: "កម្មវិធីជួបជុំ និងបុណ្យទានផ្សេងៗ",
  },
];

function eventTypeLabel(type, lang = "km") {
  if (type === "ANNIVERSARY_BIRTHDAY") return lang === "en" ? "Birthday / Anniversary" : "ខួបកំណើត/អនុស្សាវរីយ៍";
  const match = EVENT_CATEGORIES.find((c) => c.key === type);
  if (match) return lang === "en" ? match.subLabel : match.label;
  const labelsKm = {
    WEDDING: "អាពាហ៍ពិពាហ៍",
    ENGAGEMENT: "ភ្ជាប់ពាក្យ",
    BIRTHDAY: "ខួបកំណើត",
    ANNIVERSARY: "ខួបអនុស្សាវរីយ៍",
    CORPORATE: "ស្ថាប័ន",
    OTHER: "ផ្សេងៗ",
  };
  const labelsEn = {
    WEDDING: "Wedding",
    ENGAGEMENT: "Engagement",
    BIRTHDAY: "Birthday",
    ANNIVERSARY: "Anniversary",
    CORPORATE: "Corporate",
    OTHER: "Other",
  };
  const labels = lang === "en" ? labelsEn : labelsKm;
  return labels[type] || type || (lang === "en" ? "Unspecified" : "មិនបានកំណត់");
}

function dateLabel(value, lang = "km") {
  if (!value) return lang === "en" ? "Unscheduled" : "មិនទាន់កំណត់";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function formatMoney(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = Number(amount);
  if (!Number.isFinite(num)) return String(amount);
  const isKhr = currency === "KHR" || currency === "RIEL" || currency === "៛";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isKhr ? 0 : 2,
    maximumFractionDigits: isKhr ? 0 : 2,
  }).format(num);
  return isKhr ? `${formatted} ៛` : `$${formatted}`;
}

function ownerLabel(invitation) {
  return invitation.ownerName || invitation.organizationName || `User #${invitation.userId || "—"}`;
}

function invitationName(invitation, lang = "km") {
  return invitation.title || invitation.slug || (lang === "en" ? `Event #${invitation.id}` : `កម្មវិធី #${invitation.id}`);
}

function isNeedsReview(invitation) {
  return ["HIDDEN", "REPORTED", "SUSPENDED"].includes(String(invitation.moderationStatus || "").toUpperCase());
}

function exportCsv(filename, headers, rows) {
  const content = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const stringified = String(cell ?? "").replace(/"/g, '""');
          return `"${stringified}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminReportOverview() {
  const { lang, t } = useAdminLanguage();
  const [report, setReport] = useState(null);
  const [paymentsReport, setPaymentsReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState("");
  const [status, setStatus] = useState("");
  const [openActionId, setOpenActionId] = useState(null);
  const [updatingInvitationId, setUpdatingInvitationId] = useState(null);
  const [actionError, setActionError] = useState("");

  // Task 1: Transactions Filter State
  const [txSearch, setTxSearch] = useState("");
  const [txType, setTxType] = useState("ALL");
  const [txProvider, setTxProvider] = useState("ALL");
  const [txStatus, setTxStatus] = useState("ALL");

  // Task 2: Interactive Category Widget Selection State
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Print Preview & PDF Export State
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);

  useEffect(() => {
    if (!isPreviewMode) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsPreviewMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewMode]);

  const handlePrint = () => {
    const originalTitle = document.title;
    const dateStamp = new Date().toISOString().slice(0, 10);
    document.title = `Koupreng-Admin-Platform-Report-${dateStamp}`;
    try {
      window.print();
    } finally {
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  const reload = useCallback(async () => {
    try {
      let platformData = null;
      if (typeof adminService.platformReport === "function") {
        try {
          platformData = await adminService.platformReport();
        } catch {
          platformData = null;
        }
      }
      const [invitationRes, paymentsRes] = await Promise.allSettled([
        adminService.report("invitations"),
        adminService.report("payments"),
      ]);
      if (!platformData && invitationRes.status === "rejected") throw invitationRes.reason;
      if (platformData) {
        setReport(platformData);
      } else if (invitationRes.status === "fulfilled") {
        setReport(invitationRes.value || null);
      }
      if (paymentsRes.status === "fulfilled") {
        setPaymentsReport(paymentsRes.value || null);
      }
      setError("");
    } catch (loadError) {
      setError(loadError?.message || "មិនអាចទាញយករបាយការណ៍កម្មវិធីបានទេ");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvitationStatus = async (invitation, nextStatus) => {
    setUpdatingInvitationId(invitation.id);
    setActionError("");
    try {
      const updated = await adminService.updateInvitationStatus(invitation.id, nextStatus);
      const updatedStatus = updated?.status || nextStatus;
      setReport((current) => {
        if (!current) return current;
        const rows = asList(current.rows).map((item) =>
          item.id === invitation.id ? { ...item, ...updated, status: updatedStatus } : item
        );
        const publishedInvitations = rows.filter((item) => item.status === "PUBLISHED").length;
        return {
          ...current,
          rows,
          summary: { ...current.summary, publishedInvitations },
        };
      });
      setOpenActionId(null);
      await reload();
    } catch (updateError) {
      setActionError(updateError?.message || "មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពកម្មវិធីបានទេ");
    } finally {
      setUpdatingInvitationId(null);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let platformData = null;
        if (typeof adminService.platformReport === "function") {
          try {
            platformData = await adminService.platformReport();
          } catch {
            platformData = null;
          }
        }
        const [invitationRes, paymentsRes] = await Promise.allSettled([
          adminService.report("invitations"),
          adminService.report("payments"),
        ]);
        if (!platformData && invitationRes.status === "rejected") throw invitationRes.reason;
        if (!active) return;
        if (platformData) {
          setReport(platformData);
        } else if (invitationRes.status === "fulfilled") {
          setReport(invitationRes.value || null);
        }
        if (paymentsRes.status === "fulfilled") {
          setPaymentsReport(paymentsRes.value || null);
        }
        setError("");
      } catch (loadError) {
        if (active) setError(loadError?.message || "មិនអាចទាញយករបាយការណ៍កម្មវិធីបានទេ");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const intervalId = window.setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const rawRows = asList(report?.rows);

  // Derive invitations list
  const invitations = useMemo(() => {
    if (Array.isArray(report?.invitations)) return report.invitations;
    const filtered = rawRows.filter(
      (r) => r && (r.title || r.eventType || r.ownerName || r.eventDate || r.moderationStatus)
    );
    if (filtered.length > 0) return filtered;
    return rawRows.filter(
      (r) =>
        r &&
        r.totalAmount === undefined &&
        r.transactionCount === undefined &&
        r.type !== "TEMPLATE" &&
        r.type !== "SUBSCRIPTION"
    );
  }, [report, rawRows]);

  const summary = report?.summary || {};
  const eventTypes = useMemo(
    () => [...new Set(invitations.map((item) => item.eventType).filter(Boolean))].sort(),
    [invitations]
  );

  // Aggregate Category Metrics for Donut & Breakdown
  const categoryStats = useMemo(() => {
    if (Array.isArray(summary.eventCategoryBreakdown)) {
      const counts = new Map(summary.eventCategoryBreakdown.map((row) => [
        row.category === "ANNIVERSARY_BIRTHDAY" ? "BIRTHDAY" : row.category, Number(row.count) || 0,
      ]));
      const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
      return EVENT_CATEGORIES.map((cat) => ({ ...cat, total: counts.get(cat.key) || 0,
        published: 0, draft: 0, publishRate: 0,
        percent: total ? Math.round((counts.get(cat.key) || 0) / total * 100) : 0 }));
    }
    const total = invitations.length || 1;
    const grouped = {};

    invitations.forEach((inv) => {
      let rawType = String(inv.eventType || "OTHER").toUpperCase();
      if (rawType === "ANNIVERSARY_BIRTHDAY") rawType = "BIRTHDAY";
      const type = EVENT_CATEGORIES.some((c) => c.key === rawType) ? rawType : "OTHER";
      if (!grouped[type]) {
        grouped[type] = { total: 0, published: 0, draft: 0 };
      }
      grouped[type].total += 1;
      if (inv.status === "PUBLISHED") grouped[type].published += 1;
      else grouped[type].draft += 1;
    });

    return EVENT_CATEGORIES.map((cat) => {
      const counts = grouped[cat.key] || { total: 0, published: 0, draft: 0 };
      const percent = invitations.length ? Math.round((counts.total / total) * 100) : 0;
      const publishRate = counts.total ? Math.round((counts.published / counts.total) * 100) : 0;
      return {
        ...cat,
        ...counts,
        percent,
        publishRate,
      };
    });
  }, [invitations, summary.eventCategoryBreakdown]);

  // Compute SVG Donut Slices
  const donutSlices = useMemo(() => {
    const total = categoryStats.reduce((sum, cat) => sum + cat.total, 0);
    if (!total) return [];
    const C = 2 * Math.PI * 60; // circumference for r=60 (~376.99)
    let accumulated = 0;
    return categoryStats
      .filter((cat) => cat.total > 0)
      .map((cat) => {
        const fraction = cat.total / total;
        const dashLength = fraction * C;
        const dashSpace = C - dashLength;
        const dashOffset = -accumulated;
        accumulated += dashLength;
        return {
          key: cat.key,
          color: cat.color,
          dashLength,
          dashSpace,
          dashOffset,
        };
      });
  }, [categoryStats]);

  // Revenue Metrics from paymentsReport
  const paymentsSummary = useMemo(() => paymentsReport?.summary || {}, [paymentsReport]);
  const paidUsd = Number(summary.revenueByCurrency?.USD ?? summary.totalRevenueUsd ?? paymentsSummary.paidAmountUsd ?? 0);
  const paidKhr = Number(summary.revenueByCurrency?.KHR ?? paymentsSummary.paidAmountKhr ?? 0);
  const paidPaymentsCount = paymentsSummary.paidPayments !== undefined ? Number(paymentsSummary.paidPayments) : 0;

  // Transactions list from report or paymentsReport
  const transactions = useMemo(() => {
    if (Array.isArray(report?.transactions)) return report.transactions;
    if (Array.isArray(paymentsReport?.transactions)) return paymentsReport.transactions;

    const fromPaymentsRows = asList(paymentsReport?.rows);
    if (fromPaymentsRows.length > 0) {
      return fromPaymentsRows.map((r, i) => ({
        id: r.id || r.orderCode || `tx-${i}`,
        period: r.period || (r.createdAt ? String(r.createdAt).slice(0, 7) : "—"),
        reference: r.reference || r.orderCode || r.transactionId || `TXN-${r.id || i + 1}`,
        type: r.type || (r.templateId ? "TEMPLATE" : "SUBSCRIPTION"),
        provider: r.provider || "KHQR",
        status: r.status || "COMPLETED",
        transactionCount: r.transactionCount ?? 1,
        totalAmount: r.totalAmount ?? r.amount ?? r.paidAmount ?? 0,
        currency: r.currency || "USD",
        ...r,
      }));
    }

    const fromReportRows = rawRows.filter(
      (r) =>
        r &&
        (r.type === "TEMPLATE" ||
          r.type === "SUBSCRIPTION" ||
          r.totalAmount !== undefined ||
          r.transactionCount !== undefined ||
          r.period)
    );
    if (fromReportRows.length > 0) {
      return fromReportRows.map((r, i) => ({
        id: r.id || r.orderCode || r.reference || `tx-${i}`,
        period: r.period || "—",
        reference: r.reference || r.orderCode || r.transactionId || `TXN-${r.id || i + 1}`,
        type: r.type || "TEMPLATE",
        provider: r.provider || "KHQR",
        status: r.status || "COMPLETED",
        transactionCount: r.transactionCount ?? 1,
        totalAmount: r.totalAmount ?? r.amount ?? 0,
        currency: r.currency || "USD",
        ...r,
      }));
    }

    return [];
  }, [report, paymentsReport, rawRows]);

  // Dynamic filter options for transactions
  const uniqueProviders = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      if (tx.provider) set.add(String(tx.provider));
    });
    return Array.from(set).sort();
  }, [transactions]);

  const uniqueStatuses = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      if (tx.status) set.add(String(tx.status));
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Client-side transactions filtering with persistence across auto-refresh
  const filteredTransactions = useMemo(() => {
    const q = txSearch.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchSearch =
        !q ||
        [
          tx.reference,
          tx.provider,
          tx.orderCode,
          tx.transactionId,
          tx.customerName,
        ].some((val) => val && String(val).toLowerCase().includes(q));

      const matchType = txType === "ALL" || String(tx.type || "").toUpperCase() === txType;
      const matchProvider =
        txProvider === "ALL" || String(tx.provider || "").toUpperCase() === txProvider.toUpperCase();
      const matchStatus =
        txStatus === "ALL" || String(tx.status || "").toUpperCase() === txStatus.toUpperCase();

      return matchSearch && matchType && matchProvider && matchStatus;
    });
  }, [transactions, txSearch, txType, txProvider, txStatus]);

  const clearFilters = () => {
    setTxSearch("");
    setTxType("ALL");
    setTxProvider("ALL");
    setTxStatus("ALL");
  };

  // Filtered invitations for the events table
  const visibleInvitations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return invitations.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          item.title,
          item.slug,
          item.ownerName,
          item.organizationName,
          item.userId,
          item.eventType,
          item.eventDate,
        ].some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
      return (
        matchesQuery &&
        (!eventType || item.eventType === eventType) &&
        (!status || item.status === status)
      );
    });
  }, [invitations, query, eventType, status]);

  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Title",
      "Owner",
      "Event Type",
      "Event Date",
      "Status",
      "Moderation Status",
    ];
    const rows = visibleInvitations.map((item) => [
      item.id,
      invitationName(item, lang),
      ownerLabel(item),
      eventTypeLabel(item.eventType, lang),
      item.eventDate || "",
      item.status || "",
      item.moderationStatus || "",
    ]);
    exportCsv(`invitations-report-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  if (loading) return <LoadingState label={t("reports.loading", "កំពុងទាញយករបាយការណ៍កម្មវិធី...")} />;
  if (error && !report) return <ErrorStateView message={error || t("reports.error", "មិនអាចទាញយករបាយការណ៍កម្មវិធីបានទេ")} onRetry={reload} />;

  const publishedCount = Number(
    summary.publishedInvitations ?? invitations.filter((item) => item.status === "PUBLISHED").length
  );
  const draftCount = invitations.filter((item) => ["DRAFT", "UNPUBLISHED"].includes(item.status)).length;
  const reviewCount = invitations.filter(isNeedsReview).length;

  return (
    <div className={`reports-page space-y-6 ${isPreviewMode ? "is-print-preview" : ""}`}>
      {isPreviewMode && (
        <aside className="report-preview-toolbar reports-screen-only" role="region" aria-label="Print preview controls">
          <div className="report-preview-toolbar-inner">
            <div className="report-preview-meta">
              <span className="report-preview-badge">A4 Portrait</span>
              <strong>{lang === "en" ? "Platform Report Preview" : "ផ្ទាំងមើលគំរូមុនបោះពុម្ព / Print Preview"}</strong>
              <span className="report-preview-hint text-xs text-slate-300 hidden md:inline">
                {lang === "en" ? "(A4 210 × 297 mm · Press Esc to exit)" : "(ទំហំក្រដាស A4 210 × 297 mm · ចុច Esc ដើម្បីបិទ)"}
              </span>
            </div>
            <div className="report-preview-controls">
              <div className="report-zoom-controls">
                <button
                  type="button"
                  className="report-zoom-btn"
                  onClick={() => setPreviewZoom((z) => Math.max(70, z - 10))}
                  disabled={previewZoom <= 70}
                  title={lang === "en" ? "Zoom out" : "បង្រួម"}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={14} aria-hidden="true" />
                </button>
                <span className="report-zoom-level">{previewZoom}%</span>
                <button
                  type="button"
                  className="report-zoom-btn"
                  onClick={() => setPreviewZoom((z) => Math.min(140, z + 10))}
                  disabled={previewZoom >= 140}
                  title={lang === "en" ? "Zoom in" : "ពង្រីក"}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={14} aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                className="report-preview-action report-preview-print"
                onClick={handlePrint}
              >
                <FileDown size={14} aria-hidden="true" />
                <span>{lang === "en" ? "Save as PDF" : "ទាញយកជា PDF"}</span>
              </button>
              <button
                type="button"
                className="report-preview-action report-preview-print"
                onClick={handlePrint}
              >
                <Printer size={14} aria-hidden="true" />
                <span>{lang === "en" ? "Print" : "បោះពុម្ព"}</span>
              </button>
              <button
                type="button"
                className="report-preview-close"
                onClick={() => setIsPreviewMode(false)}
                aria-label="Exit preview"
              >
                <X size={15} aria-hidden="true" />
                <span>{lang === "en" ? "Exit" : "បិទ / Exit"}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      <div
        className={isPreviewMode ? "report-sheet-simulation space-y-6" : "space-y-6"}
        style={isPreviewMode && previewZoom !== 100 ? { transform: `scale(${previewZoom / 100})`, transformOrigin: "top center" } : undefined}
      >
        <AdminPageHeader
          eyebrow={t("reports.eyebrow", "PLATFORM REPORTS")}
          title={t("reports.title", "របាយការណ៍កម្មវិធី និងប្រព័ន្ធ")}
          subtitle={t("reports.subtitle", "ទិដ្ឋភាពទូទៅនៃកម្មវិធីទាំងអស់ ស្ថានភាពផ្សាយ ការវិភាគតាមប្រភេទកម្មវិធី និងចំណូលហិរញ្ញវត្ថុ។")}
          actions={
            <div className="flex flex-wrap items-center gap-2 reports-screen-only">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewMode(true)}
                title={lang === "en" ? "Print preview A4 layout" : "មើលគំរូមុនបោះពុម្ព / Print Preview"}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Print Preview" : "មើលគំរូ / Print Preview"}</span>
              </ActionButton>
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                title={lang === "en" ? "Print or save platform report as PDF" : "បោះពុម្ព ឬរក្សាទុកជារបាយការណ៍ PDF"}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Print Report" : "បោះពុម្ព / Print Report"}</span>
              </ActionButton>
              <ActionButton variant="secondary" size="sm" onClick={handleExportCsv}>
                <Download className="h-3.5 w-3.5" />
                <span>{t("reports.exportCsv", "ទាញយក CSV")}</span>
              </ActionButton>
              <ActionButton variant="ghost" size="sm" onClick={reload}>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t("reports.refresh", "ធ្វើបច្ចុប្បន្នភាព")}</span>
              </ActionButton>
            </div>
          }
        />

      {(error || actionError) && (
        <p role="status" className="text-xs text-amber-700">
          {actionError || (lang === "en" ? "Unable to update; showing latest fetched data." : "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ; កំពុងបង្ហាញទិន្នន័យចុងក្រោយដែលបានទាញយក។")}
        </p>
      )}

      {/* របាយការណ៍កម្មវិធី (Events Lifecycle KPI Cards) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("reports.totalInvitations", "ស្ថិតិកម្មវិធី")}>
        <StatCard
          label={t("reports.totalInvitations", "កម្មវិធីសរុប")}
          value={summary.totalInvitations ?? invitations.length}
          note={t("reports.totalInvitationsNote", "កម្មវិធីទាំងអស់ក្នុងប្រព័ន្ធ")}
          icon={CalendarDays}
          tone="cyan"
        />
        <StatCard
          label={t("reports.published", "បានផ្សាយ")}
          value={publishedCount}
          note={t("reports.publishedNote", "ស្ថានភាព PUBLISHED")}
          icon={CircleCheck}
          tone="emerald"
        />
        <StatCard
          label={t("reports.draft", "Draft / មិនទាន់ផ្សាយ")}
          value={draftCount}
          note={t("reports.draftNote", "DRAFT និង UNPUBLISHED")}
          icon={FilePenLine}
          tone="amber"
        />
        <StatCard
          label={t("reports.review", "ត្រូវការត្រួតពិនិត្យ")}
          value={reviewCount}
          note={t("reports.reviewNote", "Hidden, reported ឬ suspended")}
          icon={ShieldAlert}
          tone="rose"
        />
      </section>

      {Array.isArray(summary.subscriptionTiers) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800" aria-label="Subscription packages report">
          <h2 className="text-sm font-bold">{lang === "en" ? "Subscription packages report" : "របាយការណ៍ប្រភេទ Subscription"}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {summary.subscriptionTiers.map((tier) => <li key={tier.tier} className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-900">
              <span>{tier.tier}</span>: <strong>{tier.activeSubscriptions}</strong>
            </li>)}
          </ul>
        </section>
      )}
      {/* Task 2: Interactive Event Categories Widget (Donut + Breakdown Component) */}
      <section
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#111113]"
        aria-label={t("reports.categoriesTitle", "របាយការណ៍ប្រភេទកម្មវិធី")}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800/80">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {t("reports.categoriesTitle", "របាយការណ៍ប្រភេទកម្មវិធី (Event categories)")}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              {t("reports.categoriesSubtitle", "ការបែងចែកចំនួនកម្មវិធីតាមប្រភេទ អាពាហ៍ពិពាហ៍, ភ្ជាប់ពាក្យ, ខួបកំណើត, និងផ្សេងៗទៀត")}
            </p>
          </div>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="cursor-pointer text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
            >
              {t("reports.clearSelection", "Clear selection (បង្ហាញទាំងអស់)")}
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* Donut Chart */}
          <div className="flex flex-col items-center justify-center lg:col-span-5">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg viewBox="0 0 180 180" className="h-44 w-44">
                {/* Background track circle */}
                <circle
                  cx="90"
                  cy="90"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-zinc-800"
                  strokeWidth="20"
                />
                {/* Colored slices */}
                {donutSlices.map((slice) => (
                  <circle
                    key={slice.key}
                    cx="90"
                    cy="90"
                    r="60"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="20"
                    strokeDasharray={`${slice.dashLength} ${slice.dashSpace}`}
                    strokeDashoffset={slice.dashOffset}
                    transform="rotate(-90 90 90)"
                    data-category={slice.key}
                    data-testid={`donut-segment-${slice.key}`}
                    className="cursor-pointer transition-all duration-300"
                    style={{
                      opacity: selectedCategory
                        ? selectedCategory === slice.key
                          ? 1
                          : 0.25
                        : 1,
                    }}
                    onClick={() =>
                      setSelectedCategory((prev) => (prev === slice.key ? null : slice.key))
                    }
                  />
                ))}
              </svg>
              {/* Center count */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  {categoryStats.reduce((sum, cat) => sum + cat.total, 0)}
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                  {t("reports.donutCenterTotal", "សរុប / Total")}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2 lg:col-span-7" role="group" aria-label={lang === "en" ? "Category breakdown list" : "បញ្ជីប្រភេទកម្មវិធី"}>
            {categoryStats.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const primaryLabel = lang === "en" ? cat.subLabel : cat.label;
              const secondaryLabel = lang === "en" ? cat.label : cat.subLabel;
              return (
                <button
                  key={cat.key}
                  type="button"
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${cat.label} (${cat.subLabel}): ${cat.total} events, ${cat.percent}%`}
                  data-testid={`category-row-${cat.key}`}
                  onClick={() => setSelectedCategory((prev) => (prev === cat.key ? null : cat.key))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCategory((prev) => (prev === cat.key ? null : cat.key));
                    }
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition-all duration-200 ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 dark:border-amber-400 dark:bg-amber-400/10"
                      : selectedCategory
                      ? "border-slate-100 bg-slate-50/40 opacity-50 hover:opacity-100 dark:border-zinc-800/80 dark:bg-zinc-900/30"
                      : "border-slate-200/70 bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-[#111113] hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span className="text-base" role="img" aria-label={primaryLabel}>
                      {cat.icon}
                    </span>
                    <div className="truncate text-left">
                      <span className="font-bold text-slate-900 dark:text-zinc-100">{primaryLabel}</span>
                      <span className="ml-1.5 text-[11px] font-normal text-slate-400 dark:text-zinc-500">
                        ({secondaryLabel})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 dark:text-zinc-100">
                        {cat.total}
                      </span>
                      <span className="ml-1 text-[11px] text-slate-400 dark:text-zinc-500">
                        ({cat.percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: cat.color,
                          width: `${Math.max(cat.percent, cat.total > 0 ? 6 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Task 1: Revenue & Payments Panel with Filter Bar & Transactions Table */}
      <section
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-[#111113]"
        aria-label={t("reports.revenueTitle", "របាយការណ៍ចំណូល និងការទូទាត់")}
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-zinc-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t("reports.revenueTitle", "របាយការណ៍ចំណូល & ការទូទាត់ (Revenue & Payments)")}
              </h2>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-lg font-black text-slate-900 dark:text-zinc-100">
                  {formatMoney(paidUsd, "USD")}
                </span>
                {paidKhr > 0 && (
                  <span className="text-sm font-bold text-slate-600 dark:text-zinc-300">
                    {formatMoney(paidKhr, "KHR")}
                  </span>
                )}
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {paidPaymentsCount > 0
                    ? `(${t("reports.successfulTransactions", `${paidPaymentsCount} ប្រតិបត្តិការជោគជ័យ`, { count: paidPaymentsCount })})`
                    : `(${t("reports.trackKhqr", "តាមដានការទូទាត់ KHQR")})`}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/payments"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>{t("reports.managePayments", "គ្រប់គ្រងការទូទាត់ KHQR")}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Filter Bar (directly above the table) */}
        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50/70 p-3 dark:bg-zinc-900/50 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-44 flex-1">
              <Search aria-hidden="true" className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="search"
                aria-label={t("reports.searchTxAria", "Search transactions")}
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder={t("reports.searchTxPlaceholder", "Search reference or provider...")}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>

            <select
              aria-label={t("reports.typeAria", "Transaction type")}
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="ALL">{t("reports.allTypes", "All Types")}</option>
              <option value="TEMPLATE">{t("reports.templateType", "Template")}</option>
              <option value="SUBSCRIPTION">{t("reports.subscriptionType", "Subscription")}</option>
            </select>

            <select
              aria-label={t("reports.providerAria", "Transaction provider")}
              value={txProvider}
              onChange={(e) => setTxProvider(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="ALL">{t("reports.allProviders", "All Providers")}</option>
              {uniqueProviders.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            <select
              aria-label={t("reports.statusTxAria", "Transaction status")}
              value={txStatus}
              onChange={(e) => setTxStatus(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="ALL">{t("reports.allTxStatuses", "All Statuses")}</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="shrink-0 text-xs font-medium text-slate-500 dark:text-zinc-400">
            {t("reports.showingTx", `Showing ${filteredTransactions.length} of ${transactions.length} transactions`, {
              showing: filteredTransactions.length,
              total: transactions.length,
            })}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
          <table aria-label="Transactions table" className="w-full min-w-160 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 dark:bg-zinc-900/70 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2.5">{t("reports.colTxPeriod", "Period")}</th>
                <th className="px-4 py-2.5">{t("reports.colTxRef", "Reference")}</th>
                <th className="px-4 py-2.5">{t("reports.colTxType", "Type")}</th>
                <th className="px-4 py-2.5">{t("reports.colTxProvider", "Provider")}</th>
                <th className="px-4 py-2.5">{t("reports.colTxStatus", "Status")}</th>
                <th className="px-4 py-2.5 text-right">{t("reports.colTxCount", "Transactions")}</th>
                <th className="px-4 py-2.5 text-right">{t("reports.colTxTotal", "Total Amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredTransactions.map((tx, idx) => {
                const key = tx.id || tx.orderCode || tx.reference || `tx-${idx}`;
                return (
                  <tr key={key} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-zinc-100">
                      {tx.period || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-zinc-400">
                      {tx.reference || tx.orderCode || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          String(tx.type).toUpperCase() === "SUBSCRIPTION"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        }`}
                      >
                        {tx.type || "TEMPLATE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-zinc-300">
                      {tx.provider || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <TransactionStatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                      {tx.transactionCount ?? 1}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900 dark:text-zinc-100">
                      {formatMoney(tx.totalAmount ?? tx.amount, tx.currency || "USD")}
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p>{t("reports.noTx", "No transactions match the current filters.")}</p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        {t("reports.clearFilters", "Clear filters")}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Main Invitations Data Table with Quick Filters */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111113]">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{t("reports.eventsListTitle", "បញ្ជីកម្មវិធី")}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              {t("reports.showingEvents", `បង្ហាញ ${visibleInvitations.length} ក្នុងចំណោម ${invitations.length} កម្មវិធី`, {
                showing: visibleInvitations.length,
                total: invitations.length,
              })}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <span className="sr-only">{t("reports.searchEventsAria", "ស្វែងរកកម្មវិធី")}</span>
              <input
                type="search"
                aria-label={t("reports.searchEventsAria", "ស្វែងរកកម្មវិធី")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("reports.searchEventsPlaceholder", "ឈ្មោះ, ម្ចាស់ ឬ ID")}
                className="h-9 w-full min-w-48 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </label>
            <label>
              <span className="sr-only">{t("reports.eventTypeAria", "ប្រភេទកម្មវិធី")}</span>
              <select
                aria-label={t("reports.eventTypeAria", "ប្រភេទកម្មវិធី")}
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="">{t("reports.allEventTypes", "គ្រប់ប្រភេទ")}</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {eventTypeLabel(type, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">{t("reports.statusAria", "ស្ថានភាពផ្សាយ")}</span>
              <select
                aria-label={t("reports.statusAria", "ស្ថានភាពផ្សាយ")}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="">{t("reports.allStatuses", "គ្រប់ស្ថានភាព")}</option>
                <option value="PUBLISHED">{t("reports.badgePublished", "បានផ្សាយ")}</option>
                <option value="DRAFT">{t("reports.badgeDraft", "សេចក្តីព្រាង")}</option>
                <option value="UNPUBLISHED">{t("reports.badgeUnpublished", "មិនទាន់ផ្សាយ")}</option>
                <option value="ARCHIVED">{t("reports.badgeArchived", "បានរក្សាទុក")}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table aria-label={t("reports.eventsListTitle", "បញ្ជីកម្មវិធី")} className="w-full min-w-225 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 dark:bg-zinc-900/70 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">{t("reports.colEvent", "កម្មវិធី")}</th>
                <th className="px-4 py-3">{t("reports.colOwner", "ម្ចាស់")}</th>
                <th className="px-4 py-3">{t("reports.colType", "ប្រភេទ")}</th>
                <th className="px-4 py-3">{t("reports.colDate", "ថ្ងៃកម្មវិធី")}</th>
                <th className="px-4 py-3">{t("reports.colPublish", "ការផ្សាយ")}</th>
                <th className="px-4 py-3">{t("reports.colModeration", "Moderation")}</th>
                <th className="px-4 py-3 text-right">{t("reports.colDetails", "លម្អិត")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {visibleInvitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                      {invitationName(invitation, lang)}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-500">
                      ID {invitation.id}
                      {invitation.slug ? ` · ${invitation.slug}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-zinc-300">
                    {ownerLabel(invitation)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                      <span>{EVENT_CATEGORIES.find((c) => c.key === invitation.eventType)?.icon || "✨"}</span>
                      <span>{eventTypeLabel(invitation.eventType, lang)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{dateLabel(invitation.eventDate, lang)}</td>
                  <td className="px-4 py-3">
                    <InvitationStatusBadge status={invitation.status} lang={lang} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={invitation.moderationStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={lang === "en" ? `Actions for ${invitationName(invitation, lang)}` : `សកម្មភាព ${invitationName(invitation, lang)}`}
                        aria-expanded={openActionId === invitation.id}
                        onClick={() =>
                          setOpenActionId(openActionId === invitation.id ? null : invitation.id)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        disabled={updatingInvitationId === invitation.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openActionId === invitation.id && (
                        <div
                          role="menu"
                          className="absolute right-0 top-full z-20 mt-1 grid min-w-44 gap-1 rounded-lg border border-slate-200 bg-white p-1 text-left shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          {["DRAFT", "UNPUBLISHED"].includes(invitation.status) && (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => updateInvitationStatus(invitation, "PUBLISHED")}
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            >
                              <Upload className="h-3.5 w-3.5" /> {t("reports.actionPublish", "Publish / ផ្សព្វផ្សាយ")}
                            </button>
                          )}
                          {invitation.status === "PUBLISHED" && (
                            <>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => updateInvitationStatus(invitation, "UNPUBLISHED")}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              >
                                <X className="h-3.5 w-3.5" /> {t("reports.actionUnpublish", "Unpublish / បិទការផ្សាយ")}
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => updateInvitationStatus(invitation, "ARCHIVED")}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              >
                                <Archive className="h-3.5 w-3.5" /> {t("reports.actionArchive", "Archive / រក្សាទុក")}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleInvitations.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    {t("reports.noEvents", "មិនមានកម្មវិធីត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </div>
  );
}

function InvitationStatusBadge({ status, lang = "km" }) {
  const styles = {
    DRAFT: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
    PUBLISHED: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
    UNPUBLISHED: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
    ARCHIVED: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900",
  };
  const labelsKm = {
    DRAFT: "សេចក្តីព្រាង",
    PUBLISHED: "បានផ្សាយ",
    UNPUBLISHED: "មិនទាន់ផ្សាយ",
    ARCHIVED: "បានរក្សាទុក",
  };
  const labelsEn = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    UNPUBLISHED: "Unpublished",
    ARCHIVED: "Archived",
  };
  const normalized = String(status || "").toUpperCase();
  const labels = lang === "en" ? labelsEn : labelsKm;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        styles[normalized] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {labels[normalized] || status || (lang === "en" ? "Unspecified" : "មិនបានកំណត់")}
    </span>
  );
}

function TransactionStatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();
  const styles = {
    COMPLETED: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
    PAID: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
    PENDING: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
    FAILED: "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900",
    REJECTED: "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
        styles[normalized] || "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}
