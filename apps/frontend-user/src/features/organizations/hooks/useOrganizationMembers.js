import { useCallback, useEffect, useState } from "react";
import { organizationService } from "../api/organizationApi";
import { feedback, refreshAccess } from '@/shared/feedback/feedback';

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
      refreshAccess();
      await loadOrganization();
      return invitation;
    } catch (err) {
      setError(err?.message || "Could not add member");
      feedback.explain(err, { feature:'TEAM_MEMBERS', ownerOnly:true });
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
      refreshAccess();
      await loadOrganization();
      return true;
    } catch (err) {
      setError(err?.message || "Could not update member role");
      feedback.explain(err, { ownerOnly:true });
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
      refreshAccess();
      await loadOrganization();
      return true;
    } catch (err) {
      setError(err?.message || "Could not remove member");
      feedback.explain(err, { ownerOnly:true });
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
