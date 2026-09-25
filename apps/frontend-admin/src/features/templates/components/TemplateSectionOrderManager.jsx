import React, { useState } from "react";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const DEFAULT_SECTIONS_LIST = [
  { key: "family", label: "👨‍👩‍👧‍👦 គ្រួសារទាំងសងខាង (Family & Parents)", desc: "បង្ហាញឈ្មោះឪពុកម្តាយ និងកូនកំលោះកូនក្រមុំ", tabTarget: "couple" },
  { key: "invitation", label: "💌 សេចក្តីអញ្ជើញ & រូបថត (Portraits & Blessing)", desc: "រូបថតគូស្នេហ៍ និងសារអញ្ជើញជាផ្លូវការ", tabTarget: "couple" },
  { key: "countdown", label: "⏱️ រាប់ថយក្រោយ (Countdown Timer)", desc: "បង្ហាញនាឡិការាប់ថយក្រោយដល់ថ្ងៃមង្គលការ", tabTarget: "theme" },
  { key: "schedule", label: "📅 កម្មវិធីមង្គលការ (Schedule Timeline)", desc: "បង្ហាញកម្មវិធី និងម៉ោងតាមលំដាប់លំដោយ", tabTarget: "events", subTab: "schedule" },
  { key: "gallery", label: "🖼️ វិចិត្រសាលរូបថត (Photo Gallery)", desc: "បង្ហាញកម្រងរូបថតរៀបអាពាហ៍ពិពាហ៍", tabTarget: "events", subTab: "gallery" },
  { key: "map", label: "📍 ទីតាំង និងផែនទី (Google Map)", desc: "បង្ហាញទីតាំង និងតំណភ្ជាប់ Google Maps", tabTarget: "venue", subTab: "map" },
  { key: "dressCode", label: "👗 ពណ៌សម្លៀកបំពាក់ (Dress Code)", desc: "បង្ហាញ Palette ពណ៌សម្លៀកបំពាក់សម្រាប់ភ្ញៀវ", tabTarget: "venue", subTab: "dress" },
  { key: "party", label: "👥 ក្រុមការងារមង្គល (Wedding Party)", desc: "បង្ហាញមិត្តភក្តិ និងក្រុមអ្នកកំដរ", tabTarget: "couple" },
  { key: "gift", label: "🎁 ចំណងដៃឌីជីថល (Digital Gift QR)", desc: "បង្ហាញ QR Code ធនាគារ ABA/Bakong", tabTarget: "venue", subTab: "qr" },
  { key: "faq", label: "❓ សំណួរដែលសួរញឹកញាប់ (FAQ Accordion)", desc: "សំណួរ-ចម្លើយលម្អិតសម្រាប់ភ្ញៀវកិត្តិយស", tabTarget: "settings" },
  { key: "rsvp", label: "✍️ បញ្ជាក់ការចូលរួម (RSVP Form)", desc: "ទម្រង់បែបបទសម្រាប់ភ្ញៀវចុះឈ្មោះចូលរួម", tabTarget: "settings" },
];

