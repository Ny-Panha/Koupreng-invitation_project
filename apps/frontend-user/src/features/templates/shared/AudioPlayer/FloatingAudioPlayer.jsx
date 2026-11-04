import { useEffect, useId } from "react";
import { LoaderCircle, Music, Pause } from "lucide-react";
import { useTemplateMusicController } from "../../experience/hooks/useTemplateMusicController";
import { useInvitationLocale } from "../invitationLocaleContext";
import "./FloatingAudioPlayer.css";

export default function FloatingAudioPlayer({
  src,
  autoPlay = false,
  className = "",
  position,
}) {
  const [audioRef, music] = useTemplateMusicController(src);
  const locale = useInvitationLocale();
  const statusId = useId();
  const english = String(locale).toLowerCase() === "en";
  const copy = (khmer, en) => english ? en : khmer;
  const { play, playing, status, toggle } = music;

  useEffect(() => {
    if (autoPlay && src) void play();
  }, [autoPlay, src, play]);

  if (!src) return null;

  const loading = status === "loading";
  const label = loading
    ? copy("បោះបង់ការផ្ទុកភ្លេង", "Cancel loading music")
    : playing ? copy("ផ្អាកភ្លេង", "Pause music") : copy("ចាក់ភ្លេង", "Play music");
  const message = status === "error"
    ? copy("មិនអាចចាក់ភ្លេងបានទេ។ ចុចប៊ូតុងដើម្បីសាកម្ដងទៀត។", "Music could not play. Tap the button to try again.")
    : loading ? copy("កំពុងផ្ទុកភ្លេង…", "Loading music…") : "";

  return (
    <div className="floating-audio-player" style={position}>
      <audio ref={audioRef} src={src} loop preload="none" />
      <p id={statusId} className="floating-audio-status" role="status" aria-atomic="true" hidden={!message}>
        {message}
      </p>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        aria-pressed={playing}
        aria-describedby={message ? statusId : undefined}
        data-music-status={status}
        className={`floating-audio-btn ${className}`.trim()}
      >
        {loading ? <LoaderCircle size={20} aria-hidden="true" /> : playing ? <Pause size={20} aria-hidden="true" /> : <Music size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}
