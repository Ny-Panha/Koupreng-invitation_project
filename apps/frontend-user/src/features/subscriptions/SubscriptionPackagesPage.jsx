import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Crown, ExternalLink, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Modal from "../../shared/ui/Modal";
import { toast } from "../../shared/ui/toast";
import subscriptionService from "./subscriptionService";
import "../enterprise/EnterprisePages.css";

function money(amount, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

const PACKAGE_BADGES = {
  BASIC: { label: "Basic", color: "#0284c7", bg: "#e0f2fe", icon: Sparkles },
  PRO: { label: "Popular · Pro", color: "#b45309", bg: "#fef3c7", icon: Zap, featured: true },
  PREMIUM: { label: "Premium", color: "#7c3aed", bg: "#ede9fe", icon: Crown },
};

const buttonStyle = {
  width: "100%",
  padding: "13px 18px",
  borderRadius: 11,
  border: 0,
  fontWeight: 750,
  cursor: "pointer",
};

export default function SubscriptionPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState(null);

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
    } catch (loadError) {
      setError(loadError.message || "Could not load subscription packages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCheckout = (plan) => {
    setError("");
    setCheckout({
      plan,
      stage: "details",
      payerName: "",
      payerAccountLast3: "",
      validationError: "",
    });
  };

  const createCheckout = async () => {
    const plan = checkout?.plan;
    const payerName = checkout?.payerName?.trim() || "";
    const payerAccountLast3 = checkout?.payerAccountLast3 || "";
    if (!plan) return;
    if (!payerName) {
      setCheckout((value) => ({ ...value, validationError: "ABA account holder name is required." }));
      return;
    }
    if (!/^\d{3}$/.test(payerAccountLast3)) {
      setCheckout((value) => ({ ...value, validationError: "Last 3 digits must be exactly 3 numbers." }));
      return;
    }

    setSavingId(plan.id);
    setError("");
    try {
      const order = await subscriptionService.purchase(plan.id, payerName, payerAccountLast3);
      setCheckout((value) => ({ ...value, ...order, stage: "waiting", validationError: "" }));
      toast.info("Payment order created. Waiting for confirmation.");
      if (order.paymentUrl) window.open(order.paymentUrl, "_blank", "noopener,noreferrer");
    } catch (purchaseError) {
      const message = purchaseError.message || "Could not create the subscription payment order.";
      setCheckout((value) => ({ ...value, validationError: message }));
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    if (!checkout?.orderCode || checkout.stage !== "waiting") return undefined;

    let cancelled = false;
    const poll = async () => {
      try {
        const order = await subscriptionService.order(checkout.orderCode);
        if (cancelled) return;
        if (order.active || order.status === "ACTIVE" || order.paymentStatus === "PAID") {
          setCheckout((value) => ({ ...value, ...order, stage: "success" }));
          toast.success("Subscription activated successfully.");
          await load();
        } else if (order.status === "EXPIRED" || order.paymentStatus === "EXPIRED") {
          setCheckout((value) => ({ ...value, ...order, stage: "expired" }));
        } else if (order.status === "REVIEW_REQUIRED") {
          setCheckout((value) => ({ ...value, ...order, stage: "review" }));
        }
      } catch (pollError) {
        if (!cancelled) setError(pollError.message || "Could not refresh payment status.");
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [checkout?.orderCode, checkout?.stage, load]);

  if (loading) {
    return (
      <main className="enterprise-page">
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <Sparkles className="spin" size={32} style={{ color: "#d97706", marginBottom: 12 }} />
          <div>កំពុងទាញយកកញ្ចប់សេវាកម្ម…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="enterprise-page" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "6px 16px", borderRadius: 999, background: "#fef3c7", color: "#b45309", fontWeight: 750 }}>
          <Crown size={16} /> Packages & Pricing
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.3rem)", color: "#0f172a", marginBottom: 10 }}>
          ជ្រើសរើសកញ្ចប់សេវាកម្មដែលស័ក្តិសមសម្រាប់អ្នក
        </h1>
        <p style={{ color: "#64748b", maxWidth: 680, margin: "0 auto" }}>
          Secure fixed-link ABA PayWay checkout with administrator-confirmed payment reconciliation.
        </p>
      </header>

      {error && <div className="enterprise-error" style={{ marginBottom: 20 }}>{error}</div>}

      {current && (
        <section style={{ background: "linear-gradient(135deg, #0f766e, #115e59)", color: "white", borderRadius: 16, padding: "20px 28px", marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <small style={{ letterSpacing: 1, fontWeight: 750, opacity: 0.85 }}>ACTIVE PLAN</small>
            <div style={{ fontSize: "1.55rem", fontWeight: 800, marginTop: 4 }}>{current.packagePlan?.packageName}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Clock size={16} />
            {current.endDate ? new Intl.DateTimeFormat("km-KH", { dateStyle: "long" }).format(new Date(current.endDate)) : "Lifetime access"}
          </div>
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
        {packages.map((plan) => {
          const badge = PACKAGE_BADGES[plan.code?.toUpperCase()] || PACKAGE_BADGES.BASIC;
          const isCurrent = current?.packagePlan?.id === plan.id;
          return (
            <article key={plan.id} style={{ background: "white", borderRadius: 20, border: badge.featured ? "2px solid #f59e0b" : "1px solid #e2e8f0", padding: "30px 24px", display: "flex", flexDirection: "column", boxShadow: badge.featured ? "0 20px 30px -10px rgba(245,158,11,.18)" : "0 4px 12px rgba(0,0,0,.04)" }}>
              <span style={{ alignSelf: "flex-start", background: badge.bg, color: badge.color, padding: "5px 10px", borderRadius: 7, fontSize: ".8rem", fontWeight: 750 }}>{badge.label}</span>
              <h2 style={{ margin: "14px 0 6px", color: "#0f172a" }}>{plan.packageName}</h2>
              <p style={{ color: "#64748b", minHeight: 42 }}>{plan.description}</p>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", padding: "18px 0", borderBottom: "1px solid #f1f5f9" }}>{money(plan.price, plan.currency)}</div>
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, margin: "22px 0 30px", flex: 1 }}>
                <Feature>Up to {plan.maxInvitations ?? "unlimited"} invitations</Feature>
                <Feature>Up to {plan.maxGuestsPerInvitation ?? plan.maxGuests ?? "unlimited"} guests per invitation</Feature>
                <Feature>{plan.maxTeamMembers ?? 1} team members</Feature>
                {plan.premiumTemplatesEnabled && <Feature>Premium invitation templates</Feature>}
                {plan.qrCheckInEnabled && <Feature>QR guest check-in</Feature>}
              </ul>
              <button type="button" disabled={savingId === plan.id || isCurrent} onClick={() => openCheckout(plan)} style={{ ...buttonStyle, background: isCurrent ? "#e2e8f0" : badge.featured ? "linear-gradient(135deg,#d97706,#b45309)" : "#0f766e", color: isCurrent ? "#64748b" : "white" }}>
                {isCurrent ? "Current plan" : <>Subscribe / Upgrade <ArrowRight size={16} style={{ verticalAlign: "middle" }} /></>}
              </button>
            </article>
          );
        })}
      </section>

      <HistoryTable history={history} />
      <CheckoutModal checkout={checkout} saving={savingId != null} onChange={setCheckout} onSubmit={createCheckout} onClose={() => setCheckout(null)} />
    </main>
  );
}

function Feature({ children }) {
  return <li style={{ display: "flex", gap: 10, color: "#334155", alignItems: "center" }}><CheckCircle2 size={18} color="#16a34a" /> {children}</li>;
}

function CheckoutModal({ checkout, saving, onChange, onSubmit, onClose }) {
  if (!checkout) return null;
  const isDetails = checkout.stage === "details";
  const terminal = ["success", "expired", "review"].includes(checkout.stage);

  return (
    <Modal isOpen onClose={onClose} title={isDetails ? `Subscribe to ${checkout.plan.packageName}` : `Payment · ${checkout.plan.packageName}`} subtitle={money(checkout.amount ?? checkout.plan.price, checkout.currency ?? checkout.plan.currency)} size="sm" closeOnBackdropClick={!saving} closeOnEscape={!saving}>
      {isDetails ? (
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 7, color: "#334155", fontWeight: 700 }}>
            ABA Account Holder Name
            <input autoFocus value={checkout.payerName} onChange={(event) => onChange((value) => ({ ...value, payerName: event.target.value, validationError: "" }))} maxLength={120} placeholder="KOEURNG VIREAK" style={{ padding: "12px 13px", borderRadius: 9, border: "1px solid #cbd5e1", fontSize: "1rem" }} />
          </label>
          <label style={{ display: "grid", gap: 7, color: "#334155", fontWeight: 700 }}>
            Last 3 digits of ABA account
            <input inputMode="numeric" value={checkout.payerAccountLast3} onChange={(event) => onChange((value) => ({ ...value, payerAccountLast3: event.target.value.replace(/\D/g, "").slice(0, 3), validationError: "" }))} maxLength={3} placeholder="247" style={{ padding: "12px 13px", borderRadius: 9, border: "1px solid #cbd5e1", fontSize: "1rem", letterSpacing: 4 }} />
          </label>
          <div style={{ background: "#fff7ed", color: "#9a3412", borderRadius: 10, padding: 12, fontSize: ".9rem" }}>Use the same ABA account when making payment.</div>
          {checkout.validationError && <div role="alert" style={{ color: "#b91c1c", fontSize: ".9rem" }}>{checkout.validationError}</div>}
          <button type="submit" disabled={saving} style={{ ...buttonStyle, background: "#0f766e", color: "white" }}>{saving ? "Creating payment order…" : "Continue to ABA PayWay"}</button>
        </form>
      ) : (
        <div style={{ display: "grid", gap: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: checkout.stage === "success" ? "#15803d" : "#0f766e", fontWeight: 800 }}>
            {checkout.stage === "success" ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
            {checkout.stage === "waiting" && "Waiting for payment confirmation…"}
            {checkout.stage === "success" && "Subscription activated successfully."}
            {checkout.stage === "expired" && "Payment session expired. Please start again."}
            {checkout.stage === "review" && "Payment received but needs administrator review."}
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 15, display: "grid", gap: 8, fontSize: ".92rem" }}>
            <Summary label="Package" value={checkout.plan.packageName} />
            <Summary label="Amount" value={money(checkout.amount, checkout.currency)} />
            <Summary label="Payer" value={checkout.payerName} />
            <Summary label="ABA account" value={`*${checkout.payerAccountLast3}`} />
            <Summary label="Order" value={checkout.orderCode} code />
            <Summary label="Status" value={checkout.status || "PENDING_PAYMENT"} />
            <Summary label="Expires" value={checkout.expiresAt ? new Date(checkout.expiresAt).toLocaleString() : "—"} />
          </div>
          {checkout.stage === "waiting" && checkout.paymentUrl && <a href={checkout.paymentUrl} target="_blank" rel="noreferrer" style={{ ...buttonStyle, boxSizing: "border-box", background: "#0f766e", color: "white", textAlign: "center", textDecoration: "none" }}>Continue to ABA PayWay <ExternalLink size={15} style={{ verticalAlign: "middle" }} /></a>}
          {terminal && <button type="button" onClick={onClose} style={{ ...buttonStyle, background: "#e2e8f0", color: "#334155" }}>Close</button>}
        </div>
      )}
    </Modal>
  );
}

function Summary({ label, value, code = false }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: "#64748b" }}>{label}</span>{code ? <code>{value}</code> : <strong style={{ textAlign: "right" }}>{value}</strong>}</div>;
}

function HistoryTable({ history }) {
  return (
    <section style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
      <h2 style={{ color: "#0f172a", marginTop: 0 }}>ប្រវត្តិការជាវកញ្ចប់សេវា (Subscription History)</h2>
      {history.length ? (
        <div className="enterprise-table-wrap" style={{ overflowX: "auto" }}>
          <table className="enterprise-table" style={{ width: "100%", textAlign: "left" }}>
            <thead><tr><th>Package</th><th>Status</th><th>Amount</th><th>Order</th><th>Message</th></tr></thead>
            <tbody>{history.map((item) => <tr key={item.id}><td>{item.packagePlan?.packageName}</td><td>{item.status}</td><td>{money(item.amount, item.currency)}</td><td><code>{item.orderCode || "—"}</code></td><td>{item.message || "—"}</td></tr>)}</tbody>
          </table>
        </div>
      ) : <div style={{ color: "#94a3b8", padding: 20, textAlign: "center" }}>No subscription history yet.</div>}
    </section>
  );
}
