import { PageSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { Link, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { useEventWorkspace } from "@/features/events/workspace/EventContext";
import { eventPath } from "@/features/events/workspace/eventRoutes";
import Modal from "@/shared/ui/Modal";
import { useWishes } from "./hooks/useWishes";
import { WishList } from "./components/WishList";
import { ErrorState, toast } from "@/shared/ui";
import { MessageSquareHeart, Search, X, AlertTriangle } from "lucide-react";
import "./WishesPage.css";

export default function WishesPage({ invitationId: propInvitationId }) {
  const params = useParams();
  const en = useLanguageStore((state) => state.lang) === "en";
  const workspace = useEventWorkspace();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const invitationId = propInvitationId || params.eventId || params.invitationId || params.id;
  const { wishes, loading, error, deletingId, loadWishes, deleteWish } = useWishes(invitationId);

  const filteredWishes = useMemo(() => {
    if (!search.trim()) return wishes;
    const term = search.trim().toLowerCase();
    return wishes.filter(
      (w) =>
        (w.guestName || "").toLowerCase().includes(term) ||
        (w.message || w.content || "").toLowerCase().includes(term)
    );
  }, [wishes, search]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError("");
    const result = await deleteWish(deleteTarget);
    if (result?.success) {
      setDeleteTarget(null);
      setDeleteError("");
      if (typeof toast.success === "function") {
        toast.success(en ? "Wish deleted successfully" : "បានលុបសារជូនពរដោយជោគជ័យ");
      } else if (typeof toast === "function") {
        toast(en ? "Wish deleted successfully" : "បានលុបសារជូនពរដោយជោគជ័យ");
      }
    } else {
      setDeleteError(
        result?.error ||
          (en ? "Failed to delete wish. Please retry." : "មិនអាចលុបសារបានទេ។ សូមព្យាយាមម្ដងទៀត។")
      );
    }
  };

  const handleCloseModal = () => {
    if (!deletingId) {
      setDeleteTarget(null);
      setDeleteError("");
    }
  };

  return (
    <main className="dash-main wishes-page workspace-page">
      <header className="dash-page-header wishes-header">
        <div>
          <span className="dash-kicker">
            <MessageSquareHeart size={14} className="inline mr-1" aria-hidden="true" />
            {en ? "Guest Messages" : "សារពីភ្ញៀវ"}
          </span>
          {loading && wishes.length > 0 && <LoadingRegion />}
          <div className="wishes-title-row">
            <h1>{en ? "Wishes from your guests" : "ពាក្យជូនពរពីភ្ញៀវ"}</h1>
            {wishes.length > 0 && (
              <span className="wishes-counter-badge">
                {wishes.length} {en ? "wishes" : "សារ"}
              </span>
            )}
          </div>
          <p className="wishes-subtitle">
            {en
              ? "Read congratulations and blessings sent by your friends and family."
              : "អានពាក្យជូនពរ និងមនោសញ្ចេតនាដ៏កក់ក្តៅពីមិត្តភក្តិ និងក្រុមគ្រួសាររបស់អ្នក។"}
          </p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={loadWishes} />
      ) : loading && !wishes.length ? (
        <PageSkeleton layout="list" />
      ) : (
        <>
          {wishes.length > 0 && (
            <div className="wishes-toolbar">
              <label className="wishes-search-bar">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={en ? "Search wishes by guest or message..." : "ស្វែងរកសារតាមឈ្មោះភ្ញៀវ ឬអត្ថបទ..."}
                  aria-label={en ? "Search wishes" : "ស្វែងរកសារជូនពរ"}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="wishes-clear-search"
                    aria-label={en ? "Clear search" : "សម្អាតការស្វែងរក"}
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              {search && (
                <span className="wishes-search-count">
                  {filteredWishes.length} / {wishes.length}
                </span>
              )}
            </div>
          )}

          <WishList
            wishes={filteredWishes}
            onDelete={(id) => {
              setDeleteError("");
              setDeleteTarget(id);
            }}
            deletingId={deletingId}
          />

          {wishes.length === 0 && workspace && (
            <div className="wishes-next-action">
              <Link
                className="workspace-button primary"
                to={eventPath(
                  invitationId,
                  workspace.event.status === "PUBLISHED" ? "delivery" : "invitation"
                )}
              >
                {en
                  ? workspace.event.status === "PUBLISHED"
                    ? "Share your invitation"
                    : "Review your invitation"
                  : workspace.event.status === "PUBLISHED"
                  ? "ចែករំលែកធៀបរបស់អ្នក"
                  : "ពិនិត្យធៀបរបស់អ្នក"}
              </Link>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={handleCloseModal}
        title={en ? "Delete this wish?" : "លុបសារជូនពរនេះឬ?"}
      >
        <div className="wishes-dialog-body">
          <p>{en ? "This message will be permanently removed." : "សារនេះនឹងត្រូវលុបជាអចិន្ត្រៃយ៍។"}</p>

          {deleteError && (
            <div className="wishes-delete-error" role="alert">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="wishes-dialog-actions">
            <button
              type="button"
              className="workspace-button"
              disabled={Boolean(deletingId)}
              onClick={handleCloseModal}
            >
              {en ? "Cancel" : "បោះបង់"}
            </button>
            <button
              type="button"
              className="workspace-button danger"
              disabled={Boolean(deletingId)}
              onClick={handleDeleteConfirm}
            >
              {deletingId
                ? en
                  ? "Deleting…"
                  : "កំពុងលុប…"
                : en
                ? "Delete wish"
                : "លុបសារ"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
