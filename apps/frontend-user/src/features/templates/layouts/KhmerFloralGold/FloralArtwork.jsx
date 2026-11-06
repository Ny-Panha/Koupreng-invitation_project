import { useId, useLayoutEffect, useRef, useState } from 'react';
import { safeIntroMedia } from '../../shared/cinematicIntro';

export function FloralPhoto({ src, alt, priority = false, className = '' }) {
  const [failed, setFailed] = useState('');
  const [loaded, setLoaded] = useState('');
  const safe = safeIntroMedia(src);
  const responsive = safe === '/templates/khmer-floral-gold/couple-960.webp';
  const galleryResponsive = /^\/templates\/khmer-floral-gold\/romantic-\d{2}\.webp$/.test(safe);
  return safe && failed !== safe ? <img className={className} src={safe} data-image-state={loaded === safe ? 'ready' : 'loading'}
    srcSet={responsive ? '/templates/khmer-floral-gold/couple-480.webp 480w, /templates/khmer-floral-gold/couple-960.webp 960w, /templates/khmer-floral-gold/couple-1280.webp 1280w' : galleryResponsive ? `${safe.replace('.webp', '-480.webp')} 480w, ${safe} 960w` : undefined}
    sizes={responsive || galleryResponsive ? '(max-width: 560px) 100vw, 560px' : undefined}
    alt={alt} draggable={false} width="960" height="1440" loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined}
    onLoad={() => setLoaded(safe)} onError={() => setFailed(safe)} />
    : <div className={`kfg-photo-empty ${className}`} role="img" aria-label={alt}><span className="kfg-empty-flower" aria-hidden="true">✧</span><span>{alt}</span></div>;
}
export function FloralDivider() {
  return <svg className="kfg-divider" viewBox="0 0 240 28" fill="none" aria-hidden="true"><path d="M8 14H92m56 0h84M120 6l8 8-8 8-8-8Z" stroke="currentColor"/><path d="M101 14c-12-16-21 8-8 3m46-3c12-16 21 8 8 3" stroke="currentColor"/><circle cx="120" cy="14" r="2" fill="currentColor"/></svg>;
}
function RegalCenterText({ text, size, mode, layout }) {
  const box = useRef(null);
  useLayoutEffect(() => {
    const node = box.current;
    if (!node) return undefined;
    let active = true;
    const fit = () => {
      if (!active) return;
      node.style.fontSize = '';
      let pixels = parseFloat(getComputedStyle(node).fontSize);
      const inner = node.firstElementChild;
      while (pixels > 8 && (inner.scrollWidth > node.clientWidth + 1 || inner.scrollHeight > node.clientHeight + 1)) {
        pixels -= 1;
        node.style.fontSize = `${pixels}px`;
      }
    };
    fit();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    observer?.observe(node);
    document.fonts?.ready.then(fit);
    return () => { active = false; observer?.disconnect(); };
  }, [text, size, mode, layout]);
  const lines = layout === 'staircase' ? String(text || '').split(/\n|\s*&\s*/).map(line => line.trim()).filter(Boolean) : [];
  return <span ref={box} lang={/[\u1780-\u17ff]/.test(text || '') ? 'km' : 'en'} className={Array.from(text || '').length > 12 ? 'kfg-monogram-long-text' : undefined}><span className={lines.length === 2 ? 'kfg-monogram-staircase' : undefined}>{lines.length === 2 ? <><span>{lines[0]}</span><span>&amp;</span><span>{lines[1]}</span></> : text}</span></span>;
}
export function FloralMonogram({ text, variant = 'ornate', settings = {}, children }) {
  if (variant === 'regal-scroll-gold') return <div className="kfg-monogram kfg-monogram--regal-scroll-gold" data-frame={variant} data-text-mode={settings.monogramMode} data-gold-treatment={settings.monogramTreatment}
    style={{ '--kfg-monogram-size': settings.monogramSize, '--kfg-monogram-text-size': `${settings.monogramTextSize || 36}px`, '--kfg-monogram-text-color': settings.monogramTextColor, '--kfg-monogram-align': settings.monogramAlign, '--kfg-monogram-opacity': settings.monogramOpacity, '--kfg-monogram-offset': `${settings.monogramOffset || 0}px` }}>
    <img className="kfg-monogram-art" src="/templates/khmer-floral-gold/regal-scroll-gold.webp" srcSet="/templates/khmer-floral-gold/regal-scroll-gold-480.webp 480w, /templates/khmer-floral-gold/regal-scroll-gold.webp 960w" sizes="(max-width: 430px) 80vw, 310px" alt="" aria-hidden="true" width="960" height="960" decoding="async" fetchPriority="high" draggable={false} />
    {children || <RegalCenterText text={text} size={settings.monogramTextSize} mode={settings.monogramMode} layout={settings.monogramTextLayout} />}
  </div>;
  if (variant !== 'ornate') return <div className={`kfg-monogram kfg-monogram--${variant}`}><svg viewBox="0 0 240 310" fill="none" aria-hidden="true">{variant === 'oval' ? <><ellipse cx="120" cy="155" rx="94" ry="136" /><ellipse cx="120" cy="155" rx="85" ry="126" strokeWidth=".6" /><path d="m120 7 9 12-9 12-9-12Zm0 272 9 12-9 12-9-12Z" /></> : variant === 'diamond' ? <><path d="m120 10 108 145-108 145L12 155Zm0 16 96 129-96 129-96-129Z" /><path d="M84 10h72M84 300h72" /></> : <><rect x="29" y="30" width="182" height="250" rx="90" /><path d="M86 17h68M86 293h68" /></>}</svg><span>{text}</span></div>;
  return <div className="kfg-monogram"><svg viewBox="0 0 240 310" fill="none" aria-hidden="true">
    <path d="M120 12c13 25 43 7 55 28 7 13-6 22 7 35 27-2 39 20 27 42-8 14 6 32-5 48 12 25-7 34-4 61 7 29-23 37-45 38-10 19-24 10-35 34-11-24-25-15-35-34-22-1-52-9-45-38 3-27-16-36-4-61-11-16 3-34-5-48C19 95 31 73 58 75c13-13 0-22 7-35 12-21 42-3 55-28Z"/>
    <path d="M120 30c18 22 38 4 43 23s-4 29 20 36c22 8 4 34 10 51-9 23 1 35-8 59 7 35-1 45-38 52-14 13-17 6-27 28-10-22-13-15-27-28-37-7-45-17-38-52-9-24 1-36-8-59 6-17-12-43 10-51 24-7 15-17 20-36s25-1 43-23Z" strokeWidth=".6"/>
    {[0, 1].map(side => <g key={side} transform={side ? 'translate(240 0) scale(-1 1)' : undefined}><path d="M66 48q-25-21-28 2t22 4M46 93q-29-17-23 9t20-2M42 188q-27 9-18 27t22-8M61 255q-29 20-21 31t23-15"/><path d="M50 54l-7-18m-4 67-15-7m13 114-15 9m32 53-8 17"/>{[75,120,162,224].map((y,i) => <g key={y} transform={`translate(${i === 0 || i === 3 ? 51 : 32} ${y}) rotate(${i % 2 ? 15 : -15})`} strokeWidth=".8"><path d="M0 0c-17-15-23 3-10 6 10 2 16-12 9-23M-2-3q-12-18-16-8 1 7 11 8M-3-4q4-18 9-9 1 7-9 9"/><path d="M-5 3q-12 6-16 0 0-8 8-3"/></g>)}</g>)}
    <path d="M115 15q-12-18 5-15 17-3 5 15M115 296q-12 18 5 14 17 4 5-14"/>
    {[0, 1].map(side => <g key={`engraving-${side}`} transform={side ? 'translate(240 0) scale(-1 1)' : undefined} strokeWidth=".7">
      <path d="M51 77C15 104 27 137 31 157S19 201 44 238M47 80q-16 6-16 20 12-2 16-20M32 118q-14 4-10 18 10-7 10-18M29 158q-15 8-7 22 9-10 7-22M31 199q-12 10-1 23 6-12 1-23M45 236q-15-1-19 12 13 3 19-12" />
      {[55, 253].map(y => <g key={y} transform={`translate(61 ${y})`}><path d="M0 0C-13-16-22-4-7 3-22 10-11 21 0 7 10 22 22 10 7 3 23-5 12-16 0 0Z" /><circle cy="3" r="2" fill="currentColor" fillOpacity=".4" /></g>)}
    </g>)}
  </svg><span>{text.trim().split(/\s+/).length === 2 ? text.trim().split(/\s+/).join('\n') : text}</span></div>;
}

