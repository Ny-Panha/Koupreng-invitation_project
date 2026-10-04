import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia(query);
    const updateMatches = (e) => setMatches(e.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateMatches);
    return () => mediaQuery.removeEventListener("change", updateMatches);
  }, [query]);

  return matches;
}

/**
 * HorizontalScrollSection — The Cinematic Block
 *
 * @param {Object} props
 * @param {Array<{ img: string, title?: string, subtitle?: string }>} props.cards
 * @param {string} [props.heading]
 */
export default function HorizontalScrollSection({ cards = [], heading }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reducedMotion = usePrefersReducedMotion();
  const pinned = isDesktop && !reducedMotion;

  const outerRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [travelDistance, setTravelDistance] = useState(0);

  // Normalize cards data
  const cardList = useMemo(() => {
    if (!Array.isArray(cards)) return [];
    return cards.map((c, i) => ({
      img: c.img || c.image || c.url || "",
      title: c.title || "",
      subtitle: c.subtitle || "",
      id: c.id || `card-${i}`,
    }));
  }, [cards]);

  // Framer-motion scroll tracking (offset is strictly required)
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // Dynamically measure travel distance via ResizeObserver
  useEffect(() => {
    if (!pinned) return;

    const measure = () => {
      if (trackRef.current && viewportRef.current) {
        const distance = Math.max(
          0,
          trackRef.current.scrollWidth - viewportRef.current.clientWidth
        );
        setTravelDistance(distance);
      }
    };

    measure();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      if (trackRef.current) ro.observe(trackRef.current);
      if (viewportRef.current) ro.observe(viewportRef.current);
    }

    return () => {
      if (ro) ro.disconnect();
    };
  }, [pinned, cardList]);

  const x = useTransform(scrollYProgress, [0, 1], [0, -travelDistance]);

  if (cardList.length === 0) return null;

  // MOBILE or REDUCED MOTION: Native swipe carousel (no sticky trapping)
  if (!pinned) {
    return (
      <section
        ref={outerRef}
        className="w-full py-8 px-4 overflow-clip"
        data-testid="swipe-carousel"
      >
        {heading && (
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 px-2 tracking-wide">
            {heading}
          </h2>
        )}
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar scroll-smooth"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {cardList.map((card, idx) => (
            <div
              key={card.id || idx}
              className="w-[78vw] max-w-[380px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-xl bg-zinc-900 border border-white/10 relative h-[420px] flex flex-col justify-end"
            >
              {card.img ? (
                <img
                  src={card.img}
                  alt={card.title || `Moment ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-500">
                  No Image
                </div>
              )}
              <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                {card.subtitle && (
                  <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold block mb-1">
                    {card.subtitle}
                  </span>
                )}
                {card.title && (
                  <h3 className="text-lg font-bold leading-snug drop-shadow-sm">
                    {card.title}
                  </h3>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // DESKTOP: Pinned horizontal scroll
  const sectionHeight = `${Math.max(cardList.length * 100, 200)}dvh`;

  return (
    <section
      ref={outerRef}
      className="relative w-full"
      style={{ height: sectionHeight }}
      data-testid="pinned-desktop"
    >
      <div
        ref={viewportRef}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col justify-between py-10 bg-zinc-950 text-white"
        style={{ height: "100dvh" }}
      >
        {heading && (
          <div className="px-12 z-10">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {heading}
            </h2>
          </div>
        )}

        <div className="w-full overflow-hidden my-auto">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-8 px-12 will-change-transform"
          >
            {cardList.map((card, idx) => (
              <div
                key={card.id || idx}
                className="w-[380px] lg:w-[440px] h-[58dvh] max-h-[580px] shrink-0 rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 bg-zinc-900 flex flex-col justify-end group cursor-pointer"
              >
                {card.img ? (
                  <img
                    src={card.img}
                    alt={card.title || `Moment ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-500">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:via-black/20 transition-colors" />

                <div className="relative z-10 p-6">
                  {card.subtitle && (
                    <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold block mb-1">
                      {card.subtitle}
                    </span>
                  )}
                  {card.title && (
                    <h3 className="text-xl font-bold leading-snug drop-shadow-sm group-hover:text-amber-200 transition-colors">
                      {card.title}
                    </h3>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="px-12 text-xs text-zinc-400">
          <span>Scroll down to navigate gallery</span>
        </div>
      </div>
    </section>
  );
}
