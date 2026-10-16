import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  RotateCw,
  AlertCircle,
  HelpCircle,
  FileText,
  CreditCard,
  Calendar,
} from "lucide-react";
import Modal from "../../shared/ui/Modal";
import { toast } from "../../shared/ui/toast";
import subscriptionService from "./subscriptionService";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { packagePrice, packageLimit } from "../marketing/model/packagePresentation";
import "./SubscriptionPackagesPage.css";

const PACKAGE_BADGES = {
  BASIC: {
    labelKm: "មូលដ្ឋាន (Basic)",
    labelEn: "Basic",
    color: "#0284c7",
    bg: "#e0f2fe",
    icon: Sparkles,
  },
  PRO: {
    labelKm: "ពេញនិយម · Pro",
    labelEn: "Popular · Pro",
    color: "#b45309",
    bg: "#fef3c7",
    icon: Zap,
    featured: true,
  },
  PREMIUM: {
    labelKm: "ប្រណិត (Premium)",
    labelEn: "Premium",
    color: "#7c3aed",
    bg: "#ede9fe",
    icon: Crown,
  },
};

function formatMoney(amount, currency, lang) {
  const formatted = packagePrice({ price: amount, currency }, lang);
  if (formatted !== null) return formatted;
  if (amount == null || amount === "") return lang === "en" ? "Price unavailable" : "តម្លៃមិនទាន់មាន";
  return `${currency || "USD"} ${amount}`;
}

function getTargetedPackageCode() {
  if (typeof window === "undefined" || !window.location) return null;
  try {
    return new URLSearchParams(window.location.search).get("package")?.toUpperCase() || null;
  } catch {
    return null;
  }
}

