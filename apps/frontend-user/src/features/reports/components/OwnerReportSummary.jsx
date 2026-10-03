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
  return <section className="budget-panel reports-screen-only" aria-label="Server attendance reports">
    <h2>Guest delivery and attendance reports</h2>
    {state.loading ? <p role="status">Loading attendance reports…</p> : state.error ? <p role="alert">{state.error}</p> : <p>
      Guests: {state.guests?.totalGuests ?? "Unavailable"} · Sent: {state.guests?.sent ?? "Unavailable"} · Opened: {state.guests?.opened ?? "Unavailable"} ·
      RSVP attending: {state.rsvp?.yesCount ?? "Unavailable"} · Attendees: {state.rsvp?.attendeeTotal ?? "Unavailable"} · Pending: {state.rsvp?.pendingCount ?? "Unavailable"}
    </p>}
    <button type="button" className="dash-btn" disabled={exporting || state.loading} onClick={() => exportCsv("GUEST")}>Export guest report CSV</button>
    <button type="button" className="dash-btn" disabled={exporting || state.loading} onClick={() => exportCsv("RSVP")}>Export RSVP report CSV</button>
  </section>;
}
