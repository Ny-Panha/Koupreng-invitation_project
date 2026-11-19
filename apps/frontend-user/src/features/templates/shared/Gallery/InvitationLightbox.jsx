import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import './invitation-lightbox.css';

// Original presentation over the project's tested stacked-modal focus contract.
export default function InvitationLightbox({ images, index, onIndexChange, onClose }) {
  const items = (images || []).filter(Boolean);
  const activeIndex = Math.min(Math.max(index ?? 0, 0), items.length - 1);
  const active = items[activeIndex];
  const src = item => typeof item === 'string' ? item : item.src || item.url;
  const move = step => onIndexChange((activeIndex + step + items.length) % items.length);
  return <Modal isOpen={index !== null && Boolean(active)} onClose={onClose} ariaLabel="មើលរូបថតធំ / Photo gallery" showHeader={false} size="xl" className="invitation-lightbox" backdropClassName="invitation-lightbox-backdrop">
    <div className="invitation-lightbox-content" onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || items.length < 2) return;
      event.preventDefault(); event.stopPropagation(); move(event.key === 'ArrowLeft' ? -1 : 1);
    }}>
      <button type="button" className="invitation-lightbox-close" onClick={onClose} aria-label="បិទ / Close lightbox"><X aria-hidden="true" /></button>
      {active && <img src={src(active)} alt={active.alt || `រូបថត / Photo ${activeIndex + 1}`} />}
      {items.length > 1 && <div className="invitation-lightbox-controls">
        <button type="button" onClick={() => move(-1)} aria-label="រូបមុន / Previous photo"><ChevronLeft aria-hidden="true" /></button>
        <span aria-live="polite">{activeIndex + 1} / {items.length}</span>
        <button type="button" onClick={() => move(1)} aria-label="រូបបន្ទាប់ / Next photo"><ChevronRight aria-hidden="true" /></button>
      </div>}
    </div>
  </Modal>;
}
