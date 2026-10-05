import { useEffect, useState } from "react";
import { reportsApi } from "../api/reportsApi";

export default function OwnerReportSummary({ invitationId }) {
  const [state, setState] = useState({ loading: true, error: "", guests: null, rsvp: null });
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    let active = true;
    setState({ loading: true, error: "", guests: null, rsvp: null });
    Promise.all([reportsApi.getReport(invitationId, { type: "GUEST" }), reportsApi.getReport(invitationId, { type: "RSVP" })])
      .then(([guests, rsvp]) => { if (active) setState({ loading: false, error: "", guests, rsvp }); })
      .catch((error) => { if (active) setState({ loading: false, error: error.message || "Could not load attendance reports", guests: null, rsvp: null }); });
    return () => { active = false; };
  }, [invitationId]);
  const exportCsv = async (type) => {
    setExporting(true);
    try { await reportsApi.exportCsv(invitationId, type); }
    catch (error) { setState((current) => ({ ...current, error: error.message || "Could not export report" })); }
    finally { setExporting(false); }
  };
  const metrics = [
    { label: "Guests", value: state.guests?.totalGuests },
    { label: "Sent", value: state.guests?.sent },
    { label: "Opened", value: state.guests?.opened },
    { label: "RSVP attending", value: state.rsvp?.yesCount },
    { label: "Attendees", value: state.rsvp?.attendeeTotal },
    { label: "Pending", value: state.rsvp?.pendingCount },
  ];

  return (
    <section className="owner-report-summary" aria-label="Guest delivery and attendance reports">
      <div className="owner-report-heading">
        <div>
          <h2>Guest delivery and attendance reports</h2>
          <p>Guest invitation delivery and RSVP totals for this event.</p>
        </div>
        <div className="owner-report-export-actions reports-screen-only">
          <button type="button" disabled={exporting || state.loading} onClick={() => exportCsv("GUEST")}>
            Export guest report CSV
          </button>
          <button type="button" disabled={exporting || state.loading} onClick={() => exportCsv("RSVP")}>
            Export RSVP report CSV
          </button>
        </div>
      </div>
      {state.loading ? (
        <p className="owner-report-message" role="status">Loading attendance reports…</p>
      ) : state.error ? (
        <p className="owner-report-message is-error" role="alert">{state.error}</p>
      ) : (
        <div className="owner-report-metrics">
          {metrics.map(({ label, value }) => (
            <article className="owner-report-metric" key={label}>
              <span>{label}</span>
              <strong>{value ?? "Unavailable"}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
