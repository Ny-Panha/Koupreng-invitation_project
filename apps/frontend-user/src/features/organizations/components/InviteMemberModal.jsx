import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useState } from "react";
import { FormField, LoadingButton, Modal } from "@/shared/ui";
import { ORGANIZATION_ROLES } from "../model/organizationConstants";

export default function InviteMemberModal({
  isOpen,
  onClose,
  saving,
  onInvite,
}) {
  const uiCopy = useUiCopy();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(uiCopy("សូមបញ្ចូលអ៊ីមែលសមាជិក", "Enter the member’s email"));
      return;
    }

    const success = await onInvite(email.trim(), role);
    if (success) {
      setEmail("");
      setRole("VIEWER");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={uiCopy("អញ្ជើញសមាជិកក្រុមថ្មី", "Invite team member")}
      subtitle={uiCopy("បន្ថែមសហការី អ្នករៀបចំការ ឬបុគ្គលិកកត់ត្រាចងដៃទៅកាន់កន្លែងធ្វើការរបស់អ្នក។", "Add collaborators, planners or gift recorders to your workspace.")}
      size="md"
      closeOnBackdropClick={!saving}
      closeOnEscape={!saving}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <FormField label={uiCopy("អ៊ីមែលសមាជិក", "Member email")} required error={error}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="collaborator@example.com"
            className="k-org-input"
          />
        </FormField>

        <FormField label={uiCopy("តួនាទី និងសិទ្ធិ", "Role & permissions")} required>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="k-org-input"
            style={{ cursor: "pointer" }}
          >
            {ORGANIZATION_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {uiCopy(r.labelKm, r.label)} — {uiCopy(r.descriptionKm, r.description)}
              </option>
            ))}
          </select>
        </FormField>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="button"
            className="k-org-modal-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            {uiCopy("បោះបង់", "Cancel")}
          </button>
          <LoadingButton type="submit" isLoading={saving} className="k-org-modal-submit-btn">
            <span>{uiCopy("ផ្ញើការអញ្ជើញ", "Send invite")}</span>
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
