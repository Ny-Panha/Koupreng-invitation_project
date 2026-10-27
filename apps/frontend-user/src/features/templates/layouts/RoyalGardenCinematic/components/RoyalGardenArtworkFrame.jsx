import { useState } from 'react';

// The complete source is sampled by CSS nine-slice framing. Corners and the
// top/bottom retain their width scale; only straight vertical edges repeat.
export default function RoyalGardenArtworkFrame({ source, smallSource, variant = 'information', className = '', style, fill = true }) {
  const [loaded, setLoaded] = useState(null), [failed, setFailed] = useState('');
  if (!source || failed === source) return null;
  return <div className={`rg-artwork-frame rg-artwork-frame--${variant} ${className}`} data-fill={fill} style={{ ...style, '--asset-royal-frame': loaded?.source === source ? `url(${JSON.stringify(loaded.url)})` : 'none' }} aria-hidden="true">
    <img className="rg-frame-source" src={source} srcSet={smallSource ? `${smallSource} 640w, ${source} ${variant === 'opening' ? 941 : 1200}w` : undefined} sizes="(max-width: 600px) 100vw, 600px" alt="" width={variant === 'opening' ? 941 : 1200} height={variant === 'opening' ? 1672 : 2133} decoding="async" fetchPriority={variant === 'opening' ? 'high' : 'auto'} onLoad={event => setLoaded({ source, url: event.currentTarget.currentSrc || source })} onError={() => setFailed(source)} />
  </div>;
}
