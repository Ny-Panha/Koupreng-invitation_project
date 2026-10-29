import { CardGridSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Crown, ExternalLink, LockKeyhole, MapPinned, RefreshCw, ShieldCheck, Sparkles, X } from "lucide-react";
import Modal from "../../shared/ui/Modal";
import subscriptionService from "./subscriptionService";
import PackageComparison from "./PackageComparison";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { packagePrice, packageLimit } from "../marketing/model/packagePresentation";
import { Link, useSearchParams } from 'react-router-dom';
import { FEATURES, eligiblePlans, safeReturnTo } from '@/shared/access/accessDecision';
import { featureNames, quotaNames } from '@/shared/access/accessCopy';
import { refreshAccess } from '@/shared/feedback/feedback';
import { invitationService } from '@/features/invitations/api/invitationApi';
import "../../shared/styles/workspace-ui.css";
import "./SubscriptionPackagesPage.css";
import "./PackageCheckout.css";

const isActivated = order => order?.active === true && order.status === "ACTIVE" && order.paymentStatus === "PAID";
const isGrant = order => order?.source === "DEMO_ADMIN_GRANT" && order.paymentStatus === "NOT_REQUIRED";
function orderStage(order) {
  if ([order?.status, order?.paymentStatus].includes("EXPIRED")) return "expired";
  if (isGrant(order)) return order.active === true && order.status === "ACTIVE" ? "grant" : "grant-ended";
  if (isActivated(order)) return "success";
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
  return ({ grant: copy("សិទ្ធិសាកល្បងសកម្ម · មិនមែនការទូទាត់", "Active demo grant · no payment"), 'grant-ended': copy("សិទ្ធិសាកល្បងបានបញ្ចប់", "Demo grant ended"), success: copy("បានបើកដំណើរការ", "Active / Paid"), waiting: copy("រង់ចាំការទូទាត់", "Awaiting payment"), review: copy("កំពុងរង់ចាំការផ្ទៀងផ្ទាត់", "Under review"), expired: copy("ផុតកំណត់", "Expired"), failed: order?.status === "CANCELLED" || order?.paymentStatus === "CANCELLED" ? copy("បានបោះបង់", "Cancelled") : copy("បរាជ័យ", "Failed") })[orderStage(order)];
}
function billingLabel(plan, copy) {
  const billing = { MONTHLY: copy("ប្រចាំខែ", "Monthly"), YEARLY: copy("ប្រចាំឆ្នាំ", "Yearly"), CUSTOM: copy("រយៈពេលផ្ទាល់ខ្លួន", "Custom term"), ONE_TIME: copy("បង់ម្តង", "One-time") };
  return [plan.durationDays != null ? `${plan.durationDays} ${copy("ថ្ងៃ", "days")}` : null, billing[plan.billingInterval] || plan.billingInterval].filter(Boolean).join(" · ") || copy("រយៈពេលមិនបានបញ្ជាក់", "Term not specified");
}

