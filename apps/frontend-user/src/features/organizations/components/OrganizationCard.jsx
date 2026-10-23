import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { Link } from "react-router-dom";
import { IoPeopleOutline, IoArrowForwardOutline, IoBriefcaseOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

export default function OrganizationCard({ organization }) {
  const uiCopy = useUiCopy();
  const memberCount = organization.members?.length || 0;
  const status = organization.status || "ACTIVE";

  return (
    <article className="k-org-card-lux">
      <div className="k-org-card-top">
        <div className="k-org-icon-box">
          <IoBriefcaseOutline />
        </div>
        <span className="k-org-badge-status">
          <IoShieldCheckmarkOutline /> {uiCopy(({ ACTIVE: "កំពុងដំណើរការ", INACTIVE: "អសកម្ម" })[status] || "មិនស្គាល់", status)}
        </span>
      </div>

      <div className="k-org-card-content">
        <h3 className="k-org-card-title">{organization.name}</h3>
        <span className="k-org-card-slug">@{organization.slug}</span>
      </div>

      <div className="k-org-card-meta-row">
        <div className="k-org-stat-pill">
          <IoPeopleOutline />
          <span>{memberCount} {uiCopy("សមាជិក", memberCount === 1 ? "Member" : "Members")}</span>
        </div>
      </div>

      <div className="k-org-card-footer-lux">
        <Link to={`/dashboard/organizations/${organization.id}`} className="k-org-btn-enter">
          <span>{uiCopy("ចូលគ្រប់គ្រងកន្លែងធ្វើការ", "Open workspace")}</span>
          <IoArrowForwardOutline />
        </Link>
      </div>
    </article>
  );
}
