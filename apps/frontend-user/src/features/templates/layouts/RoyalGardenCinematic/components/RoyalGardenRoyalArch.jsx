import { ROYAL_ASSETS } from '../model/royalGardenPresentation';
import RoyalGardenArtworkFrame from './RoyalGardenArtworkFrame';

export default function RoyalGardenRoyalArch({ entrance, onReady }) {
  if (!entrance.frameEnabled || !entrance.frame) return null;
  return <RoyalGardenArtworkFrame key={entrance.frame} source={entrance.frame} tinySource={entrance.frame === ROYAL_ASSETS.arch ? ROYAL_ASSETS.archTiny : undefined} smallSource={entrance.frame === ROYAL_ASSETS.arch ? ROYAL_ASSETS.archSmall : undefined} variant="opening" className="rg-royal-arch" style={{ '--rg-frame-scale': entrance.frameScale }} onReady={onReady} />;
}
