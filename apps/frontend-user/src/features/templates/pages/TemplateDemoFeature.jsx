import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TemplateExperience from "../experience/TemplateExperience";
import { DB_TEMPLATE_ID_MAP, getTemplateById, TEMPLATES } from "../data/templatesData";
import { templateService } from "../api/templateService";
import {
    resolveVariant,
    VARIANT_ROUTE_ALIASES,
} from "../experience/config/templateExperienceThemes";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * TemplateDemoPage — public template detail / demo page.
 * Loads live active template data from backend API with local schema support.
 */
export default function TemplateDemoPage() {
    const { id } = useParams();
    const aliasTargetId = VARIANT_ROUTE_ALIASES[id];
    const targetId = aliasTargetId || id;
    const [remoteTpl, setRemoteTpl] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        let active = true;
        setRemoteTpl(null);
        setLoading(true);
        const fetcher = /^\d+$/.test(targetId)
            ? templateService.getPublic(targetId)
            : templateService.getPublicBySlug(targetId);

        fetcher
            .then((res) => {
                if (active && res) {
                    setRemoteTpl(res);
                }
            })
            .catch(() => {
                // Keep local fallback on network error
            }).finally(() => { if (active) setLoading(false); });

        return () => {
            active = false;
        };
    }, [targetId]);

    const tpl = useMemo(() => {
        const baseTpl = getTemplateById(remoteTpl?.code || remoteTpl?.slug || targetId);
        if (!remoteTpl) return baseTpl;

        let parsedConfig = {};
        try {
            if (remoteTpl.description && remoteTpl.description.startsWith("{")) {
                parsedConfig = JSON.parse(remoteTpl.description);
            }
        } catch {
            // keep standard description
        }

        return {
            ...baseTpl,
            id: remoteTpl.code || String(remoteTpl.id) || baseTpl.id,
            name: remoteTpl.name || baseTpl.name,
            style: remoteTpl.name || baseTpl.style,
            description: parsedConfig.blessingMessage || remoteTpl.description || baseTpl.description,
            image: remoteTpl.thumbnailUrl || baseTpl.image,
            mainImage: parsedConfig.coverImage || baseTpl.mainImage || remoteTpl.thumbnailUrl,
            phoneCoverImage: parsedConfig.coverImage || baseTpl.phoneCoverImage || remoteTpl.thumbnailUrl,
            presetId: parsedConfig.presetId || parsedConfig.theme || baseTpl.presetId,
            price: remoteTpl.price ?? baseTpl.price,
            isPremium: Boolean(remoteTpl.isPremium || remoteTpl.premium),
            design: {
                ...baseTpl.design,
                openingStyle: parsedConfig.gateStyle || baseTpl.design?.openingStyle,
                primaryColor: parsedConfig.primaryColor || baseTpl.design?.primaryColor,
                secondaryColor: parsedConfig.secondaryColor || baseTpl.design?.secondaryColor,
            },
            groom: parsedConfig.groomName || baseTpl.groom,
            bride: parsedConfig.brideName || baseTpl.bride,
            dateText: parsedConfig.weddingDate || baseTpl.dateText,
            opening: {
                ...baseTpl.opening,
                heading: parsedConfig.invitationTitle || baseTpl.opening?.heading,
                invitationText: parsedConfig.invitationSubtitle || baseTpl.opening?.invitationText,
            },
            badge: parsedConfig.badgeText || baseTpl.badge,
            amp: parsedConfig.ampSymbol || baseTpl.amp,
        };
    }, [remoteTpl, targetId]);

    const forcedVariant = aliasTargetId ? id : undefined;
    const createTemplatePath = `/templates/browse?template=${encodeURIComponent(remoteTpl?.code || targetId)}`;
    const useTemplateLink = isAuthenticated
        ? createTemplatePath
        : `/login?next=${encodeURIComponent(createTemplatePath)}`;

    const variant = resolveVariant(tpl, forcedVariant);
    const knownId = DB_TEMPLATE_ID_MAP[targetId] || targetId;
    const knownLocal = TEMPLATES.some((item) => [item.id, item.code, item.slug].includes(knownId));
    if (!remoteTpl && !knownLocal) {
        if (loading) return <div className="public-state" role="status">កំពុងផ្ទុកគំរូ… / Loading template…</div>;
        return <main className="public-state"><h1>រកគំរូមិនឃើញ / Template unavailable</h1><Link to="/templates">មើលគំរូសន្លឹកការ / Browse templates</Link></main>;
    }

    return (
        <TemplateExperience
            tpl={tpl}
            useTemplateLink={useTemplateLink}
            variant={variant}
        />
    );
}
