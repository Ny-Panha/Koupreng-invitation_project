import { useCallback, useEffect, useState } from "react";
import { QRCode } from "react-qr-code";
import { rsvpService } from "@/features/rsvp/api/rsvpApi";
import { invitationService } from "@/features/invitations/api/invitationApi";

const initialForm = {
    guestName: "",
    phone: "",
    responseStatus: "ATTENDING",
    attendeeCount: 1,
    message: "",
};

const englishLabels = {
    receivedTitle: "RSVP received",
    receivedText: "Your response has been saved.",
    kicker: "RSVP",
    title: "Will you attend?",
    guestName: "Guest name",
    phone: "Phone",
    response: "Response",
    attending: "Attending",
    notAttending: "Not attending",
    maybe: "Maybe",
    attendeeCount: "Attendee count",
    message: "Message",
    submitting: "Submitting...",
    submit: "Submit RSVP",
    wishes: "Wishes",
    blessings: "Blessings from guests",
    guest: "Guest",
    qrPassTitle: "🎫 Check-in QR Pass",
    qrPassHint: "Show this QR code upon arrival at the wedding for check-in",
    editResponse: "Edit response",
    cancelEdit: "Back to QR Pass",
    table: "Table",
    seat: "Seat",
    copied: "Link copied!",
    copyLink: "Copy Pass Link",
};

const khmerLabels = {
    receivedTitle: "បានទទួល RSVP",
    receivedText: "ការឆ្លើយតបរបស់អ្នកត្រូវបានរក្សាទុកហើយ។",
    kicker: "ការឆ្លើយតប",
    title: "តើលោកអ្នកនឹងចូលរួមដែរឬទេ?",
    guestName: "ឈ្មោះភ្ញៀវ",
    phone: "លេខទូរស័ព្ទ",
    response: "ការចូលរួម",
    attending: "ចូលរួម",
    notAttending: "មិនអាចចូលរួម",
    maybe: "ប្រហែលជាចូលរួម",
    attendeeCount: "ចំនួនភ្ញៀវ",
    message: "សារជូនពរ",
    submitting: "កំពុងផ្ញើ...",
    submit: "ផ្ញើ RSVP",
    wishes: "ពាក្យជូនពរ",
    blessings: "ពរជ័យពីភ្ញៀវ",
    guest: "ភ្ញៀវ",
    qrPassTitle: "🎫 ប័ណ្ណស្កេនចូលរួម (QR Pass)",
    qrPassHint: "បង្ហាញ QR នេះពេលមកដល់មាត់រោងការដើម្បី Check-in",
    editResponse: "កែប្រែការឆ្លើយតប",
    cancelEdit: "ត្រឡប់ទៅប័ណ្ណ QR វិញ",
    table: "តុ",
    seat: "កៅអី",
    copied: "បានចម្លងតំណភ្ជាប់!",
    copyLink: "ចម្លងតំណភ្ជាប់ QR Pass",
};

