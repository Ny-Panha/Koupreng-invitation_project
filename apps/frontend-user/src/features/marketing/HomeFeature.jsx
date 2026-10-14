import { useLanguageStore } from "../../stores/useLanguageStore";
import LandingHero from "./components/LandingHero";
import InvitationShowcase from "./components/InvitationShowcase";
import LandingStory from "./components/LandingStory";
import LandingConversion from "./components/LandingConversion";
import TemplateGrid from "../templates/components/TemplateGrid";
import "./MarketingFeature.css";

export default function Home() {
  const lang = useLanguageStore((state) => state.lang);
  const copy = (km, en) => lang === "en" ? en : km;
  return (
    <div className="kp-landing" lang={lang}>
      <LandingHero copy={copy} />
      <div className="kp-promise-strip" role="group" aria-label={copy("ព័ត៌មានសន្លឹកការ", "Invitation essentials")}>
        <span>{copy("ភាសាខ្មែរ និងអង់គ្លេស", "KHMER & ENGLISH")}</span><span aria-hidden="true">✧</span>
        <span>{copy("រចនាតាមរឿងរ៉ាវរបស់អ្នក", "PERSONAL TO YOUR STORY")}</span><span aria-hidden="true">✧</span>
        <span>{copy("ចែករំលែកតាមតំណភ្ជាប់", "ONE BEAUTIFUL LINK")}</span>
      </div>
      <InvitationShowcase copy={copy} />
      <TemplateGrid featured />
      <LandingStory copy={copy} />
      <LandingConversion copy={copy} />
    </div>
  );
}
