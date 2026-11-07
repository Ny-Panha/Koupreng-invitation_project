import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, LoaderCircle, Expand } from 'lucide-react';
import { Modal } from '@/shared/ui';

function Photo({ photo, expanded, english }) {
  const [state, setState] = useState('loading');
  return <div className={expanded ? 'rg-lightbox-media' : 'rg-tile-media'} data-state={state} aria-busy={state === 'loading'}>
    {state === 'loading' && expanded && <span className="rg-photo-status" role="status"><LoaderCircle aria-hidden="true" />{english ? 'Loading photo…' : 'កំពុងបង្ហាញរូបភាព…'}</span>}
    {state === 'error' ? <span className="rg-photo-status" role="status"><ImageOff aria-hidden="true" />{english ? 'This photo could not be loaded.' : 'មិនអាចបង្ហាញរូបភាពនេះបានទេ។'}</span>
      : <img className={expanded ? 'rg-expanded-photo' : undefined} src={expanded ? photo.src : photo.thumbnail || photo.src} alt={photo.alt} width={photo.width || undefined} height={photo.height || undefined} loading={expanded ? 'eager' : 'lazy'} decoding="async" onLoad={event => { setState('ready'); if (!expanded) event.currentTarget.closest('button')?.setAttribute('data-landscape', String(photo.fullWidth || event.currentTarget.naturalWidth / event.currentTarget.naturalHeight > 1.25)); }} onError={() => setState('error')} />}
  </div>;
}

export default function RoyalGallery({ photos, english, presentation = 'carousel' }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touch = useRef(null);
  const active = Math.min(index, Math.max(0, photos.length - 1));
  const move = useCallback(delta => setIndex(current => photos.length ? (Math.min(current, photos.length - 1) + delta + photos.length) % photos.length : 0), [photos.length]);
  useEffect(() => {
    if (!expanded) return;
    const keydown = event => {
      if (!document.activeElement?.closest('.rg-gallery-dialog') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [expanded, move]);
  const swipe = {
    onTouchStart: event => { touch.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; },
    onTouchMove: event => { if (event.touches.length > 1) touch.current = null; },
    onTouchCancel: () => { touch.current = null; },
    onTouchEnd: event => {
      if (!touch.current || !event.changedTouches.length) return;
      const dx = touch.current.x - event.changedTouches[0].clientX, dy = touch.current.y - event.changedTouches[0].clientY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) move(dx > 0 ? 1 : -1);
      touch.current = null;
    },
  };
  const label = english ? 'Enlarge photo' : 'ពង្រីករូបភាព';
  if (!photos.length) return <p className="rg-muted">{english ? 'Your wedding memories will appear here.' : 'រូបភាពអនុស្សាវរីយ៍របស់អ្នកនឹងបង្ហាញនៅទីនេះ។'}</p>;
  return <div className="rg-photo-collection" role="region" aria-label={english ? 'Wedding photos' : 'រូបភាពមង្គលការ'}>
    {presentation === 'collage' ? <><div className="rg-gallery-note"><span>{english ? `${photos.length} photographs` : `រូបថតអនុស្សាវរីយ៍ ${photos.length}`}</span><span><Expand size={14} aria-hidden="true" />{english ? 'Tap to explore' : 'ចុចមើលរូបធំ'}</span></div><div className="rg-photo-collage">{photos.map((photo, i) => <button key={photo.id || `${photo.src}-${i}`} className="rg-photo-tile" type="button" data-landscape={photo.fullWidth || photo.width / photo.height > 1.25} data-featured={photo.fullWidth || i%5 === 2 || i === photos.length-1} onClick={() => { setIndex(i); setExpanded(true); }} aria-label={`${label} ${i + 1} / ${photos.length}`}><Photo key={photo.src} photo={photo} english={english} /><span className="rg-photo-zoom" aria-hidden="true"><Expand size={14} /></span></button>)}</div></>
      : <div className="rg-carousel" aria-roledescription="carousel" tabIndex={0} onKeyDown={event => { if (!expanded && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }} {...swipe}>
        <div className="rg-gallery">
          {photos.length > 1 && <img className="rg-side-photo rg-side-photo--left" src={photos[(active + photos.length - 1) % photos.length].thumbnail || photos[(active + photos.length - 1) % photos.length].src} alt="" loading="lazy" aria-hidden="true" />}
          <button type="button" className="rg-current-photo" onClick={() => setExpanded(true)} aria-label={label}><Photo key={photos[active].src} photo={photos[active]} english={english} /></button>
          {photos.length > 1 && <><img className="rg-side-photo rg-side-photo--right" src={photos[(active + 1) % photos.length].thumbnail || photos[(active + 1) % photos.length].src} alt="" loading="lazy" aria-hidden="true" /><button className="rg-gallery-prev" type="button" onClick={() => move(-1)} aria-label={english ? 'Previous photo' : 'រូបភាពមុន'}><ChevronLeft /></button><button className="rg-gallery-next" type="button" onClick={() => move(1)} aria-label={english ? 'Next photo' : 'រូបភាពបន្ទាប់'}><ChevronRight /></button></>}
        </div><p className="rg-photo-counter" aria-live="polite">{active + 1} / {photos.length}</p>
      </div>}
    <Modal isOpen={expanded} onClose={() => setExpanded(false)} title={english ? 'Photo gallery' : 'វិចិត្រសាលរូបភាព'} closeLabel={english ? 'Close photo' : 'បិទរូបភាព'} size="full" className="rg-gallery-dialog" backdropClassName="rg-lightbox-backdrop">
      <div className="rg-lightbox" {...swipe}>
        <Photo key={photos[active].src} photo={photos[active]} expanded english={english} />
        <div className="rg-expanded-actions">{photos.length > 1 && <button type="button" onClick={() => move(-1)} aria-label={english ? 'Previous photo' : 'រូបភាពមុន'}><ChevronLeft /></button>}<span aria-live="polite" aria-atomic="true">{active + 1} / {photos.length}</span>{photos.length > 1 && <button type="button" onClick={() => move(1)} aria-label={english ? 'Next photo' : 'រូបភាពបន្ទាប់'}><ChevronRight /></button>}</div>
        {photos.length>1 && <div className="rg-lightbox-strip" role="group" aria-label={english ? 'Choose a photo' : 'ជ្រើសរើសរូបថត'}>{photos.map((photo,i)=><button type="button" key={photo.id || `${photo.src}-${i}`} aria-label={english ? `View photo ${i+1}` : `មើលរូបទី ${i+1}`} aria-current={i===active ? 'true' : undefined} onClick={()=>setIndex(i)}><img src={photo.thumbnail || photo.src} alt="" loading="lazy" width="48" height="48"/></button>)}</div>}
      </div>
    </Modal>
  </div>;
}
