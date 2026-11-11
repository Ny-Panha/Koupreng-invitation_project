import { RefreshStatus } from '../../shared/ui/AdminSkeleton';
import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Shield, User, Calendar, Clock, Sparkles } from "lucide-react";
import { Loading, ErrorState, Empty, StatusBadge, AdminPageHeader } from "../../shared/ui";
import { useResource } from "../../shared/hooks";
import { formatDate } from "../../shared/utils";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

export default function AdminUserDetailPage() {
  const { lang, t } = useAdminLanguage();
  const { userId } = useParams();
  const load = useCallback(async () => {
    const [user, invitations] = await Promise.all([
      adminManagementService.user(userId),
      adminManagementService.userInvitations(userId),
    ]);
    return { user, invitations };
  }, [userId]);
  const { data, loading, refreshing, error, reload } = useResource(load);

  if (loading) return <Loading />;
  if (!data) return <ErrorState onRetry={reload} />;

  const { user, invitations } = data;
  const isEn = lang === "en";
  const userInitials = (user.fullName || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <RefreshStatus active={refreshing} error={Boolean(error && data)} onRetry={reload} />

      <AdminPageHeader
        eyebrow={isEn ? "USER PROFILE" : "ព័ត៌មានគណនីអ្នកប្រើប្រាស់"}
        title={user.fullName || user.email || (isEn ? `User #${user.id}` : `អ្នកប្រើប្រាស់ #${user.id}`)}
        subtitle={t("users.detailSubtitle", "ព័ត៌មានលម្អិតអ្នកប្រើប្រាស់ និងបញ្ជីសំបុត្រអញ្ជើញ")}
        actions={
          <Link to="/users" className="btn btn-ghost inline-flex items-center gap-1.5 text-xs font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("users.back", "ត្រឡប់ក្រោយ")}</span>
          </Link>
        }
      />

      {/* User Identity & Info Card */}
      <section className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xs dark:border-zinc-800 dark:bg-[#111114]/90 backdrop-blur-md transition-all duration-300">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-lg shadow-inner">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  {user.fullName || (isEn ? "No name specified" : "មិនបានបញ្ជាក់ឈ្មោះ")}
                </div>
                <StatusBadge status={user.status} />
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                  <Shield className="h-3 w-3" />
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>ID: #{user.id}</span>
                <span>•</span>
                <span>{invitations?.length || 0} {isEn ? "invitations owned" : "សំបុត្រអញ្ជើញជាម្ចាស់"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          <DetailCard icon={Mail} label={t("users.colEmail", "អ៊ីមែល")} value={user.email} />
          <DetailCard icon={Phone} label={t("users.colPhone", "លេខទូរស័ព្ទ")} value={user.phone} />
          <DetailCard icon={Shield} label={t("users.colRole", "តួនាទី")} value={user.role} />
          <DetailCard icon={User} label={t("users.colStatus", "ស្ថានភាព")} value={user.status} />
          <DetailCard icon={Calendar} label={t("users.colCreated", "កាលបរិច្ឆេទបង្កើត")} value={formatDate(user.createdAt)} />
          <DetailCard icon={Clock} label={t("users.colUpdated", "កាលបរិច្ឆេទកែប្រែ")} value={formatDate(user.updatedAt)} />
        </div>
      </section>

      {/* Owned Invitations Section */}
      <section className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xs dark:border-zinc-800 dark:bg-[#111114]/90 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              {t("users.invitationsTitle", "បញ្ជីសំបុត្រអញ្ជើញ")}
            </h3>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {invitations?.length || 0} {isEn ? "Total records" : "កំណត់ត្រាសរុប"}
          </span>
        </div>

        {!invitations?.length ? (
          <Empty label={t("users.noInvitations", "មិនមានសំបុត្រអញ្ជើញទេ")} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/80">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-zinc-400">{t("invitations.colId", "ID")}</th>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-zinc-400">{t("invitations.colTitle", "Title")}</th>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-zinc-400">{t("invitations.colStatus", "Status")}</th>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-zinc-400">{t("invitations.colEvent", "Event date")}</th>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-zinc-400">{t("invitations.colModeration", "Moderation")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-zinc-300">
                      #{invitation.id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {invitation.title || invitation.slug || (isEn ? "Untitled Invitation" : "សំបុត្រអញ្ជើញគ្មានចំណងជើង")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={invitation.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-zinc-400">
                      {formatDate(invitation.eventDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={invitation.moderationStatus || "ACTIVE"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/40">
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <strong className="block text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 truncate">{value || "—"}</strong>
      </div>
    </div>
  );
}

