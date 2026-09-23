import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ExternalLink,
    Mail,
    Pencil,
    ScrollText,
} from "lucide-react";
import "./InvitationPages.css";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { TemplateExperience, registerDynamicTemplates } from "@/features/templates";
import { draftToTemplate } from "@/features/wedding-builder/utils/draftToTemplate";
import { publicInvitationToDraft } from "@/features/wedding-builder/utils/invitationDraftAdapter";

export default function InvitationPreviewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const [media, setMedia] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isGateOpen, setIsGateOpen] = useState(true);

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
        window.postMessage({ type: "TOGGLE_GATE", open: nextState }, "*");
    };

    if (loading) {
        return (
            <div className="inv-preview-loading-screen">
                <div className="inv-preview-spinner" />
                <p>កំពុងរៀបចំការមើលជាមុន (Loading preview)...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inv-page">
                <div className="inv-error">{error}</div>
                <button type="button" className="inv-secondary-btn" onClick={() => navigate("/dashboard/invitations")}>
                    ត្រឡប់ទៅបញ្ជីធៀប
                </button>
            </div>
        );
    }

    const coupleNames = [invitation?.groomName, invitation?.brideName].filter(Boolean).join(" & ");
    const previewTitle = coupleNames || invitation?.title || "មើលសន្លឹកការ";
    const isPublished = invitation?.status === "PUBLISHED";
    const publicUrl = invitation?.slug ? `/i/${invitation.slug}` : `/event/${id}`;

    return (
        <div className="inv-preview-workspace">
            {/* Clean, Non-colliding Mobile-first Header */}
            <header className="inv-preview-header">
                <div className="inv-preview-header__left">
                    <button
                        type="button"
                        className="inv-preview-back-btn"
                        onClick={() => navigate("/dashboard/invitations")}
                        title="ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង"
                    >
                        <ArrowLeft size={15} />
                        <span className="inv-back-label">ត្រឡប់</span>
                    </button>

                    <div className="inv-preview-meta">
                        <span className="inv-preview-title">{previewTitle}</span>
                        <span className={`inv-preview-badge inv-preview-badge--${isPublished ? "live" : "draft"}`}>
                            {isPublished ? "Live" : "Draft"}
                        </span>
                    </div>
                </div>

                <div className="inv-preview-header__right">
                    <button
                        type="button"
                        className="inv-preview-btn inv-preview-btn--gate"
                        onClick={handleToggleGate}
                        title={isGateOpen ? "មើលគម្របសំបុត្រ" : "បើកមើលធៀបពេញ"}
                    >
                        {isGateOpen ? <Mail size={14} /> : <ScrollText size={14} />}
                        <span>{isGateOpen ? "គម្រប" : "ធៀប"}</span>
                    </button>

                    <button
                        type="button"
                        className="inv-preview-btn"
                        onClick={() => navigate(`/dashboard/invitations/${id}/edit`)}
                        title="កែសម្រួលព័ត៌មានធៀប"
                    >
                        <Pencil size={14} />
                        <span>កែ</span>
                    </button>

                    <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inv-preview-btn inv-preview-btn--primary"
                        title="បើកមើលជាភ្ញៀវក្នុងផ្ទាំងថ្មី"
                    >
                        <ExternalLink size={14} />
                        <span>ភ្ញៀវ</span>
                    </a>
                </div>
            </header>

            {/* Preview Canvas: 100% phone experience without artificial notch blocking photos */}
            <main className="inv-preview-canvas">
                {rendered ? (
                    <div className="inv-phone-viewport">
                        <TemplateExperience
                            key={`phone-${isGateOpen}`}
                            tpl={rendered.tpl}
                            variant={rendered.variant}
                            showActions={false}
                            showBreadcrumb={false}
                            preview={true}
                            previewStartClosed={!isGateOpen}
                        />
                    </div>
                ) : (
                    <div className="inv-error" style={{ margin: "40px auto", maxWidth: 480 }}>
                        Could not resolve the selected template.
                    </div>
                )}
            </main>
        </div>
    );
}
