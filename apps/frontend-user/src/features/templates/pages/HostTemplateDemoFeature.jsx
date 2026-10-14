import { useParams } from "react-router-dom";
import TemplateExperience from "../experience/TemplateExperience";
import { getTemplateById } from "../data/templatesData";
import { useLanguageStore } from "@/stores/useLanguageStore";
import {
    resolveVariant,
    VARIANT_ROUTE_ALIASES,
} from "../experience/config/templateExperienceThemes";

/**
 * HostTemplateDemoPage — authenticated template preview page.
 *
 * Provides a dedicated, full-screen immersive preview of the wedding invitation
 * template without dashboard nav collision. Includes a clean topbar with a direct
 * return link back to Browse Templates (/templates/browse) and a CTA to start
 * creating the wedding invitation.
 *
 * Routing: /templates/browse/:id
 */
export default function HostTemplateDemoPage() {
    const { id } = useParams();
    const lang = useLanguageStore((state) => state.lang);
    const aliasTargetId = VARIANT_ROUTE_ALIASES[id];
    const tpl = getTemplateById(aliasTargetId || id);
    const forcedVariant = aliasTargetId ? id : undefined;

    // Logged-in host: go straight to the wedding builder.
    const useTemplateLink = `/templates/browse?template=${encodeURIComponent(aliasTargetId || id)}`;
    const variant = resolveVariant(tpl, forcedVariant);

    return (
        <TemplateExperience
            tpl={tpl}
            useTemplateLink={useTemplateLink}
            variant={variant}
            breadcrumbItems={[
                { label: "ផ្ទាំងគ្រប់គ្រង", to: "/dashboard" },
                { label: "បន្ថែមគម្រូ", to: "/templates/browse" },
                { label: tpl.name },
            ]}
            backLink="/templates/browse"
            backLabel={lang === "en" ? "Back to designs" : "ត្រឡប់ទៅបញ្ជីគំរូ"}
            primaryCtaLabel={lang === "en" ? "Use this design" : "ប្រើគំរូនេះ"}
        />
    );
}
