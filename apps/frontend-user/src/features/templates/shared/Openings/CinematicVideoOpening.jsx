import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, SkipForward, Mail, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import "./CinematicVideoOpening.css";

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
export default function CinematicVideoOpening({
  content = {},
  videoUrl,
  posterUrl = "/invitations/khmer-celestial/burgundy-bokeh-poster.webp",
  groom = "កូនកំលោះ",
  bride = "កូនក្រមុំ",
  weddingTitle,
  onOpen,
  state = "closed",
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isOpened, setIsOpened] = useState(state === "opened");
  const [showPopup, setShowPopup] = useState(false);

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
    "ជា វណ្ណដា";

  const effectiveBride =
    bride ||
    content.brideName ||
    content.bride ||
    "សុខ ស្រីពេជ្រ";

  const effectiveTitle =
    weddingTitle ||
    content.weddingTitle ||
    content.invitationTitle ||
    "វីដេអូបើកឆាកអាពាហ៍ពិពាហ៍";

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
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5500);
    return () => clearTimeout(timer);
  }, [effectiveVideoUrl]);

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
          <span>
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
                <VolumeX className="w-4 h-4 text-amber-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
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
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>

          {/* Wedding Title: វីដេអូបើកឆាកអាពាហ៍ពិពាហ៍ in Moul Font */}
          <h2 className="cinematic-hub-title">វីដេអូបើកឆាកអាពាហ៍ពិពាហ៍</h2>

          {/* Subtitle: ✧ CINEMATIC PRE-WEDDING STORY ✧ */}
          <p className="cinematic-hub-subtitle">
            ✧ CINEMATIC PRE-WEDDING STORY ✧
          </p>

          {/* Golden Hairline Divider */}
          <div className="cinematic-hub-divider" aria-hidden="true">
            <span className="cinematic-hub-kbach">❖</span>
          </div>

          <p className="cinematic-popup-couple-name">
            {effectiveGroom} &amp; {effectiveBride}
          </p>

          <div className="cinematic-popup-actions">
            {/* Grand Gold Direct Enter Button */}
            <button
              type="button"
              onClick={handleFinish}
              className="cinematic-enter-direct-btn"
              aria-label="ចូលមើលសំបុត្រអញ្ជើញផ្ទាល់"
            >
              <Mail className="w-4 h-4 text-amber-300" />
              <span>ចូលមើលសំបុត្រអញ្ជើញផ្ទាល់ (Enter Invitation)</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-300/80" />
            </button>

            {/* Replay Video Button */}
            <button
              type="button"
              onClick={handleReplay}
              className="cinematic-replay-btn"
              aria-label="ចាក់វីដេអូឡើងវិញ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ចាក់វីដេអូឡើងវិញ (Replay)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
