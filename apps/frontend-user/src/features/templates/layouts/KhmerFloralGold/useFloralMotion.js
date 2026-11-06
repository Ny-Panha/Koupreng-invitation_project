import { useEffect, useRef } from 'react';
import { stagger, useAnimate } from 'framer-motion';

const effects = ['paper-depth', 'garden-stagger', 'frame-arrival', 'name-cascade', 'heading-rise', 'guest-arrival', 'open-arrival', 'welcome-cascade', 'details-stagger', 'control-feedback'];
const ease = [.22, 1, .36, 1];

/** Finite scene choreography and one-time scroll reveals; no React frame loop. */
export default function useFloralMotion(rootRef, phase, enabled, preset) {
  const [, animate] = useAnimate();
  const played = useRef(new Set()), revealed = useRef(new WeakSet());
  useEffect(() => {
    const root = rootRef.current;
    const playedPhases = played.current;
    root?.querySelectorAll('.kfg-cover-side').forEach(element => { element.style.opacity = '1'; });
    if (!enabled || !root || typeof root.animate !== 'function'
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const controls = new Set(), baseline = new Map();
    let active = true, entryFinished = false;
    const factor = preset === 'subtle' ? .75 : preset === 'cinematic' ? 1.15 : 1;
    const run = (targets, keyframes, options = {}) => {
      const elements = (Array.isArray(targets) ? targets : [...root.querySelectorAll(targets)]).filter(element => element?.isConnected && getComputedStyle(element).display !== 'none');
      if (!elements.length) return null;
      elements.forEach(element => {
        if (!baseline.has(element)) baseline.set(element, { opacity: element.style.opacity, transform: element.style.transform });
      });
      const control = animate(elements, keyframes, { duration: .8 * factor, ease, ...options });
      controls.add(control);
      control.finished.then(() => controls.delete(control), () => controls.delete(control));
      return control;
    };
    root.dataset.motionEffects = String(effects.length);
    root.dataset.motionStage = phase;
    root.dataset.motionSettled = 'false';
    if (!playedPhases.has(phase)) {
      playedPhases.add(phase);
      if (phase === 'closed') {
        run('.kfg-paper-art', { scale: [1.01, 1] }, { duration: 1.05 });
        run('.kfg-cover-side', { opacity: [.9, 1] }, { delay: stagger(.08), duration: .9 });
        run('.kfg-cover-emblem', { y: [12, 0], scale: [.96, 1] }, { duration: 1.05 });
        run('.kfg-monogram-staircase > span', { y: [4, 0] }, { delay: stagger(.1, { startDelay: .1 }), duration: .7 });
        run('.kfg-opening > h1', { y: [8, 0] }, { delay: .1 });
        run('.kfg-guest,.kfg-cover-details', { y: [6, 0] }, { delay: stagger(.08,{startDelay:.18}) });
        run('.kfg-open', { y: [4, 0], scale: [.99, 1] }, { delay: .26, duration: .7 });
      } else if (phase === 'welcome') {
        run('.kfg-welcome-scene > :is(h2,p,.kfg-divider,.kp-date-presentation,.kfg-continue)', { opacity: [.95, 1], y: [6, 0] }, { delay: stagger(.06), duration: .7 });
      }
    }
    const reveal = () => root.querySelectorAll('.kfg-content > [data-scroll-reveal=visible]').forEach(section => {
      if (revealed.current.has(section)) return;
      revealed.current.add(section);
      const children = [...section.children].filter(element => element.getAttribute('aria-hidden') !== 'true');
      run(children, { opacity: [.95, 1], y: [8, 0] }, { delay: stagger(.065), duration: .75 });
    });
    const observer = phase === 'content' && typeof MutationObserver === 'function' ? new MutationObserver(reveal) : null;
    observer?.observe(root, { attributes: true, subtree: true, attributeFilter: ['data-scroll-reveal'] });
    if (phase === 'content') reveal();
    let deadline;
    const settle = () => { if (entryFinished) return; entryFinished = true; clearTimeout(deadline); if (active) root.dataset.motionSettled = 'true'; };
    const entrance = [...controls];
    deadline = window.setTimeout(() => { entrance.forEach(control => control.complete()); settle(); }, 1600);
    Promise.all(entrance.map(control => control.finished)).then(settle, settle);

    const feedback = event => {
      const button = event.target.closest?.('button,a.kfg-gold-button');
      if (!button || !root.contains(button) || button.matches(':disabled') || button.closest('.kfg-lightbox')) return;
      if (event.relatedTarget instanceof Node && button.contains(event.relatedTarget)) return;
      const entering = event.type === 'pointerover' || event.type === 'focusin';
      const pressing = event.type === 'pointerdown';
      run([button], { scale: pressing ? .97 : entering ? 1.015 : 1, y: entering ? -2 : 0 }, { duration: pressing ? .12 : .22 });
    };
    const events = ['pointerover', 'pointerout', 'pointerdown', 'pointerup', 'focusin', 'focusout'];
    events.forEach(event => root.addEventListener(event, feedback));
    return () => {
      active = false;
      clearTimeout(deadline);
      if (!entryFinished) playedPhases.delete(phase);
      observer?.disconnect();
      events.forEach(event => root.removeEventListener(event, feedback));
      controls.forEach(control => { control.complete(); control.stop(); });
      baseline.forEach((styles, element) => {
        for (const [property, value] of Object.entries(styles)) {
          if (value) element.style[property] = value;
          else element.style.removeProperty(property);
        }
      });
      delete root.dataset.motionEffects;
      delete root.dataset.motionStage;
      delete root.dataset.motionSettled;
    };
  }, [rootRef, phase, enabled, preset, animate]);
}
