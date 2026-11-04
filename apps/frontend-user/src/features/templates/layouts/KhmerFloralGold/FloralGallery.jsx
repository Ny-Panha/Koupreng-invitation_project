import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { FloralPhoto } from './FloralArtwork';

export default function FloralGallery({ photos, english }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const pointer = useRef(null);
  const swiped = useRef(false);
  if (!photos.length) return <p className="kfg-muted">{english ? 'Photographs will be shared here.' : 'រូបអនុស្សាវរីយ៍នឹងត្រូវបានចែករំលែកនៅទីនេះ។'}</p>;
  const index = Math.min(active, photos.length - 1), current = photos[index];
  const move = step => setActive((index + step + photos.length) % photos.length);
  const previous = english ? 'Previous photograph' : 'រូបមុន';
  const next = english ? 'Next photograph' : 'រូបបន្ទាប់';
  const keys = event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  };
  return <>
    <div className="kfg-carousel" role="region" aria-roledescription="carousel" aria-label={english ? 'Wedding photographs' : 'រូបអនុស្សាវរីយ៍'} tabIndex={0} onKeyDown={keys}
      onPointerDown={event => { swiped.current = false; pointer.current = { x: event.clientX, y: event.clientY }; }} onPointerCancel={() => { pointer.current = null; }}
      onPointerUp={event => { const start = pointer.current; pointer.current = null; if (start && Math.abs(event.clientX - start.x) > 40 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y)) { swiped.current = true; move(event.clientX < start.x ? 1 : -1); } }}>
      <div className="kfg-carousel-track">
        <div className="kfg-neighbor" aria-hidden="true"><FloralPhoto src={photos[(index - 1 + photos.length) % photos.length].src} alt="" /></div>
        <button type="button" className="kfg-slide" onClick={() => { if (!swiped.current) setExpanded(true); swiped.current = false; }} aria-label={`${english ? 'Open photograph' : 'បើករូបភាព'} ${index + 1}`}><FloralPhoto key={current.src} src={current.src} alt={current.alt} /><span className="kfg-expand"><Maximize2 size={18} aria-hidden="true" /></span></button>
        <div className="kfg-neighbor" aria-hidden="true"><FloralPhoto src={photos[(index + 1) % photos.length].src} alt="" /></div>
      </div>
      <div className="kfg-carousel-controls"><button type="button" onClick={() => move(-1)} disabled={photos.length === 1} aria-label={previous}><ChevronLeft aria-hidden="true" /></button><span aria-live="polite" aria-atomic="true">{index + 1} / {photos.length}</span><button type="button" onClick={() => move(1)} disabled={photos.length === 1} aria-label={next}><ChevronRight aria-hidden="true" /></button></div>
      {current.caption && <p className="kfg-photo-caption">{current.caption}</p>}
    </div>
    <Modal isOpen={expanded} onClose={() => setExpanded(false)} showHeader={false} size="full" className="kfg-lightbox" backdropClassName="kfg-lightbox-backdrop" ariaLabel={english ? 'Wedding photo viewer' : 'មើលរូបអនុស្សាវរីយ៍'}>
      <div className="kfg-lightbox-content" onKeyDown={keys}>
        <header><span aria-live="polite">{index + 1} / {photos.length}</span><button type="button" onClick={() => setExpanded(false)} aria-label={english ? 'Close gallery' : 'បិទរូបភាព'}><X aria-hidden="true" /></button></header>
        <div className="kfg-lightbox-stage"><button type="button" onClick={() => move(-1)} disabled={photos.length === 1} aria-label={previous}><ChevronLeft aria-hidden="true" /></button><FloralPhoto key={current.src} src={current.src} alt={current.alt} priority /><button type="button" onClick={() => move(1)} disabled={photos.length === 1} aria-label={next}><ChevronRight aria-hidden="true" /></button></div>
        <div className="kfg-thumbnails">{photos.map((photo, i) => <button key={photo.id} type="button" aria-label={`${english ? 'Show photograph' : 'មើលរូបភាព'} ${i + 1}`} aria-pressed={i === index} onClick={() => setActive(i)}><FloralPhoto src={photo.src} alt="" /></button>)}</div>
      </div>
    </Modal>
  </>;
}
