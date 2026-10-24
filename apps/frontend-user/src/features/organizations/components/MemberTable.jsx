import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { IoPencilOutline, IoTrashOutline, IoPersonOutline } from "react-icons/io5";
import { ResponsiveTable, StatusBadge } from "@/shared/ui";
import RoleBadge from "./RoleBadge";

export default function MemberTable({
  members = [],
  ownerUserId,
  onEditRole,
  onRemove,
  isOwner,
}) {
  const uiCopy = useUiCopy();
  return (
    <ResponsiveTable ariaLabel={uiCopy("តារាងសមាជិកក្រុម", "Organization members table")}>
      <thead>
        <tr>
          <th>{uiCopy("សមាជិក", "Member")}</th>
          <th>{uiCopy("តួនាទី", "Role")}</th>
          <th>{uiCopy("ស្ថានភាព", "Status")}</th>
          <th>{uiCopy("កាលបរិច្ឆេទចូលរួម", "Joined date")}</th>
          {isOwner && <th>{uiCopy("សកម្មភាព", "Actions")}</th>}
        </tr>
      </thead>
      <tbody>
        {members.map((member) => {
          const isMemberOwner =
            member.role === "OWNER" ||
            (member.userId && String(member.userId) === String(ownerUserId));

          return (
            <tr key={member.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="k-org-member-avatar">
                    <IoPersonOutline />
                  </div>
                  <div>
                    <strong style={{ color: "var(--kp-dark)", fontSize: "0.9rem" }}>{member.email}</strong>
                    {isMemberOwner && (
                      <span className="k-org-owner-tag">
                        {uiCopy("👑 ម្ចាស់", "👑 Owner")}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <RoleBadge role={member.role} />
              </td>
              <td>
                <StatusBadge status={member.status || "ACTIVE"} />
                {!isMemberOwner && member.status === 'ACTIVE' && !member.inviteAcceptedAt && <p>{uiCopy('សិទ្ធិកម្មវិធីត្រូវការការអញ្ជើញថ្មី និងការទទួលយក។', 'Event access needs a new accepted invitation.')}</p>}
              </td>
              <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                {member.joinedAt
                  ? new Date(member.joinedAt).toLocaleDateString(uiCopy("km-KH", "en-US"))
                  : member.invitedAt
                  ? `${uiCopy("បានអញ្ជើញ", "Invited")} ${new Date(member.invitedAt).toLocaleDateString(uiCopy("km-KH", "en-US"))}`
                  : "—"}
              </td>
              {isOwner && (
                <td>
                  {!isMemberOwner ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="k-org-action-btn edit"
                        onClick={() => onEditRole(member)}
                        title={uiCopy("ប្តូរតួនាទី", "Change role")}
                        aria-label={uiCopy("ប្តូរតួនាទី", "Change role")}
                      >
                        <IoPencilOutline aria-hidden="true" />
                        <span>{uiCopy("កែប្រែតួនាទី", "Edit role")}</span>
                      </button>
                      <button
                        type="button"
                        className="k-org-action-btn danger"
                        onClick={() => onRemove(member)}
                        title={uiCopy("ដកសមាជិកចេញ", "Remove member")}
                        aria-label={uiCopy("ដកសមាជិកចេញ", "Remove member")}
                      >
                        <IoTrashOutline aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>
                      {uiCopy("មិនអាចដកម្ចាស់ចេញ", "Owner protected")}
                    </span>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </ResponsiveTable>
  );
}
