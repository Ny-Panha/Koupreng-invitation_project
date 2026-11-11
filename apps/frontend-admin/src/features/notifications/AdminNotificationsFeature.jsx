import { RefreshStatus } from "../../shared/ui/AdminSkeleton";
import { useMemo, useState } from "react";
import AdminDialog from "../../layouts/components/AdminDialog";
import {
  Bell,
  Send,
  AlertTriangle,
  Users,
  User,
  Radio,
  Search,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Loading, ErrorState, Empty, Toast } from "../../shared/ui";
import { useResource, useToast } from "../../shared/hooks";
import { formatDateTime } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

const EMPTY_FORM = {
  audienceMode: "USER", // "USER" | "BROADCAST"
  recipientId: "",
  type: "SYSTEM_ALERT",
  channel: "SYSTEM",
  title: "",
  message: "",
};

export default function AdminNotificationsPage() {
  const { lang, t } = useAdminLanguage();
  const { data, setData, loading, refreshing, error, reload } = useResource(
    adminManagementService.notifications
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { toast, show, clear } = useToast();

  const notifications = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (channelFilter !== "ALL" && item.channel !== channelFilter) return false;
      if (!q) return true;
      return [item.title, item.message, item.recipientEmail, item.type, item.status]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [data, query, statusFilter, channelFilter]);

  const setField = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) {
      errors.title = lang === "en" ? "Title is required" : "សូមបញ្ចូលចំណងជើង";
    }
    if (!form.message.trim()) {
      errors.message = lang === "en" ? "Message is required" : "សូមបញ្ចូលខ្លឹមសារសារ";
    }
    if (form.audienceMode === "USER") {
      const idNum = Number(form.recipientId);
      if (!form.recipientId || isNaN(idNum) || idNum <= 0) {
        errors.recipientId = t(
          "notifications.invalidRecipient",
          "Please provide a valid numeric User ID."
        );
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (form.audienceMode === "BROADCAST") {
      setShowBroadcastModal(true);
      return;
    }

    executeDispatch();
  };

  const executeDispatch = async () => {
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        channel: form.channel,
        userId: form.audienceMode === "USER" ? Number(form.recipientId) : null,
      };

      const created = await adminManagementService.createNotification(payload);
      setData((prev) => [created, ...(prev || [])]);
      setForm(EMPTY_FORM);
      setShowBroadcastModal(false);
      show(
        `${lang === "en" ? "Notification saved. Server status:" : "បានរក្សាទុកសារជូនដំណឹង។ ស្ថានភាពពីម៉ាស៊ីនមេ៖"} ${created?.status || "UNKNOWN"}. ${lang === "en" ? "Creation alone does not confirm external delivery." : "ការបង្កើតតែមួយមុខមិនបញ្ជាក់ថាបានបញ្ជូនទៅខាងក្រៅទេ។"}`
      );
    } catch (err) {
      show(
        err?.message ||
          t("notifications.toastFail", "Could not send notification"),
        "error"
      );
    } finally {
      setBusy(false);
    }
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
            <Bell className="h-5 w-5 text-amber-500" />
            {t("notifications.title", "Notifications")}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
            {t(
              "notifications.subtitle",
              "Send system notifications to users and view delivery statuses"
            )}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost inline-flex items-center gap-1.5 self-start sm:self-auto text-xs"
          onClick={reload}
        >
          <RotateCw className="h-3.5 w-3.5" />
          {t("common.refresh", "Refresh")}
        </button>
      </div>

      {/* Composer Section */}
      <section className="card p-5 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Send className="h-4 w-4 text-amber-500" />
            {t("notifications.createTitle", "Create System Notification")}
          </h3>
          <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
            {form.audienceMode === "BROADCAST" ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                {t("notifications.audienceBroadcast", "All Users Broadcast")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-300">
                <User className="h-3.5 w-3.5 text-sky-500" />
                {t("notifications.audienceUser", "Single User")}
              </span>
            )}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Audience Mode Segmented Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              {t("notifications.audienceLabel", "Target Audience")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl">
              <button
                type="button"
                onClick={() => setField("audienceMode", "USER")}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  form.audienceMode === "USER"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <User className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold">
                    {t("notifications.audienceUser", "Single User")}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                    {lang === "en"
                      ? "Direct dispatch to one specific user account"
                      : "ផ្ញើសារជូនដំណឹងផ្ទាល់ទៅកាន់អ្នកប្រើប្រាស់ម្នាក់"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setField("audienceMode", "BROADCAST")}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  form.audienceMode === "BROADCAST"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500"
                    : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <Users className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold">
                    {t("notifications.audienceBroadcast", "All Users Broadcast")}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                    {lang === "en"
                      ? "System-wide notification visible to all users"
                      : "សេចក្តីប្រកាសទូទាំងប្រព័ន្ធសម្រាប់អ្នកប្រើទាំងអស់"}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Broadcast Alert Warning */}
          {form.audienceMode === "BROADCAST" && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200 text-xs"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong>
                  {lang === "en" ? "Broadcast Notice:" : "ការជូនដំណឹងផ្សាយទូទៅ:"}
                </strong>{" "}
                {t(
                  "notifications.audienceSummaryBroadcast",
                  "System-wide announcement visible to all registered platform users"
                )}
                .{" "}
                {lang === "en"
                  ? "A confirmation dialog will appear before dispatch."
                  : "ផ្ទាំងបញ្ជាក់នឹងបង្ហាញឡើងមុនពេលផ្ញើ។"}
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.audienceMode === "USER" && (
              <div>
                <label
                  htmlFor="notif-user-id"
                  className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
                >
                  {t("notifications.userIdLabel", "Recipient User ID")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="notif-user-id"
                  className={`text-input w-full ${
                    fieldErrors.recipientId ? "border-rose-500" : ""
                  }`}
                  type="number"
                  min="1"
                  disabled={busy}
                  value={form.recipientId}
                  onChange={(e) => setField("recipientId", e.target.value)}
                  placeholder={t("notifications.userIdPlaceholder", "e.g. 101")}
                />
                {fieldErrors.recipientId && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {fieldErrors.recipientId}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="notif-type"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                {t("notifications.typeLabel", "Type")}
              </label>
              <select
                id="notif-type"
                className="select w-full"
                value={form.type}
                disabled={busy}
                onChange={(e) => setField("type", e.target.value)}
              >
                <option value="SYSTEM_ALERT">{lang === "en" ? "System Alert" : "ការជូនដំណឹងប្រព័ន្ធ"}</option>
                <option value="ADMIN_NOTICE">{lang === "en" ? "Admin Notice" : "សេចក្តីជូនដំណឹង Admin"}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="notif-channel"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                {t("notifications.channelLabel", "Channel")}
              </label>
              <select
                id="notif-channel"
                className="select w-full"
                value={form.channel}
                disabled={busy}
                onChange={(e) => setField("channel", e.target.value)}
              >
                <option value="SYSTEM">{lang === "en" ? "System (In-App)" : "ប្រព័ន្ធក្នុងកម្មវិធី (System)"}</option>
                <option value="EMAIL">{lang === "en" ? "Email Delivery" : "ផ្ញើតាមអ៊ីមែល (Email)"}</option>
                <option value="TELEGRAM">{lang === "en" ? "Telegram Merchant Alert" : "Telegram Alert"}</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label
                htmlFor="notif-title"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                {t("notifications.titleLabel", "Title")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="notif-title"
                className={`text-input w-full ${
                  fieldErrors.title ? "border-rose-500" : ""
                }`}
                value={form.title}
                disabled={busy}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={t(
                  "notifications.titlePlaceholder",
                  "Notification title..."
                )}
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label
                htmlFor="notif-action-url"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                {t("notifications.actionUrlLabel", "Action URL")}{" "}
                <span className="text-slate-400 font-normal">
                  ({lang === "en" ? "Optional" : "ស្រេចចិត្ត"})
                </span>
              </label>
              <input
                id="notif-action-url"
                className="text-input w-full"
                value=""
                disabled
                aria-describedby="notif-action-url-help"
                readOnly
              />
              <p id="notif-action-url-help" className="text-xs text-slate-600 mt-1">
                {lang === "en"
                  ? "Action links are unavailable: the notification service does not support them."
                  : "តំណសកម្មភាពមិនទាន់អាចប្រើបាន៖ សេវាជូនដំណឹងមិនគាំទ្រតំណនេះទេ។"}
              </p>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label
                htmlFor="notif-message"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                {t("notifications.messageLabel", "Message Content")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="notif-message"
                className={`text-input w-full ${
                  fieldErrors.message ? "border-rose-500" : ""
                }`}
                rows="3"
                value={form.message}
                disabled={busy}
                onChange={(e) => setField("message", e.target.value)}
                placeholder={t(
                  "notifications.messagePlaceholder",
                  "Write notification message here..."
                )}
              />
              {fieldErrors.message && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {fieldErrors.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {t(
                  "notifications.paymentNotice",
                  "Payment confirmations are automated financial records and cannot be manually drafted."
                )}
              </span>
            </div>
            <button
              type="submit"
              className="btn btn-primary inline-flex items-center gap-1.5"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="animate-spin text-xs">⟳</span>
                  {t("notifications.sending", "Sending...")}
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  {t("notifications.sendBtn", "Send Notification")}
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Broadcast Confirmation Modal */}
      {showBroadcastModal && (
        <AdminDialog
          label={t("notifications.broadcastConfirmTitle", "Confirm Broadcast Announcement")}
          onClose={() => setShowBroadcastModal(false)}
          className="w-full max-w-md p-0 rounded-2xl bg-transparent border-none"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4
                  id="broadcast-modal-title"
                  className="text-base font-bold text-slate-900 dark:text-zinc-100"
                >
                  {t(
                    "notifications.broadcastConfirmTitle",
                    "Confirm Broadcast Announcement"
                  )}
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  {lang === "en" ? "System-wide publishing" : "ការផ្សាយទូទាំងប្រព័ន្ធ"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-semibold">
                {t(
                  "notifications.broadcastConfirmWarning",
                  "You are about to broadcast this notification to all active users on the platform. This action cannot be undone once confirmed."
                )}
              </div>
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] space-y-0.5">
                <div>
                  <strong>{lang === "en" ? "Title:" : "ចំណងជើង:"}</strong>{" "}
                  {form.title}
                </div>
                <div>
                  <strong>{lang === "en" ? "Type:" : "ប្រភេទ:"}</strong>{" "}
                  {form.type} · <strong>{lang === "en" ? "Channel:" : "ប៉ុស្តិ៍:"}</strong>{" "}
                  {form.channel}
                </div>
                <div>
                  <strong>{lang === "en" ? "Audience:" : "ទស្សនិកជន:"}</strong>{" "}
                  {lang === "en"
                    ? "All Active Platform Users"
                    : "អ្នកប្រើប្រាស់សកម្មទាំងអស់"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                className="btn btn-ghost text-xs"
                disabled={busy}
                onClick={() => setShowBroadcastModal(false)}
              >
                {t("notifications.cancelBtn", "Cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                disabled={busy}
                onClick={executeDispatch}
              >
                {busy ? (
                  <>
                    <span className="animate-spin text-xs">⟳</span>
                    {t("notifications.sending", "Sending...")}
                  </>
                ) : (
                  t(
                    "notifications.broadcastConfirmBtn",
                    "Confirm & Broadcast"
                  )
                )}
              </button>
            </div>
          </div>
        </AdminDialog>
      )}

      {/* History & Status Table Section */}
      <section className="card p-5 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="text-input pl-8 py-1.5 text-xs w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(
                  "notifications.searchPlaceholder",
                  "Search notifications..."
                )}
              />
            </div>

            {/* Channel filter */}
            <select
              className="select py-1.5 text-xs"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              aria-label={t("notifications.channelLabel", "Channel")}
            >
              <option value="ALL">
                {t("notifications.channelAll", "All Channels")}
              </option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="EMAIL">EMAIL</option>
              <option value="TELEGRAM">TELEGRAM</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs border border-slate-200 dark:border-zinc-800 p-1 rounded-xl bg-slate-50 dark:bg-zinc-800/40">
            {["ALL", "PENDING", "SENT", "DELIVERED", "FAILED", "READ"].map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === st
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {st === "ALL"
                    ? t("notifications.filterAll", "All Statuses")
                    : st}
                </button>
              )
            )}
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : error && !data ? (
          <ErrorState onRetry={reload} />
        ) : notifications.length === 0 ? (
          <Empty
            label={
              lang === "en" ? "No notifications found" : "មិនមានការជូនដំណឹងទេ"
            }
          />
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-label="Notification History Table"
            className="table-wrap overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/80"
          >
            <table className="data w-full text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="w-16">
                    {t("users.colId", "ID")}
                  </th>
                  <th scope="col">{t("notifications.colType", "Type")}</th>
                  <th scope="col">{t("notifications.colChannel", "Channel")}</th>
                  <th scope="col">{t("notifications.colTitle", "Title")}</th>
                  <th scope="col">
                    {t("notifications.colRecipient", "Recipient")}
                  </th>
                  <th scope="col">{t("notifications.colStatus", "Status")}</th>
                  <th scope="col">{t("notifications.colSentAt", "Created")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {notifications.map((item) => {
                  const isDelivered =
                    item.status === "DELIVERED" || item.status === "READ";
                  const isSent = item.status === "SENT";
                  const isPending = item.status === "PENDING";
                  const isFailed =
                    item.status === "FAILED" || item.status === "CANCELLED";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="font-mono text-slate-600 font-semibold">
                        #{item.id}
                      </td>
                      <td>
                        <span className="badge badge-gray font-mono text-[10px]">
                          {item.type}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">
                          {item.channel}
                        </span>
                      </td>
                      <td>
                        <strong className="text-slate-900 dark:text-zinc-100">
                          {item.title}
                        </strong>
                        <div className="text-slate-600 dark:text-zinc-400 line-clamp-1 max-w-sm mt-0.5">
                          {item.message}
                        </div>
                        {item.actionUrl && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                              <ExternalLink className="h-3 w-3" />
                              {item.actionUrl}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        {item.recipientEmail ? (
                          <span className="text-slate-700 dark:text-zinc-300">
                            {item.recipientEmail}
                          </span>
                        ) : item.recipientId ? (
                          <span className="font-mono text-slate-600 dark:text-zinc-400">
                            User #{item.recipientId}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md text-[10px]">
                            <Users className="h-3 w-3" />
                            {lang === "en" ? "System Broadcast" : "ការផ្សាយទូទៅ"}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          <span
                            className={`badge inline-flex items-center gap-1 ${
                              isDelivered
                                ? "badge-green"
                                : isSent
                                ? "badge-sky bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                                : isPending
                                ? "badge-amber"
                                : "badge-rose bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {isDelivered && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {isSent && <Clock className="h-3 w-3" />}
                            {isPending && <Clock className="h-3 w-3" />}
                            {isFailed && <XCircle className="h-3 w-3" />}
                            {item.status}
                          </span>
                          {item.errorMessage && (
                            <div className="text-[10px] text-rose-500 font-mono">
                              {item.errorMessage}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
