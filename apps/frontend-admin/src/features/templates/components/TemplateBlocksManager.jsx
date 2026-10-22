import { useState } from "react";
import {
  Image as ImageIcon,
  Type,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import {
  CMS_BLOCK_TYPES,
  addBlock,
  moveBlock,
  removeBlock,
  validateBlocks,
} from "./blockHelpers";
import { UniversalBlockEditor } from "./BlockEditors";

/**
 * TemplateBlocksManager — Admin UI for managing custom CMS blocks.
 * Enables adding, reordering, deleting, and editing modular blocks.
 *
 * @param {Object} props
 * @param {Array<Object>} props.blocks - Current blocks array
 * @param {Function} props.onChange - State updater receiving updated blocks array
 * @param {string} [props.lang="km"] - Current language ("km" | "en")
 */
export default function TemplateBlocksManager({
  blocks = [],
  onChange,
  lang = "km",
}) {
  const [collapsedIds, setCollapsedIds] = useState({});

  const blockList = Array.isArray(blocks) ? blocks : [];
  const errors = validateBlocks(blockList);

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAdd = (type) => {
    if (blockList.length >= 20) return;
    const next = addBlock(blockList, type);
    onChange(next);
  };

  const handleMove = (index, dir) => {
    const next = moveBlock(blockList, index, dir);
    onChange(next);
  };

  const handleRemove = (id) => {
    const next = removeBlock(blockList, id);
    onChange(next);
  };

  const updateBlockData = (id, partialData) => {
    const next = blockList.map((block) => {
      if (block.id !== id) return block;
      return {
        ...block,
        data: {
          ...block.data,
          ...partialData,
        },
      };
    });
    onChange(next);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      {/* Header & Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
              {lang === "en" ? "Modular Custom Blocks" : "ប្លុកមាតិកាបន្ថែម (Custom Blocks)"}
            </h3>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              {blockList.length} / 20
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {lang === "en"
              ? "Append custom images, text, and cinematic horizontal scrolls after legacy sections."
              : "បន្ថែមផ្ទាំងរូបភាព អត្ថបទ ឬ Cinematic Horizontal Scroll បន្តបន្ទាប់ពីផ្នែកមាតិកាដើម"}
          </p>
        </div>
      </div>

      {/* Validation Warning Alert */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{lang === "en" ? "Block Validation Warnings" : "បញ្ជាក់ព័ត៌មានដែលត្រូវបំពេញ"}</span>
          </div>
          <ul className="text-[11px] text-amber-200/90 list-disc list-inside space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Block Palette Buttons */}
      <div>
        <div className="text-[11px] font-semibold text-zinc-400 mb-2">
          {lang === "en" ? "Add Block to Template:" : "ជ្រើសរើសប្រភេទ Block ដើម្បីបន្ថែម:"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={blockList.length >= 20}
            onClick={() => handleAdd(CMS_BLOCK_TYPES.CUSTOM_IMAGE)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Custom Image" : "+ រូបភាព (Image)"}</span>
          </button>

          <button
            type="button"
            disabled={blockList.length >= 20}
            onClick={() => handleAdd(CMS_BLOCK_TYPES.CUSTOM_TEXT)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Type className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Custom Text" : "+ អត្ថបទ (Text)"}</span>
          </button>

          <button
            type="button"
            disabled={blockList.length >= 20}
            onClick={() => handleAdd(CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Cinematic Scroll" : "+ Cinematic Scroll"}</span>
          </button>
        </div>
      </div>

      {/* Block List */}
      {blockList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-6 text-center text-xs text-zinc-500">
          {lang === "en"
            ? "No custom blocks added yet. Click one of the buttons above to add blocks."
            : "មិនទាន់មាន Custom Block នៅឡើយទេ។ សូមចុចប៊ូតុងខាងលើដើម្បីបន្ថែម។"}
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {blockList.map((block, index) => {
            const isCollapsed = Boolean(collapsedIds[block.id]);
            const isFirst = index === 0;
            const isLast = index === blockList.length - 1;

            let typeLabel = "Block";
            let TypeIcon = Layers;

            if (block.type === CMS_BLOCK_TYPES.CUSTOM_IMAGE) {
              typeLabel = lang === "en" ? "Custom Image Block" : "ផ្ទាំងរូបភាព (Custom Image)";
              TypeIcon = ImageIcon;
            } else if (block.type === CMS_BLOCK_TYPES.CUSTOM_TEXT) {
              typeLabel = lang === "en" ? "Custom Text Block" : "ផ្ទាំងអត្ថបទ (Custom Text)";
              TypeIcon = Type;
            } else if (block.type === CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE) {
              typeLabel = lang === "en" ? "Cinematic Scroll Showcase" : "ផ្ទាំងរូបភាពរត់ផ្ដេក (Cinematic Scroll)";
              TypeIcon = Layers;
            }

            return (
              <div
                key={block.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/70 overflow-hidden transition-all shadow-sm"
              >
                {/* Block Row Header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-bold text-amber-400 w-5">
                      #{index + 1}
                    </span>
                    <TypeIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {typeLabel}
                    </span>
                  </div>

                  {/* Actions: Reorder, Collapse, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title={lang === "en" ? "Move Up" : "រំកិលឡើងលើ"}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title={lang === "en" ? "Move Down" : "រំកិលចុះក្រោម"}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(block.id)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                      title={isCollapsed ? (lang === "en" ? "Expand" : "ពន្លាត") : (lang === "en" ? "Collapse" : "បង្រួម")}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(block.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer ml-1"
                      title={lang === "en" ? "Delete Block" : "លុប Block"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Settings Form (Collapsible) */}
                {!isCollapsed && (
                  <div className="p-3.5 space-y-3 bg-zinc-950/40">
                    <UniversalBlockEditor
                      block={block}
                      onChange={(newData) => updateBlockData(block.id, newData)}
                      lang={lang}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
