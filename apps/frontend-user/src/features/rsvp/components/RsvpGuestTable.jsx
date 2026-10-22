import { EmptyState, SearchInput, StatusBadge } from "@/shared/ui";
import { Users } from "lucide-react";
import RsvpOwnerActions from "./RsvpOwnerActions";

export function RsvpGuestTable({ filteredRsvps = [], search = "", setSearch, statusFilter = "ALL", setStatusFilter, invitationId, onSaved, t, lang }) {
  const filtered = Boolean(search.trim() || statusFilter !== "ALL");
  const labels = ["guest", "status", "party", "date", "message", "actions"];
  const clear = () => { setSearch(""); setStatusFilter("ALL"); };
  return <section className="rsvp-board">
    <div className="rsvp-toolbar">
      <div className="rsvp-search-wrapper"><SearchInput value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch("")} placeholder={t("search")} ariaLabel={t("searchLabel")} clearLabel={t("clear")} /></div>
      <select className="rsvp-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label={t("filter")}>
        <option value="ALL">{t("all")}</option><option value="ATTENDING">{t("attending")}</option><option value="NOT_ATTENDING">{t("declined")}</option><option value="MAYBE">{t("maybe")}</option><option value="PENDING">{t("pending")}</option>
      </select>
    </div>
    {!filteredRsvps.length ? <EmptyState icon={Users} title={t(filtered ? "noMatches" : "emptyTitle")} description={t(filtered ? "noMatchesText" : "emptyText")} actionLabel={filtered ? t("clear") : undefined} onAction={filtered ? clear : undefined} /> :
      <div className="rsvp-table-wrapper"><table className="rsvp-table" role="table">
        <thead><tr>{labels.filter(key => key !== "actions" || invitationId).map(key => <th key={key} scope="col">{t(key)}</th>)}</tr></thead>
        <tbody>{filteredRsvps.map((rsvp, index) => {
          const name = rsvp.guestName || rsvp.name || t("unnamed");
          const status = String(rsvp.responseStatus || rsvp.status || "PENDING").toUpperCase();
          const statusKey = { ATTENDING: "attending", ACCEPTED: "attending", NOT_ATTENDING: "declined", DECLINED: "declined", MAYBE: "maybe" }[status] || "pending";
          const date = new Date(rsvp.respondedAt || rsvp.updatedAt || rsvp.createdAt);
          return <tr key={rsvp.id ?? rsvp.guestId ?? index}>
            <td data-label={t("guest")}><div className="rsvp-guest-cell"><span className="rsvp-guest-avatar" aria-hidden="true">{name.trim().charAt(0)}</span><div><div className="rsvp-guest-name">{name}</div>{rsvp.phone && <div className="rsvp-guest-phone">{rsvp.phone}</div>}</div></div></td>
            <td data-label={t("status")}><StatusBadge status={status} label={t(statusKey)} /></td>
            <td data-label={t("party")}><span className="rsvp-party-badge"><Users size={16} aria-hidden="true" />{rsvp.pendingInvitation ? `${rsvp.invitedSeats || 1} ${t('invitedSeats')}` : `${rsvp.attendeeCount ?? rsvp.partySize ?? 0} ${t("people")}`}</span></td>
            <td data-label={t("date")}><span className="rsvp-date-cell">{Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "km-KH", { dateStyle: "medium", timeStyle: "short" }).format(date)}</span></td>
            <td data-label={t("message")}><div className="rsvp-wish-text">{rsvp.wish || rsvp.message || "—"}</div></td>
            {invitationId && <td data-label={t("actions")}>{rsvp.pendingInvitation ? <span className="workspace-muted">{t('awaitingResponse')}</span> : <RsvpOwnerActions invitationId={invitationId} record={rsvp} onSaved={onSaved} text={t} />}</td>}
          </tr>;
        })}</tbody>
      </table></div>}
  </section>;
}

export default RsvpGuestTable;
