import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Existing invitation/dashboard font catalogs load only when those routes need them.
const legacyStylesheets = [
  "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Angkor&family=Battambang:wght@400;700&family=Bayon&family=Bokor&family=Chenla&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Dangrek&family=Fasthand&family=Great+Vibes&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Koulen&family=Moul&family=Nokora:wght@400;700&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400&family=Preahvihear&family=Siemreap&family=Suwannaphum:wght@400;700&family=Taprom&display=swap",
  "https://fonts.googleapis.com/css2?family=Moul&family=Koulen&family=Battambang:wght@400;700&family=Kantumruy+Pro:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=Montserrat:wght@400;500;700&family=Noto+Sans+Khmer:wght@400;500;700&display=swap"
];
const localMarketing = new Set(["/", "/pricing", "/contact", "/templates"]);

export default function RouteFontLoader() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (localMarketing.has(pathname.replace(/\/$/, "") || "/")) return;
    legacyStylesheets.forEach((href, index) => {
      const id = "koupreng-legacy-fonts-" + index;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet"; link.href = href;
      document.head.appendChild(link);
    });
  }, [pathname]);
  return null;
}
