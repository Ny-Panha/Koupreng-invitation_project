import { Plus, ArrowUpRight, Mail, Calendar, User, Sparkles, CheckCircle2, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../../shared/utils";

export default function RecentInvitationsCard({ lang = "km", invitations = [] }) {
  // Fallback demo cards if database has 0 invitations yet
  const fallbackCards = [
    {
      id: 1061,
      title: lang === "en" ? "Wedding: Sok & Chenda" : "មង្គលការ សុខ & ចិន្តា",
      templateName: "Khmer Celestial Gold",
      ownerName: "សុខ វិបុល",
      eventDate: "2026-11-24",
      status: "PUBLISHED",
      eventType: "WEDDING",
    },
    {
      id: 1066,
      title: lang === "en" ? "Engagement: Piseth & Kalyan" : "ពិធីភ្ជាប់ពាក្យ ពិសិដ្ឋ & កល្យាណ",
      templateName: "Lotus Blossom Theme",
      ownerName: "ពិសិដ្ឋ រិទ្ធី",
      eventDate: "2026-12-05",
      status: "PUBLISHED",
      eventType: "ENGAGEMENT",
    },
    {
      id: 1062,
      title: lang === "en" ? "Wedding: Dara & Sophy" : "មង្គលការ ដារ៉ា & សុភី",
      templateName: "Royal Gold Elegance",
      ownerName: "ដារ៉ា ចាន់",
      eventDate: "2026-11-18",
      status: "DRAFT",
      eventType: "WEDDING",
    },
    {
      id: 1063,
      title: lang === "en" ? "Wedding: Chanthorn & Theary" : "មង្គលការ ចាន់ថន & ធារី",
      templateName: "Angkor Heritage",
      ownerName: "ចាន់ថន សុភ័ក្ត្រ",
      eventDate: "2026-12-28",
      status: "DRAFT",
      eventType: "WEDDING",
    },
  ];

  const items = Array.isArray(invitations) && invitations.length > 0 ? invitations.slice(0, 4) : fallbackCards;
  const isDemo = !Array.isArray(invitations) || invitations.length === 0;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#121622]/95 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {lang === "en" ? "Recent Invitations" : "ធៀបការថ្មីៗ (Recent Invitations)"}
              </h3>
              {isDemo && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {lang === "en" ? "PREVIEW" : "គំរូបង្ហាញ"}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
              {lang === "en"
                ? `${items.length} recent invitations in system`
                : `${items.length} ធៀបការចុងក្រោយក្នុងប្រព័ន្ធ`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick link to create template */}
          <Link
            to="/templates/new"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-[#1f2738] dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#2a354d] transition-colors cursor-pointer"
            title={lang === "en" ? "Create New Template" : "បង្កើត Template ថ្មី"}
            aria-label="Add"
          >
            <Plus className="h-3.5 w-3.5" />
          </Link>

          {/* Quick link to templates catalog */}
          <Link
            to="/templates"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-[#1f2738] dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#2a354d] transition-colors cursor-pointer"
            title={lang === "en" ? "View All Templates" : "មើលគំរូទាំងអស់"}
            aria-label="Expand"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 2x2 Wedding Invitation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((inv, i) => {
          const isPublished = String(inv.status).toUpperCase() === "PUBLISHED" || inv.published === true;
          const displayTitle =
            inv.title ||
            (inv.groomName && inv.brideName
              ? `${lang === "en" ? "Wedding:" : "មង្គលការ"} ${inv.groomName} & ${inv.brideName}`
              : `Invitation #${inv.id}`);

          return (
            <div
              key={inv.id || i}
              style={{ animationDelay: `${0.26 + i * 0.05}s` }}
              className={`relative flex flex-col justify-between p-3.5 rounded-[18px] border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-zoom-in ${
                isPublished
                  ? "bg-emerald-50/60 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-slate-900 dark:text-zinc-100"
                  : "bg-amber-50/60 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40 text-slate-900 dark:text-zinc-100"
              }`}
            >
              {/* Card Top: ID & Status Badge */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-black/20 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5">
                    #INV-{inv.id}
                  </span>

                  {isPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{lang === "en" ? "Published" : "បានផ្សាយ"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      <Clock className="h-3 w-3" />
                      <span>{lang === "en" ? "Draft" : "កំពុងរៀបចំ"}</span>
                    </span>
                  )}
                </div>

                {/* Wedding Title */}
                <h4 className="text-xs sm:text-[13px] font-extrabold tracking-tight mb-2 truncate text-slate-900 dark:text-white" title={displayTitle}>
                  {displayTitle}
                </h4>

                {/* Meta details list */}
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {/* Template */}
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="truncate">{inv.templateName || inv.templateCode || "Khmer Celestial Theme"}</span>
                  </div>

                  {/* Owner / Host */}
                  {(inv.ownerName || inv.hostName) && (
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{inv.ownerName || inv.hostName}</span>
                    </div>
                  )}

                  {/* Event Date */}
                  {inv.eventDate && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{formatDate(inv.eventDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom: Quick Preview Action */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {inv.eventType ? String(inv.eventType).toUpperCase() : "WEDDING"}
                </span>

                <Link
                  to="/templates"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  <span>{lang === "en" ? "View" : "មើល"}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
