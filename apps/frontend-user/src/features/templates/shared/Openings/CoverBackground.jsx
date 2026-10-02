import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import "./CoverBackground.css";

/**
 * Normalizes media values that might be a string URL or an object { url, src, ... }.
 */
function resolveMediaUrl(val) {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "object") {
    return (val.url || val.src || val.videoUrl || val.fileUrl || "").trim();
  }
  return "";
}

/**
 * CoverBackground — Shared Universal Cover Component
 * 
 * Contract:
 * 1. Image Priority: content.coverBackgroundImage
 * 2. Video Priority: content.coverVideoUrl || content.openingVideoUrl || content.openingVideo
 * 3. Fallback: templateDefault.src (with templateDefault.type)
 * 4. Smart Scrim: Applied automatically when a custom user upload is present
 */
export default function CoverBackground({
  content = {},
  templateDefault = { src: "", type: "image", poster: "" },
  className = "",
  children = null,
}) {
  const prefersReduced = usePrefersReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 1. Resolve custom user uploads
  const customCoverImage = resolveMediaUrl(
    content.coverBackgroundImage ||
    content.design?.coverBackgroundImage ||
    content.coverBgImage
  );

  const customCoverVideo = resolveMediaUrl(
    content.coverVideoUrl ||
    content.openingVideoUrl ||
    content.openingVideo ||
    content.videoUrl ||
    content.design?.openingVideoUrl
  );

  // 2. Resolve default template media
  const defaultSrc = resolveMediaUrl(templateDefault?.src);
  const defaultType = templateDefault?.type || "image";
  const defaultPoster = resolveMediaUrl(templateDefault?.poster);

  // 3. Determine active media type and source
  let mediaType = "none";
  let mediaSrc = "";
  let posterSrc = resolveMediaUrl(content.videoPoster || content.coverImage || defaultPoster || defaultSrc);
  const isCustomUpload = Boolean(customCoverImage);

  if (customCoverImage && !imageError) {
    mediaType = "image";
    mediaSrc = customCoverImage;
  } else if (customCoverVideo && !videoError && !prefersReduced) {
    mediaType = "video";
    mediaSrc = customCoverVideo;
  } else if (defaultSrc) {
    if (defaultType === "video" && !videoError && !prefersReduced) {
      mediaType = "video";
      mediaSrc = defaultSrc;
    } else if (!imageError) {
      mediaType = "image";
      mediaSrc = defaultSrc;
    }
  }

  // Reset errors when sources change
  useEffect(() => {
    setVideoError(false);
    setImageError(false);
  }, [customCoverImage, customCoverVideo, defaultSrc]);

  return (
    <div className={`cover-bg-root ${className}`.trim()} aria-hidden="true">
      {/* Media Layer */}
      {mediaType === "video" ? (
        <video
          key={mediaSrc}
          className="cover-bg-media"
          src={mediaSrc}
          poster={posterSrc || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoError(true)}
        />
      ) : mediaType === "image" && mediaSrc ? (
        <img
          className="cover-bg-media"
          src={mediaSrc}
          alt=""
          onError={() => setImageError(true)}
        />
      ) : posterSrc ? (
        /* Video fallback poster when video is skipped due to reduced motion or error */
        <img
          className="cover-bg-media"
          src={posterSrc}
          alt=""
          onError={() => setImageError(true)}
        />
      ) : null}

      {/* Smart Contrast Scrim (applied on custom user photo uploads for text readability) */}
      {isCustomUpload && <div className="cover-bg-scrim" />}

      {/* Optional slot for decorative overlays or slot elements */}
      {children}
    </div>
  );
}

CoverBackground.propTypes = {
  content: PropTypes.object,
  templateDefault: PropTypes.shape({
    src: PropTypes.string,
    type: PropTypes.oneOf(["image", "video"]),
    poster: PropTypes.string,
  }),
  className: PropTypes.string,
  children: PropTypes.node,
};
