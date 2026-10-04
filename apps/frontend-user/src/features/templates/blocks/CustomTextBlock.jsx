import React from "react";

/**
 * CustomTextBlock — Renders a styled text section with heading and body.
 *
 * @param {Object} props
 * @param {string} [props.heading] - Section heading
 * @param {string} [props.body] - Section body text
 * @param {"center" | "left" | "right"} [props.align="center"] - Text alignment
 */
export default function CustomTextBlock({
  heading,
  body,
  align = "center",
}) {
  if (!heading && !body) return null;

  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
      ? "text-right"
      : "text-center";

  return (
    <section className={`w-full max-w-3xl mx-auto my-8 px-6 ${alignClass}`}>
      {heading && (
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-3 drop-shadow-sm">
          {heading}
        </h2>
      )}
      {body && (
        <p className="text-sm sm:text-base leading-relaxed text-zinc-300 font-normal whitespace-pre-line">
          {body}
        </p>
      )}
    </section>
  );
}
