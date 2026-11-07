// Same two-panel structure as Emerald Luxe, scoped to Royal Garden's state machine.
// The cloth, seams, tassels and valance are original CSS, with no video/image fetch.
export default function RoyalGardenCurtainReveal({ stage, speed, paused }) {
  return <div className="rg-curtains" data-open={!['COVER_EXITING', 'CURTAIN_PREPARING'].includes(stage)} data-paused={paused} style={{ '--rg-curtain-duration': speed === 'gentle' ? '2600ms' : '1800ms' }} aria-hidden="true">
    <div className="rg-curtain-panel rg-curtain-panel--left" />
    <div className="rg-curtain-panel rg-curtain-panel--right" />
    <div className="rg-curtain-valance" />
  </div>;
}
