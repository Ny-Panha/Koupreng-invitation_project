import { useEffect, useState } from "react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { reportsApi } from "../api/reportsApi";

export default function OwnerReportSummary({ invitationId }) {
  const { text: t } = useBackendMessages("reports");
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
    { label: t("guests"), value: state.guests?.totalGuests },
    { label: t("sent"), value: state.guests?.sent },
    { label: t("opened"), value: state.guests?.opened },
    { label: t("yes"), value: state.rsvp?.yesCount },
    { label: t("attendeeTotal"), value: state.rsvp?.attendeeTotal },
    { label: t("pending"), value: state.rsvp?.pendingCount },
  ];

  return (
    <section className="owner-report-summary" aria-label={t("attendanceTitle")}>
      <div className="owner-report-heading">
        <div>
          <h2>{t("attendanceTitle")}</h2>
          <p>{t("attendanceText")}</p>
        </div>
        <div className="owner-report-export-actions reports-screen-only">
          <button type="button" disabled={exporting || state.loading} onClick={() => exportCsv("GUEST")}>
            {t("guestCsv")}
          </button>
          <button type="button" disabled={exporting || state.loading} onClick={() => exportCsv("RSVP")}>
            {t("rsvpCsv")}
          </button>
        </div>
      </div>
      {state.loading ? (
        <p className="owner-report-message" role="status">{t("loading")}</p>
      ) : state.error ? (
        <p className="owner-report-message is-error" role="alert">{state.error}</p>
      ) : (
        <div className="owner-report-metrics">
          {metrics.map(({ label, value }) => (
            <article className="owner-report-metric" key={label}>
              <span>{label}</span>
              <strong>{value ?? t("unavailable")}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
