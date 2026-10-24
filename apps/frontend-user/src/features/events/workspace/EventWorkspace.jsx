import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "@/stores/useLanguageStore";
import Modal from "@/shared/ui/Modal";
import { EventContext } from "./EventContext";
import { EVENT_MODULES, eventPath } from "./eventRoutes";
import { ALL_EVENT_LINKS, eventStatus } from "./eventNavigationModel";
import { useEventNavigation } from "./useEventNavigation";
import EventNavigation from "./EventNavigation";
import "./EventWorkspace.css";

function VerifiedWorkspace({ eventId }) {
  const [state, setState] = useState({ loading: true, event: null, events: [], error: "" });
  const [retry, setRetry] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const menuTrigger = useRef(null);
  const mainPanel = useRef(null);
  const registerNavigationTrigger = useCallback(node => { menuTrigger.current = node; }, []);
  const { user } = useAuth();
  const navigation = useEventNavigation(user?.id || user?.userId);
  const en = useLanguageStore(s => s.lang) === "en";
  const location = useLocation();
  const navigate = useNavigate();
  const currentModule = location.pathname.slice(eventPath(eventId).length).replace(/^\//, "");
  const focusedStudio = currentModule === "invitation" && state.event?.eventType === "WEDDING" && state.event?.templateCode !== "event-essential";
  const overlay = !navigation.desktop || focusedStudio;

  useEffect(() => { setMobileDrawerOpen(false); }, [location.pathname, overlay]);
  useEffect(() => { if (mainPanel.current) mainPanel.current.scrollTop = 0; }, [location.pathname]);
  useEffect(() => {
    let active = true;
    if (!/^[1-9]\d*$/.test(eventId)) return;
    Promise.all([invitationService.get(eventId), invitationService.listMine()])
      .then(([event, events]) => {
        if (!event || String(event.id) !== eventId) throw new Error("Invalid event response");
        const eventList = Array.isArray(events) ? events : [];
        const summary = eventList.find(item => String(item.id) === eventId);
        if (active) setState({ loading: false, event: { ...event, coverUrl: summary?.coverUrl || null, coverSource: summary?.coverSource, invitationCoverUrl: summary?.invitationCoverUrl, templateThumbnailUrl: summary?.templateThumbnailUrl || event.templateThumbnailUrl }, events: eventList, error: "" });
      })
      .catch(error => { if (active) setState({ loading: false, event: null, events: [], error: error.message }); });
    return () => { active = false; };
  }, [eventId, retry]);

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


  const status = eventStatus(state.event, en);
  const activeItem = ALL_EVENT_LINKS.find(item => item.path === currentModule);
  const activeModuleLabel = activeItem?.[en ? "en" : "km"] || (en ? "Dashboard" : "ផ្ទាំងគ្រប់គ្រង");
  const events = state.events.some(item => String(item.id) === eventId) ? state.events : [state.event, ...state.events];
  const switchEvent = id => {
    if (events.some(item => String(item.id) === id)) navigate(eventPath(id, EVENT_MODULES.includes(currentModule) ? currentModule : ""));
  };
  const closeNavigation = () => {
    setMobileDrawerOpen(false);
    requestAnimationFrame(() => menuTrigger.current?.focus({ preventScroll: true }));
  };
  const navProps = { event: state.event, events, eventId, currentModule, en,
    collapsed: navigation.collapsed, groups: navigation.groups,
    onToggleGroup: navigation.toggleGroup, onToggleCollapsed: navigation.toggleCollapsed,
    onExpand: navigation.expand, onSwitch: switchEvent, onNavigate: () => setMobileDrawerOpen(false),
  };

  return <EventContext.Provider value={{ eventId, event: state.event, events: state.events,
    updateEvent: event => setState(current => ({ ...current, event: { ...current.event, ...event } })),
    openNavigation: () => setMobileDrawerOpen(true), navigationOpen: mobileDrawerOpen,
    registerNavigationTrigger,
  }}>
    <section className={`event-workspace${navigation.collapsed ? " is-collapsed" : ""}${navigation.manual ? " has-nav-preference" : ""}${focusedStudio ? " is-studio" : ""}`} aria-label={en ? "Event workspace" : "គ្រប់គ្រងកម្មវិធី"}>
      {!focusedStudio && <a className="event-skip-link" href="#event-module-content">{en ? "Skip to event content" : "ទៅមាតិកាកម្មវិធី"}</a>}
      {!overlay && <aside className="event-workspace-sidebar"><EventNavigation {...navProps} /></aside>}
      <div className="event-workspace-main" ref={mainPanel}>
        {focusedStudio ? <div id="invitation-studio-toolbar" className="studio-toolbar-mount" /> : <header className="event-workspace-header">
          <button type="button" ref={menuTrigger} className="event-mobile-nav-toggle" onClick={() => setMobileDrawerOpen(true)}
            aria-label={en ? "Toggle modules menu" : "បើកម៉ឺនុយមុខងារ"} aria-expanded={mobileDrawerOpen} aria-haspopup="dialog" aria-controls={mobileDrawerOpen ? "event-module-navigation" : undefined}>
            <Menu size={20} aria-hidden="true" /><span className="sr-only">{activeModuleLabel}</span>
          </button>
          <div className="event-header-identity"><p className="event-workspace-title">{state.event.title}</p><span className={`event-status-pill badge-${status.tone}`}>{status.label}</span></div>
        </header>}
        <div className="event-workspace-content" id="event-module-content" tabIndex={-1}><Outlet /></div>
      </div>
    </section>
    <Modal isOpen={overlay && mobileDrawerOpen} onClose={closeNavigation} showHeader={false}
      ariaLabel={en ? "Event navigation" : "មុខងារកម្មវិធី"} className="workspace-dialog event-navigation-dialog" backdropClassName="event-navigation-backdrop">
      <EventNavigation {...navProps} overlay onClose={closeNavigation} />
    </Modal>
  </EventContext.Provider>;
}

export default function EventWorkspace() {
  const { eventId } = useParams();
  const { user } = useAuth();
  return <VerifiedWorkspace key={`${user?.id}:${eventId}`} eventId={eventId} />;
}
