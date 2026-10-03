import "./PricingContact.css";
import { ScrollReveal } from "../../shared/ui/ScrollReveal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Import Background
import heroBg from "../../assets/icons/background.png";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";

const getPlans = (t) => [
  {
    id: "basic",
    name: t("planBasicName") || "កញ្ចប់មង្គល",
    price: t("planBasicPrice") || "ឥតគិតថ្លៃ",
    desc: t("planBasicDesc") || "សាកសមសម្រាប់គូស្វាមីភរិយារៀបចំគម្រោងដំបូង",
    features: [
      t("planBasicFeat1") || "គ្រប់គ្រងភ្ញៀវរហូតដល់ ៥០ នាក់",
      t("planBasicFeat2") || "ធៀបការឌីជីថលគំរូមូលដ្ឋាន",
      t("planBasicFeat3") || "មុខងារ RSVP ទទួលការឆ្លើយតបអនឡាញ",
      t("planBasicFeat4") || "ផែនទីទីតាំងកម្មវិធី (Google Maps)",
      t("planBasicFeat5") || "បញ្ជីគ្រប់គ្រងកិច្ចការ និងថវិកា",
    ],
    btnText: t("btnStartNow") || "ចាប់ផ្ដើមឥតគិតថ្លៃ",
    featured: false,
  },
  {
    id: "pro",
    name: t("planProName") || "កញ្ចប់មាស",
    price: t("planProPrice") || "$19",
    desc: t("planProDesc") || "ល្អឥតខ្ចោះសម្រាប់ពិធីមង្គលការពេញលេញ និងស៊ីវិល័យ",
    features: [
      t("planProFeat1") || "គ្រប់គ្រងភ្ញៀវមិនកំណត់",
      t("planProFeat2") || "ធៀបការ Premium (ចម្រៀង & រូបថត HD)",
      t("planProFeat3") || "1 ភ្ញៀវ = 1 លីង & QR Code ផ្ទាល់ខ្លួន",
      t("planProFeat4") || "ស្កេន QR Check-in ចូលពិធីរហ័ស",
      t("planProFeat5") || "ទទួលចំណងដៃតាម KHQR បាគង",
      t("planProFeat6") || "រៀបចំតុ និងកៅអីអង្គុយ (Table Seating)",
    ],
    btnText: t("btnSelectGold") || "ជ្រើសរើសកញ្ចប់មាស",
    featured: true,
  },
  {
    id: "enterprise",
    name: t("planEntName") || "កញ្ចប់ពេជ្រ",
    price: t("planEntPrice") || "តម្លៃពិគ្រោះ",
    desc: t("planEntDesc") || "សម្រាប់ Wedding Planners និងកម្មវិធីខ្នាតធំ",
    features: [
      t("planEntFeat1") || "គ្រប់គ្រងកម្មវិធីមង្គលការច្រើន",
      t("planEntFeat2") || "Custom Domain ផ្ទាល់ខ្លួន",
      t("planEntFeat3") || "White-label (ដកស្លាកយីហោចេញ)",
      t("planEntFeat4") || "Export របាយការណ៍ភ្ញៀវ និងចំណងដៃ",
      t("planEntFeat5") || "ជំនួយការបច្ចេកទេសផ្ទាល់ ២៤/៧",
    ],
    btnText: t("btnContactSales") || "ទាក់ទងផ្នែកលក់",
    featured: false,
  },
];

const PricingPage = () => {
  const { text: t, lang } = useBackendMessages("pricing");
  const plans = getPlans(t);

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

          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div
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
                    to={plan.id === "enterprise" ? "/contact" : "/register"}
                    className={`action-btn ${plan.featured ? "btn-gold" : "btn-outline"}`}
                  >
                    {plan.btnText}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
