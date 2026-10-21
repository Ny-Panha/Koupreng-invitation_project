import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoCopyOutline,
  IoInformationCircleOutline,
  IoMailOutline,
  IoPaperPlaneOutline,
  IoPeopleOutline,
  IoRefreshOutline,
  IoShareSocialOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { deliveryService } from "@/features/invitations/api/deliveryApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { ResponsiveTable, StatusBadge, toast } from "@/shared/ui";
import "./InvitationPages.css";

function DeliveryMetricCard({ label, kmLabel, value, icon: Icon, variant = "default" }) {
  const isKm = useLanguageStore((state) => state.lang) === "km";
  return (
    <article className={`delivery-metric-card metric-${variant}`}>
      <div className="metric-header">
        <span className="metric-label">{isKm && kmLabel ? kmLabel : label}</span>
        {Icon && <Icon className="metric-icon" aria-hidden="true" />}
      </div>
      <strong className="metric-value">{value ?? 0}</strong>
    </article>
  );
}

function formatDate(value, isKm = false) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(isKm ? "km-KH" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

export default function InvitationDeliveryManager() {
  const { eventId, id = eventId } = useParams();
  const navigate = useNavigate();
  const lang = useLanguageStore((state) => state.lang);
  const isKm = lang === "km";

  const [invitation, setInvitation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [emailForm, setEmailForm] = useState({
    subject: isKm ? "លិខិតអញ្ជើញអាពាហ៍ពិពាហ៍" : "Wedding Invitation",
    message: isKm
      ? "សូមគោរពអញ្ជើញលោកអ្នកចូលរួមពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ ដោយបើកមើលធៀបការតាមរយៈតំណភ្ជាប់ខាងក្រោម។"
      : "Please open your wedding invitation link.",
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
        if (active) setError(err.message || (isKm ? "មិនអាចទាញយកទិន្នន័យការផ្ញើធៀបបានទេ" : "Could not load delivery data"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isKm]);

  useEffect(() => loadData(), [loadData]);

  const prepareDelivery = async () => {
    setSaving(true);
    setError("");
    try {
      const result = await deliveryService.prepare(id);
      setSummary(result);
      toast(isKm ? "បានរៀបចំតំណភ្ជាប់ភ្ញៀវរួចរាល់" : "Delivery prepared");
      const eventData = await deliveryService.events(id);
      setEvents(eventData || []);
    } catch (err) {
      setError(err.message || (isKm ? "មិនអាចរៀបចំការផ្ញើបានទេ" : "Could not prepare delivery"));
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
      setError(copyError.message || (isKm ? "មិនអាចចម្លងអត្ថបទបានទេ" : "Could not copy text"));
    }
  };

  const copyShareMessage = async (guestId) => {
    setSaving(true);
    setError("");
    try {
      const result = await deliveryService.shareMessage(id, guestId);
      await copyText(result.message, isKm ? "បានចម្លងសារអញ្ជើញសម្រាប់ផ្ញើ" : "Share message copied");
    } catch (err) {
      setError(err.message || (isKm ? "មិនអាចទាញយកសារអញ្ជើញបានទេ" : "Could not get share message"));
    } finally {
      setSaving(false);
    }
  };

  const markShared = async (guestId) => {
    setSaving(true);
    setError("");
    try {
      await deliveryService.markShared(id, guestId);
      toast(isKm ? "បានសម្គាល់ថាបានផ្ញើរួចរាល់" : "Guest marked as shared");
      loadData();
    } catch (err) {
      setError(err.message || (isKm ? "មិនអាចកត់ត្រាការផ្ញើបានទេ" : "Could not mark guest as shared"));
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
      toast(isKm ? "បានផ្ញើអ៊ីមែលអញ្ជើញជោគជ័យ" : "Email delivery finished");
      loadData();
    } catch (err) {
      setError(err.message || (isKm ? "មិនអាចផ្ញើអ៊ីមែលបានទេ" : "Could not send email invitations"));
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
        subject: isKm ? "សាររំលឹកធៀបការ" : "Invitation Reminder",
        message: isKm
          ? "សូមរំលឹកលោកអ្នកមេត្តាបើកមើលធៀបការ និងឆ្លើយតប RSVP ជូនយើងខ្ញុំ។"
          : "Reminder: please open your invitation and submit RSVP.",
      });
      toast(isKm ? "បានផ្ញើសាររំលឹកជោគជ័យ" : "Reminder delivery finished");
      loadData();
    } catch (err) {
      setError(err.message || (isKm ? "មិនអាចផ្ញើសាររំលឹកបានទេ" : "Could not send reminders"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="inv-page">
        <div className="inv-loading">
          <IoRefreshOutline className="animate-spin text-2xl mb-2 text-[#0F766E]" />
          <span>{isKm ? "កំពុងទាញយកទិន្នន័យការផ្ញើ..." : "Loading delivery..."}</span>
        </div>
      </div>
    );
  }

  const guests = summary?.guests || [];
  const isPublished = invitation?.status === "PUBLISHED";

  const filteredGuests = searchTerm.trim()
    ? guests.filter((g) =>
        (g.guestName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.phone || "").includes(searchTerm) ||
        (g.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : guests;

  return (
    <div className="inv-page delivery-page-container">
      {/* Page Header */}
      <header className="inv-page-header delivery-header">
        <div>
          <span className="inv-eyebrow">
            {isKm ? "រៀបចំ & តាមដានការផ្ញើធៀប" : "Delivery & Reminders"}
          </span>
          <h1>{invitation?.title || (isKm ? "ការផ្ញើធៀបការ" : "Invitation delivery")}</h1>
          <p>
            {isKm
              ? "បង្កើតតំណភ្ជាប់ផ្ទាល់ខ្លួន ផ្ញើសារអញ្ជើញតាម Telegram/Messenger ផ្ញើអ៊ីមែល និងតាមដានស្ថានភាពបើកមើល។"
              : "Prepare guest links, copy share messages, send email invitations, and track delivery events."}
          </p>
        </div>
        <div className="inv-card-actions">
          <button
            className="inv-secondary-btn"
            type="button"
            onClick={() => navigate(`/app/events/${id}/guests`)}
          >
            <IoPeopleOutline aria-hidden="true" />
            <span>{isKm ? "បញ្ជីភ្ញៀវ" : "Guests"}</span>
          </button>
          <button
            className="inv-secondary-btn"
            type="button"
            onClick={() => navigate(`/app/events/${id}`)}
          >
            <IoArrowBackOutline aria-hidden="true" />
            <span>{isKm ? "ត្រឡប់" : "Back"}</span>
          </button>
        </div>
      </header>

      {/* Unpublished Notice */}
      {!isPublished && (
        <div className="delivery-unpublished-banner" role="alert">
          <div className="banner-content">
            <IoAlertCircleOutline className="banner-icon" aria-hidden="true" />
            <div>
              <h3>{isKm ? "ធៀបការមិនទាន់បានបោះផ្សាយនៅឡើយទេ" : "Invitation Not Yet Published"}</h3>
              <p>
                {isKm
                  ? "លោកអ្នកត្រូវតែបោះផ្សាយធៀបការជាមុនសិន ទើបប្រព័ន្ធអាចបង្កើតតំណភ្ជាប់អញ្ជើញ និងផ្ញើសារទៅកាន់ភ្ញៀវបាន។"
                  : "Invitation must be published before delivery can be prepared."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inv-primary-btn banner-action-btn"
            onClick={() => navigate(`/app/events/${id}/invitation`)}
          >
            {isKm ? "ទៅផ្សព្វផ្សាយធៀប" : "Publish Invitation"}
          </button>
        </div>
      )}

      {error && (
        <div className="inv-error" role="alert">
          <IoAlertCircleOutline aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* WORKFLOW STAGE 1: PREPARE LINKS */}
      <section className="delivery-workflow-card stage-prepare">
        <div className="card-badge-header">
          <span className="stage-number">1</span>
          <div>
            <h2>{isKm ? "រៀបចំតំណភ្ជាប់ភ្ញៀវ" : "Prepare Guest Links"}</h2>
            <p>
              {isKm
                ? "បង្កើតលេខកូដ និងតំណភ្ជាប់ធៀបការផ្ទាល់ខ្លួនសម្រាប់ភ្ញៀវទាំងអស់នៅក្នុងបញ្ជី។"
                : "Generate personalized invitation tokens and links for all confirmed guests."}
            </p>
          </div>
        </div>

        <div className="stage-body">
          <div className="delivery-stats">
            <DeliveryMetricCard
              label="Total Guests"
              kmLabel="ភ្ញៀវសរុប"
              value={summary?.totalGuests}
              icon={IoPeopleOutline}
            />
            <DeliveryMetricCard
              label="Links Ready"
              kmLabel="តំណភ្ជាប់រួចរាល់"
              value={summary?.ready ?? summary?.linkGenerated}
              icon={IoCheckmarkCircleOutline}
              variant="success"
            />
            <DeliveryMetricCard
              label="Not Ready"
              kmLabel="មិនទាន់រួចរាល់"
              value={summary?.notReady}
              icon={IoTimeOutline}
              variant="warning"
            />
          </div>

          <div className="stage-actions">
            <button
              className="inv-primary-btn"
              type="button"
              onClick={prepareDelivery}
              disabled={saving || !isPublished}
            >
              <IoRefreshOutline className={saving ? "animate-spin" : ""} aria-hidden="true" />
              <span>
                {saving
                  ? isKm ? "កំពុងរៀបចំ..." : "Working..."
                  : isKm ? "បង្កើតតំណភ្ជាប់ភ្ញៀវ" : "Prepare delivery"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* WORKFLOW STAGE 2: SEND & SHARE */}
      <details className="delivery-workflow-card stage-send" open={isPublished}>
        <summary className="card-badge-header">
          <span className="stage-number">2</span>
          <div>
            <h2>{isKm ? "ផ្ញើការអញ្ជើញ & រំលឹក" : "Send Invitations & Reminders"}</h2>
            <p>
              {isKm
                ? "ផ្ញើសារអញ្ជើញផ្ទាល់ខ្លួនតាមបណ្តាញសង្គម ឬផ្ញើអ៊ីមែលជាកញ្ចប់ទៅកាន់ភ្ញៀវទាំងអស់។"
                : "Share via Messenger/Telegram, or send batch email invitations and reminders."}
            </p>
          </div>
        </summary>

        <div className="send-channels-grid">
          {/* Channel A: Messenger / Telegram 1-Click Share */}
          <div className="delivery-channel-box">
            <div className="channel-box-title">
              <IoShareSocialOutline className="text-xl text-[#0F766E]" aria-hidden="true" />
              <h3>{isKm ? "ផ្ញើតាម Telegram / Messenger / SMS" : "Share via Chat / Social"}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isKm
                ? "ជ្រើសរើសភ្ញៀវក្នុងតារាងខាងក្រោម រួចចុច 'ចម្លងសារ' ដើម្បីទទួលបានសារអញ្ជើញជាភាសាខ្មែរភ្ជាប់ជាមួយឈ្មោះភ្ញៀវ និងតំណភ្ជាប់ផ្ទាល់ខ្លួន សម្រាប់ផ្ញើតាម Telegram ឬ Messenger។"
                : "Use the guest list below to copy personalized invite messages with 1 click, then paste them directly into your chats."}
            </p>
            <div className="channel-hint-pill">
              <IoInformationCircleOutline aria-hidden="true" />
              <span>{isKm ? "មានឈ្មោះភ្ញៀវ និងតំណភ្ជាប់ស្វ័យប្រវត្តិ" : "Includes personalized guest token link"}</span>
            </div>
          </div>

          {/* Channel B: Batch Email Dispatch */}
          <div className="delivery-channel-box">
            <div className="channel-box-title">
              <IoMailOutline className="text-xl text-[#0F766E]" aria-hidden="true" />
              <h3>{isKm ? "ផ្ញើអ៊ីមែល & សាររំលឹក" : "Email & Reminders"}</h3>
            </div>

            <div className="delivery-email-form">
              <label>
                <span className="label-text">{isKm ? "ប្រធានបទអ៊ីមែល" : "Subject"}</span>
                <input
                  className="delivery-input"
                  value={emailForm.subject}
                  onChange={(event) =>
                    setEmailForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  placeholder={isKm ? "ប្រធានបទ..." : "Email subject"}
                />
              </label>

              <label>
                <span className="label-text">{isKm ? "ខ្លឹមសារសារ" : "Message"}</span>
                <textarea
                  className="delivery-textarea"
                  rows="3"
                  value={emailForm.message}
                  onChange={(event) =>
                    setEmailForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder={isKm ? "ខ្លឹមសារសារ..." : "Email message"}
                />
              </label>

              <div className="email-form-buttons">
                <button
                  className="inv-primary-btn"
                  type="button"
                  onClick={sendEmail}
                  disabled={saving || !isPublished}
                >
                  <IoPaperPlaneOutline aria-hidden="true" />
                  <span>{isKm ? "ផ្ញើអ៊ីមែលទៅកាន់ភ្ញៀវ · Send Email" : "Send email to eligible guests"}</span>
                </button>
                <button
                  className="inv-secondary-btn"
                  type="button"
                  onClick={sendReminders}
                  disabled={saving || !isPublished}
                >
                  <IoTimeOutline aria-hidden="true" />
                  <span>{isKm ? "ផ្ញើសាររំលឹក RSVP · Send Reminders" : "Send reminders"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* WORKFLOW STAGE 3: TRACKING & RECONCILIATION */}
      <details className="delivery-workflow-card stage-track" open={isPublished || Boolean(summary?.sent || summary?.opened || summary?.responded || summary?.failed)}>
        <summary className="card-badge-header">
          <span className="stage-number">3</span>
          <div>
            <h2>{isKm ? "តាមដានស្ថានភាពផ្ញើ & ភ្ញៀវ" : "Track Delivery & Guests"}</h2>
            <p>
              {isKm
                ? "ពិនិត្យស្ថានភាពនៃការផ្ញើ ការបើកមើល និងការឆ្លើយតបរបស់ភ្ញៀវម្នាក់ៗ។"
                : "Real-time delivery progress, guest open tracking, and response logs."}
            </p>
          </div>
        </summary>

        {/* Live Tracking Metrics */}
        <div className="delivery-stats mb-6">
          <DeliveryMetricCard
            label="Sent"
            kmLabel="បានផ្ញើ"
            value={summary?.sent}
            icon={IoPaperPlaneOutline}
            variant="info"
          />
          <DeliveryMetricCard
            label="Opened"
            kmLabel="បានបើកមើល"
            value={summary?.opened}
            icon={IoCheckmarkCircleOutline}
            variant="success"
          />
          <DeliveryMetricCard
            label="Responded"
            kmLabel="បានឆ្លើយតប RSVP"
            value={summary?.responded}
            icon={IoCheckmarkCircleOutline}
            variant="gold"
          />
          <DeliveryMetricCard
            label="Failed"
            kmLabel="បរាជ័យ"
            value={summary?.failed}
            icon={IoAlertCircleOutline}
            variant={summary?.failed > 0 ? "danger" : "default"}
          />
        </div>

        {/* Guest Delivery Table */}
        <div className="delivery-table-panel">
          <div className="table-filter-bar">
            <input
              type="search"
              className="delivery-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isKm ? "ស្វែងរកតាមឈ្មោះ ទូរស័ព្ទ ឬអ៊ីមែល..." : "Search guest by name, phone, email..."}
            />
            <span className="text-xs text-slate-500 font-medium">
              {isKm
                ? `បង្ហាញ ${filteredGuests.length} ក្នុងចំណោម ${guests.length} នាក់`
                : `Showing ${filteredGuests.length} of ${guests.length} guests`}
            </span>
          </div>

          <div className="guest-table-wrap">
            <ResponsiveTable ariaLabel="Guest Delivery Table" className="delivery-data-table">
              <thead>
                <tr>
                  <th>{isKm ? "ឈ្មោះភ្ញៀវ" : "Guest"}</th>
                  <th>{isKm ? "ទំនាក់ទំនង" : "Contact"}</th>
                  <th>{isKm ? "ស្ថានភាពផ្ញើ" : "Status"}</th>
                  <th>{isKm ? "តំណភ្ជាប់ធៀប" : "Invitation URL"}</th>
                  <th>{isKm ? "ពេលផ្ញើចុងក្រោយ" : "Last sent"}</th>
                  <th className="text-right">{isKm ? "សកម្មភាព" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => {
                  const hasUrl = Boolean(guest.invitationUrl);
                  return (
                    <tr key={guest.guestId || guest.id}>
                      <td data-label={isKm ? "ឈ្មោះភ្ញៀវ" : "Guest"}>
                        <div className="flex flex-col">
                          <strong className="text-slate-900 font-bold">{guest.guestName}</strong>
                          <span className="text-[11px] font-medium text-slate-500">
                            {guest.responded
                              ? isKm ? "បានឆ្លើយតប RSVP" : "Responded"
                              : isKm ? "មិនទាន់ RSVP នៅឡើយ" : "No RSVP yet"}
                          </span>
                        </div>
                      </td>
                      <td data-label={isKm ? "ទំនាក់ទំនង" : "Contact"}>
                        <div className="flex flex-col text-xs">
                          <span className="font-mono text-slate-800">{guest.phone || "—"}</span>
                          {guest.email && <small className="text-slate-500">{guest.email}</small>}
                        </div>
                      </td>
                      <td data-label={isKm ? "ស្ថានភាពផ្ញើ" : "Status"}>
                        <StatusBadge status={guest.sendStatus || "PENDING"} />
                        {guest.lastSendError && (
                          <div className="delivery-error-text text-xs text-rose-600 mt-1">
                            {guest.lastSendError}
                          </div>
                        )}
                      </td>
                      <td data-label={isKm ? "តំណភ្ជាប់ធៀប" : "Invitation URL"}>
                        {hasUrl ? (
                          <button
                            type="button"
                            className="inv-secondary-btn py-1 px-3 text-xs"
                            onClick={() =>
                              copyText(
                                guest.invitationUrl,
                                isKm ? "បានចម្លងតំណភ្ជាប់ធៀបការ" : "Invitation link copied"
                              )
                            }
                          >
                            <IoCopyOutline aria-hidden="true" />
                            <span>{isKm ? "ចម្លងតំណ" : "Copy link"}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {isKm ? "មិនទាន់បង្កើត" : "Not generated"}
                          </span>
                        )}
                      </td>
                      <td data-label={isKm ? "ពេលផ្ញើចុងក្រោយ" : "Last sent"}>
                        <div className="text-xs text-slate-700">{formatDate(guest.lastSentAt, isKm)}</div>
                        {guest.lastReminderAt && (
                          <small className="text-[11px] text-slate-500 block">
                            {isKm ? "រំលឹក៖ " : "Reminder: "}
                            {formatDate(guest.lastReminderAt, isKm)}
                          </small>
                        )}
                      </td>
                      <td data-label={isKm ? "សកម្មភាព" : "Actions"}>
                        <div className="guest-row-actions">
                          <button
                            type="button"
                            className="inv-primary-btn py-1.5 px-3 text-xs"
                            onClick={() => copyShareMessage(guest.guestId)}
                            title={isKm ? "ចម្លងសារអញ្ជើញពេញលេញ" : "Copy full message"}
                          >
                            <IoCopyOutline aria-hidden="true" />
                            <span>{isKm ? "ចម្លងសារ" : "Copy message"}</span>
                          </button>
                          <button
                            type="button"
                            className="inv-secondary-btn py-1.5 px-3 text-xs"
                            onClick={() => markShared(guest.guestId)}
                            disabled={!guest.invitationUrl || saving}
                            title={isKm ? "សម្គាល់ថាបានផ្ញើរួច" : "Mark as shared"}
                          >
                            <IoCheckmarkCircleOutline aria-hidden="true" />
                            <span>{isKm ? "បានផ្ញើ" : "Mark shared"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </ResponsiveTable>

            {filteredGuests.length === 0 && (
              <div className="inv-empty py-12 text-center">
                <IoPeopleOutline className="text-3xl mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">
                  {guests.length === 0
                    ? isKm
                      ? "មិនទាន់មានភ្ញៀវនៅក្នុងបញ្ជីផ្ញើនៅឡើយទេ។ សូមបន្ថែមភ្ញៀវជាមុនសិន។"
                      : "No delivery guests found. Add guests first."
                    : isKm
                    ? "មិនមានភ្ញៀវត្រូវនឹងការស្វែងរកនេះទេ។"
                    : "No guests match your search criteria."}
                </p>
                {guests.length === 0 && (
                  <button
                    type="button"
                    className="inv-primary-btn mt-3"
                    onClick={() => navigate(`/app/events/${id}/guests`)}
                  >
                    {isKm ? "បន្ថែមភ្ញៀវឥឡូវនេះ" : "Add Guests"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </details>

      {/* AUDIT TRAIL */}
      <details className="delivery-workflow-card stage-audit" open={events.length > 0}>
        <summary className="card-badge-header">
          <IoTimeOutline className="text-xl text-[#0F766E]" aria-hidden="true" />
          <div>
            <h2>{isKm ? "កំណត់ត្រាសកម្មភាពផ្ញើធៀប" : "Audit Trail"}</h2>
            <p className="text-xs text-slate-500">
              {isKm
                ? "ប្រវត្តិនៃការបង្កើតតំណភ្ជាប់ ការផ្ញើអ៊ីមែល និងសាររំលឹកទាំងអស់។"
                : "Timestamped logs of all link generations, batch dispatches, and reminders."}
            </p>
          </div>
        </summary>

        <div className="audit-events-list">
          {events.length === 0 ? (
            <div className="inv-empty compact">
              {isKm ? "មិនទាន់មានកំណត់ត្រាសកម្មភាពនៅឡើយទេ។" : "No delivery events yet."}
            </div>
          ) : (
            events.map((event) => (
              <div className="delivery-event-card" key={event.id}>
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm font-bold text-slate-900">{event.eventType}</strong>
                  <span className="text-xs font-mono text-slate-400">{formatDate(event.createdAt, isKm)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-[#0F766E]">{event.guestName || (isKm ? "ធៀបការទូទៅ" : "Invitation")}</span>
                  <span>·</span>
                  <span>{event.channel || "—"}</span>
                  <span>·</span>
                  <StatusBadge status={event.status || "INFO"} />
                </div>
                {event.errorMessage && <p className="text-xs text-rose-600 mt-1">{event.errorMessage}</p>}
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}
