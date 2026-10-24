import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Crown, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import Modal from "../../shared/ui/Modal";
import { toast } from "../../shared/ui/toast";
import subscriptionService from "./subscriptionService";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { packagePrice, packageLimit } from "../marketing/model/packagePresentation";
import "../../shared/styles/workspace-ui.css";
import "./SubscriptionPackagesPage.css";

const isActivated = order => order?.active === true && order.status === "ACTIVE" && order.paymentStatus === "PAID";
function orderStage(order) {
  if (isActivated(order)) return "success";
  if ([order?.status, order?.paymentStatus].includes("EXPIRED")) return "expired";
  if ([order?.status, order?.paymentStatus].some(value => ["CANCELLED", "CANCELED", "FAILED"].includes(value))) return "failed";
  if (["REVIEW_REQUIRED", "PENDING_REVIEW"].includes(order?.status) || order?.paymentStatus === "PAID") return "review";
  return "waiting";
}
const isPending = order => !!order?.orderCode && ["waiting", "review"].includes(orderStage(order));
const money = (amount, currency, lang) => packagePrice({ price: amount, currency }, lang) || (lang === "en" ? "Price unavailable" : "តម្លៃមិនទាន់មាន");
function dateLabel(value, lang) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "km-KH", { dateStyle: "medium" }).format(new Date(value));
}
function statusLabel(order, copy) {
  return ({ success: copy("បានបើកដំណើរការ", "Active / Paid"), waiting: copy("រង់ចាំការទូទាត់", "Awaiting payment"), review: copy("កំពុងរង់ចាំការផ្ទៀងផ្ទាត់", "Under review"), expired: copy("ផុតកំណត់", "Expired"), failed: order?.status === "CANCELLED" || order?.paymentStatus === "CANCELLED" ? copy("បានបោះបង់", "Cancelled") : copy("បរាជ័យ", "Failed") })[orderStage(order)];
}
function billingLabel(plan, copy) {
  const billing = { MONTHLY: copy("ប្រចាំខែ", "Monthly"), YEARLY: copy("ប្រចាំឆ្នាំ", "Yearly"), CUSTOM: copy("រយៈពេលផ្ទាល់ខ្លួន", "Custom term"), ONE_TIME: copy("បង់ម្តង", "One-time") };
  return [plan.durationDays != null ? `${plan.durationDays} ${copy("ថ្ងៃ", "days")}` : null, billing[plan.billingInterval] || plan.billingInterval].filter(Boolean).join(" · ") || copy("រយៈពេលមិនបានបញ្ជាក់", "Term not specified");
}

