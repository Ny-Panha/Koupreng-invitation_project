import { PageSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useNotifications } from "./hooks/useNotifications";
import { NotificationList } from "./components/NotificationList";
import { NotificationStatsGrid } from "./components/NotificationStatsGrid";
import { ErrorState, LoadingButton } from "@/shared/ui";
import "./NotificationPages.css";

export default function NotificationsPage() {
  const uiCopy = useUiCopy();
  const {
    notifications,
    summary,
    loading,
    error,
    busyId,
    loadData,
    markRead,
    markAllRead,
  } = useNotifications();

  return (
    <main className="dash-main notif-page">
      <header className="dash-page-header notif-header">
        <div>
          <span className="dash-kicker">{uiCopy("ការជូនដំណឹង", "Notifications")}</span>
          <h1>{uiCopy("ការជូនដំណឹង", "Notifications")}</h1>
        </div>
        <LoadingButton
          type="button"
          className="dash-btn dash-btn-primary"
          disabled={!summary?.unread}
          isLoading={busyId === "all"}
          onClick={markAllRead}
        >
          {uiCopy("សម្គាល់ទាំងអស់ថាបានអាន", "Mark all read")}
        </LoadingButton>
      </header>

      {loading && summary && <LoadingRegion />}
      {summary && <NotificationStatsGrid summary={summary} />}

      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : loading && !summary ? (
        <PageSkeleton layout="list" />
      ) : (
        <NotificationList notifications={notifications} onRead={markRead} busyId={busyId} />
      )}
    </main>
  );
}
