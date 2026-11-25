import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "../../../shared/ui/AdminUI";

export default function ConversionHealthBox({ analytics = {}, lang = "km", loading = false }) {
  const en = lang === "en";
  const unavailable = en ? "Unavailable" : "មិនទាន់មាន";
  const entries = [
    ["rsvp", en ? "RSVP records" : "កំណត់ត្រា RSVP", analytics.rsvp?.summary?.totalRsvps],
    ["rsvp", en ? "Attending RSVPs" : "RSVP ចូលរួម", analytics.rsvp?.summary?.attending],
    ["checkIn", en ? "Active check-ins" : "កំណត់ត្រាវត្តមានសកម្ម", analytics.checkIn?.summary?.checkedIn],
    ["delivery", en ? "Marked as sent" : "កំណត់ត្រាបានផ្ញើ", analytics.delivery?.summary?.sent],
    ["delivery", en ? "Recorded opens" : "កំណត់ត្រាបានបើក", analytics.delivery?.summary?.opened],
  ];
  const status = analytics.health?.summary?.status;
  const pending = loading && (entries.some(([key]) => analytics[key] === undefined) || analytics.health === undefined);

  return (
    <section className="dashboard-panel dashboard-operations" aria-labelledby="dashboard-operations-title">
      <div className="dashboard-panel-header">
        <div>
          <h2 id="dashboard-operations-title">{en ? "Operations" : "ប្រតិបត្តិការ"}</h2>
          <p>{en ? "Attendance and delivery records." : "កំណត់ត្រាវត្តមាន និងការផ្ញើ។"}</p>
        </div>
      </div>
      {pending && <p className="dashboard-loading-note" role="status">{en ? "Loading operations…" : "កំពុងផ្ទុកប្រតិបត្តិការ…"}</p>}
      <dl className="dashboard-operation-list">
        {entries.map(([key, label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{loading && analytics[key] === undefined ? "—" : typeof value === "number" ? value.toLocaleString("en-US") : value ?? unavailable}</dd></div>
        ))}
        <div><dt>{en ? "Operational alert status" : "ស្ថានភាពការជូនដំណឹង"}</dt><dd>{status
          ? <StatusBadge status={status} tone={status === "WARN" ? "amber" : undefined} />
          : loading && analytics.health === undefined ? "—" : unavailable}</dd></div>
      </dl>
      <details className="dashboard-details">
        <summary>{en ? "How records are counted" : "របៀបរាប់កំណត់ត្រា"}</summary>
        <p>{en ? "Current server snapshots, not individual arrival counts. Send/open flags do not verify delivery. Alert status summarizes recorded failures; uptime and bank connectivity are not measured here." : "ស្ថានភាពបច្ចុប្បន្នពីម៉ាស៊ីនមេ មិនមែនចំនួនមនុស្សមកដល់។ ស្ថានភាពផ្ញើ/បើក មិនបញ្ជាក់ការទទួលទេ។ ការជូនដំណឹងផ្អែកលើកំហុសដែលកត់ត្រា មិនវាស់ពេលដំណើរការ ឬការភ្ជាប់ធនាគារ។"}</p>
      </details>
      <Link to="/system-logs" className="dashboard-text-link dashboard-panel-footer">{en ? "View system logs" : "មើលកំណត់ហេតុប្រព័ន្ធ"}<ArrowUpRight size={16} aria-hidden="true" /></Link>
    </section>
  );
}
