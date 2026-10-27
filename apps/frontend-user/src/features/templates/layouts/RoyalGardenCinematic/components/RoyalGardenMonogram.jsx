import { useState } from 'react';
import { ROYAL_ASSETS } from '../model/royalGardenPresentation';

export default function RoyalGardenMonogram({ settings, initials, scene = 'information' }) {
  const [failed, setFailed] = useState('');
  if (settings.hidden || (settings.mode === 'custom' && !settings.source)) return null;
  const source = settings.source !== failed ? settings.source : '';
  if (!source && !initials) return null;
  return <div className={`rg-monogram ${scene === 'video' ? 'rg-video-monogram' : 'rg-ceremonial-monogram'}`} data-artwork={Boolean(source)} style={{ '--rg-monogram-scale': settings.scale, '--rg-monogram-y': `${settings.positionY}%` }} aria-hidden="true">
    {source ? <img src={source} srcSet={source === ROYAL_ASSETS.monogram ? `${ROYAL_ASSETS.monogramSmall} 128w, ${source} 256w, ${ROYAL_ASSETS.monogramLarge} 512w` : undefined} sizes={scene === 'video' ? '112px' : '128px'} alt="" width="256" height="256" loading={scene === 'video' ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(source)} /> : <span lang={/[\u1780-\u17ff]/.test(initials) ? 'km' : undefined}>{initials}</span>}
  </div>;
}
