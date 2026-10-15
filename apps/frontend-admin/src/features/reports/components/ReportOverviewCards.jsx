import { Mail, TrendingUp, Users, UserCheck, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatCard } from "../../../shared/ui/AdminUI";
import { formatMoney } from "../reportConstants";

export default function ReportOverviewCards({ summary = {}, lang = "km" }) {
  const totalInvitations = Number(summary.totalInvitations || 0);
  const publishedInvitations = Number(summary.publishedInvitations || 0);
  const publishRate = totalInvitations > 0 ? Math.round((publishedInvitations / totalInvitations) * 100) : 0;

  const paidUsd = Number(summary.paidRevenueByCurrency?.USD ?? summary.revenueByCurrency?.USD ?? summary.totalRevenueUsd ?? summary.paidAmountUsd ?? 0);
  const paidKhr = Number(summary.paidRevenueByCurrency?.KHR ?? summary.revenueByCurrency?.KHR ?? summary.paidAmountKhr ?? 0);

  const totalUsers = Number(summary.totalUsers || 0);
  const activeUsers = Number(summary.activeUsers || 0);

  const totalGuests = Number(summary.totalGuests || 0);
  const totalRsvps = Number(summary.totalRsvps || 0);
  const rsvpRate = totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0;

  const momGrowth = summary.eventGrowthMoM !== undefined ? Number(summary.eventGrowthMoM) : null;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        label={lang === "en" ? "Total Invitations" : "ធៀបការសរុប"}
        value={totalInvitations}
        note={lang === "en" ? `${publishedInvitations} Published (${publishRate}%)` : `${publishedInvitations} បានផ្សាយ (${publishRate}%)`}
        icon={Mail}
        tone="amber"
      />

      <StatCard
        label={lang === "en" ? "Revenue (USD)" : "ចំណូល USD (Paid)"}
        value={formatMoney(paidUsd, "USD")}
        note={paidKhr > 0 ? (lang === "en" ? `+ ${formatMoney(paidKhr, "KHR")} in Riel` : `+ ${formatMoney(paidKhr, "KHR")}`) : (lang === "en" ? "Confirmed payments" : "ការទូទាត់ជោគជ័យ")}
        icon={TrendingUp}
        tone="emerald"
      />

      {paidKhr > 0 && (
        <StatCard
          label={lang === "en" ? "Revenue (KHR)" : "ចំណូលរៀល (KHR)"}
          value={formatMoney(paidKhr, "KHR")}
          note={lang === "en" ? "Independent KHR ledger" : "គណនីប្រាក់រៀល"}
          icon={TrendingUp}
          tone="cyan"
        />
      )}

      <StatCard
        label={lang === "en" ? "Total Users" : "អ្នកប្រើប្រាស់សរុប"}
        value={totalUsers}
        note={lang === "en" ? `${activeUsers} Active Accounts` : `${activeUsers} គណនី Active`}
        icon={Users}
        tone="cyan"
      />

      <StatCard
        label={lang === "en" ? "Total Guests" : "ភ្ញៀវសរុប (Guests)"}
        value={totalGuests}
        note={lang === "en" ? `${totalRsvps} RSVPs (${rsvpRate}%)` : `${totalRsvps} ឆ្លើយតប (${rsvpRate}%)`}
        icon={UserCheck}
        tone="purple"
      />

      <StatCard
        label={lang === "en" ? "Monthly Growth" : "កំណើនប្រចាំខែ (MoM)"}
        value={momGrowth !== null ? `${momGrowth > 0 ? "+" : ""}${momGrowth}%` : "—"}
        note={
          momGrowth !== null && momGrowth >= 0
            ? (lang === "en" ? "Growth vs previous month" : "កើនឡើងធៀបខែមុន")
            : (lang === "en" ? "Compared to last month" : "ធៀបនឹងខែមុន")
        }
        icon={momGrowth !== null && momGrowth >= 0 ? ArrowUpRight : ArrowDownRight}
        tone={momGrowth !== null && momGrowth >= 0 ? "emerald" : "rose"}
      />
    </section>
  );
}

