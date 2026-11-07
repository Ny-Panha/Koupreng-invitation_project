import { useCallback, useEffect, useRef, useState } from 'react';
import { nextIntroState } from '../../../shared/cinematicIntro';

export default function useIntroSequence({ preview, previewStartClosed, enabled, reduced, duration, slideCount, royal = false, curtainEnabled = true, curtainSpeed = 'standard' }) {
  const run = useRef(0);
  const [state, setState] = useState(() => ({ stage: !enabled || (preview && !previewStartClosed) ? 'CONTENT' : 'COVER', slide: 0, run: 0 }));
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const remaining = useRef(null);
  const finish = useCallback(() => { remaining.current = null; setState({ stage: 'CONTENT', slide: 0, run: ++run.current }); setPaused(false); }, []);
  const restart = useCallback(() => { remaining.current = null; setState({ stage: 'COVER', slide: 0, run: ++run.current }); setPaused(false); }, []);
  const start = useCallback((replay = false) => {
    setPaused(false);
    setState(current => {
      if (current.stage !== 'COVER' && replay !== true) return current;
      remaining.current = null;
      return { stage: reduced || !enabled ? 'CONTENT' : royal ? 'COVER_EXITING' : 'ORNAMENT_REVEAL', slide: 0, run: ++run.current };
    });
  }, [enabled, reduced, royal]);
  const prepareVideo = useCallback(() => {
    remaining.current = null;
    setState(current => ['COVER', 'CONTENT', 'CINEMATIC_MEDIA'].includes(current.stage) ? { ...current, stage: 'VIDEO_PREPARING' } : current);
  }, []);
  const videoPlaying = useCallback(expectedRun => setState(current => current.stage === 'VIDEO_PREPARING' && (expectedRun === undefined || expectedRun === current.run) ? { ...current, stage: 'PRE_WEDDING_VIDEO' } : current), []);
  const exitVideo = useCallback(expectedRun => setState(current => ['VIDEO_PREPARING', 'PRE_WEDDING_VIDEO'].includes(current.stage) && (expectedRun === undefined || expectedRun === current.run) ? { ...current, stage: 'VIDEO_EXITING' } : current), []);
  const beginPhotos = useCallback(() => {
    setState(current => current.stage === 'CINEMATIC_MEDIA' ? { ...current, stage: slideCount && !reduced ? 'PHOTO_SLIDESHOW' : 'INVITATION_REVEAL', slide: 0 } : current);
  }, [slideCount, reduced]);
  const afterVideo = useCallback((photos = false, expectedRun) => {
    remaining.current = null;
    setState(current => ['VIDEO_PREPARING', 'PRE_WEDDING_VIDEO', 'VIDEO_EXITING'].includes(current.stage) && (expectedRun === undefined || expectedRun === current.run)
      ? { ...current, stage: photos && !reduced && slideCount ? 'PHOTO_SLIDESHOW' : 'CONTENT', slide: 0 } : current);
  }, [reduced, slideCount]);
  useEffect(() => { if (reduced && !['COVER', 'CONTENT'].includes(state.stage)) finish(); }, [reduced, state.stage, finish]);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    if (['COVER', 'CONTENT', 'CINEMATIC_MEDIA', 'VIDEO_PREPARING', 'PRE_WEDDING_VIDEO', 'VIDEO_EXITING'].includes(state.stage) || paused || hidden) return;
    const key = `${state.run}:${state.stage}:${state.slide}`;
    const ms = remaining.current?.key === key ? remaining.current.ms : ({ COVER_EXITING: 360, CURTAIN_PREPARING: 420, CURTAIN_OPENING: curtainSpeed === 'gentle' ? 2600 : 1800, ORNAMENT_REVEAL: 2400, TITLE_REVEAL: 4200, PHOTO_SLIDESHOW: duration * 1000, INVITATION_REVEAL: 700 })[state.stage];
    const began = performance.now();
    const timer = window.setTimeout(() => {
      remaining.current = null;
      setState(current => {
        if (current !== state) return current;
        const next = { COVER_EXITING: curtainEnabled ? 'CURTAIN_PREPARING' : 'CINEMATIC_MEDIA', CURTAIN_PREPARING: 'CURTAIN_OPENING', CURTAIN_OPENING: 'CINEMATIC_MEDIA' }[current.stage];
        return next ? { ...current, stage: next } : { ...nextIntroState(current, slideCount), run: current.run };
      });
    }, ms);
    return () => { clearTimeout(timer); remaining.current = { key, ms: Math.max(0, ms - (performance.now() - began)) }; };
  }, [state, paused, hidden, duration, slideCount, curtainEnabled, curtainSpeed]);
  return { ...state, paused, hidden, setPaused, finish, restart, start, prepareVideo, videoPlaying, exitVideo, afterVideo, beginPhotos };
}
