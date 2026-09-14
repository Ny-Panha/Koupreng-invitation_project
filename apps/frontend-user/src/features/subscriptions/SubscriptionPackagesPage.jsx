import { useCallback, useEffect, useState } from "react";
import {
  Crown,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Clock,
  Award
} from "lucide-react";
import { toast } from "../../shared/ui/toast";
import subscriptionService from "./subscriptionService";
import "../enterprise/EnterprisePages.css";

function money(amount, currency = "USD") {
  const value = Number(amount || 0);
  if (value === 0) return "ឥតគិតថ្លៃ (Free)";
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(value);
}

const PACKAGE_BADGES = {
  FREE: { label: "សាមញ្ញ (Starter)", color: "#64748b", bg: "#f1f5f9", icon: Sparkles },
  SILVER: { label: "ពេញនិយម (Silver)", color: "#0284c7", bg: "#e0f2fe", icon: Zap },
  GOLD: { label: "ប្រណិត VIP (Gold)", color: "#b45309", bg: "#fef3c7", icon: Crown, featured: true },
  VIP: { label: "VIP Unlimited", color: "#7c3aed", bg: "#ede9fe", icon: Award, featured: true },
};

export default function SubscriptionPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [paymentModal, setPaymentModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [plans, currentPlan, subscriptionHistory] = await Promise.all([
        subscriptionService.packages(),
        subscriptionService.current(),
        subscriptionService.history(),
      ]);
      setPackages(plans || []);
      setCurrent(currentPlan || null);
      setHistory(subscriptionHistory || []);
    } catch (err) {
      setError(err.message || "មិនអាចទាញយកទិន្នន័យកញ្ចប់សេវាបានទេ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const purchase = async (plan) => {
    setSavingId(plan.id);
    setError("");
    setMessage("");
    try {
      const response = await subscriptionService.purchase(plan.id);
      if (response.active) {
        toast("កញ្ចប់សេវាត្រូវបានបើកដំណើរការដោយជោគជ័យ! 🎉");
        await load();
      } else {
        setPaymentModal({
          plan,
          orderCode: response.orderCode,
          amount: response.amount || plan.price,
          currency: response.currency || plan.currency || "USD",
          qrCode: response.qrPayload || response.qrCode,
        });
        toast("បានបង្កើតការបញ្ជាទិញ សូមបង់ប្រាក់តាម QR Code");
      }
    } catch (err) {
      setError(err.message || "មិនអាចជាវកញ្ចប់សេវាកម្មបានទេ");
      toast(err.message || "មិនអាចជាវកញ្ចប់សេវាបានទេ");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <main className="enterprise-page">
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <Sparkles className="spin" size={32} style={{ color: "#d97706", marginBottom: "12px" }} />
          <div>កំពុងទាញយកព័ត៌មានកញ្ចប់សេវាកម្ម...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="enterprise-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header Banner */}
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#fef3c7",
          color: "#b45309",
          padding: "6px 16px",
          borderRadius: "999px",
          fontSize: "0.85rem",
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          <Crown size={16} /> គម្រោងសេវាកម្មឌីជីថល (Packages & Pricing)
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0" }}>
          ជ្រើសរើសកញ្ចប់សេវាកម្មដែលស័ក្តិសមសម្រាប់អ្នក
        </h1>
        <p style={{ fontSize: "1rem", color: "#64748b", maxWidth: "680px", margin: "0 auto" }}>
          ដោះសោរមុខងារពិសេសៗដូចជា ការស្កេន QR Code មាត់រោងការ, Templates ប្រណិត, គ្រប់គ្រងតុភ្ញៀវ និងស្ថិតិលម្អិត។
        </p>
      </header>

      {message && <div className="enterprise-message" style={{ marginBottom: "20px" }}>{message}</div>}
      {error && <div className="enterprise-error" style={{ marginBottom: "20px" }}>{error}</div>}

      {/* Current Active Plan Card */}
      {current && (
        <section style={{
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          color: "#ffffff",
          borderRadius: "16px",
          padding: "20px 28px",
          marginBottom: "36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(15, 118, 110, 0.3)"
        }}>
          <div>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.85, fontWeight: 700 }}>
              កញ្ចប់សេវាកំពុងប្រើប្រាស់ (Active Plan)
            </span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
              {current.packagePlan?.packageName || "Standard Plan"}
              <span style={{ fontSize: "0.75rem", background: "#34d399", color: "#064e3b", padding: "4px 10px", borderRadius: "999px", fontWeight: 700 }}>
                {current.status}
              </span>
            </div>
          </div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
            {current.endDate ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Clock size={16} /> ផុតកំណត់៖ {new Intl.DateTimeFormat("km-KH", { dateStyle: "long" }).format(new Date(current.endDate))}
              </span>
            ) : "គ្មានកាលកំណត់ (Lifetime Access)"}
          </div>
        </section>
      )}

      {/* Pricing Showcase Grid */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginBottom: "48px"
      }}>
        {packages.map((plan) => {
          const badge = PACKAGE_BADGES[plan.code?.toUpperCase()] || PACKAGE_BADGES.SILVER;
          const isCurrentPlan = current?.packagePlan?.id === plan.id;
          const isFeatured = badge.featured;

          return (
            <article
              key={plan.id}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: isFeatured ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: isFeatured ? "0 20px 30px -10px rgba(245, 158, 11, 0.15)" : "0 4px 12px rgba(0,0,0,0.03)",
                transform: isFeatured ? "scale(1.02)" : "none",
                transition: "all 0.3s ease"
              }}
            >
              {isFeatured && (
                <div style={{
                  position: "absolute",
                  top: "-14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#ffffff",
                  padding: "4px 14px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  boxShadow: "0 2px 6px rgba(217, 119, 6, 0.4)"
                }}>
                  🌟 ពេញនិយមបំផុត (POPULAR)
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: badge.color,
                  background: badge.bg,
                  marginBottom: "8px"
                }}>
                  {badge.label}
                </span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                  {plan.packageName}
                </h2>
                <p style={{ fontSize: "0.88rem", color: "#64748b", minHeight: "40px", margin: 0 }}>
                  {plan.description || "កញ្ចប់គ្រប់គ្រងធៀបការឌីជីថល"}
                </p>
              </div>

              <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>
                  {money(plan.price, plan.currency)}
                </span>
                {Number(plan.price || 0) > 0 && (
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem", marginLeft: "6px" }}>
                    / {plan.durationDays ? `${plan.durationDays} ថ្ងៃ` : "កម្មវិធី"}
                  </span>
                )}
              </div>

              {/* Feature Checklist */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span>បង្កើតធៀបការបាន៖ <strong>{plan.maxInvitations ?? "មិនកំណត់ (Unlimited)"}</strong></span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span>ចំនួនភ្ញៀវក្នុងធៀប៖ <strong>{plan.maxGuestsPerInvitation ?? plan.maxGuests ?? "មិនកំណត់"} នាក់</strong></span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span>សមាជិកជួយរៀបចំ៖ <strong>{plan.maxTeamMembers ?? 1} នាក់</strong></span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span>ស្កេន QR Check-in មាត់រោងការ</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span>ទាញយក និងនាំចូលបញ្ជីភ្ញៀវ Excel/CSV</span>
                </li>
                {plan.premiumTemplatesEnabled && (
                  <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "#b45309", fontWeight: 700 }}>
                    <Crown size={18} color="#d97706" />
                    <span>ដោះសោរគ្រប់ Premium Templates ទាំងអស់</span>
                  </li>
                )}
              </ul>

              <button
                type="button"
                disabled={savingId === plan.id || isCurrentPlan}
                onClick={() => purchase(plan)}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: isCurrentPlan ? "default" : "pointer",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: isCurrentPlan
                    ? "#e2e8f0"
                    : isFeatured
                      ? "linear-gradient(135deg, #d97706, #b45309)"
                      : "#0f766e",
                  color: isCurrentPlan ? "#64748b" : "#ffffff",
                  boxShadow: isCurrentPlan ? "none" : "0 4px 14px rgba(0,0,0,0.12)",
                  transition: "all 0.2s ease"
                }}
              >
                {savingId === plan.id ? (
                  "កំពុងដំណើរការ..."
                ) : isCurrentPlan ? (
                  "កញ្ចប់កំពុងប្រើបច្ចុប្បន្ន"
                ) : Number(plan.price || 0) > 0 ? (
                  <>ជាវឥឡូវនេះ (Upgrade) <ArrowRight size={16} /></>
                ) : (
                  "ចាប់ផ្តើមឥតគិតថ្លៃ"
                )}
              </button>
            </article>
          );
        })}
      </section>

      {/* Payment Instructions Modal if unpaid package */}
      {paymentModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            maxWidth: "460px",
            width: "100%",
            padding: "28px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
          }}>
            <QrCode size={36} color="#d97706" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
              ស្កេនទូទាត់ប្រាក់តាម ABA KHQR
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 16px 0" }}>
              កញ្ចប់៖ <strong>{paymentModal.plan?.packageName}</strong> • ចំនួនទឹកប្រាក់៖ <strong style={{ color: "#16a34a" }}>{money(paymentModal.amount, paymentModal.currency)}</strong>
            </p>

            <div style={{
              background: "#fafaf9",
              border: "1px solid #e7e5e4",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "20px"
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentModal.qrCode || `KOUPRENG_PACKAGE_${paymentModal.orderCode}`)}`}
                alt="Payment QR"
                style={{ width: "180px", height: "180px", margin: "0 auto", display: "block" }}
              />
              <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "#78716c", fontWeight: 600 }}>
                លេខ Order: <code>{paymentModal.orderCode}</code>
              </div>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "20px" }}>
              បន្ទាប់ពីបង់ប្រាក់រួច ប្រព័ន្ធ Telegram Bot នឹងផ្ទៀងផ្ទាត់ និងបើកដំណើរការកញ្ចប់សេវាជូនភ្លាមៗ។
            </p>

            <button
              type="button"
              onClick={() => { setPaymentModal(null); load(); }}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "#0f766e",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              យល់ព្រម / រួចរាល់
            </button>
          </div>
        </div>
      )}

      {/* Subscription History Table */}
      <section style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
          ប្រវត្តិការជាវកញ្ចប់សេវា (Subscription History)
        </h2>
        {history.length ? (
          <div className="enterprise-table-wrap" style={{ overflowX: "auto" }}>
            <table className="enterprise-table" style={{ width: "100%", textAlign: "left" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 14px" }}>កញ្ចប់សេវា</th>
                  <th style={{ padding: "10px 14px" }}>ស្ថានភាព</th>
                  <th style={{ padding: "10px 14px" }}>តម្លៃ</th>
                  <th style={{ padding: "10px 14px" }}>លេខកូដ Order</th>
                  <th style={{ padding: "10px 14px" }}>ចំណាំ</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700 }}>{item.packagePlan?.packageName || "Package"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: item.active ? "#dcfce7" : "#fef3c7",
                        color: item.active ? "#15803d" : "#b45309"
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>{money(item.amount, item.currency)}</td>
                    <td style={{ padding: "12px 14px" }}><code>{item.orderCode || "—"}</code></td>
                    <td style={{ padding: "12px 14px", color: "#64748b" }}>{item.paymentNote || item.message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: "0.9rem" }}>
            មិនទាន់មានប្រវត្តិជាវកញ្ចប់សេវានៅឡើយទេ។
          </div>
        )}
      </section>
    </main>
  );
}
