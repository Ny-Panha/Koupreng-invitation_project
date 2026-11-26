import { PageSkeleton } from '@/shared/ui/LoadingState';
import { guestLocale, localeContent, projectLocale } from '../templates/shared/localizedContent';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { IoHomeOutline, IoLockClosedOutline, IoSearchOutline } from "react-icons/io5";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useLanguageStore } from "@/stores/useLanguageStore";

import PublicRsvpForm from "../invitations/PublicRsvpForm";
import "../invitations/InvitationPages.css";
import TemplateExperience from "@/features/templates/experience/TemplateExperience";
import { TemplateUnavailable } from "@/features/templates/experience/TemplateRenderGuard";
import { registerDynamicTemplates } from "@/features/templates/data/templatesData";
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
import PublicTicketAccess from "@/features/tickets/PublicTicketAccess";

function publicStateCopy(languageMode, stateType = "UNPUBLISHED") {
    const mode = String(languageMode || "").toUpperCase();
    const isEn = mode === "EN";
    const isKh = mode === "KH" || mode === "KM";

    if (stateType === "NOT_FOUND") {
        const title = isEn
            ? "Invitation unavailable"
            : isKh
                ? "រកសន្លឹកការមិនឃើញ"
                : "រកសន្លឹកការមិនឃើញ / Invitation unavailable";
        const message = isEn
            ? "This link is invalid or the invitation was removed."
            : isKh
                ? "Link មិនត្រឹមត្រូវ ឬសន្លឹកការត្រូវបានលុបចោល។"
                : "Link មិនត្រឹមត្រូវ ឬសន្លឹកការត្រូវបានលុបចោល។ This link is invalid or the invitation was removed.";
        return {
            loading: isEn ? "Loading invitation…" : isKh ? "កំពុងផ្ទុកសន្លឹកការ..." : "កំពុងផ្ទុកសន្លឹកការ... / Loading invitation…",
            title,
            message,
            unavailable: title,
            unavailableDetail: message,
            stateType: "NOT_FOUND",
        };
    }

    const title = isEn
        ? "This invitation isn't published yet"
        : isKh
            ? "សន្លឹកការមិនទាន់បានផ្សព្វផ្សាយ"
            : "សន្លឹកការមិនទាន់បានផ្សព្វផ្សាយ / Invitation unavailable";
    const message = isEn
        ? "The host has temporarily unpublished this invitation. Please check back later."
        : isKh
            ? "ម្ចាស់បានបិទការផ្សព្វផ្សាយជាបណ្តោះអាសន្ន។ សូមត្រឡប់មកម្តងទៀតនៅពេលក្រោយ។"
            : "ម្ចាស់បានបិទការផ្សព្វផ្សាយជាបណ្តោះអាសន្ន។ Please check back later.";
    return {
        loading: isEn ? "Loading invitation…" : isKh ? "កំពុងផ្ទុកសន្លឹកការ..." : "កំពុងផ្ទុកសន្លឹកការ... / Loading invitation…",
        title,
        message,
        unavailable: title,
        unavailableDetail: message,
        stateType: "UNPUBLISHED",
    };
}

