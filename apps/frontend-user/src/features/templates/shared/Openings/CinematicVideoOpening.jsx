import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, SkipForward, Mail, Sparkles, ChevronRight, RotateCcw, Play, Pause } from "lucide-react";
import { useInvitationLocale } from '../invitationLocaleContext';
import "./CinematicVideoOpening.css";
import { postPreviewMessage } from "@/shared/preview/previewMessaging";

const resolveMediaSrc = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.url || val.src || val.videoUrl || val.poster || "";
  return "";
};

/**
 * CinematicVideoOpening — Fullscreen Pre-wedding Video Reveal
 * Flow: Plays video first, then pops up the invitation card ("show vdo hxx jam popup").
 */
function LegacyCinematicVideoOpening({
  content = {},
  videoUrl,
  posterUrl = "/invitations/khmer-celestial/burgundy-bokeh-poster.webp",
  groom = "កូនកំលោះ",
  bride = "កូនក្រមុំ",
  weddingTitle,
  guestLabel,
  guestName,
  subtitle,
  onOpen,
  state = "closed",
  preview = false,
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isOpened, setIsOpened] = useState(state === "opened");
  const isPreviewMode = Boolean(preview || content.preview);
  const [showPopup, setShowPopup] = useState(isPreviewMode);

  const rawVideo =
    videoUrl ||
    content.openingVideo ||
    content.openingVideoUrl ||
    content.videoUrl ||
    "/invitations/khmer-celestial/burgundy-bokeh.mp4";

  const effectiveVideoUrl =
    resolveMediaSrc(rawVideo) ||
    "/invitations/khmer-celestial/burgundy-bokeh.mp4";

  const rawPoster =
    posterUrl ||
    content.videoPoster ||
    content.coverImage ||
    "/invitations/khmer-celestial/burgundy-bokeh-poster.webp";

  const effectivePoster =
    resolveMediaSrc(rawPoster) ||
    "/invitations/khmer-celestial/burgundy-bokeh-poster.webp";

  const effectiveGroom =
    groom ||
    content.groomName ||
    content.groom ||
    "";

  const effectiveBride =
    bride ||
    content.brideName ||
    content.bride ||
    "";

  const effectiveTitle =
    weddingTitle ||
    content.weddingTitle ||
    content.invitationTitle ||
    content.title ||
    "សិរីសួស្តីអាពាហ៍ពិពាហ៍";

  const elementFonts = content.elementFonts || {};
  const globalKhmer = content.fontKhmer || "Siemreap";
  const fontCouple = elementFonts.couple || globalKhmer;
  const fontSubtitle = elementFonts.subtitle || globalKhmer;
  const fontGuestLabel = elementFonts.guestLabel || globalKhmer;
  const fontGuestName = elementFonts.guestName || globalKhmer;

  const effectiveGuestName = guestName || content.guestName || "លោកអ្នក និងក្រុមគ្រួសារ";
  const effectiveGuestLabel = guestLabel || content.guestLabel || (content.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "សូមគោរពអញ្ជើញ");
  const effectiveSubtitle = subtitle || content.subtitle || content.invitationSubtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ";
  const effectiveOpenButtonText =
    content.opening?.openButtonText ||
    content.openButtonText ||
    "បើកសំបុត្រអញ្ជើញ";

  const handleSelectElement = (elementId, e) => {
    if (!isPreviewMode) return;
    if (e) e.stopPropagation();
    if (typeof window !== "undefined" && window.parent && window.parent !== window) {
      postPreviewMessage({ type: "SELECT_TARGET_ELEMENT", elementId });
    }
  };

  // Trigger autoplay on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [effectiveVideoUrl]);

  // Fallback timer to show popup after video ends (~5.5 seconds)
  useEffect(() => {
    if (isPreviewMode) {
      setShowPopup(true);
      return;
    }
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5500);
    return () => clearTimeout(timer);
  }, [effectiveVideoUrl, isPreviewMode]);

  useEffect(() => {
    if (state === "opened") {
      setIsOpened(true);
      setIsFadingOut(false);
    } else if (state === "closed") {
      setIsOpened(false);
      setIsFadingOut(false);
    }
  }, [state]);

  const handleFinish = useCallback(() => {
    if (isFadingOut || isOpened) return;
    setIsFadingOut(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      setIsOpened(true);
      if (onOpen) onOpen();
    }, 700);
  }, [isFadingOut, isOpened, onOpen]);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    setShowPopup(true);
  };

  const handleOverlayClick = () => {
    if (!showPopup) {
      setShowPopup(true);
    }
  };

  const handleReplay = (e) => {
    e.stopPropagation();
    setShowPopup(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  if (isOpened) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className={`cinematic-video-overlay absolute inset-0 z-50 flex items-center justify-center bg-black overflow-hidden transition-opacity duration-700 cursor-pointer ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="លិខិតអញ្ជើញអាពាហ៍ពិពាហ៍"
    >
      {/* Fullscreen Video Engine */}
      {effectiveVideoUrl ? (
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          poster={effectivePoster}
          playsInline
          autoPlay
          preload="auto"
          muted={isMuted}
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${effectivePoster})` }}
        />
      )}

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

      {/* Top Floating Header Toolbar */}
      <header className="cinematic-header-toolbar" onClick={(e) => e.stopPropagation()}>
        {/* Left: Royal Couple Monogram Badge */}
        <div className="cinematic-couple-badge">
          <Sparkles className="cinematic-couple-badge-icon w-3.5 h-3.5" />
          <span style={{ fontFamily: `"${fontCouple}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>
            {effectiveGroom} &amp; {effectiveBride}
          </span>
        </div>

        {/* Right: Audio Toggle & Skip Button */}
        <div className="cinematic-top-actions">
          {effectiveVideoUrl && (
            <button
              type="button"
              onClick={toggleMute}
              className="cinematic-sound-btn"
              title={isMuted ? "បើកសំឡេង" : "បិទសំឡេង"}
              aria-label={isMuted ? "បើកសំឡេង" : "បិទសំឡេង"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleFinish}
            className="cinematic-skip-btn"
            aria-label="រំលង (Skip)"
          >
            <span>រំលង (Skip)</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Center Popup Modal ("show vdo hxx jam popup") */}
      <div
        className={`cinematic-popup-backdrop ${
          showPopup ? "is-visible" : "is-hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cinematic-popup-card">
          <div className="cinematic-popup-crest">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Wedding Title */}
          <h2
            className={`cinematic-hub-title ${isPreviewMode ? "kc-interactive-element" : ""}`}
            onClick={(e) => handleSelectElement("couple", e)}
            style={{ fontFamily: `"${fontCouple}", "Moul", "Bayon", serif` }}
          >
            {effectiveTitle}
          </h2>

          {/* Subtitle */}
          <p
            className={`cinematic-hub-subtitle ${isPreviewMode ? "kc-interactive-element" : ""}`}
            onClick={(e) => handleSelectElement("subtitle", e)}
            style={{ fontFamily: `"${fontSubtitle}", "Bayon", "Moul", "Siemreap", serif` }}
          >
            {effectiveSubtitle}
          </p>

          {/* Golden Hairline Divider */}
          <div className="cinematic-hub-divider" aria-hidden="true">
            <span className="cinematic-hub-kbach">❖</span>
          </div>

          <p
            className={`cinematic-popup-couple-name ${isPreviewMode ? "kc-interactive-element" : ""}`}
            onClick={(e) => handleSelectElement("couple", e)}
            style={{ fontFamily: `"${fontCouple}", "Moul", "Bayon", serif` }}
          >
            {effectiveGroom} &amp; {effectiveBride}
          </p>

          <div className="cinematic-popup-guest">
            <span
              className={`cinematic-guest-label ${isPreviewMode ? "kc-interactive-element" : ""}`}
              onClick={(e) => handleSelectElement("guestLabel", e)}
              style={{ fontFamily: `"${fontGuestLabel}", "Bayon", "Moul", "Siemreap", serif` }}
            >
              {effectiveGuestLabel}
            </span>
            <strong
              className={`cinematic-guest-name ${isPreviewMode ? "kc-interactive-element" : ""}`}
              onClick={(e) => handleSelectElement("guestName", e)}
              style={{ fontFamily: `"${fontGuestName}", "Bayon", "Moul", serif` }}
            >
              {effectiveGuestName}
            </strong>
          </div>

          <div className="cinematic-popup-actions">
            {/* Grand Gold Direct Enter Button */}
            <button
              type="button"
              onClick={handleFinish}
              className="cinematic-enter-direct-btn"
              aria-label={effectiveOpenButtonText}
            >
              <Mail className="cinematic-btn-icon" />
              <span>{effectiveOpenButtonText}</span>
              <ChevronRight className="cinematic-btn-icon opacity-80" />
            </button>

            {/* Replay Video Button */}
            <button
              type="button"
              onClick={handleReplay}
              className="cinematic-replay-btn"
              aria-label="ចាក់វីដេអូឡើងវិញ"
            >
              <RotateCcw className="cinematic-btn-icon-sm" />
              <span>ចាក់វីដេអូឡើងវិញ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Reuses the cinematic player for the optional, server-authorized post-cover stage.
function CinematicPlayback({ loadVideo, videoUrl, posterUrl, presentation, english = false, onOpen }) {
  const locale = useInvitationLocale();
  const video = useRef(null), onFinish = useRef(onOpen), recovery = useRef(null);
  const [source, setSource] = useState(videoUrl || "");
  const [muted, setMuted] = useState(presentation?.sound !== 'on'), [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("loading"), [progressValue, setProgressValue] = useState(0);
  useEffect(() => { onFinish.current = onOpen; }, [onOpen]);
  const royal = presentation?.royal === true;
  const copy = (en, kh) => (royal && ['EN', 'KH'].includes(locale) ? locale === 'EN' : english) ? en : kh;
  useEffect(() => {
    const controller = new AbortController();
    let url;
    if (loadVideo) loadVideo(controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob); setSource(url);
    }).catch(() => { if (!controller.signal.aborted) onFinish.current?.(); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [loadVideo]);
  useEffect(() => {
    const element = video.current;
    recovery.current = setTimeout(() => onFinish.current?.(), 15000);
    if (source && element) {
      element.defaultMuted = presentation?.sound !== 'on'; element.muted = presentation?.sound !== 'on';
      if (!document.hidden) element.play().catch(error => { clearTimeout(recovery.current); if (error?.name === 'AbortError' && element.paused) { setPaused(true); setStatus('ready'); } else setStatus('blocked'); });
    }
    return () => { clearTimeout(recovery.current); element?.pause(); };
  }, [source, presentation?.sound]);
  useEffect(() => {
    const element = video.current;
    let resumeOnVisible = Boolean(source && document.hidden);
    if (document.hidden) { element?.pause(); clearTimeout(recovery.current); }
    const visibility = () => {
      if (document.hidden) { resumeOnVisible = Boolean(element && !element.paused); element?.pause(); clearTimeout(recovery.current); }
      else if (resumeOnVisible) { resumeOnVisible = false; element?.play().catch(() => setStatus("blocked")); }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [source]);
  const progress = () => {
    setStatus("playing"); setPaused(Boolean(video.current?.paused)); clearTimeout(recovery.current);
    if (Number.isFinite(video.current?.duration) && video.current.duration > 0) setProgressValue(video.current.currentTime / video.current.duration);
    recovery.current = setTimeout(() => { if (!document.hidden && !video.current?.paused) onFinish.current?.(); }, 15000);
  };
  const togglePause = () => {
    if (video.current?.paused) video.current.play().then(() => setPaused(false)).catch(() => setStatus('blocked'));
    else { video.current?.pause(); clearTimeout(recovery.current); setPaused(true); }
  };
  if (royal) return <div className="cinematic-playback cinematic-playback--royal" data-footer={presentation.footer !== false} data-transition={presentation?.transition}>
    <div className="cinematic-film-frame"><video ref={video} src={source || undefined} poster={posterUrl || undefined} muted={muted} playsInline preload="metadata" style={{ objectFit: presentation.fit === 'cover' ? 'cover' : 'contain' }} aria-label={copy('Pre-wedding video', 'វីដេអូមុនអាពាហ៍ពិពាហ៍')} onPlaying={progress} onTimeUpdate={progress} onEnded={onOpen} onError={onOpen} onPause={() => setPaused(true)} /></div>
    <div className="cinematic-playback-actions"><button type="button" disabled={!source} onClick={() => setMuted(value => !value)} aria-pressed={!muted} aria-label={muted ? copy('Enable sound', 'បើកសំឡេង') : copy('Mute video', 'បិទសំឡេង')} title={muted ? copy('Enable sound', 'បើកសំឡេង') : copy('Mute video', 'បិទសំឡេង')}>{muted ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}</button><button type="button" onClick={onOpen} aria-label={copy('Skip video', 'រំលងវីដេអូ')} title={copy('Skip video', 'រំលងវីដេអូ')}><SkipForward size={19} aria-hidden="true" /></button></div>
    <div className="cinematic-film-controls"><button type="button" disabled={!source} onClick={togglePause} aria-label={paused ? copy('Play video', 'ចាក់វីដេអូ') : copy('Pause video', 'ផ្អាកវីដេអូ')} title={paused ? copy('Play video', 'ចាក់វីដេអូ') : copy('Pause video', 'ផ្អាកវីដេអូ')}>{paused ? <Play size={19} aria-hidden="true" /> : <Pause size={19} aria-hidden="true" />}</button>{presentation.replay && <button type="button" disabled={!source} aria-label={copy('Replay video', 'ចាក់វីដេអូឡើងវិញ')} title={copy('Replay video', 'ចាក់វីដេអូឡើងវិញ')} onClick={() => { if (video.current) { video.current.currentTime = 0; setProgressValue(0); video.current.play().catch(() => setStatus('blocked')); } }}><RotateCcw size={19} aria-hidden="true" /></button>}<button type="button" className="cinematic-continue" onClick={onOpen} aria-label={copy('Continue to invitation', 'បន្តទៅធៀបអញ្ជើញ')} title={copy('Continue to invitation', 'បន្តទៅធៀបអញ្ជើញ')}><ChevronRight size={20} aria-hidden="true" /></button></div>
    <progress className="cinematic-film-progress" max="1" value={progressValue} aria-label={copy('Video progress', 'ដំណើរការវីដេអូ')} />
    {['loading', 'blocked'].includes(status) && <p className="cinematic-film-status" role="status">{status === 'blocked' ? copy('Tap play, or continue to the invitation.', 'សូមចុចចាក់ ឬបន្តទៅធៀបអញ្ជើញ។') : copy('Preparing your film…', 'កំពុងរៀបចំវីដេអូ…')}</p>}
    {status === 'blocked' && <button className="cinematic-film-play" type="button" aria-label={copy('Play video', 'ចាក់វីដេអូ')} onClick={() => video.current?.play().catch(() => onFinish.current?.())}><Play size={28} aria-hidden="true" /></button>}
    {presentation.footer && <img className="cinematic-film-footer" src={presentation.footerSrc} alt="" width="960" height="320" onError={event => { event.currentTarget.hidden = true; }} />}
  </div>;
  return <div className={`cinematic-playback${royal ? ' cinematic-playback--royal' : ''}`} data-transition={presentation?.transition}>
    <div className="cinematic-playback-actions">
      <button type="button" disabled={!source} onClick={() => setMuted(value => !value)} aria-pressed={!muted}>{muted ? copy("Enable sound", "បើកសំឡេង") : copy("Mute video", "បិទសំឡេង")}</button>
      <button type="button" onClick={onOpen}>{copy("Skip video", "រំលងវីដេអូ")} <SkipForward size={18} aria-hidden="true" /></button>
    </div>
    <div className="cinematic-film-frame">
      <video ref={video} src={source || undefined} poster={posterUrl || undefined} muted={muted} playsInline preload="metadata"
        style={{ objectFit: presentation?.fit === 'cover' ? 'cover' : 'contain' }}
        aria-label={copy("Pre-wedding video", "វីដេអូមុនអាពាហ៍ពិពាហ៍")} onPlaying={progress} onTimeUpdate={progress} onEnded={onOpen} onError={onOpen} onPause={() => setPaused(true)} />
    </div>
    <div className="cinematic-film-controls">
      <button type="button" disabled={!source} onClick={togglePause}>{paused ? copy('Play video', 'ចាក់វីដេអូ') : copy('Pause video', 'ផ្អាកវីដេអូ')}</button>
      {royal && presentation.replay && <button type="button" disabled={!source} onClick={() => { if (video.current) { video.current.currentTime = 0; setProgressValue(0); video.current.play().catch(() => setStatus('blocked')); } }}><RotateCcw size={16} aria-hidden="true" />{copy('Replay video', 'ចាក់វីដេអូឡើងវិញ')}</button>}
      <progress max="1" value={progressValue} aria-label={copy('Video progress', 'ដំណើរការវីដេអូ')} />
    </div>
    <p role="status">{status === "loading" ? copy("Loading video… You can skip at any time.", "កំពុងផ្ទុកវីដេអូ… អ្នកអាចរំលងបានគ្រប់ពេល។") : status === "blocked" ? copy("Playback was blocked. Play the video or continue to the invitation.", "មិនអាចចាក់វីដេអូបាន។ សូមចាក់ ឬរំលងទៅធៀបអញ្ជើញ។") : ''}</p>
    {status === "blocked" && <button type="button" onClick={() => video.current?.play().catch(() => onFinish.current?.())}>{copy("Play video", "ចាក់វីដេអូ")}</button>}
    {royal && <button type="button" className="cinematic-continue" onClick={onOpen}>{copy('Continue to invitation', 'បន្តទៅធៀបអញ្ជើញ')} <ChevronRight size={16} aria-hidden="true" /></button>}
    {royal && presentation.footer && <img className="cinematic-film-footer" src={presentation.footerSrc} alt="" width="960" height="320" onError={event => { event.currentTarget.hidden = true; }} />}
  </div>;
}

export default function CinematicVideoOpening(props) {
  return props.stageOnly ? <CinematicPlayback {...props} /> : <LegacyCinematicVideoOpening {...props} />;
}
