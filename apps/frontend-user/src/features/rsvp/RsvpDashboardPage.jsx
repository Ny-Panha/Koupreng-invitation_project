import { Link, useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { useRsvpDashboard } from "./hooks/useRsvpDashboard";
import { RsvpKpiCards } from "./components/RsvpKpiCards";
import { RsvpWishesWall } from "./components/RsvpWishesWall";
import { RsvpGuestTable } from "./components/RsvpGuestTable";
import { ErrorState, SkeletonCard } from "@/shared/ui";
import "./RsvpDashboardPage.css";

export default function RsvpDashboardPage() {
  const { invitationId } = useParams();
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
    load,
  } = useRsvpDashboard(invitationId);

  if (loading) {
    return (
      <main className="dash-main">
        <div className="rsvp-page">
          <SkeletonCard height="100px" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <SkeletonCard height="110px" />
            <SkeletonCard height="110px" />
            <SkeletonCard height="110px" />
            <SkeletonCard height="110px" />
          </div>
          <SkeletonCard height="320px" />
        </div>
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="dash-main">
        <div className="rsvp-page">
          <ErrorState message={error} onRetry={load} />
        </div>
      </main>
    );
  }

  const backLink = invitationId
    ? `/dashboard/invitations/${invitationId}/guests`
    : "/dashboard/guests";

  return (
    <main className="dash-main">
      <div className="rsvp-page">
        <header className="rsvp-header">
          <div className="rsvp-header-info">
            <span className="rsvp-kicker">Attendance & RSVP Management</span>
            <h1>គ្រប់គ្រងការឆ្លើយតប (RSVPs)</h1>
            <p className="rsvp-subtitle">{invitation?.title || "ព័ត៌មានភ្ញៀវចូលរួម និងសារជូនពរ"}</p>
          </div>
          <div className="rsvp-actions">
            <Link to={backLink} className="rsvp-back-btn">
              <IoArrowBackOutline aria-hidden="true" />
              <span>ត្រឡប់ទៅវិញ / Back</span>
            </Link>
          </div>
        </header>

        {error && <ErrorState message={error} />}

        {/* Summary KPI Cards */}
        <RsvpKpiCards
          attendingCount={attendingCount}
          declinedCount={declinedCount}
          pendingCount={pendingCount}
          wishesCount={wishesList.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Conditional: Wishes Wall View or Standard Table */}
        {viewMode === "WISHES" ? (
          <RsvpWishesWall wishesList={wishesList} setViewMode={setViewMode} />
        ) : (
          <RsvpGuestTable
            invitationId={invitationId}
            onSaved={load}
            filteredRsvps={filteredRsvps}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            wishesListCount={wishesList.length}
            setViewMode={setViewMode}
          />
        )}
      </div>
    </main>
  );
}