export default function PublicInvitationPage() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
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
    const queryLang = searchParams.get("lang") || "";
    const accessStorageKey = slug ? `koupreng_invitation_access_${slug}` : "";
    const effectiveAccessToken = queryAccessToken || verifiedAccessToken;
    const loadCinematicVideo = useCallback(signal => mediaService.publicCinematicContent(slug, invitation?.cinematicOpening?.videoMediaId,
        { accessToken: effectiveAccessToken || null, inviteToken: inviteToken || null }, signal), [slug, invitation?.cinematicOpening?.videoMediaId, effectiveAccessToken, inviteToken]);

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
                    if (protectedError && accessStorageKey && sessionStorage.getItem(accessStorageKey)) {
                        sessionStorage.removeItem(accessStorageKey);
                        setVerifiedAccessToken("");
                    }
                    const is404 = err?.status === 404 || String(err?.message || "").toLowerCase().includes("not found");
                    const detectedType = is404 ? "NOT_FOUND" : "UNPUBLISHED";
                    const fallbackLang = String(queryLang || useLanguageStore.getState().lang || "km").toUpperCase();
                    setErrorType(detectedType);
                    setProtectedMode(protectedError);
                    setRemoteError(protectedError
                        ? formatPublicAccessError(err, fallbackLang === "EN")
                        : (err?.message || publicStateCopy(fallbackLang, detectedType).message));
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
    }, [slug, inviteToken, effectiveAccessToken, accessStorageKey, queryLang]);

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

        const templateId = activeDraft.templateId;
        return draftToTemplate({ ...activeDraft, templateId }, gallery);
    }, [activeDraft, gallery]);

    if (remoteLoading) {
        const effectiveLang = invitation?.languageMode || activeDraft?.languageMode || searchParams.get("lang");
        return <PageSkeleton layout="public" label={publicStateCopy(effectiveLang).loading} />;
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
            const fallbackLang = String(invitation?.languageMode || activeDraft?.languageMode || searchParams.get("lang") || useLanguageStore.getState().lang || "km").toUpperCase();
            setRemoteError(formatPublicAccessError(err, fallbackLang === "EN"));
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
        const rawDraft = publicInvitationToDraft(invitation, media);
        const displayLocale = guestLocale(rawDraft, searchParams.get("lang"));
        const publicDraft = rawDraft.localizedContentV1 ? projectLocale(rawDraft, displayLocale) : rawDraft;

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
        if (!mergedPublicGarden) return <TemplateUnavailable />;
        const showRsvp = publicDraft.enabledSections?.rsvp !== false;

        if (mergedPublicGarden) {
            const royalGarden = [mergedPublicGarden.tpl?.code, mergedPublicGarden.tpl?.slug, mergedPublicGarden.tpl?.templateCode].includes('royal-garden-cinematic');
            const ownLocaleControl = royalGarden || [mergedPublicGarden.tpl?.code, mergedPublicGarden.tpl?.slug, mergedPublicGarden.tpl?.templateCode].includes('khmer-floral-gold');
            return (
                <div lang={displayLocale} className={royalGarden ? 'public-royal-garden' : undefined}>
                {!ownLocaleControl && rawDraft.localizedContentV1 && localeContent(rawDraft).enabledLocales.includes('en') && <nav className="public-locale-switch" aria-label="Invitation language">{[['km', '\u1781\u17d2\u1798\u17c2\u179a'], ['en', 'English']].map(([locale, label]) => <button key={locale} type="button" lang={locale} aria-pressed={displayLocale === locale} onClick={() => { const params = new URLSearchParams(searchParams); params.set('lang', locale); setSearchParams(params, { replace: true, preventScrollReset: true }); }}>{label}</button>)}</nav>}
                {!ownLocaleControl && searchParams.get('lang') === 'en' && displayLocale !== 'en' && <p role="status" lang="en">English is not published for this invitation. Showing Khmer.</p>}
                <TemplateExperience
                    cinematicOpening={invitation?.cinematicOpening}
                    cinematicLanguage={publicDraft.languageMode}
                    cinematicKey={slug}
                    loadCinematicVideo={loadCinematicVideo}
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
                            languageMode={publicDraft.languageMode}
                        />
                    )}
                </TemplateExperience>
                <PublicTicketAccess compact={ownLocaleControl} displayContent={publicDraft} languageMode={publicDraft.languageMode} slug={slug} token={inviteToken} accessToken={effectiveAccessToken} />
                </div>
            );
        }
    }

    if (protectedMode) {
        return (
            <ProtectedInvitationGate
                error={remoteError}
                loading={verifyingAccess}
                onSubmit={verifyAccess}
                languageMode={invitation?.languageMode || activeDraft?.languageMode || searchParams.get("lang") || useLanguageStore.getState().lang || "km"}
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

function formatPublicAccessError(err, isEn) {
    const raw = String(err?.message || "");
    const lower = raw.toLowerCase();
    if (err?.status === 429 || lower.includes("too many") || lower.includes("rate limit")) {
        return isEn
            ? "Too many attempts. Please wait a minute and try again."
            : "ព្យាយាមបញ្ចូលពាក្យសម្ងាត់ច្រើនដងពេក។ សូមរង់ចាំមួយភ្លែត រួចសាកល្បងម្តងទៀត។";
    }
    if (lower.includes("password required")) {
        return isEn
            ? "Please enter the invitation password."
            : "សូមបញ្ចូលពាក្យសម្ងាត់ដើម្បីបើកសន្លឹកការ។";
    }
    if (lower.includes("invalid invitation password") || lower.includes("incorrect password") || err?.status === 403) {
        return isEn
            ? "Incorrect password. Please try again or use your personal guest link."
            : "ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។ សូមពិនិត្យម្តងទៀត ឬប្រើតំណភ្ជាប់ផ្ទាល់ខ្លួនរបស់ភ្ញៀវ។";
    }
    return raw || (isEn ? "This invitation requires a password." : "សន្លឹកការនេះត្រូវការពាក្យសម្ងាត់។");
}

function ProtectedInvitationGate({ error, loading, onSubmit, languageMode = "km" }) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
                <div className="protected-gate-card-badge" aria-hidden="true">
                    <Lock size={24} />
                </div>
                <p className="pub-kicker">{isEn ? "Private Invitation" : "សន្លឹកការឯកជន"}</p>
                <h1>{isEn ? "Enter Password" : "បញ្ចូលពាក្យសម្ងាត់"}</h1>
                <p>{isEn ? "Please enter the password or use your secure guest link to view the invitation." : "សូមប្រើពាក្យសម្ងាត់ ឬតំណភ្ជាប់ភ្ញៀវដែលមានសុវត្ថិភាពដើម្បីបើកសន្លឹកការ។"}</p>
                <label className="protected-gate-field">
                    <span>{isEn ? "Password" : "ពាក្យសម្ងាត់"}</span>
                    <div className="protected-gate-input-wrap">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? "protected-gate-error" : undefined}
                            placeholder={isEn ? "Enter access password" : "វាយបញ្ចូលពាក្យសម្ងាត់"}
                            required
                        />
                        <button
                            type="button"
                            className="protected-gate-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? (isEn ? "Hide password" : "លាក់ពាក្យសម្ងាត់") : (isEn ? "Show password" : "បង្ហាញពាក្យសម្ងាត់")}
                            aria-pressed={showPassword}
                        >
                            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                        </button>
                    </div>
                </label>
                {error && <div id="protected-gate-error" className="inv-error" role="alert">{error}</div>}
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
    languageMode = "",
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
                minHeight: "100dvh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background: "var(--ui-theme-canvas, #f7f5f0)",
                fontFamily: "var(--ui-font, 'DM Sans', 'Kantumruy Pro', system-ui, sans-serif)",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "460px",
                    background: "var(--ui-theme-surface, #fffefb)",
                    border: "1px solid var(--ui-theme-border, rgba(185, 139, 66, 0.25))",
                    borderRadius: "24px",
                    padding: "44px 32px 36px",
                    textAlign: "center",
                    boxShadow: "var(--ui-theme-shadow-elevated, 0 20px 48px -10px rgba(28, 40, 34, 0.14))",
                }}
            >
                <div
                    style={{
                        width: "68px",
                        height: "68px",
                        margin: "0 auto 20px",
                        borderRadius: "22px",
                        background: "var(--ui-theme-gold-soft, rgba(185, 139, 66, 0.14))",
                        border: "1px solid var(--ui-theme-border, rgba(185, 139, 66, 0.3))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--ui-theme-gold, #8c6628)",
                        fontSize: "2rem",
                    }}
                >
                    {isNotFound ? <IoSearchOutline /> : <IoLockClosedOutline />}
                </div>

                <div
                    style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--ui-theme-gold, #8c6628)",
                        marginBottom: "12px",
                    }}
                >
                    {isEn ? "Digital Wedding Hub" : "គូព្រេង • សំបុត្រអញ្ជើញឌីជីថល"}
                </div>

                <h1
                    style={{
                        fontSize: "1.375rem",
                        fontWeight: 800,
                        color: "var(--ui-theme-ink, #1e2824)",
                        margin: "0 0 12px",
                        lineHeight: 1.5,
                    }}
                >
                    {finalTitle}
                </h1>

                <p
                    style={{
                        fontSize: "0.9375rem",
                        color: "var(--ui-theme-muted, #525f58)",
                        lineHeight: 1.7,
                        margin: isOwner ? "0 0 28px" : "0",
                    }}
                >
                    {finalMessage}
                </p>

                {isOwner && (
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <Link
                            to="/dashboard"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "11px 24px",
                                minHeight: "44px",
                                borderRadius: "14px",
                                background: "var(--ui-theme-action, #1c3a32)",
                                color: "var(--ui-theme-on-action, #ffffff)",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                textDecoration: "none",
                                transition: "transform 0.15s ease",
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
