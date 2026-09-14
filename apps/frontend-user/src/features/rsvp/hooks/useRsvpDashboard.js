import { useCallback, useEffect, useMemo, useState } from "react";
import rsvpService from "../api/rsvpApi";
import { invitationService } from "@/features/invitations/api/invitationApi";

export function useRsvpDashboard(invitationId) {
  const [invitation, setInvitation] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("TABLE"); // "TABLE" or "WISHES"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      invitationService.get(invitationId),
      rsvpService.listByInvitation(invitationId),
      rsvpService.summary(invitationId),
    ])
      .then(([invData, rsvpData, summaryData]) => {
        setInvitation(invData);
        setRsvps(rsvpData || []);
        setSummary(summaryData);
      })
      .catch((err) => {
        setError(err.message || "Could not load RSVP records");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [invitationId]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((item) => {
      const itemStatus = String(item.responseStatus || item.status || "").toUpperCase();
      const statusMatch =
        statusFilter === "ALL" ||
        itemStatus === statusFilter ||
        (statusFilter === "DECLINED" && itemStatus === "NOT_ATTENDING") ||
        (statusFilter === "NOT_ATTENDING" && itemStatus === "DECLINED");
      const searchKey = search.trim().toLowerCase();
      const nameMatch =
        !searchKey ||
        (item.guestName || item.name || "").toLowerCase().includes(searchKey) ||
        (item.wish || item.message || "").toLowerCase().includes(searchKey);
      return statusMatch && nameMatch;
    });
  }, [rsvps, statusFilter, search]);

  const wishesList = useMemo(
    () => rsvps.filter((r) => Boolean((r.wish || r.message || "").trim())),
    [rsvps]
  );

  const attendingCount =
    summary?.attending ??
    summary?.accepted ??
    rsvps.filter((r) => {
      const s = String(r.responseStatus || r.status || "").toUpperCase();
      return s === "ATTENDING" || s === "ACCEPTED";
    }).length;
  const declinedCount =
    summary?.notAttending ??
    summary?.declined ??
    rsvps.filter((r) => {
      const s = String(r.responseStatus || r.status || "").toUpperCase();
      return s === "NOT_ATTENDING" || s === "DECLINED";
    }).length;
  const pendingCount =
    summary?.pending ??
    rsvps.filter((r) => {
      const s = String(r.responseStatus || r.status || "").toUpperCase();
      return s === "PENDING";
    }).length;

  return {
    invitation,
    rsvps,
    summary,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    viewMode,
    setViewMode,
    loading,
    error,
    filteredRsvps,
    wishesList,
    attendingCount,
    declinedCount,
    pendingCount,
    load,
  };
}

export default useRsvpDashboard;
