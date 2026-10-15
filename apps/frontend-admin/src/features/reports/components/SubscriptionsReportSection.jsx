import { ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";

export default function SubscriptionsReportSection({ summary = {}, lang = "km" }) {
  const tiers = Array.isArray(summary.subscriptionTiers) ? summary.subscriptionTiers : [];
  const transitions = Number(summary.subscriptionTransitions || 0);
  const upgradeRate = Number(summary.upgradeRate || 0).toFixed(1);
  const downgradeRate = Number(summary.downgradeRate || 0).toFixed(1);

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {lang === "en" ? "Subscription Packages & Tier Analytics" : "កញ្ចប់សេវា & ការផ្លាស់ប្តូរកម្រិត (Tiers)"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {lang === "en"
              ? `Active subscriber distribution, tier transitions (${transitions}), and retention health`
              : `ការបែងចែកកញ្ចប់សមាជិកសកម្ម ការដំឡើង និងទម្លាក់កម្រិតសេវា (${transitions} ប្រតិបត្តិការ)`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map((t) => (
          <div
            key={t.tier}
            className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 bg-slate-50/50 dark:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.tier} Tier
              </span>
              <Layers className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-zinc-100">
              {t.activeSubscriptions ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {lang === "en" ? "Active subscriptions" : "សមាជិកកំពុងដំណើរការ"}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {lang === "en" ? "Tier Upgrade Rate" : "អត្រាដំឡើងកញ្ចប់សេវា (Upgrades)"}
            </span>
          </div>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {upgradeRate}%
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/20 p-3">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              {lang === "en" ? "Tier Downgrade Rate" : "អត្រាទម្លាក់កញ្ចប់សេវា (Downgrades)"}
            </span>
          </div>
          <span className="text-sm font-bold text-rose-700 dark:text-rose-400">
            {downgradeRate}%
          </span>
        </div>
      </div>
    </div>
  );
}

