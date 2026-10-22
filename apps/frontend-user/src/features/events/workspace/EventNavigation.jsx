import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, CalendarDays, ChevronDown, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { EVENT_TYPES } from "../onboarding/eventFields";
import { PRIMARY_EVENT_LINKS, EVENT_LINK_GROUPS, eventStatus } from "./eventNavigationModel";
import { eventPath } from "./eventRoutes";

export default function EventNavigation({ event, events, eventId, currentModule, en, collapsed, groups, onToggleGroup, onToggleCollapsed, onExpand, onSwitch, onNavigate, onClose, overlay = false }) {
  const bodyRef = useRef(null);
  const navRef = useRef(null);
  const tooltipId = useId();
  const [tooltip, setTooltip] = useState(null);
  const status = eventStatus(event, en);
  const language = en ? "en" : "km";
  const type = EVENT_TYPES.find(item => item[0] === event.eventType)?.[en ? 2 : 1] || event.eventType;
  const rail = collapsed && !overlay;

  useEffect(() => {
    const active = navRef.current?.querySelector('[aria-current="page"]');
    const body = bodyRef.current;
    if (!active || !body) return;
    const frame = requestAnimationFrame(() => {
      // Scroll only the menu body, never the document or the active task.
      const itemBox = active.getBoundingClientRect(), bodyBox = body.getBoundingClientRect();
      if (itemBox.top < bodyBox.top) body.scrollTop -= bodyBox.top - itemBox.top + 8;
      else if (itemBox.bottom > bodyBox.bottom) body.scrollTop += itemBox.bottom - bodyBox.bottom + 8;
      if (overlay) active.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentModule, overlay, rail]);

  const showTooltip = (element, text, path) => {
    if (!rail) return;
    const box = element.getBoundingClientRect();
    setTooltip({ text, path, left: box.right + 12, top: Math.max(8, Math.min(box.top, window.innerHeight - 60)) });
  };
  const renderLink = ({ path, en: english, km, Icon }) => {
    const label = en ? english : km;
    return <NavLink key={path} end to={eventPath(eventId, path)}
      className={({ isActive }) => `event-nav-tab${isActive ? " active" : ""}`}
      aria-label={label} aria-describedby={rail && tooltip?.path === path ? tooltipId : undefined}
      onClick={() => { setTooltip(null); onNavigate?.(); }}
      onFocus={e => showTooltip(e.currentTarget, label, path)} onBlur={() => setTooltip(null)}
      onMouseEnter={e => showTooltip(e.currentTarget, label, path)} onMouseLeave={() => setTooltip(null)}
      onKeyDown={e => { if (e.key === "Escape") setTooltip(null); }}>
      <Icon size={20} strokeWidth={1.75} className="event-nav-tab-icon" aria-hidden="true" />
      <span className="event-nav-tab-text">{label}</span>
    </NavLink>;
  };

  return <>
    <div className="event-navigation-header">
      {rail ? <button type="button" className="event-context-icon" onClick={onExpand} aria-label={en ? `Switch event: ${event.title}` : `ប្ដូរកម្មវិធី៖ ${event.title}`} title={event.title}><CalendarDays size={22} aria-hidden="true" /></button> : <>
        <div className="event-context-eyebrow"><CalendarDays size={18} aria-hidden="true" /><span>{en ? "Event workspace" : "គ្រប់គ្រងកម្មវិធី"}</span>{overlay && <button type="button" className="event-navigation-close" onClick={onClose} aria-label={en ? "Close event navigation" : "បិទម៉ឺនុយកម្មវិធី"}><X size={20} aria-hidden="true" /></button>}</div>
        <label className="event-switcher-label"><span className="sr-only">{en ? "Switch event" : "ប្ដូរកម្មវិធី"}</span><span className="event-switcher-select-wrap">
          <select className="event-switcher-select" value={eventId} aria-label={en ? "Switch event" : "ប្ដូរកម្មវិធី"} title={event.title} onChange={e => onSwitch(e.target.value)}>
            {events.map(item => <option key={item.id} value={item.id}>{String(item.id) === eventId ? event.title : item.title}</option>)}
          </select><ChevronDown size={16} className="event-switcher-arrow" aria-hidden="true" />
        </span></label>
        <div className="event-context-details"><span>{type}</span><span className={`event-status-pill badge-${status.tone}`}>{status.label}</span></div>
      </>}
    </div>
    <div className="event-navigation-body" ref={bodyRef}>
      <nav id="event-module-navigation" ref={navRef} className="event-workspace-nav" aria-label={en ? "Event navigation" : "មុខងារកម្មវិធី"}>
        <div className="event-primary-links">{PRIMARY_EVENT_LINKS.map(renderLink)}</div>
        {EVENT_LINK_GROUPS.map(group => {
          const active = group.items.some(item => item.path === currentModule);
          const open = active || groups[group.key];
          return <div className={`event-nav-group${active ? " contains-active" : ""}`} key={group.key}>
            <button type="button" className="event-nav-group-toggle" aria-expanded={open} aria-controls={`event-group-${group.key}`}
              aria-disabled={active || undefined} title={active ? (en ? "The current section stays open" : "ផ្នែកបច្ចុប្បន្នបើកជានិច្ច") : undefined}
              onClick={() => { if (!active) onToggleGroup(group.key); }}>
              <span>{group[language]}</span><ChevronDown size={16} aria-hidden="true" />
            </button>
            <div className="event-nav-group-items" id={`event-group-${group.key}`} hidden={!open && !rail}>{group.items.map(renderLink)}</div>
          </div>;
        })}
      </nav>
    </div>
    <footer className="event-navigation-footer">
      <Link to="/app/events" className="event-utility-link" aria-label={en ? "Back to My Events" : "ត្រឡប់ទៅកម្មវិធីរបស់ខ្ញុំ"} title={en ? "Back to My Events" : "ត្រឡប់ទៅកម្មវិធីរបស់ខ្ញុំ"} onClick={onNavigate}><ArrowLeft size={19} aria-hidden="true" /><span>{en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}</span></Link>
      {!overlay && <button type="button" className="event-sidebar-toggle" aria-expanded={!collapsed} aria-controls="event-module-navigation" onClick={onToggleCollapsed} aria-label={en ? (collapsed ? "Expand navigation" : "Collapse navigation") : (collapsed ? "ពង្រីកម៉ឺនុយ" : "បង្រួមម៉ឺនុយ")}>
        {collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}<span>{en ? "Collapse" : "បង្រួមម៉ឺនុយ"}</span>
      </button>}
    </footer>
    {rail && tooltip && createPortal(<div id={tooltipId} role="tooltip" className="event-nav-tooltip" style={{left:tooltip.left,top:tooltip.top}}>{tooltip.text}</div>,document.body)}
  </>;
}
