import React from "react";
import { BLOCK_COMPONENTS } from "./blockRegistry";
import BlockErrorBoundary from "./BlockErrorBoundary";

/**
 * DynamicTemplateRenderer — Renders an ordered array of CMS blocks with fault-tolerance.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.sections=[]] - Ordered list of block descriptors: { id, type, data }
 * @param {Object} [props.content={}] - Global invitation content passed to each block
 * @param {Object} [props.blockProps={}] - Extra props passed to every rendered block (e.g. onHeroOpen, rsvpChildren, useTemplateLink)
 * @param {string} [props.className=""] - Optional custom CSS classes
 */
export default function DynamicTemplateRenderer({
  sections = [],
  content = {},
  blockProps = {},
  className = "",
}) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return <main className={`w-full min-h-screen dynamic-blocks-engine ${className}`.trim()} />;
  }

  const isUnified = sections.some((b) => b?.type === "LEGACY_SECTION");
  const baseClasses = isUnified
    ? "w-full dynamic-blocks-engine"
    : "w-full min-h-screen dynamic-blocks-engine bg-zinc-950 text-white selection:bg-amber-500 selection:text-black";
  const finalClassName = className ? `w-full dynamic-blocks-engine ${className}`.trim() : baseClasses;

  return (
    <main className={finalClassName}>
      {sections.map((block, index) => {
        if (!block || typeof block !== "object") return null;

        const blockId = block.id || `block-${index}`;
        const Component = BLOCK_COMPONENTS[block.type];

        if (!Component) {
          if (import.meta.env?.DEV) {
            console.warn(
              `[DynamicTemplateRenderer] Unknown block type: "${block.type}" at index ${index}`
            );
          }
          return null;
        }

        const blockData = block.data && typeof block.data === "object" ? block.data : {};

        return (
          <BlockErrorBoundary key={blockId} blockId={blockId}>
            <Component {...blockData} content={content} {...blockProps} />
          </BlockErrorBoundary>
        );
      })}
    </main>
  );
}
