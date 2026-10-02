import { useCallback, useEffect, useState } from "react";
import adminService from "../../shared/api/adminService";

function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

export function useFinancialReportData(refreshInterval = 10000, initialInvitationId = "") {
  const [invitations, setInvitations] = useState([]);
  const [invitationId, setInvitationId] = useState(() => String(initialInvitationId || ""));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let hasLoadedSuccessfully = false;
    const loadInvitations = async () => {
      if (!active || inFlight) return;
      inFlight = true;
      try {
        const data = await adminService.invitations();
        if (!active) return;
        const list = asList(data);
        hasLoadedSuccessfully = true;
        setInvitations(list);
        setInvitationId((currentId) => list.some((item) => String(item.id) === currentId)
          ? currentId
          : String(initialInvitationId || list[0]?.id || ""));
        setError("");
      } catch (loadError) {
        if (active && !hasLoadedSuccessfully) setError(loadError?.message || "មិនអាចទាញយកបញ្ជីកម្មវិធីបានទេ");
      } finally {
        inFlight = false;
        if (active) setLoading(false);
      }
    };
    loadInvitations();
    const intervalId = window.setInterval(loadInvitations, refreshInterval);
    const onFocus = () => loadInvitations();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadInvitations();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [initialInvitationId, refreshInterval]);

  const fetchSelectedInvitation = useCallback(async (id, active) => {
    if (!id || !active()) return;
    try {
      const [invitation, gifts, expenses, rsvpSummary] = await Promise.all([
        adminService.invitation(id),
        adminService.invitationGifts(id),
        adminService.invitationBudgetItems(id),
        adminService.invitationRsvpSummary(id),
      ]);
      if (!active()) return;
      setReportData({
        invitation,
        gifts: asList(gifts),
        expenses: asList(expenses),
        rsvpSummary: rsvpSummary || null,
      });
      setRefreshedAt(new Date());
      setError("");
    } catch (loadError) {
      if (active()) setError(loadError?.message || "មិនអាចទាញយករបាយការណ៍បានទេ");
    } finally {
      if (active()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!invitationId) {
      setReportData(null);
      setLoading(false);
      return undefined;
    }

    setReportData(null);
    setLoading(true);
    setError("");
    let active = true;
    let inFlight = false;
    const isActive = () => active;
    const load = async (showLoading = false) => {
      if (inFlight || !active) return;
      inFlight = true;
      if (showLoading) setLoading(true);
      await fetchSelectedInvitation(invitationId, isActive);
      inFlight = false;
    };

    load(true);
    const intervalId = window.setInterval(() => load(), refreshInterval);
    const onFocus = () => load();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchSelectedInvitation, invitationId, refreshInterval]);

  return {
    invitations,
    invitationId,
    setInvitationId,
    reportData,
    loading,
    error,
    refreshedAt,
  };
}
