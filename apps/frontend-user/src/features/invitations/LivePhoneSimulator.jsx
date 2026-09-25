import { useMemo, useState } from "react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { TemplateExperience } from "@/features/templates";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";

export default function LivePhoneSimulator({ data = {}, onSave, isSaving, catalogVersion = 0 }) {
    const { text: t } = useBackendMessages("invitations");
    const [isGateOpen, setIsGateOpen] = useState(true);

    // `catalogVersion` is a dependency because the first render runs while the
    // template catalog is still fetching — without it the memo keeps the stale
    // KEPT_TEMPLATE (Garden Royal) resolution forever.
    const merged = useMemo(() => {
        return draftToTemplate(data, data.photos?.map((p) => ({ preview: p.url || p, type: "image" })));
    }, [data, catalogVersion]);

    const templateName = merged?.tpl?.name || merged?.tpl?.style || t("previewTopInfo") || "គំរូសន្លឹកការ (Live Preview)";

    const handleToggleGate = () => {
        const nextState = !isGateOpen;
        setIsGateOpen(nextState);
        window.postMessage({ type: "TOGGLE_GATE", open: nextState }, "*");
        const scroller = document.querySelector(".pe-canvas-wrapper");
        if (scroller) scroller.scrollTop = 0;
    };

    return (
        <aside className="pe-preview-column">
            {/* Clean Studio Preview Top Bar */}
            <div className="pe-preview-top-bar">
                <div className="pe-preview-top-left">
                    <h3 className="pe-preview-top-title">{t("previewTitle") || "មើលគំរូជាមុន"}</h3>
                    <span className="pe-preview-tag" title="គំរូនាពេលបច្ចុប្បន្ន">{templateName}</span>
                </div>
                <button
                    type="button"
                    className="pe-preview-gate-toggle"
                    onClick={handleToggleGate}
                    title={isGateOpen ? "មើលគម្របសំបុត្រ (Cover)" : "មើលធៀបពេញ (Full Template)"}
                >
                    {isGateOpen ? "✉ គម្រប" : "📜 ធៀបពេញ"}
                </button>
            </div>

            {/* Clean Portrait Canvas Wrapper with Live Template Experience */}
            <div className="pe-phone-frame">
                <div className="pe-canvas-wrapper">
                    {merged?.tpl ? (
                        <TemplateExperience
                            tpl={merged.tpl}
                            variant={merged.variant}
                            preview={true}
                            previewStartClosed={false}
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
            </div>
        </aside>
    );
}
