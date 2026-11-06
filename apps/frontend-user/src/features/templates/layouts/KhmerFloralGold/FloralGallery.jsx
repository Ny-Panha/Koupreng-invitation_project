import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { FloralPhoto } from './FloralArtwork';

export default function FloralGallery({ photos, english, layout = 'carousel', motion = 'elegant', onExpandedChange }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const expand = value => { setExpanded(value); onExpandedChange?.(value); };
  const pointer = useRef(null);
  const swiped = useRef(false);
  useEffect(() => () => onExpandedChange?.(false), [onExpandedChange]);
  if (!photos.length) return <p className="kfg-muted">{english ? 'Photographs will be shared here.' : 'រូបអនុស្សាវរីយ៍នឹងត្រូវបានចែករំលែកនៅទីនេះ។'}</p>;
  const index = Math.min(active, photos.length - 1), current = photos[index];
  const move = step => setActive((index + step + photos.length) % photos.length);
  const previous = english ? 'Previous photograph' : 'រូបមុន';
  const next = english ? 'Next photograph' : 'រូបបន្ទាប់';
  const startSwipe = event => { swiped.current = false; pointer.current = { x: event.clientX, y: event.clientY }; };
  const finishSwipe = event => {
    const start = pointer.current; pointer.current = null;
    if (start && Math.abs(event.clientX - start.x) > 40 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y)) {
      swiped.current = true; move(event.clientX < start.x ? 1 : -1);
    }
  };
  const keys = event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  };
  return <>
    {layout !== 'carousel' ? <div className={`kfg-gallery-${layout}`}>{photos.map((photo, i) => <button type="button" key={photo.id} onClick={event => { event.currentTarget.focus({ preventScroll: true }); setActive(i); expand(true); }} aria-label={`${english ? 'Open photograph' : 'មើលរូបថត'} ${i + 1}`}><FloralPhoto src={photo.src} alt={photo.alt} /></button>)}</div> : <div className="kfg-carousel" role="region" aria-roledescription="carousel" aria-label={english ? 'Wedding photographs' : 'រូបអនុស្សាវរីយ៍'} tabIndex={0} onKeyDown={keys}
      onPointerDown={startSwipe} onPointerCancel={() => { pointer.current = null; }} onPointerUp={finishSwipe}>
      <div className="kfg-carousel-track">
        <div className="kfg-neighbor" aria-hidden="true"><FloralPhoto src={photos[(index - 1 + photos.length) % photos.length].src} alt="" /></div>
        <button type="button" className="kfg-slide" onClick={event => { if (!swiped.current) { event.currentTarget.focus({ preventScroll: true }); expand(true); } swiped.current = false; }} aria-label={`${english ? 'Open photograph' : 'បើករូបភាព'} ${index + 1}`}><FloralPhoto key={current.src} src={current.src} alt={current.alt} /><span className="kfg-expand"><Maximize2 size={18} aria-hidden="true" /></span></button>
        <div className="kfg-neighbor" aria-hidden="true"><FloralPhoto src={photos[(index + 1) % photos.length].src} alt="" /></div>
      </div>
      <div className="kfg-carousel-controls"><button type="button" onClick={() => move(-1)} disabled={photos.length === 1} aria-label={previous}><ChevronLeft aria-hidden="true" /></button><span aria-live="polite" aria-atomic="true">{index + 1} / {photos.length}</span><button type="button" onClick={() => move(1)} disabled={photos.length === 1} aria-label={next}><ChevronRight aria-hidden="true" /></button></div>
      {current.caption && <p className="kfg-photo-caption">{current.caption}</p>}
    </div>}
    <Modal isOpen={expanded} onClose={() => expand(false)} showHeader={false} size="full" className="kfg-lightbox" backdropClassName="kfg-lightbox-backdrop" ariaLabel={english ? 'Wedding photo viewer' : 'មើលរូបអនុស្សាវរីយ៍'}>
      <div className="kfg-lightbox-content" data-motion={motion} onKeyDown={keys}>
        <header><span aria-live="polite">{index + 1} / {photos.length}</span><button type="button" onClick={() => expand(false)} aria-label={english ? 'Close gallery' : 'បិទរូបភាព'}><X aria-hidden="true" /></button></header>
        <div className="kfg-lightbox-stage" tabIndex={-1} onPointerDown={event => { if (!event.target.closest('button')) { event.currentTarget.focus({ preventScroll: true }); startSwipe(event); } }} onPointerUp={finishSwipe} onPointerCancel={() => { pointer.current = null; }}><button type="button" onClick={() => move(-1)} disabled={photos.length === 1} aria-label={previous}><ChevronLeft aria-hidden="true" /></button><FloralPhoto key={current.src} src={current.src} alt={current.alt} priority /><button type="button" onClick={() => move(1)} disabled={photos.length === 1} aria-label={next}><ChevronRight aria-hidden="true" /></button></div>
        <div className="kfg-thumbnails">{photos.map((photo, i) => <button key={photo.id} type="button" aria-label={`${english ? 'Show photograph' : 'មើលរូបភាព'} ${i + 1}`} aria-pressed={i === index} onClick={() => setActive(i)}><FloralPhoto src={photo.thumbnail || photo.src} alt="" /></button>)}</div>
      </div>
    </Modal>
  </>;
}
