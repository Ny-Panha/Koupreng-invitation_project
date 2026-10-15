import { useLanguageStore } from "../../stores/useLanguageStore";
import LandingHero from "./components/LandingHero";
import LandingProduct from "./components/LandingProduct";
import InvitationShowcase from "./components/InvitationShowcase";
import LandingStory from "./components/LandingStory";
import LandingConversion from "./components/LandingConversion";
import TemplateGrid from "../templates/components/TemplateGrid";
import "./MarketingFeature.css";
import "./MarketingPages.css";

export default function Home() {
  const lang = useLanguageStore((state) => state.lang);
  const copy = (km, en) => lang === "en" ? en : km;
  return (
    <div className="kp-landing" lang={lang}>
      <LandingHero copy={copy} />
      <TemplateGrid featured />
      <InvitationShowcase copy={copy} />
      <LandingProduct copy={copy} lang={lang} />
      <LandingStory copy={copy} />
      <LandingConversion copy={copy} />
    </div>
  );
}
