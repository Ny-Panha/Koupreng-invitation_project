import { useId, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import AdminDialog from "./AdminDialog";
import { adminNavigation, filterAdminNavigation } from "./adminNavigation";

export default function AdminNavigationSearch({ onClose }) {
  const { lang } = useAdminLanguage();
  const en = lang === "en";
  const inputId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const items = filterAdminNavigation(adminNavigation(lang), query);
  return (
    <AdminDialog label={en ? "Find an admin page" : "ស្វែងរកទំព័ររដ្ឋបាល"} className="admin-search-dialog" onClose={onClose} initialFocusRef={inputRef}>
      <div className="admin-dialog-panel">
        <div className="admin-dialog-heading">
          <div><h2>{en ? "Where would you like to go?" : "តើអ្នកចង់ទៅទំព័រណា?"}</h2><p>{en ? "Find a page in your workspace." : "ស្វែងរកទំព័រនៅក្នុងកន្លែងធ្វើការរបស់អ្នក។"}</p></div>
          <button type="button" className="admin-icon-button" onClick={onClose} aria-label={en ? "Close search" : "បិទការស្វែងរក"}><X aria-hidden="true" size={20} /></button>
        </div>
        <label className="admin-search-label" htmlFor={inputId}>{en ? "Page name" : "ឈ្មោះទំព័រ"}</label>
        <div className="admin-search-field"><Search size={18} aria-hidden="true" /><input ref={inputRef} id={inputId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={en ? "Try templates or payments" : "គំរូ ឬការទូទាត់"} autoComplete="off" /></div>
        <nav className="admin-search-results" aria-label={en ? "Matching pages" : "ទំព័រដែលត្រូវគ្នា"}>
          {items.map(({ to, icon: Icon, label, exact }) => <NavLink key={to} to={to} end={exact} onClick={onClose}><Icon size={19} aria-hidden="true" /><span>{label}</span><ArrowUpRight size={16} aria-hidden="true" /></NavLink>)}
        </nav>
        {!items.length && <p className="admin-search-empty" role="status">{en ? "No pages found. Try a different page name." : "រកមិនឃើញទំព័រ។ សូមសាកឈ្មោះទំព័រផ្សេងទៀត។"}</p>}
      </div>
    </AdminDialog>
  );
}
