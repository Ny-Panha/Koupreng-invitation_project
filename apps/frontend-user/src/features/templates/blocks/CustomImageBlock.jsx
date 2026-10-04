import React from "react";

/**
 * CustomImageBlock — Renders a full-width responsive image with an optional caption overlay.
 *
 * @param {Object} props
 * @param {string} props.imageUrl - Source URL for the image
 * @param {string} [props.caption] - Optional text overlay / caption
 * @param {string} [props.alt] - Optional alt text for accessibility
 */
export default function CustomImageBlock({
  imageUrl,
  caption,
  alt = "Wedding image",
}) {
  if (!imageUrl) return null;

  return (
    <section className="relative w-full max-w-5xl mx-auto my-6 px-4">
      <div className="relative overflow-hidden rounded-2xl shadow-xl border border-white/10 group bg-zinc-900">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto max-h-[700px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-white text-center">
            <p className="text-sm sm:text-base font-medium tracking-wide drop-shadow-md">
              {caption}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
