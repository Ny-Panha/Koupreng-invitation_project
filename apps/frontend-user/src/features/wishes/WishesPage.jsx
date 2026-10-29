import { PageSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { useEventWorkspace } from "@/features/events/workspace/EventContext";
import { eventPath } from "@/features/events/workspace/eventRoutes";
import Modal from "@/shared/ui/Modal";
import { useWishes } from "./hooks/useWishes";
import { WishList } from "./components/WishList";
import { ErrorState } from "@/shared/ui";
import "./WishesPage.css";

export default function WishesPage({ invitationId: propInvitationId }) {
  const params = useParams();
  const en = useLanguageStore(state => state.lang) === "en";
  const workspace = useEventWorkspace();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const invitationId = propInvitationId || params.eventId || params.invitationId || params.id;
  const { wishes, loading, error, deletingId, loadWishes, deleteWish } = useWishes(invitationId);

  return (
    <main className="dash-main wishes-page workspace-page">
      <header className="dash-page-header wishes-header">
        <div>
          <span className="dash-kicker">{en ? "Guest messages" : "សារពីភ្ញៀវ"}</span>
          {loading && wishes.length > 0 && <LoadingRegion />}
          <h1>{en ? "Wishes from your guests" : "ពាក្យជូនពរពីភ្ញៀវ"}</h1>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={loadWishes} />
      ) : loading && !wishes.length ? (
        <PageSkeleton layout="list" />
      ) : (
        <>
          <WishList wishes={wishes} onDelete={setDeleteTarget} deletingId={deletingId} />
          {wishes.length === 0 && workspace && <div className="wishes-next-action"><Link className="workspace-button primary" to={eventPath(invitationId, workspace.event.status === "PUBLISHED" ? "delivery" : "invitation")}>{en ? (workspace.event.status === "PUBLISHED" ? "Share your invitation" : "Review your invitation") : (workspace.event.status === "PUBLISHED" ? "ចែករំលែកធៀបរបស់អ្នក" : "ពិនិត្យធៀបរបស់អ្នក")}</Link></div>}
        </>
      )}
      <Modal isOpen={deleteTarget !== null} onClose={() => { if (!deletingId) setDeleteTarget(null); }} title={en ? "Delete this wish?" : "លុបសារជូនពរនេះឬ?"}>
        <p>{en ? "This message will be permanently removed." : "សារនេះនឹងត្រូវលុបជាអចិន្ត្រៃយ៍។"}</p>
        <div className="wishes-dialog-actions"><button className="workspace-button" disabled={Boolean(deletingId)} onClick={() => setDeleteTarget(null)}>{en ? "Cancel" : "បោះបង់"}</button><button className="workspace-button" disabled={Boolean(deletingId)} onClick={async () => { await deleteWish(deleteTarget); setDeleteTarget(null); }}>{deletingId ? (en ? "Deleting…" : "កំពុងលុប…") : (en ? "Delete wish" : "លុបសារ")}</button></div>
      </Modal>
    </main>
  );
}
