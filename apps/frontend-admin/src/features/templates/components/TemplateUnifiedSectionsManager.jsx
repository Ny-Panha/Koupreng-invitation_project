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
  Eye,
  EyeOff,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { DEFAULT_SECTIONS_LIST } from "./templateSections";
import {
  CMS_BLOCK_TYPES,
  addBlock,
  moveUnifiedItem,
  removeBlock,
  toggleUnifiedSectionEnabled,
  validateBlocks,
  buildUnifiedSections,
} from "./blockHelpers";
import { UniversalBlockEditor } from "./BlockEditors";

/**
 * TemplateUnifiedSectionsManager — Phase 3 unified manager allowing the admin to arrange
 * core invitation sections and custom CMS blocks in a single ordered list.
 *
 * @param {Object} props
 * @param {Array<Object>} props.sections - Unified sections array [{ id, type, data }]
 * @param {Function} props.onChange - State updater receiving updated sections array
 * @param {Function} [props.onJumpToTab] - Handler to navigate to related studio tab
 * @param {Function} [props.onResetDefault] - Handler to reset order to default
 * @param {string} [props.lang="km"] - Current interface language ("km" | "en")
 */
export default function TemplateUnifiedSectionsManager({
  sections = [],
  onChange,
  onJumpToTab,
  onResetDefault,
  lang = "km",
}) {
  const [collapsedIds, setCollapsedIds] = useState({});

  const list = Array.isArray(sections) ? sections : [];
  const errors = validateBlocks(list);

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddCustomBlock = (type) => {
    if (list.length >= 30) return;
    const next = addBlock(list, type);
    onChange(next);
  };

  const handleMove = (index, dir) => {
    const next = moveUnifiedItem(list, index, dir);
    onChange(next);
  };

  const handleToggleEnabled = (id) => {
    const next = toggleUnifiedSectionEnabled(list, id);
    onChange(next);
  };

  const handleRemove = (id) => {
    const next = removeBlock(list, id);
    onChange(next);
  };

  const handleUpdateCustomBlockData = (id, partialData) => {
    const next = list.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        data: {
          ...item.data,
          ...partialData,
        },
      };
    });
    onChange(next);
  };

  const handleResetToDefault = () => {
    if (onResetDefault) {
      onResetDefault();
    } else {
      const reset = buildUnifiedSections({});
      onChange(reset);
    }
  };

  const enabledCount = list.filter((s) => s.data?.enabled !== false).length;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      {/* Header & Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
              {lang === "en" ? "Page Layout & Sections" : "លំដាប់ផ្នែក និងមាតិកា (Page Sections)"}
            </h3>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              {enabledCount} / {list.length} {lang === "en" ? "Active" : "បើកដំណើរការ"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {lang === "en"
              ? "Reorder legacy sections and custom blocks in one continuous page flow."
              : "រៀបចំលំដាប់ផ្នែកមង្គលការ និង Custom Blocks ទាំងអស់ក្នុងបញ្ជីតែមួយតាមលំដាប់ដែលអ្នកចង់បាន"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-700 hover:text-amber-300 transition cursor-pointer"
          title={lang === "en" ? "Reset to Default Order" : "កំណត់លំដាប់ដើមឡើងវិញ"}
        >
          <RotateCcw className="h-3 w-3" />
          <span>{lang === "en" ? "Reset Default" : "កំណត់លំដាប់ដើម"}</span>
        </button>
      </div>

      {/* Validation Warnings */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{lang === "en" ? "Validation Warnings" : "បញ្ជាក់ព័ត៌មានដែលត្រូវបំពេញ"}</span>
          </div>
          <ul className="text-[11px] text-amber-200/90 list-disc list-inside space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Custom Block Palette Buttons */}
      <div>
        <div className="text-[11px] font-semibold text-zinc-400 mb-2">
          {lang === "en" ? "Insert Custom Block:" : "បន្ថែម Custom Block ទៅកាន់ទំព័រ:"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={list.length >= 30}
            onClick={() => handleAddCustomBlock(CMS_BLOCK_TYPES.CUSTOM_IMAGE)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Custom Image" : "+ រូបភាព (Image)"}</span>
          </button>

          <button
            type="button"
            disabled={list.length >= 30}
            onClick={() => handleAddCustomBlock(CMS_BLOCK_TYPES.CUSTOM_TEXT)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Type className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Custom Text" : "+ អត្ថបទ (Text)"}</span>
          </button>

          <button
            type="button"
            disabled={list.length >= 30}
            onClick={() => handleAddCustomBlock(CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Cinematic Scroll" : "+ Cinematic Scroll"}</span>
          </button>
        </div>
      </div>

      {/* Unified Ordered List */}
      <div className="space-y-2 pt-1">
        {list.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === list.length - 1;
          const isLegacy = item.type === CMS_BLOCK_TYPES.LEGACY_SECTION;

          if (isLegacy) {
            const sectionKey = item.data?.sectionKey;
            const info = DEFAULT_SECTIONS_LIST.find((s) => s.key === sectionKey) || {
              key: sectionKey,
              label: sectionKey,
              desc: "",
            };
            const isEnabled = item.data?.enabled !== false;

            return (
              <div
                key={item.id || `legacy-${sectionKey}`}
                className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-all shadow-sm ${
                  isEnabled
                    ? "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                    : "border-zinc-800/40 bg-zinc-950/30 opacity-60"
                }`}
              >
                {/* Left: Drag grip, Toggle eye, Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-[11px] font-bold text-amber-400/90 w-5">
                      #{index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(item.id)}
                    className={`rounded-lg p-1.5 transition cursor-pointer ${
                      isEnabled
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-zinc-600 hover:bg-zinc-800"
                    }`}
                    title={isEnabled ? (lang === "en" ? "Hide section" : "បិទផ្នែកនេះ") : (lang === "en" ? "Show section" : "បើកផ្នែកនេះ")}
                  >
                    {isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  <div className="min-w-0">
                    <span className={`block text-xs font-semibold truncate ${
                      isEnabled ? "text-zinc-100" : "text-zinc-400 line-through"
                    }`}>
                      {info.label}
                    </span>
                    {info.desc && (
                      <span className="block text-[10px] text-zinc-500 truncate">
                        {info.desc}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Jump to tab & Reorder buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {info.tabTarget && onJumpToTab && (
                    <button
                      type="button"
                      onClick={() => onJumpToTab(info.tabTarget, info.subTab)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition cursor-pointer"
                      title={lang === "en" ? "Edit in tab" : "កែប្រែក្នុង Tab"}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden sm:inline">{lang === "en" ? "Edit" : "កែ"}</span>
                    </button>
                  )}

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
                </div>
              </div>
            );
          }

          // Custom Block Item
          const isCollapsed = Boolean(collapsedIds[item.id]);
          let typeLabel = "Block";
          let TypeIcon = Layers;

          if (item.type === CMS_BLOCK_TYPES.CUSTOM_IMAGE) {
            typeLabel = lang === "en" ? "Custom Image Block" : "ផ្ទាំងរូបភាព (Custom Image)";
            TypeIcon = ImageIcon;
          } else if (item.type === CMS_BLOCK_TYPES.CUSTOM_TEXT) {
            typeLabel = lang === "en" ? "Custom Text Block" : "ផ្ទាំងអត្ថបទ (Custom Text)";
            TypeIcon = Type;
          } else if (item.type === CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE) {
            typeLabel = lang === "en" ? "Cinematic Scroll Showcase" : "ផ្ទាំងរូបភាពរត់ផ្ដេក (Cinematic Scroll)";
            TypeIcon = Layers;
          }

          return (
            <div
              key={item.id}
              className="rounded-xl border border-amber-500/30 bg-zinc-950/80 overflow-hidden transition-all shadow-sm"
            >
              {/* Custom Block Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-bold text-amber-400 w-5">
                    #{index + 1}
                  </span>
                  <TypeIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-200 truncate">
                    {typeLabel}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 uppercase">
                    CMS Block
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
                    onClick={() => toggleCollapse(item.id)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                    title={isCollapsed ? (lang === "en" ? "Expand" : "ពន្លាត") : (lang === "en" ? "Collapse" : "បង្រួម")}
                  >
                    {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer ml-1"
                    title={lang === "en" ? "Delete Block" : "លុប Block"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Block Settings Form */}
              {!isCollapsed && (
                <div className="p-3.5 space-y-3 bg-zinc-950/40">
                  <UniversalBlockEditor
                    block={item}
                    onChange={(newData) => handleUpdateCustomBlockData(item.id, newData)}
                    lang={lang}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
