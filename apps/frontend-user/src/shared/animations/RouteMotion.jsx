import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const LegacySiteAnimations = lazy(() => import("./SiteAnimations"));
const nativeMarketing = new Set(["/", "/pricing", "/contact", "/templates"]);

export default function RouteMotion() {
  const { pathname } = useLocation();
  // Public marketing has its own bounded CSS/observer motion. The existing
  // Framer route engine is fetched when a legacy surface actually needs it.
  if (nativeMarketing.has(pathname.replace(/\/$/, "") || "/")) return null;
  return <Suspense fallback={null}><LegacySiteAnimations /></Suspense>;
}
