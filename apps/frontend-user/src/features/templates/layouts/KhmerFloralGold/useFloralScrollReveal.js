import { useEffect } from 'react';

/** Reveal each details section once; unsupported and motion-saving guests stay static. */
export default function useFloralScrollReveal(rootRef, enabled) {
  useEffect(() => {
    if (!enabled || !rootRef.current || typeof IntersectionObserver !== 'function'
      || window.matchMedia?.('(update: slow)').matches) return undefined;
    const sections = [...rootRef.current.querySelectorAll('.kfg-content > .kfg-section, .kfg-content > .kfg-footer')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.dataset.scrollReveal = 'visible';
        observer.unobserve(entry.target);
      }
    }, { threshold: .06, rootMargin: '0px 0px -5% 0px' });
    for (const section of sections) {
      section.dataset.scrollReveal = 'pending';
      observer.observe(section);
    }
    return () => {
      observer.disconnect();
      for (const section of sections) delete section.dataset.scrollReveal;
    };
  }, [rootRef, enabled]);
}
