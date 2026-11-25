import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import { formatDate } from "../../../shared/utils";
import { StatusBadge } from "../../../shared/ui/AdminUI";

export default function RecentInvitationsCard({ lang = "km", invitations = [] }) {
  const en = lang === "en";
  const items = Array.isArray(invitations) ? invitations.slice(0, 4) : [];

  return (
    <section className="dashboard-panel" aria-labelledby="dashboard-invitations-title">
      <div className="dashboard-panel-header">
        <div>
          <h2 id="dashboard-invitations-title">{en ? "Recent invitations" : "សំបុត្រអញ្ជើញថ្មីៗ"}</h2>
          <p>{en ? "The latest invitations on the platform." : "សំបុត្រអញ្ជើញចុងក្រោយក្នុងប្រព័ន្ធ។"}</p>
        </div>
        <Link to="/reports" className="dashboard-text-link" aria-label={en ? "View invitation reports" : "មើលរបាយការណ៍សំបុត្រអញ្ជើញ"}>
          {en ? "Reports" : "របាយការណ៍"}<ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      {items.length ? (
        <ul className="dashboard-invitation-list">
          {items.map((invitation, index) => {
            const title = invitation.title || (invitation.groomName && invitation.brideName
              ? `${invitation.groomName} & ${invitation.brideName}`
              : `${en ? "Invitation" : "សំបុត្រអញ្ជើញ"} #${invitation.id}`);
            const status = invitation.status || (invitation.published === true ? "PUBLISHED" : undefined);
            const metadata = [invitation.ownerName || invitation.hostName, invitation.eventDate && formatDate(invitation.eventDate), invitation.eventType].filter(Boolean);
            return (
              <li key={invitation.id || index}>
                <span className="dashboard-invitation-icon" aria-hidden="true"><Mail size={19} /></span>
                <div className="dashboard-invitation-info">
                  <div className="dashboard-invitation-title"><h3>{title}</h3><StatusBadge status={status} /></div>
                  <p>{invitation.templateName || invitation.templateCode || (en ? "Template not specified" : "មិនបានបញ្ជាក់គំរូ")}</p>
                  <p className="dashboard-invitation-meta">{metadata.join(" · ")}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : <p className="dashboard-empty" role="status">{en ? "No recent invitations to display." : "មិនមានសំបុត្រអញ្ជើញថ្មីសម្រាប់បង្ហាញ។"}</p>}
    </section>
  );
}
