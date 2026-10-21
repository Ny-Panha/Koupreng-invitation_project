import { WishCard } from "./WishCard";
import { MessageCircleHeart } from "lucide-react";
import { useLanguageStore } from "@/stores/useLanguageStore";

export function WishList({ wishes, onDelete, deletingId }) {
  const en = useLanguageStore((s) => s.lang) === "en";

  if (!wishes?.length) {
    return (
      <div className="wishes-empty-state">
        <div className="wishes-empty-icon-wrap">
          <MessageCircleHeart size={36} className="wishes-empty-icon" aria-hidden="true" />
        </div>
        <h3 className="wishes-empty-title">
          {en ? "No Wishes Yet" : "មិនទាន់មានពាក្យជូនពរនៅឡើយទេ"}
        </h3>
        <p className="wishes-empty-desc">
          {en
            ? "When your invited guests send wedding wishes through your digital invitation, they will appear here."
            : "នៅពេលដែលភ្ញៀវកិត្តិយសផ្ញើសារជូនពរតាមរយៈធៀបអញ្ជើញឌីជីថលរបស់អ្នក សារទាំងនោះនឹងបង្ហាញនៅទីនេះ។"}
        </p>
      </div>
    );
  }

  return (
    <div className="wishes-grid">
      {wishes.map((wish) => (
        <WishCard
          key={wish.id}
          wish={wish}
          onDelete={onDelete}
          isDeleting={deletingId === wish.id}
        />
      ))}
    </div>
  );
}

export default WishList;
