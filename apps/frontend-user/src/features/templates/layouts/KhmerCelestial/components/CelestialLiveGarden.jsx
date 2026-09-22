import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import CelestialButterfly from "./CelestialButterfly";
import CelestialFlower from "./CelestialFlower";
import CelestialPetal from "./CelestialPetal";
import CelestialVine from "./CelestialVine";

const BUTTERFLIES = [
  { variant: "gold", layer: "background", path: "ltr", left: "-5%", top: "19%", size: 28, duration: 19, delay: 0, opacity: 0.42, wingSpeed: 310 },
  { variant: "sage", layer: "background", path: "rtl", left: "82%", top: "11%", size: 24, duration: 22, delay: 3, opacity: 0.38, wingSpeed: 250 },
  { variant: "ivory", layer: "background", path: "up", left: "8%", top: "72%", size: 22, duration: 18, delay: 2, opacity: 0.44, wingSpeed: 290 },
  { variant: "blue", layer: "background", path: "down", left: "88%", top: "8%", size: 26, duration: 20, delay: 7, opacity: 0.4, wingSpeed: 350 },
  { variant: "rose", layer: "midground", path: "diagonal", left: "5%", top: "49%", size: 37, duration: 15, delay: 4, opacity: 0.6, wingSpeed: 220 },
  { variant: "champagne", layer: "midground", path: "sweep", left: "78%", top: "59%", size: 34, duration: 17, delay: 1, opacity: 0.56, wingSpeed: 330 },
  { variant: "burgundy", layer: "midground", path: "rise", left: "18%", top: "86%", size: 32, duration: 16, delay: 9, opacity: 0.58, wingSpeed: 270 },
  { variant: "gold", layer: "foreground", path: "cross", left: "-12%", top: "32%", size: 58, duration: 12, delay: 5, opacity: 0.76, wingSpeed: 240 },
  { variant: "ivory", layer: "foreground", path: "cross-reverse", left: "104%", top: "66%", size: 52, duration: 14, delay: 10, opacity: 0.72, wingSpeed: 360 },
  { variant: "rose", layer: "background", path: "ltr", left: "-9%", top: "82%", size: 20, duration: 24, delay: 8, opacity: 0.34, wingSpeed: 280 },
  { variant: "sage", layer: "midground", path: "rise", left: "70%", top: "89%", size: 31, duration: 18, delay: 12, opacity: 0.5, wingSpeed: 300 },
  { variant: "blue", layer: "background", path: "rtl", left: "110%", top: "37%", size: 21, duration: 23, delay: 6, opacity: 0.35, wingSpeed: 230 },
  { variant: "champagne", layer: "midground", path: "diagonal", left: "-6%", top: "63%", size: 35, duration: 16, delay: 13, opacity: 0.52, wingSpeed: 320 },
  { variant: "burgundy", layer: "background", path: "down", left: "45%", top: "-8%", size: 24, duration: 21, delay: 2, opacity: 0.34, wingSpeed: 260 },
  { variant: "gold", layer: "midground", path: "sweep", left: "96%", top: "26%", size: 38, duration: 13, delay: 15, opacity: 0.58, wingSpeed: 340 },
  { variant: "ivory", layer: "background", path: "up", left: "31%", top: "104%", size: 23, duration: 25, delay: 11, opacity: 0.38, wingSpeed: 290 },
  { variant: "rose", layer: "midground", path: "cross-reverse", left: "106%", top: "47%", size: 40, duration: 15, delay: 17, opacity: 0.5, wingSpeed: 250 },
  { variant: "sage", layer: "background", path: "ltr", left: "-10%", top: "8%", size: 19, duration: 26, delay: 18, opacity: 0.3, wingSpeed: 370 },
];

