import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBackOutline, IoSparkles, IoShieldCheckmarkOutline } from "react-icons/io5";
import PaymentQrCard from "./PaymentQrCard";
import { statusMessage } from "./paymentStatus";
import { paymentService } from "./paymentService";
import heroBg from "../../assets/icons/background.png";
import "./PaymentPages.css";
import { packagePrice } from "../marketing/model/packagePresentation";
import { useLanguageStore } from '@/stores/useLanguageStore';

export default function PaymentStatusPage() {
  const en = useLanguageStore(state => state.lang) === 'en';
  const navigate = useNavigate();
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleRetry = async () => {
    if (!order?.templateId || !order.templateName || !order.packageName || packagePrice({ price: order.amount, currency: order.currency }, "en") === null) {
      setError("Could not verify this offer. Open the template catalog before starting another order.");
      return;
    }
    try {
      setLoading(true);
      const response = await paymentService.createStaticPaymentOrder({
        templateId: order.templateId,
        templateName: order.templateName,
        packageName: order.packageName,
        amount: order.amount,
        currency: order.currency,
      });
      navigate(`/payments/${response.orderCode}/status`, { replace: true });
      setOrder(response);
    } catch (err) {
      setError(err.message || "Failed to generate new payment order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true); setOrder(null); setError("");
    paymentService
      .getTemplateOrder(orderCode)
      .then((data) => {
        if (!data || Array.isArray(data) || data.orderCode !== orderCode || !data.status) throw new Error("Payment details are unavailable. Check your payment history or try again.");
        if (active) {
          setOrder(data);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Could not load payment status");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [orderCode]);

  return (
    <div className="checkout-theme-wrapper">
      {/* Background Decor */}
      <div
        className="checkout-bg"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="checkout-overlay"></div>
      </div>

      <main className="checkout-main-container" style={{ maxWidth: "860px" }}>
        {/* Navigation Bar */}
        <div className="checkout-nav-bar">
          <Link className="checkout-back-btn" to="/templates/browse">
            <IoArrowBackOutline />
            <span>ត្រឡប់ទៅមើលគំរូ (Back to templates)</span>
          </Link>
          <div className="checkout-secure-tag">
            <IoShieldCheckmarkOutline />
            <span>PAYMENT VERIFICATION</span>
          </div>
        </div>

        {/* Hero Header */}
        <header className="checkout-header">
          <span className="checkout-kicker">
            <IoSparkles /> {en ? 'Payment status' : 'ស្ថានភាពការទូទាត់'}
          </span>
          <h1 className="checkout-title">
            {en ? 'Review your payment' : 'ពិនិត្យការទូទាត់របស់អ្នក'}
          </h1>
          <div className="checkout-divider">
            <span></span>
            <div className="diamond"></div>
            <span></span>
          </div>
          <p className="checkout-subtitle">
            {order
              ? statusMessage(order.status)
              : "សូមពិនិត្យព័ត៌មានការទូទាត់ / Check your payment details"}
          </p>
        </header>

        {loading && (
          <div className="checkout-card" style={{ textAlign: "center", padding: "40px" }}>
            <span className="checkout-spinner" style={{ borderColor: "#b0926a", borderTopColor: "transparent", margin: "0 auto 12px" }}></span>
            <p role="status" style={{ margin: 0, fontWeight: 600 }}>{en ? 'Loading payment details…' : 'កំពុងទាញយកព័ត៌មានការទូទាត់…'}</p>
          </div>
        )}

        {error && (
          <div className="checkout-alert-error" role="alert">
            <span>⚠️ {error}</span>
            <Link to="/app/payments">ប្រវត្តិការទូទាត់ / Payment history</Link>
          </div>
        )}

        {order && <PaymentQrCard order={order} onStatusChange={setOrder} onRetry={handleRetry} />}

        <div className="payment-footer-links">
          <Link to="/dashboard">⬅️ ផ្ទាំងគ្រប់គ្រង (Dashboard)</Link>
          <span>•</span>
          <Link to="/templates/browse">ស្វែងរកគំរូធៀបការ (Browse Templates)</Link>
        </div>
      </main>
    </div>
  );
}
