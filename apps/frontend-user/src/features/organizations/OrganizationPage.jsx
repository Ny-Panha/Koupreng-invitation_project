import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoAddOutline,
  IoBriefcaseOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoPeopleOutline,
  IoSparkles,
} from "react-icons/io5";
import { ErrorState, FormField, LoadingButton, Modal, SkeletonCard, toast } from "@/shared/ui";
import { useOrganizations } from "./hooks/useOrganizations";
import OrganizationCard from "./components/OrganizationCard";

import "./OrganizationPage.css";

export default function OrganizationPage() {
  const uiCopy = useUiCopy();
  const {
    organizations,
    loading,
    error,
    creating,
    loadOrganizations,
    createOrganization,
  } = useOrganizations();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setCreateError(uiCopy("សូមបញ្ចូលឈ្មោះក្រុមការងារ", "Enter a workspace / team name"));
      return;
    }

    const newOrg = await createOrganization(name.trim());
    if (newOrg) {
      setName("");
      setCreateModalOpen(false);
      toast.success(uiCopy("បានបង្កើតកន្លែងធ្វើការជោគជ័យ", "Workspace created"));
    }
  };

  return (
    <div role="main" className="dash-main k-org-page">
      <div className="k-org-container">
        {/* Breadcrumb */}
        <nav className="k-org-breadcrumb">
          <Link to="/dashboard" className="k-org-breadcrumb-link">
            <IoHomeOutline />
            <span>{uiCopy("ផ្ទាំងគ្រប់គ្រង", "Dashboard")}</span>
          </Link>
          <IoChevronForwardOutline className="k-org-breadcrumb-sep" />
          <span className="k-org-breadcrumb-active">{uiCopy("ក្រុមការងារ និងកន្លែងធ្វើការ", "Teams & workspaces")}</span>
        </nav>

        {/* Header Banner */}
        <header className="k-org-header-banner">
          <div className="k-org-header-info">
            <div className="k-org-header-tag">
              <IoBriefcaseOutline />
              <span>{uiCopy("សហការជាក្រុម", "TEAM COLLABORATION")}</span>
            </div>
            <h1 className="k-org-header-title">
              {uiCopy("ក្រុមការងារ", "Teams")} <span className="gold-text">{uiCopy("និងកន្លែងធ្វើការ", "& Workspaces")}</span>
              {organizations.length > 0 && (
                <span className="k-org-count-badge">{organizations.length} {uiCopy("កន្លែងធ្វើការ", "Workspace")}</span>
              )}
            </h1>
            <p className="k-org-header-desc">
              {uiCopy("គ្រប់គ្រងក្រុមការងារ ដៃគូសហការ អ្នករៀបចំការ និងបុគ្គលិកកត់ត្រាចងដៃ ឬវត្តមានភ្ញៀវរួមគ្នា។", "Manage your team, collaborators, planners, gift recorders and check-in staff together.")}
            </p>
          </div>

          <div className="k-org-header-actions">
            <button
              type="button"
              className="k-org-btn-create"
              onClick={() => setCreateModalOpen(true)}
            >
              <IoAddOutline style={{ fontSize: "1.25rem" }} />
              <span>{uiCopy("បង្កើតកន្លែងធ្វើការថ្មី", "Create workspace")}</span>
            </button>
          </div>
        </header>

        {/* Content Section */}
        {error ? (
          <ErrorState message={error} onRetry={loadOrganizations} />
        ) : loading ? (
          <div className="k-org-grid">
            <SkeletonCard height="180px" />
            <SkeletonCard height="180px" />
            <SkeletonCard height="180px" />
          </div>
        ) : organizations.length === 0 ? (
          <section className="k-org-empty-state">
            <div className="k-org-empty-icon">
              <IoPeopleOutline />
            </div>
            <h2 className="k-org-empty-title">{uiCopy("មិនទាន់មានក្រុមការងារនៅឡើយទេ", "No teams yet")}</h2>
            <p className="k-org-empty-desc">
              {uiCopy("បង្កើតកន្លែងធ្វើការដំបូង ដើម្បីអញ្ជើញសហការី ដៃគូ ឬបុគ្គលិក និងរៀបចំមង្គលការរួមគ្នា។", "Create your first workspace to invite collaborators, partners or staff and organize weddings together.")}
            </p>
            <button
              type="button"
              className="k-org-empty-btn"
              onClick={() => setCreateModalOpen(true)}
            >
              <IoSparkles /> {uiCopy("បង្កើតកន្លែងធ្វើការដំបូង", "Create your first workspace")}
            </button>
          </section>
        ) : (
          <div className="k-org-grid">
            {organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title={uiCopy("បង្កើតកន្លែងធ្វើការក្រុមថ្មី", "Create team workspace")}
          subtitle={uiCopy("រៀបចំអ្នករៀបចំការ អ្នករចនា និងបុគ្គលិកកត់ត្រាវត្តមានក្នុងកន្លែងធ្វើការតែមួយ។", "Bring planners, designers and check-in staff into one workspace.")}
          size="md"
          closeOnBackdropClick={!creating}
          closeOnEscape={!creating}
        >
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <FormField label={uiCopy("ឈ្មោះកន្លែងធ្វើការ ឬក្រុមការងារ", "Workspace / team name")} required error={createError}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={uiCopy("ឧ. ក្រុមរៀបចំមង្គលការ", "e.g. Royal Wedding Planners")}
                className="k-org-input"
              />
            </FormField>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                type="button"
                className="k-org-modal-cancel-btn"
                onClick={() => setCreateModalOpen(false)}
                disabled={creating}
              >
                {uiCopy("បោះបង់", "Cancel")}
              </button>
              <LoadingButton type="submit" isLoading={creating} className="k-org-modal-submit-btn">
                <span>{uiCopy("បង្កើតកន្លែងធ្វើការ", "Create workspace")}</span>
              </LoadingButton>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
