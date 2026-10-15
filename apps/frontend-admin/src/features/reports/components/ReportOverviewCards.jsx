import { Users, Mail, TrendingUp, UserCheck, CalendarDays } from "lucide-react";
import { StatCard } from "../../../shared/ui/AdminUI";
import { reportText, reportValue } from "../reportModel";
export default function ReportOverviewCards({ summary, lang }) {
  const text = (key) => reportText(key, lang);
  const fields = [
    ["totalUsers", Users],
    ["activeUsers", Users],
    ["totalInvitations", Mail],
    ["activeSubscriptions", CalendarDays],
    ["totalGuests", UserCheck],
    ["totalRsvps", UserCheck],
  ];
  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      aria-label={text("fullScope")}
    >
      {fields.map(([key, Icon]) => (
        <StatCard
          key={key}
          label={text(key)}
          value={reportValue(summary[key], { type: "NUMBER" }, lang)}
          icon={Icon}
          tone="amber"
        />
      ))}
      {["USD", "KHR"].map((currency) => (
        <StatCard
          key={currency}
          label={`${text("confirmedReceipts")} \u00b7 ${currency}`}
          value={reportValue(
            summary.confirmedReceiptsByCurrency?.[currency],
            { type: "MONEY" },
            lang,
            { currency },
          )}
          icon={TrendingUp}
          tone="emerald"
        />
      ))}
      <StatCard
        label={text("periodGrowth")}
        value={reportValue(summary.periodGrowth, { type: "PERCENT" }, lang)}
        note={
          summary.periodGrowth == null
            ? `${text("noActivity")} \u00b7 ${summary.growthState || ""}`
            : text("fullScope")
        }
        icon={TrendingUp}
        tone="cyan"
      />
    </section>
  );
}
