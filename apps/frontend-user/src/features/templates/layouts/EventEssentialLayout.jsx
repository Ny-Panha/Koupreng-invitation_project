import IllustratedMap from '../shared/IllustratedMap';
import SaveTheDate from '../shared/SaveTheDate';
import ProgramTimeline from '../shared/ProgramTimeline';
import InvitationBranding from '../shared/InvitationBranding';
import { formatEventTime } from '../shared/eventDateTime';
import { Link } from "react-router-dom";
import { normalizeInvitationLanguage } from "@/shared/i18n/invitationLanguage";
import { EVENT_TYPES } from "@/features/events/onboarding/eventFields";
import "@/features/events/workspace/EventWorkspace.css";

export default function EventEssentialLayout({ tpl = {}, preview = false, backLink = "/templates", showBreadcrumb = true, showActions = true, children }) {
  const language = normalizeInvitationLanguage(tpl.languageMode || "KH");
  const copy = (kh, en) => language === "kh" || language === "km" ? kh : language === "both" ? `${kh} / ${en}` : en;
  const isEnglish = language === "en";
  const type = EVENT_TYPES.find(row => row[0] === tpl.eventType) || EVENT_TYPES.at(-1);
  const names = [tpl.hostName || tpl.groom, tpl.partnerName || tpl.bride].filter(Boolean).join(" & ");
  const isRedundantHeading = Boolean(
    names &&
    tpl.title &&
    names.trim().toLowerCase() === tpl.title.trim().toLowerCase()
  );
  const displayTime = tpl.eventTime ? formatEventTime(tpl.eventTime, isEnglish, isEnglish ? 'latin' : 'khmer') : "";
  const details = tpl.hostContent || tpl;
  const cover = details.couplePhoto || details.coverImage || tpl.coverImage || "";
  const focal = details.coverFocalPoint || tpl.coverFocalPoint || "center";
  const objectPosition = focal === "top" ? "50% 15%" : focal === "bottom" ? "50% 85%" : "50% 50%";
  return <main className="event-wizard" style={{ minHeight: "100vh", background: "#faf6ee", textAlign: "center", paddingTop: "clamp(32px,8vw,100px)" }}>
    {!preview && showBreadcrumb && <Link to={backLink}>← {copy("ត្រឡប់", "Back")}</Link>}
    <article className="event-wizard-card" style={{ padding: "clamp(24px,6vw,64px)", overflowWrap: "anywhere" }}>
      {cover && !String(cover).endsWith('.svg') && (
        <div style={{ maxWidth: "440px", margin: "0 auto 1.5rem", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", border: "1px solid rgba(195, 162, 107, 0.4)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
          <img src={cover} alt={tpl.title || "Event cover"} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition }} loading="eager" />
        </div>
      )}
      <p>{copy(type[1], type[2])}</p><h1>{tpl.title || copy("សូមអញ្ជើញចូលរួម", "You are invited")}</h1>
      {names && !isRedundantHeading && <h2>{names}</h2>}
      <p>{copy("សូមអញ្ជើញចូលរួមកម្មវិធីរបស់យើង", "Please join us for our event")}</p>
      <p><time dateTime={tpl.eventDate || undefined}>{tpl.eventDate || tpl.dateText || ""}</time>{displayTime ? ` ${displayTime}` : tpl.eventTime ? ` ${tpl.eventTime}` : ""}</p>
      <IllustratedMap content={{ ...tpl, ...details }} />
      {tpl.venueName && <h2>{tpl.venueName}</h2>}<p>{tpl.venueAddress || ""}</p>
      {(details.messageText || tpl.message) && <p>{details.messageText || tpl.message}</p>}
      {details.saveTheDate && details.saveTheDate.enabled !== false && details.enabledSections?.countdown !== false && <SaveTheDate content={{ ...tpl, ...details }} english={language === "en"} />}
      {details.showSchedule !== false && details.enabledSections?.schedule !== false && details.schedule?.length > 0 && <section><h2>{copy("កាលវិភាគ", "Schedule")}</h2>{(details.programDays || details.invitationStyleV1?.program) ? <ProgramTimeline content={{ ...tpl, ...details }} english={language === "en"} /> : details.schedule.map((item, index) => <p key={item.id || index}>{item.time} · {item.title}</p>)}</section>}
      {(details.contact?.name || details.contact?.phone || details.contact?.email) && <section><h2>{copy("ទំនាក់ទំនង", "Contact")}</h2><p>{[details.contact.name, details.contact.phone, details.contact.email].filter(Boolean).join(" · ")}</p></section>}
      {children}
      {showActions && !preview && <Link to="/app/events/new">{copy("បង្កើតកម្មវិធី", "Create event")}</Link>}
      <InvitationBranding content={{ ...tpl, ...details }} language={language} />
    </article>
  </main>;
}
