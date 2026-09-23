import { useMemo, useState } from "react";
import { Loading, ErrorState, Empty, Toast } from "../../shared/ui";
import { useResource, useToast } from "../../shared/hooks";
import { formatDateTime } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

const EMPTY_FORM = {
  recipientId: "",
  type: "SYSTEM_ALERT",
  channel: "IN_APP",
  title: "",
  message: "",
  actionUrl: "",
};

export default function AdminNotificationsPage() {
  const { lang, t } = useAdminLanguage();
  const { data, setData, loading, error, reload } = useResource(adminManagementService.notifications);
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast, show, clear } = useToast();

  const notifications = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((item) => {
      if (!q) return true;
      return [item.title, item.message, item.recipientEmail, item.type, item.status]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [data, query]);

  const setField = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  const sendNotification = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        recipientId: form.recipientId ? Number(form.recipientId) : null,
      };
      const created = await adminManagementService.createNotification(payload);
      setData((prev) => [created, ...(prev || [])]);
      setForm(EMPTY_FORM);
      show(t("notifications.toastSuccess", "Notification created and sent successfully"));
    } catch (err) {
      show(err?.message || t("notifications.toastFail", "Could not send notification"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">{t("notifications.title", "Notifications")}</h2>
          <p className="page-subtitle">{t("notifications.subtitle", "Send system notifications to users and view system notification delivery statuses.")}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={reload}>
          {t("common.refresh", "Refresh")}
        </button>
      </div>

      <section className="card" style={{ marginBottom: 18 }}>
        <h3 className="page-title" style={{ fontSize: 16, marginBottom: 12 }}>
          {t("notifications.createTitle", "Create System Notification")}
        </h3>
        <form onSubmit={sendNotification}>
          <div className="admin-form-grid">
            <label>
              {t("notifications.userIdLabel", "User ID (Leave empty for broadcast)")}
              <input
                className="text-input"
                type="number"
                value={form.recipientId}
                onChange={(e) => setField("recipientId", e.target.value)}
                placeholder={t("notifications.userIdPlaceholder", "e.g. 101 or empty for all")}
              />
            </label>
            <label>
              {t("notifications.typeLabel", "Type")}
              <select className="select" value={form.type} onChange={(e) => setField("type", e.target.value)}>
                <option value="SYSTEM_ALERT">SYSTEM_ALERT</option>
                <option value="PAYMENT_CONFIRMATION">PAYMENT_CONFIRMATION</option>
                <option value="RSVP_UPDATE">RSVP_UPDATE</option>
                <option value="PACKAGE_EXPIRING">PACKAGE_EXPIRING</option>
                <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
              </select>
            </label>
            <label>
              {t("notifications.channelLabel", "Channel")}
              <select className="select" value={form.channel} onChange={(e) => setField("channel", e.target.value)}>
                <option value="IN_APP">IN_APP</option>
                <option value="EMAIL">EMAIL</option>
                <option value="TELEGRAM">TELEGRAM</option>
              </select>
            </label>
            <label>
              {t("notifications.titleLabel", "Title")}
              <input
                className="text-input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                required
                placeholder={t("notifications.titlePlaceholder", "Notification Title")}
              />
            </label>
            <label>
              {t("notifications.actionUrlLabel", "Action URL (Optional)")}
              <input
                className="text-input"
                value={form.actionUrl}
                onChange={(e) => setField("actionUrl", e.target.value)}
                placeholder={t("notifications.actionUrlPlaceholder", "https://koupreng.app/...")}
              />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              {t("notifications.messageLabel", "Message")}
              <textarea
                className="text-input"
                rows="3"
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                required
                placeholder={t("notifications.messagePlaceholder", "Message body...")}
              />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t("notifications.sending", "Sending...") : t("notifications.sendBtn", "Send Notification")}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <input
            className="text-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("notifications.searchPlaceholder", "Search notifications...")}
          />
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : notifications.length === 0 ? (
          <Empty label={lang === "en" ? "No notifications" : "មិនមានការជូនដំណឹងទេ"} />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t("users.colId", "ID")}</th>
                  <th>{t("notifications.colType", "Type")}</th>
                  <th>{t("notifications.colChannel", "Channel")}</th>
                  <th>{t("notifications.colTitle", "Title")}</th>
                  <th>{t("notifications.colRecipient", "Recipient")}</th>
                  <th>{t("notifications.colStatus", "Status")}</th>
                  <th>{t("notifications.colSentAt", "Created")}</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td><span className="badge badge-gray">{item.type}</span></td>
                    <td>{item.channel}</td>
                    <td><strong>{item.title}</strong><br /><small>{item.message}</small></td>
                    <td>{item.recipientEmail || item.recipientId || (lang === "en" ? "All Users" : "អ្នកប្រើទាំងអស់")}</td>
                    <td>
                      <span className={`badge ${item.status === "DELIVERED" || item.status === "READ" ? "badge-green" : "badge-amber"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDateTime(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
