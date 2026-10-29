import { PageSkeleton } from '@/shared/ui/LoadingState';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Monitor,
    ScrollText,
    Smartphone,
} from "lucide-react";
import "./InvitationPages.css";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { TemplateExperience, registerDynamicTemplates } from "@/features/templates";
import { draftToTemplate } from "@/features/wedding-builder/utils/draftToTemplate";
import { publicInvitationToDraft } from "@/features/wedding-builder/utils/invitationDraftAdapter";
import { createPreviewSession, postPreviewMessage } from "@/shared/preview/previewMessaging";
import DisplayPreferences from '@/shared/preferences/DisplayPreferences';

export default function InvitationPreviewPage() {
  const uiCopy = useUiCopy();
    const { eventId, id = eventId } = useParams();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const [media, setMedia] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isGateOpen, setIsGateOpen] = useState(true);
    const [viewMode, setViewMode] = useState("full");
    const [previewSession] = useState(createPreviewSession);
    const previewChannel = useMemo(() => ({ source: window, origin: window.location.origin, sessionId: previewSession }), [previewSession]);

    useEffect(() => {
        let active = true;
        Promise.all([
            invitationService.preview(id),
            mediaService.list(id).catch(() => null),
            templateCatalogService.list().catch(() => []),
        ])
            .then(([invitationData, mediaData, catalogItems]) => {
                if (active) {
                    setInvitation(invitationData);
                    setMedia(mediaData);
                    setCatalog(catalogItems || []);
                    if (catalogItems?.length) registerDynamicTemplates(catalogItems);
                    setError("");
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err.message || "Could not load preview");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [id]);

    const rendered = useMemo(() => {
        if (!invitation) return null;
        const galleryPhotos = invitation?.galleryImages || invitation?.gallery_urls || invitation?.gallery || [];
        const catalogTemplate = catalog.find((item) =>
            String(item.id) === String(invitation.templateId)
            || String(item.code || "").toLowerCase() === String(invitation.templateCode || "").toLowerCase()
        );
        const draft = publicInvitationToDraft(
            {
                ...invitation,
                gallery: galleryPhotos,
                templateCode: invitation.templateCode || catalogTemplate?.code,
                templateThumbnailUrl: invitation.templateThumbnailUrl || catalogTemplate?.thumbnailUrl,
            },
            media
        );
        return draftToTemplate(draft, draft.gallery || []);
    }, [catalog, invitation, media]);

    const handleToggleGate = () => {
        const nextState = !isGateOpen;
        setIsGateOpen(nextState);
        postPreviewMessage({ type: "TOGGLE_GATE", open: nextState }, previewChannel);
    };

    if (loading) return <PageSkeleton layout="preview" label={uiCopy("កំពុងរៀបចំការមើលជាមុន...", "Loading preview...")} />;

    if (error) {
        return (
            <div className="inv-page">
                <div className="inv-error">{error}</div>
                <button type="button" className="inv-secondary-btn" onClick={() => navigate("/dashboard/invitations")}>
                    {uiCopy("ត្រឡប់ទៅបញ្ជីធៀប", "Back to invitations")}
                </button>
            </div>
        );
    }

    const coupleNames = [invitation?.groomName, invitation?.brideName].filter(Boolean).join(" & ");
    const previewTitle = coupleNames || invitation?.title || uiCopy("មើលសន្លឹកការ", "Invitation preview");
    const isPublished = invitation?.status === "PUBLISHED";

    return (
        <div className="inv-preview-workspace">
            {/* Clean, Non-colliding Mobile-first Header */}
            <header className="inv-preview-header">
                <div className="inv-preview-header__left">
                    <button
                        type="button"
                        className="inv-preview-back-btn"
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate("/dashboard");
                            }
                        }}
                        title={uiCopy("ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង", "Back to dashboard")}
                    >
                        <ArrowLeft size={15} />
                        <span className="inv-back-label">{uiCopy("ត្រឡប់", "Back")}</span>
                    </button>

                    <div className="inv-preview-meta">
                        <span className="inv-preview-title">{previewTitle}</span>
                        <span className={`inv-preview-badge inv-preview-badge--${isPublished ? "live" : "draft"}`}>
                            {isPublished ? uiCopy("បានផ្សព្វផ្សាយ", "Live") : uiCopy("ព្រាង", "Draft")}
                        </span>
                    </div>
                </div>

                <div className="inv-preview-header__right">
                    <DisplayPreferences compact />
                    <div className="inv-preview-view-toggle" role="group" aria-label={uiCopy("ប្តូរទិដ្ឋភាព", "Switch view")}>
                        <button
                            type="button"
                            className={`inv-preview-toggle-btn ${viewMode === "phone" ? "is-active" : ""}`}
                            onClick={() => setViewMode("phone")}
                            title={uiCopy("ទិដ្ឋភាពទូរស័ព្ទ", "Phone view")}
                        >
                            <Smartphone size={14} />
                            <span>{uiCopy("ទូរស័ព្ទ", "Phone")}</span>
                        </button>
                        <button
                            type="button"
                            className={`inv-preview-toggle-btn ${viewMode === "full" ? "is-active" : ""}`}
                            onClick={() => setViewMode("full")}
                            title={uiCopy("ទិដ្ឋភាពពេញអេក្រង់", "Full screen view")}
                        >
                            <Monitor size={14} />
                            <span>{uiCopy("ពេញអេក្រង់", "Full screen")}</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        className="inv-preview-btn inv-preview-btn--gate"
                        onClick={handleToggleGate}
                        title={isGateOpen ? uiCopy("មើលគម្របសំបុត្រ", "View invitation cover") : uiCopy("បើកមើលធៀបពេញ", "Open full invitation")}
                    >
                        {isGateOpen ? <Mail size={15} /> : <ScrollText size={15} />}
                        <span>{isGateOpen ? uiCopy("គម្រប", "Cover") : uiCopy("ធៀប", "Invitation")}</span>
                    </button>
                </div>
            </header>

            {/* Preview Canvas: supports Full Screen or Phone View */}
            <section aria-label={uiCopy("ផ្ទាំងធៀបអញ្ជើញ", "Invitation canvas")} className={`inv-preview-canvas ${viewMode === "full" ? "inv-preview-canvas--full" : ""}`}>
                {rendered ? (
                    <div className={`inv-phone-viewport ${viewMode === "full" ? "inv-phone-viewport--full" : ""}`}>
                        <TemplateExperience
                            key={`preview-${viewMode}`}
                            tpl={rendered.tpl}
                            variant={rendered.variant}
                            showActions={false}
                            showBreadcrumb={false}
                            preview={viewMode === "phone"}
                            previewStartClosed={!isGateOpen}
                            previewChannel={previewChannel}
                        />
                    </div>
                ) : (
                    <div className="inv-error" style={{ margin: "40px auto", maxWidth: 480 }}>
                        {uiCopy("មិនអាចផ្ទុកគំរូដែលបានជ្រើសរើសទេ។", "Could not resolve the selected template.")}
                    </div>
                )}
            </section>
        </div>
    );
}
