import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Type,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Upload,
  AlertCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import {
  CMS_BLOCK_TYPES,
  addBlock,
  moveBlock,
  removeBlock,
  validateBlocks,
} from "./blockHelpers";

/**
 * ImageUploaderInput — Reusable image input component matching Admin Studio patterns.
 * Supports URL entry + native file upload via FileReader + live thumbnail.
 */
function ImageUploaderInput({
  label,
  value,
  onChange,
  lang = "km",
  placeholder,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(
        lang === "en"
          ? "Image size exceeds 5MB (Max 5MB)"
          : "ទំហំរូបភាពធំជាង 5MB សូមបន្ថយទំហំរូបភាព (អតិបរមា 5MB)"
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-300">{label}</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
        >
          <Upload className="h-3 w-3" />
          <span>{lang === "en" ? "Upload" : "Upload រូប"}</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative h-10 w-12 rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden shrink-0 group">
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        ) : null}
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            (lang === "en" ? "Image URL or click Upload..." : "URL រូបភាព ឬចុច Upload...")
          }
          className="h-9 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 transition"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-zinc-500 hover:text-red-400 p-1 text-xs"
            title={lang === "en" ? "Clear" : "លុបរូប"}
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}

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

  // Card list manager for HORIZONTAL_SCROLL_SHOWCASE
  const handleAddCard = (blockId, currentCards = []) => {
    if (currentCards.length >= 10) return;
    const newCard = {
      id: `card-${Date.now()}-${currentCards.length + 1}`,
      img: "",
      title: "",
      subtitle: "",
    };
    updateBlockData(blockId, {
      cards: [...currentCards, newCard],
    });
  };

  const handleUpdateCard = (blockId, currentCards, cardIndex, field, value) => {
    const nextCards = currentCards.map((c, i) =>
      i === cardIndex ? { ...c, [field]: value } : c
    );
    updateBlockData(blockId, { cards: nextCards });
  };

  const handleRemoveCard = (blockId, currentCards, cardIndex) => {
    const nextCards = currentCards.filter((_, i) => i !== cardIndex);
    updateBlockData(blockId, { cards: nextCards });
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
            const data = block.data || {};

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
                    {/* 1. CUSTOM_IMAGE Settings */}
                    {block.type === CMS_BLOCK_TYPES.CUSTOM_IMAGE && (
                      <div className="space-y-3">
                        <ImageUploaderInput
                          label={lang === "en" ? "Image (URL / Upload) *" : "រូបភាព (URL / Upload) *"}
                          value={data.imageUrl}
                          onChange={(url) => updateBlockData(block.id, { imageUrl: url })}
                          lang={lang}
                        />

                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">
                            {lang === "en" ? "Caption (Optional)" : "ចំណងជើងរូបភាព (Caption)"}
                          </label>
                          <input
                            type="text"
                            value={data.caption || ""}
                            onChange={(e) => updateBlockData(block.id, { caption: e.target.value })}
                            placeholder={lang === "en" ? "e.g. Pre-wedding moment in Siem Reap" : "ឧ. រូបថត Pre-wedding នៅសៀមរាប"}
                            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">
                            {lang === "en" ? "Alt Text (Accessibility)" : "ពិពណ៌នារូបភាព (Alt Text)"}
                          </label>
                          <input
                            type="text"
                            value={data.alt || ""}
                            onChange={(e) => updateBlockData(block.id, { alt: e.target.value })}
                            placeholder={lang === "en" ? "Wedding celebration" : "រូបថតអាពាហ៍ពិពាហ៍"}
                            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. CUSTOM_TEXT Settings */}
                    {block.type === CMS_BLOCK_TYPES.CUSTOM_TEXT && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">
                            {lang === "en" ? "Heading" : "ចំណងជើង (Heading)"}
                          </label>
                          <input
                            type="text"
                            value={data.heading || ""}
                            onChange={(e) => updateBlockData(block.id, { heading: e.target.value })}
                            placeholder={lang === "en" ? "e.g. Welcome to Our Love Journey" : "ឧ. រឿងរ៉ាវនៃសេចក្ដីស្រឡាញ់"}
                            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">
                            {lang === "en" ? "Body Text" : "ខ្លឹមសារអត្ថបទ (Body)"}
                          </label>
                          <textarea
                            rows={3}
                            value={data.body || ""}
                            onChange={(e) => updateBlockData(block.id, { body: e.target.value })}
                            placeholder={lang === "en" ? "Write paragraphs here..." : "សរសេរខ្លឹមសារអត្ថបទនៅទីនេះ..."}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 outline-none focus:border-amber-500 leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">
                            {lang === "en" ? "Text Alignment" : "តម្រឹមអក្សរ (Alignment)"}
                          </label>
                          <div className="flex items-center gap-2">
                            {[
                              { id: "left", label: "Left", icon: AlignLeft },
                              { id: "center", label: "Center", icon: AlignCenter },
                              { id: "right", label: "Right", icon: AlignRight },
                            ].map((opt) => {
                              const Icon = opt.icon;
                              const isSelected = (data.align || "center") === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => updateBlockData(block.id, { align: opt.id })}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                                    isSelected
                                      ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                                  }`}
                                >
                                  <Icon className="h-3 w-3" />
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. HORIZONTAL_SCROLL_SHOWCASE Settings */}
                    {block.type === CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">
                            {lang === "en" ? "Section Heading (Optional)" : "ចំណងជើងផ្ទាំង (Section Heading)"}
                          </label>
                          <input
                            type="text"
                            value={data.heading || ""}
                            onChange={(e) => updateBlockData(block.id, { heading: e.target.value })}
                            placeholder={lang === "en" ? "e.g. Moments & Milestones" : "ឧ. កម្រងអនុស្សាវរីយ៍"}
                            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Cards Sub-manager */}
                        <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-300">
                              {lang === "en" ? "Showcase Cards" : "កាតរូបភាព (Cards)"} (
                              {(data.cards || []).length}/10)
                            </span>
                            <button
                              type="button"
                              disabled={(data.cards || []).length >= 10}
                              onClick={() => handleAddCard(block.id, data.cards || [])}
                              className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{lang === "en" ? "Add Card" : "បន្ថែម Card"}</span>
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {(data.cards || []).map((card, cardIndex) => (
                              <div
                                key={card.id || `card-${cardIndex}`}
                                className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-2 relative"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-400">
                                    Card #{cardIndex + 1}
                                  </span>
                                  {(data.cards || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCard(block.id, data.cards, cardIndex)}
                                      className="text-zinc-500 hover:text-red-400 text-xs p-1"
                                      title={lang === "en" ? "Remove card" : "លុប Card"}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>

                                <ImageUploaderInput
                                  label={lang === "en" ? "Card Image *" : "រូបភាព Card *"}
                                  value={card.img}
                                  onChange={(url) =>
                                    handleUpdateCard(block.id, data.cards, cardIndex, "img", url)
                                  }
                                  lang={lang}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">
                                      {lang === "en" ? "Title (Optional)" : "ចំណងជើង Card"}
                                    </label>
                                    <input
                                      type="text"
                                      value={card.title || ""}
                                      onChange={(e) =>
                                        handleUpdateCard(
                                          block.id,
                                          data.cards,
                                          cardIndex,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      placeholder={lang === "en" ? "e.g. Day 1 at Angkor" : "ឧ. ថ្ងៃដំបូងនៅអង្គរ"}
                                      className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-zinc-400 block mb-0.5">
                                      {lang === "en" ? "Subtitle (Optional)" : "ចំណងជើងរង"}
                                    </label>
                                    <input
                                      type="text"
                                      value={card.subtitle || ""}
                                      onChange={(e) =>
                                        handleUpdateCard(
                                          block.id,
                                          data.cards,
                                          cardIndex,
                                          "subtitle",
                                          e.target.value
                                        )
                                      }
                                      placeholder={lang === "en" ? "e.g. The Proposal" : "ឧ. ការសុំរៀបការ"}
                                      className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
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
