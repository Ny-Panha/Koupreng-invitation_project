import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { TemplateExperience, registerDynamicTemplates } from "@/features/templates";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";
import { useWeddingStore } from "../../stores/useWeddingStore";
import { loadGallery } from "../../shared/storage/galleryStorage";
import { loadDraftMediaFiles } from "../../shared/storage/draftMediaStorage";

/**
 * WeddingPreviewPage — renders the user's wedding draft as a full invitation
 * page using the SAME shared TemplateExperience engine that powers the public
 * /templates/:id pages and the builder's live phone preview. This keeps the
 * dashboard "មើលជាមុន" preview visually identical to the templates UI.
 *
 * Mounted on /preview/:draftId and /event/:draftId.
 */
export default function WeddingPreviewPage() {
    const { draftId } = useParams();
    const location = useLocation();

    const draft = useWeddingStore((state) => state.draft);
    const loadDraft = useWeddingStore((state) => state.loadDraft);
    const error = useWeddingStore((state) => state.error);

    const [gallery, setGallery] = useState(null); // null = loading, [] = loaded but empty
    const [draftMedia, setDraftMedia] = useState(null);
    const activeDraft = draft?.id === draftId ? draft : null;

    // Load dynamic admin templates so getTemplateById resolves them
    useEffect(() => {
        templateCatalogService.list()
            .then((items) => { if (items?.length) registerDynamicTemplates(items); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!draftId) {
            setGallery([]);
            return;
        }

        setGallery(null);

        const loadedDraft = loadDraft(draftId);

        if (!loadedDraft) {
            setGallery([]);
            return;
        }

        loadGallery(draftId)
            .then(setGallery)
            .catch((err) => {
                console.error("Failed to load gallery", err);
                setGallery([]);
            });
    }, [draftId, loadDraft]);

    useEffect(() => {
        if (!draftId) {
            setDraftMedia({});
            return undefined;
        }
        let active = true;
        const objectUrls = [];
        loadDraftMediaFiles(draftId)
            .then((records) => {
                if (!active) return;
                const previews = {};
                Object.entries(records).forEach(([kind, record]) => {
                    if (!record?.file) return;
                    const url = URL.createObjectURL(record.file);
                    objectUrls.push(url);
                    previews[kind] = { ...record, url };
                });
                setDraftMedia(previews);
            })
            .catch(() => {
                if (active) setDraftMedia({});
            });
        return () => {
            active = false;
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [draftId]);

    const merged = useMemo(() => {
        if (!activeDraft || gallery === null || draftMedia === null) return null;
        return draftToTemplate({
            ...activeDraft,
            coverImage: draftMedia.cover?.url || activeDraft.coverImage,
            openingVideo: draftMedia.openingVideo
                ? { name: draftMedia.openingVideo.name, url: draftMedia.openingVideo.url }
                : activeDraft.openingVideo,
            music: draftMedia.music
                ? { name: draftMedia.music.name, url: draftMedia.music.url }
                : activeDraft.music,
        }, gallery);
    }, [activeDraft, draftMedia, gallery]);

    if (gallery === null || draftMedia === null) {
        return (
            <div style={{ padding: 80, textAlign: "center", color: "#7d6443" }}>
                កំពុងផ្ទុក...
            </div>
        );
    }

    if (error || !activeDraft?.id || !merged) {
        return (
            <div style={{ padding: 80, textAlign: "center" }}>
                <h2>មិនរកឃើញ Draft</h2>

                <p style={{ color: "#777", marginTop: 12 }}>
                    Draft ID: {draftId}
                </p>

                <Link
                    to="/dashboard/events"
                    className="wb-btn"
                    style={{ marginTop: 16, display: "inline-block" }}>
                    ចាប់ផ្ដើមថ្មី
                </Link>
            </div>
        );
    }

    const backTo = location.state?.backTo || "/dashboard";
    const backLabel = backTo === "/events" ? "ត្រឡប់ទៅកម្មវិធី" : "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង";
    const startCrumb =
        backTo === "/events"
            ? { label: "កម្មវិធី", to: "/events" }
            : { label: "ផ្ទាំងគ្រប់គ្រង", to: "/dashboard" };

    return (
        <TemplateExperience
            tpl={merged.tpl}
            variant={merged.variant}
                    useTemplateLink={`/dashboard/invitations/${activeDraft.id}/edit`}
            primaryCtaLabel="កែសម្រួលសន្លឹកការ"
            breadcrumbItems={[
                startCrumb,
                { label: "មើលជាមុន" },
            ]}
            backLink={backTo}
            backLabel={backLabel}
        />
    );
}
