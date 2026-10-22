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
      setCreateError("សូមបញ្ចូលឈ្មោះ Workspace / ក្រុមការងារ");
      return;
    }

    const newOrg = await createOrganization(name.trim());
    if (newOrg) {
      setName("");
      setCreateModalOpen(false);
      toast.success("បានបង្កើត Workspace ជោគជ័យ");
    }
  };

  return (
    <div role="main" className="dash-main k-org-page">
      <div className="k-org-container">
        {/* Breadcrumb */}
        <nav className="k-org-breadcrumb">
          <Link to="/dashboard" className="k-org-breadcrumb-link">
            <IoHomeOutline />
            <span>ផ្ទាំងគ្រប់គ្រង</span>
          </Link>
          <IoChevronForwardOutline className="k-org-breadcrumb-sep" />
          <span className="k-org-breadcrumb-active">ក្រុមការងារ & Workspaces</span>
        </nav>

        {/* Header Banner */}
        <header className="k-org-header-banner">
          <div className="k-org-header-info">
            <div className="k-org-header-tag">
              <IoBriefcaseOutline />
              <span>TEAM COLLABORATION</span>
            </div>
            <h1 className="k-org-header-title">
              ក្រុមការងារ <span className="gold-text">& Workspaces</span>
              {organizations.length > 0 && (
                <span className="k-org-count-badge">{organizations.length} Workspace</span>
              )}
            </h1>
            <p className="k-org-header-desc">
              គ្រប់គ្រងក្រុមការងារ ដៃគូសហការ អ្នករៀបចំការ (Planners) និងបុគ្គលិកកត់ត្រាលុយចងដៃ ឬ Check-in ភ្ញៀវរួមគ្នា។
            </p>
          </div>

          <div className="k-org-header-actions">
            <button
              type="button"
              className="k-org-btn-create"
              onClick={() => setCreateModalOpen(true)}
            >
              <IoAddOutline style={{ fontSize: "1.25rem" }} />
              <span>បង្កើត Workspace ថ្មី</span>
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
            <h2 className="k-org-empty-title">មិនទាន់មានក្រុមការងារនៅឡើយទេ</h2>
            <p className="k-org-empty-desc">
              បង្កើត Workspace ដំបូងរបស់អ្នក ដើម្បីអញ្ជើញសហការី ដៃគូ ឬបុគ្គលិក និងរៀបចំការងារមង្គលការរួមគ្នាយ៉ាងរលូន។
            </p>
            <button
              type="button"
              className="k-org-empty-btn"
              onClick={() => setCreateModalOpen(true)}
            >
              <IoSparkles /> បង្កើត Workspace ដំបូង (Create Workspace)
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
          title="បង្កើត Team Workspace ថ្មី"
          subtitle="រៀបចំក្រុមការងារ Planners, Designers, និង Check-in Staff ក្នុង Workspace តែមួយ។"
          size="md"
          closeOnBackdropClick={!creating}
          closeOnEscape={!creating}
        >
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <FormField label="ឈ្មោះ Workspace / ក្រុមការងារ (Team Name)" required error={createError}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ឧ. Royal Wedding Planners ឬ ក្រុមការងារមង្គលការ"
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
                បោះបង់ (Cancel)
              </button>
              <LoadingButton type="submit" isLoading={creating} className="k-org-modal-submit-btn">
                <span>បង្កើត Workspace</span>
              </LoadingButton>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
