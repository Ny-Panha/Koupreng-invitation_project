import { guestFrameText, ROYAL_ASSETS } from '../model/royalGardenPresentation';

export default function RoyalGardenGuestFrame({ content, english, enabled }) {
  if (!enabled) return null;
  return <div className="rg-royal-guest">
    <p>{english ? 'You are warmly invited' : 'សូមគោរពអញ្ជើញ'}</p>
    <div className="rg-guest-frame" style={{ '--asset-guest-frame': `url(${JSON.stringify(ROYAL_ASSETS.guest)})` }}><span>{guestFrameText(content, english)}</span></div>
  </div>;
}
