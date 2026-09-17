import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoDiamondOutline,
  IoLockClosedOutline,
  IoQrCodeOutline,
  IoShieldCheckmarkOutline,
  IoSparkles,
  IoFlashOutline,
  IoHelpCircleOutline,
} from "react-icons/io5";

import { getTemplateById, KEEP_TEMPLATE_CODE } from "../templates/data/templatesData";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { paymentService } from "./paymentService";
import heroBg from "../../assets/icons/background.png";
import "./PaymentPages.css";

const ABA_STATIC_LINK = "https://pay.ababank.com/oRF8/vx2dp884";

const INCLUDED_FEATURES = [
  "រចនាបែបប្រពៃណីខ្មែរប្រណិត (Royal Khmer Wedding Theme)",
  "ផ្ញើតាម Telegram, Messenger, WhatsApp មិនដែនកំណត់",
  "តន្ត្រីពិរោះរណ្តំ និងចលនាបើកធៀបបែប 3D (Music & Animations)",
  "បង្កើតបញ្ជីភ្ញៀវ និងប្រព័ន្ធទទួលភ្ញៀវ RSVP ឌីជីថល",
  "កម្រងរូបភាព Pre-Wedding & វីដេអូកម្រិត HD",
  "ផែនទី Google Maps ទីតាំងពិធីការ និង QR Check-in",
];

