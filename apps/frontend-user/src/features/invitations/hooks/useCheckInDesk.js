import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "../api/invitationApi";
import { planningService } from "@/features/planning/api/planningApi";
import { createHostRecordId, getDraft, listManualGuests, saveManualGuests, listManualCheckIns, saveManualCheckIns, listWeddingGifts, saveWeddingGifts } from "@/shared/storage";
import { localDateString } from "@/shared/utils/localDate";
import { toast } from "@/shared/ui/toast";

const initialWalkIn = () => ({ name: "", table: "", phone: "", group: "ភ្ញៀវទូទៅ", side: "ខាងកូនកំលោះ", gift: "", currency: "USD" });
const normalizeGuest = (guest) => ({ ...guest, guestName: guest.guestName || guest.name || "", groupName: guest.groupName || guest.guestGroup || "", side: guest.side || guest.sideType || "" });
const localSummary = (guests, checkIns) => ({ totalGuests: guests.length, checkedIn: checkIns.length, attendingCheckedIn: checkIns.length, remaining: Math.max(0, guests.length - checkIns.length) });

export function resolveDeskScope(rawId) {
  const id = String(rawId || "").replace(/^inv-/, "");
  const draft = /^\d+$/.test(id) ? null : getDraft(id);
  const serverId = draft?.backendInvitationId || id;
  return /^\d+$/.test(String(serverId)) ? { mode: "SERVER_BACKED_INVITATION", id: String(serverId) }
    : draft ? { mode: "LOCAL_DRAFT", id, draft } : { mode: "INVALID", id };
}

