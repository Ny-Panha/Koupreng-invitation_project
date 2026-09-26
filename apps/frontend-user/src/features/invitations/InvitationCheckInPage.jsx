import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    CheckCircle2,
    Clock,
    Search,
    QrCode,
    RefreshCw,
    X,
    RotateCcw,
    Sparkles,
    TrendingUp,
    UserPlus,
    Gift,
    AlertTriangle,
    Check,
} from "lucide-react";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import {
    listManualGuests,
    saveManualGuests,
    listManualCheckIns,
    saveManualCheckIns,
    listWeddingGifts,
    saveWeddingGifts,
    getActiveEventId,
} from "@/shared/storage";
import { toast } from "../../shared/ui/toast";
import QrCameraScanner from "./components/QrCameraScanner";
import "./InvitationPages.css";

function playBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.22, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.16);
    } catch {
        // audio muted or blocked
    }
}

function playWarningBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.28);
    } catch {
        // audio muted or blocked
    }
}

function SummaryCard({ label, value, subtitle, icon: Icon, theme = "gold" }) {
    const themeStyles = {
        gold: { bg: "rgba(176, 146, 106, 0.14)", color: "#B0926A" },
        green: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669" },
        amber: { bg: "rgba(245, 158, 11, 0.12)", color: "#d97706" },
        emerald: { bg: "rgba(176, 146, 106, 0.18)", color: "#8c6f4b" },
    }[theme] || { bg: "rgba(176, 146, 106, 0.14)", color: "#B0926A" };

    return (
        <article className="checkin-kpi-card guest-stat">
            <div className="checkin-kpi-icon-wrap" style={{ background: themeStyles.bg, color: themeStyles.color }}>
                {Icon ? <Icon size={24} /> : null}
            </div>
            <div className="checkin-kpi-info">
                <span className="checkin-kpi-label">{label}</span>
                <strong className="checkin-kpi-value">{value}</strong>
                {subtitle && <span className="checkin-kpi-sub">{subtitle}</span>}
            </div>
        </article>
    );
}

