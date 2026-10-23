import { useUiCopy } from "@/shared/i18n/useUiCopy";
const STATUS_CLASS = {
  PENDING: "notif-badge is-pending",
  SENT: "notif-badge is-sent",
  DELIVERED: "notif-badge is-delivered",
  FAILED: "notif-badge is-failed",
  READ: "notif-badge is-read",
  CANCELLED: "notif-badge is-cancelled",
};

const KHMER_METADATA = {
  PENDING: "រង់ចាំ", SENT: "បានផ្ញើ", DELIVERED: "បានបញ្ជូនដល់", FAILED: "បរាជ័យ", READ: "បានអាន", CANCELLED: "បានបោះបង់",
  INVITATION_SENT: "បានផ្ញើធៀបអញ្ជើញ", RSVP_CONFIRMATION: "ការបញ្ជាក់ការឆ្លើយតប", RSVP_RECEIVED: "បានទទួលការឆ្លើយតប",
  REMINDER: "ការរំលឹក", PAYMENT_CONFIRMED: "បានបញ្ជាក់ការទូទាត់", TEMPLATE_UNLOCKED: "បានផ្ដល់សិទ្ធិប្រើគំរូ",
  SYSTEM_ALERT: "ការជូនដំណឹងប្រព័ន្ធ", ADMIN_NOTICE: "សារពីអ្នកគ្រប់គ្រង",
  EMAIL: "អ៊ីមែល", TELEGRAM: "Telegram", SYSTEM: "ប្រព័ន្ធ", LINK: "តំណ", SMS: "សារទូរស័ព្ទ",
};

function formatDate(value, lang) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(lang, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationItem({ notification, onRead, busy }) {
  const uiCopy = useUiCopy();
  const metadata = value => uiCopy(KHMER_METADATA[value] || "ការជូនដំណឹង", value);
  const unread = !notification.readAt;

  return (
    <article className={`notif-item${unread ? " is-unread" : ""}`}>
      <div className="notif-item-main">
        <div className="notif-item-head">
          <strong>{notification.title || (notification.type ? metadata(notification.type) : uiCopy("ការជូនដំណឹង", "Notification"))}</strong>
          <span className={STATUS_CLASS[notification.status] || "notif-badge"}>
            {metadata(notification.status || "PENDING")}
          </span>
        </div>
        <p>{notification.message || uiCopy("មិនមានសារទេ។", "No message provided.")}</p>
        <div className="notif-meta">
          <span>{metadata(notification.type || "SYSTEM_ALERT")}</span>
          <span>{metadata(notification.channel || "SYSTEM")}</span>
          <span>{formatDate(notification.createdAt, uiCopy("km", "en"))}</span>
        </div>
        {notification.errorMessage && <div className="notif-error">{notification.errorMessage}</div>}
      </div>
      {unread && (
        <button
          type="button"
          className="notif-action"
          disabled={busy}
          onClick={() => onRead(notification.id)}
        >
          {uiCopy("សម្គាល់ថាបានអាន", "Mark read")}
        </button>
      )}
    </article>
  );
}

export default NotificationItem;
