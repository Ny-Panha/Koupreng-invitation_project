import { ROYAL_ASSETS } from '../model/royalGardenPresentation';

export default function RoyalGardenRoyalArch({ entrance }) {
  if (!entrance.frameEnabled || !entrance.frame) return null;
  return <div className="rg-royal-arch" data-position={entrance.framePosition} style={{ '--rg-frame-scale': entrance.frameScale }} aria-hidden="true">
    <img key={entrance.frame} src={entrance.frame} srcSet={entrance.frame === ROYAL_ASSETS.arch ? `${ROYAL_ASSETS.archSmall} 640w, ${ROYAL_ASSETS.arch} 941w` : undefined} sizes="(max-width: 600px) 100vw, 560px" alt="" width="941" height="1672" decoding="async" onError={event => { event.currentTarget.hidden = true; }} />
  </div>;
}
