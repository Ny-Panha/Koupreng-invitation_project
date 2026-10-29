import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ClipboardList, Globe2, HeartHandshake, Images, MapPin, MessageCircleHeart, Music2, RotateCcw, VolumeX, CircleAlert, LoaderCircle } from 'lucide-react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { isTrustedPreviewMessage, postPreviewMessage, readEmbeddedPreviewChannel } from '@/shared/preview/previewMessaging';
import { InvitationLocaleContext } from '../../shared/invitationLocaleContext';
import { guestLocale } from '../../shared/localizedContent';
import ProgramTimeline from '../../shared/ProgramTimeline';
import { programDayAnchor, visibleProgramDays } from '../../shared/program';
import FamilyNames from '../../shared/FamilyNames';
import IllustratedMap from '../../shared/IllustratedMap';
import { safeDirections, usesFamilyLayout } from '../../shared/invitationFeatures';
import { formatEventDate, formatEventTime, formatNumerals, resolveEvent } from '../../shared/eventDateTime';
import { introSlides, normalizeIntro, safeIntroMedia } from '../../shared/cinematicIntro';
import { useCinematicOpening, useCinematicPlayback } from '../../shared/Openings/cinematicOpeningContext';
import RoyalGardenEntranceScene from './components/RoyalGardenEntranceScene';
import RoyalGardenInformationScene from './components/RoyalGardenInformationScene';
import RoyalGardenVideoScene from './components/RoyalGardenVideoScene';
import { ROYAL_ASSETS, royalGardenPresentation } from './model/royalGardenPresentation';
import RoyalGardenMonogram from './components/RoyalGardenMonogram';
import RoyalGardenCeremonialLetter from './components/RoyalGardenCeremonialLetter';
import RoyalGardenIntro from './components/RoyalGardenIntro';
import RoyalGallery from './components/RoyalGallery';
import RoyalGardenWeddingCalendar from './components/RoyalGardenWeddingCalendar';
import RoyalGardenDressCode from './components/RoyalGardenDressCode';
import RoyalGardenGifts from './components/RoyalGardenGifts';
import { hasRoyalDressCode, royalGiftItems } from './model/royalGardenGuestPresentation';
import useIntroSequence from './hooks/useIntroSequence';
import './royal-garden-cinematic.css';
import './royal-garden-scenes.css';
import './royal-garden-guest.css';
import './royal-garden-v33.css';

const ORDER = ['family', 'invitation', 'countdown', 'schedule', 'venue', 'dressCode', 'gallery', 'wishes', 'gift', 'rsvp', 'closing'];
const DEMO_PHOTOS = ['/templates/silk-heritage/portrait.webp', '/templates/silk-heritage/together.webp'];
const text = (...values) => values.find(value => typeof value === 'string') ?? '';
const color = value => /^#[a-f\d]{6}$/i.test(value || '') ? value : undefined;
const initial = value => typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(value.trim())][0]?.segment || '' : Array.from(value.trim())[0] || '';
function galleryOf(source) {
  return (Array.isArray(source) ? source : []).map((photo, index) => ({ id: photo?.id || `photo-${index}`, src: safeIntroMedia(typeof photo === 'string' ? photo : photo?.src || photo?.url || photo?.preview), alt: photo?.alt || `Wedding memory ${index + 1}` })).filter(photo => photo.src);
}
function Heading({ children }) { return <div className="rg-heading"><h2 lang={/[\u1780-\u17ff]/.test(String(children)) ? 'km' : undefined} style={/[\u1780-\u17ff]/.test(String(children)) ? { fontFamily: 'var(--rg-khmer-heading)' } : undefined}>{children}</h2><span className="rg-divider" aria-hidden="true" /></div>; }

