import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

import InvitationDisplay from "../invitations/InvitationDisplay";
import PublicRsvpForm from "../invitations/PublicRsvpForm";
import "../invitations/InvitationPages.css";
import { getTemplateById, TemplateExperience, registerDynamicTemplates } from "@/features/templates";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import WeddingSite from "../wedding-site/WeddingSite";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";
import { publicInvitationToDraft } from "../wedding-builder/utils/invitationDraftAdapter";
import { useWeddingStore } from "../../stores/useWeddingStore";
import { loadGallery } from "../../shared/storage/galleryStorage";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { resolveInviteToken } from "./publicInvitationQuery";

function publicStateCopy(languageMode) {
    const mode = String(languageMode || "").toUpperCase();
    if (mode === "EN") {
        return {
            loading: "Loading invitation…",
            unavailable: "Invitation unavailable",
            unavailableDetail: "This invitation may be unpublished or unavailable.",
        };
    }
    return {
        loading: mode === "KH" ? "កំពុងផ្ទុកសន្លឹកការ..." : "កំពុងផ្ទុកសន្លឹកការ... / Loading invitation…",
        unavailable: mode === "KH" ? "មិនអាចបើកសន្លឹកការបាន" : "មិនអាចបើកសន្លឹកការបាន / Invitation unavailable",
        unavailableDetail: mode === "KH"
            ? "សន្លឹកការនេះមិនទាន់បានបោះផ្សាយ ឬមិនអាចប្រើបាន។"
            : "សន្លឹកការនេះមិនទាន់បានបោះផ្សាយ ឬមិនអាចប្រើបាន។ Please check the invitation link.",
    };
}

export default function PublicInvitationPage() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const inviteToken = resolveInviteToken(searchParams);
    const [invitation, setInvitation] = useState(null);
    const [media, setMedia] = useState(null);
    const [remoteLoading, setRemoteLoading] = useState(true);
    const [remoteError, setRemoteError] = useState("");
    const [protectedMode, setProtectedMode] = useState(false);
    const [verifiedAccessToken, setVerifiedAccessToken] = useState("");
    const [verifyingAccess, setVerifyingAccess] = useState(false);
    const draft = useWeddingStore((state) => state.draft);
    const loadDraft = useWeddingStore((state) => state.loadDraft);
    const loadDraftBySlug = useWeddingStore((state) => state.loadDraftBySlug);
    const localLoading = useWeddingStore((state) => state.loading);
    const [gallery, setGallery] = useState(null);
    const activeDraft = draft?.slug === slug || draft?.id === slug ? draft : null;
    const shouldBackToDashboard = location.state?.backTo === "/dashboard";
    const queryAccessToken = searchParams.get("accessToken") || "";
    const accessStorageKey = slug ? `koupreng_invitation_access_${slug}` : "";
    const effectiveAccessToken = queryAccessToken || verifiedAccessToken;
    const backProps = shouldBackToDashboard
        ? { showBack: true, backTo: "/dashboard", backLabel: "← ផ្ទាំងគ្រប់គ្រង" }
        : { showBack: false };

    useEffect(() => {
        setVerifiedAccessToken(slug ? sessionStorage.getItem(`koupreng_invitation_access_${slug}`) || "" : "");
        setProtectedMode(false);
    }, [slug]);

    useEffect(() => {
        if (!slug) {
            setInvitation(null);
            setMedia(null);
            setRemoteError(publicStateCopy().unavailableDetail);
            setRemoteLoading(false);
            return;
        }

        let active = true;
        setRemoteLoading(true);
        setRemoteError("");
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
                    setProtectedMode(false);
                }
            })
            .catch((err) => {
                if (active) {
                    const protectedError = err?.status === 403;
                    setProtectedMode(protectedError);
                    setRemoteError(protectedError ? (err?.message || "សន្លឹកការនេះត្រូវការពាក្យសម្ងាត់។") : publicStateCopy().unavailableDetail);
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

    useEffect(() => {
        if (!slug) {
            setGallery([]);
            return;
        }

        setGallery(null);
        let loadedDraft = loadDraftBySlug(slug);
        if (!loadedDraft?.id) {
            loadedDraft = loadDraft(slug);
        }

        if (!loadedDraft?.id) {
            setGallery([]);
            return;
        }

        loadGallery(loadedDraft.id)
            .then(setGallery)
            .catch(() => setGallery([]));
    }, [slug, loadDraft, loadDraftBySlug]);

    const merged = useMemo(() => {
        if (!activeDraft?.id || gallery === null) return null;

        const templateId = activeDraft.templateId || getTemplateById(activeDraft.templateId).id;
        return draftToTemplate({ ...activeDraft, templateId }, gallery);
    }, [activeDraft, gallery]);



    if (remoteLoading) {
        return <div className="public-state" role="status">{publicStateCopy().loading}</div>;
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
        const publicDraft = publicInvitationToDraft(invitation, media);
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

        return (
            <InvitationDisplay invitation={invitation} media={media}>
                {showRsvp && (
                    <PublicRsvpForm
                        slug={slug}
                        inviteToken={inviteToken}
                        accessToken={effectiveAccessToken}
                        languageMode={invitation.languageMode}
                    />
                )}
            </InvitationDisplay>
        );
    }

    if (protectedMode) {
        return (
            <ProtectedInvitationGate
                error={remoteError}
                loading={verifyingAccess}
                onSubmit={verifyAccess}
            />
        );
    }

    if (localLoading || (activeDraft?.id && gallery === null)) {
        return (
            <div style={{ padding: 80, textAlign: "center", color: "#7d6443" }}>
                កំពុងផ្ទុក...
            </div>
        );
    }

    if (activeDraft?.id && merged) {
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

    const fallbackTpl = getTemplateById(slug);

    if (fallbackTpl.id === slug) {
        return <WeddingSite tpl={fallbackTpl} {...backProps} />;
    }

    return (
        <main className="public-state">
            <h1>{publicStateCopy(invitation?.languageMode).unavailable}</h1>
            <p>{remoteError || publicStateCopy(invitation?.languageMode).unavailableDetail}</p>
        </main>
    );
}

function ProtectedInvitationGate({ error, loading, onSubmit }) {
    const [password, setPassword] = useState("");

    return (
        <main className="public-state protected-gate">
            <form
                className="protected-gate-card"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(password);
                }}
            >
                <p className="pub-kicker">សន្លឹកការឯកជន / Private invitation</p>
                <h1>បញ្ចូលពាក្យសម្ងាត់</h1>
                <p>សូមប្រើពាក្យសម្ងាត់ ឬតំណភ្ជាប់ភ្ញៀវដែលមានសុវត្ថិភាពដើម្បីបើកសន្លឹកការ។</p>
                <label>
                    ពាក្យសម្ងាត់ / Password
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
                    {loading ? "កំពុងពិនិត្យ..." : "បើកសន្លឹកការ"}
                </button>
            </form>
        </main>
    );
}
