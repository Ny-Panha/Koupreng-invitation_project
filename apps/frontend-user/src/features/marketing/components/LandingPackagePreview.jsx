import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useLanguageStore } from "../../../stores/useLanguageStore";
import { packageLimit, packagePrice } from "../model/packagePresentation";
import { usePackageCatalog } from "../model/usePackageCatalog";

export default function LandingPackagePreview({ copy }) {
  const lang = useLanguageStore(state => state.lang);
  const { catalog, reload } = usePackageCatalog();
  if (catalog.status === "loading") return <div className="kp-package-preview-state"><p role="status">{copy("កំពុងផ្ទុកកញ្ចប់បច្ចុប្បន្ន…", "Loading current packages…")}</p><div className="kp-pricing-tier-grid" aria-hidden="true">{[1, 2, 3].map(key => <div className="kp-plan-skeleton" key={key} />)}</div></div>;
  if (catalog.status === "error") return <div className="kp-page-state" role="alert"><p>{copy("មិនអាចផ្ទុកកញ្ចប់បច្ចុប្បន្នបានទេ។ សូមសាកម្ដងទៀត។", "Current packages could not be loaded. Try again.")}</p><button type="button" className="kp-button" onClick={reload}>{copy("សាកម្ដងទៀត", "Try again")}</button></div>;
  if (catalog.status === "restricted") return <div className="kp-page-state" role="status"><p>{copy("ចូលគណនីដើម្បីពិនិត្យកញ្ចប់ និងសិទ្ធិបច្ចុប្បន្នរបស់អ្នក។", "Sign in to review current packages and your eligibility.")}</p><Link className="kp-button" to="/login?next=%2Fapp%2Fpackages">{copy("ចូលគណនី", "Sign in")}</Link></div>;
  if (!catalog.items.length) return <div className="kp-page-state" role="status"><p>{copy("មិនទាន់មានកញ្ចប់បច្ចុប្បន្នទេ។ អ្នកអាចមើលគំរូ ឬទាក់ទងក្រុមការងារ។", "No packages are currently available. Explore designs or contact the team.")}</p><Link className="kp-text-link" to="/contact">{copy("ទាក់ទងក្រុមការងារ", "Contact the team")}</Link></div>;
  return <div className="kp-pricing-tier-grid" aria-label={copy("កញ្ចប់បច្ចុប្បន្ន", "Current packages")}>
    {catalog.items.slice(0, 3).map(plan => {
      const price = packagePrice(plan, lang);
      const facts = [
        `${copy("សន្លឹកការ", "Invitations")}: ${packageLimit(plan.maxInvitations, lang)}`,
        `${copy("ភ្ញៀវក្នុងមួយសន្លឹកការ", "Guests per invitation")}: ${packageLimit(plan.maxGuestsPerInvitation, lang)}`,
        ...(plan.premiumTemplatesEnabled === true ? [copy("រួមបញ្ចូលសិទ្ធិគំរូប្រណិត", "Premium template access included")] : []),
        ...(plan.seatingEnabled === true ? [copy("រួមបញ្ចូលការរៀបចំកន្លែងអង្គុយ", "Seating management included")] : []),
        ...(plan.qrCheckInEnabled === true ? [copy("រួមបញ្ចូលការស្កេនចូលពិធី", "QR check-in included")] : []),
      ];
      return <article className="kp-pricing-card" key={plan.id || plan.code}>
        <div className="kp-pricing-card-header"><h3>{plan.packageName || plan.code}</h3><p className="kp-pricing-amount">{price || copy("តម្លៃមិនបានបញ្ជាក់", "Price not specified")}</p><p className="kp-pricing-desc">{plan.currency || ""}{Number.isInteger(plan.durationDays) && plan.durationDays >= 0 ? ` / ${packageLimit(plan.durationDays, lang)} ${copy("ថ្ងៃ", "days")}` : ""}</p></div>
        <ul className="kp-pricing-features">{facts.map(fact => <li key={fact}><Check size={16} aria-hidden="true" />{fact}</li>)}</ul>
        <Link to="/pricing" className="kp-button kp-button--outline">{copy("មើលព័ត៌មានកញ្ចប់", "Review package details")}</Link>
      </article>;
    })}
  </div>;
}
