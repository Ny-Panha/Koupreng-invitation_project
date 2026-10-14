import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function LandingPhoto({ src, alt, priority = false }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="kp-photo-fallback" role="img" aria-label={alt}><ImageOff size={32} aria-hidden="true" /></div>
    : <img src={src} alt={alt} width="960" height="1440" loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} onError={() => setFailed(true)} />;
}
