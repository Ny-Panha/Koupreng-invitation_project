import { Sparkles, Heart } from "lucide-react";

export default function WaxSealEnvelope({
  tpl,
  isFlapOpen,
  isCardEmerging,
  onOpenEnvelope,
}) {
  const groomInitial = (tpl.groom || "V").trim()[0] || "V";
  const brideInitial = (tpl.bride || "S").trim()[0] || "S";

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 z-20 transition-opacity duration-700">
      <div className="tdy-envelope-scene mb-8">
        <div className="tdy-envelope-wrapper">
          {/* Envelope Back Base */}
          <div className="tdy-envelope-base">
            <div className="tdy-envelope-lining" />
          </div>

          {/* Inside Card (Pre-emerging / Emerging) */}
          <div
            className={`tdy-card-preview p-6 flex flex-col items-center justify-center text-center ${
              isCardEmerging ? "is-emerging" : ""
            }`}
            style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(212, 175, 55, 0.45)" }}
          >
            <div className="w-8 h-8 rounded-full border border-amber-600/30 flex items-center justify-center mb-2 bg-amber-500/10">
              <Heart className="h-4 w-4 text-amber-700 fill-amber-700/20" />
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-amber-800 tdy-font-cinzel font-bold mb-2">
              WEDDING INVITATION
            </span>
            <div className="text-lg sm:text-xl tdy-font-moul text-stone-900 leading-snug">
              {tpl.groom}
              <span className="text-amber-700 tdy-font-playfair italic font-normal mx-1.5">&amp;</span>
              {tpl.bride}
            </div>
            <div className="text-[11px] text-stone-600 tdy-font-kantumruy font-medium mt-2">
              {tpl.dateText}
            </div>
          </div>

          {/* Envelope Pocket Front (Left, Right, Bottom Triangles) */}
          <div className="tdy-envelope-pocket">
            <div className="tdy-pocket-left" />
            <div className="tdy-pocket-right" />
            <div className="tdy-pocket-bottom" />
          </div>

          {/* Envelope Top Flap (Rotates on Open) */}
          <div
            className={`tdy-flap-top ${isFlapOpen ? "is-open" : ""}`}
            onClick={onOpenEnvelope}
          >
            <div className="tdy-flap-face" />
            <div className="tdy-flap-inner" />
          </div>

          {/* Wax Seal with Luxury Monogram */}
          <div
            className={`tdy-wax-seal ${isFlapOpen ? "opacity-0 pointer-events-none scale-125 transition-all duration-300" : ""}`}
            onClick={onOpenEnvelope}
            title="ចុចដើម្បីបើកសំបុត្រអញ្ជើញ"
          >
            <div className="tdy-seal-inner">
              <span className="text-xs font-bold tdy-font-cinzel tracking-wider">
                {groomInitial} &amp; {brideInitial}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction Prompt & Pulsing Button */}
      {!isFlapOpen && (
        <div className="flex flex-col items-center gap-3 animate-fade-in text-center px-4 tdy-font-kantumruy">
          <p className="text-xs text-amber-300/90 font-medium">
            សូមចុចលើត្រាទៀនក្រមួន ដើម្បីបើកសំបុត្រ
          </p>
          <button
            type="button"
            onClick={onOpenEnvelope}
            className="group relative px-6 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_25px_rgba(212,175,55,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 opacity-90 group-hover:opacity-100 transition" />
            <div className="relative flex items-center gap-2 text-stone-950 font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5 text-stone-950 animate-spin-slow" />
              <span>បើកសំបុត្រអាពាហ៍ពិពាហ៍</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
