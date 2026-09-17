import { NavLink } from "react-router-dom";

const links = [
    { to: "/dashboard", label: "ផ្ទាំងគ្រប់គ្រង", icon: "📊" },
    { to: "/users", label: "អ្នកប្រើប្រាស់", icon: "👥" },
    { to: "/templates", label: "គំរូធៀបការ", icon: "🎨" },
    { to: "/packages", label: "កញ្ចប់សេវាកម្ម", icon: "📦" },
    { to: "/payments", label: "ការទូទាត់", icon: "💳" },
    { to: "/notifications", label: "ការជូនដំណឹង", icon: "🔔" },
    { to: "/system-logs", label: "ប្រវត្តិប្រព័ន្ធ", icon: "📜" },
];

export default function AdminSidebar({ onClose }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-crest">⚜️</div>
                <span className="sidebar-title">រដ្ឋបាលគូព្រេង</span>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    >
                        <span className="nav-icon">{link.icon}</span>
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-foot">Koupreng Admin v1.0</div>
        </aside>
    );
}
