import { useParams } from "react-router-dom";
import { useWishes } from "./hooks/useWishes";
import { WishList } from "./components/WishList";
import { ErrorState, SkeletonCard } from "@/shared/ui";
import "./WishesPage.css";

export default function WishesPage({ invitationId: propInvitationId }) {
  const params = useParams();
  const invitationId = propInvitationId || params.eventId || params.invitationId || params.id;
  const { wishes, loading, error, deletingId, loadWishes, deleteWish } = useWishes(invitationId);

  return (
    <main className="dash-main wishes-page">
      <header className="dash-page-header wishes-header">
        <div>
          <span className="dash-kicker">Guest Messages</span>
          <h1>ពាក្យជូនពរពីភ្ញៀវ</h1>
          <p>អាន និងគ្រប់គ្រងសារជូនពរដ៏មានអត្ថន័យពីភ្ញៀវកិត្តិយសទាំងអស់។</p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={loadWishes} />
      ) : loading ? (
        <div className="wishes-skeleton-grid">
          <SkeletonCard height="140px" />
          <SkeletonCard height="140px" />
          <SkeletonCard height="140px" />
        </div>
      ) : (
        <WishList wishes={wishes} onDelete={deleteWish} deletingId={deletingId} />
      )}
    </main>
  );
}
