import IllustratedMap from '../shared/IllustratedMap';
import SaveTheDate from '../shared/SaveTheDate';
import ProgramTimeline from '../shared/ProgramTimeline';
import { Link } from "react-router-dom";
import { normalizeInvitationLanguage } from "@/shared/i18n/invitationLanguage";
import { EVENT_TYPES } from "@/features/events/onboarding/eventFields";
import "@/features/events/workspace/EventWorkspace.css";

export default function EventEssentialLayout({ tpl = {}, preview = false, backLink = "/templates", showBreadcrumb = true, showActions = true, children }) {
  const language = normalizeInvitationLanguage(tpl.languageMode || "KH");
  const copy = (kh, en) => language === "kh" || language === "km" ? kh : language === "both" ? `${kh} / ${en}` : en;
  const type = EVENT_TYPES.find(row => row[0] === tpl.eventType) || EVENT_TYPES.at(-1);
  const names = [tpl.hostName || tpl.groom, tpl.partnerName || tpl.bride].filter(Boolean).join(" & ");
  const details = tpl.hostContent || tpl;
  return <main className="event-wizard" style={{ minHeight: "100vh", background: "#faf6ee", textAlign: "center", paddingTop: "clamp(32px,8vw,100px)" }}>
    {!preview && showBreadcrumb && <Link to={backLink}>← {copy("ត្រឡប់", "Back")}</Link>}
    <article className="event-wizard-card" style={{ padding: "clamp(24px,6vw,64px)", overflowWrap: "anywhere" }}>
      <p>{copy(type[1], type[2])}</p><h1>{tpl.title || copy("សូមអញ្ជើញចូលរួម", "You are invited")}</h1>
      {names && <h2>{names}</h2>}
      <p>{copy("សូមអញ្ជើញចូលរួមកម្មវិធីរបស់យើង", "Please join us for our event")}</p>
      <p><time dateTime={tpl.eventDate || undefined}>{tpl.eventDate || tpl.dateText || ""}</time> {tpl.eventTime || ""}</p>
      <IllustratedMap content={{ ...tpl, ...details }} />
      {tpl.venueName && <h2>{tpl.venueName}</h2>}<p>{tpl.venueAddress || ""}</p>
      {(details.messageText || tpl.message) && <p>{details.messageText || tpl.message}</p>}
      {details.saveTheDate && details.saveTheDate.enabled !== false && details.enabledSections?.countdown !== false && <SaveTheDate content={{ ...tpl, ...details }} english={language === "en"} />}
      {details.showSchedule !== false && details.enabledSections?.schedule !== false && details.schedule?.length > 0 && <section><h2>{copy("កាលវិភាគ", "Schedule")}</h2>{details.programDays ? <ProgramTimeline content={{ ...tpl, ...details }} english={language === "en"} /> : details.schedule.map((item, index) => <p key={item.id || index}>{item.time} · {item.title}</p>)}</section>}
      {(details.contact?.name || details.contact?.phone || details.contact?.email) && <section><h2>{copy("ទំនាក់ទំនង", "Contact")}</h2><p>{[details.contact.name, details.contact.phone, details.contact.email].filter(Boolean).join(" · ")}</p></section>}
      {children}
      {showActions && !preview && <Link to="/app/events/new">{copy("បង្កើតកម្មវិធី", "Create event")}</Link>}
    </article>
  </main>;
}