export default function RoyalGardenCinematicLayout({ tpl = {}, content = {}, liveData, preview = false, previewStartClosed = false, previewChannel, previewGateCommand,
  showBack = true, backTo = '/templates', useTemplateLink, primaryCtaLabel = 'ប្រើគំរូនេះ', showActions = true, isHostedInvitation = false, children }) {
  const [sync, setSync] = useState(null);
  const base = useMemo(() => {
    const result = { ...tpl, ...content, ...liveData, ...sync };
    if (isHostedInvitation || result.hasHostContent || liveData || sync) result.isTemplateDemo = false;
    return result;
  }, [tpl, content, liveData, sync, isHostedInvitation]);
  const hosted = isHostedInvitation || base.hasHostContent;
  const [search, setSearch] = useSearchParams();
  const englishAvailable = !hosted || preview || !base.localizedContentV1 || guestLocale(base, 'en') === 'en';
  const english = englishAvailable && (search.get('lang') === 'en' || (search.get('lang') !== 'km' && String(base.languageMode).toLowerCase() === 'en'));
  const t = (km, en) => english ? en : km;
  const reduced = usePrefersReducedMotion();
  const intro = useMemo(() => normalizeIntro(base.cinematicIntro), [base.cinematicIntro]);
  const presentation = useMemo(() => royalGardenPresentation(base, { hosted }), [base, hosted]);
  const gallery = useMemo(() => galleryOf(base.photos ?? base.galleryImages ?? base.gallery ?? (hosted ? [] : DEMO_PHOTOS)), [base.photos, base.galleryImages, base.gallery, hosted]);
  const slides = useMemo(() => introSlides(intro, gallery), [intro, gallery]);
  const sequence = useIntroSequence({ preview, previewStartClosed, enabled: intro.enabled, reduced: reduced || intro.reducedMotion || navigator.connection?.saveData, duration: intro.duration, slideCount: slides.length });
  const { finish, restart } = sequence;
  const videoOpening = useCinematicOpening();
  const { active: videoActive, stop: stopVideo } = useCinematicPlayback();
  const audio = useRef(null), body = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [musicState, setMusicState] = useState('idle');
  const musicAttempt = useRef(0);
  const [active, setActive] = useState('invitation');
  const channel = useMemo(() => previewChannel || readEmbeddedPreviewChannel(), [previewChannel]);
  const music = base.enabledSections?.music === false ? '' : safeIntroMedia(text(base.musicUrl, base.bgMusicUrl, typeof base.music === 'string' ? base.music : base.music?.url));
  useEffect(() => {
    if (!channel) return;
    const message = event => {
      if (!isTrustedPreviewMessage(event, channel)) return;
      if (event.data.type === 'LIVE_PREVIEW_SYNC' && event.data.data) setSync(event.data.data);
      if (event.data.type === 'TOGGLE_GATE') (event.data.open ?? event.data.isOpen) ? finish() : restart();
      if (event.data.type === 'PREVIEW_SCENE') {
        event.data.data.scene === 'entrance' ? restart() : finish();
      }
      if (event.data.type === 'SCROLL_TO_SECTION') {
        const key = ({ calendar: 'countdown', map: 'venue', eventInfo: 'invitation', couplePhoto: 'gallery', cover: 'family' })[event.data.sectionKey] || event.data.sectionKey;
        if (ORDER.includes(key)) { stopVideo(); finish(); requestAnimationFrame(() => document.getElementById(`rg-${key}`)?.scrollIntoView({ behavior: 'auto' })); }
      }
    };
    window.addEventListener('message', message);
    postPreviewMessage({ type: 'PREVIEW_READY' }, channel);
    return () => window.removeEventListener('message', message);
  }, [channel, finish, restart, stopVideo]);
  useEffect(() => {
    if (!channel) return;
    postPreviewMessage({ type: 'PREVIEW_SCENE_STATE', data: { scene: videoActive ? 'video' : sequence.stage === 'CONTENT' ? 'information' : 'entrance' } }, channel);
    postPreviewMessage({ type: 'GATE_STATE_CHANGE', open: sequence.stage === 'CONTENT' }, channel);
  }, [channel, sequence.stage, videoActive]);
  useEffect(() => { if (typeof previewGateCommand?.open === 'boolean') previewGateCommand.open ? finish() : restart(); }, [previewGateCommand, finish, restart]);
  useEffect(() => { if (!intro.enabled) finish(); }, [intro.enabled, finish]);
  useEffect(() => { musicAttempt.current++; setPlaying(false); setMusicState('idle'); }, [music]);
  useEffect(() => {
    if (sequence.stage !== 'CONTENT' || videoActive) return;
    body.current?.focus({ preventScroll: true });
    body.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => { const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) setActive(visible.target.dataset.sectionKey); }, { root: body.current?.closest('.rg-content-scroll') || null, rootMargin: '-5% 0px -50% 0px' });
    body.current?.querySelectorAll('[data-section-key]').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [sequence.stage, videoActive, reduced]);
  const startMusic = () => {
    if (!music || !audio.current || !audio.current.paused) return;
    const attempt = ++musicAttempt.current;
    setMusicState('loading');
    // Called directly from the guest gesture, before any transition/POST loader.
    audio.current.play().then(() => {
      if (attempt !== musicAttempt.current) return;
      setPlaying(!audio.current.paused); setMusicState(audio.current.paused ? 'idle' : 'playing');
    }).catch(() => { if (attempt === musicAttempt.current) { setPlaying(false); setMusicState('blocked'); } });
  };
  const play = () => { if (!music || !audio.current) return; if (!audio.current.paused || musicState === 'loading') { musicAttempt.current++; audio.current.pause(); setPlaying(false); setMusicState('idle'); } else startMusic(); };
  const open = (replay = false) => {
    if (replay !== true && intro.music) startMusic();
    if (!(reduced || intro.reducedMotion || navigator.connection?.saveData)) {
      if (videoOpening?.(null, replay === true || !presentation.royal ? 0 : 900, { replay: replay === true || preview, presentation: { ...presentation.video, royal: true }, onStart: sequence.videoPlaying, onExit: sequence.exitVideo, onFinish: () => sequence.afterVideo(presentation.video.followUpPhotos) })) {
        sequence.prepareVideo(); return;
      }
    }
    if (presentation.royal) finish(); else sequence.start();
  };
  const skip = () => { stopVideo(); finish(); };
  const shellVisible = videoActive || ['VIDEO_PREPARING', 'PRE_WEDDING_VIDEO', 'VIDEO_EXITING', 'CONTENT'].includes(sequence.stage);
  const informationVisible = sequence.stage === 'CONTENT' && !videoActive;
  const groom = text(...(english && !hosted ? [base.groomEn] : []), base.groomName, base.groom, base.couple?.groom);
  const bride = text(...(english && !hosted ? [base.brideEn] : []), base.brideName, base.bride, base.couple?.bride);
  const names = [groom, bride].filter(Boolean).join(' & ');
  const event = resolveEvent(base);
  const digits = english ? 'latin' : (base.saveTheDate?.numerals || 'khmer');
  const date = formatEventDate(event.date, english, digits);
  const videoDate = date && `${date}${presentation.video.showTime && event.time ? ` · ${formatNumerals(event.time, digits)}` : ''}`;
  const monogram = text(base.monogramText, [initial(groom), initial(bride)].filter(Boolean).join(' · '));
  const title = !hosted && (english || /^royal.garden.cinematic$/i.test(base.title || '')) ? t('សិរីសួស្តីអាពាហ៍ពិពាហ៍', 'Wedding invitation') : text(base.invitationTitle, base.title, t('សិរីសួស្តីអាពាហ៍ពិពាហ៍', 'Wedding invitation'));
  const family = side => [base[`${side}Father`], base[`${side}Mother`]].some(value => value !== undefined)
    ? [base[`${side}Father`], base[`${side}Mother`]].filter(Boolean)
    : (Array.isArray(base.family?.[`${side}Parents`] ?? base[`${side}Parents`]) ? base.family?.[`${side}Parents`] ?? base[`${side}Parents`] : [base[`${side}Parents`]].filter(Boolean));
  const venueName = text(base.venueName, base.venue?.name), address = text(base.venueAddress, base.venue?.address);
  const directions = safeDirections(text(base.googleMapsUrl, base.googleMapUrl, base.venue?.mapLink));
  const mapImage = safeIntroMedia(text(base.sketchMapImage, base.venue?.sketchMapImage));
  const gift = royalGiftItems(base, Boolean((sync && Object.hasOwn(sync, 'khqrDollar')) || (liveData && Object.hasOwn(liveData, 'khqrDollar'))));
  const programDays = visibleProgramDays(base);
  const visible = key => {
    if (base.enabledSections?.[key] === false) return false;
    if (key === 'venue' && base.enabledSections?.map === false) return false;
    if (key === 'countdown') return base.saveTheDate?.enabled !== false;
    if (key === 'schedule') return programDays.length > 0;
    if (key === 'dressCode') return base.showDressCode !== false && base.enabledSections?.dressCode === true && hasRoyalDressCode(base);
    if (key === 'gallery') return gallery.length > 0;
    if (key === 'gift') return base.showGift !== false && gift.length > 0;
    if (key === 'venue') return Boolean(venueName || address || directions || mapImage || (base.illustratedMap?.enabled && base.illustratedMap?.nodes?.length));
    return true;
  };
  const goToProgramDay = id => {
    const node = document.getElementById(programDayAnchor('rg-program-day', id));
    node?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    node?.focus({ preventScroll: true }); setActive('schedule');
  };
  const order = [...new Set([...(base.sectionOrder || []).map(key => ({ calendar: 'countdown', map: 'venue' })[key] || key).filter(key => ORDER.includes(key)), ...ORDER])];
  const mapMode = ['sketch', 'embed', 'details', 'illustrated'].includes(base.venueMapMode) ? base.venueMapMode : 'auto';
  const illustratedVisible = ['auto','illustrated'].includes(mapMode) && base.illustratedMap?.enabled && base.illustratedMap?.nodes?.length > 0;
  const style = base.studioStyle || {};
  const font = (key, fallback) => base.elementFonts?.[key] ? { fontFamily: `${JSON.stringify(base.elementFonts[key])}, var(--rg-heading-font)` } : fallback;
  const palette = { '--rg-gold': color(style.accent || base.secondaryColor), '--rg-gold-dark': color(style.primary), '--rg-ink': color(style.text), '--rg-bg': color(style.background || base.backgroundColor), '--rg-border': color(style.border),
    '--rg-khmer-heading': base.fontKhmer ? `${JSON.stringify(base.fontKhmer)}, serif` : '"Moul", serif',
    '--rg-royal-gold': color(style.accent), '--rg-royal-white': color(style.text), '--rg-royal-muted': color(style.text), '--rg-royal-panel': color(style.background), '--rg-royal-border': color(style.border),
    '--rg-heading-font': (english ? base.fontLatin : base.fontKhmer) ? `${JSON.stringify(english ? base.fontLatin : base.fontKhmer)}, serif` : english ? '"Cormorant Garamond", Georgia, serif' : undefined, '--rg-body-font': style.bodyFont ? `${JSON.stringify(style.bodyFont)}, Battambang, serif` : undefined,
    '--rg-portrait-y': `${Math.max(0, Math.min(100, Number(style.portraitY ?? 50)))}%`,
    '--rg-message-size': ({ small: '15px', large: '21px' })[style.messageSize], '--rg-message-align': ['left', 'center', 'right'].includes(style.align) ? style.align : undefined,
    '--rg-pattern-opacity': Math.max(0, Math.min(1, Number(style.patternOpacity ?? .8))), '--rg-ornament-scale': Math.max(.6, Math.min(1.5, Number(style.ornamentScale ?? 1))),
    '--asset-background': safeIntroMedia(base.backgroundImage) ? `url(${JSON.stringify(safeIntroMedia(base.backgroundImage))})` : undefined,
    '--rg-environment-photo': `url(${JSON.stringify(safeIntroMedia(base.coverBackgroundImage || base.couplePhoto || base.coverImage || (!hosted ? base.mainImage : '')) || ROYAL_ASSETS.informationSmall)})` };
  const render = key => {
    if (!visible(key)) return null;
    let section;
    switch (key) {
      case 'family': section = <><Heading>{title}</Heading>{base.familyHeading && <p className="rg-family-heading">{english ? (base.familyHeadingEn || base.familyHeading) : base.familyHeading}</p>}{usesFamilyLayout(base) ? <FamilyNames content={base} /> : <div className="rg-family">{['groom', 'bride'].map(side => <div key={side}>{base.family?.[`${side}Title`] && <span className="rg-family-side">{base.family[`${side}Title`]}</span>}{family(side).map((name, i) => <p key={i}><strong>{name}</strong></p>)}</div>)}</div>}</>; break;
      case 'invitation': section = <><Heading>{text(base.messageTitle, t('យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ', 'Together with our families'))}</Heading>
        {base.isPersonalizedGuest && base.guestName && <p>{t('សូមគោរពជូនចំពោះ ', 'Dear ')}{base.guestName}</p>}
        <p className="rg-copy" style={font('message')}>{text(...(english && !hosted ? [base.messageEn] : []), base.messageText, base.message, base.blessingMessage)}</p>
        {presentation.information.enabled && <RoyalGardenMonogram settings={presentation.monogram} initials={monogram} />}
        <div className="rg-names" data-couple-layout={base.coupleLayout} style={font('couple')}><div><small>{t('កូនប្រុសនាម', 'Groom')}</small><strong>{groom}</strong></div><em aria-hidden="true">&</em><div><small>{t('កូនស្រីនាម', 'Bride')}</small><strong>{bride}</strong></div></div>
        {event.validDate && <div className="rg-date-display" style={font('date')}><p>{formatEventDate(event.date, english, digits, { day: undefined, year: undefined })}</p><div><span>{formatEventDate(event.date, english, digits, { weekday: 'long', year: undefined, month: undefined, day: undefined })}</span><strong>{formatNumerals(Number(event.date.slice(-2)), digits)}</strong><span>{formatEventTime(event.time, english, digits)}</span></div><p>{formatNumerals(event.date.slice(0, 4), digits)}</p></div>}
        <p className="rg-copy">{venueName}{address && <><br />{address}</>}</p></>; break;
      case 'countdown': section = <RoyalGardenWeddingCalendar content={base} days={programDays} english={english} onProgramDay={goToProgramDay} />; break;
      case 'schedule': section = <><Heading>{t('កម្មវិធីមង្គលការ', 'Wedding programme')}</Heading><div className="rg-program"><ProgramTimeline content={base} days={programDays} english={english} idPrefix="rg-program-day" naturalTime /></div>{base.scheduleEnding && <p>{english ? (base.scheduleEndingEn || base.scheduleEnding) : base.scheduleEnding}</p>}</>; break;
      case 'venue': section = <><Heading>{t('ទីតាំងកម្មវិធី', 'Venue & directions')}</Heading><p className="rg-copy">{venueName}<br />{address}</p>
        {illustratedVisible ? <IllustratedMap content={{ ...base, languageMode: english ? 'EN' : 'KH' }} /> : ['auto', 'sketch'].includes(mapMode) && mapImage ? <img className="rg-map-image" src={mapImage} alt={t('ផែនទីទីតាំងមង្គលការ', 'Wedding venue sketch map')} loading="lazy" /> : ['auto', 'embed'].includes(mapMode) && directions && (venueName || address) ? <iframe className="rg-map-image" title={t('ផែនទីទីតាំងកម្មវិធី', 'Wedding venue map')} loading="lazy" referrerPolicy="no-referrer" src={`https://maps.google.com/maps?q=${encodeURIComponent([venueName, address].filter(Boolean).join(' '))}&output=embed`} /> : !venueName && <p className="rg-muted"><MapPin aria-hidden="true" />{t('ទីតាំងនឹងត្រូវបានបញ្ជាក់។', 'Venue details will be confirmed.')}</p>}
        {directions && !illustratedVisible && <a className="rg-button" href={directions} target="_blank" rel="noopener noreferrer">{t('មើលទីតាំង Google Map', 'Open Google Maps')}</a>}</>; break;
      case 'gallery': section = <><Heading>{t('កម្រងរូបភាព', 'Our memories')}</Heading><RoyalGallery photos={gallery} english={english} /></>; break;
      case 'dressCode': section = <><Heading>{t('សម្លៀកបំពាក់ចូលរួមពិធី', 'Dress code')}</Heading><RoyalGardenDressCode content={base} english={english} /></>; break;
      case 'wishes': section = <><Heading>{t('សារជូនពរ', 'Wedding wishes')}</Heading><p className="rg-muted">{t('សូមផ្ញើពាក្យជូនពរជាមួយការបញ្ជាក់វត្តមានខាងក្រោម។ សារជូនពររបស់ភ្ញៀវជាព័ត៌មានឯកជន។', 'Send a personal wish with your RSVP below. Guest messages are private.')}</p></>; break;
      case 'gift': section = <><Heading>{t('ចំណងដៃសិរីមង្គល', 'Wedding gifts')}</Heading><RoyalGardenGifts items={gift} english={english} /></>; break;
      case 'rsvp': section = <><Heading>{t('សូមបញ្ជាក់វត្តមាន', 'RSVP')}</Heading>{children ? isValidElement(children) && typeof children.type !== 'string' ? cloneElement(children, { languageMode: english ? 'EN' : 'KH', showPublicWishes: false }) : children : <p className="rg-muted">{t('ការបញ្ជាក់វត្តមាននឹងបើកនៅពេលផ្សព្វផ្សាយធៀបការ។', 'RSVP will be available on your published invitation.')}</p>}</>; break;
      case 'closing': section = <>
        <RoyalGardenCeremonialLetter variant="thanks" title={text(english && !hosted ? base.thankYouTitleEn || undefined : undefined, base.thankYouTitle)} body={text(english && !hosted ? base.thankYouTextEn || undefined : undefined, base.thankYouText)} />
        <RoyalGardenCeremonialLetter variant="apology" title={text(english && !hosted ? base.apologyTitleEn || undefined : undefined, base.apologyTitle)} body={text(english && !hosted ? base.apologyTextEn || undefined : undefined, base.apologyText)} />
        <p className="rg-closing-names">{names}</p></>; break;
      default: return null;
    }
    return <section id={`rg-${key}`} data-section-key={key} className={`rg-section rg-section--${key}`} key={key}>{section}</section>;
  };
  const nav = [['countdown', CalendarDays, 'កាលបរិច្ឆេទ', 'Date'], ['venue', HeartHandshake, 'ទីតាំង', 'Venue'], ['gallery', Images, 'រូបភាព', 'Photos'], ['wishes', MessageCircleHeart, 'សារជូនពរ', 'Wishes'], ['schedule', ClipboardList, 'កម្មវិធី', 'Program']];
  return <InvitationLocaleContext.Provider value={english ? 'EN' : 'KH'}><div className="tpl-royal-garden" style={palette} data-stage={sequence.stage} data-video-active={videoActive} data-royal={presentation.royal || presentation.information.enabled || videoActive} data-motion={style.motion} data-decoration-paused={sequence.hidden || reduced || intro.reducedMotion || navigator.connection?.saveData || undefined} lang={english ? 'en' : 'km'}>
    <div className="rg-environment" aria-hidden="true" />
    {music && <audio ref={audio} src={music} loop preload="none" onPlaying={() => { setPlaying(true); setMusicState('playing'); }} onPause={() => { setPlaying(false); setMusicState('idle'); }} onError={() => { setPlaying(false); setMusicState('blocked'); }} />}
    <div className="rg-top-controls"><label className="rg-language"><Globe2 size={16} aria-hidden="true" /><span className="rg-sr-only">{t('ភាសាធៀប', 'Invitation language')}</span><select value={english ? 'en' : 'km'} onChange={e => setSearch(current => { current.set('lang', e.target.value); return current; }, { replace: true, preventScrollReset: true })}><option value="km">ខ្មែរ</option><option value="en" disabled={!englishAvailable}>English</option></select></label>
      {music && <button type="button" className="rg-music" data-playing={playing} data-state={musicState} onClick={play} aria-label={playing ? t('ផ្អាកតន្ត្រី', 'Pause music') : t('ចាក់តន្ត្រី', 'Play music')} title={playing ? t('ផ្អាកតន្ត្រី', 'Pause music') : t('ចាក់តន្ត្រី', 'Play music')} aria-pressed={playing} aria-busy={musicState === 'loading'}>{musicState === 'blocked' ? <CircleAlert aria-hidden="true" /> : musicState === 'loading' ? <LoaderCircle aria-hidden="true" /> : playing ? <Music2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button>}</div>
    {musicState === 'blocked' && <p className="rg-music-status rg-sr-only" role="status">{t('សូមចុចរូបតន្ត្រី ដើម្បីសាកល្បងចាក់ម្តងទៀត។', 'Tap Play music to try playback again.')}</p>}
    {(!shellVisible || sequence.stage === 'VIDEO_PREPARING') && (presentation.royal && !['PHOTO_SLIDESHOW', 'INVITATION_REVEAL'].includes(sequence.stage)
      ? <RoyalGardenEntranceScene sequence={sequence} intro={intro} presentation={presentation} content={base} title={title} names={names} date={date} english={english} onOpen={open} onSkip={skip} reduced={reduced || intro.reducedMotion || navigator.connection?.saveData} />
      : <RoyalGardenIntro sequence={sequence} intro={intro} slides={slides} content={base} title={title} names={names} date={date} english={english} onOpen={open} reducedMotion={reduced || intro.reducedMotion || navigator.connection?.saveData} />)}
    {shellVisible && <RoyalGardenInformationScene presentation={presentation} reduced={reduced || intro.reducedMotion} active={informationVisible}>
      {sequence.stage === 'VIDEO_PREPARING' && <div className="rg-video-preparing" role="status"><p>{t('សូមស្វាគមន៍', 'Welcome to our celebration')}</p></div>}
      <RoyalGardenVideoScene english={english} names={names} monogram={monogram} monogramSettings={presentation.monogram} presentation={presentation.video} date={videoDate} dateTime={event.date} onReplay={() => open(true)} />
      {informationVisible && <>
      {showBack && !preview && !hosted && <Link className="rg-back-link" to={backTo}><ArrowLeft size={16} />{t('គំរូសន្លឹកការ', 'All templates')}</Link>}
      <main ref={body} tabIndex={-1}>{order.map(render)}</main>
      <footer className="rg-footer">{presentation.information.brandStyle === 'logo' && <img src={ROYAL_ASSETS.brand} alt="" width="36" height="24" loading="lazy" />}<span>{t('បង្កើតដោយ Koupreng', 'Made with Koupreng')}</span>{preview && <button type="button" onClick={() => { stopVideo(); restart(); }}><RotateCcw size={16} />{t('មើលការបើកធៀប', 'Replay intro')}</button>}</footer>
      <nav className="rg-bottom-nav" aria-label={t('ផ្នែកធៀប', 'Invitation sections')}>{nav.filter(([key]) => visible(key)).map(([key, Icon, km, en]) => <button key={key} type="button" aria-current={active === key ? 'location' : undefined} onClick={() => { if (videoActive) skip(); setActive(key); requestAnimationFrame(() => document.getElementById(`rg-${key}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })); }}><Icon aria-hidden="true" /><span>{t(km, en)}</span></button>)}</nav>
      {showActions && useTemplateLink && !preview && !hosted && <Link className="rg-use-template" to={useTemplateLink}>{primaryCtaLabel}</Link>}
      </>}
    </RoyalGardenInformationScene>}
  </div></InvitationLocaleContext.Provider>;
}
