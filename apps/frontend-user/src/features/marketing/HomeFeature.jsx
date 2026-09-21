import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "../../shared/ui/ScrollReveal";
import { AnimatedButton } from "../../shared/ui/AnimatedButton";
import { MagicCard } from "../../shared/ui/MagicCard";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import "./MarketingFeature.css";

import heroBg from "../../assets/icons/background.png";

const getPlans = (t) => [
  {
    id: "basic",
    name: t("planBasicName") || "គតិដៃគូ",
    price: "$0",
    desc: t("planBasicDesc") || "សម្រាប់ការរៀបចំដំបូង",
    features: [
      t("planBasicFeat1") || "ផែនការការងារ ៥ ចំណុច",
      t("planBasicFeat2") || "គ្រប់គ្រងភ្ញៀវ ៤០ នាក់",
      t("planBasicFeat3") || "ថវិការ ១ ព្រឹត្តិការណ៍",
    ],
  },
  {
    id: "pro",
    name: t("planProName") || "កញ្ចប់ប្រូ",
    price: "$19",
    desc: t("planProDesc") || "ពេញនិយមបំផុតសម្រាប់គូស្វាមីភរិយា",
    features: [
      t("planProFeat1") || "ផែនការមិនដែនកំណត់",
      t("planProFeat2") || "គ្រប់គ្រងភ្ញៀវមិនដែនកំណត់",
      t("planProFeat3") || "ការទូទាត់ Bakong QR",
      t("planProFeat4") || "គាំទ្រ ២៤/៧",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    name: t("planEntName") || "សហគ្រាស",
    price: t("planEntPrice") || "តម្លៃពិគ្រោះ",
    desc: t("planEntDesc") || "សម្រាប់ក្រុមហ៊ុនរៀបចំការ",
    features: [
      t("planEntFeat1") || "White-label Branding",
      t("planEntFeat2") || "គ្រប់គ្រងក្រុមការងារ",
      t("planEntFeat3") || "API Integration",
    ],
  },
];

export default function Home() {
  const { text: t } = useBackendMessages("home");
  const plans = getPlans(t);
  return (
    <div className="khmer-theme">
      {/* Background Section (Fixed for Mobile compatibility) */}
      <div className="fixed-bg-overlay">
        <div
          className="bg-image"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text-center"
          >
            <span className="khmer-sub">{t("subtitleDigitalWedding") || "មង្គលការឌីជីថល"}</span> <br />
            <h1 className="khmer-title">
              {t("titlePlan") || "រៀបចំពិធីមង្គលការ"}
              <br />
              <span className="gold-gradient">{t("titlePerfect") || "ដ៏ល្អឥតខ្ចោះ"}</span>
            </h1>
            <p className="khmer-p">
              {t("description") || "គ្រប់គ្រងភ្ញៀវ ថវិកា និងផែនការការងាររបស់អ្នក ក្នុងវេទិកាតែមួយ ប្រកបដោយភាពងាយស្រួល និងស៊ីវិល័យ។"}
            </p>
            <div className="hero-btns">
              <AnimatedButton to="/templates" className="btn-main-gold">
                {t("btnStart") || "ចាប់ផ្តើមបង្កើត"}
              </AnimatedButton>
              <Link to="/pricing" className="btn-outline">
                {t("btnPricing") || "មើលតម្លៃកញ្ចប់"}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ៣. Section: តើវាដំណើរការយ៉ាងដូចម្ដេច? (How it works) */}
      <section className="how-it-works">
        <ScrollReveal>
          <div className="section-head">
            <h2 className="khmer-title-small">{t("howItWorks") || "តើវាដំណើរការយ៉ាងដូចម្ដេច?"}</h2>
            <div className="gold-divider"></div>
          </div>
        </ScrollReveal>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-num">០១</div>
            <h3>
              {t("step1Choose") || "ជ្រើសរើស"}{" "}
              <Link to="/templates" className="step-link">
                {t("step1Templates") || "គំរូសន្លឹកការ"}
              </Link>
            </h3>
            <p>{t("step1Desc") || "ស្វែងរកស្ទីលដែលអ្នកស្រលាញ់បំផុត ពីបុរាណដល់សម័យទំនើប។"}</p>
          </div>
          <div className="step-card">
            <div className="step-num">០២</div>
            <h3>
              {t("step2Setup") || "រៀបចំ"}{" "}
              <Link to="/pricing" className="step-link">
                {t("step2Pricing") || "កញ្ចប់សេវា"}
              </Link>
            </h3>
            <p>{t("step2Desc") || "ជ្រើសរើសមុខងារដែលត្រូវនឹងតម្រូវការ និងថវិកាក្នុងក្តីស្រមៃ។"}</p>
          </div>
          <div className="step-card">
            <div className="step-num">០៣</div>
            <h3>
              {t("step3Find") || "ស្វែងរក"}{" "}
              <Link to="/venues" className="step-link">
                {t("step3Venues") || "ទីកន្លែង"}
              </Link>
            </h3>
            <p>{t("step3Desc") || "សម្រាំងទីតាំងរៀបការដ៏ស្រស់ស្អាតបំផុតសម្រាប់ភ្ញៀវកិត្តិយស។"}</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-modern" id="pricing-section">
        <ScrollReveal>
          <div className="section-head">
            <h2 className="khmer-title-small">{t("pricingTitle") || "ជ្រើសរើសកញ្ចប់ដែលសាកសម"}</h2>
            <div className="gold-divider"></div>
          </div>
        </ScrollReveal>

        <div className="pricing-container">
          {plans.map((plan, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <MagicCard className={`kh-card ${plan.featured ? "active" : ""}`}>
                {plan.featured && <div className="card-tag">{t("popular") || "ពេញនិយម"}</div>}
                <h3 className="card-name">{plan.name}</h3>
                <div className="card-price">
                  {plan.price}
                  <span>
                    {plan.id !== "enterprise" ? (t("perEvent") || "/ព្រឹត្តិការណ៍") : ""}
                  </span>
                </div>
                <p className="card-desc">{plan.desc}</p>
                <ul className="card-feats">
                  {plan.features.map((f, idx) => (
                    <li key={idx}>✓ {f}</li>
                  ))}
                </ul>
                <button className={`card-btn ${plan.featured ? "gold" : ""}`}>
                  {t("selectPlan") || "ជ្រើសរើសយកនេះ"}
                </button>
              </MagicCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ៤. Footer ពេញលេញ */}
      <footer className="kh-footer-main">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-logo">{t("footerLogo") || "គូព្រេង"}</h4>
            <p>{t("footerDesc") || "វេទិកាឌីជីថលឈានមុខគេ សម្រាប់ការរៀបចំមង្គលការនៅកម្ពុជា។"}</p>
          </div>
          <div className="footer-col">
            <h5>{t("footerServices") || "សេវាកម្ម"}</h5>
            <Link to="/templates">{t("footerTemplates") || "គំរូសន្លឹកការ"}</Link>
            <Link to="/pricing">{t("footerPricing") || "តម្លៃកញ្ចប់"}</Link>
            <Link to="/venues">{t("footerVenues") || "ទីកន្លែងរៀបការ"}</Link>
          </div>
          <div className="footer-col">
            <h5>{t("footerCompany") || "ក្រុមហ៊ុន"}</h5>
            <Link to="/about">{t("footerAbout") || "អំពីយើង"}</Link>
            <Link to="/contact">{t("footerContact") || "ទំនាក់ទំនង"}</Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-support-chat"))}
              style={{ background: "none", border: "none", color: "#aaa", padding: 0, font: "inherit", cursor: "pointer", textAlign: "left", display: "block", marginBottom: "12px", fontSize: "14px", transition: "0.3s" }}
            >
              {t("footerHelp") || "ជំនួយ"}
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            {t("footerCopyright") || "© 2026 Koupreng. រៀបចំឡើងដោយក្តីស្រលាញ់ សម្រាប់គូស្វាមីភរិយាខ្មែរ"}
          </p>
        </div>
      </footer>

      <style>{`
        /* --- Styles បន្ថែមសម្រាប់ Section ថ្មី --- */
        .khmer-theme { width: 100%; min-width: 0; overflow-x: hidden; background: #FCF8F2; }
        
        .how-it-works { padding: 80px 0; max-width: 1200px; margin: 0 auto; text-align: center; }
        .steps-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px; padding: 40px 20px; }
        .step-card { position: relative; padding: 30px; }
        .step-num { font-size: 60px; font-weight: 900; color: rgba(176,146,106,0.1); position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 1; }
        .step-card h3 { position: relative; z-index: 2; font-family: 'Moul'; font-size: 18px; margin-bottom: 15px; }
        .step-link { color: #B0926A; text-decoration: underline; }
        .step-card p { font-family: 'Kantumruy Pro'; color: #777; line-height: 1.6; }

        .kh-footer-main { background: #1a1510; color: #fff; padding: 80px 20px 20px; margin-top: 100px; }
        .footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 50px; }
        .footer-logo { font-family: 'Moul'; color: #B0926A; font-size: 24px; margin-bottom: 20px; }
        .footer-col h5 { font-family: 'Moul'; color: #fff; margin-bottom: 25px; font-size: 16px; }
        .footer-col a { display: block; color: #aaa; text-decoration: none; margin-bottom: 12px; font-family: 'Kantumruy Pro'; font-size: 14px; transition: 0.3s; }
        .footer-col a:hover { color: #B0926A; padding-left: 5px; }
        .footer-bottom { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: #666; font-family: 'Kantumruy Pro'; font-size: 13px; }

        /* --- Fixed Background Pattern --- */
        .fixed-bg-overlay { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .bg-image { width: 100%; height: 100%; background-size: cover; background-position: center top; }

        /* --- រក្សារចនាបថចាស់ដែលបងមាន --- */
        .hero-modern { width: 100%; min-width: 0; min-height: 100svh; height: auto; position: relative; display: flex; align-items: center; justify-content: center; text-align: center; padding: 120px 16px 64px; overflow: hidden; }
        .hero-content { position: relative; z-index: 10; width: min(100%, 800px); min-width: 0; }
        .khmer-title { font-family: 'Moul', serif; padding-top: 15px; font-size: clamp(30px, 8vw, 50px); color: #333; line-height: 1.3; overflow-wrap: anywhere; }
        .gold-gradient { background: linear-gradient(90deg, #B0926A, #D4AF37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .khmer-sub { font-family: 'Kantumruy Pro', sans-serif; font-size: 16px; color: #B0926A; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
        .khmer-p { font-family: 'Kantumruy Pro', sans-serif; font-size: 16px; color: #555; line-height: 1.8; margin-top: 20px; max-width: 600px; margin-left: auto; margin-right: auto; overflow-wrap: anywhere; }
        .hero-btns { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px; }
        .btn-main-gold { display: inline-block; background: linear-gradient(135deg, #B0926A, #D4AF37); color: #fff; padding: 12px 30px; border-radius: 30px; font-family: 'Kantumruy Pro'; font-weight: 700; text-decoration: none; transition: 0.3s; box-shadow: 0 4px 15px rgba(176,146,106,0.3); }
        .btn-main-gold:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(176,146,106,0.4); }
        .btn-outline { border: 2px solid #B0926A; color: #B0926A; padding: 12px 30px; border-radius: 30px; font-family: 'Kantumruy Pro'; font-weight: 700; text-decoration: none; transition: 0.3s; }
        .btn-outline:hover { background: rgba(176,146,106,0.1); }
        .pricing-modern { padding: 100px 0; max-width: 1200px; margin: 0 auto; }
        .section-head { text-align: center; margin-bottom: 50px; }
        .khmer-title-small { font-family: 'Moul', serif; font-size: 26px; color: #333; }
        .gold-divider { width: 60px; height: 4px; background: #B0926A; margin: 15px auto; }
        .pricing-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .kh-card { background: white; padding: 40px; border-radius: 20px; border: 1px solid rgba(176,146,106,0.1); text-align: center; position: relative; }
        .kh-card.active { border: 2px solid #B0926A; transform: translateY(-10px); }
        .card-tag { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #B0926A; color: white; padding: 5px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .card-name { font-family: 'Moul'; color: #7D6443; margin-bottom: 15px; }
        .card-price { font-size: 36px; font-weight: 800; color: #333; }
        .card-feats { list-style: none; margin: 30px 0; text-align: left; }
        .card-feats li { font-family: 'Kantumruy Pro'; padding: 8px 0; color: #555; border-bottom: 1px solid #f5f5f5; }
        .card-btn { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ddd; background: white; font-family: 'Kantumruy Pro'; font-weight: 700; cursor: pointer; }
        .card-btn.gold { background: #B0926A; color: white; border: none; }
        @media (max-width: 560px) {
          .hero-modern { min-height: 100svh; padding: 104px 18px 56px; }
          .khmer-title { font-size: clamp(28px, 9vw, 36px); }
          .khmer-p { font-size: 14px; line-height: 1.75; }
          .btn-main-gold, .btn-outline { padding: 11px 22px; font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