export default function SubscriptionPackagesPage() {
  const lang = useLanguageStore(state => state.lang);
  const copy = useCallback((km, en) => lang === "en" ? en : km, [lang]);
  const [packages, setPackages] = useState([]);
  const [publicCatalog, setPublicCatalog] = useState([]);
  const [eventQuota, setEventQuota] = useState(null);
  const [searchParams] = useSearchParams();
  const feature = FEATURES.includes(searchParams.get('feature')) ? searchParams.get('feature') : '';
  const resource = Object.hasOwn(quotaNames, searchParams.get('resource') || '') ? searchParams.get('resource') : '';
  const returnTo = safeReturnTo(searchParams.get('returnTo'));
  const quotaEventId = resource === 'guestsPerInvitation' ? returnTo.match(/^\/app\/events\/([1-9]\d*)(?:\/|$)/)?.[1] : null;
  const lastBenefits = useRef('');
  const loadGeneration = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [checkout, setCheckout] = useState(null);
  const submitting = useRef(false);
  const target = searchParams.get("package")?.toUpperCase();
  const load = useCallback(async () => {
    const generation = ++loadGeneration.current;
    setRefreshing(true);
    setError(""); setAccountError("");
    const [plans, active, orders, catalog, event] = await Promise.allSettled([subscriptionService.packages(), subscriptionService.entitlements(), subscriptionService.history(),
      (feature || resource) && subscriptionService.publicPackages ? subscriptionService.publicPackages() : Promise.resolve([]),
      quotaEventId ? invitationService.access(quotaEventId) : Promise.resolve(null)]);
    if (generation !== loadGeneration.current) return;
    setRefreshing(false);
    setPublicCatalog(catalog.status === 'fulfilled' && Array.isArray(catalog.value) ? catalog.value : []);
    setEventQuota(event.status === 'fulfilled' && event.value?.owner ? event.value.quotas?.guestsPerInvitation : null);
    if (plans.status === "fulfilled") setPackages(plans.value || []);
    else setError(copy("មិនអាចផ្ទុកកញ្ចប់សេវាកម្មបានទេ។", "Could not load subscription packages."));
    if (active.status === "fulfilled") {
      setCurrent(active.value);
      const benefits = JSON.stringify([active.value?.packagePlan?.id, active.value?.features, active.value?.source, active.value?.expiresAt]);
      if (benefits !== lastBenefits.current) { lastBenefits.current = benefits; refreshAccess(); }
    }
    else setCurrent(null);
    if (orders.status === "fulfilled") setHistory(orders.value || []);
    if (active.status === "rejected" || orders.status === "rejected") setAccountError(copy("មិនអាចពិនិត្យកញ្ចប់ និងការទូទាត់របស់អ្នកបានទេ។ សូមទាញយកម្ដងទៀតមុនពេលជាវ។", "Could not verify your plan or payment history. Retry before starting another order."));
    setLoading(false);
  }, [copy, feature, resource, quotaEventId]);
  useEffect(() => { load(); return () => { loadGeneration.current += 1; }; }, [load]);

  const resume = async order => {
    setCheckout({ ...order, plan: order.packagePlan, stage: orderStage(order) });
    try {
      const latest = await subscriptionService.order(order.orderCode);
      setCheckout(value => value?.orderCode === order.orderCode ? { ...value, ...latest, stage: orderStage(latest), validationError: "" } : value);
      if (isActivated(latest)) await load();
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
        // noopener can return null even when the window opens. The persistent
        // PayWay action also works when a browser blocks this automatic attempt.
        try { window.open(order.paymentUrl, "_blank", "noopener,noreferrer"); }
        catch { /* The created order and its explicit payment link stay available. */ }
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

  const usage = resource === 'guestsPerInvitation' ? eventQuota : current?.quotas?.[resource];
  const contextual = Boolean(feature || resource);
  const displayedPackages = contextual ? eligiblePlans(publicCatalog, { feature: feature || undefined, quota: resource ? { ...usage, resource, requested: 1 } : undefined, currentPlan: current?.packagePlan, usage: { ...current?.quotas, ...(eventQuota ? { guestsPerInvitation: eventQuota } : {}) } }) : packages;
  const usagePanel = current?.quotas && <section className="workspace-section pkg-usage" aria-label={copy("ការប្រើប្រាស់", "Plan usage")}><h2>{copy("ការប្រើប្រាស់កញ្ចប់", "Your plan usage")}</h2>{Object.entries(current.quotas).map(([key, quota]) => <div key={key}><strong>{key === "invitations" ? copy("កម្មវិធី", "Events") : copy("កំណត់ត្រាភ្ញៀវ", "Guest records")}</strong><span>{quota.used} / {quota.limit ?? copy("គ្មានកំណត់", "Unlimited")}</span>{quota.limit != null && quota.limit > 0 && <progress aria-label={key === "invitations" ? copy("ការប្រើប្រាស់កម្មវិធី", "Event record usage") : copy("ការប្រើប្រាស់កំណត់ត្រាភ្ញៀវ", "Guest record usage")} max={quota.limit} value={Math.min(quota.used, quota.limit)} />}<small>{quota.remaining == null ? copy("គ្មានកំណត់", "Unlimited") : `${quota.remaining} ${copy("នៅសល់", "remaining")}`}</small></div>)}</section>;
  return <main className={`workspace-page pkg-page ${contextual ? 'is-contextual' : ''}`} lang={lang}>
    <header className="workspace-heading pkg-page-heading">
      <div><h1>{contextual ? copy('កញ្ចប់សម្រាប់តម្រូវការរបស់អ្នក','Plans for what you need') : copy("ជ្រើសរើសកញ្ចប់សេវាកម្ម", "A plan for your next celebration")}</h1>
      {contextual && <p>{copy('ប្រៀបធៀបកញ្ចប់ដែលរួមបញ្ចូលមុខងារដែលអ្នកត្រូវការ។','Compare plans that include the feature you need.')}</p>}</div>
      {contextual && <Link className="workspace-button pkg-return" to={returnTo}><ArrowLeft size={16} aria-hidden="true"/>{copy('ត្រឡប់ទៅការងាររបស់អ្នក','Return to your work')}</Link>}
    </header>
    {contextual && <section className="pkg-context"><span className="pkg-context-icon" aria-hidden="true">{feature==='ILLUSTRATED_VENUE_MAP' ? <MapPinned size={24}/> : <Sparkles size={24}/>}</span><div><span>{copy('កំពុងស្វែងរក','You’re exploring')}</span><h2>{feature ? featureNames[feature][lang === 'en' ? 1 : 0] : quotaNames[resource][lang === 'en' ? 1 : 0]}</h2></div>{!loading && !accountError && displayedPackages.length>0 && <ShieldCheck size={20} className="pkg-context-verified" aria-hidden="true"/>}</section>}
    {refreshing && !loading && <LoadingRegion label={copy("កំពុងធ្វើបច្ចុប្បន្នភាព…", "Refreshing…")} />}
    {(error || accountError) && <div className="workspace-notice" role="alert"><p>{error || accountError}</p><button className="workspace-button" onClick={load}>{copy("ទាញយកម្ដងទៀត", "Retry")}</button></div>}
    {!loading && <section className="pkg-current" aria-label={copy("កញ្ចប់បច្ចុប្បន្ន", "Current subscription")}>
      <ShieldCheck size={24} aria-hidden="true" /><div><span className="workspace-muted">{copy("កញ្ចប់បច្ចុប្បន្ន", "Current plan")}</span><strong>{current?.packagePlan ? current.packagePlan?.packageName || copy("កញ្ចប់សកម្ម", "Active plan") : copy("មិនអាចផ្ទៀងផ្ទាត់កញ្ចប់", "Plan could not be verified")}</strong>{current?.source === "DEMO_ADMIN_GRANT" && <small>{copy("សិទ្ធិសាកល្បងពីអ្នកគ្រប់គ្រង · មិនមែនការទូទាត់", "Administrator demo grant · nonrevenue")}</small>}</div>
      {current?.packagePlan ? <p>{current.expiresAt ? `${copy("ផុតកំណត់", "Expires")} ${dateLabel(current.expiresAt, lang)}` : (current.source === "CONFIGURED_FREE_PACKAGE" ? copy("កញ្ចប់ Free លំនាំដើម", "Default Free plan") : copy("កាលបរិច្ឆេទផុតកំណត់មិនបានបញ្ជាក់", "Expiry date not specified"))}</p> : <p>{copy("កញ្ចប់នឹងបើកដំណើរការក្រោយការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់។", "Your plan activates after payment has been verified.")}</p>}
    </section>}
    {!contextual && usagePanel}
    <section className="pkg-grid" aria-label={copy("បញ្ជីកញ្ចប់សេវាកម្ម", "Available subscription plans")} aria-busy={loading}>
      {loading ? <CardGridSkeleton variant="pricing" label={copy("កំពុងទាញយកកញ្ចប់សេវាកម្ម…", "Loading subscription packages…")} /> : displayedPackages.map(plan => {
        const selected = current?.packagePlan && current.packagePlan?.code === plan.code;
        const pending = history.find(order => isPending(order) && order.packagePlan?.id === plan.id);
        const featured = plan.code?.toUpperCase() === "PRO";
        return <article className={`pkg-card ${featured ? "is-featured" : ""} ${target === plan.code?.toUpperCase() ? "is-targeted" : ""}`} key={plan.id}>
          <div className="pkg-card-top"><span className="pkg-plan-icon">{featured ? <Crown size={22} aria-hidden="true" /> : <Sparkles size={22} aria-hidden="true" />}</span>{selected ? <span>{copy("កំពុងប្រើ", "Current")}</span> : target === plan.code?.toUpperCase() && <span className="pkg-selected-badge">{copy('ជម្រើសរបស់អ្នក','Your selection')}</span>}</div>
          <h2>{plan.packageName}</h2><p className="pkg-description">{plan.description}</p>
          <div className="pkg-pricing"><strong>{money(plan.price, plan.currency, lang)}</strong><p>{plan.code === "FREE" ? copy("កញ្ចប់លំនាំដើម · មិនត្រូវការទូទាត់", "Default access · no checkout") : billingLabel(plan, copy)}</p></div>
          <ul className="pkg-features">
            {feature && plan.eligibleFeatures?.includes(feature) && <Feature>{featureNames[feature][lang==='en'?1:0]}</Feature>}
            <Feature>{packageLimit(plan.maxInvitations, lang)} {copy("កម្មវិធី", "events")}</Feature>
            <Feature>{packageLimit(plan.maxGuestsPerInvitation ?? plan.maxGuests, lang)} {copy("កំណត់ត្រាភ្ញៀវក្នុងមួយកម្មវិធី", "guest records per event")}</Feature>
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
    {contextual && usagePanel}
    {!loading && <PackageComparison plans={displayedPackages} lang={lang} copy={copy} />}
    {!loading && contextual && displayedPackages.length === 0 && <p role="status" className="workspace-notice">{copy('មិនមានជម្រើសកញ្ចប់ដែលអាចផ្ទៀងផ្ទាត់សម្រាប់សកម្មភាពនេះទេ។ សូមផ្ទុកឡើងវិញ ឬទាក់ទងជំនួយ។','No eligible package option could be verified for this action. Retry or contact support.')}</p>}
    {!loading && !error && packages.length === 0 && <p className="workspace-notice">{copy("មិនទាន់មានកញ្ចប់សេវាកម្ម។ សូមព្យាយាមម្ដងទៀតពេលក្រោយ។", "No plans are available. Please check again later.")}</p>}
    {packages.some(plan => plan.teamMembersEnabled) && <p className="workspace-notice">{copy("កញ្ចប់ដែលមានក្រុម អនុញ្ញាតឱ្យភ្ជាប់ក្រុមទៅកម្មវិធី។ សមាជិកត្រូវទទួលយកការអញ្ជើញមុនពេលទទួលសិទ្ធិតាមតួនាទី។", "Eligible plans let owners link a team to events. Members must accept an invitation before receiving role-based event access.")}</p>}
    <History history={history} lang={lang} copy={copy} resume={resume} />
    <section className="workspace-section pkg-faq" aria-label="FAQ"><h2>{copy("សំណួរដែលសួរញឹកញាប់", "Before you choose")}</h2>
      {[
        [copy("តើកញ្ចប់មានសុពលភាពប៉ុន្មានថ្ងៃ?", "How long does my plan last?"), copy("រយៈពេលសុពលភាពបង្ហាញនៅលើកញ្ចប់នីមួយៗ។ កាលបរិច្ឆេទផុតកំណត់ពិតប្រាកដនឹងបង្ហាញក្រោយកញ្ចប់ត្រូវបានបើកដំណើរការ។", "Each plan shows its configured term. After activation, your current plan displays its actual expiry date.")],
        [copy("តើការទូទាត់ត្រូវបានបញ្ជាក់ដូចម្ដេច?", "How is payment confirmed?"), copy("ឈ្មោះ និងលេខ ៣ ខ្ទង់គឺជាព័ត៌មានសម្រាប់ផ្ទៀងផ្ទាត់។ ការផ្ញើព័ត៌មានមិនបញ្ជាក់ថាបានទូទាត់ទេ។ ប្រព័ន្ធត្រូវការភស្តុតាងពីធនាគារ ឬការពិនិត្យពីអ្នកគ្រប់គ្រង។", "Your payer details help match a payment. Submitting them does not confirm payment. Activation requires verified bank evidence or administrator review.")],
        [copy("តើអាចបន្តការទូទាត់ដែលរង់ចាំបានទេ?", "Can I continue an existing payment?"), copy("អាច។ ចុចមើលការទូទាត់ក្នុងប្រវត្តិខាងលើ។ សូមពិនិត្យស្ថានភាពមុនបង្កើតការទូទាត់ថ្មី ឬផ្ទេរប្រាក់ម្ដងទៀត។", "Yes. Open the order in your history to check its status and continue an available payment link. Check before starting or paying another order.")],
      ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
    </section>
    <Checkout checkout={checkout} saving={saving} copy={copy} lang={lang} onChange={setCheckout} onSubmit={createCheckout} onRefresh={() => resume({ ...checkout, packagePlan: checkout.plan || checkout.packagePlan })} returnTo={contextual ? returnTo : '/app/events'} onClose={() => { if (!saving) { setCheckout(null); load(); } }} />
  </main>;
}

function Feature({ children }) { return <li><Check size={18} aria-hidden="true" /><span>{children}</span></li>; }
function History({ history, lang, copy, resume }) {
  return <section className="workspace-section pkg-history"><div className="workspace-section-heading"><h2>{copy("ប្រវត្តិជាវកញ្ចប់សេវា", "Subscription history")}</h2><span className="workspace-badge">{history.length} {copy("ការទូទាត់", "orders")}</span></div>
    {!history.length ? <p className="workspace-muted">{copy("មិនទាន់មានប្រវត្តិជាវកញ្ចប់សេវា។", "Your subscription orders will appear here.")}</p> : <>
      <div className="pkg-history-table"><table><caption className="sr-only">{copy("ប្រវត្តិជាវកញ្ចប់សេវា", "Subscription history")}</caption><thead><tr>{[copy("កញ្ចប់", "Package"), copy("ស្ថានភាព", "Status"), copy("តម្លៃ", "Amount"), copy("លេខកូដ", "Order"), copy("កាលបរិច្ឆេទ", "Date"), copy("សកម្មភាព", "Action")].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{history.map((order, index) => <tr key={order.id || order.orderCode || index}><td><strong>{order.packagePlan?.packageName || "—"}</strong></td><td><span className={`pkg-status ${orderStage(order)}`}>{statusLabel(order, copy)}</span></td><td>{isGrant(order) ? copy("មិនត្រូវការទូទាត់ · មិនមែនចំណូល", "No payment · nonrevenue") : money(order.amount, order.currency, lang)}</td><td className="pkg-order-code">{order.orderCode || "—"}</td><td>{dateLabel(order.createdAt, lang)}</td><td>{order.orderCode && !isGrant(order) && <button className="pkg-text-button" onClick={() => resume(order)}>{copy("មើលការទូទាត់", "View order")}</button>}</td></tr>)}</tbody></table></div>
      <div className="pkg-history-mobile">{history.map((order, index) => <article key={order.id || order.orderCode || index}><div className="workspace-section-heading"><strong>{order.packagePlan?.packageName || "—"}</strong><span className={`pkg-status ${orderStage(order)}`}>{statusLabel(order, copy)}</span></div><dl><div><dt>{copy("តម្លៃ", "Amount")}</dt><dd>{isGrant(order) ? copy("មិនត្រូវការទូទាត់ · មិនមែនចំណូល", "No payment · nonrevenue") : money(order.amount, order.currency, lang)}</dd></div><div><dt>{copy("លេខកូដ", "Order")}</dt><dd>{order.orderCode || "—"}</dd></div><div><dt>{copy("កាលបរិច្ឆេទ", "Date")}</dt><dd>{dateLabel(order.createdAt, lang)}</dd></div></dl>{order.orderCode && !isGrant(order) && <button className="workspace-button" onClick={() => resume(order)}>{copy("មើលការទូទាត់", "View order")}</button>}</article>)}</div>
    </>}
  </section>;
}
function Checkout({ checkout, saving, copy, lang, onChange, onSubmit, onRefresh, returnTo, onClose }) {
  const nameInput = useRef(null), suffixInput = useRef(null), errorMessage = useRef(null);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    if (!checkout?.validationError || checkout.stage !== 'details') return;
    if (!checkout.payerName?.trim()) nameInput.current?.focus();
    else if (!/^\d{3}$/.test(checkout.payerAccountLast3 || '')) suffixInput.current?.focus();
    else errorMessage.current?.focus();
  }, [checkout?.validationError, checkout?.stage, checkout?.payerName, checkout?.payerAccountLast3]);
  if (!checkout) return null;
  const details = checkout.stage === 'details', success = checkout.stage === 'success';
  const grant = ['grant', 'grant-ended'].includes(checkout.stage);
  const waiting = checkout.stage === 'waiting', reviewing = checkout.stage === 'review';
  const terminal = ['expired', 'failed'].includes(checkout.stage);
  const paid = checkout.paymentStatus === 'PAID';
  const activeStep = details ? 0 : paid ? 2 : 1;
  const title = details ? `${copy('ជាវកញ្ចប់', 'Subscribe to')} ${checkout.plan?.packageName || ''}` : copy('ព័ត៌មានការទូទាត់', 'Payment details');
  const invalidName = Boolean(checkout.validationError && !checkout.payerName?.trim());
  const invalidSuffix = Boolean(checkout.validationError && !/^\d{3}$/.test(checkout.payerAccountLast3 || ''));
  const headline = success ? copy('កញ្ចប់របស់អ្នករួចរាល់ហើយ', 'Your plan is ready')
    : reviewing ? copy('យើងកំពុងពិនិត្យការទូទាត់របស់អ្នក', 'We’re reviewing your payment')
    : checkout.stage === 'expired' ? copy('ការទូទាត់នេះផុតកំណត់ហើយ', 'This payment window has ended')
    : checkout.stage === 'failed' ? copy('ការទូទាត់មិនបានបញ្ចប់', 'Payment wasn’t completed')
    : grant ? copy('សិទ្ធិពីអ្នកគ្រប់គ្រង', 'Administrator access')
    : copy('បន្តការទូទាត់តាម ABA', 'Complete your payment with ABA');
  const message = success ? copy('កញ្ចប់ត្រូវបានបើកដំណើរការដោយជោគជ័យ។', 'Subscription activated successfully.')
    : reviewing ? copy('ត្រូវការអ្នកគ្រប់គ្រងពិនិត្យស្ថានភាពទូទាត់។', 'Payment status needs administrator review.')
    : checkout.stage === 'expired' ? copy('ការទូទាត់នេះផុតកំណត់។ សូមពិនិត្យប្រវត្តិមុនបង្កើតការទូទាត់ថ្មី។', 'This order has expired. Check your history before starting another payment.')
    : checkout.stage === 'failed' ? copy('ការទូទាត់នេះមិនបានបញ្ចប់។ សូមពិនិត្យស្ថានភាពមុនព្យាយាមម្ដងទៀត។', 'This order did not complete. Check its status before retrying.')
    : grant ? copy('សិទ្ធិសាកល្បងពីអ្នកគ្រប់គ្រង មិនមែនជាការទូទាត់ទេ។', 'Administrator demo access is not a payment.')
    : copy('កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់។ ការផ្ញើព័ត៌មានមិនធ្វើឱ្យកញ្ចប់សកម្មភ្លាមៗទេ។', 'Waiting for payment confirmation. Submitting payer details does not activate your plan.');
  const StatusIcon = success ? CheckCircle2 : terminal ? AlertCircle : grant ? ShieldCheck : Clock3;
  const refresh = async () => { setChecking(true); try { await onRefresh(); } finally { setChecking(false); } };
  const expiry = checkout.expiresAt && Number.isFinite(new Date(checkout.expiresAt).getTime()) ? new Date(checkout.expiresAt) : null;
  return <Modal isOpen onClose={onClose} showHeader={false} ariaLabel={title} initialFocusRef={nameInput} className="workspace-dialog pkg-checkout" size="lg" closeOnBackdropClick={!saving} closeOnEscape={!saving}
    footer={<div className="pkg-checkout-actions">
      {details ? <><button type="button" className="workspace-button" disabled={saving} onClick={onClose}>{copy('បោះបង់', 'Cancel')}</button><button type="submit" form="package-checkout-form" className="workspace-button primary" disabled={saving} aria-label={copy('បន្តទៅ ABA PayWay / Continue to ABA PayWay', 'Continue to ABA PayWay')}>{saving ? <><RefreshCw size={17} aria-hidden="true"/>{copy('កំពុងរៀបចំ…', 'Creating order…')}</> : <>{copy('បន្តទៅ ABA PayWay', 'Continue to ABA PayWay')}<ArrowRight size={17} aria-hidden="true"/></>}</button></>
        : success ? <Link className="workspace-button primary" to={returnTo} onClick={onClose}>{copy('ត្រឡប់ទៅការងាររបស់អ្នក', 'Return to your work')}<ArrowRight size={17} aria-hidden="true"/></Link>
        : <><button type="button" className="workspace-button" onClick={onClose}>{terminal ? copy('មើលកញ្ចប់សេវាកម្ម', 'Back to plans') : copy('បិទ', 'Close')}</button>{waiting && checkout.paymentUrl && <a className="workspace-button primary" href={checkout.paymentUrl} target="_blank" rel="noreferrer">{copy('បើក ABA PayWay', 'Open ABA PayWay')}<ExternalLink size={17} aria-hidden="true"/></a>}</>}
    </div>}>
    <header className="pkg-checkout-heading"><span className="pkg-checkout-mark" aria-hidden="true"><LockKeyhole size={21}/></span><h2>{title}</h2><button type="button" className="pkg-close" onClick={onClose} disabled={saving} aria-label={copy('បិទប្រអប់', 'Close modal')}><X size={20} aria-hidden="true"/></button></header>
    {!grant && <ol className="pkg-checkout-steps" aria-label={copy('ជំហាននៃការជាវកញ្ចប់', 'Package purchase progress')}>
      {[copy('ព័ត៌មាន', 'Details'),copy('ទូទាត់', 'Payment'),copy('បើកសិទ្ធិ', 'Activation')].map((label,index)=>{
        const complete = success || (index === 0 && Boolean(checkout.orderCode)) || (index === 1 && paid);
        return <li key={label} data-complete={complete || undefined} aria-current={!success && index===activeStep?'step':undefined}><span aria-hidden="true">{complete?<Check size={15}/>:index+1}</span><strong>{label}</strong></li>;
      })}
    </ol>}
    <div className="pkg-checkout-layout">
      <aside className="pkg-order-summary" aria-label={copy('សង្ខេបការជាវកញ្ចប់', 'Order summary')}>
        <span className="pkg-summary-icon" aria-hidden="true"><Crown size={24}/></span><h3>{checkout.plan?.packageName || checkout.packagePlan?.packageName}</h3>
        <p className="pkg-order-term">{billingLabel(checkout.plan || checkout.packagePlan || {}, copy)}</p>
        <dl><div><dt>{grant ? copy('សិទ្ធិប្រើប្រាស់','Access') : success ? copy('ចំនួនបានទូទាត់','Amount paid') : terminal ? copy('តម្លៃការជាវ','Order amount') : paid ? copy('ចំនួនទូទាត់','Payment amount') : copy('សរុបត្រូវបង់', 'Total to pay')}</dt><dd className="pkg-order-total">{grant ? copy('មិនត្រូវការទូទាត់', 'No payment required') : money(checkout.amount ?? checkout.plan?.price, checkout.currency ?? checkout.plan?.currency, lang)}</dd></div></dl>
        {!grant && <span className="pkg-order-currency">{checkout.currency ?? checkout.plan?.currency}</span>}
        {checkout.orderCode && <div className="pkg-order-reference"><span>{copy('លេខកូដ', 'Order')}</span><strong>{checkout.orderCode}</strong></div>}
        <p className="pkg-checkout-trust"><ShieldCheck size={16} aria-hidden="true"/>{grant ? copy('សិទ្ធិផ្ដល់ដោយអ្នកគ្រប់គ្រង', 'Access granted by an administrator') : success ? copy('ការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់','Payment verified') : copy('សិទ្ធិបើកក្រោយការផ្ទៀងផ្ទាត់ការទូទាត់', 'Access starts after payment verification')}</p>
      </aside>
      {details ? <form id="package-checkout-form" className="pkg-payer-form" onSubmit={event=>{event.preventDefault();onSubmit();}} noValidate aria-busy={saving}>
        <h3>{copy('ព័ត៌មានអ្នកទូទាត់', 'Your payment details')}</h3><p className="pkg-form-intro">{copy('ប្រើព័ត៌មានពីគណនី ABA ដែលអ្នកនឹងប្រើទូទាត់។', 'Use the ABA account you’ll pay from.')}</p>
        <label htmlFor="payerNameInput">{copy('ឈ្មោះម្ចាស់គណនី ABA', 'ABA account holder name')}<input ref={nameInput} id="payerNameInput" required aria-label={copy('ឈ្មោះម្ចាស់គណនី ABA / ABA Account Holder Name', 'ABA Account Holder Name')} autoComplete="name" value={checkout.payerName} onChange={event=>onChange(value=>({...value,payerName:event.target.value,validationError:''}))} maxLength={120} placeholder={copy('ឈ្មោះក្នុងគណនី ABA របស់អ្នក', 'Name shown in your ABA account')} disabled={saving} aria-invalid={invalidName || undefined} aria-describedby={checkout.validationError?'payer-help checkout-error':'payer-help'}/></label>
        <label htmlFor="payerLast3Input">{copy('លេខ ៣ ខ្ទង់ចុងក្រោយនៃគណនី ABA', 'Last 3 digits of ABA account')}<input ref={suffixInput} id="payerLast3Input" required aria-label={copy('លេខ ៣ ខ្ទង់ចុងក្រោយនៃគណនី ABA / Last 3 digits of ABA account', 'Last 3 digits of ABA account')} inputMode="numeric" autoComplete="off" className="pkg-account-suffix" value={checkout.payerAccountLast3} onChange={event=>onChange(value=>({...value,payerAccountLast3:event.target.value.replace(/\D/g,'').slice(0,3),validationError:''}))} maxLength={3} placeholder="247" disabled={saving} aria-invalid={invalidSuffix || undefined} aria-describedby={checkout.validationError?'payer-help checkout-error':'payer-help'}/></label>
        <p id="payer-help" className="pkg-field-help">{copy('ត្រូវការតែ ៣ ខ្ទង់ចុងក្រោយប៉ុណ្ណោះ។', 'Only the last 3 digits are needed.')}</p>
        {checkout.validationError && <p id="checkout-error" ref={errorMessage} tabIndex={-1} className="pkg-checkout-error" role="alert"><AlertCircle size={16} aria-hidden="true"/>{checkout.validationError}</p>}
      </form> : <section className="pkg-checkout-status" data-stage={checkout.stage} aria-label={copy('ស្ថានភាពការទូទាត់', 'Payment status')}>
        <span className="pkg-state-icon" aria-hidden="true"><StatusIcon size={30}/></span><h3>{headline}</h3><span className={`pkg-status ${checkout.stage}`}>{statusLabel(checkout, copy)}</span><p role="status">{message}</p>
        {waiting && expiry && <p className="pkg-payment-deadline">{copy('សុពលភាពការទូទាត់ដល់', 'Payment window ends')} <time dateTime={checkout.expiresAt}>{new Intl.DateTimeFormat(lang==='en'?'en-GB':'km-KH',{dateStyle:'medium',timeStyle:'short'}).format(expiry)}</time></p>}
        {checkout.validationError && <p className="pkg-checkout-error" role="alert">{checkout.validationError}</p>}
        {(waiting || reviewing) && <button type="button" className="pkg-refresh-status" onClick={refresh} disabled={checking}><RefreshCw size={16} aria-hidden="true"/>{checking ? copy('កំពុងពិនិត្យ…', 'Checking…') : copy('ពិនិត្យស្ថានភាពទូទាត់', 'Check payment status')}</button>}
        {terminal && <Link className="pkg-status-support" to="/contact" onClick={onClose}>{copy('ទាក់ទងជំនួយ', 'Contact support')}</Link>}
      </section>}
    </div>
  </Modal>;
}
