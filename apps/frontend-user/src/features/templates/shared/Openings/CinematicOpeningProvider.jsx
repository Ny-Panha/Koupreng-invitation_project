import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from '@/shared/ui';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import CinematicVideoOpening from './CinematicVideoOpening';
import { CinematicOpeningContext } from './cinematicOpeningContext';

export default function CinematicOpeningProvider({ configuration, loadVideo, english, fallbackCover, title, children }) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [coverDismissed, setCoverDismissed] = useState(false);
  const started = useRef(false), timer = useRef(null), resume = useRef(null), content = useRef(null);
  const enabled = configuration?.enabled === true && Boolean(configuration.videoMediaId) && typeof loadVideo === 'function';
  const start = useCallback((resumeMusic, delay = 0) => {
    if (!enabled || reduced || started.current) return false;
    started.current = true;
    resume.current = resumeMusic;
    timer.current = window.setTimeout(() => setOpen(true), delay);
    return true;
  }, [enabled, reduced]);
  const finish = useCallback(() => {
    setOpen(false);
    const restoreMusic = resume.current;
    resume.current = null;
    restoreMusic?.();
    requestAnimationFrame(() => content.current?.focus({ preventScroll: true }));
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const showCover = enabled && !reduced && fallbackCover && !coverDismissed;
  return <CinematicOpeningContext.Provider value={start}>
    {showCover && <section className="cinematic-entry"><h1>{title}</h1><button type="button" onClick={() => { setCoverDismissed(true); start(); }}>{english ? 'Open invitation' : 'បើកសំបុត្រអញ្ជើញ'}</button></section>}
    <div ref={content} tabIndex={-1} hidden={showCover} data-cinematic-content>{children}</div>
    {open && <Modal isOpen onClose={finish} title={english ? 'Pre-wedding video' : 'វីដេអូមុនអាពាហ៍ពិពាហ៍'} closeLabel={english ? 'Skip video' : 'រំលងវីដេអូ'} size="full" className="cinematic-stage-dialog">
      <CinematicVideoOpening stageOnly loadVideo={loadVideo} posterUrl={configuration.posterUrl} english={english} onOpen={finish} />
    </Modal>}
  </CinematicOpeningContext.Provider>;
}
