import { useEffect, useRef, useState } from 'react';
import { useCinematicPlayback } from '../../../shared/Openings/cinematicOpeningContext';
import { ROYAL_ASSETS } from '../model/royalGardenPresentation';
import RoyalGardenMonogram from './RoyalGardenMonogram';

export default function RoyalGardenVideoScene({ english, names, monogram, monogramSettings, presentation, date, dateTime, onReplay }) {
  const { active, stage, completed, poster } = useCinematicPlayback();
  const root = useRef(null);
  const [failedArtwork, setFailedArtwork] = useState('');
  useEffect(() => {
    if (!active) return;
    root.current?.focus({ preventScroll: true });
    root.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [active]);
  if (!active && !(completed && presentation.endBehavior === 'poster')) return null;
  return <section ref={root} tabIndex={-1} className="rg-video-section cinematic-inline-stage" data-complete={!active} data-footer={presentation.footer !== false} aria-label={english ? 'Pre-wedding video' : 'វីដេអូមុនអាពាហ៍ពិពាហ៍'}>
    <h2 className="rg-sr-only">{names}</h2>
    {active && <RoyalGardenMonogram settings={monogramSettings} initials={monogram} scene="video" />}
    {active && <div className="rg-video-lettering" data-date-font={presentation.dateFont}>
      {presentation.artworkEnabled && presentation.artwork && presentation.artwork !== failedArtwork && <div className="rg-video-artwork" style={{ '--rg-film-artwork': `url(${JSON.stringify(presentation.artwork)})` }}><img className="rg-video-calligraphy" src={presentation.artwork} srcSet={presentation.artwork === ROYAL_ASSETS.videoCalligraphy ? `${presentation.artwork} 480w, ${ROYAL_ASSETS.videoCalligraphyLarge} 960w` : undefined} sizes="(max-width: 639px) 82vw, 460px" alt="" width="3840" height="1313" onError={() => setFailedArtwork(presentation.artwork)} /></div>}
      {presentation.dateEnabled && date && <time className="rg-video-date" dateTime={dateTime}>{date}</time>}
    </div>}
    {active ? stage : <div className="rg-video-keepsake">{poster && <img src={poster} alt={english ? 'Our pre-wedding film' : 'វីដេអូមុនអាពាហ៍ពិពាហ៍'} loading="lazy" />}{presentation.replay && <button type="button" className="rg-button" onClick={onReplay}>{english ? 'Replay video' : 'ចាក់វីដេអូឡើងវិញ'}</button>}</div>}
  </section>;
}
