import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from '@/shared/ui';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import CinematicVideoOpening from './CinematicVideoOpening';
import { CinematicOpeningContext, CinematicPlaybackContext } from './cinematicOpeningContext';
import { isTrustedPreviewMessage, readEmbeddedPreviewChannel } from '@/shared/preview/previewMessaging';
import { safeIntroMedia } from '../cinematicIntro';

export default function CinematicOpeningProvider({ configuration, loadVideo, demoVideo, presentation, previewChannel, english, fallbackCover, title, children }) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [coverDismissed, setCoverDismissed] = useState(false);
  const [previewRequested, setPreviewRequested] = useState(false);
  const started = useRef(false), active = useRef(false), timer = useRef(null), resume = useRef(null), content = useRef(null), inlineStage = useRef(null), callbacks = useRef({});
  const [stagePresentation, setStagePresentation] = useState(presentation);
  const enabled = Boolean(demoVideo) || (configuration?.enabled === true && Boolean(configuration.videoMediaId) && typeof loadVideo === 'function');
  const stop = useCallback(() => {
    clearTimeout(timer.current); active.current = false; started.current = false; resume.current = null; callbacks.current = {}; setOpen(false); setPreviewRequested(false);
  }, []);
  const start = useCallback((resumeMusic, delay = 0, options = {}) => {
    if (!enabled || reduced || active.current || (started.current && !options.replay)) return false;
    clearTimeout(timer.current); active.current = true;
    started.current = true;
    resume.current = resumeMusic;
    callbacks.current = options;
    setStagePresentation(options.presentation || presentation);
    timer.current = window.setTimeout(() => { setOpen(true); options.onStart?.(); }, delay);
    return true;
  }, [enabled, reduced, presentation]);
  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false; clearTimeout(timer.current);
    setOpen(false);
    const restoreMusic = resume.current;
    resume.current = null;
    const onFinish = callbacks.current.onFinish; callbacks.current = {};
    onFinish?.();
    restoreMusic?.();
    requestAnimationFrame(() => content.current?.focus({ preventScroll: true }));
  }, []);
  useEffect(() => () => { clearTimeout(timer.current); active.current = false; resume.current = null; }, []);
  useEffect(() => { if (open && stagePresentation?.royal) inlineStage.current?.focus({ preventScroll: true }); }, [open, stagePresentation?.royal]);
  useEffect(() => { if (!enabled || reduced) { if (active.current) finish(); } }, [enabled, reduced, finish]);
  useEffect(() => {
    if (!previewRequested || !enabled) return;
    start(null, 0, { replay: true }); setPreviewRequested(false);
  }, [previewRequested, enabled, start]);
  useEffect(() => {
    const channel = previewChannel || readEmbeddedPreviewChannel();
    if (!channel) return;
    const message = event => {
      if (!isTrustedPreviewMessage(event, channel)) return;
      if (event.data.type === 'TOGGLE_GATE' || (event.data.type === 'PREVIEW_SCENE' && event.data.data.scene !== 'video')) stop();
      if (event.data.type === 'PREVIEW_SCENE' && event.data.data.scene === 'video') setPreviewRequested(true);
    };
    window.addEventListener('message', message);
    return () => window.removeEventListener('message', message);
  }, [previewChannel, start, stop]);
  const showCover = enabled && !reduced && fallbackCover && !coverDismissed;
  return <CinematicOpeningContext.Provider value={start}><CinematicPlaybackContext.Provider value={{ active: open, stop }}>
    {showCover && <section className="cinematic-entry"><h1>{title}</h1><button type="button" onClick={() => { setCoverDismissed(true); start(); }}>{english ? 'Open invitation' : 'បើកសំបុត្រអញ្ជើញ'}</button></section>}
    <div ref={content} tabIndex={-1} hidden={showCover || (open && stagePresentation?.royal)} data-cinematic-content>{children}</div>
    {open && (stagePresentation?.royal ? <section ref={inlineStage} tabIndex={-1} className="cinematic-inline-stage" aria-label={english ? 'Pre-wedding video' : 'វីដេអូមុនអាពាហ៍ពិពាហ៍'}>
      <CinematicVideoOpening stageOnly loadVideo={demoVideo ? undefined : loadVideo} videoUrl={demoVideo?.src} posterUrl={safeIntroMedia(demoVideo?.poster || configuration?.posterUrl)} presentation={stagePresentation} english={english} onOpen={finish} />
    </section> : <Modal isOpen onClose={finish} title={english ? 'Pre-wedding video' : 'វីដេអូមុនអាពាហ៍ពិពាហ៍'} closeLabel={english ? 'Skip video' : 'រំលងវីដេអូ'} size="full" className="cinematic-stage-dialog">
      <CinematicVideoOpening stageOnly loadVideo={demoVideo ? undefined : loadVideo} videoUrl={demoVideo?.src} posterUrl={safeIntroMedia(demoVideo?.poster || configuration?.posterUrl)} presentation={stagePresentation} english={english} onOpen={finish} />
    </Modal>)}
  </CinematicPlaybackContext.Provider></CinematicOpeningContext.Provider>;
}
