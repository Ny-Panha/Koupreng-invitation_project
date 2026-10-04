import { createElement } from "react";
import { getDedicatedTemplateComponent } from "../registry/templateRegistry";

/**
 * LegacyTemplateBlock — Wraps and renders existing monolithic templates inside block JSON.
 * Renders with the exact prop contract TemplateExperience provides to layout components.
 *
 * @param {Object} props
 * @param {string} props.templateId - ID, slug, or code of the legacy template (e.g. 'khmer-celestial')
 * @param {Object} [props.content={}] - Invitation data payload passed to the template
 */
export default function LegacyTemplateBlock({ templateId, content = {} }) {
  const tplRef = {
    id: templateId,
    slug: templateId,
    code: templateId,
    templateCode: templateId,
    presetId: templateId,
    ...content,
  };

  const DedicatedLayout = getDedicatedTemplateComponent(tplRef, null, true);

  if (!DedicatedLayout) {
    if (import.meta.env?.DEV) {
      console.warn(
        `[LegacyTemplateBlock] Could not resolve legacy template layout for ID: "${templateId}"`
      );
    }
    return null;
  }

  const effectiveContent = {
    ...content,
    groom: content.groom || content.groomName || "",
    bride: content.bride || content.brideName || "",
    title: content.title || content.invitationTitle || "",
    subtitle: content.subtitle || content.invitationSubtitle || "",
  };

  const isPreview = content.preview !== undefined ? Boolean(content.preview) : true;

  // Exact prop contract matching TemplateExperience
  return createElement(DedicatedLayout, {
    tpl: effectiveContent,
    content: effectiveContent,
    liveData: null,
    showBack: false,
    backTo: "/templates/browse",
    backLabel: "ត្រឡប់ក្រោយ",
    preview: isPreview,
    previewStartClosed: false,
    previewChannel: null,
    useTemplateLink: undefined,
    primaryCtaLabel: "ប្រើគំរូនេះ",
    showActions: true,
    showStickyCta: true,
    isHostedInvitation: false,
  });
}

