import { guestFrameText, ROYAL_ASSETS } from '../model/royalGardenPresentation';

export default function RoyalGardenGuestFrame({ content, english, enabled, modern = false }) {
  if (!enabled) return null;
  const guest = guestFrameText(content, english);
  if (modern) return <div className="rg-royal-guest rg-royal-guest--modern">
    <p className="rg-guest-caption">{english ? 'You are warmly invited' : 'សូមគោរពអញ្ជើញ'}</p>
    <div className="rg-guest-frame" data-modern="true" data-long={guest.length > 55}>
      <img src={ROYAL_ASSETS.guestKbach} srcSet={`${ROYAL_ASSETS.guestKbachSmall} 600w, ${ROYAL_ASSETS.guestKbach} 1200w`} sizes="(max-width:639px) 78vw,380px" alt="" width="1200" height="400" decoding="async"/>
      <span className="rg-guest-name" title={guest} aria-label={guest}>{guest}</span>
    </div>
  </div>;
  return <div className="rg-royal-guest">
    <p>{english ? 'You are warmly invited' : 'សូមគោរពអញ្ជើញ'}</p>
    <div className="rg-guest-frame" data-long={guest.length > 55}><img src={ROYAL_ASSETS.guest} srcSet={`${ROYAL_ASSETS.guestSmall} 480w, ${ROYAL_ASSETS.guest} 960w`} sizes="(max-width: 639px) 78vw, 520px" alt="" width="960" height="320" decoding="async" /><span title={guest} aria-label={guest}>{guest}</span></div>
  </div>;
}
