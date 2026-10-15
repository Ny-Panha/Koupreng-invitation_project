import { QrCode, CheckCircle2, XCircle, HelpCircle, Send } from "lucide-react";

export default function GuestsRsvpCheckinSection({
  summary = {},
  deliveryAnalytics = null,
  rsvpAnalytics = null,
  checkInAnalytics = null,
  lang = "km",
}) {
  const totalGuests = Number(summary.totalGuests || deliveryAnalytics?.summary?.totalGuests || 0);
  const totalRsvps = Number(summary.totalRsvps || rsvpAnalytics?.summary?.totalRsvps || 0);
  const totalCheckIns = Number(summary.totalCheckIns || checkInAnalytics?.summary?.checkedIn || 0);

  const attending = Number(rsvpAnalytics?.summary?.attending || 0);
  const declined = Number(rsvpAnalytics?.summary?.declined || 0);
  const maybe = Number(rsvpAnalytics?.summary?.maybe || 0);

  const delivered = Number(deliveryAnalytics?.summary?.delivered || 0);
  const opened = Number(deliveryAnalytics?.summary?.opened || 0);

  const rsvpRate = totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0;
  const checkInRate = totalGuests > 0 ? Math.round((totalCheckIns / totalGuests) * 100) : 0;

  return (
    <div className="card space-y-6">
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          {lang === "en" ? "Guest Attendance, RSVP & QR Check-in" : "ភ្ញៀវ ការឆ្លើយតប RSVP & ការ Check-in តាម QR"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          {lang === "en"
            ? "Invitation delivery funnel, response confirmation, and real-time reception check-in"
            : "ដំណើរការបញ្ជូនធៀបការ ការឆ្លើយតប និងការស្កេនចូលរួមពិធី"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RSVP Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === "en" ? "RSVP Responses" : "ការឆ្លើយតប RSVP"}
            </span>
            <span className="rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold px-2 py-0.5 text-xs">
              {rsvpRate}% {lang === "en" ? "Rate" : "អត្រា"}
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
            {totalRsvps} <span className="text-sm font-normal text-slate-400">/ {totalGuests}</span>
          </div>

          <div className="space-y-1.5 text-xs border-t border-slate-100 dark:border-zinc-800 pt-2">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Attending" : "ចូលរួម"}</span>
              </span>
              <span className="font-bold">{attending}</span>
            </div>

            <div className="flex items-center justify-between text-rose-600">
              <span className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Declined" : "មិនចូលរួម"}</span>
              </span>
              <span className="font-bold">{declined}</span>
            </div>

            <div className="flex items-center justify-between text-amber-600">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Tentative / Maybe" : "មិនទាន់ច្បាស់"}</span>
              </span>
              <span className="font-bold">{maybe}</span>
            </div>
          </div>
        </div>

        {/* Check-in Progress Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === "en" ? "Reception Check-in" : "ការ Check-in ចូលរួម"}
            </span>
            <QrCode className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
            {totalCheckIns} <span className="text-sm font-normal text-slate-400">/ {totalGuests}</span>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{lang === "en" ? "Arrival Progress" : "វឌ្ឍនភាពវត្តមាន"}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{checkInRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, checkInRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Delivery Funnel Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === "en" ? "Delivery & Engagement" : "ការផ្ញើ & បើកមើល"}
            </span>
            <Send className="h-4 w-4 text-cyan-500" />
          </div>

          <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
            {opened} <span className="text-sm font-normal text-slate-400">{lang === "en" ? "opened" : "បានបើកមើល"}</span>
          </div>

          <div className="space-y-1.5 text-xs border-t border-slate-100 dark:border-zinc-800 pt-2 text-slate-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>{lang === "en" ? "Delivered to guests:" : "បានបញ្ជូនដល់ដៃ:"}</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{delivered}</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === "en" ? "Open Rate:" : "អត្រាបើកមើល:"}</span>
              <span className="font-semibold text-cyan-600">
                {totalGuests > 0 ? Math.round((opened / totalGuests) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

