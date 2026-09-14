import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deliveryService } from "@/features/invitations/api/deliveryApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { toast } from "../../shared/ui/toast";
import "./InvitationPages.css";

function StatCard({ label, value }) {
  return (
    <article className="guest-stat">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </article>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function InvitationDeliveryManager() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [emailForm, setEmailForm] = useState({
    subject: "Wedding Invitation",
    message: "Please open your wedding invitation link.",
  });

  const loadData = useCallback(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      invitationService.get(id),
      deliveryService.summary(id),
      deliveryService.events(id),
    ])
      .then(([invitationData, summaryData, eventData]) => {
        if (!active) return;
        setInvitation(invitationData);
        setSummary(summaryData);
        setEvents(eventData || []);
        setError("");
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load delivery data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => loadData(), [loadData]);

  const prepareDelivery = async () => {
    setSaving(true);
    setError("");
    try {
      const result = await deliveryService.prepare(id);
      setSummary(result);
      toast("Delivery prepared");
      const eventData = await deliveryService.events(id);
      setEvents(eventData || []);
    } catch (err) {
      setError(err.message || "Could not prepare delivery");
    } finally {
      setSaving(false);
    }
  };

  const copyText = async (text, successMessage) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast(successMessage);
    } catch (copyError) {
      setError(copyError.message || "Could not copy text");
    }
  };

  const copyShareMessage = async (guestId) => {
    setSaving(true);
    setError("");
    try {
      const result = await deliveryService.shareMessage(id, guestId);
      await copyText(result.message, "Share message copied");
    } catch (err) {
      setError(err.message || "Could not get share message");
    } finally {
      setSaving(false);
    }
  };

  const markShared = async (guestId) => {
    setSaving(true);
    setError("");
    try {
      await deliveryService.markShared(id, guestId);
      toast("Guest marked as shared");
      loadData();
    } catch (err) {
      setError(err.message || "Could not mark guest as shared");
    } finally {
      setSaving(false);
    }
  };

  const sendEmail = async () => {
    setSaving(true);
    setError("");
    try {
      await deliveryService.sendEmail(id, {
        allEligible: true,
        subject: emailForm.subject,
        message: emailForm.message,
      });
      toast("Email delivery finished");
      loadData();
    } catch (err) {
      setError(err.message || "Could not send email invitations");
    } finally {
      setSaving(false);
    }
  };

  const sendReminders = async () => {
    setSaving(true);
    setError("");
    try {
      await deliveryService.sendReminders(id, {
        allEligible: true,
        subject: "Invitation Reminder",
        message: "Reminder: please open your invitation and submit RSVP.",
      });
      toast("Reminder delivery finished");
      loadData();
    } catch (err) {
      setError(err.message || "Could not send reminders");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="inv-page">
        <div className="inv-loading">Loading delivery...</div>
      </div>
    );
  }

  const guests = summary?.guests || [];
  const isPublished = invitation?.status === "PUBLISHED";

  return (
    <div className="inv-page">
      <header className="inv-page-header">
        <div>
          <span className="inv-eyebrow">Delivery management</span>
          <h1>{invitation?.title || "Invitation delivery"}</h1>
          <p>
            Prepare guest links, copy share messages, send email invitations,
            and track delivery events.
          </p>
        </div>
        <div className="inv-card-actions">
          <button
            className="inv-secondary-btn"
            type="button"
            onClick={() => navigate(`/dashboard/invitations/${id}/guests`)}
          >
            Guests
          </button>
          <button
            className="inv-secondary-btn"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            Back
          </button>
        </div>
      </header>

      {!isPublished && (
        <div className="inv-error">
          Invitation must be published before delivery can be prepared.
        </div>
      )}

      {error && <div className="inv-error">{error}</div>}

      <section className="delivery-actions">
        <button
          className="inv-primary-btn"
          type="button"
          onClick={prepareDelivery}
          disabled={saving || !isPublished}
        >
          {saving ? "Working..." : "Prepare delivery"}
        </button>
        <button
          className="inv-secondary-btn"
          type="button"
          onClick={sendReminders}
          disabled={saving || !isPublished}
        >
          Send reminders
        </button>
      </section>

      <div className="guest-stats delivery-stats">
        <StatCard label="Total" value={summary?.totalGuests} />
        <StatCard label="Ready" value={summary?.ready} />
        <StatCard label="Not ready" value={summary?.notReady} />
        <StatCard label="Link generated" value={summary?.linkGenerated} />
        <StatCard label="Sent" value={summary?.sent} />
        <StatCard label="Failed" value={summary?.failed} />
        <StatCard label="Opened" value={summary?.opened} />
        <StatCard label="Responded" value={summary?.responded} />
      </div>

      <section className="delivery-email-box">
        <h2>Email invitation</h2>
        <label>
          Subject
          <input
            value={emailForm.subject}
            onChange={(event) =>
              setEmailForm((current) => ({
                ...current,
                subject: event.target.value,
              }))
            }
            placeholder="Email subject"
          />
        </label>
        <label>
          Message
          <textarea
            rows="4"
            value={emailForm.message}
            onChange={(event) =>
              setEmailForm((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            placeholder="Email message"
          />
        </label>
        <button
          className="inv-primary-btn"
          type="button"
          onClick={sendEmail}
          disabled={saving || !isPublished}
        >
          Send email to eligible guests
        </button>
      </section>

      <section className="delivery-table-panel">
        <h2>Guest delivery</h2>
        <div className="guest-table-wrap">
          <table className="guest-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Invitation URL</th>
                <th>Last sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.guestId || guest.id}>
                  <td>
                    <strong>{guest.guestName}</strong>
                    <div>{guest.responded ? "Responded" : "No RSVP yet"}</div>
                  </td>
                  <td>
                    <span>{guest.phone || "No phone"}</span>
                    {guest.email ? <small>{guest.email}</small> : null}
                  </td>
                  <td>
                    <div
                      className={`delivery-status ${guest.sendStatus?.toLowerCase() || "not_ready"}`}
                    >
                      {guest.sendStatus || "NOT_READY"}
                    </div>
                    {guest.lastSendError && (
                      <div className="delivery-error-text">
                        {guest.lastSendError}
                      </div>
                    )}
                  </td>
                  <td>
                    {guest.invitationUrl ? (
                      <button
                        type="button"
                        className="inv-secondary-btn"
                        onClick={() =>
                          copyText(
                            guest.invitationUrl,
                            "Invitation link copied",
                          )
                        }
                      >
                        Copy link
                      </button>
                    ) : (
                      "Not generated"
                    )}
                  </td>
                  <td>
                    <div>{formatDate(guest.lastSentAt)}</div>
                    <small>Reminder: {formatDate(guest.lastReminderAt)}</small>
                  </td>
                  <td>
                    <div className="guest-row-actions">
                      <button
                        type="button"
                        onClick={() => copyShareMessage(guest.guestId)}
                      >
                        Copy message
                      </button>
                      <button
                        type="button"
                        className="inv-secondary-btn"
                        onClick={() => markShared(guest.guestId)}
                        disabled={!guest.invitationUrl || saving}
                      >
                        Mark shared
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {guests.length === 0 && (
            <div className="inv-empty compact">
              No delivery guests found. Add guests first.
            </div>
          )}
        </div>
      </section>

      <section className="delivery-events">
        <h2>Audit trail</h2>
        {events.length === 0 ? (
          <div className="inv-empty compact">No delivery events yet.</div>
        ) : (
          events.map((event) => (
            <div className="delivery-event-card" key={event.id}>
              <strong>{event.eventType}</strong>
              <span>{event.guestName || "Invitation"}</span>
              <small>
                {event.channel || "—"} · {event.status || "—"} ·{" "}
                {formatDate(event.createdAt)}
              </small>
              {event.errorMessage && <p>{event.errorMessage}</p>}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
