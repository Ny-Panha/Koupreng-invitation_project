import { useEffect, useState } from 'react';
import { useUiCopy } from '@/shared/i18n/useUiCopy';
import { Skeleton } from './Skeleton';

// Key by source so a replacement starts locally; the editor/library stays mounted.
export default function MediaImage({ src, alt }) {
  return <ImageRequest key={src} src={src} alt={alt} />;
}

function ImageRequest({ src, alt }) {
  const copy = useUiCopy();
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (state !== 'loading') return;
    const timer = setTimeout(() => setState('error'), 15000);
    return () => clearTimeout(timer);
  }, [state, attempt]);
  return <div className="k-media-image" aria-busy={state === 'loading'}>
    {state === 'loading' && <div className="k-media-image-placeholder" aria-hidden="true"><Skeleton height="100%" /></div>}
    {state !== 'error' && <img key={attempt} src={src} alt={alt} decoding="async" onLoad={() => setState('ready')} onError={() => setState('error')} />}
    {state === 'error' && <div className="k-media-image-error"><p>{copy('មិនអាចផ្ទុករូបភាពបានទេ។', 'Image could not be loaded.')}</p><button type="button" onClick={() => { setState('loading'); setAttempt(n => n + 1); }}>{copy('ព្យាយាមម្ដងទៀត', 'Retry image')}</button></div>}
  </div>;
}