export function GoldFlourish({ className = '' }) {
  return <svg className={`kfg-flourish ${className}`} viewBox="0 0 180 34" fill="none" aria-hidden="true"><path d="M90 28c-8-17-25-1-31-14-5-13 16-16 16-5 0 8-12 6-11 0M90 28c-20-1-25-20-46-13-14 5-19-11-10-12 9 0 6 9 1 7M90 28c-31 8-45-20-68-12-11 4-16-4-11-8m21 13c-15 15-33 6-27-3m85 10c8-17 25-1 31-14 5-13-16-16-16-5 0 8 12 6 11 0M90 28c20-1 25-20 46-13 14 5 19-11 10-12-9 0-6 9-1 7M90 28c31 8 45-20 68-12 11 4 16-4 11-8m-21 13c15 15 33 6 27-3" stroke="currentColor" strokeWidth="1"/><path d="m90 7 5 9-5 8-5-8Z" fill="currentColor" fillOpacity=".5" /></svg>;
}

export function BotanicalLinework() {
  return <svg className="kfg-botanical-lines" viewBox="0 0 260 170" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".8"><path d="M0 2c48 0 103 36 154 141M32 9q25 0 43 36M70 33q47-15 99 16M89 51q16 6 32 2M116 81q-27 7-34 32M0 30q50 12 53 50" />{[0, 1, 2, 3].map(i => <g key={i} transform={`translate(${30 + i * 35} ${15 + i * 25}) rotate(${i * 19})`}><path d="M0 0q-18-30-27-16T0 0q-4-34 9-27T0 0q25-20 29-5T0 0q17 21 3 23T0 0q-21 16-22 2T0 0Z"/><path d="m0 0-20-13M0 0l7-20M0 0l22-4M0 0l2 17"/><circle r="3" fill="currentColor" fillOpacity=".3" /></g>)}</g></svg>;
}

export function GoldPlaque() {
  const gradient = useId();
  return <svg className="kfg-gold-plaque" viewBox="0 0 360 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b9995b" /><stop offset=".22" stopColor="#947037" /><stop offset=".75" stopColor="#876326" /><stop offset="1" stopColor="#a9894d" /></linearGradient></defs>
    <path d="M30 3H330l8 8h8l13 19-13 19h-8l-8 8H30l-8-8h-8L1 30l13-19h8Z" fill={`url(#${gradient})`} stroke="#97743c" />
    <path d="M34 8H326l7 8h10l10 14-10 14h-10l-7 8H34l-7-8H17L7 30l10-14h10Z" fill="none" stroke="#e8d2a1" strokeOpacity=".68" strokeWidth=".8" />
    <path d="M35 11H324l7 8h10M35 49H324" fill="none" stroke="#f4e4bd" strokeOpacity=".3" />
  </svg>;
}
