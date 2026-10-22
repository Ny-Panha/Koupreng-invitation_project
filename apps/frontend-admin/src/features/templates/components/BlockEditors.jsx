import { useRef } from "react";
import {
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { CMS_BLOCK_TYPES } from "./blockHelpers";

/**
 * ImageUploaderInput — Reusable image input component matching Admin Studio patterns.
 * Supports URL entry + native file upload via FileReader + live thumbnail.
 */
export function ImageUploaderInput({
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

const DYNAMIC_TOKENS = [
  { token: "{{groom_name}}", labelKm: "កូនកំលោះ", labelEn: "Groom" },
  { token: "{{bride_name}}", labelKm: "កូនក្រមុំ", labelEn: "Bride" },
  { token: "{{wedding_date}}", labelKm: "កាលបរិច្ឆេទ", labelEn: "Date" },
  { token: "{{venue_name}}", labelKm: "ទីតាំង", labelEn: "Venue" },
  { token: "{{groom_parents}}", labelKm: "ឪពុកម្តាយប្រុស", labelEn: "Groom Parents" },
  { token: "{{bride_parents}}", labelKm: "ឪពុកម្តាយស្រី", labelEn: "Bride Parents" },
];

/**
 * DynamicTokenChips — Helper buttons for 1-click insertion of wedding placeholders.
 */
export function DynamicTokenChips({ onInsert, lang = "km" }) {
  return (
    <div className="space-y-1 my-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
        <Sparkles className="h-3 w-3" />
        <span>{lang === "en" ? "Dynamic Placeholders (Click to insert):" : "ស្លាកស្វ័យប្រវត្តិ (ចុចដើម្បីបញ្ចូល):"}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DYNAMIC_TOKENS.map((t) => (
          <button
            key={t.token}
            type="button"
            onClick={() => onInsert(t.token)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-mono transition cursor-pointer"
            title={`${t.token} — ${lang === "en" ? t.labelEn : t.labelKm}`}
          >
            <span>+</span>
            <span>{t.token}</span>
            <span className="text-[10px] text-amber-400/70 font-sans font-normal">
              ({lang === "en" ? t.labelEn : t.labelKm})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const ANIMATION_OPTIONS = [
  { id: "fade-up", labelEn: "Fade Up", labelKm: "លេចពីក្រោម (Fade Up)" },
  { id: "fade-in", labelEn: "Fade In", labelKm: "លេចថ្នមៗ (Fade In)" },
  { id: "zoom-in", labelEn: "Zoom In", labelKm: "ពង្រីកចូល (Zoom In)" },
  { id: "slide-up", labelEn: "Slide Up", labelKm: "រុញឡើង (Slide Up)" },
  { id: "none", labelEn: "None", labelKm: "គ្មាន (None)" },
];

/**
 * AnimationSelector — Visual pill selector for block entrance animations.
 */
export function AnimationSelector({ value = "fade-up", onChange, lang = "km" }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-300 block mb-1">
        {lang === "en" ? "Entrance Animation" : "ចលនានៅពេល Scroll (Animation)"}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {ANIMATION_OPTIONS.map((opt) => {
          const isSelected = (value || "fade-up") === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex items-center justify-center px-2 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer text-center ${
                isSelected
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-300 shadow-xs"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <span>{lang === "en" ? opt.labelEn : opt.labelKm}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * CustomImageBlockEditor — Form controls for CUSTOM_IMAGE blocks.
 */
export function CustomImageBlockEditor({ data = {}, onChange, lang = "km" }) {
  const insertTokenIntoCaption = (token) => {
    const current = data.caption || "";
    onChange({ caption: current ? `${current} ${token}` : token });
  };

  return (
    <div className="space-y-3">
      <ImageUploaderInput
        label={lang === "en" ? "Image (URL / Upload) *" : "រូបភាព (URL / Upload) *"}
        value={data.imageUrl}
        onChange={(url) => onChange({ imageUrl: url })}
        lang={lang}
      />

      <div>
        <label className="text-xs font-medium text-zinc-300 block mb-1">
          {lang === "en" ? "Caption (Optional)" : "ចំណងជើងរូបភាព (Caption)"}
        </label>
        <DynamicTokenChips onInsert={insertTokenIntoCaption} lang={lang} />
        <input
          type="text"
          value={data.caption || ""}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder={lang === "en" ? "e.g. {{groom_name}} & {{bride_name}} moment" : "ឧ. រូបថត {{groom_name}} & {{bride_name}} នៅសៀមរាប"}
          className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1">
            {lang === "en" ? "Alt Text (Accessibility)" : "ពិពណ៌នារូបភាព (Alt Text)"}
          </label>
          <input
            type="text"
            value={data.alt || ""}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder={lang === "en" ? "Wedding celebration" : "រូបថតអាពាហ៍ពិពាហ៍"}
            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <AnimationSelector
            value={data.animation || "fade-up"}
            onChange={(anim) => onChange({ animation: anim })}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * CustomTextBlockEditor — Form controls for CUSTOM_TEXT blocks.
 */
export function CustomTextBlockEditor({ data = {}, onChange, lang = "km" }) {
  const insertTokenIntoBody = (token) => {
    const current = data.body || "";
    onChange({ body: current ? `${current} ${token}` : token });
  };

  const insertTokenIntoHeading = (token) => {
    const current = data.heading || "";
    onChange({ heading: current ? `${current} ${token}` : token });
  };

  return (
    <div className="space-y-3.5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-zinc-300 block">
            {lang === "en" ? "Heading" : "ចំណងជើង (Heading)"}
          </label>
        </div>
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder={lang === "en" ? "e.g. Welcome to Our Love Journey" : "ឧ. រឿងរ៉ាវនៃសេចក្ដីស្រឡាញ់"}
          className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-medium"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-zinc-300 block">
            {lang === "en" ? "Body Text" : "ខ្លឹមសារអត្ថបទ (Body)"}
          </label>
        </div>
        <DynamicTokenChips onInsert={insertTokenIntoBody} lang={lang} />
        <textarea
          rows={3}
          value={data.body || ""}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder={lang === "en" ? "Write paragraphs here with {{groom_name}} & {{bride_name}}..." : "សរសេរខ្លឹមសារអត្ថបទនៅទីនេះ អាចប្រើ {{groom_name}} & {{bride_name}}..."}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 outline-none focus:border-amber-500 leading-relaxed font-sans"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1">
            {lang === "en" ? "Text Alignment" : "តម្រឹមអក្សរ (Alignment)"}
          </label>
          <div className="flex items-center gap-1.5">
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
                  onClick={() => onChange({ align: opt.id })}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
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

        <div>
          <AnimationSelector
            value={data.animation || "fade-up"}
            onChange={(anim) => onChange({ animation: anim })}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * ShowcaseBlockEditor — Form controls for HORIZONTAL_SCROLL_SHOWCASE blocks.
 */
export function ShowcaseBlockEditor({ data = {}, onChange, lang = "km" }) {
  const currentCards = Array.isArray(data.cards) ? data.cards : [];

  const handleAddCard = () => {
    if (currentCards.length >= 10) return;
    const newCard = {
      id: `card-${Date.now()}-${currentCards.length + 1}`,
      img: "",
      title: "",
      subtitle: "",
    };
    onChange({ cards: [...currentCards, newCard] });
  };

  const handleUpdateCard = (cardIndex, field, value) => {
    const nextCards = currentCards.map((c, i) =>
      i === cardIndex ? { ...c, [field]: value } : c
    );
    onChange({ cards: nextCards });
  };

  const handleRemoveCard = (cardIndex) => {
    const nextCards = currentCards.filter((_, i) => i !== cardIndex);
    onChange({ cards: nextCards });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1">
            {lang === "en" ? "Section Heading (Optional)" : "ចំណងជើងផ្ទាំង (Section Heading)"}
          </label>
          <input
            type="text"
            value={data.heading || ""}
            onChange={(e) => onChange({ heading: e.target.value })}
            placeholder={lang === "en" ? "e.g. Moments & Milestones" : "ឧ. កម្រងអនុស្សាវរីយ៍"}
            className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <AnimationSelector
            value={data.animation || "fade-up"}
            onChange={(anim) => onChange({ animation: anim })}
            lang={lang}
          />
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300">
            {lang === "en" ? "Showcase Cards" : "កាតរូបភាព (Cards)"} ({currentCards.length}/10)
          </span>
          <button
            type="button"
            disabled={currentCards.length >= 10}
            onClick={handleAddCard}
            className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>{lang === "en" ? "Add Card" : "បន្ថែម Card"}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {currentCards.map((card, cardIndex) => (
            <div
              key={card.id || `card-${cardIndex}`}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400">
                  Card #{cardIndex + 1}
                </span>
                {currentCards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(cardIndex)}
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
                onChange={(url) => handleUpdateCard(cardIndex, "img", url)}
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
                    onChange={(e) => handleUpdateCard(cardIndex, "title", e.target.value)}
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
                    onChange={(e) => handleUpdateCard(cardIndex, "subtitle", e.target.value)}
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
  );
}

/**
 * UniversalBlockEditor — Dispatcher component rendering the appropriate editor for any custom block type.
 */
export function UniversalBlockEditor({ block, onChange, lang = "km" }) {
  if (!block) return null;

  const handleChange = (partialData) => {
    onChange({
      ...block.data,
      ...partialData,
    });
  };

  switch (block.type) {
    case CMS_BLOCK_TYPES.CUSTOM_IMAGE:
      return <CustomImageBlockEditor data={block.data} onChange={handleChange} lang={lang} />;
    case CMS_BLOCK_TYPES.CUSTOM_TEXT:
      return <CustomTextBlockEditor data={block.data} onChange={handleChange} lang={lang} />;
    case CMS_BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE:
      return <ShowcaseBlockEditor data={block.data} onChange={handleChange} lang={lang} />;
    default:
      return null;
  }
}
