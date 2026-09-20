import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import logo from "../../assets/logo.png";
import "./siteAnimations.css";

const REVEAL_SELECTORS = [
  "main section",
  "main article",
  ".hero-content",
  ".tp-card",
  ".tp-custom-box",
  ".auth-card",
  ".dash-page-header",
  ".dash-current-card",
  ".dash-summary-card",
  ".dash-action-card",
  ".dash-list-card",
  ".wb-sidebar",
  ".wb-main",
  ".wb-preview",
  ".event-card",
  ".create-event-card",
  ".venues-card",
  ".pricing-card",
  ".tpl-demo-panel",
  ".tpl-demo-phone-shell",
];

function getInitialPreloaderState() {
  if (typeof window === "undefined") return false;
  // If inside Telegram WebApp or previously seen in session, skip preloader for instant load
  if (window.Telegram?.WebApp?.initData) return false;
  try {
    if (sessionStorage.getItem("kp_intro_seen")) return false;
  } catch {}
  return true;
}

function LogoPreloader({ disabled = false }) {
  const [visible, setVisible] = useState(getInitialPreloaderState);
  const shouldShow = !disabled && visible;

  useEffect(() => {
    if (disabled || !visible) return undefined;

    try {
      sessionStorage.setItem("kp_intro_seen", "true");
    } catch {}

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [disabled, visible]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="kp-site-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          aria-hidden="true"
        >
          <motion.div
            className="kp-site-preloader__mark"
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={logo} alt="" />
            <span>Koupreng</span>
          </motion.div>
          <motion.div
            className="kp-site-preloader__line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.22,
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function KineticGrid() {
  const gridRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;

    const handlePointerMove = (event) => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);

      frameRef.current = window.requestAnimationFrame(() => {
        grid.style.setProperty("--kp-grid-x", `${event.clientX}px`);
        grid.style.setProperty("--kp-grid-y", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return <div ref={gridRef} className="kp-kinetic-grid" aria-hidden="true" />;
}

function RoutePulse() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="kp-route-pulse"
        initial={{ scaleX: 0, opacity: 0.9 }}
        animate={{ scaleX: 1, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />
    </AnimatePresence>
  );
}

function useSiteReveal() {
  const location = useLocation();
  const selector = useMemo(() => REVEAL_SELECTORS.join(","), []);

  useEffect(() => {
    let observer;
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      if (cancelled) return;

      const targets = Array.from(document.querySelectorAll(selector)).filter(
        (target) => {
          return !target.closest(
            ".dashboard-page, .tpl-royal-invitation, .kp-site-preloader, .kp-kinetic-grid",
          );
        },
      );

      if (!targets.length) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      targets.forEach((target, index) => {
        target.classList.add("kp-reveal");
        target.style.setProperty("--kp-reveal-index", String(index % 8));
      });

      if (reduceMotion) {
        targets.forEach((target) => target.classList.add("kp-reveal-visible"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle(
              "kp-reveal-visible",
              entry.isIntersecting,
            );
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );

      targets.forEach((target) => observer.observe(target));
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [location.pathname, selector]);
}

export default function SiteAnimations() {
  const location = useLocation();
  const skipPreloader = /^\/templates\/[^/]+(?:\/(?:demo|preview))?\/?$/.test(
    location.pathname,
  );

  useSiteReveal();

  return (
    <>
      <KineticGrid />
      <RoutePulse />
      <LogoPreloader disabled={skipPreloader} />
    </>
  );
}
