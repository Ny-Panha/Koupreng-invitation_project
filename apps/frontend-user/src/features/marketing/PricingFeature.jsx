import { useEffect, useState } from "react";
import subscriptionService from "../subscriptions/subscriptionService";
import { useAuth } from "../auth/hooks/useAuth";
import { MagicCard } from "../../shared/ui/MagicCard";
import "./PricingContact.css";
import { ScrollReveal } from "../../shared/ui/ScrollReveal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Import Background
import heroBg from "../../assets/icons/background.png";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";

function getPlans(packages, lang) {
  const copy = (kh, en) => lang === "en" ? en : kh;
  return packages.map((plan) => ({
    id: plan.id,
    name: plan.packageName || plan.code,
    price: new Intl.NumberFormat(lang === "en" ? "en-US" : "km-KH", { style: "currency", currency: plan.currency || "USD" }).format(Number(plan.price)),
    desc: plan.description || "",
    features: [
      plan.maxInvitations != null && `${copy("ចំនួនសន្លឹកការ", "Invitations")}: ${plan.maxInvitations}`,
      plan.maxGuestsPerInvitation != null && `${copy("ភ្ញៀវក្នុងមួយសន្លឹកការ", "Guests per invitation")}: ${plan.maxGuestsPerInvitation}`,
      plan.durationDays != null && `${copy("រយៈពេល (ថ្ងៃ)", "Duration (days)")}: ${plan.durationDays}`,
      plan.premiumTemplatesEnabled && copy("សិទ្ធិប្រើគំរូប្រណិត", "Premium template access"),
      plan.qrCheckInEnabled && copy("ស្កេន QR ចូលពិធី", "QR check-in"),
      plan.seatingEnabled && copy("ការរៀបចំកន្លែងអង្គុយ", "Seating management"),
    ].filter(Boolean),
    btnText: copy("មើលកញ្ចប់ និងសិទ្ធិប្រើប្រាស់", "View package and eligibility"),
  }));
}

const PricingPage = () => {
  const { text: t, lang } = useBackendMessages("pricing");
  const { isAuthenticated } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    if (!isAuthenticated) { setLoading(false); return undefined; }
    setLoading(true); setError("");
    subscriptionService.packages().then((items) => {
      if (active) setPackages(Array.isArray(items) ? items : []);
    }).catch(() => {
      if (active) setError(lang === "en" ? "Current packages could not be loaded." : "មិនអាចផ្ទុកកញ្ចប់បច្ចុប្បន្នបាន។");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lang, reload, isAuthenticated]);
  const plans = getPlans(packages, lang);

  return (
    <div className="khmer-modern-theme">
      <section
        className="pricing-wrapper"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="glass-overlay"></div>

        <div className="container">
          <ScrollReveal>
            <div className="header-content">
              <motion.span
                initial={{ opacity: 0, letterSpacing: "0px" }}
                animate={{ opacity: 1, letterSpacing: "2px" }}
                className="sub-title"
              >
                {t("subtitle") || "កញ្ចប់សេវាកម្មធៀបការឌីជីថល"}
              </motion.span>
              <h1 className="main-title">
                {t("titlePlan") || "ជ្រើសរើសសេវាកម្ម"}
                <br />
                {lang === 'km' ? "ដែល" : " "}<span className="gold-text">{t("titlePerfect") || "សាកសមបំផុត"}</span>
              </h1>
              <div className="divider-modern">
                <span></span>
                <div className="diamond"></div>
                <span></span>
              </div>
            </div>
          </ScrollReveal>

          {loading && <p role="status">{lang === "en" ? "Loading current packages…" : "កំពុងផ្ទុកកញ្ចប់បច្ចុប្បន្ន…"}</p>}
          {error && <p role="alert">{error} <button type="button" className="action-btn btn-outline" onClick={() => setReload((value) => value + 1)}>{lang === "en" ? "Try again" : "សាកម្ដងទៀត"}</button></p>}
          {!isAuthenticated && <p className="home-invitation-benefits">{lang === "en" ? "Sign in to view current package prices, limits and eligibility." : "សូមចូលគណនីដើម្បីមើលតម្លៃកញ្ចប់ កម្រិតប្រើប្រាស់ និងសិទ្ធិបច្ចុប្បន្ន។"} <Link to="/login?next=%2Fdashboard%2Fpackages" className="action-btn btn-outline">{lang === "en" ? "View current packages" : "មើលកញ្ចប់បច្ចុប្បន្ន"}</Link></p>}
          {isAuthenticated && !loading && !error && !plans.length && <p role="status">{lang === "en" ? "No packages are currently available." : "មិនទាន់មានកញ្ចប់បច្ចុប្បន្នទេ។"}</p>}
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <MagicCard
                  className={`pricing-card ${plan.featured ? "premium" : ""}`}
                >
                  {plan.featured && <div className="badge">{t("recommended") || "ពេញនិយមបំផុត"}</div>}

                  <div className="card-top">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="price-tag">
                      <span className={`amount ${plan.price.includes("$") ? "usd-price" : "khmer-price"}`}>
                        {plan.price}
                      </span>
                    </div>
                    <p className="plan-desc">{plan.desc}</p>
                  </div>

                  <div className="features-list">
                    {plan.features.map((f, idx) => (
                      <div key={idx} className="feature-item">
                        <div className="check-icon">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/dashboard/packages"
                    className={`action-btn ${plan.featured ? "btn-gold" : "btn-outline"}`}
                  >
                    {plan.btnText}
                  </Link>
                </MagicCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
