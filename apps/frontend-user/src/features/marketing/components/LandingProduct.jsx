import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Link2, ArrowUpRight, UsersRound } from "lucide-react";

// Same guestName / responseStatus / attendeeCount fields as RsvpGuestTable.
// This bounded fixture never calls a guest endpoint or represents customer metrics.
const sampleGuests = [
  { id: "demo-1", guestName: "ដារ៉ា", guestNameEn: "Dara", responseStatus: "ATTENDING", attendeeCount: 2 },
  { id: "demo-2", guestName: "ស្រីនិត", guestNameEn: "Sreynit", responseStatus: "PENDING", attendeeCount: 1 },
  { id: "demo-3", guestName: "វិសាល", guestNameEn: "Visal", responseStatus: "DECLINED", attendeeCount: 2 },
];

export default function LandingProduct({ copy, lang }) {
  const [filter, setFilter] = useState("ALL");
  const statuses = {
    ATTENDING: copy("ចូលរួម", "Attending"), PENDING: copy("រង់ចាំ", "Pending"), DECLINED: copy("មិនចូលរួម", "Declined"),
  };
  return <section className="kp-product kp-section" aria-labelledby="kp-product-title">
    <div className="kp-product-copy"><p className="kp-eyebrow">{copy("សម្រាប់ការរៀបចំថ្ងៃពិសេស", "Made for the whole celebration")}</p><h2 id="kp-product-title">{copy("សន្លឹកការ និងភ្ញៀវ\nនៅកន្លែងតែមួយ។", "Your invitation.\nYour guests. Together.")}</h2><p className="kp-section-lead">{copy("រៀបចំព័ត៌មានពិធី ចែករំលែកតំណភ្ជាប់ និងតាមដានការឆ្លើយតបភ្ញៀវក្នុងគណនីរបស់អ្នក។", "Create your event details, share guest links and follow their RSVP replies in your account.")}</p>
      <ul className="kp-product-points"><li><Link2 size={20} aria-hidden="true" /><div><strong>{copy("ការអញ្ជើញផ្ទាល់ខ្លួន", "A personal invitation")}</strong><p>{copy("ព័ត៌មានគ្រួសារ កម្មវិធី និងទីតាំង សម្រាប់ភ្ញៀវរបស់អ្នក។", "Family details, a celebration program and directions for your guests.")}</p></div></li><li><Check size={20} aria-hidden="true" /><div><strong>{copy("ដឹងថាអ្នកណានឹងចូលរួម", "Know who is coming")}</strong><p>{copy("មើលចម្លើយ និងចំនួនអ្នកចូលរួម ដើម្បីត្រៀមទទួលភ្ញៀវ។", "Review responses and party sizes as you prepare for the day.")}</p></div></li></ul>
      <Link to="/templates/browse" className="kp-text-link">{copy("ចាប់ផ្តើមបង្កើត", "Start creating")}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
    <div className="kp-guest-demo" role="group" aria-label={copy("គំរូការគ្រប់គ្រងចម្លើយភ្ញៀវ", "Guest response management demo")}>
      <div className="kp-guest-demo-bar"><span><UsersRound size={19} aria-hidden="true" />{copy("ចម្លើយភ្ញៀវ", "Guest replies")}</span><span className="kp-demo-label">{copy("គំរូបង្ហាញ", "Demo")}</span></div>
      <div className="kp-guest-demo-content"><h3>{copy("រៀបចំបញ្ជីភ្ញៀវរបស់អ្នក", "Keep your guest list in view")}</h3><p>{copy("ឈ្មោះ និងចម្លើយខាងក្រោមគឺជាទិន្នន័យគំរូ។", "The names and responses below are sample data.")}</p>
        <div className="kp-demo-filters" role="group" aria-label={copy("សាកមើលចម្លើយគំរូ", "Filter sample replies")}>
          {[["ALL", copy("ទាំងអស់", "All replies")], ["ATTENDING", statuses.ATTENDING], ["PENDING", statuses.PENDING]].map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <table><caption className="sr-only">{copy("ទិន្នន័យគំរូនៃចម្លើយភ្ញៀវ", "Illustrative guest response data")}</caption><thead><tr><th scope="col">{copy("ភ្ញៀវ", "Guest")}</th><th scope="col">{copy("ស្ថានភាព", "Response")}</th><th scope="col">{copy("ចំនួន", "Party")}</th></tr></thead><tbody>{sampleGuests.filter(guest => filter === "ALL" || guest.responseStatus === filter).map(guest => <tr key={guest.id}><th scope="row">{lang === "en" ? guest.guestNameEn : guest.guestName}</th><td><span className={`kp-demo-status kp-demo-status--${guest.responseStatus.toLowerCase()}`}>{statuses[guest.responseStatus]}</span></td><td>{guest.attendeeCount}</td></tr>)}</tbody></table>
      </div><p className="kp-guest-demo-note">{copy("ភ្ញៀវឆ្លើយតបនៅលើសន្លឹកការដែលបានផ្សព្វផ្សាយ។ នេះជាគំរូបង្ហាញមុខងារ។", "Guests respond on the published invitation. This is a demonstration of the workflow.")}</p>
    </div>
  </section>;
}
