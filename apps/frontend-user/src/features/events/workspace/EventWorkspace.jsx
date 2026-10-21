import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { EventContext } from "./EventContext";
import { EVENT_MODULES, eventPath } from "./eventRoutes";
import { EVENT_TYPES } from "../onboarding/eventFields";
import {
  LayoutDashboard,
  Palette,
  Ticket,
  Images,
  Eye,
  Users,
  ClipboardCheck,
  Armchair,
  ScanLine,
  Send,
  Gift,
  Wallet,
  ChartColumn,
  QrCode,
  MessageCircleHeart,
  Settings,
  Calendar,
  MapPin,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { formatLocalDate } from "@/shared/utils/localDate";
import "./EventWorkspace.css";

const MODULE_GROUPS = [
  {
    key: "overview",
    labelKh: "ទិដ្ឋភាពទូទៅ",
    labelEn: "Overview",
    items: [
      { path: "", labelKh: "ផ្ទាំងគ្រប់គ្រង", labelEn: "Dashboard", Icon: LayoutDashboard },
    ],
  },
  {
    key: "invitation",
    labelKh: "ធៀប & កាត",
    labelEn: "Invitation",
    items: [
      { path: "invitation", labelKh: "រចនាធៀប", labelEn: "Invitation Studio", Icon: Palette },
      { path: "tickets/design", labelKh: "រចនាកាត", labelEn: "Ticket Designer", Icon: Ticket },
      { path: "media", labelKh: "រូបភាព", labelEn: "Media", Icon: Images },
      { path: "preview", labelKh: "មើលជាមុន", labelEn: "Preview", Icon: Eye },
    ],
  },
  {
    key: "guests",
    labelKh: "ភ្ញៀវ & វត្តមាន",
    labelEn: "Guests",
    items: [
      { path: "guests", labelKh: "បញ្ជីភ្ញៀវ", labelEn: "Guests", Icon: Users },
      { path: "rsvp", labelKh: "ការឆ្លើយតប", labelEn: "RSVP", Icon: ClipboardCheck },
      { path: "seating", labelKh: "រៀបកៅអី", labelEn: "Seating", Icon: Armchair },
      { path: "check-in", labelKh: "វត្តមាន", labelEn: "Check-in", Icon: ScanLine },
    ],
  },
  {
    key: "operations",
    labelKh: "ប្រតិបត្តិការ",
    labelEn: "Operations",
    items: [
      { path: "delivery", labelKh: "ការផ្ញើ", labelEn: "Delivery", Icon: Send },
      { path: "gifts", labelKh: "ចំណងដៃ", labelEn: "Gifts", Icon: Gift },
      { path: "budget", labelKh: "គម្រោងថវិកា", labelEn: "Budget", Icon: Wallet },
      { path: "reports", labelKh: "របាយការណ៍", labelEn: "Reports", Icon: ChartColumn },
    ],
  },
  {
    key: "other",
    labelKh: "ផ្សេងៗ",
    labelEn: "Other",
    items: [
      { path: "qr", labelKh: "កូដ QR", labelEn: "QR Code", Icon: QrCode },
      { path: "wishes", labelKh: "សារជូនពរ", labelEn: "Wishes", Icon: MessageCircleHeart },
      { path: "settings", labelKh: "ការកំណត់", labelEn: "Settings", Icon: Settings },
      { path: "assistant", labelKh: "ជំនួយការ", labelEn: "Assistant", Icon: Sparkles },
    ],
  },
];

function VerifiedWorkspace({ eventId }) {
  const [state, setState] = useState({ loading: true, event: null, events: [], error: "" });
  const [retry, setRetry] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const menuTrigger = useRef(null);
  const navRef = useRef(null);
  const en = useLanguageStore(s => s.lang) === "en";
  const location = useLocation();
  const navigate = useNavigate();
  const currentModule = location.pathname.slice(eventPath(eventId).length).replace(/^\//, "");
  const focusedStudio = currentModule === "invitation" && state.event?.eventType === "WEDDING" && state.event?.templateCode !== "event-essential";

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    (navRef.current?.querySelector('a[aria-current="page"]') || navRef.current?.querySelector("a"))?.focus();
    const close = event => {
      if (event.key === "Escape") { setMobileDrawerOpen(false); menuTrigger.current?.focus(); }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobileDrawerOpen]);

  useEffect(() => {
    let active = true;
    if (!/^[1-9]\d*$/.test(eventId)) return;
    Promise.all([invitationService.get(eventId), invitationService.listMine()])
      .then(([event, events]) => {
        if (!event || String(event.id) !== eventId) throw new Error("Invalid event response");
        if (active) setState({ loading: false, event, events: Array.isArray(events) ? events : [], error: "" });
      })
      .catch(error => { if (active) setState({ loading: false, event: null, events: [], error: error.message }); });
    return () => { active = false; };
  }, [eventId, retry]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  if (!/^[1-9]\d*$/.test(eventId)) return (
    <div className="event-workspace workspace-page" role="alert">
      <div className="workspace-notice">
        {en ? "Choose a synchronized event to manage it." : "សូមជ្រើសរើសកម្មវិធីដែលបានរក្សាទុកលើម៉ាស៊ីនមេ។"}
        <div style={{ marginTop: "12px" }}>
          <Link to="/app/events" className="workspace-button primary">{en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}</Link>
        </div>
      </div>
    </div>
  );

  if (state.loading) return (
    <div className="event-workspace workspace-page" role="status">
      <div className="event-workspace-loading">
        <Sparkles className="spin-slow" size={24} style={{ color: "var(--ws-gold, #967037)" }} />
        <span>{en ? "Loading event workspace…" : "កំពុងទាញយកទិន្នន័យកម្មវិធី…"}</span>
      </div>
    </div>
  );

  if (state.error) return (
    <div className="event-workspace workspace-page" role="alert">
      <div className="workspace-notice">
        <p>{en ? (/access denied|403|forbidden/i.test(state.error) ? "Access denied. Open an event you have permission to manage." : "This event could not be opened. Check your access or try again.") : "មិនអាចបើកកម្មវិធីនេះបានទេ។ សូមពិនិត្យសិទ្ធិរបស់អ្នក ឬព្យាយាមម្ដងទៀត។"}</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button type="button" className="workspace-button" onClick={() => setRetry(n => n + 1)}>
            {en ? "Try again" : "ព្យាយាមម្ដងទៀត"}
          </button>
          <Link to="/app/events" className="workspace-button primary">
            {en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}
          </Link>
        </div>
      </div>
    </div>
  );

  const isPublished = state.event.status === "PUBLISHED";
  const statusLabel = state.event.status === "UNPUBLISHED" ? (en ? "Unpublished" : "ផ្អាកផ្សាយ")
    : isPublished ? (en ? "Published" : "បានផ្សាយ")
    : (en ? "Draft" : "ព្រាង");
  const statusClass = state.event.status === "UNPUBLISHED" ? "badge-unpublished"
    : isPublished ? "badge-published"
    : "badge-draft";

  // Find active item label for mobile header
  let activeModuleLabel = en ? "Dashboard" : "ផ្ទាំងគ្រប់គ្រង";
  for (const grp of MODULE_GROUPS) {
    const item = grp.items.find(i => i.path === currentModule);
    if (item) {
      activeModuleLabel = en ? item.labelEn : item.labelKh;
      break;
    }
  }

  return (
    <EventContext.Provider value={{
      eventId,
      event: state.event,
      events: state.events,
      updateEvent: event => setState(current => ({ ...current, event }))
    }}>
      <section className={`event-workspace${collapsed ? " is-collapsed" : ""}${focusedStudio ? " is-studio" : ""}`} aria-label={en ? "Event workspace" : "គ្រប់គ្រងកម្មវិធី"}>
        {/* Top Control Bar: Breadcrumb, Event Identity, Switcher */}
        <header className="event-workspace-header">
          <div className="event-workspace-meta-col">
            <Link to={focusedStudio ? eventPath(eventId) : "/app/events"} className="event-back-link">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{focusedStudio ? (en ? "Event overview" : "ទិដ្ឋភាពកម្មវិធី") : (en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ")}</span>
            </Link>
            <div className="event-title-row">
              <p className="event-workspace-title">{state.event.title}</p>
              <span className={`event-status-pill ${statusClass}`}>{statusLabel}</span>
            </div>
            <div className="event-details-row">
              {state.event.eventDate && (
                <span className="event-meta-item">
                  <Calendar size={14} aria-hidden="true" />
                  <span>{formatLocalDate(state.event.eventDate, en ? "en-US" : "km-KH")}</span>
                </span>
              )}
              {state.event.venueName && (
                <span className="event-meta-item">
                  <MapPin size={14} aria-hidden="true" />
                  <span>{state.event.venueName}</span>
                </span>
              )}
              {state.event.eventType && (
                <span className="event-meta-item event-type-tag">
                  {EVENT_TYPES.find(type => type[0] === state.event.eventType)?.[en ? 2 : 1] || state.event.eventType}
                </span>
              )}
            </div>
          </div>

          <div className="event-workspace-actions-col">
            <label className="event-switcher-label">
              <span>{en ? "Switch event" : "ប្ដូរកម្មវិធី"}</span>
              <div className="event-switcher-select-wrap">
                <select
                  value={eventId}
                  onChange={e => navigate(eventPath(e.target.value, EVENT_MODULES.includes(currentModule) ? currentModule : ""))}
                  className="event-switcher-select"
                >
                  {state.events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="event-switcher-arrow" aria-hidden="true" />
              </div>
            </label>

            {/* Mobile menu trigger */}
            <button
              type="button"
              ref={menuTrigger}
              className="event-mobile-nav-toggle"
              onClick={() => setMobileDrawerOpen(prev => !prev)}
              aria-label={en ? "Toggle modules menu" : "បើកម៉ឺនុយមុខងារ"}
              aria-expanded={mobileDrawerOpen}
              aria-controls="event-module-navigation"
            >
              {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="event-mobile-active-label">{activeModuleLabel}</span>
            </button>
            {!focusedStudio && <button type="button" className="event-sidebar-toggle" aria-expanded={!collapsed}
              aria-controls="event-module-navigation" onClick={() => setCollapsed(value => !value)}
              aria-label={en ? (collapsed ? "Expand navigation" : "Collapse navigation") : (collapsed ? "ពង្រីកម៉ឺនុយ" : "បង្រួមម៉ឺនុយ")}>
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>}
          </div>
        </header>

        {/* Structured Categorized Module Navigation */}
        <nav
          id="event-module-navigation"
          ref={navRef}
          className={`event-workspace-nav ${mobileDrawerOpen ? "is-open-mobile" : ""}`}
          aria-label={en ? "Event navigation" : "មុខងារកម្មវិធី"}
        >
          {MODULE_GROUPS.map((group) => (
            <div key={group.key} className="event-nav-group">
              <span className="event-nav-group-title">
                {en ? group.labelEn : group.labelKh}
              </span>
              <div className="event-nav-group-items">
                {group.items.map(({ path, labelKh, labelEn, Icon }) => (
                  <NavLink
                    key={path}
                    end
                    to={eventPath(eventId, path)}
                    className={({ isActive }) => `event-nav-tab ${isActive ? "active" : ""}`}
                    title={en ? labelEn : labelKh}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <Icon size={16} className="event-nav-tab-icon" aria-hidden="true" />
                    <span className="event-nav-tab-text">{en ? labelEn : labelKh}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="event-workspace-content" id="event-module-content">
          <Outlet />
        </div>
      </section>
    </EventContext.Provider>
  );
}

export default function EventWorkspace() {
  const { eventId } = useParams();
  const { user } = useAuth();
  return <VerifiedWorkspace key={`${user?.id}:${eventId}`} eventId={eventId} />;
}
