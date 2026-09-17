import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX, SkipForward, Sparkles } from "lucide-react";

/**
 * CinematicVideoOpening — Fullscreen Pre-wedding Video Reveal
 * Plays pre-wedding video reel and transitions smoothly to wedding invitation.
 */
export default function CinematicVideoOpening({
  videoUrl,
  posterUrl = "/facebook/all/03-card/cover-card.jpg",
  groom = "កូនកំលោះ",
  bride = "កូនក្រមុំ",
  onOpen,
  state = "closed",
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isOpened, setIsOpened] = useState(state === "opened");

  useEffect(() => {
    if (state === "opened") {
      setIsOpened(true);
      setIsFadingOut(false);
    } else if (state === "closed") {
      setIsOpened(false);
      setIsFadingOut(false);
    }
  }, [state]);

  const handleStartPlay = () => {
    setHasStarted(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // The opening remains usable when autoplay is blocked.
      });
    }
  };

  const handleFinish = () => {
    if (isFadingOut || isOpened) return;
    setIsFadingOut(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      setIsOpened(true);
      if (onOpen) onOpen();
    }, 700);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  if (isOpened) return null;

  return (
    <div
      className={`cinematic-video-overlay absolute inset-0 z-50 flex items-center justify-center bg-black overflow-hidden transition-opacity duration-700 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Video Element */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          playsInline
          muted={isMuted}
          onEnded={handleFinish}
          onError={() => setHasStarted(false)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 pointer-events-none" />

      {/* Floating Header Toolbar */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between max-w-xl mx-auto pointer-events-auto">
        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-amber-200 font-serif flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{groom} &amp; {bride}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasStarted && videoUrl && (
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition"
              title={isMuted ? "បើកសំឡេង" : "បិទសំឡេង"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <span>រំលង (Skip)</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Play Interaction (Before Start) */}
      {!hasStarted && (
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <button
            type="button"
            onClick={handleStartPlay}
            className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.6)] transition-transform hover:scale-110 active:scale-95 cursor-pointer mb-6"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
          </button>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1 drop-shadow-md">
            វីដេអូបើកឆាកអាពាហ៍ពិពាហ៍
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/80 mb-6 font-serif">
            CINEMATIC PRE-WEDDING STORY
          </p>

          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium text-xs backdrop-blur-md transition shadow-md cursor-pointer"
          >
            ចូលមើលសំបុត្រអញ្ជើញផ្ទាល់ (Enter Invitation)
          </button>
        </div>
      )}

      {/* Bottom CTA while playing */}
      {hasStarted && (
        <div className="absolute bottom-8 inset-x-4 z-20 flex justify-center pointer-events-auto">
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-2xl hover:brightness-110 active:scale-95 transition"
          >
            បើកសំបុត្រអាពាហ៍ពិពាហ៍ (Open Invitation)
          </button>
        </div>
      )}
    </div>
  );
}
