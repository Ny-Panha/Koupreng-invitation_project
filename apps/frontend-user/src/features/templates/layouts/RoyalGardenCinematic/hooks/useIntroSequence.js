import { useCallback, useEffect, useRef, useState } from 'react';
import { nextIntroState } from '../../../shared/cinematicIntro';

export default function useIntroSequence({ preview, previewStartClosed, enabled, reduced, duration, slideCount }) {
  const run = useRef(0);
  const [state, setState] = useState(() => ({ stage: !enabled || (preview && !previewStartClosed) ? 'CONTENT' : 'COVER', slide: 0, run: 0 }));
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const remaining = useRef(null);
  const finish = useCallback(() => { remaining.current = null; setState({ stage: 'CONTENT', slide: 0 }); setPaused(false); }, []);
  const restart = useCallback(() => { remaining.current = null; setState({ stage: 'COVER', slide: 0, run: ++run.current }); setPaused(false); }, []);
  const start = useCallback(() => { remaining.current = null; setState({ stage: reduced || !enabled ? 'CONTENT' : 'ORNAMENT_REVEAL', slide: 0, run: ++run.current }); }, [enabled, reduced]);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    if (['COVER', 'CONTENT'].includes(state.stage) || paused || hidden) return;
    const key = `${state.run}:${state.stage}:${state.slide}`;
    const ms = remaining.current?.key === key ? remaining.current.ms : ({ ORNAMENT_REVEAL: 2400, TITLE_REVEAL: 4200, PHOTO_SLIDESHOW: duration * 1000, INVITATION_REVEAL: 700 })[state.stage];
    const began = performance.now();
    const timer = window.setTimeout(() => { remaining.current = null; setState(current => nextIntroState(current, slideCount)); }, ms);
    return () => { clearTimeout(timer); remaining.current = { key, ms: Math.max(0, ms - (performance.now() - began)) }; };
  }, [state, paused, hidden, duration, slideCount]);
  return { ...state, paused, hidden, setPaused, finish, restart, start };
}
