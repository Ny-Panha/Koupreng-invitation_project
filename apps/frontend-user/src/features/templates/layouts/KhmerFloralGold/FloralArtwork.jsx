import { useState } from 'react';
import { safeIntroMedia } from '../../shared/cinematicIntro';

export function FloralPhoto({ src, alt, priority = false, className = '' }) {
  const [failed, setFailed] = useState('');
  const safe = safeIntroMedia(src);
  const responsive = safe === '/templates/khmer-floral-gold/couple-960.webp';
  return safe && failed !== safe ? <img className={className} src={safe}
    srcSet={responsive ? '/templates/khmer-floral-gold/couple-480.webp 480w, /templates/khmer-floral-gold/couple-960.webp 960w, /templates/khmer-floral-gold/couple-1280.webp 1280w' : undefined}
    sizes={responsive ? '(max-width: 560px) 100vw, 560px' : undefined}
    alt={alt} draggable={false} width="960" height="1440" loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined}
    onError={() => setFailed(safe)} />
    : <div className={`kfg-photo-empty ${className}`} role="img" aria-label={alt}><span className="kfg-empty-flower" aria-hidden="true">✧</span><span>{alt}</span></div>;
}
export function FloralDivider() {
  return <svg className="kfg-divider" viewBox="0 0 240 28" fill="none" aria-hidden="true"><path d="M8 14H92m56 0h84M120 6l8 8-8 8-8-8Z" stroke="currentColor"/><path d="M101 14c-12-16-21 8-8 3m46-3c12-16 21 8 8 3" stroke="currentColor"/><circle cx="120" cy="14" r="2" fill="currentColor"/></svg>;
}
export function FloralMonogram({ text }) {
  return <div className="kfg-monogram"><svg viewBox="0 0 240 310" fill="none" aria-hidden="true">
    <path d="M120 12c13 25 43 7 55 28 7 13-6 22 7 35 27-2 39 20 27 42-8 14 6 32-5 48 12 25-7 34-4 61 7 29-23 37-45 38-10 19-24 10-35 34-11-24-25-15-35-34-22-1-52-9-45-38 3-27-16-36-4-61-11-16 3-34-5-48C19 95 31 73 58 75c13-13 0-22 7-35 12-21 42-3 55-28Z"/>
    <path d="M120 30c18 22 38 4 43 23s-4 29 20 36c22 8 4 34 10 51-9 23 1 35-8 59 7 35-1 45-38 52-14 13-17 6-27 28-10-22-13-15-27-28-37-7-45-17-38-52-9-24 1-36-8-59 6-17-12-43 10-51 24-7 15-17 20-36s25-1 43-23Z" strokeWidth=".6"/>
    {[0, 1].map(side => <g key={side} transform={side ? 'translate(240 0) scale(-1 1)' : undefined}><path d="M66 48q-25-21-28 2t22 4M46 93q-29-17-23 9t20-2M42 188q-27 9-18 27t22-8M61 255q-29 20-21 31t23-15"/><path d="M50 54l-7-18m-4 67-15-7m13 114-15 9m32 53-8 17"/>{[75,120,162,224].map((y,i) => <g key={y} transform={`translate(${i === 0 || i === 3 ? 51 : 32} ${y}) rotate(${i % 2 ? 15 : -15})`} strokeWidth=".8"><path d="M0 0c-17-15-23 3-10 6 10 2 16-12 9-23M-2-3q-12-18-16-8 1 7 11 8M-3-4q4-18 9-9 1 7-9 9"/><path d="M-5 3q-12 6-16 0 0-8 8-3"/></g>)}</g>)}
    <path d="M115 15q-12-18 5-15 17-3 5 15M115 296q-12 18 5 14 17 4 5-14"/>
  </svg><span>{text.trim().split(/\s+/).length === 2 ? text.trim().split(/\s+/).join('\n') : text}</span></div>;
}
