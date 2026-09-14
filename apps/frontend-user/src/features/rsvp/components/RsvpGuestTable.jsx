import { EmptyState, SearchInput, StatusBadge } from "@/shared/ui";
import { IoPeopleOutline } from "react-icons/io5";

export function RsvpGuestTable({
  filteredRsvps = [],
  search = "",
  setSearch,
  statusFilter = "ALL",
  setStatusFilter,
  wishesListCount = 0,
  setViewMode,
}) {
  return (
    <section className="rsvp-board">
      <div className="rsvp-toolbar">
        <div className="rsvp-search-wrapper">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="ស្វែងរកតាមឈ្មោះ ឬពាក្យជូនពរ..."
            ariaLabel="ស្វែងរក RSVP"
          />
        </div>

        <div className="rsvp-filter-group">
          <select
            className="rsvp-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">គ្រប់ស្ថានភាព / All Status</option>
            <option value="ATTENDING">ចូលរួម (Attending)</option>
            <option value="DECLINED">អវត្តមាន (Declined)</option>
            <option value="PENDING">រង់ចាំ (Pending)</option>
          </select>

          {wishesListCount > 0 && (
            <button
              type="button"
              className="rsvp-toggle-wishes-btn"
              onClick={() => setViewMode("WISHES")}
            >
              💌 មើលផ្ទាំងជូនពរ / Wishes ({wishesListCount})
            </button>
          )}
        </div>
      </div>

      {filteredRsvps.length === 0 ? (
        <div className="rsvp-empty-box">
          <EmptyState
            title="មិនមានទិន្នន័យ RSVP ទេ"
            description="មិនទាន់មានការឆ្លើយតបដែលត្រូវគ្នានឹងការស្វែងរក ឬតម្រងនេះនៅឡើយទេ។"
          />
        </div>
      ) : (
        <div className="rsvp-table-wrapper">
          <table className="rsvp-table">
            <thead>
              <tr>
                <th>ឈ្មោះភ្ញៀវ / Guest</th>
                <th>ស្ថានភាព / Status</th>
                <th>ចំនួនមនុស្ស / Party</th>
                <th>កាលបរិច្ឆេទ / Date</th>
                <th>សារជូនពរ / Wishes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRsvps.map((rsvp) => {
                const guestName = rsvp.guestName || rsvp.name || "ភ្ញៀវកិត្តិយស";
                const initial = guestName.trim().charAt(0).toUpperCase();
                const wishText = rsvp.wish || rsvp.message;
                const partySize = rsvp.attendeeCount || rsvp.partySize || 1;
                const dateVal = rsvp.updatedAt || rsvp.createdAt;

                return (
                  <tr key={rsvp.id || rsvp.guestId || Math.random()}>
                    <td>
                      <div className="rsvp-guest-cell">
                        <div className="rsvp-guest-avatar" aria-hidden="true">
                          {initial}
                        </div>
                        <div>
                          <div className="rsvp-guest-name">{guestName}</div>
                          {rsvp.phone && (
                            <div className="rsvp-guest-phone">{rsvp.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={(rsvp.responseStatus || rsvp.status || "PENDING").toUpperCase()} />
                    </td>
                    <td>
                      <span className="rsvp-party-badge">
                        <IoPeopleOutline aria-hidden="true" />
                        <span>{partySize} នាក់</span>
                      </span>
                    </td>
                    <td>
                      <span className="rsvp-date-cell">
                        {dateVal
                          ? new Intl.DateTimeFormat("km-KH", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(dateVal))
                          : "—"}
                      </span>
                    </td>
                    <td style={{ maxWidth: "280px" }}>
                      {wishText ? (
                        <div className="rsvp-wish-text" title={wishText}>
                          {wishText}
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RsvpGuestTable;
