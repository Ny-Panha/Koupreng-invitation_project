import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, ArrowUpRight, CalendarDays, CircleCheck, FilePenLine, MoreHorizontal, RefreshCw, Search, ShieldAlert, Upload, X } from "lucide-react";
import { ActionButton, AdminPageHeader, ErrorStateView, LoadingState, StatCard, StatusBadge } from "../../shared/ui/AdminUI";
import adminService from "../../shared/api/adminService";

function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

function eventTypeLabel(type) {
  const labels = {
    WEDDING: "អាពាហ៍ពិពាហ៍",
    ENGAGEMENT: "ភ្ជាប់ពាក្យ",
    BIRTHDAY: "ខួបកំណើត",
    ANNIVERSARY: "ខួបអនុស្សាវរីយ៍",
    CORPORATE: "ស្ថាប័ន",
    OTHER: "ផ្សេងៗ",
  };
  return labels[type] || type || "មិនបានកំណត់";
}

function dateLabel(value) {
  if (!value) return "មិនទាន់កំណត់";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function ownerLabel(invitation) {
  return invitation.ownerName || invitation.organizationName || `User #${invitation.userId || "—"}`;
}

function invitationName(invitation) {
  return invitation.title || invitation.slug || `កម្មវិធី #${invitation.id}`;
}

function isNeedsReview(invitation) {
  return ["HIDDEN", "REPORTED", "SUSPENDED"].includes(String(invitation.moderationStatus || "").toUpperCase());
}

export default function AdminReportOverview() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState("");
  const [status, setStatus] = useState("");
  const [openActionId, setOpenActionId] = useState(null);
  const [updatingInvitationId, setUpdatingInvitationId] = useState(null);
  const [actionError, setActionError] = useState("");

  const reload = useCallback(async () => {
    try {
      const data = await adminService.report("invitations");
      setReport(data || null);
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
        const rows = asList(current.rows).map((item) => item.id === invitation.id
          ? { ...item, ...updated, status: updatedStatus }
          : item);
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
        const data = await adminService.report("invitations");
        if (!active) return;
        setReport(data || null);
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

  const invitations = asList(report?.rows);
  const summary = report?.summary || {};
  const eventTypes = useMemo(() => [...new Set(invitations.map((item) => item.eventType).filter(Boolean))].sort(), [invitations]);
  const visibleInvitations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return invitations.filter((item) => {
      const matchesQuery = !normalizedQuery || [
        item.title,
        item.slug,
        item.ownerName,
        item.organizationName,
        item.userId,
        item.eventType,
        item.eventDate,
      ].some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
      return matchesQuery
        && (!eventType || item.eventType === eventType)
        && (!status || item.status === status);
    });
  }, [invitations, query, eventType, status]);

  if (loading) return <LoadingState label="កំពុងទាញយករបាយការណ៍កម្មវិធី..." />;
  if (error && !report) return <ErrorStateView message={error} onRetry={reload} />;

  const publishedCount = Number(summary.publishedInvitations ?? invitations.filter((item) => item.status === "PUBLISHED").length);
  const draftCount = invitations.filter((item) => ["DRAFT", "UNPUBLISHED"].includes(item.status)).length;
  const reviewCount = invitations.filter(isNeedsReview).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="PLATFORM REPORTS"
        title="របាយការណ៍កម្មវិធី"
        subtitle="ទិដ្ឋភាពទូទៅនៃកម្មវិធីទាំងអស់ ស្ថានភាពផ្សាយ និងកម្មវិធីដែលត្រូវការត្រួតពិនិត្យ។"
        actions={(
          <ActionButton variant="ghost" size="sm" onClick={reload}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>ធ្វើបច្ចុប្បន្នភាព</span>
          </ActionButton>
        )}
      />

      {(error || actionError) && <p role="status" className="text-xs text-amber-700">{actionError || "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ; កំពុងបង្ហាញទិន្នន័យចុងក្រោយដែលបានទាញយក។"}</p>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="ស្ថិតិកម្មវិធី">
        <StatCard label="កម្មវិធីសរុប" value={summary.totalInvitations ?? invitations.length} note="កម្មវិធីទាំងអស់ក្នុងប្រព័ន្ធ" icon={CalendarDays} tone="cyan" />
        <StatCard label="បានផ្សាយ" value={publishedCount} note="ស្ថានភាព PUBLISHED" icon={CircleCheck} tone="emerald" />
        <StatCard label="Draft / មិនទាន់ផ្សាយ" value={draftCount} note="DRAFT និង UNPUBLISHED" icon={FilePenLine} tone="amber" />
        <StatCard label="ត្រូវការត្រួតពិនិត្យ" value={reviewCount} note="Hidden, reported ឬ suspended" icon={ShieldAlert} tone="rose" />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111113]">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">បញ្ជីកម្មវិធី</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">បង្ហាញ {visibleInvitations.length} ក្នុងចំណោម {invitations.length} កម្មវិធី</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <span className="sr-only">ស្វែងរកកម្មវិធី</span>
              <input type="search" aria-label="ស្វែងរកកម្មវិធី" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ឈ្មោះ, ម្ចាស់ ឬ ID" className="h-9 w-full min-w-48 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
            </label>
            <label>
              <span className="sr-only">ប្រភេទកម្មវិធី</span>
              <select aria-label="ប្រភេទកម្មវិធី" value={eventType} onChange={(event) => setEventType(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                <option value="">គ្រប់ប្រភេទ</option>
                {eventTypes.map((type) => <option key={type} value={type}>{eventTypeLabel(type)}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">ស្ថានភាពផ្សាយ</span>
              <select aria-label="ស្ថានភាពផ្សាយ" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
                <option value="">គ្រប់ស្ថានភាព</option>
                <option value="PUBLISHED">បានផ្សាយ</option>
                <option value="DRAFT">Draft</option>
                <option value="UNPUBLISHED">មិនទាន់ផ្សាយ</option>
                <option value="ARCHIVED">បានរក្សាទុក</option>
              </select>
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 dark:bg-zinc-900/70 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">កម្មវិធី</th>
                <th className="px-4 py-3">ម្ចាស់</th>
                <th className="px-4 py-3">ប្រភេទ</th>
                <th className="px-4 py-3">ថ្ងៃកម្មវិធី</th>
                <th className="px-4 py-3">ការផ្សាយ</th>
                <th className="px-4 py-3">Moderation</th>
                <th className="px-4 py-3 text-right">លម្អិត</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {visibleInvitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60">
                  <td className="px-4 py-3">
                    <Link to={`/reports/${encodeURIComponent(invitation.id)}`} className="font-semibold text-slate-900 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-400">{invitationName(invitation)}</Link>
                    <span className="mt-1 block text-[11px] text-slate-500">ID {invitation.id}{invitation.slug ? ` · ${invitation.slug}` : ""}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-zinc-300">{ownerLabel(invitation)}</td>
                  <td className="px-4 py-3">{eventTypeLabel(invitation.eventType)}</td>
                  <td className="px-4 py-3 tabular-nums">{dateLabel(invitation.eventDate)}</td>
                  <td className="px-4 py-3"><InvitationStatusBadge status={invitation.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={invitation.moderationStatus} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-flex items-center gap-1">
                      <Link to={`/reports/${encodeURIComponent(invitation.id)}`} aria-label={`មើលរបាយការណ៍ ${invitationName(invitation)}`} title="មើលរបាយការណ៍លម្អិត" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`សកម្មភាព ${invitationName(invitation)}`}
                        aria-expanded={openActionId === invitation.id}
                        onClick={() => setOpenActionId(openActionId === invitation.id ? null : invitation.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        disabled={updatingInvitationId === invitation.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openActionId === invitation.id && <div role="menu" className="absolute right-0 top-full z-20 mt-1 grid min-w-44 gap-1 rounded-lg border border-slate-200 bg-white p-1 text-left shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                        {(["DRAFT", "UNPUBLISHED"].includes(invitation.status)) && <button type="button" role="menuitem" onClick={() => updateInvitationStatus(invitation, "PUBLISHED")} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40">
                          <Upload className="h-3.5 w-3.5" /> Publish / ផ្សព្វផ្សាយ
                        </button>}
                        {invitation.status === "PUBLISHED" && <>
                          <button type="button" role="menuitem" onClick={() => updateInvitationStatus(invitation, "UNPUBLISHED")} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
                            <X className="h-3.5 w-3.5" /> Unpublish / បិទការផ្សាយ
                          </button>
                          <button type="button" role="menuitem" onClick={() => updateInvitationStatus(invitation, "ARCHIVED")} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
                            <Archive className="h-3.5 w-3.5" /> Archive / រក្សាទុក
                          </button>
                        </>}
                      </div>}
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleInvitations.length && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">មិនមានកម្មវិធីត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InvitationStatusBadge({ status }) {
  const styles = {
    DRAFT: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
    PUBLISHED: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
    UNPUBLISHED: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
    ARCHIVED: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900",
  };
  const labels = {
    DRAFT: "សេចក្តីព្រាង",
    PUBLISHED: "បានផ្សាយ",
    UNPUBLISHED: "មិនទាន់ផ្សាយ",
    ARCHIVED: "បានរក្សាទុក",
  };
  const normalized = String(status || "").toUpperCase();
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles[normalized] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {labels[normalized] || status || "មិនបានកំណត់"}
  </span>;
}
