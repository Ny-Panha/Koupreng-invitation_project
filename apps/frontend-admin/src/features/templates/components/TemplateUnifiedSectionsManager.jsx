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
  Plus,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DEFAULT_SECTIONS_LIST } from "./templateSections";
import {
  CMS_BLOCK_TYPES,
  moveUnifiedItem,
  removeBlock,
  toggleUnifiedSectionEnabled,
  validateBlocks,
  buildUnifiedSections,
} from "./blockHelpers";
import { UniversalBlockEditor } from "./BlockEditors";

/**
 * Sortable wrapper row using @dnd-kit for mouse drag-and-drop
 */
function SortableSectionRow({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}

/**
 * TemplateUnifiedSectionsManager — Phase 3 & Drag-and-Drop Unified Manager
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
  const [showSectionPicker, setShowSectionPicker] = useState(false);

  const list = Array.isArray(sections) ? sections : [];
  const errors = validateBlocks(list);

  // Setup sensors for @dnd-kit (5px pointer move required so clicks work reliably)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = list.findIndex((item) => item.id === active.id);
      const newIndex = list.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const next = arrayMove(list, oldIndex, newIndex);
        onChange(next);
      }
    }
  };

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddCustomBlock = (type) => {
    if (list.length >= 30) return;
    let initialData = {};
    if (type === CMS_BLOCK_TYPES.CUSTOM_IMAGE) {
      initialData = {
        imageUrl: "/facebook/all/03-card/03-01.jpg",
        caption: "រូបអនុស្សាវរីយ៍ផ្អែមល្ហែម · Sweet Moment",
        alt: "Wedding photo",
      };
    } else if (type === CMS_BLOCK_TYPES.CUSTOM_TEXT) {
      initialData = {
        heading: "ដំណើរនៃសេចក្តីស្រឡាញ់ (Our Journey)",
        body: "ពេលវេលាដែលយើងបានស្គាល់គ្នា គឺជាពេលវេលាដ៏មានតម្លៃបំផុតក្នុងជីវិត។",
        align: "center",
      };
    } else if (type === CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE) {
      initialData = {
        heading: "កម្រងរូបភាពអនុស្សាវរីយ៍ (Cinematic Moments)",
        cards: [
          {
            id: `card-${Date.now()}-1`,
            img: "/facebook/all/03-card/03-01.jpg",
            title: "ថ្ងៃជួបគ្នាដំបូង",
            subtitle: "First Met · 2022",
          },
          {
            id: `card-${Date.now()}-2`,
            img: "/facebook/all/03-card/03-02.jpg",
            title: "ដំណើរកម្សាន្តនៅសៀមរាប",
            subtitle: "Angkor Trip · 2024",
          },
          {
            id: `card-${Date.now()}-3`,
            img: "/facebook/all/03-card/03-03.jpg",
            title: "ថ្ងៃសុំរៀបការ",
            subtitle: "The Proposal · 2025",
          },
        ],
      };
    }

    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      data: initialData,
    };
    onChange([...list, newBlock]);
  };

  const handleAddLegacySection = (key) => {
    if (list.length >= 30) return;
    const newSection = {
      id: `sec-${key}-${Date.now()}`,
      type: CMS_BLOCK_TYPES.LEGACY_SECTION,
      data: {
        sectionKey: key,
        enabled: true,
      },
    };
    onChange([...list, newSection]);
    setShowSectionPicker(false);
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

  const handleClearAll = () => {
    onChange([]);
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
  const itemIds = list.map((item) => item.id);

  // Find legacy sections not yet present in list
  const presentLegacyKeys = list
    .filter((s) => s.type === CMS_BLOCK_TYPES.LEGACY_SECTION)
    .map((s) => s.data?.sectionKey);
  const availableLegacySections = DEFAULT_SECTIONS_LIST.filter(
    (s) => !presentLegacyKeys.includes(s.key)
  );

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      {/* Header & Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
              {lang === "en" ? "Page Sections & Blocks" : "លំដាប់ផ្នែក និងមាតិកា (Page Sections)"}
            </h3>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              {enabledCount} / {list.length} {lang === "en" ? "Active" : "បើកដំណើរការ"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {lang === "en"
              ? "Drag & drop with mouse or use arrows to rearrange sections. Delete default sections as needed."
              : "ចាប់ទាញទម្លាក់ដោយ Mouse (Drag & Drop) ឬចុចព្រួញរៀបលំដាប់។ អាចលុប Section ណាដែលមិនចង់បាន។"}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {list.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 transition cursor-pointer"
              title={lang === "en" ? "Clear all sections (blank canvas)" : "លុប Section ទាំងអស់ចោល (ចាប់ផ្តើមទំព័រទទេ)"}
            >
              <Trash2 className="h-3 w-3" />
              <span>{lang === "en" ? "Clear All" : "លុបទាំងអស់"}</span>
            </button>
          )}

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

      {/* Palette: Add Blocks & Sections */}
      <div>
        <div className="text-[11px] font-semibold text-zinc-400 mb-2">
          {lang === "en" ? "Add to Page:" : "បន្ថែមផ្នែក ឬ Block ទៅកាន់ទំព័រ:"}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            disabled={list.length >= 30}
            onClick={() => handleAddCustomBlock(CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>+ Cinematic Scroll</span>
          </button>

          <button
            type="button"
            disabled={list.length >= 30}
            onClick={() => handleAddCustomBlock(CMS_BLOCK_TYPES.CUSTOM_IMAGE)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-2.5 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Image" : "+ រូបភាព"}</span>
          </button>

          <button
            type="button"
            disabled={list.length >= 30}
            onClick={() => handleAddCustomBlock(CMS_BLOCK_TYPES.CUSTOM_TEXT)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-2.5 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Type className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === "en" ? "+ Text" : "+ អត្ថបទ"}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              disabled={list.length >= 30}
              onClick={() => setShowSectionPicker(!showSectionPicker)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-2.5 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === "en" ? "+ Section" : "+ ផ្នែកធៀបការ"}</span>
            </button>

            {/* Legacy Section Dropdown Menu */}
            {showSectionPicker && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-zinc-700 bg-zinc-950 p-2 shadow-2xl backdrop-blur-md">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 border-b border-zinc-800">
                  {lang === "en" ? "Available Sections" : "ជ្រើសរើសផ្នែកដែលចង់បន្ថែម"}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                  {(availableLegacySections.length > 0 ? availableLegacySections : DEFAULT_SECTIONS_LIST).map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleAddLegacySection(s.key)}
                      className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-amber-500/20 hover:text-amber-300 transition cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate">{s.label}</span>
                      <Plus className="h-3 w-3 shrink-0 text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40 space-y-2">
          <Layers className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-xs font-medium text-zinc-300">
            {lang === "en"
              ? "No sections on this template yet."
              : "មិនទាន់មាន Section នៅឡើយទេ"}
          </p>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
            {lang === "en"
              ? "Click \"+ Cinematic Scroll\", \"+ Image\", or \"+ Section\" above to design your page."
              : "សូមចុចប៊ូតុង \"+ Cinematic Scroll\", \"+ រូបភាព\", ឬ \"+ ផ្នែកធៀបការ\" ខាងលើដើម្បីរៀបចំទំព័រតាមចិត្ត។"}
          </p>
        </div>
      )}

      {/* Sortable Drag-and-Drop Ordered List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 pt-1">
            {list.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === list.length - 1;
              const isLegacy = item.type === CMS_BLOCK_TYPES.LEGACY_SECTION;

              return (
                <SortableSectionRow key={item.id} id={item.id}>
                  {({ attributes, listeners, isDragging }) => {
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
                          className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-all shadow-sm ${
                            isDragging
                              ? "border-amber-500 bg-zinc-900 shadow-xl"
                              : isEnabled
                              ? "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                              : "border-zinc-800/40 bg-zinc-950/30 opacity-60"
                          }`}
                        >
                          {/* Left: Drag Handle, Toggle eye, Info */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              {...attributes}
                              {...listeners}
                              className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 cursor-grab active:cursor-grabbing p-1 -m-1 touch-none"
                              title={lang === "en" ? "Drag to reorder" : "ចាប់ទាញដើម្បីរៀបលំដាប់"}
                            >
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

                          {/* Right: Jump to tab, Reorder, Delete */}
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
                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer ml-1"
                              title={lang === "en" ? "Delete Section" : "លុបផ្នែកនេះចេញ"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
                        className={`rounded-xl border overflow-hidden transition-all shadow-sm ${
                          isDragging
                            ? "border-amber-500 bg-zinc-900 shadow-xl"
                            : "border-amber-500/30 bg-zinc-950/80"
                        }`}
                      >
                        {/* Custom Block Header */}
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              {...attributes}
                              {...listeners}
                              className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 cursor-grab active:cursor-grabbing p-1 -m-1 touch-none"
                              title={lang === "en" ? "Drag to reorder" : "ចាប់ទាញដើម្បីរៀបលំដាប់"}
                            >
                              <GripVertical className="h-4 w-4" />
                              <span className="text-[11px] font-bold text-amber-400 w-5">
                                #{index + 1}
                              </span>
                            </div>
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
                  }}
                </SortableSectionRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
