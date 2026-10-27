import { Pause, Play, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CoverBackground from '../../../shared/Openings/CoverBackground';
import manifest from '../template.json';
import { DEFAULT_INTRO_ARTWORK, introArtwork } from '../../../shared/cinematicIntro';

export function OrnamentalOval() {
  return <svg className="rg-oval-art" viewBox="0 0 300 410" aria-hidden="true" focusable="false">
    <ellipse className="rg-oval-shadow" cx="150" cy="205" rx="112" ry="171" />
    <g className="rg-oval-petals">{Array.from({ length: 72 }, (_, i) => {
      const angle = i * Math.PI / 36;
      return <path key={i} transform={`translate(${150 + 121 * Math.cos(angle)} ${205 + 178 * Math.sin(angle)}) rotate(${i * 5 + 90})`} d="M0-12C-18-2-12 9 0 13C12 9 18-2 0-12ZM0-7Q-8 0 0 8Q8 0 0-7Z" />;
    })}</g>
    {[0, 6, 11, 17].map(inset => <ellipse className="rg-oval-ring" key={inset} cx="150" cy="205" rx={119 - inset} ry={177 - inset} />)}
  </svg>;
}
function Portrait({ slide, index, active, transition, duration }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img className="rg-intro-portrait" data-active={index === active} data-transition={transition} src={slide.src} alt={index === active ? slide.alt : ''}
    aria-hidden={index !== active} decoding="async" onError={() => setFailed(true)} style={{ objectPosition: `${slide.x}% ${slide.y}%`, '--rg-slide-duration': `${duration + 1}s` }} />;
}
export default function RoyalGardenIntro({ sequence, intro, slides, content, title, names, date, english, onOpen, reducedMotion }) {
  const opening = sequence.stage === 'COVER';
  const slideshow = sequence.stage === 'PHOTO_SLIDESHOW';
  const portraitScene = slideshow || (sequence.stage === 'INVITATION_REVEAL' && slides.length > 0);
  const portraitIndex = sequence.stage === 'INVITATION_REVEAL' ? Math.max(0, slides.length - 1) : sequence.slide;
  const golden = ['golden-calligraphy', 'royal-arch'].includes(intro.style);
  const arriving = golden && sequence.stage === 'TITLE_REVEAL' && slides.length > 0;
  const artwork = golden ? introArtwork(intro) : '';
  const [failedArtwork, setFailedArtwork] = useState('');
  const [artworkMask, setArtworkMask] = useState({ source: '', url: '' });
  useEffect(() => setFailedArtwork(''), [artwork]);
  const hasArtwork = Boolean(artwork && failedArtwork !== artwork);
  const root = useRef(null);
  useEffect(() => { if (!opening) root.current?.querySelector('button')?.focus({ preventScroll: true }); }, [opening]);
  useEffect(() => {
    const source = slides[slideshow ? sequence.slide + 1 : 0]?.src;
    if (!source || opening || navigator.connection?.saveData) return;
    const img = new Image(); img.src = source; img.decode?.().catch(() => {});
  }, [slides, sequence.slide, slideshow, opening]);
  return <section ref={root} className="rg-intro" data-scene={sequence.stage} data-style={intro.style} data-palette={intro.palette} data-animation={intro.animationPreset} data-reduced={reducedMotion || undefined} data-paused={sequence.paused || sequence.hidden} aria-label={english ? 'Invitation opening' : 'ការបើកធៀបអញ្ជើញ'}>
    <CoverBackground content={content} templateDefault={manifest.cover} /><div className="rg-intro-wash" />
    {golden && <div className="rg-golden-backdrop" aria-hidden="true" />}
    {intro.style !== 'royal-arch' && <div className="rg-particles" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>}
    {!portraitScene && golden && <div className="rg-calligraphy-scene" data-position={intro.artworkPosition} style={{ '--rg-artwork-scale': intro.artworkScale }}>
      {hasArtwork && <div className="rg-golden-artwork" style={{ '--rg-calligraphy-image': artworkMask.source === artwork ? `url(${JSON.stringify(artworkMask.url)})` : 'none' }}>
        <img className="rg-calligraphy-image" src={artwork} srcSet={artwork === DEFAULT_INTRO_ARTWORK ? `${manifest.openingArtwork.smallSrc} 960w, ${artwork} 1600w` : undefined} sizes="(max-width: 767px) 88vw, 600px" width="1600" height="900" alt={intro.artworkAlt || (english ? 'Golden wedding calligraphy with flowers and a butterfly: Save the Date' : 'អក្សរផ្ចង់មង្គលការពណ៌មាស មានផ្កា និងមេអំបៅ')} fetchPriority="high" decoding="async" onLoad={event => setArtworkMask({ source: artwork, url: event.currentTarget.currentSrc || artwork })} onError={() => setFailedArtwork(artwork)} />
        <span className="rg-calligraphy-light" aria-hidden="true" />
      </div>}
      <div className="rg-calligraphy-copy">
        {opening ? <><h1 className={hasArtwork ? 'rg-sr-only' : undefined}>{title}</h1><button className="rg-open" type="button" onClick={onOpen}>{english ? 'Open invitation' : 'សូមបើកធៀបការ'}</button></> : <>
          {!hasArtwork && <h1>{intro.heading ?? title}</h1>}
          {sequence.stage !== 'ORNAMENT_REVEAL' && <><p>{intro.subtitle ?? (english ? 'You are warmly invited' : 'សូមគោរពអញ្ជើញ')}</p><h1>{names}</h1><p>{date}</p></>}
        </>}
      </div>
    </div>}
    {!portraitScene && !golden && <div className="rg-oval-scene"><OrnamentalOval /><div className="rg-oval-copy">
      {opening ? <><span className="rg-open-symbol" aria-hidden="true">✧</span><h1>{title}</h1><button className="rg-open" type="button" onClick={onOpen}>{english ? 'Open invitation' : 'សូមបើកធៀបការ'}</button></>
        : <><h1>{intro.heading ?? title}</h1>{sequence.stage !== 'ORNAMENT_REVEAL' && <><p>{intro.subtitle ?? (english ? 'You are warmly invited' : 'សូមគោរពអញ្ជើញ')}</p><strong>{names}</strong></>}</>}
    </div></div>}
    {(portraitScene || arriving) && <div className="rg-intro-slides" data-arriving={arriving || undefined}>
      {slides.map((slide, i) => i <= portraitIndex + 1 && i >= portraitIndex - 1 ? <Portrait key={`${slide.id}-${slide.src}`} slide={slide} index={i} active={portraitIndex} transition={intro.transition} duration={intro.duration} /> : null)}
      <div className="rg-photo-scrim" style={{ '--rg-overlay': intro.overlay }} />
      {!arriving && <div className="rg-save-date-overlay" data-position={intro.textPosition}>{intro.showSaveTheDate && !hasArtwork && <span>{english ? 'Save the Date' : 'កាលបរិច្ឆេទកម្មវិធី'}</span>}<h1>{names}</h1><p>{date}</p></div>}
    </div>}
    {!opening && <div className="rg-intro-controls">
      {slideshow && <button type="button" aria-label={sequence.paused ? (english ? 'Resume slideshow' : 'បន្តបង្ហាញរូបភាព') : (english ? 'Pause slideshow' : 'ផ្អាកបង្ហាញរូបភាព')} aria-pressed={sequence.paused} onClick={() => sequence.setPaused(!sequence.paused)}>{sequence.paused ? <Play size={18} /> : <Pause size={18} />}</button>}
      <button type="button" onClick={sequence.finish}>{english ? 'Skip intro' : 'រំលង'}<SkipForward size={16} aria-hidden="true" /></button>
    </div>}
  </section>;
}