const FLOWERS = [
  { variant: "white", edge: "left", left: "-2%", top: "12%", size: 72, duration: 8, delay: 0 },
  { variant: "jasmine", edge: "right", left: "94%", top: "18%", size: 58, duration: 9, delay: 1 },
  { variant: "lotus", edge: "left", left: "3%", top: "62%", size: 48, duration: 7, delay: 2 },
  { variant: "pink", edge: "right", left: "91%", top: "72%", size: 64, duration: 10, delay: 3 },
  { variant: "champagne", edge: "left", left: "-3%", top: "88%", size: 44, duration: 8, delay: 4 },
  { variant: "sage", edge: "right", left: "96%", top: "47%", size: 38, duration: 6, delay: 2 },
  { variant: "white", edge: "left", left: "10%", top: "35%", size: 28, duration: 7, delay: 6 },
  { variant: "pink", edge: "right", left: "83%", top: "36%", size: 31, duration: 8, delay: 7 },
  { variant: "jasmine", edge: "left", left: "7%", top: "95%", size: 36, duration: 9, delay: 5 },
  { variant: "champagne", edge: "right", left: "88%", top: "94%", size: 34, duration: 7, delay: 8 },
  { variant: "sage", edge: "left", left: "-1%", top: "43%", size: 26, duration: 6, delay: 9 },
  { variant: "lotus", edge: "right", left: "97%", top: "57%", size: 28, duration: 8, delay: 10 },
  { variant: "white", edge: "left", left: "14%", top: "6%", size: 22, duration: 7, delay: 11 },
  { variant: "pink", edge: "right", left: "79%", top: "5%", size: 24, duration: 9, delay: 12 },
  { variant: "jasmine", edge: "left", left: "2%", top: "76%", size: 24, duration: 8, delay: 13 },
  { variant: "champagne", edge: "right", left: "95%", top: "84%", size: 26, duration: 8, delay: 14 },
];

const PETALS = [
  { variant: "rose", path: "fall", left: "12%", delay: 0, duration: 16, size: 10 },
  { variant: "champagne", path: "fall", left: "28%", delay: 4, duration: 21, size: 8 },
  { variant: "ivory", path: "rise", left: "47%", delay: 2, duration: 18, size: 9 },
  { variant: "sage", path: "fall", left: "63%", delay: 8, duration: 20, size: 8 },
  { variant: "blue", path: "rise", left: "78%", delay: 5, duration: 17, size: 9 },
  { variant: "rose", path: "fall", left: "90%", delay: 10, duration: 23, size: 10 },
  { variant: "champagne", path: "rise", left: "4%", delay: 12, duration: 19, size: 7 },
  { variant: "ivory", path: "fall", left: "38%", delay: 13, duration: 22, size: 8 },
  { variant: "rose", path: "rise", left: "57%", delay: 15, duration: 20, size: 10 },
  { variant: "sage", path: "fall", left: "72%", delay: 16, duration: 18, size: 8 },
  { variant: "blue", path: "rise", left: "96%", delay: 17, duration: 22, size: 8 },
  { variant: "champagne", path: "fall", left: "20%", delay: 18, duration: 24, size: 9 },
  { variant: "rose", path: "rise", left: "84%", delay: 20, duration: 21, size: 9 },
  { variant: "ivory", path: "fall", left: "52%", delay: 21, duration: 19, size: 7 },
];

function viewportTier(width) {
  if (width <= 430) return "mobile";
  if (width <= 1024) return "medium";
  return "desktop";
}

