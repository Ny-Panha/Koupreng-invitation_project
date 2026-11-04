import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Globe2, Heart, Music2, Pause, X } from 'lucide-react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import Modal from '@/shared/ui/Modal';
import { isTrustedPreviewMessage, postPreviewMessage, readEmbeddedPreviewChannel } from '@/shared/preview/previewMessaging';
import { InvitationLocaleContext } from '../../shared/invitationLocaleContext';
import { normalizeTemplateViewModel } from '../../model/templateModel';
import FamilyNames from '../../shared/FamilyNames';
import ProgramTimeline from '../../shared/ProgramTimeline';
import { EventCalendar, WeddingCountdown, AddToCalendar } from '../../shared/SaveTheDate';
import { formatEventDate, formatEventTime, formatNumerals, resolveEvent } from '../../shared/eventDateTime';
import { visibleProgramDays } from '../../shared/program';
import { safeDirections } from '../../shared/invitationFeatures';
import { safeIntroMedia } from '../../shared/cinematicIntro';
import { useTemplateMusicController } from '../../experience/hooks/useTemplateMusicController';
import { floralColor, floralContent, floralInitials, floralLocales, floralPhotos, floralSections } from './floralModel';
import { FloralDivider, FloralMonogram, FloralPhoto } from './FloralArtwork';
import FloralGallery from './FloralGallery';
import './khmer-floral-gold.css';

function DemoRsvp({ english }) {
  const [response, setResponse] = useState('ATTENDING');
  const [message, setMessage] = useState('');
  return <form className="kfg-demo-rsvp" onSubmit={event => { event.preventDefault(); setMessage(english ? 'Preview only. Your response was not sent.' : 'នេះជាគំរូប៉ុណ្ណោះ។ ការឆ្លើយតបរបស់អ្នកមិនត្រូវបានផ្ញើទេ។'); }}>
    <p className="kfg-muted">{english ? 'Try this demonstration form. Responses are not saved.' : 'សាកល្បងទម្រង់គំរូនេះ។ ការឆ្លើយតបមិនត្រូវបានរក្សាទុកទេ។'}</p>
    <fieldset><legend>{english ? 'Will you attend?' : 'តើអ្នកអាចចូលរួមបានទេ?'}</legend><div className="kfg-attendance">{[['ATTENDING', 'ចូលរួម', 'Attending'], ['DECLINED', 'មិនចូលរួម', 'Not attending']].map(([value, km, en]) => <label key={value}><input type="radio" name="attendance" value={value} checked={response === value} onChange={() => setResponse(value)} /><span>{english ? en : km}</span></label>)}</div></fieldset>
    <label>{english ? 'Guest name' : 'ឈ្មោះភ្ញៀវ'}<input name="guestName" required maxLength={120} autoComplete="name" /></label>
    <button className="kfg-gold-button" type="submit">{english ? 'Try RSVP' : 'សាកល្បងឆ្លើយតប'}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}

