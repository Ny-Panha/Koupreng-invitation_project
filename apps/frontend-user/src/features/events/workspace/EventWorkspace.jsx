import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { EventContext } from "./EventContext";
import { EVENT_MODULES, eventPath } from "./eventRoutes";
import "./EventWorkspace.css";

const MODULE_LABELS = [
  ["", "ទិដ្ឋភាពទូទៅ", "Overview"], ["invitation", "សំបុត្រអញ្ជើញ", "Invitation"],
  ["guests", "បញ្ជីភ្ញៀវ", "Guests"], ["rsvp", "ការឆ្លើយតប", "RSVP"],
  ["gifts", "ចំណងដៃ", "Gifts"], ["budget", "គម្រោងថវិកា", "Budget"],
  ["seating", "រៀបចំកន្លែងអង្គុយ", "Seating"], ["check-in", "វត្តមាន", "Check-in"],
  ["reports", "របាយការណ៍", "Reports"], ["delivery", "ការផ្ញើ", "Delivery"],
  ["media", "រូបភាព", "Media"], ["qr", "កូដ QR", "QR"], ["wishes", "សារជូនពរ", "Wishes"],
  ["settings", "ការកំណត់", "Settings"],
];

function VerifiedWorkspace({ eventId }) {
  const [state, setState] = useState({ loading: true, event: null, events: [], error: "" });
  const [retry, setRetry] = useState(0);
  const en = useLanguageStore(s => s.lang) === "en";
  const location = useLocation();
  const navigate = useNavigate();
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

  if (!/^[1-9]\d*$/.test(eventId)) return <div className="event-workspace" role="alert">{en ? "Choose a synchronized event to manage it." : "សូមជ្រើសរើសកម្មវិធីដែលបានរក្សាទុកលើម៉ាស៊ីនមេ។"}<Link to="/app/events">{en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}</Link></div>;
  if (state.loading) return <p className="event-workspace" role="status">{en ? "Loading event…" : "កំពុងទាញយកកម្មវិធី…"}</p>;
  if (state.error) return <div className="event-workspace" role="alert"><p>{state.error}</p><button onClick={() => setRetry(n => n + 1)}>{en ? "Try again" : "ព្យាយាមម្ដងទៀត"}</button> <Link to="/app/events">{en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}</Link></div>;
  const module = location.pathname.slice(eventPath(eventId).length).split("/")[1] || "";
  return <EventContext.Provider value={{ eventId, event: state.event, events: state.events,
    updateEvent: event => setState(current => ({ ...current, event })) }}>
    <section className="event-workspace" aria-label={en ? "Event workspace" : "គ្រប់គ្រងកម្មវិធី"}>
      <header className="event-workspace-header">
        <div><Link to="/app/events">← {en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}</Link><h1>{state.event.title}</h1><p>{state.event.eventDate} · {state.event.venueName} · {state.event.status}</p></div>
        <label>{en ? "Switch event" : "ប្ដូរកម្មវិធី"}<select value={eventId} onChange={e => navigate(eventPath(e.target.value, EVENT_MODULES.includes(module) ? module : ""))}>
          {state.events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}
        </select></label>
      </header>
      <nav className="event-workspace-nav" aria-label={en ? "Event navigation" : "មុខងារកម្មវិធី"}>
        {MODULE_LABELS.map(([path, kh, english]) => <NavLink key={path} end to={eventPath(eventId, path)}>{en ? english : kh}</NavLink>)}
      </nav>
    </section>
    <Outlet />
  </EventContext.Provider>;
}

export default function EventWorkspace() {
  const { eventId } = useParams();
  const { user } = useAuth();
  return <VerifiedWorkspace key={`${user?.id}:${eventId}`} eventId={eventId} />;
}
