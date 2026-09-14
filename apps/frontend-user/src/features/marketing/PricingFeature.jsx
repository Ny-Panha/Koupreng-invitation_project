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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700;800&family=Moul&family=Outfit:wght@600;700;800&display=swap');

        .khmer-modern-theme { background: #FCF8F2; font-family: 'Kantumruy Pro', sans-serif; }
        
        .pricing-wrapper {
          min-height: 100vh;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          position: relative;
          padding: 140px 20px 80px;
        }

        .glass-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(252, 248, 242, 0.4) 0%, rgba(252, 248, 242, 1) 1000%);
        }

        .container { position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; }

        /* Header Section */
        .header-content { text-align: center; margin-bottom: 60px; }
        .sub-title { font-size: 12px; font-weight: 700; color: #B0926A; display: block; margin-bottom: 10px; }
        .main-title { font-family: 'Moul', serif; font-size: clamp(26px, 5vw, 38px); color: #333; line-height: 1.5; }
        .gold-text { color: #B0926A; }
        
        .divider-modern { display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 20px; }
        .divider-modern span { width: 50px; height: 1px; background: #B0926A; opacity: 0.5; }
        .diamond { width: 8px; height: 8px; background: #B0926A; transform: rotate(45deg); }

        /* Pricing Cards */
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; align-items: stretch; }
        
        .pricing-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(176,146,106,0.15);
          padding: 48px 24px;
          border-radius: 30px;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
        }

        .pricing-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(176,146,106,0.1); border-color: #B0926A; }

        .pricing-card.premium { background: white; border: 2px solid #B0926A; box-shadow: 0 15px 35px rgba(176,146,106,0.15); }

        .badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #B0926A;
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .plan-name { font-family: 'Moul'; font-size: 19px; color: #7D6443; margin-bottom: 12px; }
        
        .price-tag {
          min-height: 56px;
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .amount {
          color: #2b2520;
          display: inline-block;
          line-height: 1.2;
        }

        .amount.usd-price {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 46px;
          font-weight: 800;
          letter-spacing: -1px;
          color: #2b2520;
        }

        .pricing-card.premium .amount.usd-price {
          color: #8D6E44;
          text-shadow: 0 2px 12px rgba(141, 110, 68, 0.2);
        }

        .amount.khmer-price {
          font-family: 'Moul', serif;
          font-size: 28px;
          font-weight: 700;
          color: #2b2520;
          letter-spacing: 0.5px;
          line-height: 1.3;
        }

        .plan-desc { font-size: 13px; color: #73675a; line-height: 1.5; white-space: nowrap; margin-top: 4px; font-weight: 500; }

        .features-list { margin: 40px 0; flex-grow: 1; }
        .feature-item { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 13.5px; color: #444; }
        .feature-item span { white-space: nowrap; }
        .check-icon { 
          width: 18px; height: 18px; min-width: 18px; flex-shrink: 0; background: rgba(176,146,106,0.1); 
          color: #B0926A; border-radius: 50%; display: flex; 
          align-items: center; justify-content: center; font-size: 10px; font-weight: bold;
        }

        .action-btn {
          padding: 15px;
          border-radius: 15px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          text-align: center;
          transition: 0.3s;
        }

        .btn-gold { background: #B0926A; color: white; border: none; }
        .btn-gold:hover { background: #7D6443; box-shadow: 0 10px 20px rgba(125,100,67,0.3); }

        .btn-outline { border: 1px solid #ddd; color: #555; }
        .btn-outline:hover { border-color: #B0926A; color: #B0926A; background: rgba(176,146,106,0.05); }

        @media (max-width: 768px) {
          .pricing-wrapper { padding-top: 120px; }
          .pricing-card { padding: 40px 25px; }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;
