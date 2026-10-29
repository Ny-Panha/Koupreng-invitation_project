import { PageSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { Link, useParams } from "react-router-dom";
import { Users } from "lucide-react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { useRsvpDashboard } from "./hooks/useRsvpDashboard";
import { RsvpKpiCards } from "./components/RsvpKpiCards";
import { RsvpWishesWall } from "./components/RsvpWishesWall";
import { RsvpGuestTable } from "./components/RsvpGuestTable";
import { ErrorState } from "@/shared/ui";
import "./RsvpDashboardPage.css";

export default function RsvpDashboardPage() {
  const { eventId, invitationId = eventId } = useParams();
  const { text: t, lang } = useBackendMessages("rsvp");
  const {
    invitation,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    viewMode,
    setViewMode,
    loading,
    error,
    filteredRsvps,
    wishesList,
    attendingCount,
    declinedCount,
    pendingCount,
    attendeeCount,
    load,
  } = useRsvpDashboard(invitationId);

  if (loading && !invitation) return <PageSkeleton layout="dashboard" />;

  if (error && !invitation) {
    return (
      <main className="dash-main" aria-busy={loading}>
        {loading && invitation && <LoadingRegion />}
        <div className="rsvp-page">
          <ErrorState message={t("loadError")} onRetry={load} />
        </div>
      </main>
    );
  }

  const backLink = invitationId
    ? `/app/events/${invitationId}/guests`
    : "/app/events";

  return (
    <main className="dash-main" aria-busy={loading}>
        {loading && invitation && <LoadingRegion />}
      <div className="rsvp-page">
        <header className="rsvp-header">
          <div className="rsvp-header-info">
            <span className="rsvp-kicker">{t("kicker")}</span>
            <h1>{t("title")}</h1>
            <p className="rsvp-subtitle">{invitation?.title}</p>
          </div>
          <div className="rsvp-actions">
            <Link to={backLink} className="rsvp-back-btn">
              <Users size={18} aria-hidden="true" />
              <span>{t("guests")}</span>
            </Link>
          </div>
        </header>

        {error && <ErrorState message={t("loadError")} onRetry={load} />}

        {/* Summary KPI Cards */}
        <RsvpKpiCards
          attendingCount={attendingCount}
          declinedCount={declinedCount}
          pendingCount={pendingCount}
          wishesCount={wishesList.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          t={t}
        />
        <p className="rsvp-count-context">{t('countContext', { count: attendeeCount })}</p>

        {/* Conditional: Wishes Wall View or Standard Table */}
        {viewMode === "WISHES" ? (
          <RsvpWishesWall wishesList={wishesList} setViewMode={setViewMode} t={t} lang={lang} />
        ) : (
          <RsvpGuestTable
            invitationId={invitationId}
            onSaved={() => load({ background: true })}
            filteredRsvps={filteredRsvps}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            wishesListCount={wishesList.length}
            setViewMode={setViewMode}
            t={t}
            lang={lang}
          />
        )}
      </div>
    </main>
  );
}
