import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import AdminDialog from "./AdminDialog";
import { adminNavigation, filterAdminNavigation } from "./adminNavigation";
import BrandLogo from "../../shared/branding/BrandLogo";

export default function AdminSidebar({ isMobileOpen, onNavigate }) {
  const { lang } = useAdminLanguage();
  const en = lang === "en";
  const items = adminNavigation(lang);
  const [query, setQuery] = useState("");
  const mobileItems = filterAdminNavigation(items, query);
  return <>
    <aside className="admin-dock" aria-label={en ? "Admin sidebar" : "របាររដ្ឋបាល"}>
      <nav aria-label={en ? "Admin navigation" : "ម៉ឺនុយរដ្ឋបាល"}>
        {items.map(({ to, icon: Icon, label, exact }) => <div className="admin-dock-item" key={to}><NavLink to={to} end={exact} aria-label={label} onClick={onNavigate}><Icon size={19} aria-hidden="true" /></NavLink><span className="admin-dock-tooltip" aria-hidden="true">{label}</span></div>)}
      </nav>
    </aside>
    {isMobileOpen && <AdminDialog id="admin-mobile-navigation" label={en ? "Admin navigation" : "ម៉ឺនុយរដ្ឋបាល"} className="admin-navigation-dialog" onClose={onNavigate}>
      <div className="admin-navigation-panel">
        <div className="admin-dialog-heading"><div className="admin-drawer-brand"><BrandLogo variant="compact" priority /></div><button type="button" className="admin-icon-button" onClick={onNavigate} aria-label={en ? "Close navigation" : "បិទម៉ឺនុយ"}><X size={21} aria-hidden="true" /></button></div>
        <label className="admin-search-label" htmlFor="admin-mobile-page-search">{en ? "Find a page" : "ស្វែងរកទំព័រ"}</label>
        <div className="admin-search-field"><Search size={18} aria-hidden="true" /><input id="admin-mobile-page-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={en ? "Page name" : "ឈ្មោះទំព័រ"} /></div>
        <nav className="admin-mobile-links" aria-label={en ? "Workspace pages" : "ទំព័រកន្លែងធ្វើការ"}>
          {mobileItems.map(({ to, icon: Icon, label, exact }) => <NavLink key={to} to={to} end={exact} onClick={onNavigate}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}
          {!mobileItems.length && <p className="admin-search-empty" role="status">{en ? "No pages found. Try a different page name." : "រកមិនឃើញទំព័រ។ សូមសាកឈ្មោះទំព័រផ្សេងទៀត។"}</p>}
        </nav>
      </div>
    </AdminDialog>}
  </>;
}
