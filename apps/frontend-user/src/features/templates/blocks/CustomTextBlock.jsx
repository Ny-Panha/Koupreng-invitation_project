
/**
 * interpolateTokens — Replaces template placeholders (e.g. {{groom_name}})
 * with actual wedding data from resolved invitation content.
 *
 * Supported tokens:
 *  - {{groom_name}} / {{groom}}
 *  - {{bride_name}} / {{bride}}
 *  - {{wedding_date}} / {{date}}
 *  - {{venue_name}} / {{venue}} / {{location}}
 *  - {{groom_parents}}
 *  - {{bride_parents}}
 */
export function interpolateTokens(text, content = {}) {
  if (!text || typeof text !== "string") return text || "";
  return text.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, rawKey) => {
    const key = rawKey.toLowerCase();
    if (key === "groom_name" || key === "groom") {
      return content.groom || content.groomName || match;
    }
    if (key === "bride_name" || key === "bride") {
      return content.bride || content.brideName || match;
    }
    if (key === "wedding_date" || key === "date") {
      return content.weddingDate || content.date || match;
    }
    if (key === "venue_name" || key === "venue" || key === "location") {
      return content.venue || content.venueName || content.location || match;
    }
    if (key === "groom_parents") {
      return (
        content.couple?.groomParents ||
        content.family?.groomParents ||
        match
      );
    }
    if (key === "bride_parents") {
      return (
        content.couple?.brideParents ||
        content.family?.brideParents ||
        match
      );
    }
    return content[rawKey] !== undefined ? content[rawKey] : match;
  });
}

/**
 * CustomTextBlock — Renders a styled text section with dynamic token interpolation and animation.
 *
 * @param {Object} props
 * @param {string} [props.heading] - Section heading (supports {{tokens}})
 * @param {string} [props.body] - Section body text (supports {{tokens}})
 * @param {"center" | "left" | "right"} [props.align="center"] - Text alignment
 * @param {"fade-up" | "fade-in" | "zoom-in" | "slide-up" | "none"} [props.animation="fade-up"] - Entrance animation
 * @param {Object} [props.content={}] - Invitation content for dynamic token interpolation
 */
export default function CustomTextBlock({
  heading,
  body,
  align = "center",
  animation = "fade-up",
  content = {},
}) {
  if (!heading && !body) return null;

  const resolvedHeading = interpolateTokens(heading, content);
  const resolvedBody = interpolateTokens(body, content);

  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
      ? "text-right"
      : "text-center";

  const animClass =
    animation && animation !== "none" ? `cms-anim-${animation}` : "";

  return (
    <section className={`w-full max-w-3xl mx-auto my-8 px-6 ${alignClass} ${animClass}`.trim()}>
      {resolvedHeading && (
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-3 drop-shadow-sm">
          {resolvedHeading}
        </h2>
      )}
      {resolvedBody && (
        <p className="text-sm sm:text-base leading-relaxed text-zinc-300 font-normal whitespace-pre-line">
          {resolvedBody}
        </p>
      )}
    </section>
  );
}