/** One desk, two deliberate persistence modes. A server failure never changes mode. */
export function useCheckInDesk(rawId, { onCheckIn, onDuplicate }) {
  const scope = useMemo(() => resolveDeskScope(rawId), [rawId]);
  const invitationId = scope.id;
  const server = scope.mode === "SERVER_BACKED_INVITATION";
  const [invitation, setInvitation] = useState(null);
  const [guests, setGuests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [note, setNote] = useState("");
  const [tokenGiftAmount, setTokenGiftAmount] = useState("");
  const [tokenGiftCurrency, setTokenGiftCurrency] = useState("USD");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [celebrationData, setCelebrationData] = useState(null);
  const [celebrationGiftAmount, setCelebrationGiftAmount] = useState("");
  const [celebrationGiftCurrency, setCelebrationGiftCurrency] = useState("USD");
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState(initialWalkIn);
  const [pendingWalkIn, setPendingWalkIn] = useState(null);
  const busy = useRef(false);
  const loadGeneration = useRef(0);

  const load = useCallback(() => {
    const generation = ++loadGeneration.current;
    let active = true;
    setLoading(true); setError("");
    if (scope.mode === "LOCAL_DRAFT") {
      const localGuests = listManualGuests(invitationId).map(normalizeGuest);
      const localCheckIns = listManualCheckIns(invitationId);
      setInvitation(scope.draft); setGuests(localGuests); setCheckIns(localCheckIns);
      setSummary(localSummary(localGuests, localCheckIns)); setLoading(false);
      return () => { active = false; };
    }
    if (!server) {
      setInvitation(null); setError("Choose an existing invitation or local draft."); setLoading(false);
      return () => { active = false; };
    }
    Promise.all([invitationService.get(invitationId), guestService.listByInvitation(invitationId), guestService.checkInSummary(invitationId), guestService.checkInList(invitationId)])
      .then(([invitationData, guestData, summaryData, checkInData]) => {
        if (!active || generation !== loadGeneration.current) return;
        if (!invitationData || !Array.isArray(guestData) || !Array.isArray(checkInData)) throw new Error("Invalid check-in response");
        setInvitation(invitationData); setGuests(guestData.map(normalizeGuest)); setCheckIns(checkInData); setSummary(summaryData);
      })
      .catch((err) => { if (active && generation === loadGeneration.current) setError(err.message || "Could not load check-in data"); })
      .finally(() => { if (active && generation === loadGeneration.current) setLoading(false); });
    return () => { active = false; };
  }, [invitationId, scope, server]);
  useEffect(() => load(), [load]);

  const refreshCheckIns = async () => {
    if (!server) return;
    try {
      const [nextSummary, items] = await Promise.all([guestService.checkInSummary(invitationId), guestService.checkInList(invitationId)]);
      if (!Array.isArray(items)) throw new Error("Invalid attendance response");
      setSummary(nextSummary); setCheckIns(items);
    } catch (err) {
      setError(`Attendance was saved, but the latest list could not be loaded. Refresh to verify. ${err.message || ""}`);
    }
  };

  const recordGiftItem = async (guestName, amount, currency, noteText) => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) throw new Error("Enter a gift amount greater than zero.");
    if (!["USD", "KHR"].includes(currency)) throw new Error("Choose USD or KHR.");
    const gift = { name: guestName, amount: value, currency, method: "Cash", date: localDateString(), note: noteText || "Recorded at check-in desk" };
    if (server) await planningService.createGift(invitationId, gift);
    else {
      const existing = listWeddingGifts([], invitationId).map((item) => ({ ...item, name: item.name || item.donorName || item.giverName || "", date: item.date || (item.createdAt ? localDateString(new Date(item.createdAt)) : "") }));
      saveWeddingGifts([{ ...gift, id: createHostRecordId("gift") }, ...existing], invitationId, { throwOnError: true });
    }
    toast(`Gift recorded: ${value} ${currency} — ${guestName}`);
  };

  const triggerCelebration = (guest, result) => {
    setDuplicateWarning(null);
    setCelebrationData({ guestName: guest.guestName, tableNumber: guest.tableNumber || guest.table || "", groupName: guest.groupName || "", side: guest.side || "", checkInId: result.id, guestId: result.guestId });
    setCelebrationGiftAmount("");
    onCheckIn?.();
  };

  const applyCheckIn = (result, guest, celebrate = true) => {
    if (!result?.id || !result?.guestId) throw new Error("The server did not confirm attendance. Refresh before retrying.");
    if (result.alreadyCheckedIn) {
      onDuplicate?.();
      setDuplicateWarning({ guestName: result.guestName || guest.guestName, checkedInAt: result.checkedInAt ? new Date(result.checkedInAt).toLocaleString() : "Previously", source: server ? "Server Record" : result.source });
      return false;
    }
    const next = [result, ...checkIns.filter((item) => String(item.guestId) !== String(result.guestId))];
    if (!server) { saveManualCheckIns(next, invitationId, { throwOnError: true }); setSummary(localSummary(guests, next)); }
    setCheckIns(next);
    if (celebrate) triggerCelebration(guest, result);
    return true;
  };

  const matchLocal = (value) => guests.find((guest) => {
    const text = value.toLowerCase();
    return guest.token?.toLowerCase() === text || (guest.slug && value.includes(guest.slug))
      || String(guest.id) === value || guest.phone === value || guest.guestName?.toLowerCase() === text;
  });

  const localResult = (guest, source) => {
    const existing = checkIns.find((item) => String(item.guestId) === String(guest.id) || item.guestName?.toLowerCase() === guest.guestName.toLowerCase());
    return existing ? { ...existing, alreadyCheckedIn: true } : { id: createHostRecordId("cin"), guestId: guest.id, guestName: guest.guestName, source, note, tableNumber: guest.tableNumber || "", groupName: guest.groupName || "", side: guest.side || "", checkedInAt: new Date().toISOString() };
  };

  const performScan = async (value, withGift = false) => {
    if (!value?.trim() || busy.current || !invitation) return;
    busy.current = true; setSaving(true); setError("");
    try {
      const cleanToken = value.trim();
      const result = server ? await guestService.scanCheckIn(invitationId, cleanToken, note) : null;
      const guest = server ? normalizeGuest({ ...guests.find((item) => String(item.id) === String(result?.guestId)), guestName: result?.guestName || cleanToken })
        : matchLocal(cleanToken) || { id: createHostRecordId("guest"), guestName: cleanToken };
      const saved = result || localResult(guest, withGift ? "QR Token" : "Camera QR");
      const created = applyCheckIn(saved, guest);
      if (server) await refreshCheckIns();
      if (created && withGift && tokenGiftAmount) {
        try { await recordGiftItem(guest.guestName, tokenGiftAmount, tokenGiftCurrency, note); }
        catch (err) {
          setCelebrationGiftAmount(tokenGiftAmount); setCelebrationGiftCurrency(tokenGiftCurrency);
          throw new Error(`Attendance confirmed. ${err.message || "Gift was not saved"}`, { cause: err });
        }
      }
      if (withGift) { setToken(""); setNote(""); setTokenGiftAmount(""); }
    } catch (err) { setError(err.message || "Could not check in guest"); }
    finally { busy.current = false; setSaving(false); }
  };
  const scan = (event) => { event?.preventDefault(); return performScan(token, true); };
  const handleCameraScan = (value) => performScan(value);

  const manual = async (guest) => {
    if (busy.current || !invitation) return;
    busy.current = true; setSaving(true); setError("");
    try {
      const result = server ? await guestService.manualCheckIn(invitationId, guest.id, note) : localResult(guest, "Manual Desk");
      applyCheckIn(result, guest);
      if (server) await refreshCheckIns();
    } catch (err) { setError(err.message || "Could not check in guest"); }
    finally { busy.current = false; setSaving(false); }
  };

  const handleSaveCelebrationAndClose = async () => {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError("");
    try {
      if (celebrationData && celebrationGiftAmount) await recordGiftItem(celebrationData.guestName, celebrationGiftAmount, celebrationGiftCurrency, "Gift recorded at check-in");
      setCelebrationData(null); setCelebrationGiftAmount("");
    } catch (err) { setError(err.message || "Gift was not saved"); }
    finally { busy.current = false; setSaving(false); }
  };

  const handleCreateWalkInGuest = async (event) => {
    event.preventDefault();
    if (!walkInForm.name.trim() || busy.current || !invitation) return;
    busy.current = true; setSaving(true); setError("");
    let stage = pendingWalkIn;
    try {
      if (!stage) {
        const payload = { guestName: walkInForm.name.trim(), phone: walkInForm.phone.trim(), tableNumber: walkInForm.table.trim(), guestGroup: walkInForm.group, sideType: walkInForm.side, seatCount: 1, note: "Walk-in desk" };
        const guest = normalizeGuest(server ? await guestService.createForInvitation(invitationId, payload) : { ...payload, id: createHostRecordId("walkin"), token: createHostRecordId("tok"), createdAt: new Date().toISOString() });
        if (!guest.id) throw new Error("The server did not confirm the guest. Refresh before retrying.");
        const nextGuests = [guest, ...guests.filter((item) => String(item.id) !== String(guest.id))];
        if (!server) saveManualGuests(nextGuests, invitationId, { throwOnError: true });
        stage = { guest, attendance: null }; setPendingWalkIn(stage); setGuests(nextGuests);
      }
      if (!stage.attendance) {
        const attendance = server ? await guestService.manualCheckIn(invitationId, stage.guest.id, "Walk-in desk") : localResult(stage.guest, "Walk-in Desk");
        if (!attendance?.id || !attendance?.guestId) throw new Error("Attendance was not confirmed. Refresh before retrying.");
        stage = { ...stage, attendance }; setPendingWalkIn(stage);
        applyCheckIn(attendance, stage.guest, false);
      }
      if (walkInForm.gift) await recordGiftItem(stage.guest.guestName, walkInForm.gift, walkInForm.currency, "Walk-in gift");
      if (server) await refreshCheckIns();
      else setSummary(localSummary([stage.guest, ...guests.filter((item) => String(item.id) !== String(stage.guest.id))], [stage.attendance, ...checkIns.filter((item) => String(item.guestId) !== String(stage.guest.id))]));
      setPendingWalkIn(null); setWalkInModalOpen(false); setWalkInForm(initialWalkIn());
      if (!stage.attendance.alreadyCheckedIn) triggerCelebration(stage.guest, stage.attendance);
      toast(`Guest and attendance saved: ${stage.guest.guestName}`);
    } catch (err) { setError(`${stage ? (stage.attendance ? "Guest and attendance saved. " : "Guest saved. Attendance not saved. Retry with this guest. ") : ""}${err.message || "Could not save walk-in"}`); }
    finally { busy.current = false; setSaving(false); }
  };

  const undoCheckIn = async (item) => {
    if (busy.current || !window.confirm(`Remove attendance for "${item.guestName}"?`)) return;
    busy.current = true; setSaving(true); setError("");
    try {
      if (server) await guestService.undoCheckIn(invitationId, item.guestId);
      const next = checkIns.filter((entry) => String(entry.guestId) !== String(item.guestId));
      if (!server) saveManualCheckIns(next, invitationId, { throwOnError: true });
      setCheckIns(next);
      if (server) await refreshCheckIns();
      else setSummary(localSummary(guests, next));
      toast("Attendance removed; gifts and guest registration are retained.");
    } catch (err) { setError(err.message || "Could not remove attendance"); }
    finally { busy.current = false; setSaving(false); }
  };

  return { invitationId, persistenceMode: scope.mode, invitation, guests, summary, checkIns, token, setToken, note, setNote, tokenGiftAmount, setTokenGiftAmount, tokenGiftCurrency, setTokenGiftCurrency, search, setSearch, statusFilter, setStatusFilter, loading, saving, error, celebrationData, setCelebrationData, celebrationGiftAmount, setCelebrationGiftAmount, celebrationGiftCurrency, setCelebrationGiftCurrency, duplicateWarning, setDuplicateWarning, walkInModalOpen, setWalkInModalOpen, walkInForm, setWalkInForm, pendingWalkIn, load, scan, handleCameraScan, manual, handleSaveCelebrationAndClose, handleCreateWalkInGuest, undoCheckIn };
}
