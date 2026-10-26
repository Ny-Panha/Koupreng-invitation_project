import { Pause, Play, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CoverBackground from '../../../shared/Openings/CoverBackground';
import manifest from '../template.json';

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
export default function RoyalGardenIntro({ sequence, intro, slides, content, title, names, date, english, onOpen }) {
  const opening = sequence.stage === 'COVER';
  const slideshow = sequence.stage === 'PHOTO_SLIDESHOW';
  const root = useRef(null);
  useEffect(() => { if (!opening) root.current?.querySelector('button')?.focus({ preventScroll: true }); }, [opening]);
  useEffect(() => {
    const source = slides[slideshow ? sequence.slide + 1 : 0]?.src;
    if (!source || opening || navigator.connection?.saveData) return;
    const img = new Image(); img.src = source; img.decode?.().catch(() => {});
  }, [slides, sequence.slide, slideshow, opening]);
  return <section ref={root} className="rg-intro" data-scene={sequence.stage} data-style={intro.style} data-paused={sequence.paused || sequence.hidden} aria-label={english ? 'Invitation opening' : 'ការបើកធៀបអញ្ជើញ'}>
    <CoverBackground content={content} templateDefault={manifest.cover} /><div className="rg-intro-wash" />
    <div className="rg-particles" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
    {!slideshow && <div className="rg-oval-scene"><OrnamentalOval /><div className="rg-oval-copy">
      {opening ? <><span className="rg-open-symbol" aria-hidden="true">✧</span><h1>{title}</h1><button className="rg-open" type="button" onClick={onOpen}>{english ? 'Open invitation' : 'សូមបើកធៀបការ'}</button></>
        : <><h1>{intro.heading ?? title}</h1>{sequence.stage !== 'ORNAMENT_REVEAL' && <><p>{intro.subtitle ?? (english ? 'You are warmly invited' : 'សូមគោរពអញ្ជើញ')}</p><strong>{names}</strong></>}</>}
    </div></div>}
    {slideshow && <div className="rg-intro-slides">
      {slides.map((slide, i) => i <= sequence.slide + 1 && i >= sequence.slide - 1 ? <Portrait key={`${slide.id}-${slide.src}`} slide={slide} index={i} active={sequence.slide} transition={intro.transition} duration={intro.duration} /> : null)}
      <div className="rg-photo-scrim" style={{ '--rg-overlay': intro.overlay }} />
      <div className="rg-save-date-overlay" data-position={intro.textPosition}>{intro.showSaveTheDate && <span>Save the Date</span>}<h1>{names}</h1><p>{date}</p></div>
    </div>}
    {!opening && <div className="rg-intro-controls">
      {slideshow && <button type="button" aria-label={sequence.paused ? 'Resume slideshow' : 'Pause slideshow'} aria-pressed={sequence.paused} onClick={() => sequence.setPaused(!sequence.paused)}>{sequence.paused ? <Play size={18} /> : <Pause size={18} />}</button>}
      <button type="button" onClick={sequence.finish}>{english ? 'Skip intro' : 'រំលង'}<SkipForward size={16} aria-hidden="true" /></button>
    </div>}
  </section>;
}
