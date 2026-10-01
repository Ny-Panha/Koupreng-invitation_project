import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { IoHomeOutline, IoLockClosedOutline, IoSearchOutline } from "react-icons/io5";

import PublicRsvpForm from "../invitations/PublicRsvpForm";
import "../invitations/InvitationPages.css";
import { TemplateExperience, registerDynamicTemplates } from "@/features/templates";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";
import { publicInvitationToDraft } from "../wedding-builder/utils/invitationDraftAdapter";
import { useWeddingStore } from "../../stores/useWeddingStore";
import { getDraft, getDraftBySlug, listDrafts } from "../../shared/storage/weddingStorage";
import { loadGallery } from "../../shared/storage/galleryStorage";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { resolveInviteToken } from "./publicInvitationQuery";

function publicStateCopy(languageMode, stateType = "UNPUBLISHED") {
    const isEn = String(languageMode || "").toUpperCase() === "EN";

    if (stateType === "NOT_FOUND") {
        const title = isEn ? "Invitation not found" : "រកសន្លឹកការមិនឃើញ";
        const message = isEn
            ? "This link is invalid or the invitation was removed."
            : "Link មិនត្រឹមត្រូវ ឬសន្លឹកការត្រូវបានលុបចោល។";
        return {
            loading: isEn ? "Loading invitation…" : "កំពុងផ្ទុកសន្លឹកការ...",
            title,
            message,
            unavailable: title,
            unavailableDetail: message,
            stateType: "NOT_FOUND",
        };
    }

    const title = isEn ? "This invitation isn't published yet" : "សន្លឹកការមិនទាន់បានផ្សព្វផ្សាយ";
    const message = isEn
        ? "The host has temporarily unpublished this invitation. Please check back later."
        : "ម្ចាស់បានបិទការផ្សព្វផ្សាយជាបណ្តោះអាសន្ន។ សូមត្រឡប់មកម្តងទៀតនៅពេលក្រោយ។";
    return {
        loading: isEn ? "Loading invitation…" : "កំពុងផ្ទុកសន្លឹកការ...",
        title,
        message,
        unavailable: title,
        unavailableDetail: message,
        stateType: "UNPUBLISHED",
    };
}

