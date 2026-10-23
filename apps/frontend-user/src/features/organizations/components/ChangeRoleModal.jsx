import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useState, useEffect } from "react";
import { FormField, LoadingButton, Modal } from "@/shared/ui";
import { ORGANIZATION_ROLES } from "../model/organizationConstants";

export default function ChangeRoleModal({
  member,
  onClose,
  saving,
  onUpdateRole,
}) {
  const uiCopy = useUiCopy();
  const [role, setRole] = useState(member?.role || "VIEWER");

  useEffect(() => {
    if (member) setRole(member.role || "VIEWER");
  }, [member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member) return;
    const success = await onUpdateRole(member.id, role);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={Boolean(member)}
      onClose={onClose}
      title={uiCopy("ផ្លាស់ប្តូរតួនាទីសមាជិក", "Change member role")}
      subtitle={`${uiCopy("កែប្រែសិទ្ធិ និងតួនាទីសម្រាប់", "Edit permissions and role for")} ${member?.email || ""}`}
      size="sm"
      closeOnBackdropClick={!saving}
      closeOnEscape={!saving}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <FormField label={uiCopy("តួនាទីថ្មី", "New role")} required>
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
            <span>{uiCopy("រក្សាទុកតួនាទី", "Save role")}</span>
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
