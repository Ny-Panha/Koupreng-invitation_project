import { useState } from 'react';
import { ROYAL_CANVAS_SIZES } from '../model/royalGardenPresentation';

// The complete source is sampled by CSS nine-slice framing. Corners and the
// top/bottom retain their width scale; only straight vertical edges repeat.
export default function RoyalGardenArtworkFrame({ source, smallSource, tinySource, variant = 'information', className = '', style, fill = true, onReady }) {
  const [loaded, setLoaded] = useState(null), [failed, setFailed] = useState('');
  if (!source || failed === source) return null;
  return <div className={`rg-artwork-frame rg-artwork-frame--${variant} ${className}`} data-fill={fill} style={{ ...style, '--asset-royal-frame': loaded?.source === source ? `url(${JSON.stringify(loaded.url)})` : 'none' }} aria-hidden="true">
    <img className="rg-frame-source" src={source} srcSet={smallSource ? `${tinySource ? `${tinySource} 480w, ` : ''}${smallSource} 640w, ${source} 1200w` : undefined} sizes={ROYAL_CANVAS_SIZES} alt="" width="1200" height="2133" decoding="async" fetchPriority="auto" onLoad={event => { setLoaded({ source, url: event.currentTarget.currentSrc || source }); onReady?.(); }} onError={() => { setFailed(source); onReady?.(); }} />
  </div>;
}
