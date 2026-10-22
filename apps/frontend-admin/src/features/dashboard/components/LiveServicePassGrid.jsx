import { Plus, ArrowUpRight, MoreHorizontal, Check, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function LiveServicePassGrid({ lang = "km" }) {
  const cards = [
    {
      id: "#INV-1061",
      time: lang === "en" ? "24 min ago" : "24 នាទីមុន",
      title: lang === "en" ? "Wedding: Sok & Chenda" : "មង្គលការ សុខ & ចិន្តា",
      items: [
        lang === "en" ? "1× Khmer Celestial Gold Theme" : "1× កញ្ចប់ Khmer Celestial Gold",
        lang === "en" ? "350× Digital Invitations sent" : "350× ធៀបការឌីជីថលបានផ្ញើ",
        lang === "en" ? "280× RSVP Confirmed (80%)" : "280× ភ្ញៀវឆ្លើយតប RSVP យល់ព្រម",
      ],
      amount: "$25.00",
      statusText: lang === "en" ? "Published · 8 actions" : "បានផ្សាយ · 8 សកម្មភាព",
      statusType: "ready", // mint green
    },
    {
      id: "#INV-1066",
      time: lang === "en" ? "14 min ago" : "14 នាទីមុន",
      title: lang === "en" ? "Engagement: Piseth & Kalyan" : "ពិធីភ្ជាប់ពាក្យ ពិសិដ្ឋ & កល្យាណ",
      items: [
        lang === "en" ? "1× Lotus Blossom Theme" : "1× កញ្ចប់ Lotus Rose Theme",
        lang === "en" ? "120× Guest cards delivered" : "120× សំបុត្រអញ្ជើញបានផ្ញើ",
        lang === "en" ? "95× Attendance confirmed" : "95× ភ្ញៀវបញ្ជាក់វត្តមាន",
      ],
      amount: "$15.00",
      statusText: lang === "en" ? "Published · 4 actions" : "បានផ្សាយ · 4 សកម្មភាព",
      statusType: "ready", // mint green
    },
    {
      id: "#INV-1062",
      time: lang === "en" ? "22 min ago" : "22 នាទីមុន",
      title: lang === "en" ? "Wedding: Dara & Sophy" : "មង្គលការ ដារ៉ា & សុភី",
      items: [
        lang === "en" ? "1× Selecting Royal Gold Theme" : "1× កំពុងរៀបចំ Royal Gold",
        lang === "en" ? "1× Hair-Cutting Timeline" : "1× កាលវិភាគពិធីកាត់សក់",
        lang === "en" ? "1× Table Guest Seating Plan" : "1× រៀបចំតារាងតុភ្ញៀវ",
      ],
      amount: "$35.00",
      statusText: lang === "en" ? "In Draft · 8 steps" : "កំពុងរៀបចំ · 8 ជំហាន",
      statusType: "cooking", // peach / coral
    },
    {
      id: "#INV-1063",
      time: lang === "en" ? "17 min ago" : "17 នាទីមុន",
      title: lang === "en" ? "Wedding: Chanthorn & Theary" : "មង្គលការ ចាន់ថន & ធារី",
      items: [
        lang === "en" ? "1× VIP Custom Domain Pack" : "1× កញ្ចប់ VIP Custom Domain",
        lang === "en" ? "500× Guests awaiting send" : "500× បញ្ជីភ្ញៀវរង់ចាំផ្ញើ",
        lang === "en" ? "1× Linked ABA PayWay QR" : "1× ភ្ជាប់ ABA PayWay Merchant",
      ],
      amount: "$50.00",
      statusText: lang === "en" ? "Payment Pending · 12 items" : "រង់ចាំទូទាត់ · 12 ធាតុ",
      statusType: "cooking", // peach / coral
    },
  ];

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#121622]/95 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {lang === "en" ? "On the pass" : "សកម្មភាពប្រព័ន្ធ (On the pass)"}
          </h3>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
            {lang === "en" ? "12 open · 2 ready" : "12 កំពុងដំណើរការ · 2 រួចរាល់"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#1f2738] dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Add"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#1f2738] dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Expand"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2x2 Pastel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c, i) => {
          const isReady = c.statusType === "ready";

          return (
            <div
              key={c.id}
              style={{ animationDelay: `${0.26 + i * 0.05}s` }}
              className={`relative flex flex-col justify-between p-3.5 rounded-[18px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-zoom-in ${
                isReady
                  ? "bg-[#c4ebd6] text-[#133d2a] dark:bg-[#b5e3cc] dark:text-[#0f3423]"
                  : "bg-[#ffd3c1] text-[#462117] dark:bg-[#fcc8b3] dark:text-[#3d1a10]"
              }`}
            >
              {/* Card Top: ID, time badge & options */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5 opacity-90">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold">{c.id}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full border border-black/15 text-[9px] font-semibold bg-black/5">
                      <span>⏱</span>
                      <span>{c.time}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p-0.5 rounded-md hover:bg-black/10 transition cursor-pointer"
                    aria-label="Options"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Table Title */}
                <h4 className="text-xs sm:text-[13px] font-extrabold tracking-tight mb-1.5 truncate">
                  {c.title}
                </h4>

                {/* Items List */}
                <ul className="space-y-0.5 text-[11px] font-semibold leading-tight opacity-90 mb-2">
                  {c.items.map((item, idx) => (
                    <li key={idx} className="truncate">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Bottom: Price, status label & action circle button */}
              <div className="flex items-end justify-between pt-2 border-t border-black/10">
                <div>
                  <strong className="block text-sm sm:text-base font-black tracking-tight leading-none mb-0.5">
                    {c.amount}
                  </strong>
                  <span className="text-[10px] font-bold opacity-80 block truncate">
                    {c.statusText}
                  </span>
                </div>

                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition-transform hover:scale-105 cursor-pointer shrink-0"
                  aria-label={isReady ? "Ready check" : "Notify"}
                >
                  {isReady ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 stroke-[2.5]" />
                  ) : (
                    <Bell className="h-3.5 w-3.5 text-[#462117]" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
