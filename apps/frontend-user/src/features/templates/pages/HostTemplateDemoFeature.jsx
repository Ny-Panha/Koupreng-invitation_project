import { useLanguageStore } from "@/stores/useLanguageStore";
import TemplateDemoFeature from "./TemplateDemoFeature";

// Use the same authoritative catalog lookup on a cold load as the public demo.
export default function HostTemplateDemoFeature() {
  const en = useLanguageStore(state => state.lang) === "en";
  return <TemplateDemoFeature backLink="/templates/browse" backLabel={en ? "Back to designs" : "ត្រឡប់ទៅបញ្ជីគំរូ"} primaryCtaLabel={en ? "Use this design" : "ប្រើគំរូនេះ"} />;
}