export default function PublicRsvpForm({
    slug,
    inviteToken,
    accessToken,
    languageMode,
    khmerLabels: useKhmerLabels = false,
}) {
    const isKhmer = useKhmerLabels || languageMode === "KHMER" || languageMode === "khmer";
    const labels = isKhmer ? khmerLabels : englishLabels;

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [wishes, setWishes] = useState([]);

    const loadWishes = useCallback(() => {
        if (!slug) return;
        rsvpService.publicWishes(slug, { token: inviteToken, accessToken })
            .then((items) => setWishes(Array.isArray(items) ? items : []))
            .catch(() => setWishes([]));
    }, [slug, inviteToken, accessToken]);

    useEffect(() => {
        loadWishes();
    }, [loadWishes]);

    // Restore or fetch existing RSVP status so guest does not need to fill again
    useEffect(() => {
        let active = true;
        const storageKey = slug ? `koupreng_guest_rsvp_${slug}` : "";

        // 1. If an inviteToken is available, fetch personalized guest view to see if already answered
        if (inviteToken) {
            invitationService.publicGuestView(slug, { token: inviteToken })
                .then((data) => {
                    if (!active || !data) return;
                    if (data.rsvpStatus && data.rsvpStatus !== "PENDING") {
                        const existingData = {
                            guestName: data.guestName || "",
                            responseStatus: data.rsvpStatus,
                            attendeeCount: data.seatCount || 1,
                            inviteToken: inviteToken,
                            tableName: data.tableName,
                            seatNumber: data.seatNumber,
                        };
                        setSubmitted(existingData);
                        if (storageKey) {
                            try {
                                localStorage.setItem(storageKey, JSON.stringify(existingData));
                            } catch {
                                // ignore storage error
                            }
                        }
                    } else if (data.guestName) {
                        setForm((prev) => ({
                            ...prev,
                            guestName: data.guestName || prev.guestName,
                            attendeeCount: data.seatCount || prev.attendeeCount,
                        }));
                    }
                })
                .catch(() => {
                    if (storageKey) {
                        try {
                            const cached = JSON.parse(localStorage.getItem(storageKey) || "null");
                            if (cached && (cached.inviteToken === inviteToken || !cached.inviteToken)) {
                                if (active) setSubmitted(cached);
                            }
                        } catch {
                            // ignore storage error
                        }
                    }
                });
        } else if (storageKey) {
            // 2. If no token in URL, check device localStorage if guest already submitted for this slug
            try {
                const cached = JSON.parse(localStorage.getItem(storageKey) || "null");
                if (cached && (cached.responseStatus || cached.inviteToken)) {
                    setSubmitted(cached);
                    // Softly set query param ?token=... in the browser bar
                    if (cached.inviteToken && typeof window !== "undefined") {
                        const currentUrl = new URL(window.location.href);
                        if (!currentUrl.searchParams.get("token")) {
                            currentUrl.searchParams.set("token", cached.inviteToken);
                            window.history.replaceState(null, "", currentUrl.toString());
                        }
                    }
                }
            } catch {
                // ignore storage error
            }
        }

        return () => {
            active = false;
        };
    }, [slug, inviteToken]);

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                ...form,
                attendeeCount: Number(form.attendeeCount),
            };
            const response = inviteToken
                ? await rsvpService.submitPublicWithToken(slug, inviteToken, payload)
                : await rsvpService.submitPublic(slug, payload, { accessToken });

            const finalToken = response?.inviteToken || inviteToken;
            const submittedData = {
                ...response,
                guestName: response?.guestName || form.guestName,
                responseStatus: response?.responseStatus || form.responseStatus,
                attendeeCount: response?.attendeeCount || Number(form.attendeeCount),
                inviteToken: finalToken,
            };

            setSubmitted(submittedData);
            setIsEditing(false);

            if (slug) {
                const storageKey = `koupreng_guest_rsvp_${slug}`;
                try {
                    localStorage.setItem(storageKey, JSON.stringify(submittedData));
                } catch {
                    // ignore storage error
                }
            }

            if (finalToken && typeof window !== "undefined") {
                try {
                    const currentUrl = new URL(window.location.href);
                    if (currentUrl.searchParams.get("token") !== finalToken) {
                        currentUrl.searchParams.set("token", finalToken);
                        window.history.replaceState(null, "", currentUrl.toString());
                    }
                } catch {
                    // ignore storage error
                }
            }

            if (response?.message) {
                setWishes((current) => [response, ...current.filter((item) => item.id !== response.id)]);
            } else {
                loadWishes();
            }
        } catch (err) {
            setError(err.message || "Could not submit RSVP");
        } finally {
            setLoading(false);
        }
    };

    const effectiveToken = submitted?.inviteToken || inviteToken;
    const qrPassUrl = effectiveToken
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${slug}?token=${encodeURIComponent(effectiveToken)}`
        : (typeof window !== "undefined" ? window.location.href : "");

    const handleCopy = () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(qrPassUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const showQrPass = submitted && !isEditing;

    return (
        <section className="pub-rsvp-live">
            {showQrPass ? (
                <div className="pub-rsvp-done" style={{ textAlign: "center", padding: "1.25rem 1rem" }}>
                    <h2>{labels.receivedTitle}</h2>
                    <p style={{ margin: "0.5rem 0 1rem", color: "#475569" }}>
                        {submitted.guestName ? `${submitted.guestName}, ` : ""}{labels.receivedText}
                    </p>

                    {(submitted.responseStatus === "ATTENDING" || submitted.responseStatus === "attending" || !submitted.responseStatus) ? (
                        <div style={{
                            background: "#fafaf9",
                            border: "1.5px dashed #b0926a",
                            borderRadius: "16px",
                            padding: "1.25rem",
                            maxWidth: "320px",
                            margin: "1rem auto 0",
                            boxShadow: "0 4px 14px rgba(176, 146, 106, 0.12)"
                        }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#78350f", marginBottom: "4px" }}>
                                {labels.qrPassTitle}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "#78716c", margin: "0 0 12px 0" }}>
                                {labels.qrPassHint}
                            </p>
                            <div style={{
                                background: "#ffffff",
                                padding: "10px",
                                borderRadius: "12px",
                                display: "inline-block",
                                border: "1px solid #e7e5e4",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                            }}>
                                <QRCode
                                    id="rsvp-checkin-qr"
                                    value={qrPassUrl}
                                    size={145}
                                />
                            </div>
                            <div style={{ marginTop: "10px", fontSize: "0.95rem", fontWeight: 700, color: "#1c1917" }}>
                                {submitted.guestName || form.guestName}
                            </div>
                            <div style={{
                                display: "inline-block",
                                marginTop: "6px",
                                padding: "3px 12px",
                                borderRadius: "999px",
                                background: "#ecfdf5",
                                color: "#065f46",
                                fontSize: "0.75rem",
                                fontWeight: 600
                            }}>
                                ✓ {labels.attending} ({submitted.attendeeCount || 1})
                            </div>
                            {(submitted.tableName || submitted.seatNumber) && (
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "12px",
                                    marginTop: "10px",
                                    fontSize: "0.8rem",
                                    color: "#57534e"
                                }}>
                                    {submitted.tableName && <span><strong>{labels.table}:</strong> {submitted.tableName}</span>}
                                    {submitted.seatNumber && <span><strong>{labels.seat}:</strong> {submitted.seatNumber}</span>}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            background: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            borderRadius: "12px",
                            padding: "1rem",
                            maxWidth: "320px",
                            margin: "1rem auto 0"
                        }}>
                            <span style={{ fontSize: "1.2rem" }}>💌</span>
                            <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "#475569" }}>
                                {submitted.responseStatus === "NOT_ATTENDING" ? labels.notAttending : labels.maybe}
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                        {effectiveToken && (
                            <button
                                type="button"
                                className="inv-secondary-btn"
                                style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                                onClick={handleCopy}
                            >
                                {copied ? `✓ ${labels.copied}` : `📋 ${labels.copyLink}`}
                            </button>
                        )}
                        <button
                            type="button"
                            className="inv-secondary-btn"
                            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                            onClick={() => {
                                setForm((prev) => ({
                                    ...prev,
                                    guestName: submitted.guestName || prev.guestName,
                                    responseStatus: submitted.responseStatus || prev.responseStatus,
                                    attendeeCount: submitted.attendeeCount || prev.attendeeCount,
                                }));
                                setIsEditing(true);
                            }}
                        >
                            ✏️ {labels.editResponse}
                        </button>
                    </div>
                </div>
            ) : (
                <form className="pub-rsvp-form" onSubmit={submit}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                            <p className="pub-kicker">{labels.kicker}</p>
                            <h2>{labels.title}</h2>
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                className="inv-secondary-btn"
                                style={{ fontSize: "0.8rem", padding: "4px 12px" }}
                                onClick={() => setIsEditing(false)}
                            >
                                {labels.cancelEdit}
                            </button>
                        )}
                    </div>
                    {(!inviteToken || isEditing) && (
                        <div className="inv-form-grid">
                            <label>
                                {labels.guestName}
                                <input
                                    value={form.guestName}
                                    onChange={(event) => update("guestName", event.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                {labels.phone}
                                <input
                                    value={form.phone}
                                    onChange={(event) => update("phone", event.target.value)}
                                />
                            </label>
                        </div>
                    )}
                    <div className="inv-form-grid">
                        <label>
                            {labels.response}
                            <select
                                value={form.responseStatus}
                                onChange={(event) => update("responseStatus", event.target.value)}
                            >
                                <option value="ATTENDING">{labels.attending}</option>
                                <option value="NOT_ATTENDING">{labels.notAttending}</option>
                                <option value="MAYBE">{labels.maybe}</option>
                            </select>
                        </label>
                        <label>
                            {labels.attendeeCount}
                            <input
                                type="number"
                                min="0"
                                value={form.attendeeCount}
                                onChange={(event) => update("attendeeCount", event.target.value)}
                            />
                        </label>
                    </div>
                    <label>
                        {labels.message}
                        <textarea
                            value={form.message}
                            onChange={(event) => update("message", event.target.value)}
                            rows="3"
                        />
                    </label>
                    {error && <div className="inv-error">{error}</div>}
                    <button className="inv-primary-btn" type="submit" disabled={loading}>
                        {loading ? labels.submitting : labels.submit}
                    </button>
                </form>
            )}

            {wishes.length > 0 && (
                <div className="pub-wishes-wall">
                    <p className="pub-kicker">{labels.wishes}</p>
                    <h2>{labels.blessings}</h2>
                    <div className="pub-wishes-list">
                        {wishes.map((wish) => (
                            <article className="pub-wish-card" key={wish.id || `${wish.guestName}-${wish.respondedAt}`}>
                                <p>{wish.message}</p>
                                <span>{wish.guestName || labels.guest}</span>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