export default function SubscriptionPackagesPage() {
  const lang = useLanguageStore(state => state.lang);
  const copy = useCallback((km, en) => lang === "en" ? en : km, [lang]);
  const [packages, setPackages] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [checkout, setCheckout] = useState(null);
  const submitting = useRef(false);
  const target = new URLSearchParams(window.location.search).get("package")?.toUpperCase();
  const load = useCallback(async () => {
    setError(""); setAccountError("");
    const [plans, active, orders] = await Promise.allSettled([subscriptionService.packages(), subscriptionService.entitlements(), subscriptionService.history()]);
    if (plans.status === "fulfilled") setPackages(plans.value || []);
    else setError(copy("មិនអាចផ្ទុកកញ្ចប់សេវាកម្មបានទេ។", "Could not load subscription packages."));
    if (active.status === "fulfilled") setCurrent(active.value);
    else setCurrent(null);
    if (orders.status === "fulfilled") setHistory(orders.value || []);
    if (active.status === "rejected" || orders.status === "rejected") setAccountError(copy("មិនអាចពិនិត្យកញ្ចប់ និងការទូទាត់របស់អ្នកបានទេ។ សូមទាញយកម្ដងទៀតមុនពេលជាវ។", "Could not verify your plan or payment history. Retry before starting another order."));
    setLoading(false);
  }, [copy]);
  useEffect(() => { load(); }, [load]);

  const resume = async order => {
    setCheckout({ ...order, plan: order.packagePlan, stage: orderStage(order) });
    try {
      const latest = await subscriptionService.order(order.orderCode);
      setCheckout(value => value?.orderCode === order.orderCode ? { ...value, ...latest, stage: orderStage(latest) } : value);
    } catch (err) { setCheckout(value => value?.orderCode === order.orderCode ? { ...value, validationError: err.message } : value); }
  };
  const openCheckout = plan => {
    const pending = history.find(order => isPending(order) && order.packagePlan?.id === plan.id);
    if (pending) { resume(pending); return; }
    setCheckout({ plan, stage: "details", payerName: "", payerAccountLast3: "", validationError: "" });
  };
  const createCheckout = async () => {
    if (submitting.current || checkout?.stage !== "details") return;
    const payerName = checkout.payerName.trim(), last3 = checkout.payerAccountLast3;
    if (!payerName || !/^\d{3}$/.test(last3)) {
      setCheckout(value => ({ ...value, validationError: !payerName ? copy("សូមបញ្ចូលឈ្មោះម្ចាស់គណនី ABA។", "ABA account holder name is required.") : copy("សូមបញ្ចូលលេខ ៣ ខ្ទង់ចុងក្រោយ។", "Last 3 digits must be exactly 3 numbers.") }));
      return;
    }
    submitting.current = true; setSaving(true);
    try {
      // Recheck immediately before purchase; an existing pending order should be resumed.
      const orders = await subscriptionService.history();
      const existing = orders?.find(order => isPending(order) && order.packagePlan?.id === checkout.plan.id);
      if (existing) { setHistory(orders); await resume(existing); return; }
      const order = await subscriptionService.purchase(checkout.plan.id, payerName, last3);
      setHistory(orders => [{ ...order, packagePlan: order.packagePlan || checkout.plan }, ...orders]);
      setCheckout(value => ({ ...value, ...order, stage: orderStage(order), validationError: "" }));
      if (order.paymentUrl && !isActivated(order)) {
        const opened = window.open(order.paymentUrl, "_blank", "noopener,noreferrer");
        if (!opened) toast.info(copy("សូមចុចប៊ូតុង ABA PayWay ដើម្បីបន្ត។", "Click the ABA PayWay button to continue."));
      }
      if (isActivated(order)) await load();
    } catch (err) { setCheckout(value => ({ ...value, validationError: err.message || copy("មិនអាចបង្កើតការទូទាត់បានទេ។ សូមពិនិត្យប្រវត្តិមុនព្យាយាមម្ដងទៀត។", "Could not create the order. Check history before retrying.") })); }
    finally { submitting.current = false; setSaving(false); }
  };
  useEffect(() => {
    if (!checkout?.orderCode || !["waiting", "review"].includes(checkout.stage)) return;
    let cancelled = false, inFlight = false;
    const poll = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const order = await subscriptionService.order(checkout.orderCode);
        if (cancelled) return;
        const stage = orderStage(order);
        setCheckout(value => ({ ...value, ...order, stage, validationError: "" }));
        if (stage === "success") await load();
      } catch (err) { if (!cancelled) setCheckout(value => ({ ...value, validationError: err.message || "Could not refresh payment status." })); }
      finally { inFlight = false; }
    };
    poll();
    const timer = window.setInterval(poll, 4000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [checkout?.orderCode, checkout?.stage, load]);

  return <main className="workspace-page pkg-page" lang={lang}>
    <header className="workspace-heading">
      <h1>{copy("ជ្រើសរើសកញ្ចប់សេវាកម្ម", "A plan for your next celebration")}</h1>
      <p>{copy("ប្រៀបធៀបកញ្ចប់ និងជ្រើសរើសតាមចំនួនកម្មវិធី និងភ្ញៀវរបស់អ្នក។", "Compare event and guest limits, then choose the plan that fits your invitations.")}</p>
    </header>
    {(error || accountError) && <div className="workspace-notice" role="alert"><p>{error || accountError}</p><button className="workspace-button" onClick={load}>{copy("ទាញយកម្ដងទៀត", "Retry")}</button></div>}
    {!loading && <section className="pkg-current" aria-label={copy("កញ្ចប់បច្ចុប្បន្ន", "Current subscription")}>
      <ShieldCheck size={24} aria-hidden="true" /><div><span className="workspace-muted">{copy("កញ្ចប់បច្ចុប្បន្ន", "Current plan")}</span><strong>{current?.packagePlan ? current.packagePlan?.packageName || copy("កញ្ចប់សកម្ម", "Active plan") : copy("មិនអាចផ្ទៀងផ្ទាត់កញ្ចប់", "Plan could not be verified")}</strong>{current?.source === "DEMO_ADMIN_GRANT" && <small>{copy("សិទ្ធិសាកល្បងពីអ្នកគ្រប់គ្រង · មិនមែនការទូទាត់", "Administrator demo grant · nonrevenue")}</small>}</div>
      {current?.packagePlan ? <p>{current.expiresAt ? `${copy("ផុតកំណត់", "Expires")} ${dateLabel(current.expiresAt, lang)}` : (current.source === "CONFIGURED_FREE_PACKAGE" ? copy("កញ្ចប់ Free លំនាំដើម", "Default Free plan") : copy("កាលបរិច្ឆេទផុតកំណត់មិនបានបញ្ជាក់", "Expiry date not specified"))}</p> : <p>{copy("កញ្ចប់នឹងបើកដំណើរការក្រោយការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់។", "Your plan activates after payment has been verified.")}</p>}
    </section>}
    {current?.quotas && <section className="workspace-section pkg-usage" aria-label={copy("ការប្រើប្រាស់", "Plan usage")}><h2>{copy("ការប្រើប្រាស់កញ្ចប់", "Your plan usage")}</h2>{Object.entries(current.quotas).map(([key, quota]) => <div key={key}><strong>{key === "invitations" ? copy("កម្មវិធី", "Events") : copy("ភ្ញៀវ", "Guests")}</strong><span>{quota.used} / {quota.limit ?? copy("គ្មានកំណត់", "Unlimited")}</span>{quota.limit != null && quota.limit > 0 && <progress max={quota.limit} value={Math.min(quota.used, quota.limit)} />}<small>{quota.remaining == null ? copy("គ្មានកំណត់", "Unlimited") : `${quota.remaining} ${copy("នៅសល់", "remaining")}`}</small></div>)}</section>}
    <section className="pkg-grid" aria-label={copy("បញ្ជីកញ្ចប់សេវាកម្ម", "Available subscription plans")} aria-busy={loading}>
      {loading ? <p role="status">{copy("កំពុងទាញយកកញ្ចប់សេវាកម្ម…", "Loading subscription packages…")}</p> : packages.map(plan => {
        const selected = current?.packagePlan && current.packagePlan?.code === plan.code;
        const pending = history.find(order => isPending(order) && order.packagePlan?.id === plan.id);
        const featured = plan.code?.toUpperCase() === "PRO";
        return <article className={`pkg-card ${featured ? "is-featured" : ""} ${target === plan.code?.toUpperCase() ? "is-targeted" : ""}`} key={plan.id}>
          <div className="pkg-card-top"><span className="workspace-badge">{featured ? <Crown size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}{plan.packageName}</span>{selected && <span>{copy("កំពុងប្រើ", "Current")}</span>}</div>
          <h2>{plan.packageName}</h2><p className="pkg-description">{plan.description}</p>
          <div className="pkg-pricing"><strong>{money(plan.price, plan.currency, lang)}</strong><p>{plan.code === "FREE" ? copy("កញ្ចប់លំនាំដើម · មិនត្រូវការទូទាត់", "Default access · no checkout") : billingLabel(plan, copy)}</p></div>
          <ul className="pkg-features">
            <Feature>{packageLimit(plan.maxInvitations, lang)} {copy("កម្មវិធី", "events")}</Feature>
            <Feature>{packageLimit(plan.maxGuestsPerInvitation ?? plan.maxGuests, lang)} {copy("ភ្ញៀវក្នុងមួយកម្មវិធី", "guests per event")}</Feature>
            {plan.premiumTemplatesEnabled && <Feature>{copy("សិទ្ធិប្រើគំរូ Premium", "Premium templates")}</Feature>}
            {plan.qrInvitationsEnabled && <Feature>{copy("សំបុត្រអញ្ជើញ QR", "QR invitations")}</Feature>}
            {plan.qrCheckInEnabled && <Feature>{copy("ស្កេន QR ចូលរួមកម្មវិធី", "QR guest check-in")}</Feature>}
            {plan.seatingEnabled && <Feature>{copy("រៀបចំកន្លែងអង្គុយ", "Seating arrangements")}</Feature>}
            {plan.advancedAnalyticsEnabled && <Feature>{copy("របាយការណ៍កម្រិតខ្ពស់", "Advanced analytics")}</Feature>}
          </ul>
          <button className={`workspace-button ${featured ? "pkg-gold-button" : "primary"}`} aria-label={selected ? copy("កញ្ចប់បច្ចុប្បន្ន", "Current plan") : plan.code === "FREE" ? copy("អនុវត្តពេលសិទ្ធិបង់ប្រាក់ផុតកំណត់", "Applies when paid access ends") : pending ? copy("មើលការទូទាត់ដែលកំពុងរង់ចាំ", "View pending order") : copy("ជ្រើសកញ្ចប់នេះ", "Choose this plan")} disabled={plan.code === "FREE" || selected || saving || !!accountError || packagePrice(plan, lang) === null} onClick={() => openCheckout(plan)}>{selected ? copy("កញ្ចប់បច្ចុប្បន្ន", "Current plan") : plan.code === "FREE" ? copy("អនុវត្តពេលសិទ្ធិបង់ប្រាក់ផុតកំណត់", "Applies when paid access ends") : pending ? copy("មើលការទូទាត់ដែលកំពុងរង់ចាំ", "View pending order") : copy("ជ្រើសកញ្ចប់នេះ", "Choose this plan")}</button>
        </article>;
      })}
    </section>
    {!loading && !error && packages.length === 0 && <p className="workspace-notice">{copy("មិនទាន់មានកញ្ចប់សេវាកម្ម។ សូមព្យាយាមម្ដងទៀតពេលក្រោយ។", "No plans are available. Please check again later.")}</p>}
    {packages.some(plan => plan.teamMembersEnabled || plan.maxTeamMembers > 1) && <p className="workspace-notice">{copy("ការប្រើប្រាស់ជាក្រុមមិនទាន់ដំណើរការទេ។ បច្ចុប្បន្ន ម្ចាស់កម្មវិធីជាអ្នកគ្រប់គ្រងកម្មវិធី។", "Team access is not available yet. Events are currently managed by their owner.")}</p>}
    <History history={history} lang={lang} copy={copy} resume={resume} />
    <section className="workspace-section pkg-faq" aria-label="FAQ"><h2>{copy("សំណួរដែលសួរញឹកញាប់", "Before you choose")}</h2>
      {[
        [copy("តើកញ្ចប់មានសុពលភាពប៉ុន្មានថ្ងៃ?", "How long does my plan last?"), copy("រយៈពេលសុពលភាពបង្ហាញនៅលើកញ្ចប់នីមួយៗ។ កាលបរិច្ឆេទផុតកំណត់ពិតប្រាកដនឹងបង្ហាញក្រោយកញ្ចប់ត្រូវបានបើកដំណើរការ។", "Each plan shows its configured term. After activation, your current plan displays its actual expiry date.")],
        [copy("តើការទូទាត់ត្រូវបានបញ្ជាក់ដូចម្ដេច?", "How is payment confirmed?"), copy("ឈ្មោះ និងលេខ ៣ ខ្ទង់គឺជាព័ត៌មានសម្រាប់ផ្ទៀងផ្ទាត់។ ការផ្ញើព័ត៌មានមិនបញ្ជាក់ថាបានទូទាត់ទេ។ ប្រព័ន្ធត្រូវការភស្តុតាងពីធនាគារ ឬការពិនិត្យពីអ្នកគ្រប់គ្រង។", "Your payer details help match a payment. Submitting them does not confirm payment. Activation requires verified bank evidence or administrator review.")],
        [copy("តើអាចបន្តការទូទាត់ដែលរង់ចាំបានទេ?", "Can I continue an existing payment?"), copy("អាច។ ចុចមើលការទូទាត់ក្នុងប្រវត្តិខាងលើ។ សូមពិនិត្យស្ថានភាពមុនបង្កើតការទូទាត់ថ្មី ឬផ្ទេរប្រាក់ម្ដងទៀត។", "Yes. Open the order in your history to check its status and continue an available payment link. Check before starting or paying another order.")],
      ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
    </section>
    <Checkout checkout={checkout} saving={saving} copy={copy} lang={lang} onChange={setCheckout} onSubmit={createCheckout} onClose={() => { if (!saving) { setCheckout(null); load(); } }} />
  </main>;
}

function Feature({ children }) { return <li><Check size={18} aria-hidden="true" /><span>{children}</span></li>; }
function History({ history, lang, copy, resume }) {
  return <section className="workspace-section pkg-history"><div className="workspace-section-heading"><h2>{copy("ប្រវត្តិជាវកញ្ចប់សេវា", "Subscription history")}</h2><span className="workspace-badge">{history.length} {copy("ការទូទាត់", "orders")}</span></div>
    {!history.length ? <p className="workspace-muted">{copy("មិនទាន់មានប្រវត្តិជាវកញ្ចប់សេវា។", "Your subscription orders will appear here.")}</p> : <>
      <div className="pkg-history-table"><table><caption className="sr-only">{copy("ប្រវត្តិជាវកញ្ចប់សេវា", "Subscription history")}</caption><thead><tr>{[copy("កញ្ចប់", "Package"), copy("ស្ថានភាព", "Status"), copy("តម្លៃ", "Amount"), copy("លេខកូដ", "Order"), copy("កាលបរិច្ឆេទ", "Date"), copy("សកម្មភាព", "Action")].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{history.map((order, index) => <tr key={order.id || order.orderCode || index}><td><strong>{order.packagePlan?.packageName || "—"}</strong></td><td><span className={`pkg-status ${orderStage(order)}`}>{statusLabel(order, copy)}</span></td><td>{money(order.amount, order.currency, lang)}</td><td className="pkg-order-code">{order.orderCode || "—"}</td><td>{dateLabel(order.createdAt, lang)}</td><td>{order.orderCode && <button className="pkg-text-button" onClick={() => resume(order)}>{copy("មើលការទូទាត់", "View order")}</button>}</td></tr>)}</tbody></table></div>
      <div className="pkg-history-mobile">{history.map((order, index) => <article key={order.id || order.orderCode || index}><div className="workspace-section-heading"><strong>{order.packagePlan?.packageName || "—"}</strong><span className={`pkg-status ${orderStage(order)}`}>{statusLabel(order, copy)}</span></div><dl><div><dt>{copy("តម្លៃ", "Amount")}</dt><dd>{money(order.amount, order.currency, lang)}</dd></div><div><dt>{copy("លេខកូដ", "Order")}</dt><dd>{order.orderCode || "—"}</dd></div><div><dt>{copy("កាលបរិច្ឆេទ", "Date")}</dt><dd>{dateLabel(order.createdAt, lang)}</dd></div></dl>{order.orderCode && <button className="workspace-button" onClick={() => resume(order)}>{copy("មើលការទូទាត់", "View order")}</button>}</article>)}</div>
    </>}
  </section>;
}
function Checkout({ checkout, saving, copy, lang, onChange, onSubmit, onClose }) {
  if (!checkout) return null;
  const details = checkout.stage === "details";
  return <Modal isOpen onClose={onClose} className="workspace-dialog pkg-checkout" size="md" title={details ? `Subscribe to ${checkout.plan?.packageName || ""}` : copy("ព័ត៌មានការទូទាត់", "Payment details")} subtitle={money(checkout.amount ?? checkout.plan?.price, checkout.currency ?? checkout.plan?.currency, lang)} closeOnBackdropClick={!saving} closeOnEscape={!saving}>
    <p className="pkg-checkout-plan">{checkout.plan?.packageName} · {billingLabel(checkout.plan || {}, copy)}</p>
    {details ? <form onSubmit={event => { event.preventDefault(); onSubmit(); }} noValidate>
      <label htmlFor="payerNameInput">{copy("ឈ្មោះម្ចាស់គណនី ABA", "ABA account holder name")}<input id="payerNameInput" aria-label={copy("ឈ្មោះម្ចាស់គណនី ABA / ABA Account Holder Name", "ABA Account Holder Name")} autoComplete="name" autoFocus value={checkout.payerName} onChange={event => onChange(value => ({ ...value, payerName: event.target.value, validationError: "" }))} maxLength={120} placeholder={copy("ឈ្មោះក្នុងគណនី ABA របស់អ្នក", "Name shown in your ABA account")} aria-describedby="payer-help checkout-error" /></label>
      <label htmlFor="payerLast3Input">{copy("លេខ ៣ ខ្ទង់ចុងក្រោយនៃគណនី ABA", "Last 3 digits of ABA account")}<input id="payerLast3Input" aria-label={copy("លេខ ៣ ខ្ទង់ចុងក្រោយនៃគណនី ABA / Last 3 digits of ABA account", "Last 3 digits of ABA account")} inputMode="numeric" value={checkout.payerAccountLast3} onChange={event => onChange(value => ({ ...value, payerAccountLast3: event.target.value.replace(/\D/g, "").slice(0, 3), validationError: "" }))} maxLength={3} placeholder="247" aria-describedby="payer-help checkout-error" /></label>
      <p id="payer-help" className="workspace-muted">{copy("ប្រើគណនី ABA ដូចគ្នាពេលទូទាត់។ កញ្ចប់នៅមិនទាន់សកម្ម រហូតដល់ការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់។", "Pay using the same ABA account. Your plan stays pending until payment is verified.")}</p>
      {checkout.validationError && <p id="checkout-error" role="alert">{checkout.validationError}</p>}
      <div className="pkg-checkout-actions"><button type="button" className="workspace-button" disabled={saving} onClick={onClose}>{copy("បោះបង់", "Cancel")}</button><button type="submit" className="workspace-button primary" disabled={saving} aria-label={copy("បន្តទៅ ABA PayWay / Continue to ABA PayWay", "Continue to ABA PayWay")}>{saving ? copy("កំពុងរៀបចំ…", "Creating order…") : copy("បន្តទៅ ABA PayWay", "Continue to ABA PayWay")}</button></div>
    </form> : <div className="pkg-checkout-status">
      <dl><div><dt>{copy("លេខកូដ", "Order")}</dt><dd>{checkout.orderCode}</dd></div><div><dt>{copy("ស្ថានភាព", "Status")}</dt><dd><span className={`pkg-status ${checkout.stage}`}>{statusLabel(checkout, copy)}</span></dd></div></dl>
      <p role="status">{checkout.stage === "success" ? "Subscription activated successfully." : checkout.stage === "review" ? "Payment received but needs administrator review." : checkout.stage === "expired" ? copy("ការទូទាត់នេះផុតកំណត់។ សូមពិនិត្យប្រវត្តិមុនបង្កើតការទូទាត់ថ្មី។", "This order has expired. Check your history before starting another payment.") : checkout.stage === "failed" ? copy("ការទូទាត់នេះមិនបានបញ្ចប់។ សូមពិនិត្យស្ថានភាពមុនព្យាយាមម្ដងទៀត។", "This order did not complete. Check its status before retrying.") : copy("កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់។ ការផ្ញើព័ត៌មានមិនធ្វើឱ្យកញ្ចប់សកម្មភ្លាមៗទេ។", "Waiting for payment confirmation. Submitting payer details does not activate your plan.")}</p>
      {checkout.stage === "review" && lang !== "en" && <p>ការទូទាត់ត្រូវការការពិនិត្យពីអ្នកគ្រប់គ្រង។</p>}
      {checkout.stage === "success" && lang !== "en" && <p>កញ្ចប់សេវាកម្មត្រូវបានបើកដំណើរការ។</p>}
      {checkout.validationError && <p role="alert">{checkout.validationError}</p>}
      {checkout.paymentUrl && checkout.stage === "waiting" && <a className="workspace-button primary" href={checkout.paymentUrl} target="_blank" rel="noreferrer">ABA PayWay <ExternalLink size={18} aria-hidden="true" /></a>}
      <button className="workspace-button" onClick={onClose}>{copy("បិទ", "Close")}</button>
    </div>}
  </Modal>;
}
