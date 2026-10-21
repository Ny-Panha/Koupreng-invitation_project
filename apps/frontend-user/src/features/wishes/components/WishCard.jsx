import { Trash2 } from "lucide-react";
import { useLanguageStore } from "@/stores/useLanguageStore";

export function WishCard({ wish, onDelete, isDeleting }) {
  const en = useLanguageStore(state => state.lang) === "en";
  return (
    <div className="wish-card">
      <div className="wish-card-header">
        <div className="wish-author-info">
          <div className="wish-avatar">
            {wish.guestName?.charAt(0)?.toUpperCase() || "G"}
          </div>
          <div>
            <h4 className="wish-name">{wish.guestName || "ភ្ញៀវកិត្តិយស"}</h4>
            {wish.createdAt && (
              <span className="wish-date">
                {new Date(wish.createdAt).toLocaleDateString(en ? "en-US" : "km-KH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {onDelete && (
          <button
            type="button"
            className="wish-delete-btn"
            disabled={isDeleting}
            onClick={() => onDelete(wish.id)}
            title={en ? "Delete wish" : "លុបពាក្យជូនពរ"}
            aria-label={en ? "Delete wish" : "លុបពាក្យជូនពរ"}
          >
            <Trash2 size={14} className="inline mr-1" aria-hidden="true" />
            <span>{isDeleting ? "…" : en ? "Delete" : "លុប"}</span>
          </button>
        )}
      </div>

      <p className="wish-message">{wish.message || wish.content}</p>
    </div>
  );
}

export default WishCard;
