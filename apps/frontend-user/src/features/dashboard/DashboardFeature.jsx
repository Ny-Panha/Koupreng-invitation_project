import { PageSkeleton, LoadingRegion } from '@/shared/ui/LoadingState';
import { useEventWorkspace } from "@/features/events/workspace/EventContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";



import { invitationService } from "@/features/invitations/api/invitationApi";
import { eventPath } from "@/features/events/workspace/eventRoutes";
import { eventStatus } from "@/features/events/workspace/eventNavigationModel";
import { EVENT_TYPES } from "@/features/events/onboarding/eventFields";
import EventCover from '@/features/events/components/EventCover';
import { CheckCircle2, Circle, ArrowRight, Eye, Palette, Users, ScanLine, Wallet, ChartColumn, CalendarDays, MapPin, Clock3, Send } from "lucide-react";
import { formatLocalDate } from "@/shared/utils/localDate";
import { loadServerDashboard, groupAmounts } from "./dashboardData";
import { currencyAmounts } from "@/features/budget/currencyTotals";
import { getDraft, getDraftBySlug, saveDraft } from "../../shared/storage/weddingStorage";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { ErrorState } from "@/shared/ui";
import "./DashboardPage.css";
import "./EventOverview.css";

function asList(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  if (Array.isArray(val?.items)) return val.items;
  if (Array.isArray(val?.content)) return val.content;
  return [];
}

function eventTitle(inv, lang = "km") {
  const title = String(inv?.title || "").trim();
  const normalized = title.toLowerCase();
  const isPlaceholder = !title
    || normalized === "fdfgf"
    || normalized === "ererer"
    || normalized.includes("wedding draft storage")
    || normalized === "new wedding invitation";
  if (!isPlaceholder) return title;
  if (inv?.groomName && inv?.brideName) return `${inv.groomName} & ${inv.brideName}`;
  return lang === "en" ? "Wedding Event" : "កម្មវិធីអាពាហ៍ពិពាហ៍";
}

