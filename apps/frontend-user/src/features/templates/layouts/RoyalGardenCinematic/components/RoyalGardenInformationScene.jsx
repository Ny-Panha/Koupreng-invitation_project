import { useEffect, useRef } from 'react';
import { ROYAL_ASSETS } from '../model/royalGardenPresentation';
import RoyalGardenMotionLayer from './RoyalGardenMotionLayer';
import RoyalGardenArtworkFrame from './RoyalGardenArtworkFrame';
import { useInvitationLocale } from '../../../shared/invitationLocaleContext';

export default function RoyalGardenInformationScene({ presentation, reduced, active = true, children }) {
  const root = useRef(null), scroll = useRef(null), info = presentation.information;
  const locale = useInvitationLocale();
  useEffect(() => {
    if (!active || !info.enabled || reduced || info.reveal === 'none' || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Content is visible before observation and stays visible if animation fails.
      entry.target.animate?.([{ opacity: .9, transform: info.reveal === 'rise' ? 'translateY(18px)' : 'none' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'ease-out' });
      observer.unobserve(entry.target);
    }), { root: scroll.current, threshold: .08 });
    root.current?.querySelectorAll('.rg-section').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [active, info.enabled, info.reveal, reduced]);
  return <div ref={root} className="rg-paper" data-royal={info.enabled} data-fixed={info.fixed} data-view={active ? 'information' : 'video'} data-reveal={info.reveal} style={{ '--rg-information-overlay': info.overlay, '--rg-panel-opacity': info.panelOpacity }}>
    {info.enabled && <>
      {info.background && info.background !== ROYAL_ASSETS.information && <img className="rg-information-custom-background" src={info.background} alt="" style={{ objectPosition: info.position }} />}
      <RoyalGardenArtworkFrame source={info.background ? ROYAL_ASSETS.information : ''} smallSource={ROYAL_ASSETS.informationSmall} variant="information" className="rg-information-background" fill={info.background === ROYAL_ASSETS.information} />
      {active && <RoyalGardenMotionLayer settings={presentation.motion} reduced={reduced} />}
    </>}
    {info.enabled ? <div ref={scroll} className="rg-content-scroll" tabIndex={active ? 0 : -1} aria-label={locale === 'EN' ? 'Invitation content' : 'ព័ត៌មានធៀបអញ្ជើញ'}>{children}{active && info.footer && <img className="rg-information-footer" src={ROYAL_ASSETS.footer} alt="" width="960" height="320" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />}</div> : children}
  </div>;
}
