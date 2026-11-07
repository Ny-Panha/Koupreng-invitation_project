import { useCallback, useEffect, useRef, useState } from 'react';
import { nextIntroState } from '../../../shared/cinematicIntro';
import { royalCurtainDuration } from '../model/royalGardenPresentation';
const CURTAIN_STAGES = ['COVER_EXITING', 'CURTAIN_PREPARING', 'CURTAIN_OPENING'];

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
    setState(current => CURTAIN_STAGES.includes(current.stage) ? { ...current, media: 'video' }
      : ['COVER', 'CONTENT', 'CINEMATIC_MEDIA'].includes(current.stage) ? { ...current, stage: 'VIDEO_PREPARING' } : current);
  }, []);
  const videoPlaying = useCallback(expectedRun => setState(current => {
    if (expectedRun !== undefined && expectedRun !== current.run) return current;
    if (CURTAIN_STAGES.includes(current.stage) && current.media === 'video') return { ...current, media: 'playing' };
    return current.stage === 'VIDEO_PREPARING' ? { ...current, stage: 'PRE_WEDDING_VIDEO' } : current;
  }), []);
  const exitVideo = useCallback(expectedRun => setState(current => (['VIDEO_PREPARING', 'PRE_WEDDING_VIDEO'].includes(current.stage) || (CURTAIN_STAGES.includes(current.stage) && current.media)) && (expectedRun === undefined || expectedRun === current.run) ? { ...current, stage: 'VIDEO_EXITING' } : current), []);
  const beginPhotos = useCallback(() => {
    setState(current => current.stage === 'CINEMATIC_MEDIA' ? { ...current, stage: slideCount && !reduced ? 'PHOTO_SLIDESHOW' : 'INVITATION_REVEAL', slide: 0 } : current);
  }, [slideCount, reduced]);
  const afterVideo = useCallback((photos = false, expectedRun) => {
    remaining.current = null;
    setState(current => (['VIDEO_PREPARING', 'PRE_WEDDING_VIDEO', 'VIDEO_EXITING'].includes(current.stage) || (CURTAIN_STAGES.includes(current.stage) && current.media)) && (expectedRun === undefined || expectedRun === current.run)
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
    const ms = remaining.current?.key === key ? remaining.current.ms : ({ COVER_EXITING: 360, CURTAIN_PREPARING: 420, CURTAIN_OPENING: royalCurtainDuration(curtainSpeed), ORNAMENT_REVEAL: 2400, TITLE_REVEAL: 4200, PHOTO_SLIDESHOW: duration * 1000, INVITATION_REVEAL: 700 })[state.stage];
    const began = performance.now();
    const timer = window.setTimeout(() => {
      remaining.current = null;
      setState(current => {
        if (current.run !== state.run || current.stage !== state.stage || current.slide !== state.slide) return current;
        const mediaStage = current.media === 'playing' ? 'PRE_WEDDING_VIDEO' : current.media === 'video' ? 'VIDEO_PREPARING' : 'CINEMATIC_MEDIA';
        const next = { COVER_EXITING: curtainEnabled ? 'CURTAIN_PREPARING' : mediaStage, CURTAIN_PREPARING: 'CURTAIN_OPENING', CURTAIN_OPENING: mediaStage }[current.stage];
        return next ? { ...current, stage: next } : { ...nextIntroState(current, slideCount), run: current.run };
      });
    }, ms);
    return () => { clearTimeout(timer); remaining.current = { key, ms: Math.max(0, ms - (performance.now() - began)) }; };
  }, [state, paused, hidden, duration, slideCount, curtainEnabled, curtainSpeed]);
  return { ...state, paused, hidden, setPaused, finish, restart, start, prepareVideo, videoPlaying, exitVideo, afterVideo, beginPhotos };
}
