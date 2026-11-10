import { useState, useEffect, useRef } from "react";
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
  priority = false,
  children = null,
}) {
  const prefersReduced = usePrefersReducedMotion();
  const preferStatic = prefersReduced || (typeof navigator !== 'undefined' && navigator.connection?.saveData === true);
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [failedImages, setFailedImages] = useState([]);

  // 1. Resolve custom user uploads
  const templateKey = String(content.templateCode || content.templateId || content.code || content.slug || "").toLowerCase();
  const isDecorativeArtworkTemplate = [
    "silk-heritage",
    "silk_heritage",
    "cover-khmer-golden-wedding",
    "khmer-golden-canva-inspired-wedding"
  ].includes(templateKey);

  const customCoverImage = resolveMediaUrl(
    content.coverBackgroundImage ||
    content.design?.coverBackgroundImage ||
    content.coverBgImage ||
    (!isDecorativeArtworkTemplate ? (content.couplePhoto || content.coverImage) : "")
  );

  const focalPoint = content.coverFocalPoint || content.design?.coverFocalPoint || "center";
  const focalPosition = focalPoint === "top" ? "50% 15%" : focalPoint === "bottom" ? "50% 85%" : "50% 50%";

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
  const posterSrc = [content.videoPoster, content.coverImage, defaultPoster, defaultType === "image" ? defaultSrc : ""]
    .map(resolveMediaUrl).find((src) => src && !failedImages.includes(src)) || "";
  const isCustomUpload = Boolean(customCoverImage);

  if (customCoverImage && !failedImages.includes(customCoverImage)) {
    mediaType = "image";
    mediaSrc = customCoverImage;
  } else if (customCoverVideo && !videoError && !preferStatic) {
    mediaType = "video";
    mediaSrc = customCoverVideo;
  } else if (defaultSrc) {
    if (defaultType === "video" && !videoError && !preferStatic) {
      mediaType = "video";
      mediaSrc = defaultSrc;
    } else if (defaultType === "image" && !failedImages.includes(defaultSrc)) {
      mediaType = "image";
      mediaSrc = defaultSrc;
    }
  }

  // Reset errors when sources change
  useEffect(() => {
    setVideoError(false);
    setFailedImages([]);
  }, [customCoverImage, customCoverVideo, defaultSrc]);
  const failImage = (src) => setFailedImages((items) => items.includes(src) ? items : [...items, src]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const visibility = () => { if (document.hidden) video.pause(); else void video.play().catch(() => {}); };
    document.addEventListener('visibilitychange', visibility);
    if (document.hidden) video.pause();
    return () => { document.removeEventListener('visibilitychange', visibility); video.pause(); };
  }, [mediaType, mediaSrc]);

  return (
    <div className={`cover-bg-root ${className}`.trim()} data-cover-media={mediaType} aria-hidden="true">
      {/* Media Layer */}
      {mediaType === "video" ? (
        <video
          ref={videoRef}
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
          srcSet={mediaSrc === defaultSrc ? templateDefault.srcSet : undefined}
          sizes={mediaSrc === defaultSrc ? templateDefault.sizes : undefined}
          alt=""
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          style={{ objectPosition: focalPosition }}
          onError={() => failImage(mediaSrc)}
        />
      ) : posterSrc ? (
        /* Video fallback poster when video is skipped due to reduced motion or error */
        <img
          className="cover-bg-media"
          src={posterSrc}
          alt=""
          style={{ objectPosition: focalPosition }}
          onError={() => failImage(posterSrc)}
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
    srcSet: PropTypes.string,
    sizes: PropTypes.string,
  }),
  className: PropTypes.string,
  priority: PropTypes.bool,
  children: PropTypes.node,
};
