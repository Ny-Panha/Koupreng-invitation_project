import { Sparkles } from "lucide-react";
import CoverBackground from "../../../shared/Openings/CoverBackground";

export default function VelvetCurtainOpening({
  opened,
  onOpenCurtain,
  onSkip,
  groom,
  bride,
  content = {},
}) {
  const hasCustomCover = Boolean(
    content.coverBackgroundImage ||
    content.design?.coverBackgroundImage ||
    content.coverVideoUrl ||
    content.openingVideoUrl ||
    content.openingVideo
  );

  return (
    <div
      className={`el-curtain-overlay ${opened ? "opened" : ""} ${hasCustomCover ? "has-custom-bg" : ""}`}
      style={opened ? { pointerEvents: "none", visibility: "hidden" } : undefined}
      onClick={!opened ? onOpenCurtain : undefined}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (!opened && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onOpenCurtain?.();
        }
      }}
      tabIndex={!opened ? 0 : undefined}
      aria-hidden={opened ? "true" : undefined}
      inert={opened}
      aria-label={!opened ? "ចុចដើម្បីបើកវាំងនន" : undefined}
    >
      <CoverBackground
        content={content}
        templateDefault={{
          src: "",
          type: "image",
        }}
      />
      <div className="el-curtain-half left" />
      <div className="el-curtain-half right" />
      <div
        className="el-curtain-btn-box"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          className="el-wax-badge"
          onClick={onOpenCurtain}
          tabIndex={!opened ? 0 : -1}
          aria-label="ចុចដើម្បីបើកវាំងនន"
          title="ចុចដើម្បីបើកវាំងននល្ខោន"
        >
          <Sparkles className="w-10 h-10 text-emerald-950" aria-hidden="true" />
        </button>
        <h2 style={{ fontFamily: '"Moul", "Noto Sans Khmer", serif', lineHeight: 1.8, overflowWrap: 'anywhere', fontSize: "clamp(1.25rem, 5vw, 1.75rem)", color: "var(--el-gold-light)", marginBottom: "0.5rem" }}>
          {groom} &amp; {bride}
        </h2>
        <p style={{ color: "#cbd5e0", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          សិរីមង្គលអាពាហ៍ពិពាហ៍ប្រណិត
        </p>
        <button
          type="button"
          className="el-open-btn"
          onClick={onOpenCurtain}
          aria-label="បើកសំបុត្រអញ្ជើញ (Open invitation)"
        >
          បើកសំបុត្រអញ្ជើញ (OPEN)
        </button>
        <button
          type="button"
          className="el-skip-btn"
          onClick={(e) => {
            e.stopPropagation();
            (onSkip || onOpenCurtain)?.();
          }}
          aria-label="រំលងការបើក (Skip opening)"
        >
          រំលង (Skip)
        </button>
      </div>
    </div>
  );
}