export default function DashboardFeature() {
  const { lang, text } = useBackendMessages("dashboard");
  const { eventId: routeEventId } = useParams();
  const workspace = useEventWorkspace();

  const [copied, setCopied] = useState(false);
  const [selectedInvId, setSelectedInvId] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [actionError, setActionError] = useState("");

  const [state, setState] = useState({
    loading: true,
    error: "",
    invitations: [],
    selectedInvitation: null,
    guests: [],
    rsvps: [],
    rsvpSummary: null,
    budgetItems: [],
    gifts: [],
    notifications: [],
    checkInSummary: null,
  });

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    hasDate: false,
  });

  const loadGeneration = useRef(0);
  const loadData = useCallback(async (targetId = null) => {
    const generation = ++loadGeneration.current;
    try {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      const invs = workspace?.event ? [workspace.event] : asList(await invitationService.listMine());
      if (generation !== loadGeneration.current) return;
      const allInvs = invs;

      const activeInv = targetId
        ? allInvs.find((i) => String(i.id || i.invitationId) === String(targetId)) || null
        : null;

      const invId = activeInv?.id || activeInv?.invitationId;
      const isNumericBackendId = Boolean(
        invId && invs.some((i) => (i.id || i.invitationId) == invId)
      );

      if (invId) {
        setSelectedInvId(invId);
        const data = isNumericBackendId ? await loadServerDashboard(invId)
          : { guests: [], rsvps: [], rsvpSummary: null, budgetItems: [], gifts: [], notifications: [], checkInSummary: null, dashboard: null };
        if (generation !== loadGeneration.current) return;

        setState({
          loading: false,
          error: "",
          invitations: allInvs,
          selectedInvitation: activeInv,
          ...data,
          budgetItems: asList(data.budgetItems),
          gifts: asList(data.gifts),
          notifications: asList(data.notifications),
        });
        return;
      }

      setState({
        loading: false,
        error: "",
        invitations: allInvs,
        selectedInvitation: null,
        guests: [],
        rsvps: [],
        rsvpSummary: null,
        budgetItems: [],
        gifts: [],
        notifications: [],
        checkInSummary: null,
      });
    } catch (err) {
      if (generation !== loadGeneration.current) return;
      setState((prev) => ({
        ...prev,
        ...([401, 403, 404].includes(err?.status ?? err?.response?.status) ? { selectedInvitation: null } : {}),
        loading: false,
        error: err.message || "Failed to load dashboard data.",
      }));
    }
  }, [workspace?.event]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const targetId = routeEventId || searchParams.get("id") || searchParams.get("invitationId");
    loadData(targetId || null);
    return () => { loadGeneration.current += 1; };
  }, [loadData, searchParams, routeEventId]);

  const stats = useMemo(() => {
    const inv = state.selectedInvitation;
    const guestTotal = state.guests.reduce((sum, g) => sum + (Number(g.count) || 1), 0);
    const totalGuestsCount = state.dashboard?.totalGuests ?? state.checkInSummary?.totalGuests ?? Math.max(guestTotal, state.guests.length);

    // 1. Check summary from backend API (matching /dashboard/invitations/:id/rsvp)
    const summaryAttending =
      typeof state.rsvpSummary?.attending === "number"
        ? state.rsvpSummary.attending
        : typeof state.rsvpSummary?.accepted === "number"
          ? state.rsvpSummary.accepted
          : null;

    const summaryDeclined =
      typeof state.rsvpSummary?.notAttending === "number"
        ? state.rsvpSummary.notAttending
        : typeof state.rsvpSummary?.declined === "number"
          ? state.rsvpSummary.declined
          : null;

    const summaryPending =
      typeof state.rsvpSummary?.pending === "number"
        ? state.rsvpSummary.pending
        : null;

    // 2. Fallback calculate from rsvps list
    const rsvpsYes = state.rsvps.reduce((sum, r) => {
      const s = String(r.responseStatus || r.status || "").toUpperCase();
      return s === "ATTENDING" || s === "ACCEPTED" || r.attending === true
        ? sum + (Number(r.attendeeCount) || Number(r.count) || 1)
        : sum;
    }, 0);

    const guestsYes = state.guests.reduce((sum, g) => {
      const s = String(g.rsvpStatus || g.status || "").toUpperCase();
      return s === "ATTENDING" || s === "ACCEPTED"
        ? sum + (Number(g.count) || 1)
        : sum;
    }, 0);

    const rsvpsNo = state.rsvps.reduce((sum, r) => {
      const s = String(r.responseStatus || r.status || "").toUpperCase();
      return s === "NOT_ATTENDING" || s === "DECLINED"
        ? sum + (Number(r.attendeeCount) || Number(r.count) || 1)
        : sum;
    }, 0);

    const guestsNo = state.guests.reduce((sum, g) => {
      const s = String(g.rsvpStatus || g.status || "").toUpperCase();
      return s === "NOT_ATTENDING" || s === "DECLINED"
        ? sum + (Number(g.count) || 1)
        : sum;
    }, 0);

    const rsvpYes = state.dashboard?.attending ?? (summaryAttending !== null ? summaryAttending : Math.max(rsvpsYes, guestsYes));
    const rsvpNo = state.dashboard?.declined ?? (summaryDeclined !== null ? summaryDeclined : Math.max(rsvpsNo, guestsNo));
    const rsvpPending = state.dashboard?.pending ?? (summaryPending !== null
      ? summaryPending
      : Math.max(0, totalGuestsCount - rsvpYes - rsvpNo));

    const expenseAmounts = groupAmounts(state.budgetItems, "actualCost");
    const estimatedAmounts = groupAmounts(state.budgetItems, "estimatedCost");
    const giftAmounts = groupAmounts(state.gifts, "amount");
    const hasBudget = [...Object.values(expenseAmounts), ...Object.values(estimatedAmounts)].some((amount) => amount > 0);

    const checkedInCount =
      state.checkInSummary?.checkedIn ?? state.checkInSummary?.totalCheckedIn ??
      state.guests.filter((g) => g.checkedIn).length;

    const rsvpRate = totalGuestsCount > 0 ? Math.min(100, Math.round((rsvpYes / totalGuestsCount) * 100)) : 0;

    return {
      hasInvitation: !!inv,
      title:
        eventTitle(inv, lang),
      couple: inv?.groomName && inv?.brideName ? `${inv.groomName} & ${inv.brideName}` : "",
      eventDate: inv?.eventDate || inv?.weddingDate || "",
      venue: inv?.venueName || inv?.venue || inv?.location || "",
      slug: inv?.slug || "",
      status: inv?.status || (inv?.published ? "PUBLISHED" : "DRAFT"),
      id: inv?.id || inv?.invitationId,
      guestTotal: totalGuestsCount,
      rsvpYes,
      rsvpNo,
      rsvpPending,
      rsvpRate,
      checkedInCount,
      hasBudget,
      expenseAmounts,
      estimatedAmounts,
      giftAmounts,
      giftCount: state.gifts.length,
    };
  }, [lang, state]);

  const english = lang === "en";
  const label = (en, km) => english ? en : km;
  const invitation = state.selectedInvitation;
  const publicationStatus = eventStatus(invitation, english);
  const preparation = [
    { done: Boolean(invitation?.title && stats.eventDate && stats.venue && invitation?.eventTime), module: "settings", title: label("Complete event details", "បំពេញព័ត៌មានកម្មវិធី") },
    { done: Boolean(invitation?.templateId || invitation?.templateCode), module: "invitation", title: label("Choose your invitation", "ជ្រើសរើសធៀបអញ្ជើញ") },
    { done: stats.status === "PUBLISHED", module: "invitation", title: label("Review and publish", "ពិនិត្យ និងផ្សព្វផ្សាយ") },
    { done: stats.guestTotal > 0, module: "guests", title: label("Add your guests", "បន្ថែមបញ្ជីភ្ញៀវ") },
    { done: Number(state.dashboard?.deliverySent) > 0, module: "delivery", title: label("Send invitations", "ផ្ញើធៀបអញ្ជើញ") },
  ];
  const nextStep = preparation.find(step => !step.done);
  const primaryAction = stats.status === "PUBLISHED"
    ? stats.guestTotal === 0
      ? { module: "guests", title: label("Add your guests", "បន្ថែមបញ្ជីភ្ញៀវ") }
      : Number(state.dashboard?.deliverySent) > 0
        ? { module: "rsvp", title: label("Track responses", "តាមដានការឆ្លើយតប") }
        : { module: "delivery", title: label("Share invitations", "ចែករំលែកធៀបអញ្ជើញ") }
    : nextStep || { module: "invitation", title: label("Continue editing", "បន្តកែសម្រួល") };

  // Live Countdown Effect
  useEffect(() => {
    if (!stats.eventDate) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, hasDate: false });
      return;
    }

    const calculateTime = () => {
      const target = new Date(stats.eventDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (isNaN(target)) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, hasDate: false });
        return;
      }

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, hasDate: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, isPast: false, hasDate: true });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [stats.eventDate]);

  const handleCopyLink = async (slug) => {
    if (!slug) return;
    const url = `${window.location.origin}/w/${slug}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); }
    catch { setActionError(label("Could not copy the invitation link. Please try again.", "មិនអាចចម្លងតំណធៀបបានទេ។ សូមព្យាយាមម្ដងទៀត។")); }
  };

  const handlePublishToggle = async () => {
    if (!stats.id || publishing) return;
    const wasPublished = stats.status === "PUBLISHED";
    try {
      setPublishing(true);
      setActionError("");
      // Call the correct API: OFF→ON = publish, ON→OFF = unpublish
      if (wasPublished) {
        const updated = await invitationService.unpublish(stats.id);
        workspace?.updateEvent(updated);
      } else {
        return;
      }
      // Refresh from backend FIRST — this is the source of truth
      await loadData(stats.id);
      // THEN sync localStorage draft so /w/{slug} fallback sees correct status.
      // Without this, getDraftBySlug() returns a stale draft with published:true
      // and the public page renders the invitation even after unpublishing.
      const newStatus = wasPublished ? "UNPUBLISHED" : "PUBLISHED";
      const newPublished = !wasPublished;
      const localDraft = getDraft(stats.id) || (stats.slug ? getDraftBySlug(stats.slug) : null);
      if (localDraft) {
        saveDraft({ ...localDraft, status: newStatus, published: newPublished });
      }
    } catch (err) {
      // On failure: keep previous toggle position, show error
      setActionError(err?.response?.data?.message || err?.message || "Failed to update publication status.");
    } finally {
      setPublishing(false);
    }
  };

  if (state.loading && !state.selectedInvitation) return <main className="dash-main pe-dashboard-page"><header className="dash-page-header"><h1>{text("title")}</h1></header><PageSkeleton layout="dashboard" /></main>;
  if (state.error && !state.selectedInvitation) return <main className="dash-main pe-dashboard-page"><ErrorState message={state.error} onRetry={() => loadData(selectedInvId)} /></main>;
  if (!stats.hasInvitation) return <main className="workspace-page"><h1>{text("title")}</h1><Link className="workspace-button primary" to="/app/events">{text("viewList")}</Link></main>;
  return <main className="dash-main pe-dashboard-page event-overview" aria-busy={state.loading}>
    {state.loading && <LoadingRegion label={label("Refreshing…", "កំពុងធ្វើបច្ចុប្បន្នភាព…")} />}
    {state.error && <ErrorState message={state.error} onRetry={() => loadData(selectedInvId)} />}
    <header className="dash-page-header"><div><h1>{label("Event overview", "ទិដ្ឋភាពទូទៅនៃកម្មវិធី")}</h1></div></header>
    {actionError && <p className="workspace-notice" role="alert">{actionError}</p>}
    <section className="overview-hero">
      <div className="overview-cover" aria-hidden="true">
        <EventCover event={invitation} alt="" />
      </div>
      <div className="overview-hero-content">
        <div className="overview-event-labels"><span className={`event-status-pill badge-${publicationStatus.tone}`}>{publicationStatus.label}</span><span className="workspace-muted">{EVENT_TYPES.find(type => type[0] === invitation.eventType)?.[english ? 2 : 1]}</span></div>
        <h2>{stats.title}</h2>
        <div className="overview-event-meta"><span><CalendarDays size={16} aria-hidden="true" />{formatLocalDate(stats.eventDate, english ? "en-US" : "km-KH")}{invitation.eventTime && ` \u00b7 ${invitation.eventTime.slice(0,5)}`}</span>{stats.venue && <span><MapPin size={16} aria-hidden="true" />{stats.venue}</span>}</div>
        {timeRemaining.hasDate && !timeRemaining.isPast && <p className="workspace-muted">{timeRemaining.days} {label("days to your celebration", "ថ្ងៃទៀតដល់កម្មវិធីរបស់អ្នក")}</p>}
        <div className="overview-actions">
          <Link className="workspace-button primary" to={eventPath(stats.id, primaryAction.module)}><ArrowRight size={18} />{primaryAction.title}</Link>
          <Link className="workspace-button" to={eventPath(stats.id, "preview")}><Eye size={18} />{label("Preview", "មើលជាមុន")}</Link>
          {primaryAction.module !== "invitation" && <Link className="workspace-button" to={eventPath(stats.id, "invitation")}><Palette size={18} />{text("edit")}</Link>}
        </div>
        <details className="overview-publication-controls"><summary>{label("Publication settings", "ការកំណត់ការផ្សព្វផ្សាយ")}</summary><div className="overview-publication">
          {stats.status === "PUBLISHED" ? <button type="button" className="workspace-button" onClick={handlePublishToggle} disabled={publishing}>{publishing ? label("Updating…", "កំពុងកែប្រែ…") : label("Unpublish invitation", "ផ្អាកផ្សាយធៀប")}</button> : <Link className="workspace-button" to={`${eventPath(stats.id,'invitation')}?mode=guided`}>{label("Review and publish", "ពិនិត្យ និងផ្សព្វផ្សាយ")}</Link>}
          {stats.status === "PUBLISHED" && stats.slug && <button className="workspace-button" onClick={() => handleCopyLink(stats.slug)}>{copied ? text("copied") : text("copyLink")}</button>}
        </div></details>
      </div>
    </section>
    {<section className="overview-metrics" aria-label={label("Event activity", "សកម្មភាពកម្មវិធី")}>
      {<>
        <Link to={eventPath(stats.id, "guests")}><div className="overview-metric-heading"><span>{text("statGuests")}</span><Users size={20} aria-hidden="true" /></div><strong>{stats.guestTotal}</strong></Link>
        <Link to={eventPath(stats.id, "rsvp")}><CheckCircle2 className="overview-metric-icon" size={20} aria-hidden="true" /><span>{label("Confirmed", "បានយល់ព្រម")}</span><strong>{stats.rsvpYes}</strong></Link>
        <Link to={eventPath(stats.id, "rsvp")}><Clock3 className="overview-metric-icon" size={20} aria-hidden="true" /><span>{label("Pending responses", "រង់ចាំការឆ្លើយតប")}</span><strong>{stats.rsvpPending}</strong></Link>
        <Link to={eventPath(stats.id, "check-in")}><ScanLine className="overview-metric-icon" size={20} aria-hidden="true" /><span>{label("Checked in", "បានចូលរួម")}</span><strong>{stats.checkedInCount}</strong></Link>
      </>}
      {state.budgetItems.length > 0 && <Link to={eventPath(stats.id, "budget")}><span>{text("statBudget")}</span><strong>{currencyAmounts(stats.expenseAmounts)}</strong></Link>}
      {state.gifts.length > 0 && <Link to={eventPath(stats.id, "gifts")}><span>{text("statGifts")}</span><strong>{currencyAmounts(stats.giftAmounts)}</strong></Link>}
    </section>}
    <section className="overview-columns">
      <div className="workspace-section overview-preparation">
        <div className="workspace-section-heading"><h2>{stats.status === "PUBLISHED" ? label("Next steps", "ជំហានបន្ទាប់") : label("Prepare your celebration", "រៀបចំកម្មវិធីរបស់អ្នក")}</h2><span className="workspace-badge">{preparation.filter(step => step.done).length}/{preparation.length}</span></div>
        <ol className="overview-checklist">{(stats.status === "PUBLISHED" ? [...preparation.slice(3), ...preparation.slice(0, 3)] : preparation).map(step => <li key={step.module + step.title} className={step.done ? "is-done" : ""}>
          {step.done ? <CheckCircle2 size={22} aria-label={label("Complete", "រួចរាល់")} /> : <Circle size={22} aria-label={label("To do", "ត្រូវធ្វើ")} />}
          <Link to={eventPath(stats.id, step.module)}><strong>{step.title}</strong></Link><ArrowRight size={16} aria-hidden="true" />
        </li>)}</ol>
      </div>
      <div className="workspace-section overview-shortcuts"><h2>{label("Plan the event day", "រៀបចំថ្ងៃកម្មវិធី")}</h2>
        <div className="overview-tool-grid">{[
          ["delivery", Send, label("Delivery", "ការផ្ញើធៀប")], ["tickets/design", Palette, label("Digital tickets", "កាតឌីជីថល")], ["check-in", ScanLine, label("Check-in", "កត់ត្រាវត្តមាន")],
          ["seating", Users, label("Seating", "រៀបកៅអី")], ["budget", Wallet, label("Budget", "គម្រោងថវិកា")],
        ].map(([module, Icon, title]) => <Link key={module} to={eventPath(stats.id, module)}><Icon size={20} aria-hidden="true" /><span>{title}</span></Link>)}</div>
      </div>
    </section>
    {state.notifications.length > 0 && <section className="workspace-section overview-notifications"><div className="workspace-section-heading"><h2>{text("notificationsTitle")}</h2><Link to="/app/notifications" className="workspace-button">{text("notificationsViewAll")}</Link></div>
      {state.notifications.length ? <ul className="overview-activity">{state.notifications.slice(0, 4).map((notification, index) => <li key={notification.id || index}><strong>{notification.title || notification.message}</strong>{notification.title && <p>{notification.message}</p>}</li>)}</ul> : <p className="workspace-muted">{text("notificationsEmpty")}</p>}
      <Link className="overview-report-link" to={eventPath(stats.id, "reports")}><ChartColumn size={18} />{label("View event report", "មើលរបាយការណ៍កម្មវិធី")}</Link>
    </section>}
  </main>;
}
