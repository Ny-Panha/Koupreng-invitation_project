import { useUiCopy } from "@/shared/i18n/useUiCopy";
export function NotificationStatsGrid({ summary }) {
  const uiCopy = useUiCopy();
  return (
    <section className="notif-summary-grid">
      <Stat label={uiCopy("មិនទាន់អាន", "Unread")} value={summary?.unread || 0} />
      <Stat label={uiCopy("បានផ្ញើ", "Sent")} value={summary?.sent || 0} />
      <Stat label={uiCopy("បានបញ្ជូនដល់", "Delivered")} value={summary?.delivered || 0} />
      <Stat label={uiCopy("បរាជ័យ", "Failed")} value={summary?.failed || 0} />
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <article className="notif-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default NotificationStatsGrid;