export default function TemplateCheckoutPage() {
  const navigate = useNavigate();
  const { templateId = KEEP_TEMPLATE_CODE } = useParams();
  const [catalogList, setCatalogList] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    templateCatalogService
      .list()
      .then((templates) => {
        if (active) {
          setCatalogList(templates || []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Could not load template catalog");
        }
      })
      .finally(() => {
        if (active) {
          setCatalogLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const matchedTemplate = useMemo(() => {
    const fromCatalog = catalogList.find(
      (item) =>
        String(item.id) === String(templateId) ||
        item.code === templateId ||
        item.slug === templateId
    );

    if (fromCatalog) {
      return {
        id: fromCatalog.id,
        name: fromCatalog.name,
        image: fromCatalog.thumbnailUrl || "/facebook/all/03-card/cover-card.jpg",
        category: fromCatalog.category || "TRADITIONAL",
        description: fromCatalog.description,
      };
    }

    const fallback = getTemplateById(templateId) || getTemplateById(KEEP_TEMPLATE_CODE);
    const fallbackCatalog = catalogList[0];

    return {
      id: fallbackCatalog?.id || 2,
      name: fallback?.name || fallbackCatalog?.name || "Garden Royal Khmer Wedding",
      image: fallback?.image || fallbackCatalog?.thumbnailUrl || "/facebook/all/03-card/cover-card.jpg",
      category: fallback?.category || fallbackCatalog?.category || "TRADITIONAL",
      description: fallback?.description || fallbackCatalog?.description,
    };
  }, [catalogList, templateId]);

  const checkout = useMemo(
    () => ({
      templateId: matchedTemplate.id,
      templateName: matchedTemplate.name,
      packageName: "Premium",
      amount: "0.01",
      currency: "USD",
    }),
    [matchedTemplate]
  );

  const createOrder = async () => {
    if (!checkout.templateId) {
      setError("Template catalog is not available yet. Please refresh and try again.");
      return;
    }
    setCreating(true);
    setError("");

    try {
      const response = await paymentService.createStaticPaymentOrder(checkout);
      const paymentLink = response?.paymentLink || ABA_STATIC_LINK;

      const orderSnapshot = {
        orderCode: response?.orderCode,
        templateId: response?.templateId || checkout.templateId,
        templateName: response?.templateName || checkout.templateName,
        packageName: response?.packageName || checkout.packageName,
        amount: response?.amount || checkout.amount,
        currency: response?.currency || checkout.currency,
        paymentLink,
        status: response?.status || "PENDING",
      };

      sessionStorage.setItem("lastTemplatePaymentOrder", JSON.stringify(orderSnapshot));

      // Navigate to order status page for QR display and polling
      navigate(`/payments/${response.orderCode}/status`);

    } catch (err) {
      console.error("Create static ABA payment order failed:", err);
      setError(err.message || "Could not create payment order");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="checkout-theme-wrapper">
      {/* Background Decor */}
      <div
        className="checkout-bg"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="checkout-overlay"></div>
      </div>

      <main className="checkout-main-container">
        {/* Top Back Navigation */}
        <div className="checkout-nav-bar">
          <Link className="checkout-back-btn" to="/templates/browse">
            <IoArrowBackOutline />
            <span>ត្រឡប់ទៅមើលគំរូធៀបការ (Back to templates)</span>
          </Link>
          <div className="checkout-secure-tag">
            <IoShieldCheckmarkOutline />
            <span>100% SSL SECURE CHECKOUT</span>
          </div>
        </div>

        {/* Page Hero Header */}
        <header className="checkout-header">
          <span className="checkout-kicker">
            <IoSparkles /> PREMIUM TEMPLATE ACTIVATION
          </span>
          <h1 className="checkout-title">
            ទូទាត់ប្រាក់ <span className="gold-gradient-text">គំរូធៀបការពិសេស</span>
          </h1>
          <div className="checkout-divider">
            <span></span>
            <div className="diamond"></div>
            <span></span>
          </div>
          <p className="checkout-subtitle">
            ជ្រើសរើសទូទាត់តាម ABA KHQR ដើម្បីបើកដំណើរការគំរូភ្លាមៗ និងប្រើប្រាស់មុខងារពេញលេញ
          </p>
        </header>

        {/* Error Notification */}
        {error && (
          <div className="checkout-alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="checkout-grid-layout">
          {/* Left Column: Template & Features & Payment Method */}
          <div className="checkout-left-col">
            {/* Template Showcase Card */}
            <article className="checkout-card checkout-template-card">
              <div className="checkout-template-media">
                <img
                  src={matchedTemplate.image}
                  alt={checkout.templateName}
                  className="checkout-template-thumb"
                />
                <span className="checkout-badge-gold">
                  <IoDiamondOutline /> PREMIUM
                </span>
              </div>

              <div className="checkout-template-info">
                <span className="checkout-template-cat">
                  {matchedTemplate.category} TEMPLATE
                </span>
                <h2 className="checkout-template-name">{checkout.templateName}</h2>
                <p className="checkout-template-desc">
                  {matchedTemplate.description ||
                    "គំរូសន្លឹកការបែបប្រពៃណីខ្មែរប្រណិត រួចរាល់សម្រាប់បង្ហាញរូបភាព កាលវិភាគកម្មវិធី និង RSVP។"}
                </p>

                <div className="checkout-price-tag">
                  <span className="checkout-price-amount">
                    {checkout.currency} {checkout.amount}
                  </span>
                  <span className="checkout-price-period">/ ប្រើប្រាស់រហូតដល់ចប់កម្មវិធី</span>
                </div>
              </div>
            </article>

            {/* Included Features List Card */}
            <article className="checkout-card checkout-features-card">
              <h3 className="checkout-section-title">
                <IoSparkles /> អត្ថប្រយោជន៍ និងមុខងារដែលទទួលបាន (Included Features)
              </h3>
              <div className="checkout-features-list">
                {INCLUDED_FEATURES.map((feat, idx) => (
                  <div key={idx} className="checkout-feat-item">
                    <IoCheckmarkCircle className="checkout-feat-icon" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Payment Method Selector Card */}
            <article className="checkout-card checkout-method-card">
              <h3 className="checkout-section-title">
                <IoQrCodeOutline /> វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Method)
              </h3>

              <div className="checkout-method-option active">
                <div className="checkout-method-radio">
                  <span className="checkout-radio-inner"></span>
                </div>
                <div className="checkout-method-content">
                  <div className="checkout-method-head">
                    <div className="checkout-method-title">
                      <strong>ABA PAY / KHQR (Bakong Standard)</strong>
                      <span className="checkout-tag-instant">
                        <IoFlashOutline /> Instant Unlock
                      </span>
                    </div>
                    <span className="checkout-method-badge">ពេញនិយម & ងាយស្រួល</span>
                  </div>
                  <p className="checkout-method-sub">
                    ស្កេនទូទាត់តាមគ្រប់កម្មវិធីធនាគារក្នុងប្រទេសកម្ពុជា (ABA Mobile, ACLEDA, Canadia, Sathapana, etc.)
                  </p>
                </div>
              </div>

              {/* Test Mode Note */}
              <div className="checkout-test-notice">
                <div className="checkout-test-icon">
                  <IoHelpCircleOutline />
                </div>
                <div>
                  <strong>💡 របៀប Test Payment ($0.01 USD):</strong>
                  <p>
                    ទឹកប្រាក់កំណត់ត្រឹម $0.01 USD សម្រាប់ធ្វើតេស្តសាកល្បង។ បន្ទាប់ពីចុច Buy Template អ្នកអាចចូលទៅ Admin Dashboard (<code>/payments</code>) រួចចុច Confirm ដើម្បី Unlock គំរូនេះភ្លាមៗ!
                  </p>
                </div>
              </div>
            </article>
          </div>

          {/* Right Column: Order Summary & Action */}
          <div className="checkout-right-col">
            <aside className="checkout-card checkout-summary-card">
              <h3 className="checkout-summary-heading">សង្ខេបការបញ្ជាទិញ (Order Summary)</h3>

              <div className="checkout-summary-rows">
                <div className="checkout-summary-row">
                  <span>គំរូធៀបការ (Template)</span>
                  <strong className="text-right">{checkout.templateName}</strong>
                </div>
                <div className="checkout-summary-row">
                  <span>កញ្ចប់សេវា (Plan)</span>
                  <span>{checkout.packageName} License</span>
                </div>
                <div className="checkout-summary-row">
                  <span>តម្លៃគំរូ (Template Price)</span>
                  <span>{checkout.currency} {checkout.amount}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>ពន្ធអាករ (VAT / Fee 0%)</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="checkout-summary-divider"></div>

              {/* Total Due */}
              <div className="checkout-total-box">
                <div>
                  <span className="checkout-total-label">ទឹកប្រាក់សរុប (Total Due)</span>
                  <small className="checkout-total-sub">រួមបញ្ចូលទាំងសិទ្ធិប្រើប្រាស់ពេញលេញ</small>
                </div>
                <div className="checkout-total-price">
                  <span>{checkout.currency}</span>
                  <strong>{checkout.amount}</strong>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                className="checkout-pay-btn"
                disabled={creating || catalogLoading || !checkout.templateId}
                onClick={createOrder}
              >
                {creating ? (
                  <>
                    <span className="checkout-spinner"></span>
                    <span>កំពុងបង្កើត Order...</span>
                  </>
                ) : catalogLoading ? (
                  <span>Loading Template...</span>
                ) : (
                  <>
                    <IoLockClosedOutline />
                    <span>ទូទាត់តាម ABA KHQR ($0.01)</span>
                  </>
                )}
              </button>

              {/* Instant Activation Guarantee */}
              <div className="checkout-guarantee-box">
                <div className="checkout-guarantee-item">
                  <IoFlashOutline />
                  <span>បើកដំណើរការភ្លាមៗក្រោយទូទាត់រួច (Instant Digital Access)</span>
                </div>
                <div className="checkout-guarantee-item">
                  <IoShieldCheckmarkOutline />
                  <span>សុវត្ថិភាពខ្ពស់ 100% តាមប្រព័ន្ធធនាគារជាតិ Bakong</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
