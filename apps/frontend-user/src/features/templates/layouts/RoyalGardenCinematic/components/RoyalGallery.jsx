import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/shared/ui';

export default function RoyalGallery({ photos, english }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [touch, setTouch] = useState(null);
  if (!photos.length) return <p className="rg-muted">{english ? 'Your wedding memories will appear here.' : 'រូបភាពអនុស្សាវរីយ៍របស់អ្នកនឹងបង្ហាញនៅទីនេះ។'}</p>;
  const active = Math.min(index, photos.length - 1);
  const move = delta => setIndex((active + delta + photos.length) % photos.length);
  const keydown = event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } };
  return <div className="rg-carousel" role="region" aria-label={english ? 'Wedding photos' : 'រូបភាពមង្គលការ'} aria-roledescription="carousel" tabIndex={0} onKeyDown={keydown}
    onTouchStart={event => setTouch(event.touches[0].clientX)} onTouchEnd={event => { if (touch !== null && Math.abs(touch - event.changedTouches[0].clientX) > 40) move(touch > event.changedTouches[0].clientX ? 1 : -1); setTouch(null); }}>
    <div className="rg-gallery">
      {photos.length > 1 && <img className="rg-side-photo rg-side-photo--left" src={photos[(active + photos.length - 1) % photos.length].src} alt="" loading="lazy" aria-hidden="true" />}
      <button type="button" className="rg-current-photo" onClick={() => setExpanded(true)} aria-label={english ? 'Enlarge photo' : 'ពង្រីករូបភាព'}><img src={photos[active].src} alt={photos[active].alt} loading="lazy" decoding="async" /></button>
      {photos.length > 1 && <img className="rg-side-photo rg-side-photo--right" src={photos[(active + 1) % photos.length].src} alt="" loading="lazy" aria-hidden="true" />}
      {photos.length > 1 && <><button className="rg-gallery-prev" type="button" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft /></button><button className="rg-gallery-next" type="button" onClick={() => move(1)} aria-label="Next photo"><ChevronRight /></button></>}
    </div>
    <p className="rg-photo-counter" aria-live="polite">{active + 1} / {photos.length}</p>
    <Modal isOpen={expanded} onClose={() => setExpanded(false)} title={english ? 'Photo gallery' : 'វិចិត្រសាលរូបភាព'} closeLabel="Close photo" size="full" className="rg-gallery-dialog">
      <img className="rg-expanded-photo" src={photos[active].src} alt={photos[active].alt} />
      {photos.length > 1 && <div className="rg-expanded-actions"><button type="button" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft /></button><span>{active + 1} / {photos.length}</span><button type="button" onClick={() => move(1)} aria-label="Next photo"><ChevronRight /></button></div>}
    </Modal>
  </div>;
}
