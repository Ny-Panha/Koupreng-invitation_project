// Same two-panel structure as Emerald Luxe, scoped to Royal Garden's state machine.
// The same cloth geometry supplies the animated opening and small settled corner folds.
import { royalCurtainDuration } from '../model/royalGardenPresentation';

export default function RoyalGardenCurtainReveal({ stage, speed, paused, settled = false }) {
  return <div className="rg-curtains" data-settled={settled} data-open={!['COVER_EXITING', 'CURTAIN_PREPARING'].includes(stage)} data-paused={paused} style={{ '--rg-curtain-duration': `${royalCurtainDuration(speed)}ms` }} aria-hidden="true">
    <div className="rg-curtain-panel rg-curtain-panel--left" />
    <div className="rg-curtain-panel rg-curtain-panel--right" />
    <div className="rg-curtain-valance" />
  </div>;
}
