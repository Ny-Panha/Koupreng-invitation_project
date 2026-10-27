import { guestFrameText, ROYAL_ASSETS } from '../model/royalGardenPresentation';

export default function RoyalGardenGuestFrame({ content, english, enabled }) {
  if (!enabled) return null;
  const guest = guestFrameText(content, english);
  return <div className="rg-royal-guest">
    <p>{english ? 'You are warmly invited' : 'សូមគោរពអញ្ជើញ'}</p>
    <div className="rg-guest-frame" data-long={guest.length > 55}><img src={ROYAL_ASSETS.guest} alt="" width="960" height="320" decoding="async" /><span title={guest} aria-label={guest}>{guest}</span></div>
  </div>;
}
