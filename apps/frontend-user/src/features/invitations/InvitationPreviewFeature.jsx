import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
        const catalogTemplate = catalog.find((item) =>
            String(item.id) === String(invitation.templateId)
            || String(item.code || "").toLowerCase() === String(invitation.templateCode || "").toLowerCase()
        );
        const draft = publicInvitationToDraft(
            {
                ...invitation,
                templateCode: invitation.templateCode || catalogTemplate?.code,
                templateThumbnailUrl: invitation.templateThumbnailUrl || catalogTemplate?.thumbnailUrl,
            },
            media
        );
        return draftToTemplate(draft, draft.gallery || []);
    }, [catalog, invitation, media]);

    if (loading) {
        return <div className="inv-page"><div className="inv-loading">Loading preview...</div></div>;
    }

    if (error) {
        return <div className="inv-page"><div className="inv-error">{error}</div></div>;
    }

    return (
        <div>
            <div className="preview-toolbar">
                <button type="button" className="inv-secondary-btn" onClick={() => navigate(`/dashboard/invitations/${id}/edit`)}>
                    Edit
                </button>
                <button type="button" className="inv-secondary-btn" onClick={() => navigate(`/dashboard/invitations/${id}/media`)}>
                    Media
                </button>
                <button type="button" className="inv-secondary-btn" onClick={() => navigate("/dashboard")}>
                    Dashboard
                </button>
            </div>
            {rendered ? (
                <TemplateExperience
                    tpl={rendered.tpl}
                    variant={rendered.variant}
                    showActions={false}
                    showBreadcrumb={false}
                    preview
                />
            ) : (
                <div className="inv-error">Could not resolve the selected template.</div>
            )}
        </div>
    );
}
