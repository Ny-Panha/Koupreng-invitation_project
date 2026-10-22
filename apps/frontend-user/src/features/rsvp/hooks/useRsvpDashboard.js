import { useCallback, useEffect, useMemo, useState } from "react";
import rsvpService from "../api/rsvpApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { guestService } from "@/features/guests/api/guestApi";

export function useRsvpDashboard(invitationId) {
  const [invitation, setInvitation] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [guests, setGuests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("TABLE"); // "TABLE" or "WISHES"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(({ background = false } = {}) => {
    if (!background) setLoading(true);
    setError("");
    return Promise.all([
      invitationService.get(invitationId),
      rsvpService.listByInvitation(invitationId),
      rsvpService.summary(invitationId),
      guestService.listByInvitation(invitationId),
    ])
      .then(([invData, rsvpData, summaryData, guestData]) => {
        setInvitation(invData);
        setRsvps(rsvpData || []);
        setSummary(summaryData);
        setGuests(guestData || []);
      })
      .catch((err) => {
        setError(err.message || "Could not load RSVP records");
        if (background) throw err;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [invitationId]);

  useEffect(() => {
    load();
  }, [load]);

  const responseRows = useMemo(() => {
    const responded = new Set(rsvps.filter(r => r.guestId != null).map(r => String(r.guestId)));
    return [...rsvps, ...guests.filter(g => !responded.has(String(g.id))).map(g => ({ guestId: g.id, guestName: g.guestName, phone: g.phone, responseStatus: 'PENDING', attendeeCount: null, invitedSeats: g.seatCount, pendingInvitation: true }))];
  }, [rsvps, guests]);
  const filteredRsvps = useMemo(() => {
    return responseRows.filter((item) => {
      const itemStatus = String(item.responseStatus || item.status || "").toUpperCase();
      const statusMatch =
        statusFilter === "ALL" ||
        itemStatus === statusFilter || (statusFilter === 'ATTENDING' && itemStatus === 'ACCEPTED') ||
        (statusFilter === "DECLINED" && itemStatus === "NOT_ATTENDING") ||
        (statusFilter === "NOT_ATTENDING" && itemStatus === "DECLINED");
      const searchKey = search.trim().toLowerCase();
      const nameMatch =
        !searchKey ||
        (item.guestName || item.name || "").toLowerCase().includes(searchKey) ||
        (item.wish || item.message || "").toLowerCase().includes(searchKey);
      return statusMatch && nameMatch;
    });
  }, [responseRows, statusFilter, search]);

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
    attendeeCount: summary?.totalAttendeeCount ?? rsvps.filter(r => ['ATTENDING', 'ACCEPTED'].includes(r.responseStatus || r.status)).reduce((sum, r) => sum + Number(r.attendeeCount || 0), 0),
    load,
  };
}

export default useRsvpDashboard;
