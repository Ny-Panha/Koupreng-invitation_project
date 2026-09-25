import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import "./wedding-site.css";
import TemplateExperience from "../templates/experience/TemplateExperience";
import { getTemplateById } from "../templates/data/templatesData";
import { resolveVariant } from "../templates/experience/config/templateExperienceThemes";

/**
 * WeddingSite — full-page public wedding invitation viewer.
 * Used by /templates/:id/preview and /w/:slug routes.
 *
 * Accepts either:
 *  - tpl (from props) when a parent already loaded the template
 *  - or falls back to looking up by :id route param
 */
export default function WeddingSite({
    tpl: tplProp,
    showBack = true,
    backTo,
    backLabel = "← ត្រឡប់",
}) {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const tpl = tplProp || getTemplateById(id);
    const variant = useMemo(() => resolveVariant(tpl), [tpl]);

    const isEmbedded = typeof window !== "undefined" && (
        window.self !== window.top ||
        searchParams.get("preview") === "true" ||
        searchParams.get("embed") === "true"
    );
    const startOpen = searchParams.get("open") === "true";
    const shouldShowBack = showBack && !isEmbedded;
    const backPath = backTo || `/templates/${tpl.id}`;

    return (
        <div className={`tpl-wed-root ${isEmbedded ? "tpl-wed-root--embedded" : ""}`}>
            {shouldShowBack && (
                <Link to={backPath} className="tpl-wed-back">
                    {backLabel}
                </Link>
            )}
            <TemplateExperience
                tpl={tpl}
                variant={variant}
                preview={isEmbedded || startOpen}
                previewStartClosed={isEmbedded && !startOpen}
                showBreadcrumb={!isEmbedded}
                showActions={!isEmbedded}
                showStickyCta={!isEmbedded}
            />
        </div>
    );
}