export default function KhmerFloralGoldLayout({ content = {}, liveData, preview = false, previewStartClosed = false,
  previewChannel, previewGateCommand, isHostedInvitation = false, showBack = true, backTo = '/templates', useTemplateLink, showActions = true, children }) {
  const [params, setParams] = useSearchParams();
  const raw = useMemo(() => normalizeTemplateViewModel({}, { ...content, ...liveData,
    ...(liveData ? { localizedContentV1: liveData.localizedContentV1 || null } : {}),
    ...(liveData?.groomName !== undefined ? { groom: liveData.groomName } : {}),
    ...(liveData?.brideName !== undefined ? { bride: liveData.brideName } : {}),
    ...(liveData?.photos !== undefined ? { gallery: liveData.photos } : {}),
    ...(liveData?.musicUrl !== undefined ? { music: liveData.musicUrl } : {}),
  }), [content, liveData]);
  const hosted = isHostedInvitation || raw.hasHostContent || Boolean(liveData);
  const locales = floralLocales(raw, hosted);
  const [choice, setChoice] = useState(null);
  const wanted = choice?.source === raw.languageMode ? choice.value : params.get('lang') || (String(raw.languageMode).toLowerCase() === 'en' ? 'en' : 'km');
  const locale = locales.includes(wanted) ? wanted : locales[0];
  const vm = floralContent(raw, locale);
  const en = locale === 'en', t = (km, english) => en ? english : km;
  const [opened, setOpened] = useState(preview && !previewStartClosed);
  const openRef = useRef(opened), bodyRef = useRef(null), rootRef = useRef(null);
  const [mapOpen, setMapOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const event = resolveEvent(vm), numerals = vm.saveTheDate?.numerals || (en ? 'latin' : 'khmer');
  const days = visibleProgramDays(vm);
  const photos = floralPhotos(vm, en);
  const musicSource = raw.enabledSections?.music !== false ? safeIntroMedia(raw.musicUrl || raw.music) : '';
  const [audioRef, music] = useTemplateMusicController(musicSource);
  const { play, pause } = music;
  const channel = useMemo(() => previewChannel || readEmbeddedPreviewChannel(), [previewChannel]);
  const open = useCallback((gesture = false) => {
    if (openRef.current) return;
    openRef.current = true; setOpened(true);
    if (gesture && musicSource) void play();
    requestAnimationFrame(() => bodyRef.current?.focus({ preventScroll: true }));
  }, [play, musicSource]);

  useEffect(() => {
    if (!previewGateCommand) return;
    openRef.current = Boolean(previewGateCommand.open); setOpened(openRef.current);
    if (!openRef.current) pause();
  }, [previewGateCommand, pause]);
  useEffect(() => {
    if (!channel) return;
    postPreviewMessage({ type: 'PREVIEW_READY' }, channel);
    const message = event => {
      if (!isTrustedPreviewMessage(event, channel) || event.data.type !== 'SCROLL_TO_SECTION') return;
      const key = ({ venue: 'map', calendar: 'invitation', cover: 'family' })[event.data.sectionKey] || event.data.sectionKey;
      open(); requestAnimationFrame(() => rootRef.current?.querySelector(`[data-section-key="${CSS.escape(key || '')}"]`)?.scrollIntoView({ behavior: 'auto', block: 'start' }));
    };
    window.addEventListener('message', message); return () => window.removeEventListener('message', message);
  }, [channel, open]);
  const language = value => {
    setChoice({ source: raw.languageMode, value });
    if (!preview) { const next = new URLSearchParams(params); next.set('lang', value); setParams(next, { replace: true, preventScrollReset: true }); }
  };
  const venue = vm.venueName || vm.venue?.name || '', address = vm.venueAddress || vm.venue?.address || '';
  const directions = safeDirections(vm.googleMapUrl || vm.googleMapsUrl || vm.venue?.mapLink);
  const couplePhoto = safeIntroMedia(vm.backgroundImage || vm.coverImage);
  const headings = {
    invitation: t('សិរីមង្គលអាពាហ៍ពិពាហ៍', 'You are warmly invited'), family: t('យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ', 'Together with our families'),
    countdown: t('រាប់ថយក្រោយដល់ថ្ងៃមង្គល', 'Until our celebration'), schedule: t('របៀបវារៈកម្មវិធី', 'Wedding agenda'),
    map: t('ទីតាំងប្រារព្ធពិធី', 'Event location'), gallery: t('កម្រងរូបអនុស្សាវរីយ៍', 'Our photographs'), rsvp: t('សូមឆ្លើយតបការអញ្ជើញ', 'Will you join us?'),
  };
  const renderSection = key => {
    switch (key) {
      case 'invitation': return <><h2>{headings.invitation}</h2><FloralDivider /><p className="kfg-welcome">{vm.messageTitle || t('សូមគោរពអញ្ជើញ', 'With great joy')}</p><p>{vm.messageText}</p>{event.validDate ? (vm.saveTheDate?.enabled !== false && vm.saveTheDate?.showCalendar !== false && <EventCalendar date={event.date} english={en} numerals={numerals} navigation={vm.saveTheDate?.calendarNavigation} />) : <p className="kfg-muted">{t('កាលបរិច្ឆេទនឹងត្រូវបានបញ្ជាក់។', 'The date will be confirmed.')}</p>}</>;
      case 'family': return <><h2>{headings.family}</h2><FloralDivider /><FamilyNames content={{ ...vm, coupleMonogram: null }} /><p className="kfg-family-intro">{t('ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍របស់កូនប្រុស និងកូនស្រីរបស់យើងខ្ញុំ', 'To celebrate the marriage of our children')}</p><div className="kfg-portraits"><figure className="kfg-groom"><FloralPhoto src={vm.invitationImage} alt={vm.groom || t('រូបកូនកំលោះ', 'Groom portrait')} /><figcaption><span>{t('កូនកំលោះ', 'The groom')}</span><strong>{vm.groom}</strong></figcaption></figure><figure className="kfg-bride"><FloralPhoto src={vm.invitationImage2} alt={vm.bride || t('រូបកូនក្រមុំ', 'Bride portrait')} /><figcaption><span>{t('កូនក្រមុំ', 'The bride')}</span><strong>{vm.bride}</strong></figcaption></figure></div>{event.validDate && <div className="kfg-date-card"><span>{formatEventDate(event.date, en, numerals, { day: undefined, year: undefined })}</span><strong>{formatNumerals(Number(event.date.slice(-2)), numerals)}</strong><span>{formatEventDate(event.date, en, numerals, { weekday: 'long', month: undefined, year: undefined, day: undefined })}</span><small>{formatEventTime(event.time, en, numerals)}</small></div>}</>;
      case 'couplePhoto': return <div className="kfg-couple-photograph"><FloralPhoto src={couplePhoto} alt={t('រូបគូស្នេហ៍', 'Wedding couple portrait')} /></div>;
      case 'countdown': return <><h2>{vm.saveTheDate?.heading || headings.countdown}</h2>{vm.saveTheDate?.subtitle && <p>{vm.saveTheDate.subtitle}</p>}{vm.saveTheDate?.showCountdown === false ? null : event.instant !== null ? <WeddingCountdown instant={event.instant} english={en} numerals={numerals} /> : <p className="kfg-muted">{t('ម៉ោងកម្មវិធីនឹងត្រូវបានបញ្ជាក់។', 'The event time will be confirmed.')}</p>}{event.validDate && vm.saveTheDate?.showAddToCalendar !== false && <AddToCalendar content={vm} english={en} />}</>;
      case 'schedule': return <><h2>{headings.schedule}</h2><FloralDivider />{days.length ? <ProgramTimeline content={vm} english={en} days={days} naturalTime /> : <p className="kfg-muted">{t('កម្មវិធីលម្អិតនឹងត្រូវបានបញ្ជាក់។', 'The program will be announced soon.')}</p>}</>;
      case 'map': return <><h2>{headings.map}</h2><p className="kfg-venue-name">{venue || t('ទីតាំងនឹងត្រូវបានបញ្ជាក់។', 'Venue to be confirmed.')}</p>{address && <p>{address}</p>}{vm.sketchMapImage && <figure className="kfg-map"><button type="button" onClick={() => setMapOpen(true)} aria-label={t('មើលផែនទីធំ', 'View larger venue map')}><FloralPhoto src={vm.sketchMapImage} alt={t('គំនូសប្លង់ទីតាំងកម្មវិធី', 'Illustrative venue diagram')} /></button><figcaption>{t('គំនូសប្លង់ទីតាំងកម្មវិធី', 'Illustrative venue diagram')}</figcaption></figure>}{directions && <a className="kfg-gold-button" href={directions} target="_blank" rel="noopener noreferrer">{t('មើលទីតាំងក្នុង Google Maps', 'View in Google Maps')}</a>}</>;
      case 'gallery': return <><h2>{headings.gallery}</h2><FloralDivider /><FloralGallery photos={photos} english={en} /></>;
      case 'closing': return <><h2>{vm.thankYouTitle || t('សូមថ្លែងអំណរគុណ', 'With our sincere thanks')}</h2><p>{vm.thankYouText || t('វត្តមានរបស់លោកអ្នក គឺជាកិត្តិយសសម្រាប់យើងខ្ញុំ។', 'Your presence would be an honor to us.')}</p>{vm.apologyText && <div className="kfg-apology"><FloralDivider /><h3>{vm.apologyTitle || t('លិខិតសូមអភ័យទោស', 'A personal invitation')}</h3><p>{vm.apologyText}</p></div>}</>;
      case 'rsvp': return <><h2>{headings.rsvp}</h2><FloralDivider />{children ? Children.map(children, child => isValidElement(child) ? cloneElement(child, { languageMode: en ? 'EN' : 'KH', appearance: 'floral' }) : child) : hosted ? <p className="kfg-muted">{t('សូមទាក់ទងម្ចាស់កម្មវិធី ដើម្បីបញ្ជាក់ការចូលរួម។', 'Please contact your hosts to confirm your attendance.')}</p> : <DemoRsvp english={en} />}</>;
      default: return null;
    }
  };
  return <InvitationLocaleContext value={locale}><div ref={rootRef} className={`kfg-invitation${preview ? ' kfg-preview' : ''}${opened ? ' is-open' : ''}`} lang={locale} data-template-renderer="khmer-floral-gold" data-reduced-motion={reduced}
    style={{ '--kfg-gold': floralColor(vm.frontColor || vm.primaryColor), '--kfg-paper': floralColor(vm.backgroundColor), '--kfg-heading-font': vm.fontKhmer ? `${JSON.stringify(vm.fontKhmer)}, var(--kfg-display)` : undefined, '--kfg-latin-font': vm.fontLatin ? `${JSON.stringify(vm.fontLatin)}, serif` : undefined }}>
    <div className="kfg-paper-art" aria-hidden="true" /><div className="kfg-petals" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--petal': i }} />)}</div>
    {wanted === 'en' && !locales.includes('en') && <p className="kfg-locale-notice" role="status" lang="en">English is not published for this invitation. Showing Khmer.</p>}
    <div className="kfg-toolbar"><label className="kfg-language"><Globe2 size={16} aria-hidden="true" /><span className="kfg-sr-only">{t('ភាសាធៀប', 'Invitation language')}</span><select value={locale} onChange={event => language(event.target.value)}>{locales.includes('km') && <option value="km">ខ្មែរ</option>}{locales.includes('en') && <option value="en">English</option>}</select><ChevronDown size={14} aria-hidden="true" /></label>
      {musicSource && <button type="button" className="kfg-music" onClick={music.toggle} aria-pressed={music.playing} aria-label={music.playing ? t('ផ្អាកភ្លេង', 'Pause music') : t('ចាក់ភ្លេង', 'Play music')}>{music.playing ? <Pause size={18} aria-hidden="true" /> : <Music2 size={18} aria-hidden="true" />}</button>}</div>
    {musicSource && <audio ref={audioRef} src={musicSource} loop preload="none" />}{music.status === 'error' && <p className="kfg-audio-error" role="status">{t('មិនអាចចាក់ភ្លេងបានទេ។ សូមចុចរូបតន្ត្រីដើម្បីសាកម្ដងទៀត។', 'Music could not play. Use the music button to try again.')}</p>}
    {!opened ? <section className="kfg-opening" aria-label={t('សំបុត្រអញ្ជើញ', 'Wedding invitation cover')}><FloralMonogram text={floralInitials(vm)} /><h1>{vm.title || t('សិរីមង្គលអាពាហ៍ពិពាហ៍', 'Wedding invitation')}</h1><div className="kfg-guest"><p>{vm.subtitle || t('សូមគោរពអញ្ជើញ', 'Warmly inviting')}</p><div>{vm.isPersonalizedGuest ? vm.guestName : t('លោកអ្នក និងក្រុមគ្រួសារ', 'You and your family')}</div></div><button type="button" className="kfg-gold-button kfg-open" onClick={() => open(true)}><Heart size={17} aria-hidden="true" />{t('សូមចុចដើម្បីបើកសំបុត្រ', 'Open our invitation')}</button></section>
      : <main ref={bodyRef} className="kfg-content" tabIndex={-1} aria-label={t('ព័ត៌មានអាពាហ៍ពិពាហ៍', 'Wedding details')}><h1 className="kfg-sr-only">{vm.title || t('សិរីមង្គលអាពាហ៍ពិពាហ៍', 'Wedding invitation')}</h1>{floralSections(vm).map(key => <section key={key} className={`kfg-section kfg-${key === 'invitation' ? 'welcome-section' : key}`} data-section-key={key} data-tx-section={key === 'map' ? 'venue' : key}>{renderSection(key)}</section>)}<footer className="kfg-footer"><FloralDivider /><span>{vm.groom} &amp; {vm.bride}</span><Link to="/">Koupreng</Link>{!hosted && <small>{t('រូបភាពគំរូ៖ Hanuman Photo Studio / Pexels', 'Demo photography: Hanuman Photo Studio / Pexels')}</small>}</footer></main>}
    {!hosted && showActions && <div className="kfg-demo-actions">{showBack && <Link to={backTo}><ArrowLeft size={16} aria-hidden="true" />{t('ត្រឡប់ទៅគំរូ', 'Back to templates')}</Link>}{useTemplateLink && <Link to={useTemplateLink}>{t('ប្រើគំរូឥតគិតថ្លៃនេះ', 'Use this free template')}</Link>}</div>}
    <Modal isOpen={mapOpen} onClose={() => setMapOpen(false)} showHeader={false} size="lg" className="kfg-map-dialog" ariaLabel={t('គំនូសប្លង់ទីតាំង', 'Venue diagram')}><button type="button" className="kfg-map-close" onClick={() => setMapOpen(false)} aria-label={t('បិទផែនទី', 'Close map')}><X aria-hidden="true" /></button><FloralPhoto src={vm.sketchMapImage} alt={t('គំនូសប្លង់ទីតាំងកម្មវិធី', 'Illustrative venue diagram')} /></Modal>
  </div></InvitationLocaleContext>;
}
