import { Link } from "react-router-dom";
import { Check, Minus, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { useAuth } from "../auth/hooks/useAuth";
import { useLanguageStore } from "../../stores/useLanguageStore";
import PricingFactors from "./components/PricingFactors";
import { packagePrice, packageLimit } from "./model/packagePresentation";
import { usePackageCatalog } from "./model/usePackageCatalog";
import "./MarketingPages.css";

export default function PricingFeature() {
  const lang = useLanguageStore(state => state.lang);
  const copy = (km, en) => lang === "en" ? en : km;
  const { isAuthenticated } = useAuth();
  const { catalog, reload } = usePackageCatalog();

  const rows = [
    ["maxInvitations", copy("ចំនួនសន្លឹកការ", "Invitations")],
    ["maxGuestsPerInvitation", copy("ភ្ញៀវក្នុងមួយសន្លឹកការ", "Guests per invitation")],
    ["durationDays", copy("រយៈពេល (ថ្ងៃ)", "Duration (days)")],
    ["premiumTemplatesEnabled", copy("សិទ្ធិគំរូប្រណិត", "Premium template access"), true],
    ["seatingEnabled", copy("ការរៀបចំកន្លែងអង្គុយ", "Seating management"), true],
    ["qrCheckInEnabled", copy("ស្កេនចូលពិធី", "QR check-in"), true],
  ];

  const value = (plan, key, boolean) => boolean
    ? plan[key] === true ? <><Check size={16} aria-hidden="true" />{copy("រួមបញ្ចូល", "Included")}</>
      : plan[key] === false ? <><Minus size={16} aria-hidden="true" />{copy("មិនរួមបញ្ចូល", "Not included")}</> : copy("មិនបានបញ្ជាក់", "Not specified")
    : packageLimit(plan[key], lang);

  const plans = catalog.items;

  const planActionUrl = (plan, price) => {
    if (price === null) return "/contact";
    const packageParam = plan.code ? `?package=${encodeURIComponent(plan.code)}` : "";
    if (isAuthenticated) {
      return `/dashboard/packages${packageParam}`;
    }
    return `/login?next=${encodeURIComponent(`/dashboard/packages${packageParam}`)}`;
  };

  const planActionLabel = (price) => {
    if (price === null) return copy("សួរអំពីកញ្ចប់នេះ", "Ask about this package");
    if (isAuthenticated) return copy("មើលកញ្ចប់ និងសិទ្ធិប្រើប្រាស់", "View package & eligibility");
    return copy("ចូលគណនីដើម្បីជ្រើសរើស", "Sign in to select package");
  };

  const questions = [
    [copy("តើការមើលគំរូផ្តល់សិទ្ធិប្រណិតទេ?", "Does a preview include premium access?"), copy("ការមើលគំរូជួយអ្នកស្វែងយល់ពីរចនាបទ។ សិទ្ធិប្រើប្រាស់គំរូប្រណិតត្រូវពិនិត្យតាមគណនី និងការបញ្ជាក់ការទូទាត់។", "A preview helps you explore the design. Premium access is checked against your account and confirmed payment.")],
    [copy("កញ្ចប់ និងគំរូប្រណិតខុសគ្នាដូចម្តេច?", "How do packages and individual designs differ?"), copy("កញ្ចប់កំណត់រយៈពេល កម្រិតប្រើប្រាស់ និងមុខងារដែលរួមបញ្ចូល។ ការទិញគំរូប្រណិតមួយមានការពិនិត្យសិទ្ធិ និងទំព័រទូទាត់របស់វា។ សូមពិនិត្យព័ត៌មានមុនបញ្ជាក់។", "A package defines duration, limits and included tools. An individual premium design has its own access and checkout checks. Review the details before confirming.")],
    [copy("ពេលណាសិទ្ធិត្រូវបានបើក?", "When is access activated?"), copy("ធ្វើតាមការណែនាំក្នុងគណនីរបស់អ្នក។ ការទូទាត់ដែលតម្រូវត្រូវបានពិនិត្យ និងបញ្ជាក់ មុនបើកសិទ្ធិ។ ការផ្ញើព័ត៌មានទូទាត់មិនមែនជាការបញ្ជាក់ភ្លាមៗទេ។", "Follow the instructions in your account. Required payments are verified before access is activated; sending payment details is not instant approval.")],
  ];

  return <div className="kp-product-page kp-plans-page" lang={lang}>
    <header className="kp-page-intro">
      <p className="kp-page-label">{copy("កញ្ចប់ និងសិទ្ធិប្រើប្រាស់", "Packages & pricing")}</p>
      <h1>{copy("ស្វែងយល់ពីគំរូ\nកញ្ចប់ និងសិទ្ធិប្រើប្រាស់។", "Transparent pricing\nfor memorable celebrations.")}</h1>
      <p>{copy("គំរូកំណត់រចនាបទ។ កញ្ចប់កំណត់កម្រិតប្រើប្រាស់ និងមុខងារ។ ជ្រើសរើសកញ្ចប់ដែលស័ក្តិសមសម្រាប់ពិធីរបស់អ្នក។", "Compare packages and choose the tier that fits your wedding celebration. Sign in whenever you are ready to checkout.")}</p>
      <Link className="kp-text-link" to="/templates">
        {copy("ស្វែងរកគំរូជាមុន", "Explore designs first")}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </header>

    <section className="kp-page-section" aria-label={copy("កញ្ចប់បច្ចុប្បន្ន", "Current packages")}>
      {catalog.status === "loading" && (
        <>
          <p role="status">{copy("កំពុងផ្ទុកកញ្ចប់បច្ចុប្បន្ន…", "Loading current packages…")}</p>
          <div className="kp-plan-grid" aria-hidden="true">
            {[1, 2, 3].map(id => <div className="kp-plan-skeleton" key={id} />)}
          </div>
        </>
      )}

      {catalog.status === "error" && (
        <div className="kp-page-state" role="alert">
          <h2>{copy("មិនអាចផ្ទុកកញ្ចប់បាន", "Packages could not be loaded")}</h2>
          <p>{copy("សូមសាកម្ដងទៀត ដើម្បីមើលព័ត៌មានបច្ចុប្បន្ន។", "Try again to load the current offers.")}</p>
          <button className="kp-button" type="button" onClick={reload}>
            {copy("សាកម្ដងទៀត", "Try again")}
          </button>
        </div>
      )}

      {catalog.status === "restricted" && (
        <div className="kp-page-state" role="alert">
          <h2>{copy("ត្រូវការចូលគណនីឡើងវិញ", "Sign in to check your access")}</h2>
          <p>{copy("មិនអាចមើលកញ្ចប់ដោយប្រើសម័យគណនីនេះបានទេ។", "Your current session cannot view these packages.")}</p>
          <Link className="kp-button" to="/login?next=%2Fpricing">
            {copy("ចូលគណនី", "Sign in")}
          </Link>
        </div>
      )}

      {catalog.status === "ready" && plans.length === 0 && (
        <div className="kp-page-state" role="status">
          <h2>{copy("មិនទាន់មានកញ្ចប់បច្ចុប្បន្នទេ", "No packages are currently available")}</h2>
          <p>{copy("អ្នកអាចមើលគំរូ ឬទាក់ទងក្រុមការងារសម្រាប់ព័ត៌មានបន្ថែម។", "Explore the invitation collection or contact us for more information.")}</p>
          <Link className="kp-text-link" to="/contact">{copy("ទាក់ទងក្រុមការងារ", "Contact the team")}</Link>
        </div>
      )}

      {catalog.status === "ready" && plans.length > 0 && (
        <div className="kp-plan-grid">
          {plans.map((plan, index) => {
            const price = packagePrice(plan, lang);
            const isFeatured = plan.code === "PRO";
            return (
              <article className={`kp-plan-card${isFeatured ? " kp-plan-card--featured" : ""}`} key={plan.id || index}>
                {isFeatured && (
                  <div className="kp-plan-badge">
                    <Sparkles size={14} aria-hidden="true" />
                    <span>{copy("ពេញនិយមបំផុត", "Most Popular")}</span>
                  </div>
                )}
                <h2>{plan.packageName || plan.code}</h2>
                <p className={`kp-plan-price${price === null ? " kp-plan-price--missing" : price.length > 12 ? " kp-plan-price--long" : ""}`}>
                  {price ?? copy("តម្លៃមិនទាន់មាន", "Price unavailable")}
                </p>
                {price !== null && (
                  <p className="kp-plan-term">
                    {plan.currency}{Number.isInteger(plan.durationDays) && plan.durationDays >= 0 ? ` · ${packageLimit(plan.durationDays, lang)} ${copy("ថ្ងៃ", "days")}` : ""}
                  </p>
                )}
                <p className="kp-plan-description">{plan.description}</p>
                <dl>
                  {rows.filter(([key, , boolean]) => boolean ? plan[key] === true : plan[key] != null).map(([key, label, boolean]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{value(plan, key, boolean)}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  to={planActionUrl(plan, price)}
                  className={`kp-button${price === null ? " kp-button--outline" : isFeatured ? " kp-button--primary" : ""}`}
                >
                  {planActionLabel(price)}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>

    {catalog.status === "ready" && plans.length > 0 && (
      <section className="kp-page-section kp-plan-compare" aria-labelledby="kp-compare-title">
        <div className="kp-page-section-head">
          <h2 id="kp-compare-title">{copy("ប្រៀបធៀបព័ត៌មានលម្អិត", "Compare the details")}</h2>
          <p>{copy("មុខងារ និងកម្រិតខាងក្រោមគឺជាព័ត៌មានពីកញ្ចប់បច្ចុប្បន្ន។", "Features and limits below come from the current package catalog.")}</p>
        </div>
        <div className="kp-compare-table" tabIndex={0} role="region" aria-labelledby="kp-compare-title">
          <table>
            <caption className="sr-only">{copy("តារាងប្រៀបធៀបកញ្ចប់", "Package feature comparison")}</caption>
            <thead>
              <tr>
                <th scope="col">{copy("ព័ត៌មាន", "Details")}</th>
                {plans.map((plan, index) => <th scope="col" key={plan.id || index}>{plan.packageName || plan.code}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(([key, label, boolean]) => (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  {plans.map((plan, index) => <td key={plan.id || index}><span>{value(plan, key, boolean)}</span></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="kp-compare-mobile">
          {plans.map((plan, index) => (
            <details key={plan.id || index}>
              <summary>{plan.packageName || plan.code}<Plus size={18} aria-hidden="true" /></summary>
              <dl>
                {rows.map(([key, label, boolean]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{value(plan, key, boolean)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      </section>
    )}

    <PricingFactors copy={copy} />

    <section className="kp-page-section kp-access-note">
      <div>
        <p className="kp-page-label">{copy("ស្វែងយល់ពីសិទ្ធិប្រើប្រាស់", "Understanding access")}</p>
        <h2>{copy("មើលគំរូដោយសេរី។\nពិនិត្យសិទ្ធិមុនជ្រើសរើស។", "Explore the design.\nReview your access.")}</h2>
        <p>{copy("រចនាបទសន្លឹកការ និងកញ្ចប់សេវាកម្មមានព័ត៌មានសិទ្ធិរបស់វា។ ពិនិត្យព័ត៌មានក្នុងគណនី មុនបង្កើត ឬបញ្ជាក់ការទូទាត់។", "Invitation designs and service packages have their own access details. Review your account information before creating an invitation or confirming a payment.")}</p>
      </div>
      <div className="kp-page-faq">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}<Plus size={18} aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>

    <section className="kp-guidance-strip">
      <div>
        <h2>{copy("ចង់ជ្រើសរើសឱ្យត្រូវតាមពិធីរបស់អ្នក?", "Planning something specific?")}</h2>
        <p>{copy("ប្រាប់យើងអំពីពិធី និងមុខងារដែលអ្នកត្រូវការ។", "Tell us about your event and the tools you need.")}</p>
      </div>
      <Link to="/contact" className="kp-button kp-button--outline">
        {copy("ទាក់ទងក្រុមការងារ", "Contact the team")}
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </section>
  </div>;
}