export default function TemplateSectionOrderManager({
  sectionOrder = [],
  enabledSections = {},
  onReorderSections,
  onToggleSection,
  onResetDefault,
  onJumpToTab,
  lang = "km",
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Compute full list ordered by sectionOrder
  const orderedList = React.useMemo(() => {
    const defaultKeys = DEFAULT_SECTIONS_LIST.map((s) => s.key);
    const validOrder = (sectionOrder || []).filter((k) => defaultKeys.includes(k));
    const missing = defaultKeys.filter((k) => !validOrder.includes(k));
    const fullOrderKeys = [...validOrder, ...missing];

    return fullOrderKeys.map((key) => {
      const info = DEFAULT_SECTIONS_LIST.find((s) => s.key === key) || {
        key,
        label: key,
        desc: "",
      };
      const isEnabled = enabledSections?.[key] !== false;
      return { ...info, enabled: isEnabled };
    });
  }, [sectionOrder, enabledSections]);

  const handleMove = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= orderedList.length) return;
    const newKeys = orderedList.map((item) => item.key);
    const [moved] = newKeys.splice(fromIndex, 1);
    newKeys.splice(toIndex, 0, moved);
    if (onReorderSections) {
      onReorderSections(newKeys);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    handleMove(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const enabledCount = orderedList.filter((s) => s.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">
              {lang === "en"
                ? "Section Layout & Order (Drag & Drop)"
                : "រៀបចំលំដាប់លំដោយ & បិទ/បើក Section"}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {enabledCount}/{orderedList.length} {lang === "en" ? "Active" : "បើកបង្ហាញ"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {lang === "en"
              ? "Drag handle or click ▲ ▼ to reorder sections. Toggle eye icon to show/hide."
              : "ចាប់អូសទាញ ឬចុចប៊ូតុង ▲ ▼ ដើម្បីប្តូរលំដាប់លំដោយ។ ចុចលើរូបភ្នែក 👁️ ដើម្បីបើក/បិទ។"}
          </p>
        </div>

        {/* Reset button */}
        {onResetDefault && (
          <button
            type="button"
            onClick={onResetDefault}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 bg-zinc-900/60 transition cursor-pointer"
            title="កំណត់ទៅលំដាប់ដើមវិញ"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{lang === "en" ? "Reset Default" : "លំនាំដើម"}</span>
          </button>
        )}
      </div>

      {/* Sections List */}
      <div className="space-y-2">
        {orderedList.map((sec, idx) => {
          const isDragging = draggedIndex === idx;

          return (
            <div
              key={sec.key}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`group flex items-center gap-2.5 rounded-xl border p-2.5 transition-all ${
                isDragging
                  ? "border-amber-500 bg-amber-500/20 opacity-50 scale-[0.99]"
                  : sec.enabled
                  ? "border-zinc-800/80 bg-zinc-900/80 hover:border-zinc-700"
                  : "border-zinc-900 bg-zinc-950/60 opacity-60 hover:opacity-80"
              }`}
            >
              {/* Drag Handle */}
              <div
                className="cursor-grab active:cursor-grabbing p-1 text-zinc-500 group-hover:text-amber-400 transition"
                title="ចុចចាប់អូសដើម្បីផ្លាស់ប្តូរទីតាំង"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Order Number Badge */}
              <span className="h-6 w-6 rounded-lg bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 flex items-center justify-center shrink-0 border border-white/5">
                {idx + 1}
              </span>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-xs font-bold truncate ${
                      sec.enabled ? "text-zinc-200" : "text-zinc-500 line-through"
                    }`}
                  >
                    {sec.label}
                  </h4>
                  {sec.tabTarget && onJumpToTab && (
                    <button
                      type="button"
                      onClick={() => onJumpToTab(sec.tabTarget, sec.subTab)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5 transition cursor-pointer"
                      title="ចុចទៅកាន់ផ្ទាំងកែប្រែ"
                    >
                      <span>កែប្រែ</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">{sec.desc}</p>
              </div>

              {/* Up / Down Action Controls */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, idx - 1)}
                  className={`p-1 rounded-lg border transition ${
                    idx === 0
                      ? "opacity-20 cursor-not-allowed border-transparent text-zinc-600"
                      : "border-zinc-800 hover:border-amber-500/40 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 cursor-pointer"
                  }`}
                  title="រំកិលឡើងលើ (Move Up)"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === orderedList.length - 1}
                  onClick={() => handleMove(idx, idx + 1)}
                  className={`p-1 rounded-lg border transition ${
                    idx === orderedList.length - 1
                      ? "opacity-20 cursor-not-allowed border-transparent text-zinc-600"
                      : "border-zinc-800 hover:border-amber-500/40 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 cursor-pointer"
                  }`}
                  title="រំកិលចុះក្រោម (Move Down)"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Visibility Eye Switch Toggle */}
              <button
                type="button"
                onClick={() => onToggleSection && onToggleSection(sec.key)}
                className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                  sec.enabled
                    ? "border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                }`}
                title={sec.enabled ? "ចុចដើម្បីលាក់ Section នេះ" : "ចុចដើម្បីបើកបង្ហាញ Section នេះ"}
              >
                {sec.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