export default function InvitationCheckInPage() {
    const { invitationId: rawInvitationId } = useParams();
    const navigate = useNavigate();

    const invitationId = useMemo(() => {
        if (!rawInvitationId) return "";
        return rawInvitationId.replace(/^inv-/, "");
    }, [rawInvitationId]);

    const [invitation, setInvitation] = useState(null);
    const [guests, setGuests] = useState([]);
    const [summary, setSummary] = useState(null);
    const [checkIns, setCheckIns] = useState([]);
    const [token, setToken] = useState("");
    const [note, setNote] = useState("");
    const [tokenGiftAmount, setTokenGiftAmount] = useState("");
    const [tokenGiftCurrency, setTokenGiftCurrency] = useState("USD");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Killer Features: Popups & Modals
    const [celebrationData, setCelebrationData] = useState(null);
    const [celebrationGiftAmount, setCelebrationGiftAmount] = useState("");
    const [celebrationGiftCurrency, setCelebrationGiftCurrency] = useState("USD");

    const [duplicateWarning, setDuplicateWarning] = useState(null);

    const [walkInModalOpen, setWalkInModalOpen] = useState(false);
    const [walkInForm, setWalkInForm] = useState({
        name: "",
        table: "",
        phone: "",
        group: "ភ្ញៀវទូទៅ",
        side: "ខាងកូនកំលោះ",
        gift: "",
        currency: "USD",
    });

    const load = useCallback(() => {
        let active = true;
        if (!invitationId) return;

        Promise.all([
            invitationService.get(invitationId).catch(() => null),
            guestService.listByInvitation(invitationId).catch(() => []),
            guestService.checkInSummary(invitationId).catch(() => null),
            guestService.checkInList(invitationId).catch(() => []),
        ])
            .then(([invitationData, guestsData, summaryData, checkInData]) => {
                if (!active) return;
                setInvitation(invitationData);

                let resolvedGuests = Array.isArray(guestsData) ? guestsData : [];
                if (!resolvedGuests.length) {
                    const localGuests = listManualGuests(invitationId);
                    if (localGuests && localGuests.length > 0) {
                        resolvedGuests = localGuests;
                    } else {
                        const activeEventGuests = listManualGuests(getActiveEventId());
                        if (activeEventGuests && activeEventGuests.length > 0) {
                            resolvedGuests = activeEventGuests;
                        } else {
                            const anyGuests = listManualGuests();
                            if (anyGuests && anyGuests.length > 0) {
                                resolvedGuests = anyGuests;
                            }
                        }
                    }
                }
                setGuests(resolvedGuests);

                let resolvedCheckIns = Array.isArray(checkInData) ? checkInData : [];
                if (!resolvedCheckIns.length) {
                    const localCheckIns = listManualCheckIns(invitationId);
                    if (localCheckIns && localCheckIns.length > 0) {
                        resolvedCheckIns = localCheckIns;
                    }
                }
                setCheckIns(resolvedCheckIns);

                const totalCount = resolvedGuests.length;
                const checkedCount = resolvedCheckIns.length;
                const remainCount = Math.max(0, totalCount - checkedCount);

                let resolvedSummary = summaryData;
                if (!resolvedSummary || typeof resolvedSummary.totalGuests === "undefined") {
                    resolvedSummary = {
                        totalGuests: totalCount,
                        checkedIn: checkedCount,
                        attendingCheckedIn: checkedCount,
                        remaining: remainCount,
                    };
                }
                setSummary(resolvedSummary);
                setError("");
            })
            .catch(async (err) => {
                if (!active) return;
                try {
                    const mine = await invitationService.listMine();
                    const list = Array.isArray(mine) ? mine : mine?.data || [];
                    const first = list[0];
                    const realId = first?.id || first?.invitationId;
                    if (realId && String(realId) !== String(invitationId) && active) {
                        navigate(`/dashboard/invitations/${realId}/check-in`, { replace: true });
                        return;
                    }
                } catch {
                    // ignore
                }
                if (active) setError(err.message || "Could not load check-in data");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [invitationId, navigate]);

    useEffect(() => load(), [load]);

    const recordGiftItem = useCallback((guestName, amount, currency, noteText) => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        try {
            const currentGifts = listWeddingGifts([], invitationId);
            const newGift = {
                id: `gift-${Date.now()}`,
                donorName: guestName,
                amount: Number(amount),
                currency: currency || "USD",
                category: "ENVELOPE",
                note: noteText || "កត់ត្រាពេល Check-in",
                createdAt: new Date().toISOString(),
            };
            const updated = [newGift, ...currentGifts];
            saveWeddingGifts(updated, invitationId);
            toast(`បានកត់ត្រាចងដៃ ${amount} ${currency} ជូន ${guestName}`);
        } catch (err) {
            console.warn("Failed to save gift to storage:", err);
        }
    }, [invitationId]);

    const refreshCheckIns = useCallback(async () => {
        if (/^\d+$/.test(invitationId)) {
            try {
                const [summaryData, checkInData] = await Promise.all([
                    guestService.checkInSummary(invitationId),
                    guestService.checkInList(invitationId),
                ]);
                if (summaryData) setSummary(summaryData);
                if (checkInData) setCheckIns(checkInData);
                return;
            } catch {
                // fall through
            }
        }

        const localCheckIns = listManualCheckIns(invitationId);
        setCheckIns(localCheckIns || []);
        const total = guests.length;
        const checked = (localCheckIns || []).length;
        setSummary({
            totalGuests: total,
            checkedIn: checked,
            attendingCheckedIn: checked,
            remaining: Math.max(0, total - checked),
        });
    }, [invitationId, guests]);

    const triggerCelebration = useCallback((guestName, tableNumber, groupName, side, checkInId) => {
        setDuplicateWarning(null);
        setCelebrationData({
            guestName,
            tableNumber,
            groupName,
            side,
            checkInId,
        });
        setCelebrationGiftAmount("");
    }, []);

    const scan = async (event) => {
        if (event) event.preventDefault();
        const cleanToken = token.trim();
        if (!cleanToken || saving) return;

        setSaving(true);
        setError("");
        try {
            if (/^\d+$/.test(invitationId)) {
                try {
                    const result = await guestService.scanCheckIn(invitationId, cleanToken, note);
                    if (result?.alreadyCheckedIn) {
                        playWarningBeep();
                        setDuplicateWarning({
                            guestName: result?.guestName || cleanToken,
                            checkedInAt: "មុននេះបន្តិច",
                            source: "Server Record",
                        });
                        toast("ភ្ញៀវនេះបាន Check-in រួចរាល់ហើយ!");
                    } else {
                        playBeep();
                        triggerCelebration(result?.guestName || cleanToken, result?.tableNumber || "", result?.groupName || "", result?.side || "");
                        if (tokenGiftAmount) {
                            recordGiftItem(result?.guestName || cleanToken, tokenGiftAmount, tokenGiftCurrency, note);
                        }
                    }
                    setToken("");
                    setNote("");
                    setTokenGiftAmount("");
                    await refreshCheckIns();
                    return;
                } catch (err) {
                    console.warn("Backend scan error, trying local match:", err);
                }
            }

            const tokenLower = cleanToken.toLowerCase();
            const matched = guests.find((g) => {
                if (g.token && g.token.toLowerCase() === tokenLower) return true;
                if (g.slug && cleanToken.includes(g.slug)) return true;
                if (cleanToken.includes("/i/") && g.slug && cleanToken.includes(g.slug)) return true;
                if (g.id && String(g.id) === cleanToken) return true;
                if (g.phone && g.phone === cleanToken) return true;
                if (g.guestName && g.guestName.toLowerCase() === tokenLower) return true;
                return false;
            });

            const guestName = matched ? (matched.guestName || matched.name) : cleanToken;
            const guestId = matched ? matched.id : `guest-${Date.now()}`;
            const tableNumber = matched?.tableNumber || matched?.table || "";
            const groupName = matched?.groupName || matched?.group || "";
            const side = matched?.side || "";

            const existingCheckIn = checkIns.find(
                (c) => String(c.guestId) === String(guestId) || c.guestName?.toLowerCase() === guestName.toLowerCase()
            );

            if (existingCheckIn) {
                playWarningBeep();
                setDuplicateWarning({
                    guestName,
                    checkedInAt: existingCheckIn.checkedInAt
                        ? new Intl.DateTimeFormat("en", { timeStyle: "short", dateStyle: "short" }).format(new Date(existingCheckIn.checkedInAt))
                        : "មុននេះ",
                    source: existingCheckIn.source || "QR Scan",
                });
                toast("⚠️ ភ្ញៀវនេះបាន Check-in រួចរាល់ហើយ!");
                setToken("");
                return;
            }

            playBeep();
            const newCheckIn = {
                id: `cin-${Date.now()}`,
                guestId,
                guestName,
                source: "QR Token",
                note: note || "",
                tableNumber,
                groupName,
                side,
                giftAmount: tokenGiftAmount || "",
                giftCurrency: tokenGiftCurrency || "USD",
                checkedInAt: new Date().toISOString(),
            };

            const updatedCheckIns = [newCheckIn, ...checkIns];
            setCheckIns(updatedCheckIns);
            saveManualCheckIns(updatedCheckIns, invitationId);

            if (tokenGiftAmount) {
                recordGiftItem(guestName, tokenGiftAmount, tokenGiftCurrency, note);
            }

            triggerCelebration(guestName, tableNumber, groupName, side, newCheckIn.id);

            setToken("");
            setNote("");
            setTokenGiftAmount("");
            setSummary({
                totalGuests: guests.length,
                checkedIn: updatedCheckIns.length,
                attendingCheckedIn: updatedCheckIns.length,
                remaining: Math.max(0, guests.length - updatedCheckIns.length),
            });
        } catch (err) {
            setError(err.message || "Could not check in guest");
        } finally {
            setSaving(false);
        }
    };

    const handleCameraScan = useCallback(async (scannedToken) => {
        if (!scannedToken || saving) return;
        setSaving(true);
        setError("");
        try {
            if (/^\d+$/.test(invitationId)) {
                try {
                    const result = await guestService.scanCheckIn(invitationId, scannedToken, note);
                    if (result?.alreadyCheckedIn) {
                        playWarningBeep();
                        setDuplicateWarning({
                            guestName: result?.guestName || scannedToken,
                            checkedInAt: "មុននេះបន្តិច",
                            source: "Camera Scan",
                        });
                        toast("ភ្ញៀវនេះបាន Check-in រួចរាល់ហើយ!");
                    } else {
                        playBeep();
                        triggerCelebration(result?.guestName || scannedToken, result?.tableNumber || "", result?.groupName || "", result?.side || "");
                    }
                    await refreshCheckIns();
                    return;
                } catch {
                    // fall through
                }
            }

            const cleanToken = scannedToken.trim();
            const tokenLower = cleanToken.toLowerCase();
            const matched = guests.find((g) => {
                if (g.token && g.token.toLowerCase() === tokenLower) return true;
                if (g.slug && cleanToken.includes(g.slug)) return true;
                if (cleanToken.includes("/i/") && g.slug && cleanToken.includes(g.slug)) return true;
                if (g.id && String(g.id) === cleanToken) return true;
                if (g.phone && g.phone === cleanToken) return true;
                if (g.guestName && g.guestName.toLowerCase() === tokenLower) return true;
                return false;
            });

            const guestName = matched ? (matched.guestName || matched.name) : cleanToken;
            const guestId = matched ? matched.id : `guest-${Date.now()}`;
            const tableNumber = matched?.tableNumber || matched?.table || "";
            const groupName = matched?.groupName || matched?.group || "";
            const side = matched?.side || "";

            const existingCheckIn = checkIns.find(
                (c) => String(c.guestId) === String(guestId) || c.guestName?.toLowerCase() === guestName.toLowerCase()
            );

            if (existingCheckIn) {
                playWarningBeep();
                setDuplicateWarning({
                    guestName,
                    checkedInAt: existingCheckIn.checkedInAt
                        ? new Intl.DateTimeFormat("en", { timeStyle: "short", dateStyle: "short" }).format(new Date(existingCheckIn.checkedInAt))
                        : "មុននេះ",
                    source: existingCheckIn.source || "Camera Scan",
                });
                toast("⚠️ ភ្ញៀវនេះបាន Check-in រួចរាល់ហើយ!");
                return;
            }

            playBeep();
            const newCheckIn = {
                id: `cin-${Date.now()}`,
                guestId,
                guestName,
                source: "Camera QR",
                note: note || "",
                tableNumber,
                groupName,
                side,
                checkedInAt: new Date().toISOString(),
            };

            const updated = [newCheckIn, ...checkIns];
            setCheckIns(updated);
            saveManualCheckIns(updated, invitationId);
            triggerCelebration(guestName, tableNumber, groupName, side, newCheckIn.id);

            setSummary({
                totalGuests: guests.length,
                checkedIn: updated.length,
                attendingCheckedIn: updated.length,
                remaining: Math.max(0, guests.length - updated.length),
            });
        } catch (err) {
            setError(err.message || "Could not check in guest");
        } finally {
            setSaving(false);
        }
    }, [invitationId, guests, checkIns, note, saving, refreshCheckIns, triggerCelebration]);

    const manual = async (guest) => {
        setSaving(true);
        setError("");
        try {
            if (/^\d+$/.test(invitationId)) {
                try {
                    const result = await guestService.manualCheckIn(invitationId, guest.id);
                    if (result?.alreadyCheckedIn) {
                        playWarningBeep();
                        toast("Guest was already checked in");
                    } else {
                        playBeep();
                        triggerCelebration(guest.guestName, guest.tableNumber || "", guest.groupName || "", guest.side || "");
                    }
                    await refreshCheckIns();
                    return;
                } catch {
                    // fall through
                }
            }

            const guestId = guest.id;
            const alreadyChecked = checkIns.some((c) => String(c.guestId) === String(guestId));
            if (alreadyChecked) {
                playWarningBeep();
                toast("Guest was already checked in");
                return;
            }

            playBeep();
            const newCheckIn = {
                id: `cin-${Date.now()}`,
                guestId,
                guestName: guest.guestName || guest.name,
                source: "Manual Desk",
                note: "",
                tableNumber: guest.tableNumber || guest.table || "",
                groupName: guest.groupName || guest.group || "",
                side: guest.side || "",
                checkedInAt: new Date().toISOString(),
            };

            const updated = [newCheckIn, ...checkIns];
            setCheckIns(updated);
            saveManualCheckIns(updated, invitationId);
            triggerCelebration(guest.guestName, guest.tableNumber || "", guest.groupName || "", guest.side || "", newCheckIn.id);

            setSummary({
                totalGuests: guests.length,
                checkedIn: updated.length,
                attendingCheckedIn: updated.length,
                remaining: Math.max(0, guests.length - updated.length),
            });
        } catch (err) {
            setError(err.message || "Could not check in guest");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCelebrationAndClose = () => {
        if (celebrationData && celebrationGiftAmount) {
            recordGiftItem(
                celebrationData.guestName,
                celebrationGiftAmount,
                celebrationGiftCurrency,
                "ចងដៃពេល Check-in"
            );
        }
        setCelebrationData(null);
        setCelebrationGiftAmount("");
    };

    const handleCreateWalkInGuest = (e) => {
        e.preventDefault();
        if (!walkInForm.name.trim()) return;

        const newGuest = {
            id: `walkin-${Date.now()}`,
            guestName: walkInForm.name.trim(),
            tableNumber: walkInForm.table.trim(),
            phone: walkInForm.phone.trim(),
            groupName: walkInForm.group || "ភ្ញៀវទូទៅ",
            side: walkInForm.side || "ខាងកូនកំលោះ",
            token: `tok-${Date.now().toString(36)}`,
            createdAt: new Date().toISOString(),
        };

        const updatedGuests = [newGuest, ...guests];
        setGuests(updatedGuests);
        saveManualGuests(updatedGuests, invitationId);

        const newCheckIn = {
            id: `cin-${Date.now()}`,
            guestId: newGuest.id,
            guestName: newGuest.guestName,
            source: "Walk-in Desk",
            note: "ភ្ញៀវមកបន្ថែម (Walk-in)",
            tableNumber: newGuest.tableNumber,
            groupName: newGuest.groupName,
            side: newGuest.side,
            checkedInAt: new Date().toISOString(),
        };

        const updatedCheckIns = [newCheckIn, ...checkIns];
        setCheckIns(updatedCheckIns);
        saveManualCheckIns(updatedCheckIns, invitationId);

        if (walkInForm.gift) {
            recordGiftItem(
                newGuest.guestName,
                walkInForm.gift,
                walkInForm.currency,
                "ចងដៃភ្ញៀវ Walk-in"
            );
        }

        playBeep();
        toast(`បានចុះឈ្មោះ និង Check-in ជូន "${newGuest.guestName}" ជោគជ័យ!`);

        setWalkInModalOpen(false);
        setWalkInForm({
            name: "",
            table: "",
            phone: "",
            group: "ភ្ញៀវទូទៅ",
            side: "ខាងកូនកំលោះ",
            gift: "",
            currency: "USD",
        });

        triggerCelebration(newGuest.guestName, newGuest.tableNumber, newGuest.groupName, newGuest.side, newCheckIn.id);

        setSummary({
            totalGuests: updatedGuests.length,
            checkedIn: updatedCheckIns.length,
            attendingCheckedIn: updatedCheckIns.length,
            remaining: Math.max(0, updatedGuests.length - updatedCheckIns.length),
        });
    };

    const undoCheckIn = (item) => {
        const confirmUndo = window.confirm(`តើអ្នកចង់ដកការកត់ត្រាវត្តមានរបស់ "${item.guestName}" វិញមែនទេ?`);
        if (!confirmUndo) return;

        const updated = checkIns.filter((c) => c.id !== item.id && c.guestId !== item.guestId);
        setCheckIns(updated);
        saveManualCheckIns(updated, invitationId);
        toast("បានដកការកត់ត្រាវត្តមានរួចរាល់");
        setSummary({
            totalGuests: guests.length,
            checkedIn: updated.length,
            attendingCheckedIn: updated.length,
            remaining: Math.max(0, guests.length - updated.length),
        });
    };

    const checkedGuestIds = useMemo(() => new Set(checkIns.map((item) => item.guestId)), [checkIns]);

    const filteredGuests = useMemo(() => {
        return guests.filter((guest) => {
            const isChecked = checkedGuestIds.has(guest.id);
            if (statusFilter === "pending" && isChecked) return false;
            if (statusFilter === "checked" && !isChecked) return false;

            const keyword = search.trim().toLowerCase();
            if (!keyword) return true;
            return (
                (guest.guestName || "").toLowerCase().includes(keyword) ||
                (guest.phone || "").toLowerCase().includes(keyword) ||
                (guest.email || "").toLowerCase().includes(keyword) ||
                (guest.tableNumber && String(guest.tableNumber).toLowerCase().includes(keyword)) ||
                (guest.groupName && guest.groupName.toLowerCase().includes(keyword))
            );
        });
    }, [guests, checkedGuestIds, statusFilter, search]);

    const turnoutPercentage = useMemo(() => {
        const total = summary?.totalGuests || guests.length;
        const attended = summary?.checkedIn || checkIns.length;
        if (!total) return 0;
        return Math.round((attended / total) * 100);
    }, [summary, guests.length, checkIns.length]);

    if (loading) {
        return (
            <div className="inv-page">
                <div className="inv-loading" style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw className="animate-spin" size={28} style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontWeight: 600 }}>កំពុងដំណើរការទិន្នន័យ Check-in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="inv-page">
            {/* Back Button Bar */}
            <div style={{ marginBottom: "20px" }}>
                <button
                    type="button"
                    className="checkin-back-nav-btn"
                    onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate(`/dashboard/invitations/${invitationId}/guests`);
                        }
                    }}
                >
                    <ArrowLeft size={16} /> ត្រឡប់ក្រោយ (Back)
                </button>
            </div>

            {/* Duplicate Scan Warning Banner */}
            {duplicateWarning && (
                <div className="checkin-duplicate-banner" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 20px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    color: "#92400e"
                }}>
                    <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                            ⚠️ ភ្ញៀវនេះបាន Check-in រួចរាល់ហើយ! (Already Checked In)
                        </div>
                        <div style={{ fontSize: "0.84rem", marginTop: "3px", color: "#78350f" }}>
                            ឈ្មោះ: <strong>{duplicateWarning.guestName}</strong> • បានចូលនៅម៉ោង: {duplicateWarning.checkedInAt} ({duplicateWarning.source})
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDuplicateWarning(null)}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#92400e" }}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Header Banner */}
            <div className="checkin-hero-banner inv-page-header">
                <div>
                    <div className="checkin-badge inv-eyebrow">
                        <Sparkles size={14} /> QR CHECK-IN DESK
                    </div>
                    <h1 className="checkin-hero-title">{invitation?.title || "Invitation check-in"}</h1>
                    <p className="checkin-hero-desc">
                        ស្កេន QR Code កាតអញ្ជើញ ឬស្វែងរកឈ្មោះភ្ញៀវ ដើម្បីកត់ត្រាវត្តមានចូលរួមមង្គលការជាក់ស្តែង
                    </p>
                </div>
                <div className="checkin-hero-actions">
                    <button
                        className="checkin-btn-primary"
                        type="button"
                        onClick={() => setWalkInModalOpen(true)}
                    >
                        <UserPlus size={16} /> + បន្ថែមភ្ញៀវ (Walk-in)
                    </button>
                    <button
                        className="checkin-btn-secondary"
                        type="button"
                        onClick={() => navigate(`/dashboard/invitations/${invitationId}/guests`)}
                    >
                        <Users size={16} /> Guests
                    </button>
                    <button
                        className="checkin-btn-secondary"
                        type="button"
                        onClick={() => load()}
                        title="ផ្ទុកឡើងវិញ"
                    >
                        <RefreshCw size={15} /> ផ្ទុកឡើងវិញ
                    </button>
                </div>
            </div>

            {/* KPI Statistics */}
            {summary && (
                <div className="checkin-stats-grid guest-stats checkin-stats">
                    <SummaryCard
                        label="Total guests"
                        value={summary.totalGuests}
                        subtitle="ភ្ញៀវសរុបក្នុងបញ្ជី"
                        icon={Users}
                        theme="gold"
                    />
                    <SummaryCard
                        label="Checked in"
                        value={summary.checkedIn}
                        subtitle="បានស្កេនចូលរួមពិធី"
                        icon={CheckCircle2}
                        theme="green"
                    />
                    <SummaryCard
                        label="Remaining"
                        value={summary.remaining}
                        subtitle="ភ្ញៀវកំពុងរង់ចាំ"
                        icon={Clock}
                        theme="amber"
                    />
                    <SummaryCard
                        label="Attending checked in"
                        value={`${turnoutPercentage}%`}
                        subtitle={`${summary.checkedIn} / ${summary.totalGuests} នាក់`}
                        icon={TrendingUp}
                        theme="emerald"
                    />
                </div>
            )}

            {error && <div className="inv-error" style={{ marginBottom: "20px" }}>{error}</div>}

            {/* Live Camera Scanner */}
            <QrCameraScanner onScan={handleCameraScan} disabled={saving} />

            {/* Main Workstation 2-Columns */}
            <section className="checkin-layout checkin-workspace-layout">
                {/* Left Column: Manual / Gun Scanner Token Form */}
                <form className="guest-form checkin-panel-card" onSubmit={scan}>
                    <div className="checkin-panel-header">
                        <h2 className="checkin-panel-title">
                            <QrCode size={20} color="#B0926A" /> Scan token
                        </h2>
                        <span style={{ fontSize: "0.78rem", color: "#8c6f4b", fontWeight: 700, background: "rgba(176, 146, 106, 0.12)", padding: "3px 10px", borderRadius: "999px" }}>
                            Scanner Gun / Link
                        </span>
                    </div>

                    <div className="checkin-input-group">
                        <label>
                            <span>QR link or token</span>
                            {token && (
                                <button
                                    type="button"
                                    onClick={() => setToken("")}
                                    style={{
                                        border: "none",
                                        background: "none",
                                        color: "#94a3b8",
                                        cursor: "pointer",
                                        fontSize: "0.75rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "2px",
                                    }}
                                >
                                    <X size={12} /> Clear
                                </button>
                            )}
                        </label>
                        <textarea
                            className="checkin-textarea"
                            value={token}
                            rows="2"
                            onChange={(event) => setToken(event.target.value)}
                            placeholder="Paste /i/slug?token=... or token"
                            required
                        />
                    </div>

                    {/* Quick Gift input during manual entry */}
                    <div className="checkin-input-group">
                        <label>
                            <span><Gift size={13} style={{ display: "inline", marginRight: "3px" }} /> ចងដៃ (Gift Amount - Optional)</span>
                        </label>
                        <div className="checkin-gift-row">
                            <input
                                type="number"
                                className="checkin-gift-input"
                                value={tokenGiftAmount}
                                onChange={(e) => setTokenGiftAmount(e.target.value)}
                                placeholder="ចំនួនទឹកប្រាក់..."
                            />
                            <div className="checkin-gift-currency-toggle">
                                <button
                                    type="button"
                                    className={`checkin-currency-btn ${tokenGiftCurrency === "USD" ? "active" : ""}`}
                                    onClick={() => setTokenGiftCurrency("USD")}
                                >
                                    $
                                </button>
                                <button
                                    type="button"
                                    className={`checkin-currency-btn ${tokenGiftCurrency === "KHR" ? "active" : ""}`}
                                    onClick={() => setTokenGiftCurrency("KHR")}
                                >
                                    ៛
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="checkin-input-group">
                        <label>
                            <span>Note</span>
                        </label>
                        <input
                            className="checkin-input"
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="ចំណាំ (ឧ. មកជាមួយគូស្នេហ៍...)"
                        />
                    </div>

                    <button
                        className="checkin-submit-btn inv-primary-btn"
                        type="submit"
                        disabled={saving || !token.trim()}
                        aria-label="Check in"
                    >
                        {saving ? "Checking..." : "Check in"}
                    </button>

                    <div style={{ marginTop: "16px", padding: "12px 16px", background: "#fdfaf5", border: "1px solid #eadfce", borderRadius: "14px", fontSize: "13px", color: "#7d6443", lineHeight: 1.5 }}>
                        💡 <strong>គន្លឹះ:</strong> អាចប្រើកាំភ្លើងបាញ់ Barcode/QR (USB Scanner) បាញ់ចូលកន្លែងនេះ ឬបិទភ្ជាប់ Link ធៀបភ្ញៀវ។
                    </div>
                </form>

                {/* Right Column: Guest List & Quick Check-In */}
                <section className="guest-table-panel checkin-panel-card">
                    <div className="checkin-panel-header">
                        <h2 className="checkin-panel-title">
                            <Users size={20} color="#B0926A" /> បញ្ជីភ្ញៀវ & ស្កេនរហ័ស
                        </h2>
                        <span style={{ fontSize: "0.82rem", color: "#8c6f4b", fontWeight: 700, background: "rgba(176, 146, 106, 0.12)", padding: "3px 12px", borderRadius: "999px" }}>
                            {filteredGuests.length} / {guests.length} នាក់
                        </span>
                    </div>

                    <div className="checkin-search-wrap guest-search">
                        <div className="checkin-search-box">
                            <Search className="checkin-search-icon" size={16} />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search guest"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        background: "none",
                                        color: "#94a3b8",
                                        cursor: "pointer",
                                    }}
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <div className="checkin-filter-tabs">
                            <button
                                type="button"
                                className={`checkin-tab-btn ${statusFilter === "all" ? "active" : ""}`}
                                onClick={() => setStatusFilter("all")}
                            >
                                ទាំងអស់ ({guests.length})
                            </button>
                            <button
                                type="button"
                                className={`checkin-tab-btn ${statusFilter === "pending" ? "active" : ""}`}
                                onClick={() => setStatusFilter("pending")}
                            >
                                រង់ចាំ ({Math.max(0, guests.length - checkIns.length)})
                            </button>
                            <button
                                type="button"
                                className={`checkin-tab-btn ${statusFilter === "checked" ? "active" : ""}`}
                                onClick={() => setStatusFilter("checked")}
                            >
                                បានចូល ({checkIns.length})
                            </button>
                        </div>
                    </div>

                    <div className="guest-table-wrap">
                        <table className="checkin-guest-table guest-table">
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGuests.map((guest) => {
                                    const checked = checkedGuestIds.has(guest.id);
                                    const initial = (guest.guestName || "G").charAt(0).toUpperCase();
                                    return (
                                        <tr key={guest.id}>
                                            <td>
                                                <div className="checkin-guest-cell">
                                                    <div className="checkin-avatar">{initial}</div>
                                                    <div>
                                                        <div className="checkin-guest-name">
                                                            {guest.guestName}
                                                            {guest.groupName && (
                                                                <span className={`checkin-tag-pill ${guest.groupName.includes("VIP") ? "vip" : ""}`}>
                                                                    {guest.groupName}
                                                                </span>
                                                            )}
                                                            {guest.side && (
                                                                <span className="checkin-tag-pill">
                                                                    {guest.side}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {guest.tableNumber && (
                                                            <div style={{ marginTop: "4px" }}>
                                                                <span className="checkin-tag-pill table">
                                                                    តុលេខ {guest.tableNumber}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span style={{ fontWeight: 600, color: "#1f2421" }}>{guest.phone || "No phone"}</span>
                                                    {guest.email ? <small style={{ color: "#8b7a66", display: "block" }}>{guest.email}</small> : null}
                                                </div>
                                            </td>
                                            <td>
                                                {checked ? (
                                                    <span className="checkin-status-badge checked">
                                                        <CheckCircle2 size={13} /> Checked in
                                                    </span>
                                                ) : (
                                                    <span className="checkin-status-badge waiting">
                                                        <Clock size={13} /> Waiting
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <button
                                                    className={`checkin-row-btn inv-secondary-btn ${checked ? "is-checked" : "action-checkin"}`}
                                                    type="button"
                                                    disabled={saving || checked}
                                                    onClick={() => manual(guest)}
                                                    aria-label={checked ? "✓ Checked in" : "Check in"}
                                                >
                                                    {checked ? "✓ Checked in" : "Check in"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!filteredGuests.length && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "36px 16px", color: "#8b7a66" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                                <Search size={28} color="#cbbeaa" />
                                                <span>No guests found.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>

            {/* Checked-In History Feed */}
            <section className="guest-table-panel checkin-list checkin-panel-card" style={{ marginTop: "24px" }}>
                <div className="checkin-panel-header">
                    <h2 className="checkin-panel-title">
                        <CheckCircle2 size={20} color="#059669" /> Checked-in guests
                    </h2>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#059669", background: "rgba(16, 185, 129, 0.12)", padding: "3px 12px", borderRadius: "999px" }}>
                        សរុប {checkIns.length} នាក់
                    </span>
                </div>

                <div className="guest-table-wrap">
                    <table className="checkin-guest-table guest-table">
                        <thead>
                            <tr>
                                <th>Guest</th>
                                <th>Source</th>
                                <th>Checked in</th>
                                <th style={{ textAlign: "right" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkIns.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: "#1f2421" }}>
                                            {item.guestName || "Guest"}
                                            {item.tableNumber && (
                                                <span className="checkin-tag-pill table" style={{ marginLeft: "8px" }}>
                                                    តុ {item.tableNumber}
                                                </span>
                                            )}
                                        </div>
                                        {item.giftAmount && (
                                            <div style={{ fontSize: "0.8rem", color: "#0f766e", fontWeight: 700, marginTop: "2px" }}>
                                                🎁 ចងដៃ: {item.giftAmount} {item.giftCurrency || "USD"}
                                            </div>
                                        )}
                                        {item.note && (
                                            <div style={{ fontSize: "0.78rem", color: "#8b7a66", marginTop: "2px" }}>
                                                📝 {item.note}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                padding: "3px 8px",
                                                borderRadius: "6px",
                                                fontSize: "0.74rem",
                                                fontWeight: 600,
                                                background: item.source?.includes("Camera") ? "#ecfdf5" : "#f7f1e6",
                                                color: item.source?.includes("Camera") ? "#0f766e" : "#78664f",
                                                border: item.source?.includes("Camera") ? "1px solid #a7f3d0" : "1px solid #ebdcc8",
                                            }}
                                        >
                                            {item.source || "Manual"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "0.82rem", color: "#1f2421", fontWeight: 600 }}>
                                            {item.checkedInAt
                                                ? new Intl.DateTimeFormat("en", {
                                                      dateStyle: "medium",
                                                      timeStyle: "short",
                                                  }).format(new Date(item.checkedInAt))
                                                : "—"}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            type="button"
                                            onClick={() => undoCheckIn(item)}
                                            title="ដកការកត់ត្រាវត្តមានវិញ"
                                            style={{
                                                border: "1px solid #fed7aa",
                                                background: "#fff7ed",
                                                color: "#c2410c",
                                                borderRadius: "6px",
                                                padding: "4px 8px",
                                                fontSize: "0.74rem",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "3px",
                                            }}
                                        >
                                            <RotateCcw size={12} /> ដកចេញ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!checkIns.length && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", padding: "36px 16px", color: "#64748b" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                            <Clock size={28} color="#cbd5e1" />
                                            <span>No check-ins yet.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Instant Celebration & Seating Pop-up Modal */}
            {celebrationData && (
                <div className="checkin-modal-layer" onClick={handleSaveCelebrationAndClose}>
                    <div className="checkin-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="checkin-modal-x"
                            onClick={handleSaveCelebrationAndClose}
                            aria-label="បិទ (Close)"
                        >
                            <X size={18} />
                        </button>

                        <div className="checkin-modal-inner">
                            <h3 className="checkin-modal-title">
                                <Sparkles size={22} /> ស្កេនជោគជ័យ (Check-in Success)
                            </h3>

                            <div style={{ textAlign: "center", margin: "14px 0 16px" }}>
                                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#2a1f10" }}>
                                    {celebrationData.guestName}
                                </div>
                                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#8c7a65" }}>
                                    សូមស្វាគមន៍វត្តមានក្នុងពិធីមង្គលការដ៏សិរីសួស្តី
                                </p>
                            </div>

                            <div className="checkin-table-display-card">
                                <div className="checkin-table-label">កន្លែងអង្គុយ / SEATING TABLE</div>
                                <div className="checkin-table-number-huge">
                                    {celebrationData.tableNumber ? `តុលេខ ${celebrationData.tableNumber}` : "តុភ្ញៀវកិត្តិយស"}
                                </div>
                                <div className="checkin-meta-tags">
                                    {celebrationData.groupName && (
                                        <span className="checkin-tag-pill vip">ក្រុម: {celebrationData.groupName}</span>
                                    )}
                                    {celebrationData.side && (
                                        <span className="checkin-tag-pill">ផ្នែក: {celebrationData.side}</span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Gift Section inside celebration */}
                            <div className="checkin-gift-section">
                                <div className="checkin-gift-title">
                                    <Gift size={16} /> កត់ត្រាចងដៃភ្លាមៗ (Quick Gift Recording)
                                </div>
                                <div className="checkin-gift-row">
                                    <input
                                        type="number"
                                        className="checkin-gift-input"
                                        placeholder="ចំនួនទឹកប្រាក់ចងដៃ..."
                                        value={celebrationGiftAmount}
                                        onChange={(e) => setCelebrationGiftAmount(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="checkin-gift-currency-toggle">
                                        <button
                                            type="button"
                                            className={`checkin-currency-btn ${celebrationGiftCurrency === "USD" ? "active" : ""}`}
                                            onClick={() => setCelebrationGiftCurrency("USD")}
                                        >
                                            $
                                        </button>
                                        <button
                                            type="button"
                                            className={`checkin-currency-btn ${celebrationGiftCurrency === "KHR" ? "active" : ""}`}
                                            onClick={() => setCelebrationGiftCurrency("KHR")}
                                        >
                                            ៛
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="checkin-form-actions">
                                <button
                                    type="button"
                                    className="checkin-btn-submit"
                                    onClick={handleSaveCelebrationAndClose}
                                >
                                    <Check size={18} /> {celebrationGiftAmount ? "កត់ត្រាចងដៃ & រួចរាល់" : "យល់ព្រម (Next Guest)"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Walk-in Guest Modal */}
            {walkInModalOpen && (
                <div className="checkin-modal-layer" onClick={() => setWalkInModalOpen(false)}>
                    <div className="checkin-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="checkin-modal-x"
                            onClick={() => setWalkInModalOpen(false)}
                            aria-label="បិទ (Close)"
                        >
                            <X size={18} />
                        </button>

                        <div className="checkin-modal-inner">
                            <form onSubmit={handleCreateWalkInGuest}>
                                <h3 className="checkin-modal-title">
                                    <UserPlus size={22} /> បន្ថែមភ្ញៀវបន្ទាន់នៅមាត់រោង (Walk-in Guest)
                                </h3>

                                <div className="checkin-field">
                                    <label>
                                        <span>ឈ្មោះភ្ញៀវ (Guest Name) <em style={{ color: "#dc2626", fontStyle: "normal" }}>*</em></span>
                                    </label>
                                    <input
                                        required
                                        value={walkInForm.name}
                                        onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                                        placeholder="ឧ. ឯកឧត្តម ជា សំណាង"
                                        autoFocus
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="checkin-field">
                                        <label>
                                            <span>លេខតុ (Table Number)</span>
                                        </label>
                                        <input
                                            value={walkInForm.table}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, table: e.target.value })}
                                            placeholder="ឧ. 05 ឬ VIP-01"
                                        />
                                    </div>
                                    <div className="checkin-field">
                                        <label>
                                            <span>លេខទូរស័ព្ទ (Phone)</span>
                                        </label>
                                        <input
                                            value={walkInForm.phone}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                                            placeholder="012 345 678"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="checkin-field">
                                        <label>
                                            <span>ក្រុម (Group)</span>
                                        </label>
                                        <select
                                            value={walkInForm.group}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, group: e.target.value })}
                                        >
                                            <option value="ភ្ញៀវទូទៅ">ភ្ញៀវទូទៅ</option>
                                            <option value="ភ្ញៀវកិត្តិយស VIP">ភ្ញៀវកិត្តិយស VIP</option>
                                            <option value="មិត្តភក្តិ">មិត្តភក្តិ</option>
                                            <option value="សាច់ញាតិ">សាច់ញាតិ</option>
                                            <option value="មិត្តរួមការងារ">មិត្តរួមការងារ</option>
                                        </select>
                                    </div>
                                    <div className="checkin-field">
                                        <label>
                                            <span>ផ្នែក (Side)</span>
                                        </label>
                                        <select
                                            value={walkInForm.side}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, side: e.target.value })}
                                        >
                                            <option value="ខាងកូនកំលោះ">ខាងកូនកំលោះ</option>
                                            <option value="ខាងកូនក្រមុំ">ខាងកូនក្រមុំ</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="checkin-gift-section">
                                    <div className="checkin-gift-title">
                                        <Gift size={16} /> ចងដៃភ្លាមៗ (Gift Amount - Optional)
                                    </div>
                                    <div className="checkin-gift-row">
                                        <input
                                            type="number"
                                            className="checkin-gift-input"
                                            placeholder="ទឹកប្រាក់..."
                                            value={walkInForm.gift}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, gift: e.target.value })}
                                        />
                                        <div className="checkin-gift-currency-toggle">
                                            <button
                                                type="button"
                                                className={`checkin-currency-btn ${walkInForm.currency === "USD" ? "active" : ""}`}
                                                onClick={() => setWalkInForm({ ...walkInForm, currency: "USD" })}
                                            >
                                                $
                                            </button>
                                            <button
                                                type="button"
                                                className={`checkin-currency-btn ${walkInForm.currency === "KHR" ? "active" : ""}`}
                                                onClick={() => setWalkInForm({ ...walkInForm, currency: "KHR" })}
                                            >
                                                ៛
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="checkin-form-actions">
                                    <button
                                        type="button"
                                        className="checkin-btn-cancel"
                                        onClick={() => setWalkInModalOpen(false)}
                                    >
                                        បោះបង់
                                    </button>
                                    <button
                                        type="submit"
                                        className="checkin-btn-submit"
                                    >
                                        <UserPlus size={18} /> បន្ថែម & Check-in ភ្លាមៗ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
