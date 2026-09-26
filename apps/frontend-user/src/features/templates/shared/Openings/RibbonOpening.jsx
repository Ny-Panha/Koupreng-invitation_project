import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

/**
 * RibbonOpening — Silk Ribbon Untie Interaction (ស្រាយខ្សែបូសូត្រ 3D)
 * Highly popular in Facebook Reels & Instagram Wedding Invitations.
 */
export default function RibbonOpening({
  groom = "កូនកំលោះ",
  bride = "កូនក្រមុំ",
  ribbonColor = "#D4AF37", // Gold luxury silk
  ribbonColor2 = "#B8860B",
  onOpen,
  state = "closed",
}) {
  const [isUntying, setIsUntying] = useState(false);
  const [isOpened, setIsOpened] = useState(state === "opened");

  useEffect(() => {
    if (state === "opened") {
      setIsOpened(true);
      setIsUntying(false);
    } else if (state === "closed") {
      setIsOpened(false);
      setIsUntying(false);
    }
  }, [state]);

  const handleUntie = () => {
    if (isUntying || isOpened) return;
    setIsUntying(true);

    setTimeout(() => {
      setIsOpened(true);
      if (onOpen) onOpen();
    }, 950);
  };

  if (isOpened) return null;

  return (
    <div
      className={`ribbon-opening-overlay absolute inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        isUntying ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundColor: "rgba(10, 8, 12, 0.94)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(212,175,55,0.18) 0%, rgba(0,0,0,0.8) 75%)",
        }}
      />

      {/* Vertical Ribbon Band */}
      <div
        className="absolute inset-y-0 w-14 sm:w-16 shadow-2xl transition-transform duration-700 ease-in-out pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${ribbonColor2} 0%, ${ribbonColor} 50%, ${ribbonColor2} 100%)`,
          boxShadow: "0 0 30px rgba(0,0,0,0.8), inset 0 0 8px rgba(255,255,255,0.3)",
          transform: isUntying ? "scaleY(0)" : "scaleY(1)",
          transformOrigin: "center",
        }}
      >
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/30" />
      </div>

      {/* Horizontal Ribbon Band */}
      <div
        className="absolute inset-x-0 h-14 sm:h-16 shadow-2xl transition-transform duration-700 ease-in-out pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${ribbonColor2} 0%, ${ribbonColor} 50%, ${ribbonColor2} 100%)`,
          boxShadow: "0 0 30px rgba(0,0,0,0.8), inset 0 0 8px rgba(255,255,255,0.3)",
          transform: isUntying ? "scaleX(0)" : "scaleX(1)",
          transformOrigin: "center",
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/30" />
      </div>

      {/* Center Silk Bow & Rosette */}
      <div
        className={`relative z-20 flex flex-col items-center justify-center transition-all duration-700 ease-out cursor-pointer select-none ${
          isUntying ? "scale-125 opacity-0 -rotate-12" : "scale-100 opacity-100 hover:scale-105"
        }`}
        onClick={handleUntie}
      >
        {/* Left Bow Loop */}
        <div
          className="absolute -left-12 sm:-left-16 w-14 sm:w-18 h-10 sm:h-12 rounded-full border-2 border-amber-200/40 shadow-lg pointer-events-none -rotate-25"
          style={{
            background: `radial-gradient(ellipse at center, ${ribbonColor} 0%, ${ribbonColor2} 100%)`,
          }}
        />

        {/* Right Bow Loop */}
        <div
          className="absolute -right-12 sm:-right-16 w-14 sm:w-18 h-10 sm:h-12 rounded-full border-2 border-amber-200/40 shadow-lg pointer-events-none rotate-25"
          style={{
            background: `radial-gradient(ellipse at center, ${ribbonColor} 0%, ${ribbonColor2} 100%)`,
          }}
        />

        {/* Center Rosette / Seal */}
        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-300 shadow-[0_0_35px_rgba(212,175,55,0.6)] flex flex-col items-center justify-center p-2 text-center"
          style={{
            background: `linear-gradient(135deg, ${ribbonColor} 0%, #7d5910 100%)`,
          }}
        >
          <Sparkles className="w-5 h-5 text-amber-100 animate-pulse mb-0.5" />
          <span className="text-xs sm:text-sm font-bold text-amber-950 font-serif leading-tight">
            {groom?.[0] || "V"} &amp; {bride?.[0] || "S"}
          </span>
          <span className="text-[8px] uppercase tracking-normal text-amber-900 font-semibold mt-0.5">
            ស្រាយខ្សែបូ
          </span>
        </div>

        {/* Action Prompt */}
        <div className="mt-8 px-5 py-2 rounded-full bg-black/60 border border-amber-400/40 backdrop-blur-md shadow-xl text-center">
          <p className="text-xs sm:text-sm font-medium text-amber-200 tracking-normal">
            ✨ សូមចុចស្រាយខ្សែបូ ដើម្បីបើកសំបុត្រ
          </p>
          <span className="text-[10px] text-amber-300/60 uppercase tracking-widest block mt-0.5">
            TAP TO UNTIE RIBBON
          </span>
        </div>
      </div>
    </div>
  );
}