export default function PublicInvitationPage() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const currentUserId = user?.id || user?.userId;
    const inviteToken = resolveInviteToken(searchParams);
    const [invitation, setInvitation] = useState(null);
    const [media, setMedia] = useState(null);
    const [remoteLoading, setRemoteLoading] = useState(true);
    const [remoteError, setRemoteError] = useState("");
    const [errorType, setErrorType] = useState(null);
    const [userOwnsInvitation, setUserOwnsInvitation] = useState(false);
    const [protectedMode, setProtectedMode] = useState(false);
    const [verifiedAccessToken, setVerifiedAccessToken] = useState("");
    const [verifyingAccess, setVerifyingAccess] = useState(false);
    const draft = useWeddingStore((state) => state.draft);
    const [gallery, setGallery] = useState(null);
    const activeDraft = useMemo(() => {
        if (!slug) return null;
        const norm = slug.trim().toLowerCase();
        if (draft && (
            draft.slug?.toLowerCase() === norm ||
            draft.id?.toLowerCase() === norm ||
            draft.title?.trim().toLowerCase() === norm ||
            draft.title?.trim().toLowerCase().replace(/\s+/g, "-") === norm
        )) {
            return draft;
        }
        return getDraftBySlug(slug);
    }, [draft, slug]);
    const shouldBackToDashboard = location.state?.backTo === "/dashboard";
    const queryAccessToken = searchParams.get("accessToken") || "";
    const accessStorageKey = slug ? `koupreng_invitation_access_${slug}` : "";
    const effectiveAccessToken = queryAccessToken || verifiedAccessToken;

    useEffect(() => {
        if (!isAuthenticated) {
            setUserOwnsInvitation(false);
            return;
        }
        let active = true;
        invitationService.listMine()
            .then((items) => {
                if (!active) return;
                const list = Array.isArray(items) ? items : items?.data || [];
                const owns = list.some((i) => {
                    const s = String(i.slug || "").toLowerCase();
                    const id = String(i.id || i.invitationId || "");
                    const target = String(slug || "").toLowerCase();
                    return s === target || id === target;
                });
                if (owns) setUserOwnsInvitation(true);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [isAuthenticated, slug]);

    const isOwner = Boolean(
        isAuthenticated && (
            userOwnsInvitation ||
            (activeDraft && (activeDraft.ownerUserId == null || String(activeDraft.ownerUserId) === String(currentUserId))) ||
            (slug && listDrafts(currentUserId).some((d) => {
                const s = String(d.slug || "").toLowerCase();
                const id = String(d.id || "");
                const bId = String(d.backendInvitationId || "");
                const target = String(slug || "").toLowerCase();
                return s === target || id === target || bId === target;
            })) ||
            shouldBackToDashboard
        )
    );

    useEffect(() => {
        setVerifiedAccessToken(slug ? sessionStorage.getItem(`koupreng_invitation_access_${slug}`) || "" : "");
        setProtectedMode(false);
    }, [slug]);

    useEffect(() => {
        if (!slug) {
            setInvitation(null);
            setMedia(null);
            setErrorType("NOT_FOUND");
            setRemoteError(publicStateCopy(null, "NOT_FOUND").message);
            setRemoteLoading(false);
            return;
        }

        let active = true;
        setRemoteLoading(true);
        setRemoteError("");
        setErrorType(null);
        setProtectedMode(false);
        setInvitation(null);
        setMedia(null);
        const publicParams = {
            accessToken: effectiveAccessToken,
            token: inviteToken,
        };

        Promise.all([
            invitationService.publicBySlug(slug, publicParams),
            mediaService.publicBySlug(slug, publicParams).catch(() => null),
            // Also load dynamic catalog so admin-created templates can be resolved
            templateCatalogService.list().then((items) => {
                if (items?.length) registerDynamicTemplates(items);
            }).catch(() => {}),
        ])
            .then(([invitationData, mediaData]) => {
                if (active) {
                    setInvitation(invitationData);
                    setMedia(mediaData);
                    setRemoteError("");
                    setErrorType(null);
                    setProtectedMode(false);
                }
            })
            .catch((err) => {
                if (active) {
                    const protectedError = err?.status === 403;
                    const is404 = err?.status === 404 || String(err?.message || "").toLowerCase().includes("not found");
                    const detectedType = is404 ? "NOT_FOUND" : "UNPUBLISHED";
                    setErrorType(detectedType);
                    setProtectedMode(protectedError);
                    setRemoteError(protectedError ? (err?.message || "សន្លឹកការនេះត្រូវការពាក្យសម្ងាត់។") : (err?.message || publicStateCopy(null, detectedType).message));
                }
            })
            .finally(() => {
                if (active) {
                    setRemoteLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [slug, inviteToken, effectiveAccessToken]);

    const activeDraftId = activeDraft?.id;

    useEffect(() => {
        if (!activeDraftId) {
            setGallery([]);
            return;
        }

        let active = true;
        setGallery(null);
        loadGallery(activeDraftId)
            .then((items) => {
                if (active) setGallery(items || []);
            })
            .catch(() => {
                if (active) setGallery([]);
            });

        return () => {
            active = false;
        };
    }, [activeDraftId]);

    const merged = useMemo(() => {
        if (!activeDraft?.id || gallery === null) return null;

        const templateId = activeDraft.templateId || "garden-royal-khmer-wedding";
        return draftToTemplate({ ...activeDraft, templateId }, gallery);
    }, [activeDraft, gallery]);

    if (remoteLoading) {
        const effectiveLang = invitation?.languageMode || activeDraft?.languageMode || searchParams.get("lang");
        return <div className="public-state" role="status">{publicStateCopy(effectiveLang).loading}</div>;
    }

    const verifyAccess = async (password) => {
        setVerifyingAccess(true);
        setRemoteError("");
        try {
            const response = await invitationService.verifyPublicAccess(slug, {
                password,
                inviteToken,
                accessToken: effectiveAccessToken,
            });
            if (response?.accessToken) {
                sessionStorage.setItem(accessStorageKey, response.accessToken);
                setVerifiedAccessToken(response.accessToken);
            }
            setProtectedMode(false);
        } catch (err) {
            setRemoteError(err?.message || "Could not verify invitation access.");
        } finally {
            setVerifyingAccess(false);
        }
    };

    if (invitation) {
        const isInvPublished = invitation.status ? invitation.status === "PUBLISHED" : invitation.published !== false;
        if (!isInvPublished) {
            return (
                <PublicUnavailableView
                    stateType="UNPUBLISHED"
                    languageMode={invitation?.languageMode}
                    isOwner={isOwner}
                />
            );
        }
        const publicDraft = publicInvitationToDraft(invitation, media);

        // Fallback / merge KHQR and local draft data if remote backend draft is missing them
        if (!publicDraft.khqrDollar?.qrUrl || !publicDraft.khqrRiel?.qrUrl) {
            const drafts = listDrafts();
            const localCandidate =
                (activeDraft && (activeDraft.slug === slug || activeDraft.id === slug || String(activeDraft.backendInvitationId) === String(invitation.id)))
                ? activeDraft
                : (getDraftBySlug(slug) || (invitation.id ? getDraft(invitation.id) : null) || getDraft(slug) ||
                   drafts.find((d) => d.slug === slug || (invitation.id && String(d.backendInvitationId) === String(invitation.id)) || d.id === slug));

            if (localCandidate) {
                if (!publicDraft.khqrDollar?.qrUrl && localCandidate.khqrDollar?.qrUrl) {
                    publicDraft.khqrDollar = localCandidate.khqrDollar;
                    if (!publicDraft.enabledSections) publicDraft.enabledSections = {};
                    publicDraft.enabledSections.gift = true;
                }
                if (!publicDraft.khqrRiel?.qrUrl && localCandidate.khqrRiel?.qrUrl) {
                    publicDraft.khqrRiel = localCandidate.khqrRiel;
                    if (!publicDraft.enabledSections) publicDraft.enabledSections = {};
                    publicDraft.enabledSections.gift = true;
                }
            }
        }

        const mergedPublicGarden = draftToTemplate(publicDraft, publicDraft.gallery);
        const showRsvp = publicDraft.enabledSections?.rsvp !== false;

        if (mergedPublicGarden) {
            return (
                <TemplateExperience
                    tpl={mergedPublicGarden.tpl}
                    variant={mergedPublicGarden.variant}
                    showActions={false}
                    showBreadcrumb={false}
                    showStickyCta={true}
                >
                    {showRsvp && (
                        <PublicRsvpForm
                            slug={slug}
                            inviteToken={inviteToken}
                            accessToken={effectiveAccessToken}
                            languageMode={invitation.languageMode}
                        />
                    )}
                </TemplateExperience>
            );
        }
    }

    if (protectedMode) {
        return (
            <ProtectedInvitationGate
                error={remoteError}
                loading={verifyingAccess}
                onSubmit={verifyAccess}
                languageMode={invitation?.languageMode || activeDraft?.languageMode || searchParams.get("lang")}
            />
        );
    }

    if (activeDraft?.id && gallery === null) {
        return (
            <main className="public-state" role="status">
                <div style={{ padding: 80, textAlign: "center", color: "#7d6443" }}>
                    កំពុងផ្ទុក...
                </div>
            </main>
        );
    }

    if (activeDraft?.id && merged) {
        const isDraftPublished = activeDraft.status === "PUBLISHED" || activeDraft.published === true;
        if (!isDraftPublished && !shouldBackToDashboard) {
            return (
                <PublicUnavailableView
                    stateType="UNPUBLISHED"
                    languageMode={activeDraft?.languageMode}
                    isOwner={isOwner}
                />
            );
        }
        return (
            <TemplateExperience
                tpl={merged.tpl}
                variant={merged.variant}
                useTemplateLink={shouldBackToDashboard ? `/dashboard/invitations/${activeDraft.id}/edit` : ""}
                primaryCtaLabel="កែសម្រួលសន្លឹកការ"
                breadcrumbItems={[
                    { label: "ផ្ទាំងគ្រប់គ្រង", to: "/dashboard" },
                    { label: "ចម្លងតំណភ្ជាប់" },
                ]}
                backLink="/dashboard"
                backLabel="ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង"
                showBreadcrumb={shouldBackToDashboard}
                showActions={shouldBackToDashboard}
                showStickyCta={shouldBackToDashboard}
            >
                {activeDraft.rsvp?.enabled !== false && activeDraft.enabledSections?.rsvp !== false && (
                    <PublicRsvpForm slug={slug} inviteToken={inviteToken} />
                )}
            </TemplateExperience>
        );
    }

    const effectiveStateType = (userOwnsInvitation || activeDraft) ? "UNPUBLISHED" : (errorType || "NOT_FOUND");
    return (
        <PublicUnavailableView
            stateType={effectiveStateType}
            languageMode={invitation?.languageMode || activeDraft?.languageMode || searchParams.get("lang")}
            isOwner={isOwner}
        />
    );
}

function ProtectedInvitationGate({ error, loading, onSubmit, languageMode = "km" }) {
    const [password, setPassword] = useState("");
    const isEn = String(languageMode).toUpperCase() === "EN";

    return (
        <main className="public-state protected-gate">
            <form
                className="protected-gate-card"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(password);
                }}
            >
                <p className="pub-kicker">{isEn ? "Private Invitation" : "សន្លឹកការឯកជន"}</p>
                <h1>{isEn ? "Enter Password" : "បញ្ចូលពាក្យសម្ងាត់"}</h1>
                <p>{isEn ? "Please enter the password or use your secure guest link to view the invitation." : "សូមប្រើពាក្យសម្ងាត់ ឬតំណភ្ជាប់ភ្ញៀវដែលមានសុវត្ថិភាពដើម្បីបើកសន្លឹកការ។"}</p>
                <label>
                    {isEn ? "Password" : "ពាក្យសម្ងាត់"}
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>
                {error && <div className="inv-error">{error}</div>}
                <button className="inv-primary-btn" type="submit" disabled={loading}>
                    {loading ? (isEn ? "Checking..." : "កំពុងពិនិត្យ...") : (isEn ? "Unlock Invitation" : "បើកសន្លឹកការ")}
                </button>
            </form>
        </main>
    );
}

function PublicUnavailableView({
    stateType = "UNPUBLISHED",
    title,
    message,
    languageMode = "km",
    isOwner = false,
}) {
    const isEn = String(languageMode).toUpperCase() === "EN";
    const copy = publicStateCopy(languageMode, stateType);
    const finalTitle = title || copy.title;
    const finalMessage = message || copy.message;
    const isNotFound = stateType === "NOT_FOUND";

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background: "radial-gradient(ellipse at top, #fdfbf7 0%, #f4ede2 100%)",
                fontFamily: "'Inter', 'Battambang', system-ui, -apple-system, sans-serif",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "460px",
                    background: "rgba(255, 255, 255, 0.96)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(185, 139, 66, 0.25)",
                    borderRadius: "24px",
                    padding: "44px 32px 36px",
                    textAlign: "center",
                    boxShadow: "0 20px 48px -10px rgba(92, 64, 28, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)",
                }}
            >
                {/* Gold Icon Badge: 🔒 for UNPUBLISHED, 🔍 for NOT_FOUND */}
                <div
                    style={{
                        width: "68px",
                        height: "68px",
                        margin: "0 auto 20px",
                        borderRadius: "22px",
                        background: "linear-gradient(135deg, rgba(185, 139, 66, 0.18) 0%, rgba(185, 139, 66, 0.06) 100%)",
                        border: "1px solid rgba(185, 139, 66, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#b98b42",
                        fontSize: "2rem",
                        boxShadow: "0 8px 24px rgba(185, 139, 66, 0.15)",
                    }}
                >
                    {isNotFound ? <IoSearchOutline /> : <IoLockClosedOutline />}
                </div>

                {/* Kicker */}
                <div
                    style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#b98b42",
                        marginBottom: "12px",
                    }}
                >
                    {isEn ? "Digital Wedding Hub" : "គូព្រេង • ធៀបការឌីជីថល"}
                </div>

                {/* Main Title */}
                <h1
                    style={{
                        fontSize: "1.375rem",
                        fontWeight: 800,
                        color: "#292524",
                        margin: "0 0 12px",
                        lineHeight: 1.4,
                    }}
                >
                    {finalTitle}
                </h1>

                {/* Message */}
                <p
                    style={{
                        fontSize: "0.9375rem",
                        color: "#78716c",
                        lineHeight: 1.65,
                        margin: isOwner ? "0 0 28px" : "0",
                    }}
                >
                    {finalMessage}
                </p>

                {/* Action Button: render ONLY when the viewer is authenticated as the invitation owner */}
                {isOwner && (
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <Link
                            to="/dashboard"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "11px 24px",
                                borderRadius: "14px",
                                background: "var(--brand-primary, #b98b42)",
                                color: "#ffffff",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                textDecoration: "none",
                                boxShadow: "0 4px 16px rgba(185, 139, 66, 0.28)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <IoHomeOutline style={{ fontSize: "1.1rem" }} />
                            <span>{isEn ? "Go to Dashboard" : "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង"}</span>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
