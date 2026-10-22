import React from "react";
import TemplateHero from "../experience/components/sections/TemplateHero";
import TemplateMessage from "../experience/components/sections/TemplateMessage";
import TemplateCouple from "../experience/components/sections/TemplateCouple";
import TemplateCountdown from "../experience/components/sections/TemplateCountdown";
import TemplateSchedule from "../experience/components/sections/TemplateSchedule";
import TemplateVenue from "../experience/components/sections/TemplateVenue";
import TemplateGallery from "../experience/components/sections/TemplateGallery";
import TemplateStory from "../experience/components/sections/TemplateStory";
import TemplateGift from "../experience/components/sections/TemplateGift";
import TemplateDressCode from "../experience/components/sections/TemplateDressCode";
import TemplateFaq from "../experience/components/sections/TemplateFaq";
import TemplateRsvp from "../experience/components/sections/TemplateRsvp";
import TemplateSectionHeader from "../experience/components/shared/TemplateSectionHeader";
import { templateIcons } from "../experience/config/templateIcons";

/**
 * LegacySectionBlock — Renders a core legacy template section inside the unified CMS engine.
 *
 * @param {Object} props
 * @param {string} props.sectionKey - Canonical section identifier (family, invitation, countdown, etc.)
 * @param {boolean} [props.enabled=true] - Visibility toggle from admin
 * @param {Object} props.content - Full resolved invitation content object
 * @param {Function} [props.onHeroOpen] - Handler for hero gate open
 * @param {React.ReactNode} [props.rsvpChildren] - Custom RSVP children if provided
 * @param {string} [props.useTemplateLink] - Target link for template actions
 */
export default function LegacySectionBlock({
  sectionKey,
  enabled = true,
  content = {},
  onHeroOpen,
  rsvpChildren,
  useTemplateLink,
}) {
  // If explicitly disabled via block data or content enabledSections, skip rendering
  if (enabled === false || (content?.enabledSections && content.enabledSections[sectionKey] === false)) {
    return null;
  }

  switch (sectionKey) {
    case "family":
      return <TemplateCouple content={content} />;

    case "invitation":
      return <TemplateMessage content={content} />;

    case "countdown":
      return <TemplateCountdown content={content} />;

    case "schedule":
      return <TemplateSchedule content={content} />;

    case "map":
      return <TemplateVenue content={content} />;

    case "gallery":
      return <TemplateGallery content={content} />;

    case "story":
      if (!Array.isArray(content?.story) || content.story.length === 0) {
        return null;
      }
      return <TemplateStory content={content} />;

    case "gift":
      return <TemplateGift content={content} />;

    case "dressCode":
      return <TemplateDressCode content={content} />;

    case "faq":
      return <TemplateFaq content={content} />;

    case "rsvp":
      if (rsvpChildren) {
        return (
          <div className="tx-children" data-tx-section="rsvp">
            <TemplateSectionHeader
              id="tx-rsvp-title"
              icon={templateIcons.invitation}
              kicker="ការឆ្លើយតប"
              title="សូមបញ្ជាក់ការចូលរួម"
              subtitle="RSVP"
            />
            {rsvpChildren}
          </div>
        );
      }
      return <TemplateRsvp useTemplateLink={useTemplateLink} />;

    case "hero":
      return <TemplateHero content={content} onOpen={onHeroOpen} />;

    case "party":
      if (import.meta.env?.DEV) {
        console.warn(`[LegacySectionBlock] No component exists for legacy section key: "party"`);
      }
      return null;

    default:
      if (import.meta.env?.DEV) {
        console.warn(`[LegacySectionBlock] Unknown section key: "${sectionKey}"`);
      }
      return null;
  }
}
