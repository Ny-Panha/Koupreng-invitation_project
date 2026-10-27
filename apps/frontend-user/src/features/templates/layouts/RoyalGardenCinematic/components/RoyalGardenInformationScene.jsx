import { useEffect, useRef } from 'react';
import { ROYAL_ASSETS } from '../model/royalGardenPresentation';
import RoyalGardenMotionLayer from './RoyalGardenMotionLayer';

export default function RoyalGardenInformationScene({ presentation, reduced, active = true, children }) {
  const root = useRef(null), info = presentation.information;
  useEffect(() => {
    if (!active || !info.enabled || reduced || info.reveal === 'none' || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Content is visible before observation and stays visible if animation fails.
      entry.target.animate?.([{ opacity: .9, transform: info.reveal === 'rise' ? 'translateY(18px)' : 'none' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'ease-out' });
      observer.unobserve(entry.target);
    }), { threshold: .08 });
    root.current?.querySelectorAll('.rg-section').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [active, info.enabled, info.reveal, reduced]);
  return <div ref={root} className="rg-paper" data-royal={info.enabled} data-reveal={info.reveal} style={{ '--rg-information-overlay': info.overlay, '--rg-panel-opacity': info.panelOpacity }}>
    {info.enabled && <>
      <div className="rg-information-background" data-fixed={info.fixed} style={{ '--asset-information': info.background ? `url(${JSON.stringify(info.background)})` : 'none', '--rg-information-position': info.position }} aria-hidden="true">
        {info.background && <img key={info.background} src={info.background} srcSet={info.background === ROYAL_ASSETS.information ? `${ROYAL_ASSETS.informationSmall} 640w, ${info.background} 1200w` : undefined} sizes="(max-width: 600px) 100vw, 680px" width="1200" height="2133" alt="" decoding="async" onError={event => { event.currentTarget.hidden = true; }} />}
      </div>
      {active && <RoyalGardenMotionLayer settings={presentation.motion} reduced={reduced} />}
    </>}
    {children}
    {info.enabled && info.footer && <img className="rg-information-footer" src={ROYAL_ASSETS.footer} alt="" width="960" height="320" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />}
  </div>;
}
