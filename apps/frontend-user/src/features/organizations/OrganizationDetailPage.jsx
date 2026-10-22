import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  IoPersonAddOutline,
  IoBriefcaseOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoCalendarOutline,
} from "react-icons/io5";


import { ConfirmDialog, EmptyState, ErrorState, SkeletonTable, toast } from "@/shared/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOrganizationMembers } from "./hooks/useOrganizationMembers";
import MemberTable from "./components/MemberTable";
import InviteMemberModal from "./components/InviteMemberModal";
import ChangeRoleModal from "./components/ChangeRoleModal";
import { canManageOrganization } from "./model/organizationPermissions";
import "./OrganizationPage.css";

export default function OrganizationDetailPage() {
  const { organizationId } = useParams();
  const { user } = useAuth();
  const {
    organization,
    members,
    loading,
    error,
    saving,
    loadOrganization,
    addMember,
    updateRole,
    removeMember,
  } = useOrganizationMembers(organizationId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);

  const isOwner = canManageOrganization(organization?.ownerUserId, user?.id);

  const handleInvite = async (email, role) => {
    const success = await addMember(email, role);
    if (success) {
      toast.success("បានផ្ញើការអញ្ជើញសមាជិកជោគជ័យ");
    }
    return success;
  };

  const handleUpdateRole = async (memberId, role) => {
    const success = await updateRole(memberId, role);
    if (success) {
      setEditingMember(null);
      toast.success("បានផ្លាស់ប្តូរ Role សមាជិកជោគជ័យ");
    }
    return success;
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    const success = await removeMember(removingMember.id);
    if (success) {
      setRemovingMember(null);
      toast.success("បានដកសមាជិកចេញពី Workspace ជោគជ័យ");
    }
  };

  return (
    <div role="main" className="dash-main k-org-page">
      <div className="k-org-container">
        {/* Breadcrumb Navigation */}
        <nav className="k-org-breadcrumb">
          <Link to="/dashboard" className="k-org-breadcrumb-link">
            <IoHomeOutline />
            <span>ផ្ទាំងគ្រប់គ្រង</span>
          </Link>
          <IoChevronForwardOutline className="k-org-breadcrumb-sep" />
          <Link to="/dashboard/organizations" className="k-org-breadcrumb-link">
            <span>ក្រុមការងារ</span>
          </Link>
          <IoChevronForwardOutline className="k-org-breadcrumb-sep" />
          <span className="k-org-breadcrumb-active">
            {organization?.name || "Workspace Details"}
          </span>
        </nav>

        {error ? (
          <ErrorState message={error} onRetry={loadOrganization} />
        ) : loading ? (
          <div className="k-org-detail-card" style={{ padding: "40px" }}>
            <SkeletonTable rows={4} columns={5} />
          </div>
        ) : !organization ? (
          <EmptyState
            title="រកមិនឃើញ Workspace នេះទេ"
            description="Workspace ដែលអ្នកបានស្នើសុំមិនមាន ឬអ្នកមិនមានសិទ្ធិចូលមើលឡើយ។"
          />
        ) : (
          <>
            {/* Header Banner */}
            <header className="k-org-header-banner">
              <div className="k-org-header-info">
                <div className="k-org-header-tag">
                  <IoBriefcaseOutline />
                  <span>WORKSPACE DETAILS</span>
                </div>
                <h1 className="k-org-header-title">
                  {organization.name}
                  <span className="k-org-badge-status">
                    <IoShieldCheckmarkOutline /> {organization.status || "ACTIVE"}
                  </span>
                </h1>
                <p className="k-org-header-desc">
                  គ្រប់គ្រងសមាជិកក្រុម សិទ្ធិចូលប្រើប្រាស់ និងការងារសហការលើកម្មវិធីការក្នុង Workspace <strong>@{organization.slug}</strong>
                </p>
              </div>

              <div className="k-org-header-actions">
                {isOwner && (
                  <button
                    type="button"
                    className="k-org-btn-create"
                    onClick={() => setInviteModalOpen(true)}
                  >
                    <IoPersonAddOutline style={{ fontSize: "1.2rem" }} />
                    <span>អញ្ជើញសមាជិក (Invite Member)</span>
                  </button>
                )}
              </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="k-org-stats-grid">
              <div className="k-org-stat-card">
                <div className="k-org-stat-icon">
                  <IoPeopleOutline />
                </div>
                <div>
                  <span className="k-org-stat-label">សមាជិកសរុប (Total Members)</span>
                  <strong className="k-org-stat-value">{members.length} នាក់</strong>
                </div>
              </div>

              <div className="k-org-stat-card">
                <div className="k-org-stat-icon">
                  <IoShieldCheckmarkOutline />
                </div>
                <div>
                  <span className="k-org-stat-label">សិទ្ធិគ្រប់គ្រង (Your Access)</span>
                  <strong className="k-org-stat-value">{isOwner ? "👑 Workspace Owner" : "Member"}</strong>
                </div>
              </div>

              <div className="k-org-stat-card">
                <div className="k-org-stat-icon">
                  <IoCalendarOutline />
                </div>
                <div>
                  <span className="k-org-stat-label">បង្កើតនៅថ្ងៃ (Created At)</span>
                  <strong className="k-org-stat-value">
                    {organization.createdAt
                      ? new Date(organization.createdAt).toLocaleDateString("km-KH")
                      : "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Members Section Card */}
            <section className="k-org-detail-card">
              <div className="k-org-section-header">
                <div>
                  <h2 className="k-org-section-title">
                    បញ្ជីសមាជិកក្រុម (Team Members)
                  </h2>
                  <p className="k-org-section-desc">
                    អ្នករៀបចំការ (Planners), បុគ្គលិកកត់ត្រាលុយចងដៃ, និង Staff Check-in ក្នុងក្រុម
                  </p>
                </div>
                <span className="k-org-count-badge">{members.length} Members</span>
              </div>

              {members.length === 0 ? (
                <EmptyState
                  title="មិនទាន់មានសមាជិកក្នុងក្រុមនៅឡើយទេ"
                  description="អញ្ជើញសហការី ឬបុគ្គលិកដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើមធ្វើការរួមគ្នា។"
                  actionLabel="អញ្ជើញសមាជិកថ្មី"
                  onAction={() => setInviteModalOpen(true)}
                />
              ) : (
                <div className="k-org-table-wrapper">
                  <MemberTable
                    members={members}
                    ownerUserId={organization.ownerUserId}
                    currentUserId={user?.id}
                    onEditRole={(m) => setEditingMember(m)}
                    onRemove={(m) => setRemovingMember(m)}
                    isOwner={isOwner}
                  />
                </div>
              )}
            </section>
          </>
        )}

        {/* Invite Member Modal */}
        <InviteMemberModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          saving={saving}
          onInvite={handleInvite}
        />

        {/* Change Role Modal */}
        <ChangeRoleModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          saving={saving}
          onUpdateRole={handleUpdateRole}
        />

        {/* Confirm Delete Member Dialog */}
        <ConfirmDialog
          isOpen={Boolean(removingMember)}
          onClose={() => setRemovingMember(null)}
          onConfirm={handleRemoveMember}
          title="ដកសមាជិកចេញពី Workspace"
          message={`តើអ្នកពិតជាចង់ដក ${removingMember?.email || "សមាជិកនេះ"} ចេញពីក្រុមការងារពិតមែនទេ?`}
          confirmLabel="ដកសមាជិកចេញ"
          cancelLabel="បោះបង់"
          isDestructive={true}
          isLoading={saving}
        />
      </div>
    </div>
  );
}
