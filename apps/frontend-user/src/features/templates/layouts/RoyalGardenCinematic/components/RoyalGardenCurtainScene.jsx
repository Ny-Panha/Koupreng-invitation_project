import { useEffect, useRef } from 'react';
import { SkipForward } from 'lucide-react';
import RoyalGardenCurtainReveal from './RoyalGardenCurtainReveal';

// Only the cloth sits above the real playing film: no intermediate portrait/frame scene.
export default function RoyalGardenCurtainScene({ sequence, entrance, english, onSkip }) {
  const root = useRef(null);
  useEffect(() => { root.current?.querySelector('button')?.focus({preventScroll:true}); }, []);
  return <section ref={root} className="rg-curtain-transition" aria-label={english ? 'Opening the curtain' : 'កំពុងបើកវាំងនន'}>
    <div className="rg-curtain-stage">
      {entrance.curtainEnabled && <RoyalGardenCurtainReveal stage={sequence.stage} speed={entrance.curtainSpeed} paused={sequence.paused || sequence.hidden} />}
      <button className="rg-curtain-skip" type="button" onClick={onSkip} title={english ? 'Skip' : 'រំលង'}><SkipForward size={19} aria-hidden="true"/><span className="rg-sr-only">{english ? 'Skip intro' : 'រំលង'}</span></button>
    </div>
  </section>;
}
