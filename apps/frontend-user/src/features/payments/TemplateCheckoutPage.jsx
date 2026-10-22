import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBackOutline, IoLockClosedOutline, IoQrCodeOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { packagePrice } from "../marketing/model/packagePresentation";

import { getTemplateById, KEEP_TEMPLATE_CODE } from "../templates/data/templatesData";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { paymentService } from "./paymentService";
import { checkoutOffer } from "./checkoutOffer";
import heroBg from "../../assets/icons/background.png";
import "./PaymentPages.css";

export default function TemplateCheckoutPage() {
  const navigate = useNavigate();
  const lang = useLanguageStore(state => state.lang);
  const copy = (kh, en) => lang === "en" ? en : kh;
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
        ...fromCatalog,
        id: fromCatalog.id,
        name: fromCatalog.name,
        image: fromCatalog.thumbnailUrl || "/facebook/all/03-card/cover-card.jpg",
        category: fromCatalog.category || "TRADITIONAL",
        description: fromCatalog.description,
      };
    }

    const fallback = getTemplateById(templateId);

    return {
      id: null,
      name: fallback?.name || "Template unavailable",
      image: fallback?.image || "/facebook/all/03-card/cover-card.jpg",
      category: fallback?.category || "TRADITIONAL",
      description: fallback?.description,
    };
  }, [catalogList, templateId]);

  const checkout = useMemo(
    () => ({
      templateId: matchedTemplate.id,
      templateName: matchedTemplate.name,
      packageName: "Premium",
      ...checkoutOffer(matchedTemplate.id ? matchedTemplate : null, templateId),
    }),
    [matchedTemplate, templateId]
  );

  const createOrder = async () => {
    if (!checkout.templateId || !checkout.eligible) {
      setError("Template catalog is not available yet. Please refresh and try again.");
      return;
    }
    setCreating(true);
    setError("");

    try {
      const response = await paymentService.createStaticPaymentOrder(checkout);
      if (!response?.orderCode || !/^[A-Za-z0-9_-]{1,100}$/.test(response.orderCode) || Number(response.templateId) !== Number(checkout.templateId) || !response.status) {
        throw new Error(copy("ម៉ាស៊ីនមេមិនបានបញ្ជាក់ការបញ្ជាទិញទេ។ សូមពិនិត្យប្រវត្តិការទូទាត់ មុនសាកម្ដងទៀត។", "The server did not confirm this order. Check payment history before trying again."));
      }
      const paymentLink = response.paymentLink || "";

      const orderSnapshot = { orderCode: response.orderCode, templateId: response.templateId, templateName: response.templateName,
        packageName: response.packageName, amount: response.amount, currency: response.currency, paymentLink, status: response.status };
      try { sessionStorage.setItem("lastTemplatePaymentOrder", JSON.stringify(orderSnapshot)); }
      catch { /* The confirmed server order remains usable when tab storage is unavailable. */ }

      // Navigate to order status page for QR display and polling
      navigate(`/payments/${response.orderCode}/status`);

    } catch (err) {
      console.error("Create static ABA payment order failed:", err);
      setError(err.message || "Could not create payment order");
    } finally {
      setCreating(false);
    }
  };

  const amountLabel = checkout.eligible ? packagePrice({price: checkout.amount, currency: checkout.currency}, lang) : null;
  const previewPath = `/templates/${encodeURIComponent(matchedTemplate.code || templateId)}`;
  return <div className="checkout-theme-wrapper">
    <div className="checkout-bg" style={{backgroundImage:`url(${heroBg})`}} aria-hidden="true"><div className="checkout-overlay"/></div>
    <section className="checkout-main-container" aria-busy={creating || catalogLoading}>
      <nav className="checkout-nav-bar" aria-label={copy("ជម្រើសការទូទាត់", "Checkout navigation")}><Link className="checkout-back-btn" to="/templates"><IoArrowBackOutline aria-hidden="true"/>{copy("ត្រឡប់ទៅគំរូ", "Back to designs")}</Link><Link to="/app/payments">{copy("ប្រវត្តិការទូទាត់", "Payment history")}</Link></nav>
      <header className="checkout-header"><p className="checkout-kicker">{copy("សិទ្ធិប្រើគំរូ", "Template access")}</p><h1 className="checkout-title">{copy("ពិនិត្យមុនទូទាត់", "Review your template order")}</h1><p className="checkout-subtitle">{copy("ពិនិត្យគំរូ តម្លៃ និងរូបិយប័ណ្ណ។ ការបញ្ជាទិញនឹងត្រូវបង្កើតមុនបង្ហាញតំណទូទាត់។", "Check the design, amount and currency. Your order is created before its payment link is shown.")}</p></header>
      {error && <div className="checkout-alert-error" role="alert">{error}</div>}
      <div className="checkout-grid-layout">
        <div className="checkout-left-col">
          <article className="checkout-card checkout-template-card"><div className="checkout-template-media"><img src={matchedTemplate.image} alt={checkout.templateName} className="checkout-template-thumb"/></div><div className="checkout-template-info"><h2 className="checkout-template-name">{checkout.templateName}</h2><p>{copy("មើលគំរូនេះ និងពិនិត្យព័ត៌មាន មុនស្នើការបញ្ជាទិញ។", "Preview this design and review its details before creating an order.")}</p><Link to={previewPath}>{copy("មើលគំរូ", "Preview design")}</Link></div></article>
          <article className="checkout-card checkout-method-card"><h2 className="checkout-section-title"><IoQrCodeOutline aria-hidden="true"/>ABA PayWay</h2><p>{copy("QR នៅទំព័របន្ទាប់បើកតំណ PayWay។ វាមិនមែនជា KHQR ផ្ទាល់ខ្លួន ដែលកំណត់ចំនួនទឹកប្រាក់ជាមុនទេ។ សូមពិនិត្យអ្នកទទួល ចំនួនទឹកប្រាក់ និងរូបិយប័ណ្ណក្នុង PayWay។", "The QR on the next page opens a PayWay link. It is not a personalized KHQR payload with a locked amount. Check the recipient, amount and currency in PayWay.")}</p><p>{copy("ការស្នើពិនិត្យមិនបញ្ជាក់ការទូទាត់ទេ។ សិទ្ធិត្រូវបានផ្ដល់ក្រោយម៉ាស៊ីនមេផ្ទៀងផ្ទាត់ប៉ុណ្ណោះ។", "Requesting review does not confirm payment. Access follows verification by the server.")}</p></article>
        </div>
        <aside className="checkout-card checkout-summary-card"><h2 className="checkout-summary-heading">{copy("សង្ខេបការបញ្ជាទិញ", "Order summary")}</h2><dl className="checkout-summary-rows"><div className="checkout-summary-row"><dt>{copy("គំរូ", "Design")}</dt><dd>{checkout.templateName}</dd></div><div className="checkout-summary-row"><dt>{copy("តម្លៃដែលបានអនុម័ត", "Approved offer")}</dt><dd>{amountLabel || copy("មិនមានការផ្ដល់ជូនបច្ចុប្បន្ន", "Current offer unavailable")}</dd></div></dl><p>{copy("តម្លៃ និងសិទ្ធិប្រើប្រាស់នឹងត្រូវពិនិត្យម្ដងទៀតពេលម៉ាស៊ីនមេបង្កើតការបញ្ជាទិញ។", "The server checks the amount and eligibility again when creating your order.")}</p>
          <button type="button" className="checkout-pay-btn" disabled={creating || catalogLoading || !checkout.templateId || !checkout.eligible || !amountLabel} onClick={createOrder}><IoLockClosedOutline aria-hidden="true"/>{creating ? copy("កំពុងបង្កើតការបញ្ជាទិញ…", "Creating order…") : catalogLoading ? copy("កំពុងផ្ទុកការផ្ដល់ជូន…", "Loading offer…") : copy("បង្កើតការបញ្ជាទិញ", "Create payment order")}</button>
          {!catalogLoading && !checkout.eligible && <p role="status">{copy("មិនទាន់មានការផ្ដល់ជូនដែលបានអនុម័តសម្រាប់គំរូនេះទេ។ សូមត្រឡប់ទៅគំរូ ឬទាក់ទងក្រុមការងារ។", "An approved offer is unavailable for this design. Return to the catalog or contact support.")}</p>}
          <p className="checkout-guarantee-item"><IoShieldCheckmarkOutline aria-hidden="true"/>{copy("សិទ្ធិត្រូវការការផ្ទៀងផ្ទាត់ការទូទាត់", "Access requires verified payment")}</p><Link to="/contact">{copy("ជំនួយការទូទាត់", "Payment help")}</Link>
        </aside>
      </div>
    </section>
  </div>;
}
