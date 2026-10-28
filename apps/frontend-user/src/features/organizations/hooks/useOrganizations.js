import { useCallback, useEffect, useState } from "react";
import { organizationService } from "../api/organizationApi";
import { feedback, refreshAccess } from '@/shared/feedback/feedback';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await organizationService.listMine();
      setOrganizations(data || []);
    } catch (err) {
      setError(err?.message || "Could not load organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const createOrganization = async (name) => {
    setCreating(true);
    setError("");
    try {
      const newOrg = await organizationService.create(name);
      refreshAccess();
      await loadOrganizations();
      return newOrg;
    } catch (err) {
      setError(err?.message || "Could not create organization");
      feedback.explain(err, { feature:'TEAM_MEMBERS' });
      return null;
    } finally {
      setCreating(false);
    }
  };

  return {
    organizations,
    loading,
    error,
    creating,
    loadOrganizations,
    createOrganization,
  };
}
