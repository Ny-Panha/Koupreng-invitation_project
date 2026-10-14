import { useEffect } from "react";

// One-time scroll choreography. Underlying HTML stays visible, including when
// Web Animations or IntersectionObserver are unavailable in a guest webview.
export function useSilkMotion(root, opened, reduced, preview) {
  useEffect(() => {
    if (!opened || reduced || preview || !root.current || typeof IntersectionObserver === "undefined") return;
    const active = new Map();
    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          active.get(entry.target)?.cancel();
          active.delete(entry.target);
          continue;
        }
        if (seen.has(entry.target) || typeof entry.target.animate !== "function" || document.hidden) continue;
        seen.add(entry.target);
        const isPhoto = entry.target.classList.contains("sh-hero-photo") || entry.target.matches(".sh-album figure");
        const animation = entry.target.animate([
          { opacity: .45, transform: isPhoto ? "translateY(32px) scale(.97)" : "translateY(28px)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ], { duration: isPhoto ? 1100 : 850, delay: Number(entry.target.dataset.silkDelay || 0), easing: "cubic-bezier(.22,1,.36,1)" });
        active.set(entry.target, animation);
        animation.onfinish = () => active.delete(entry.target);
      }
    }, { threshold: .12 });
    const targets = root.current.querySelectorAll(".sh-hero-copy, .sh-hero-photo, .sh-section-intro, .sh-families article, .sh-program li, .sh-album figure, .sh-note, .sh-closing > h2");
    targets.forEach((target, index) => {
      target.dataset.silkDelay = String((index % 3) * 70);
      observer.observe(target);
    });
    const stop = () => { active.forEach((animation) => animation.cancel()); active.clear(); };
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [root, opened, reduced, preview]);
}
