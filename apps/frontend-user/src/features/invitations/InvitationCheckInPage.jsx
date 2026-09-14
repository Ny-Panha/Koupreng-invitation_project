import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { toast } from "../../shared/ui/toast";
import QrCameraScanner from "./components/QrCameraScanner";
import "./InvitationPages.css";

function SummaryCard({ label, value }) {
    return (
        <article className="guest-stat">
            <span>{label}</span>
            <strong>{value}</strong>
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
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(() => {
        let active = true;
        if (!invitationId) return;

        Promise.all([
            invitationService.get(invitationId),
            guestService.listByInvitation(invitationId),
            guestService.checkInSummary(invitationId),
            guestService.checkInList(invitationId),
        ])
            .then(([invitationData, guestsData, summaryData, checkInData]) => {
                if (!active) return;
                setInvitation(invitationData);
                setGuests(guestsData || []);
                setSummary(summaryData);
                setCheckIns(checkInData || []);
                setError("");
            })
            .catch(async (err) => {
                if (!active) return;
                // Auto-recovery: if 404, look up user's active invitations and redirect
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
                    // ignore fallback failure
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

    const refreshCheckIns = async () => {
        const [summaryData, checkInData] = await Promise.all([
            guestService.checkInSummary(invitationId),
            guestService.checkInList(invitationId),
        ]);
        setSummary(summaryData);
        setCheckIns(checkInData || []);
    };

    const scan = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const result = await guestService.scanCheckIn(invitationId, token, note);
            toast(result.alreadyCheckedIn ? "Guest was already checked in" : "Guest checked in");
            setToken("");
            setNote("");
            await refreshCheckIns();
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
            const result = await guestService.scanCheckIn(invitationId, scannedToken, note);
            toast(result.alreadyCheckedIn ? "Guest was already checked in" : "Guest checked in successfully! 🎉");
            await refreshCheckIns();
        } catch (err) {
            setError(err.message || "Could not check in guest");
        } finally {
            setSaving(false);
        }
    }, [invitationId, note, saving, refreshCheckIns]);

    const manual = async (guest) => {
        setSaving(true);
        setError("");
        try {
            const result = await guestService.manualCheckIn(invitationId, guest.id);
            toast(result.alreadyCheckedIn ? "Guest was already checked in" : "Guest checked in");
            await refreshCheckIns();
        } catch (err) {
            setError(err.message || "Could not check in guest");
        } finally {
            setSaving(false);
        }
    };

    const checkedGuestIds = useMemo(() => new Set(checkIns.map((item) => item.guestId)), [checkIns]);
    const visibleGuests = guests.filter((guest) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;
        return (guest.guestName || "").toLowerCase().includes(keyword)
            || (guest.phone || "").toLowerCase().includes(keyword)
            || (guest.email || "").toLowerCase().includes(keyword);
    });

    if (loading) {
        return <div className="inv-page"><div className="inv-loading">Loading check-in...</div></div>;
    }

    return (
        <div className="inv-page">
            <header className="inv-page-header">
                <div>
                    <span className="inv-eyebrow">QR check-in</span>
                    <h1>{invitation?.title || "Invitation check-in"}</h1>
                    <p>Scan guest invitation QR links or check guests in manually.</p>
                </div>
                <button className="inv-secondary-btn" type="button" onClick={() => navigate(`/dashboard/invitations/${invitationId}/guests`)}>
                    Guests
                </button>
            </header>

            {summary && (
                <div className="guest-stats checkin-stats">
                    <SummaryCard label="Total guests" value={summary.totalGuests} />
                    <SummaryCard label="Checked in" value={summary.checkedIn} />
                    <SummaryCard label="Attending checked in" value={summary.attendingCheckedIn ?? 0} />
                    <SummaryCard label="Remaining" value={summary.remaining} />
                </div>
            )}

            {error && <div className="inv-error">{error}</div>}

            <QrCameraScanner onScan={handleCameraScan} disabled={saving} />

            <section className="checkin-layout">
                <form className="guest-form" onSubmit={scan}>
                    <h2>Scan token</h2>
                    <label>
                        QR link or token
                        <textarea
                            value={token}
                            rows="4"
                            onChange={(event) => setToken(event.target.value)}
                            placeholder="Paste /i/slug?token=... or token"
                            required
                        />
                    </label>
                    <label>
                        Note
                        <input value={note} onChange={(event) => setNote(event.target.value)} />
                    </label>
                    <button className="inv-primary-btn" type="submit" disabled={saving}>
                        {saving ? "Checking..." : "Check in"}
                    </button>
                </form>

                <section className="guest-table-panel">
                    <form className="guest-search" onSubmit={(event) => event.preventDefault()}>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search guest"
                        />
                    </form>
                    <div className="guest-table-wrap">
                        <table className="guest-table">
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleGuests.map((guest) => {
                                    const checked = checkedGuestIds.has(guest.id);
                                    return (
                                        <tr key={guest.id}>
                                            <td>{guest.guestName}</td>
                                            <td>
                                                <span>{guest.phone || "No phone"}</span>
                                                {guest.email ? <small>{guest.email}</small> : null}
                                            </td>
                                            <td>{checked ? "Checked in" : "Waiting"}</td>
                                            <td>
                                                <button
                                                    className={`inv-secondary-btn ${checked ? "is-checked" : ""}`}
                                                    type="button"
                                                    disabled={saving || checked}
                                                    onClick={() => manual(guest)}
                                                >
                                                    {checked ? "✓ Checked in" : "Check in"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!visibleGuests.length && <tr><td colSpan="4">No guests found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>

            <section className="guest-table-panel checkin-list">
                <h2>Checked-in guests</h2>
                <div className="guest-table-wrap">
                    <table className="guest-table">
                        <thead>
                            <tr>
                                <th>Guest</th>
                                <th>Source</th>
                                <th>Checked in</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkIns.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.guestName || "Guest"}</td>
                                    <td>{item.source}</td>
                                    <td>{item.checkedInAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.checkedInAt)) : "—"}</td>
                                </tr>
                            ))}
                            {!checkIns.length && <tr><td colSpan="3">No check-ins yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