export default function CelestialLiveGarden({ className = "", variant = "normal" }) {
  const gardenRef = useRef(null);
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 390 : window.innerWidth));
  const [documentVisible, setDocumentVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");
  const [inView, setInView] = useState(variant !== "closing");
  const tier = viewportTier(width);
  const saveData = typeof navigator !== "undefined" && navigator.connection?.saveData === true;
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (variant !== "closing" || !gardenRef.current || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "160px 0px" });
    observer.observe(gardenRef.current);
    return () => observer.disconnect();
  }, [variant]);

  const paused = !documentVisible || (variant === "closing" && !inView);

  const counts = useMemo(() => {
    if (variant === "transition") return { butterflies: 4, flowers: 4, petals: 10 };
    if (reduced || saveData) return { butterflies: 4, flowers: 5, petals: reduced ? 0 : 2 };
    if (variant === "opening") {
      return tier === "mobile" ? { butterflies: 9, flowers: 10, petals: 8 } : tier === "medium" ? { butterflies: 13, flowers: 13, petals: 12 } : { butterflies: 18, flowers: 16, petals: 16 };
    }
    if (variant === "closing") {
      return tier === "mobile" ? { butterflies: 8, flowers: 9, petals: 7 } : tier === "medium" ? { butterflies: 11, flowers: 12, petals: 10 } : { butterflies: 16, flowers: 15, petals: 14 };
    }
    return tier === "mobile" ? { butterflies: 6, flowers: 7, petals: 5 } : tier === "medium" ? { butterflies: 8, flowers: 9, petals: 7 } : { butterflies: 12, flowers: 11, petals: 10 };
  }, [reduced, saveData, tier, variant]);

  const butterflyItems = BUTTERFLIES.slice(0, counts.butterflies);
  const flowerItems = FLOWERS.slice(0, counts.flowers);
  const petalItems = PETALS.slice(0, counts.petals);

  return (
    <div ref={gardenRef} className={`kc-live-garden kc-live-garden--${variant} ${reduced ? "is-reduced" : ""} ${paused ? "is-paused" : ""} ${className}`} aria-hidden="true">
      <div className="kc-live-garden__background">
        {butterflyItems.filter((item) => item.layer === "background").map((item, index) => <GardenButterfly key={`bg-${index}`} item={item} reduced={reduced || paused} />)}
        {flowerItems.slice(0, Math.max(3, Math.floor(counts.flowers * 0.45))).map((item, index) => <GardenFlower key={`bg-flower-${index}`} item={item} />)}
        {petalItems.slice(0, Math.ceil(counts.petals * 0.6)).map((item, index) => <GardenPetal key={`bg-petal-${index}`} item={item} />)}
      </div>
      <div className="kc-live-garden__midground">
        {butterflyItems.filter((item) => item.layer === "midground").map((item, index) => <GardenButterfly key={`mid-${index}`} item={item} reduced={reduced || paused} />)}
        {flowerItems.slice(Math.max(3, Math.floor(counts.flowers * 0.45))).map((item, index) => <GardenFlower key={`mid-flower-${index}`} item={item} />)}
        {petalItems.slice(Math.ceil(counts.petals * 0.6)).map((item, index) => <GardenPetal key={`mid-petal-${index}`} item={item} />)}
      </div>
      <div className="kc-live-garden__foreground">
        {butterflyItems.filter((item) => item.layer === "foreground").map((item, index) => <GardenButterfly key={`fg-${index}`} item={item} foreground reduced={reduced || paused} />)}
        <CelestialVine side="left" variant="arc" reduced={reduced || paused} />
        <CelestialVine side="right" variant="cascade" reduced={reduced || paused} />
      </div>
    </div>
  );
}

function GardenButterfly({ item, foreground = false, reduced = false }) {
  const Wrapper = foreground ? motion.div : "div";
  return (
    <Wrapper
      className={`kc-garden__butterfly kc-garden__butterfly--${item.path} kc-garden__butterfly--${item.layer}`}
      style={{ left: item.left, top: item.top, opacity: item.opacity, "--kc-flight-duration": `${item.duration}s`, "--kc-flight-delay": `${item.delay}s` }}
      {...(foreground && !reduced ? { animate: { y: [0, -12, 8, 0], rotate: [-4, 5, -2, -4] }, transition: { duration: item.duration / 2, repeat: Infinity, delay: item.delay, ease: "easeInOut" } } : {})}
    >
      <CelestialButterfly variant={item.variant} size={item.size} wingSpeed={item.wingSpeed} reduced={reduced} />
    </Wrapper>
  );
}

function GardenFlower({ item }) {
  return (
    <div
      className={`kc-garden__flower kc-garden__flower--${item.edge}`}
      style={{ left: item.left, top: item.top, "--kc-flower-duration": `${item.duration}s`, "--kc-flower-delay": `${item.delay}s` }}
    >
      <CelestialFlower variant={item.variant} size={item.size} />
    </div>
  );
}

function GardenPetal({ item }) {
  return (
    <div
      className={`kc-garden__petal kc-garden__petal--${item.path}`}
      style={{ left: item.left, "--kc-petal-duration": `${item.duration}s`, "--kc-petal-delay": `${item.delay}s` }}
    >
      <CelestialPetal variant={item.variant} size={item.size} />
    </div>
  );
}
