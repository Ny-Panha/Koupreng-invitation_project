import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "@/shared/ui";

export function NotificationList({ notifications = [], onRead, busyId }) {
  const uiCopy = useUiCopy();
  if (!notifications.length) {
    return (
      <EmptyState
        title={uiCopy("មិនមានការជូនដំណឹង", "No notifications")}
        description={uiCopy("អ្នកបានមើលការឆ្លើយតបភ្ញៀវ ការផ្ញើ និងសកម្មភាពមង្គលការទាំងអស់រួចហើយ។", "You are fully caught up with guest RSVPs, deliveries, and wedding activities.")}
      />
    );
  }

  return (
    <section className="notif-list" aria-label={uiCopy("បញ្ជីការជូនដំណឹង", "Notifications list")}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          busy={busyId === notification.id || busyId === "all"}
          onRead={onRead}
        />
      ))}
    </section>
  );
}

export default NotificationList;
