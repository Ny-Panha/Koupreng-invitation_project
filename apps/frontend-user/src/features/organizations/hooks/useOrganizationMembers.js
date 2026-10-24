import { useCallback, useEffect, useState } from "react";
import { organizationService } from "../api/organizationApi";

export function useOrganizationMembers(organizationId) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOrganization = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    try {
      const data = await organizationService.get(organizationId);
      setOrganization(data);
    } catch (err) {
      setError(err?.message || "Could not load organization details");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const addMember = async (email, role) => {
    if (!organizationId) return false;
    setSaving(true);
    setError("");
    try {
      const invitation = await organizationService.addMember(organizationId, { email, role });
      await loadOrganization();
      return invitation;
    } catch (err) {
      setError(err?.message || "Could not add member");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (memberId, role) => {
    if (!organizationId) return false;
    setSaving(true);
    setError("");
    try {
      await organizationService.updateMemberRole(organizationId, memberId, role);
      await loadOrganization();
      return true;
    } catch (err) {
      setError(err?.message || "Could not update member role");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!organizationId) return false;
    setSaving(true);
    setError("");
    try {
      await organizationService.removeMember(organizationId, memberId);
      await loadOrganization();
      return true;
    } catch (err) {
      setError(err?.message || "Could not remove member");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    organization,
    members: organization?.members || [],
    loading,
    error,
    saving,
    loadOrganization,
    addMember,
    updateRole,
    removeMember,
  };
}
