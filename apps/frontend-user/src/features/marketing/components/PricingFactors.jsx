import { Layers3, UsersRound, Sparkles } from "lucide-react";

// Public plan discovery, with no amounts or package entitlements implied.
export default function PricingFactors({ copy, compact = false }) {
  const factors = [
    [Layers3, copy("សន្លឹកការ និងរយៈពេល", "Invitations & duration"), copy("គិតពីចំនួនពិធី និងរយៈពេលដែលអ្នកត្រូវការប្រើប្រាស់។", "Consider how many events you are planning and how long you need access.")],
    [UsersRound, copy("ចំនួនភ្ញៀវ", "Your guest list"), copy("ពិនិត្យកម្រិតភ្ញៀវក្នុងមួយសន្លឹកការ ឱ្យសមនឹងពិធីរបស់អ្នក។", "Check the guest limit per invitation against the size of your celebration.")],
    [Sparkles, copy("គំរូ និងមុខងារ", "Designs & guest tools"), copy("ពិនិត្យសិទ្ធិគំរូប្រណិត និងមុខងារដែលកញ្ចប់នីមួយៗរួមបញ្ចូល។", "Compare premium design access and the tools included in each package.")],
  ];
  return <div className={`kp-price-factors${compact ? " kp-price-factors--compact" : ""}`}>
    {factors.map(([Icon, title, text]) => <article key={title}><Icon size={24} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}
  </div>;
}
