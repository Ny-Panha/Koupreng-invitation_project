import { Palette, Users, Mail, Images, Timer, CalendarDays, MapPin, BookOpen, Shirt, CircleHelp, QrCode, Heart, Languages, Music, Ticket, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useEventWorkspace } from "../../events/workspace/EventContext";

const GROUPS = [
  { labels: ["មាតិកា", "Content"], keys: ["eventInfo", "family", "invitation", "schedule", "venue", "story", "closing"], icons: [CalendarDays, Users, Mail, CalendarDays, MapPin, BookOpen, Heart] },
  { labels: ["រចនា", "Appearance"], keys: ["cover", "appearance", "couplePhoto", "gallery"], icons: [Palette, Palette, Images, Images] },
  { labels: ["បទពិសោធន៍ភ្ញៀវ", "Experience"], keys: ["music", "countdown", "dressCode", "party", "faq", "khqr", "languageMode"], icons: [Music, Timer, Shirt, Users, CircleHelp, QrCode, Languages] },
];
const STUDIO_SECTIONS = {
  eventInfo: ["ព័ត៌មានកម្មវិធី", "Event information"], appearance: ["ពណ៌ និងអក្សរ", "Colors & typography"], music: ["តន្ត្រី", "Music"],
  cover: ["ក្រប និងរចនា", "Cover & design"], family: ["មាតាបិតា", "Families"],
  invitation: ["សារអញ្ជើញ", "Invitation message"], couplePhoto: ["រូបគូស្វាមីភរិយា", "Couple photos"],
  countdown: ["កំណត់ថ្ងៃ និងប្រតិទិន", "Save the date & calendar"], schedule: ["កាលវិភាគ", "Schedule"],
  venue: ["ទីតាំង", "Venue & map"], gallery: ["វិចិត្រសាល", "Gallery"],
  story: ["រឿងរ៉ាវ", "Our story"], dressCode: ["សម្លៀកបំពាក់", "Dress code"],
  party: ["ក្រុមអម", "Wedding party"], faq: ["សំណួរ និងចម្លើយ", "Guest notes"],
  khqr: ["ចំណងដៃ KHQR", "Gift KHQR"], closing: ["សារបញ្ចប់", "Closing messages"],
  languageMode: ["ភាសា", "Language"],
};

export default function StudioSections({ sections, active, onChange, english }) {
  const workspace = useEventWorkspace();
  const label = key => STUDIO_SECTIONS[key]?.[english ? 1 : 0] || key;
  return <nav className="studio-sections" aria-label={english ? "Invitation sections" : "ផ្នែកធៀបការ"}>
    <label className="studio-section-select">{english ? "Edit section" : "កែសម្រួលផ្នែក"}
      <select value={active} onChange={event => onChange(event.target.value)}>
        {sections.map(key => <option key={key} value={key}>{label(key)}</option>)}
      </select>
    </label>
    {!sections.includes("story") && <p className="studio-capability-note">{english ? "This template has no Love Story layout. Saved stories are kept when switching templates." : "គំរូនេះមិនបង្ហាញរឿងរ៉ាវស្នេហាទេ។ មាតិកាដែលរក្សាទុកនៅតែមានពេលប្ដូរគំរូ។"}</p>}
    <div className="studio-section-list">
      {GROUPS.map(group => {
        const visible = group.keys.filter(key => sections.includes(key));
        return visible.length > 0 && <div className="studio-section-group" key={group.labels[1]}><p>{group.labels[english ? 1 : 0]}</p>
          {visible.map(key => { const Icon = group.icons[group.keys.indexOf(key)]; return <button type="button" key={key} aria-current={active === key ? "step" : undefined}
            onClick={() => onChange(key)}><Icon size={18} aria-hidden="true" />{label(key)}</button>; })}
        </div>;
      })}
      {workspace?.eventId && <div className="studio-section-group"><p>{english ? "Tickets" : "កាតអញ្ជើញ"}</p>
        <Link to={`/app/events/${workspace.eventId}/tickets/design`}><Ticket size={18} aria-hidden="true" />{english ? "Ticket design" : "រចនាកាត"}</Link>
        <Link to={`/app/events/${workspace.eventId}/guests`}><Eye size={18} aria-hidden="true" />{english ? "Guest tickets" : "កាតភ្ញៀវ"}</Link>
      </div>}
    </div>
  </nav>;
}
