import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TemplateExperience from "../experience/TemplateExperience";
import { getTemplateById } from "../data/templatesData";
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
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        let active = true;
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
            });

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
            mainImage: remoteTpl.thumbnailUrl || baseTpl.mainImage,
            phoneCoverImage: remoteTpl.thumbnailUrl || baseTpl.phoneCoverImage,
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
    const createTemplatePath = "/templates/browse";
    const useTemplateLink = isAuthenticated
        ? createTemplatePath
        : `/login?next=${encodeURIComponent(createTemplatePath)}`;

    const variant = resolveVariant(tpl, forcedVariant);

    return (
        <TemplateExperience
            tpl={tpl}
            useTemplateLink={useTemplateLink}
            variant={variant}
        />
    );
}