export default function SubscriptionPackagesPage() {
  const lang = useLanguageStore((state) => state.lang);
  const copy = useCallback((km, en) => (lang === "en" ? en : km), [lang]);
  const targetedCode = getTargetedPackageCode();

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
      const [plansResult, currentResult, historyResult] = await Promise.allSettled([
        subscriptionService.packages(),
        subscriptionService.current(),
        subscriptionService.history(),
      ]);

      if (plansResult.status === "fulfilled") {
        setPackages(plansResult.value || []);
      } else {
        setError(plansResult.reason?.message || copy("មិនអាចផ្ទុកកញ្ចប់សេវាកម្មបានទេ", "Could not load subscription packages."));
      }

      if (currentResult.status === "fulfilled") {
        setCurrent(currentResult.value || null);
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value || []);
      }
    } catch (loadError) {
      setError(loadError?.message || copy("មិនអាចផ្ទុកកញ្ចប់សេវាកម្មបានទេ", "Could not load subscription packages."));
    } finally {
      setLoading(false);
    }
  }, [copy]);

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
      setCheckout((value) => ({
        ...value,
        validationError: copy("សូមបញ្ចូលឈ្មោះម្ចាស់គណនី ABA (ABA account holder name is required.)", "ABA account holder name is required."),
      }));
      return;
    }
    if (!/^\d{3}$/.test(payerAccountLast3)) {
      setCheckout((value) => ({
        ...value,
        validationError: copy("លេខ ៣ ខ្ទង់ចុងក្រោយត្រូវតែជាលេខពិតប្រាកដចំនួន ៣ ខ្ទង់ (Last 3 digits must be exactly 3 numbers.)", "Last 3 digits must be exactly 3 numbers."),
      }));
      return;
    }

    setSavingId(plan.id);
    setCheckout((value) => ({ ...value, validationError: "" }));
    try {
      const order = await subscriptionService.purchase(plan.id, payerName, payerAccountLast3);
      setCheckout((value) => ({
        ...value,
        ...order,
        stage: order.active ? "success" : "waiting",
      }));
      if (order.paymentUrl) {
        const opened = window.open(order.paymentUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
          toast.info("Pop-up blocked. Click the payment button to proceed.");
        }
      }
      if (order.active) {
        toast.success("Subscription activated successfully.");
        await load();
      }
    } catch (checkoutError) {
      const message = checkoutError?.message || "Could not create payment order.";
      setCheckout((value) => ({ ...value, validationError: message }));
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    if (!checkout?.orderCode || !["waiting", "review"].includes(checkout.stage)) return undefined;

    let cancelled = false;
    const poll = async () => {
      try {
        const order = await subscriptionService.order(checkout.orderCode);
        if (cancelled) return;
        if (order.active && order.status === "ACTIVE" && order.paymentStatus === "PAID") {
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
      <main className="dash-main w-full min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="text-center py-20 text-slate-500">
          <Sparkles className="animate-spin inline-block text-[#B98B42] mb-3" size={36} />
          <div className="text-sm font-semibold text-slate-700">
            {copy("កំពុងទាញយកកញ្ចប់សេវាកម្ម…", "Loading subscription packages…")}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dash-main pkg-page-container" lang={lang}>
      {/* Header */}
      <header className="pkg-header">
        <div className="pkg-tag-badge">
          <Crown size={15} />
          <span>{copy("កញ្ចប់សេវាកម្ម & តម្លៃ", "Packages & Pricing")}</span>
        </div>
        <h1 className="pkg-title">
          {copy("ជ្រើសរើសកញ្ចប់សេវាកម្មដែលស័ក្តិសមសម្រាប់អ្នក", "Choose the subscription tier for your celebration")}
        </h1>
        <p className="pkg-subtitle">
          {copy(
            "បង់ប្រាក់តាម ABA PayWay ហើយរង់ចាំការផ្ទៀងផ្ទាត់ មុនពេលកញ្ចប់ត្រូវបានបើកប្រើ។",
            "Secure fixed-link ABA PayWay checkout with administrator-confirmed payment reconciliation."
          )}
        </p>
      </header>

      {error && (
        <div
          className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs"
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCw size={12} /> {copy("សាកម្ដងទៀត", "Retry")}
          </button>
        </div>
      )}

      {/* Active Subscription Banner */}
      {current && (
        <section
          className="pkg-active-banner"
          aria-label={copy("កញ្ចប់បច្ចុប្បន្ន", "Active Subscription")}
        >
          <div>
            <span className="pkg-active-banner-pill">
              <ShieldCheck size={13} />
              <span>{copy("កញ្ចប់បច្ចុប្បន្នរបស់អ្នក", "ACTIVE PLAN")}</span>
            </span>
            <h2 className="pkg-active-banner-title">
              {current.packagePlan?.packageName || copy("កញ្ចប់សកម្ម", "Active Plan")}
            </h2>
            <p className="pkg-active-banner-desc">
              {current.message || copy("កញ្ចប់នេះកំពុងដំណើរការពេញលេញលើគណនីរបស់អ្នក។", "This subscription is fully active for your account.")}
            </p>
          </div>
          <div className="pkg-active-banner-meta">
            <Clock size={16} className="text-emerald-300" />
            <span>
              {current.endDate
                ? `${copy("ផុតកំណត់នៅថ្ងៃ:", "Expires:")} ${new Intl.DateTimeFormat(lang === "en" ? "en-US" : "km-KH", { dateStyle: "long" }).format(new Date(current.endDate))}`
                : copy("សិទ្ធិប្រើប្រាស់គ្មានកំណត់", "Lifetime access")}
            </span>
          </div>
        </section>
      )}

      {/* Plan Cards Grid */}
      <section
        className="pkg-grid"
        aria-label={copy("បញ្ជីកញ្ចប់សេវាកម្ម", "Available subscription plans")}
      >
        {packages.map((plan) => {
          const badgeConfig = PACKAGE_BADGES[plan.code?.toUpperCase()] || PACKAGE_BADGES.BASIC;
          const isCurrent = current?.packagePlan?.id === plan.id;
          const isTargeted = targetedCode && plan.code?.toUpperCase() === targetedCode;
          const BadgeIcon = badgeConfig.icon;
          const badgeText = lang === "en" ? badgeConfig.labelEn : badgeConfig.labelKm;

          return (
            <article
              key={plan.id}
              className={`pkg-card ${badgeConfig.featured ? "is-featured" : ""} ${isTargeted ? "is-targeted" : ""}`}
            >
              {isTargeted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#B98B42] to-[#9C7332] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles size={11} />
                  <span>{copy("បានជ្រើសរើសពីទំព័រតម្លៃ", "Selected plan")}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span
                    className="pkg-card-badge"
                    style={{ background: badgeConfig.bg, color: badgeConfig.color }}
                  >
                    <BadgeIcon size={14} />
                    <span>{badgeText}</span>
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {copy("កំពុងប្រើ", "Current")}
                    </span>
                  )}
                </div>

                <h2 className="pkg-card-name">
                  {plan.packageName}
                </h2>
                <p className="pkg-card-desc">
                  {plan.description}
                </p>

                <div className="pkg-card-pricing">
                  <div className="pkg-card-price">
                    {formatMoney(plan.price, plan.currency, lang)}
                  </div>
                  {plan.durationDays && (
                    <div className="pkg-card-period">
                      {copy("សុពលភាព:", "Validity:")} {packageLimit(plan.durationDays, lang)} {copy("ថ្ងៃ", "days")} ({plan.billingInterval})
                    </div>
                  )}
                </div>

                <ul className="pkg-card-features">
                  <FeatureItem>
                    {copy("បង្កើតបានរហូតដល់", "Up to")}{" "}
                    <strong className="font-bold text-[#1F2421]">
                      {packageLimit(plan.maxInvitations, lang)} {copy("សន្លឹកការ", "invitations")}
                    </strong>
                  </FeatureItem>
                  <FeatureItem>
                    {copy("ភ្ញៀវរហូតដល់", "Up to")}{" "}
                    <strong className="font-bold text-[#1F2421]">
                      {packageLimit(plan.maxGuestsPerInvitation ?? plan.maxGuests, lang)} {copy("នាក់/សន្លឹកការ", "guests per invitation")}
                    </strong>
                  </FeatureItem>
                  <FeatureItem>
                    {copy("សមាជិកគ្រប់គ្រងរួម", "Team collaboration:")}{" "}
                    <strong className="font-bold text-[#1F2421]">
                      {packageLimit(plan.maxTeamMembers ?? 1, lang)} {copy("នាក់", "members")}
                    </strong>
                  </FeatureItem>
                  {plan.premiumTemplatesEnabled && (
                    <FeatureItem>
                      {copy("សិទ្ធិប្រើប្រាស់ម៉ូតធៀបការ Premium", "Premium invitation templates")}
                    </FeatureItem>
                  )}
                  {plan.qrCheckInEnabled && (
                    <FeatureItem>
                      {copy("ប្រព័ន្ធស្កេន QR ពិនិត្យវត្តមានភ្ញៀវមុខរោង", "QR guest check-in at reception")}
                    </FeatureItem>
                  )}
                  {plan.seatingEnabled && (
                    <FeatureItem>
                      {copy("រៀបចំតុភ្ញៀវ (Seating arrangement)", "Guest seating chart")}
                    </FeatureItem>
                  )}
                </ul>
              </div>

              <button
                type="button"
                aria-label={isCurrent ? "Current plan" : "Subscribe / Upgrade"}
                disabled={savingId === plan.id || isCurrent}
                onClick={() => openCheckout(plan)}
                className={`pkg-card-btn ${isCurrent ? "current" : badgeConfig.featured ? "featured" : "primary"}`}
              >
                {isCurrent ? (
                  copy("កញ្ចប់បច្ចុប្បន្ន", "Current Plan")
                ) : (
                  <>
                    <span>{copy("ជ្រើសកញ្ចប់នេះ (Subscribe / Upgrade)", "Subscribe / Upgrade")}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </article>
          );
        })}
      </section>

      {/* Subscription History Section */}
      <HistoryTable history={history} lang={lang} copy={copy} />

      {/* Frequently Asked Questions */}
      <section className="pkg-section-card" aria-label="FAQ">
        <div className="flex items-center gap-2 mb-4 text-[#B98B42]">
          <HelpCircle size={20} />
          <h2 className="text-base sm:text-lg font-bold text-[#1F2421]">
            {copy("សំណួរដែលសួរញឹកញាប់អំពីកញ្ចប់សេវា", "Frequently Asked Questions")}
          </h2>
        </div>
        <div className="pkg-faq-grid">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#F1EBD8]">
            <h3 className="font-bold text-[#1F2421] mb-1.5 flex items-center gap-1.5">
              <Calendar size={15} className="text-[#B98B42]" />
              {copy("សុពលភាព និងការបន្តសេវា", "Plan Validity & Expiry")}
            </h3>
            <p className="leading-relaxed">
              {copy(
                "សុពលភាពអាស្រ័យលើកញ្ចប់ដែលអ្នកជ្រើសរើស។ សូមពិនិត្យរយៈពេល និងសិទ្ធិប្រើប្រាស់ក្នុងព័ត៌មានកញ្ចប់មុនទូទាត់។",
                "Plans remain active for 365 days from payment confirmation. All published wedding invitations stay online."
              )}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#F1EBD8]">
            <h3 className="font-bold text-[#1F2421] mb-1.5 flex items-center gap-1.5">
              <CreditCard size={15} className="text-[#0F766E]" />
              {copy("ការទូទាត់តាម ABA PayWay", "ABA PayWay Reconciliation")}
            </h3>
            <p className="leading-relaxed">
              {copy(
                "ប្រព័ន្ធទទួលការទូទាត់ប្រាក់ដុល្លារ (USD) តាម ABA PayWay ជាមួយការផ្ទៀងផ្ទាត់ដោយស្វ័យប្រវត្តិតាមរយៈលេខ ៣ ខ្ទង់ចុងក្រោយនៃគណនី។",
                "Payments are settled in USD via ABA PayWay and automatically reconciled using the trailing 3 digits of your account."
              )}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#F1EBD8]">
            <h3 className="font-bold text-[#1F2421] mb-1.5 flex items-center gap-1.5">
              <FileText size={15} className="text-[#7C3AED]" />
              {copy("កូតាភ្ញៀវ និងម៉ូតធៀប", "Guest Quotas & Templates")}
            </h3>
            <p className="leading-relaxed">
              {copy(
                "កញ្ចប់ Pro និង Premium ផ្តល់សិទ្ធិប្រើប្រាស់ម៉ូតធៀបការ VIP ទាំងអស់ ព្រមទាំងប្រព័ន្ធស្កេនវត្តមាន QR Code នៅមុខរោងការ។",
                "Pro and Premium packages unlock all VIP templates and reception QR check-in capabilities."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        checkout={checkout}
        saving={savingId != null}
        lang={lang}
        copy={copy}
        onChange={setCheckout}
        onSubmit={createCheckout}
        onClose={() => setCheckout(null)}
      />
    </main>
  );
}

function FeatureItem({ children }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 size={16} className="text-[#0F766E] mt-0.5 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

function CheckoutModal({ checkout, saving, lang, copy, onChange, onSubmit, onClose }) {
  if (!checkout) return null;
  const isDetails = checkout.stage === "details";
  const terminal = ["success", "expired", "review"].includes(checkout.stage);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isDetails ? `Subscribe to ${checkout.plan?.packageName || ""}` : `Payment · ${checkout.plan?.packageName || ""}`}
      subtitle={formatMoney(checkout.amount ?? checkout.plan?.price, checkout.currency ?? checkout.plan?.currency, lang)}
      size="sm"
      closeOnBackdropClick={!saving}
      closeOnEscape={!saving}
    >
      {isDetails ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <label htmlFor="payerNameInput" className="block text-xs font-bold text-slate-800">
            <span className="block mb-1.5">{copy("ឈ្មោះម្ចាស់គណនី ABA (ABA Account Holder Name)", "ABA Account Holder Name")}</span>
            <input
              id="payerNameInput"
              aria-label="ABA Account Holder Name"
              autoFocus
              value={checkout.payerName}
              onChange={(event) =>
                onChange((value) => ({ ...value, payerName: event.target.value, validationError: "" }))
              }
              maxLength={120}
              placeholder="KOEURNG VIREAK"
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl uppercase font-semibold shadow-xs focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            />
          </label>

          <label htmlFor="payerLast3Input" className="block text-xs font-bold text-slate-800">
            <span className="block mb-1.5">{copy("លេខ ៣ ខ្ទង់ចុងក្រោយនៃគណនី ABA (Last 3 digits of ABA account)", "Last 3 digits of ABA account")}</span>
            <input
              id="payerLast3Input"
              aria-label="Last 3 digits of ABA account"
              inputMode="numeric"
              value={checkout.payerAccountLast3}
              onChange={(event) =>
                onChange((value) => ({
                  ...value,
                  payerAccountLast3: event.target.value.replace(/\D/g, "").slice(0, 3),
                  validationError: "",
                }))
              }
              maxLength={3}
              placeholder="247"
              className="w-full h-11 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl font-mono text-center tracking-widest font-black shadow-xs focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            />
          </label>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs leading-relaxed">
            {copy(
              "សូមប្រើប្រាស់គណនី ABA ដូចគ្នានៅពេលធ្វើការផ្ទេរប្រាក់ ដើម្បីឱ្យប្រព័ន្ធអាចផ្ទៀងផ្ទាត់ដោយស្វ័យប្រវត្តិ។",
              "Use the same ABA account when making payment."
            )}
          </div>

          {checkout.validationError && (
            <p className="text-xs text-rose-600 font-semibold" role="alert">
              {checkout.validationError}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              {copy("បោះបង់", "Cancel")}
            </button>
            <button
              type="submit"
              aria-label={copy("បន្តទៅកាន់ ABA PayWay (Continue to ABA PayWay)", "Continue to ABA PayWay")}
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-[#0F766E] hover:bg-[#0D5F58] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0F766E]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {saving ? (
                <span>{copy("កំពុងរៀបចំ...", "Processing...")}</span>
              ) : (
                <>
                  <span>{copy("បន្តទៅកាន់ ABA PayWay", "Continue to ABA PayWay")}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#F1EBD8] space-y-2">
            <SummaryRow label={copy("លេខកូដកម្ម៉ង់", "Order Code")} value={checkout.orderCode} code />
            <SummaryRow
              label={copy("ចំនួនទឹកប្រាក់", "Amount")}
              value={formatMoney(checkout.amount, checkout.currency, lang)}
            />
            <SummaryRow
              label={copy("ស្ថានភាព", "Status")}
              value={
                checkout.stage === "success"
                  ? copy("ទូទាត់ជោគជ័យ", "Active / Paid")
                  : checkout.stage === "review"
                  ? copy("កំពុងពិនិត្យ", "Review Required")
                  : checkout.stage === "expired"
                  ? copy("ផុតកំណត់", "Expired")
                  : copy("រង់ចាំការទូទាត់", "Awaiting Payment")
              }
            />
          </div>

          {checkout.stage === "waiting" && (
            <div className="text-center py-3 text-slate-600">
              <RotateCw className="animate-spin inline-block text-[#0F766E] mb-2" size={20} />
              <p className="font-medium text-xs">
                {copy("កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់ពី ABA PayWay…", "Waiting for payment confirmation…")}
              </p>
            </div>
          )}

          {checkout.stage === "review" && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs" role="status">
              {lang === "km" && (
                <div className="font-semibold mb-1">
                  ការទូទាត់ត្រូវបានទទួល ប៉ុន្តែត្រូវការការពិនិត្យពីអ្នកគ្រប់គ្រង។
                </div>
              )}
              <div className={lang === "km" ? "text-[11px] text-amber-800/80" : "font-semibold"}>
                Payment received but needs administrator review.
              </div>
            </div>
          )}

          {checkout.stage === "success" && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs">
              {lang === "km" && (
                <div className="font-bold mb-1">
                  កញ្ចប់សេវាកម្មត្រូវបានបើកដំណើរការដោយជោគជ័យ!
                </div>
              )}
              <div className={lang === "km" ? "text-[11px] text-emerald-800/80" : "font-bold"}>
                Subscription activated successfully.
              </div>
            </div>
          )}

          {checkout.stage === "expired" && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 text-xs font-semibold">
              {lang === "km" && (
                <div className="font-semibold mb-1">
                  ការទូទាត់បានផុតកំណត់។ សូមសាកល្បងម្ដងទៀត។
                </div>
              )}
              <div className={lang === "km" ? "text-[11px] text-rose-800/80" : "font-semibold"}>
                Payment session expired. Please start again.
              </div>
            </div>
          )}

          {checkout.paymentUrl && !terminal && (
            <a
              href={checkout.paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-full bg-[#0F766E] hover:bg-[#0D5F58] text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 no-underline transition-all shadow-md shadow-[#0F766E]/20"
            >
              <span>{copy("បន្តទៅកាន់ ABA PayWay", "Continue to ABA PayWay")}</span>
              <ExternalLink size={14} />
            </a>
          )}

          {terminal && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              {copy("បិទ", "Close")}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

function SummaryRow({ label, value, code = false }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-slate-500">{label}</span>
      {code ? (
        <code className="font-mono text-[11px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-800 font-bold">
          {value}
        </code>
      ) : (
        <strong className="text-slate-800 font-bold">{value}</strong>
      )}
    </div>
  );
}

function HistoryTable({ history, lang, copy }) {
  return (
    <section className="pkg-history" aria-labelledby="pkg-history-title">
      <div className="pkg-history-heading">
        <div>
          <p className="pkg-history-eyebrow">{copy("គណនី និងការទូទាត់", "Account & payments")}</p>
          <h2 id="pkg-history-title">{copy("ប្រវត្តិជាវកញ្ចប់", "Subscription history")}</h2>
        </div>
        {history.length > 0 && (
          <span className="pkg-history-count">
            {history.length} {copy("កំណត់ត្រា", "orders")}
          </span>
        )}
      </div>
      {history.length === 0 ? (
        <p className="pkg-history-empty">
          {copy("មិនទាន់មានប្រវត្តិទិញកញ្ចប់នៅឡើយទេ។", "You don't have any subscription orders yet.")}
        </p>
      ) : (
        <ul className="pkg-history-list">
          {history.map((item, index) => {
            // Payment receipt alone never grants active subscription entitlement.
            const active = item.active === true && item.status === "ACTIVE" && item.paymentStatus === "PAID";
            const expired = item.status === "EXPIRED" || item.paymentStatus === "EXPIRED";
            const review = item.status === "REVIEW_REQUIRED"
              || (item.paymentStatus === "PAID" && !active && !expired);
            const pending = !review && !expired
              && (item.status === "PENDING_PAYMENT" || item.paymentStatus === "PENDING");
            const tone = active ? "active" : expired ? "expired" : review ? "review" : pending ? "pending" : "neutral";
            const statusText = active
              ? copy("កំពុងប្រើប្រាស់", "Active")
              : expired
                ? copy("ផុតកំណត់", "Expired")
                : review
                  ? copy("កំពុងរង់ចាំការផ្ទៀងផ្ទាត់", "Under review")
                  : pending
                    ? copy("រង់ចាំការទូទាត់", "Awaiting payment")
                    : (item.status || copy("មិនទាន់បានបញ្ជាក់", "Not confirmed"));
            const details = lang === "km"
              ? active
                ? "កញ្ចប់នេះបានបើកប្រើប្រាស់រួចហើយ។"
                : expired
                  ? "កញ្ចប់ ឬការបញ្ជាទិញនេះផុតកំណត់ហើយ។"
                  : review
                    ? "ការទូទាត់កំពុងត្រូវបានផ្ទៀងផ្ទាត់។ សិទ្ធិប្រើប្រាស់មិនទាន់បានបើកទេ។"
                    : pending
                      ? "ការបញ្ជាទិញកំពុងរង់ចាំការទូទាត់ និងការផ្ទៀងផ្ទាត់។"
                      : statusText
              : (item.message || statusText);
            return (
              <li className="pkg-history-item" key={item.id || item.orderCode || index}>
                <div className="pkg-history-package">
                  <h3>{item.packagePlan?.packageName || copy("កញ្ចប់សេវាកម្ម", "Subscription package")}</h3>
                  <span className={`pkg-history-status pkg-history-status--${tone}`}>{statusText}</span>
                </div>
                <dl className="pkg-history-details">
                  <div>
                    <dt>{copy("ចំនួនទឹកប្រាក់", "Amount")}</dt>
                    <dd className="pkg-history-amount">{formatMoney(item.amount, item.currency, lang)}</dd>
                  </div>
                  <div>
                    <dt>{copy("លេខបញ្ជាទិញ", "Order reference")}</dt>
                    <dd><code>{item.orderCode || "—"}</code></dd>
                  </div>
                </dl>
                <div className="pkg-history-note">
                  <span>{copy("ព័ត៌មានស្ថានភាព", "Status details")}</span>
                  <p>{details}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
