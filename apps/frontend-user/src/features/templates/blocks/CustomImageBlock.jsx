
import { interpolateTokens } from "./CustomTextBlock";

/**
 * CustomImageBlock — Renders a full-width responsive image with an optional caption overlay.
 *
 * @param {Object} props
 * @param {string} props.imageUrl - Source URL for the image
 * @param {string} [props.caption] - Optional text overlay / caption (supports {{tokens}})
 * @param {string} [props.alt] - Optional alt text for accessibility
 * @param {"fade-up" | "fade-in" | "zoom-in" | "slide-up" | "none"} [props.animation="fade-up"] - Entrance animation
 * @param {Object} [props.content={}] - Invitation content for dynamic token interpolation
 */
export default function CustomImageBlock({
  imageUrl,
  caption,
  alt = "Wedding image",
  animation = "fade-up",
  content = {},
}) {
  if (!imageUrl) return null;

  const resolvedCaption = interpolateTokens(caption, content);
  const animClass =
    animation && animation !== "none" ? `cms-anim-${animation}` : "";

  return (
    <section className={`relative w-full max-w-5xl mx-auto my-6 px-4 ${animClass}`.trim()}>
      <div className="relative overflow-hidden rounded-2xl shadow-xl border border-white/10 group bg-zinc-900">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto max-h-[700px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {resolvedCaption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-white text-center">
            <p className="text-sm sm:text-base font-medium tracking-wide drop-shadow-md">
              {resolvedCaption}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

