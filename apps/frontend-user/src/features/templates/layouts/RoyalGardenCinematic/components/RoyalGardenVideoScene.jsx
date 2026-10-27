import { useEffect, useRef } from 'react';
import { useCinematicPlayback } from '../../../shared/Openings/cinematicOpeningContext';
import { introArtwork } from '../../../shared/cinematicIntro';

export default function RoyalGardenVideoScene({ english, names, monogram, intro, presentation, onReplay }) {
  const { active, stage, completed, poster } = useCinematicPlayback();
  const root = useRef(null);
  useEffect(() => {
    if (!active) return;
    root.current?.focus({ preventScroll: true });
    root.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [active]);
  if (!active && !(completed && presentation.endBehavior === 'poster')) return null;
  return <section ref={root} tabIndex={-1} className="rg-video-section cinematic-inline-stage" data-complete={!active} aria-label={english ? 'Pre-wedding video' : 'វីដេអូមុនអាពាហ៍ពិពាហ៍'}>
    <h2 className="rg-sr-only">{names}</h2>
    {active && monogram && <div className="rg-video-monogram" lang={/[\u1780-\u17ff]/.test(monogram) ? 'km' : undefined} aria-hidden="true">{monogram}</div>}
    {active && introArtwork(intro) && <img className="rg-video-calligraphy" src={introArtwork(intro)} alt="" width="1100" height="619" onError={event => { event.currentTarget.hidden = true; }} />}
    {active ? stage : <div className="rg-video-keepsake">{poster && <img src={poster} alt={english ? 'Our pre-wedding film' : 'វីដេអូមុនអាពាហ៍ពិពាហ៍'} loading="lazy" />}{presentation.replay && <button type="button" className="rg-button" onClick={onReplay}>{english ? 'Replay video' : 'ចាក់វីដេអូឡើងវិញ'}</button>}</div>}
  </section>;
}
