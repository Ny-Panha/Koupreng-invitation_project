import { LayoutTemplate, Sparkles } from "lucide-react";
import { BentoCard } from "@/shared/ui/vendor";

// Public plan discovery, with no amounts or package entitlements implied.
export default function PricingFactors({ copy, compact = false }) {
  const factors = [
    {
      icon: LayoutTemplate,
      badge: copy("ជំហាន ១", "Step 1"),
      title: copy("គំរូសន្លឹកការរបស់អ្នក", "Your invitation design"),
      description: copy(
        "គំរូកំណត់រចនាបទសន្លឹកការ។ មើលគំរូជាមុនបាន។ គំរូប្រណិតនីមួយៗមានព័ត៌មានតម្លៃ និងសិទ្ធិប្រើប្រាស់ដែលត្រូវពិនិត្យពេលជ្រើសរើស។",
        "A design sets the look of your invitation. Preview it first. Individual premium designs have their own price and access checks when you choose."
      ),
    },
    {
      icon: Sparkles,
      badge: copy("ជំហាន ២", "Step 2"),
      title: copy("កញ្ចប់សេវាកម្មរបស់អ្នក", "Your service package"),
      description: copy(
        "កញ្ចប់កំណត់ចំនួនសន្លឹកការ កម្រិតភ្ញៀវ រយៈពេល និងមុខងារដែលរួមបញ្ចូល។ ចូលគណនីដើម្បីមើលព័ត៌មានបច្ចុប្បន្ន រួមទាំងសិទ្ធិគំរូប្រណិត។",
        "A package sets invitation and guest limits, duration and included tools. Sign in to compare the current details, including any premium design access."
      ),
    },
  ];

  return (
    <div className={`kp-price-factors${compact ? " kp-price-factors--compact" : ""}`}>
      {factors.map((f) => (
        <BentoCard
          key={f.title}
          icon={f.icon}
          badge={f.badge}
          title={f.title}
          description={f.description}
        />
      ))}
    </div>
  );
}
