import { useState, useRef } from "react";
import { Music, VolumeX, MapPin, QrCode, Send, Copy, X } from "lucide-react";

/**
 * FloatingActionBar — Quick Actions Dock (Reels & TikTok Style)
 * Actions: Music (Vinyl Spin), Google Maps, ABA KHQR Gift, RSVP
 */
export default function FloatingActionBar({
  musicUrl,
  audioController,
  googleMapsUrl,
  bankAccount = {
    bank: "ABA Bank",
    accountNumber: "000 123 456",
    accountName: "VANDA & SREYPICHOfficial",
  },
  onRsvpClick,
  className = "",
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasMusicTrack = Boolean(musicUrl || audioController?.hasMusic);
  const isPlayingMusic = audioController ? audioController.playing : isPlaying;

  const toggleMusic = () => {
    if (audioController) {
      audioController.toggle();
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleCopyAccount = async () => {
    const text = bankAccount.accountNumber || "";
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch {}
    if (!success) {
      try {
        const input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand("copy");
        input.remove();
      } catch {}
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToRsvp = () => {
    if (onRsvpClick) {
      onRsvpClick();
      return;
    }
    const rsvpElem = document.querySelector("#rsvp-section") || document.querySelector('[data-tx-section="rsvp"]');
    if (rsvpElem) {
      rsvpElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {!audioController && musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="none" />}

      {/* Floating Action Dock */}
      <div
        className={`floating-action-bar fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 p-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)] ${className}`}
      >
        {/* 1. Music (Spinning Vinyl Record) */}
        {hasMusicTrack && (
          <button
            type="button"
            onClick={toggleMusic}
            title={isPlayingMusic ? "បិទភ្លេង" : "ចាក់ភ្លេង"}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isPlayingMusic
                ? "bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                : "bg-white/10 text-zinc-300 hover:bg-white/20"
            }`}
          >
            {isPlayingMusic ? (
              <Music className="w-5 h-5 animate-spin-slow" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>
        )}

        {/* 2. Google Maps */}
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="មើលទីតាំងលើ Google Maps"
            className="w-10 h-10 rounded-full bg-white/10 text-amber-300 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
          </a>
        )}

        {/* 3. ABA KHQR Gift */}
        <button
          type="button"
          onClick={() => setShowQrModal(true)}
          title="ចងដៃតាម ABA KHQR"
          className="w-10 h-10 rounded-full bg-white/10 text-amber-300 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* 4. RSVP Button */}
        <button
          type="button"
          onClick={scrollToRsvp}
          title="ឆ្លើយតបការចូលរួម (RSVP)"
          className="flex items-center gap-1.5 px-3.5 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md transition hover:brightness-110 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RSVP</span>
        </button>
      </div>

      {/* Gift QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setShowQrModal(false)}>
          <div className="relative w-full max-w-xs rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-5 w-5" />
            </div>

            <h4 className="text-base font-serif font-bold text-amber-200">
              ចងដៃតាម {bankAccount.bank || "KHQR"}
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              ស្កេនដើម្បីជូនពរ និងចងដៃដល់គូស្វាមីភរិយា
            </p>

            <div className="relative mx-auto w-40 h-40 rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center mb-4 overflow-hidden">
              {bankAccount.qrUrl ? (
                <img src={bankAccount.qrUrl} alt="QR Code" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full border-2 border-zinc-800 rounded-xl flex flex-col items-center justify-center p-2 text-slate-950 text-center">
                  <span className="text-[10px] font-bold text-red-600 tracking-wider">KHQR</span>
                  <span className="text-[9px] font-semibold text-zinc-800 mt-1">{bankAccount.accountName}</span>
                  <span className="text-[8px] text-zinc-500 mt-0.5 font-mono">{bankAccount.accountNumber}</span>
                  <div className="mt-2 text-xl">📱💳</div>
                </div>
              )}
            </div>

            <div className="space-y-1 mb-4 text-xs">
              <p className="text-zinc-300 font-medium">{bankAccount.accountName}</p>
              <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-sm">
                <span>{bankAccount.accountNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  title="ចម្លងលេខគណនី"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {copied && <p className="text-[10px] text-emerald-400">បានចម្លងរួចរាល់!</p>}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-zinc-200 transition"
            >
              បិទផ្ទាំង
            </button>
          </div>
        </div>
      )}
    </>
  );
}
