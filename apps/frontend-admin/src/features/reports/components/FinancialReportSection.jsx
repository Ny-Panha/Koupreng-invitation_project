import { useMemo, useState } from "react";
import { Download, Search, ShieldCheck, Lock } from "lucide-react";
import { ActionButton, StatusBadge } from "../../../shared/ui/AdminUI";
import { formatMoney } from "../reportConstants";
import { exportCsv } from "../../../shared/utils/csvExport";

export default function FinancialReportSection({
  paymentsReport = null,
  platformReport = null,
  lang = "km",
}) {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const summary = paymentsReport?.summary || platformReport?.summary || {};

  const paidUsd = Number(summary.paidRevenueByCurrency?.USD ?? summary.revenueByCurrency?.USD ?? summary.paidAmountUsd ?? 0);
  const paidKhr = Number(summary.paidRevenueByCurrency?.KHR ?? summary.revenueByCurrency?.KHR ?? summary.paidAmountKhr ?? 0);

  const pendingUsd = Number(summary.pendingRevenueByCurrency?.USD ?? summary.pendingAmountUsd ?? 0);
  const pendingKhr = Number(summary.pendingRevenueByCurrency?.KHR ?? summary.pendingAmountKhr ?? 0);

  const failedUsd = Number(summary.failedRevenueByCurrency?.USD ?? 0);
  const failedKhr = Number(summary.failedRevenueByCurrency?.KHR ?? 0);

  const templateUsd = Number(summary.templateRevenueByCurrency?.USD ?? 0);
  const subscriptionUsd = Number(summary.subscriptionRevenueByCurrency?.USD ?? 0);

  const paidPayments = Number(summary.paidPayments || 0);
  const pendingPayments = Number(summary.pendingPayments || 0);
  const reviewPayments = Number(summary.reviewPayments || 0);
  const failedPayments = Number(summary.failedPayments || 0);

  // Combine transactions from paymentsReport rows or platformReport rows
  const rawRows = useMemo(() => {
    if (Array.isArray(paymentsReport?.rows) && paymentsReport.rows.length > 0) {
      return paymentsReport.rows;
    }
    if (Array.isArray(platformReport?.rows) && platformReport.rows.length > 0) {
      return platformReport.rows;
    }
    return [];
  }, [paymentsReport, platformReport]);

  const transactions = useMemo(() => {
    return rawRows.map((r, i) => ({
      id: r.id || r.reference || r.orderCode || `tx-${i}`,
      reference: r.reference || r.orderCode || `TX-${i + 1}`,
      period: r.period || (r.createdAt ? String(r.createdAt).slice(0, 10) : "—"),
      type: r.type || "PAYMENT",
      packageName: r.packageName || r.type || "Service",
      provider: r.provider || "KHQR",
      status: r.status || "COMPLETED",
      currency: r.currency || "USD",
      amount: r.totalAmount !== undefined ? r.totalAmount : r.amount,
      transactionCount: r.transactionCount ?? 1,
      suppressed: Boolean(r.suppressed || (r.transactionCount !== undefined && r.transactionCount < 5 && r.totalAmount === null)),
      suppressionReason: r.suppressionReason || (r.transactionCount < 5 ? "SAMPLE_SIZE_UNDER_5" : null),
      createdAt: r.createdAt,
    }));
  }, [rawRows]);

  const providers = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      if (tx.provider) set.add(String(tx.provider));
    });
    return Array.from(set).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchSearch =
        !q ||
        [tx.reference, tx.packageName, tx.provider, tx.period].some(
          (val) => val && String(val).toLowerCase().includes(q)
        );
      const matchProvider = providerFilter === "ALL" || tx.provider === providerFilter;
      const matchType = typeFilter === "ALL" || String(tx.type).toUpperCase() === typeFilter;
      const matchStatus = statusFilter === "ALL" || String(tx.status).toUpperCase() === statusFilter;
      return matchSearch && matchProvider && matchType && matchStatus;
    });
  }, [transactions, search, providerFilter, typeFilter, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      "Reference",
      "Type",
      "Item / Description",
      "Amount",
      "Currency",
      "Status",
      "Provider",
      "Period / Date",
      "Count",
      "Privacy Protected",
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.reference,
      tx.type,
      tx.packageName,
      tx.suppressed ? "SUPPRESSED" : tx.amount ?? 0,
      tx.currency,
      tx.status,
      tx.provider,
      tx.period,
      tx.transactionCount,
      tx.suppressed ? "YES (<5 items)" : "NO",
    ]);
    exportCsv(`Koupreng-Financial-Transactions-${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Revenue */}
        <div className="card border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {lang === "en" ? "Confirmed Paid Revenue" : "ចំណូលបានទូទាត់ (Confirmed)"}
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {paidPayments} {lang === "en" ? "Paid" : "ជោគជ័យ"}
            </span>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-zinc-100">
            {formatMoney(paidUsd, "USD")}
          </div>
          {paidKhr > 0 && (
            <div className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              + {formatMoney(paidKhr, "KHR")}
            </div>
          )}
          <div className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
            {lang === "en"
              ? `Templates: ${formatMoney(templateUsd, "USD")} | Subs: ${formatMoney(subscriptionUsd, "USD")}`
              : `គំរូធៀបការ: ${formatMoney(templateUsd, "USD")} | កញ្ចប់សេវា: ${formatMoney(subscriptionUsd, "USD")}`}
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="card border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {lang === "en" ? "Pending / Review Payments" : "រង់ចាំទូទាត់ & ពិនិត្យ (Pending)"}
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              {pendingPayments} {lang === "en" ? "Orders" : "ប្រតិបត្តិការ"}
            </span>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-zinc-100">
            {formatMoney(pendingUsd, "USD")}
          </div>
          {pendingKhr > 0 && (
            <div className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
              + {formatMoney(pendingKhr, "KHR")}
            </div>
          )}
          <div className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
            {reviewPayments > 0
              ? (lang === "en" ? `${reviewPayments} orders waiting for admin approval` : `${reviewPayments} កំពុងរង់ចាំ Admin ពិនិត្យ`)
              : (lang === "en" ? "Excludes unconfirmed orders from earned revenue" : "មិនរាប់បញ្ចូលក្នុងចំណូលទេ")}
          </div>
        </div>

        {/* Failed / Rejected Payments */}
        <div className="card border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {lang === "en" ? "Failed / Rejected Value" : "ការទូទាត់បរាជ័យ (Failed)"}
            </span>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-400">
              {failedPayments} {lang === "en" ? "Failed" : "បរាជ័យ"}
            </span>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-zinc-100">
            {formatMoney(failedUsd, "USD")}
          </div>
          {failedKhr > 0 && (
            <div className="mt-1 text-sm font-semibold text-rose-600 dark:text-rose-400">
              + {formatMoney(failedKhr, "KHR")}
            </div>
          )}
          <div className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
            {lang === "en" ? "Expired checkouts or rejected transfers" : "ផុតកំណត់ ឬបដិសេធ"}
          </div>
        </div>

        {/* Revenue Integrity & Audit Card */}
        <div className="card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>{lang === "en" ? "Financial Integrity" : "សុចរិតភាពហិរញ្ញវត្ថុ"}</span>
          </div>
          <div className="mt-3 text-sm text-slate-700 dark:text-zinc-300 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{lang === "en" ? "Currency Separation:" : "បែងចែករូបិយប័ណ្ណ:"}</span>
              <span className="font-bold text-emerald-600">USD & KHR Strict</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{lang === "en" ? "Settlement Policy:" : "គោលការណ៍ចំណូល:"}</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-200">Bank-Verified Only</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{lang === "en" ? "Privacy Protection:" : "ការការពារឯកជនភាព:"}</span>
              <span className="font-semibold text-amber-600">&lt; 5 Groups Hidden</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              {lang === "en" ? "Transaction Ledger & Reconciliation" : "កំណត់ត្រាប្រតិបត្តិការហិរញ្ញវត្ថុ"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {lang === "en"
                ? `Showing ${filteredTransactions.length} of ${transactions.length} records with privacy safeguards`
                : `បង្ហាញ ${filteredTransactions.length} ក្នុងចំណោម ${transactions.length} ប្រតិបត្តិការ (ការពារឯកជនភាព)`}
            </p>
          </div>

          <ActionButton variant="secondary" size="sm" onClick={handleExportCsv}>
            <Download className="h-3.5 w-3.5" />
            <span>{lang === "en" ? "Export CSV" : "ទាញយក CSV"}</span>
          </ActionButton>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder={lang === "en" ? "Search reference, item, period..." : "ស្វែងរកលេខកូដ, កម្មវិធី..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">{lang === "en" ? "All Types" : "គ្រប់ប្រភេទ"}</option>
            <option value="TEMPLATE">{lang === "en" ? "Template Sales" : "គំរូធៀបការ (Template)"}</option>
            <option value="SUBSCRIPTION">{lang === "en" ? "Subscription" : "កញ្ចប់សេវា (Subscription)"}</option>
          </select>

          <select
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="ALL">{lang === "en" ? "All Providers" : "គ្រប់ធនាគារ/ច្រកទូទាត់"}</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{lang === "en" ? "All Statuses" : "គ្រប់ស្ថានភាព"}</option>
            <option value="PAID">PAID (បានទូទាត់)</option>
            <option value="COMPLETED">COMPLETED (ជោគជ័យ)</option>
            <option value="PENDING">PENDING (រង់ចាំ)</option>
            <option value="PAID_PENDING_REVIEW">PENDING_REVIEW (រង់ចាំពិនិត្យ)</option>
            <option value="FAILED">FAILED (បរាជ័យ)</option>
            <option value="AGGREGATED">AGGREGATED (សរុប)</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>{lang === "en" ? "Reference" : "លេខកូដសម្គាល់"}</th>
                <th>{lang === "en" ? "Type" : "ប្រភេទ"}</th>
                <th>{lang === "en" ? "Item / Package" : "កញ្ចប់ / គំរូ"}</th>
                <th>{lang === "en" ? "Amount" : "ចំនួនទឹកប្រាក់"}</th>
                <th>{lang === "en" ? "Provider" : "ធនាគារ"}</th>
                <th>{lang === "en" ? "Status" : "ស្ថានភាព"}</th>
                <th>{lang === "en" ? "Date / Period" : "កាលបរិច្ឆេទ"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    {lang === "en" ? "No transactions found matching your filter criteria" : "មិនមានទិន្នន័យប្រតិបត្តិការត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ"}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                    <td className="font-mono text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {tx.reference}
                    </td>
                    <td>
                      <span className="inline-block rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="font-medium text-slate-900 dark:text-zinc-100">
                      {tx.packageName}
                    </td>
                    <td>
                      {tx.suppressed ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20"
                          title={
                            lang === "en"
                              ? "Fewer than 5 transactions in group: amount suppressed for privacy"
                              : "ចំនួនតិចជាង ៥: ទឹកប្រាក់ត្រូវបានលាក់ដើម្បីការពារទិន្នន័យឯកជន"
                          }
                        >
                          <Lock className="h-3 w-3" />
                          <span>{lang === "en" ? "Private (<5)" : "លាក់បាំង (<5)"}</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {formatMoney(tx.amount, tx.currency)}
                        </span>
                      )}
                    </td>
                    <td className="text-slate-600 dark:text-zinc-300">
                      {tx.provider}
                    </td>
                    <td>
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                      {tx.period}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

