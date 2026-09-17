import { useParams } from "react-router-dom";
import TemplateExperience from "../experience/TemplateExperience";
import { getTemplateById } from "../data/templatesData";
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
    const aliasTargetId = VARIANT_ROUTE_ALIASES[id];
    const tpl = getTemplateById(aliasTargetId || id);
    const forcedVariant = aliasTargetId ? id : undefined;

    // Logged-in host: go straight to the wedding builder.
    const useTemplateLink = `/create/wedding?template=${tpl.id}`;
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
            backLabel="ត្រឡប់ទៅបន្ថែមគម្រូ"
            primaryCtaLabel="ប្រើគំរូនេះ"
        />
    );
}
