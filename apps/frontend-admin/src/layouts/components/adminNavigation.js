import { LayoutDashboard, Users, Palette, Layers, CreditCard, LineChart, Bell, Activity, Terminal } from "lucide-react";

export function adminNavigation(lang) {
  const en = lang === "en";
  return [
    { to: "/dashboard", icon: LayoutDashboard, label: en ? "Overview dashboard" : "ផ្ទាំងគ្រប់គ្រងទូទៅ", exact: true },
    { to: "/users", icon: Users, label: en ? "Users" : "អ្នកប្រើប្រាស់" },
    { to: "/templates", icon: Palette, label: en ? "Invitation templates" : "គំរូសំបុត្រអញ្ជើញ" },
    { to: "/packages", icon: Layers, label: en ? "Service packages" : "កញ្ចប់សេវាកម្ម" },
    { to: "/payments", icon: CreditCard, label: en ? "KHQR payments" : "ការទូទាត់ KHQR" },
    { to: "/reports", icon: LineChart, label: en ? "Financial reports" : "របាយការណ៍ហិរញ្ញវត្ថុ" },
    { to: "/notifications", icon: Bell, label: en ? "Notifications" : "ការជូនដំណឹង" },
    { to: "/system-logs", icon: Activity, label: en ? "System logs" : "កំណត់ហេតុប្រព័ន្ធ" },
    { to: "/dev/api-monitor", icon: Terminal, label: en ? "API monitor" : "តាមដាន API" },
  ];
}

export function filterAdminNavigation(items, query) {
  const normalized = query.trim().toLocaleLowerCase();
  return items.filter(item => `${item.label} ${item.to}`.toLocaleLowerCase().includes(normalized));
}
