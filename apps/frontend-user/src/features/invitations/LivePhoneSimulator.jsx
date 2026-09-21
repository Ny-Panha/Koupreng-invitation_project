import { useMemo } from "react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { TemplateExperience } from "@/features/templates";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";

export default function LivePhoneSimulator({ data = {}, onSave, isSaving, catalogVersion = 0 }) {
    const { text: t } = useBackendMessages("invitations");

    // `catalogVersion` is a dependency because the first render runs while the
    // template catalog is still fetching — without it the memo keeps the stale
    // KEPT_TEMPLATE (Garden Royal) resolution forever.
    const merged = useMemo(() => {
        void catalogVersion;
        return draftToTemplate(data, data.photos?.map((p) => ({ preview: p.url || p, type: "image" })));
    }, [data, catalogVersion]);

    const templateName = merged?.tpl?.name || merged?.tpl?.style || t("previewTopInfo") || "គំរូសន្លឹកការ (Live Preview)";

    return (
        <aside className="pe-preview-column">
            {/* Top Bar matching PlanEssential */}
            <div className="pe-preview-top-bar">
                <div className="pe-preview-top-left">
                    <h3 className="pe-preview-top-title">{t("previewTitle") || "មើលគំរូជាមុន"}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span className="pe-preview-top-info">{templateName}</span>
                    {onSave && (
                        <button
                            type="button"
                            className="pe-save-main-btn"
                            onClick={onSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (t("saving") || "កំពុងរក្សាទុក...") : (t("saveBtn") || "រក្សាទុក")}
                        </button>
                    )}
                </div>
            </div>

            {/* Clean Portrait Canvas Wrapper with Live Template Experience */}
            <div className="pe-canvas-wrapper">
                {merged?.tpl ? (
                    <TemplateExperience
                        tpl={merged.tpl}
                        variant={merged.variant}
                        preview={true}
                        showBreadcrumb={false}
                        showActions={false}
                        showStickyCta={true}
                    />
                ) : (
                    <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                        <div>{t("loading") || "កំពុងទាញយក..."}</div>
                    </div>
                )}
            </div>
        </aside>
    );
}
