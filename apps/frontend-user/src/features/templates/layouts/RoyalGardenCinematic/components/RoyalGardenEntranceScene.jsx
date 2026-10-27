import { useEffect, useRef, useState } from 'react';
import CoverBackground from '../../../shared/Openings/CoverBackground';
import { introArtwork, safeIntroMedia } from '../../../shared/cinematicIntro';
import { ROYAL_ASSETS } from '../model/royalGardenPresentation';
import RoyalGardenRoyalArch from './RoyalGardenRoyalArch';
import RoyalGardenGuestFrame from './RoyalGardenGuestFrame';
import RoyalGardenMotionLayer from './RoyalGardenMotionLayer';

export default function RoyalGardenEntranceScene({ content, intro, presentation, sequence, title, names, date, english, onOpen, onSkip, reduced }) {
  const root = useRef(null), [failedArtwork, setFailedArtwork] = useState('');
  const artwork = introArtwork(intro), hasArtwork = artwork && artwork !== failedArtwork;
  useEffect(() => setFailedArtwork(''), [artwork]);
  const opening = sequence.stage === 'COVER';
  useEffect(() => { if (!opening) root.current?.querySelector('.rg-entrance-skip')?.focus({ preventScroll: true }); }, [opening]);
  useEffect(() => {
    const coverVideo = root.current?.querySelector('video');
    if (sequence.hidden || sequence.stage === 'PRE_WEDDING_VIDEO') coverVideo?.pause();
    else coverVideo?.play().catch(() => {});
  }, [sequence.hidden, sequence.stage]);
  // CoverBackground remains the single resolver for owner cover image/video precedence.
  const photograph = safeIntroMedia(content.couplePhoto || content.coverImage || (!content.hasHostContent && content.mainImage));
  const defaultCover = { type: 'image', src: photograph || ROYAL_ASSETS.informationSmall };
  const entrance = presentation.entrance;
  const label = entrance.openButtonText ?? (english ? 'Open invitation' : 'បើកធៀបអញ្ជើញ');
  return <section ref={root} className="rg-intro rg-royal-entrance" data-scene={sequence.stage} data-style="royal-arch" data-animation={intro.animationPreset} data-reduced={reduced || undefined} data-paused={sequence.paused || sequence.hidden || sequence.stage === 'PRE_WEDDING_VIDEO'} aria-label={english ? 'Invitation opening' : 'ការបើកធៀបអញ្ជើញ'}>
    <div className="rg-entrance-stage" data-title-placement={entrance.titlePlacement} style={{ '--rg-cover-x': `${entrance.coverX}%`, '--rg-cover-y': `${entrance.coverY}%` }}>
      <div className="rg-entrance-photo"><CoverBackground content={content} templateDefault={defaultCover} /></div>
      <div className="rg-entrance-vignette" aria-hidden="true" />
      <RoyalGardenRoyalArch entrance={entrance} />
      <div className="rg-entrance-lettering" data-position={intro.artworkPosition} style={{ '--rg-artwork-scale': intro.artworkScale }}>
        {hasArtwork ? <><img src={artwork} srcSet={artwork === ROYAL_ASSETS.calligraphy ? `${ROYAL_ASSETS.calligraphySmall} 640w, ${artwork} 1100w` : undefined} sizes="(max-width: 600px) 65vw, 360px" width="1100" height="619" alt={intro.artworkAlt || (english ? 'Golden Khmer wedding calligraphy: Save the Date' : 'អក្សរផ្ចង់មង្គលការពណ៌មាស')} decoding="async" onError={() => setFailedArtwork(artwork)} /><h1 className="rg-sr-only">{title}</h1></> : <h1>{intro.heading ?? title}</h1>}
      </div>
      <div className="rg-entrance-names"><h2>{names}</h2><p>{date}</p></div>
      <RoyalGardenGuestFrame content={content} english={english} enabled={entrance.guestFrameEnabled} />
      <div className="rg-entrance-action"><button type="button" className="rg-open rg-royal-open" data-artwork={opening && entrance.buttonArtwork && !entrance.openButtonText} onClick={opening ? onOpen : onSkip} aria-label={opening ? label || (english ? 'Open invitation' : 'បើកធៀបអញ្ជើញ') : (english ? 'Continue to invitation' : 'បន្តទៅធៀបអញ្ជើញ')}>
        {opening ? label || (english ? 'Open invitation' : 'បើកធៀបអញ្ជើញ') : (english ? 'Continue to invitation' : 'បន្តទៅធៀបអញ្ជើញ')}
      </button></div>
      <RoyalGardenMotionLayer settings={presentation.motion} reduced={reduced} paused={sequence.paused || sequence.stage === 'PRE_WEDDING_VIDEO'} />
    </div>
    {!opening && <button className="rg-entrance-skip" type="button" onClick={onSkip}>{english ? 'Skip intro' : 'រំលង'}</button>}
  </section>;
}
