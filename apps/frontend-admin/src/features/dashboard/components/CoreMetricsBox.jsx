import { Users, Mail, UserCheck, Palette } from "lucide-react";

export default function CoreMetricsBox({ data = {}, lang = "km", t = (key, fallback) => fallback }) {
  const en = lang === "en";
  const count = value => value == null ? "—" : Number(value).toLocaleString("en-US");
  const metrics = [
    { key: "users", label: t("dashboard.totalUsers", en ? "Total users" : "អ្នកប្រើសរុប"), value: data.totalUsers,
      note: en ? `${count(data.activeUsers)} active accounts` : `${count(data.activeUsers)} គណនីសកម្ម`, icon: Users },
    { key: "invitations", label: t("dashboard.totalInvitations", en ? "Total invitations" : "សំបុត្រអញ្ជើញសរុប"), value: data.totalInvitations,
      note: en ? `${count(data.publishedInvitations)} published` : `${count(data.publishedInvitations)} បានផ្សាយ`, icon: Mail },
    { key: "guests", label: t("dashboard.totalGuests", en ? "Total guests" : "ភ្ញៀវសរុប"), value: data.totalGuests,
      note: en ? "Guest records across all invitations" : "កំណត់ត្រាភ្ញៀវក្នុងសំបុត្រអញ្ជើញទាំងអស់", icon: UserCheck },
    { key: "templates", label: t("dashboard.totalTemplates", en ? "Templates" : "គំរូសំបុត្រអញ្ជើញ"), value: data.totalTemplates,
      note: en ? `${count(data.premiumTemplates)} premium templates` : `${count(data.premiumTemplates)} គំរូ Premium`, icon: Palette },
  ];

  return (
    <section aria-label={en ? "Platform summary" : "ស្ថិតិទូទៅនៃប្រព័ន្ធ"}>
      <dl className="dashboard-metrics">
        {metrics.map(({ key, label, value, note, icon: Icon }) => (
          <div key={key} className="dashboard-metric">
            <dt><span>{label}</span><Icon size={18} aria-hidden="true" /></dt>
            <dd><strong>{count(value)}</strong><span>{note}</span></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
