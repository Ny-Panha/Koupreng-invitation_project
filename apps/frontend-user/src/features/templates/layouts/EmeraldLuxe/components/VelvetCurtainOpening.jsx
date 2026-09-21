import { Sparkles } from "lucide-react";

export default function VelvetCurtainOpening({
  opened,
  onOpenCurtain,
  groom,
  bride,
}) {
  return (
    <div
      className={`el-curtain-overlay ${opened ? "opened" : ""}`}
      style={opened ? { pointerEvents: "none", visibility: "hidden" } : undefined}
      onClick={!opened ? onOpenCurtain : undefined}
      role={!opened ? "button" : undefined}
      tabIndex={!opened ? 0 : undefined}
      aria-label="ចុចដើម្បីបើកវាំងនន"
    >
      <div className="el-curtain-half left" />
      <div className="el-curtain-half right" />
      <div
        className="el-curtain-btn-box"
        onClick={(e) => {
          e.stopPropagation();
          onOpenCurtain?.();
        }}
      >
        <div className="el-wax-badge" onClick={onOpenCurtain} title="ចុចដើម្បីបើកវាំងននល្ខោន">
          <Sparkles className="w-10 h-10 text-emerald-950" />
        </div>
        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "1.75rem", color: "var(--el-gold-light)", marginBottom: "0.5rem" }}>
          {groom} &amp; {bride}
        </h2>
        <p style={{ color: "#cbd5e0", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          សិរីមង្គលអាពាហ៍ពិពាហ៍ប្រណិត
        </p>
        <button type="button" className="el-open-btn" onClick={onOpenCurtain}>
          បើកសំបុត្រអញ្ជើញ (OPEN)
        </button>
      </div>
    </div>
  );
}
