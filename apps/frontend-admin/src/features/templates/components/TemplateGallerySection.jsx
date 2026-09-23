import React, { useRef } from "react";
import { Image as ImageIcon, Plus, Trash2, Upload } from "lucide-react";

export default function TemplateGallerySection({
  galleryImages = [],
  newGalleryUrl,
  onNewGalleryUrlChange,
  onAddGalleryImage,
  onUploadGalleryFiles,
  onUpdateImage,
  onRemoveImage,
  lang = "km",
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length && onUploadGalleryFiles) {
      onUploadGalleryFiles(files);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-amber-500" />
            <span>
              {lang === "en" ? "Photo Gallery" : "វិចិត្រសាលរូបថត (Photo Gallery)"}
            </span>
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {galleryImages.length} {lang === "en" ? "Photos" : "រូបថត"}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-1">
          {lang === "en"
            ? "Pre-wedding photo collection and memories (Enter Image URL)"
            : "កម្រងរូបថត Pre-wedding និងរូបភាពអនុស្សាវរីយ៍ (បញ្ចូល URL រូបភាព)"}
        </p>
        <p className="text-[10px] text-amber-400 font-medium mb-3">
          {lang === "en"
            ? "Recommended: 1200x900px (4:3) | Max 5MB per photo"
            : "ទំហំដែលណែនាំ: 1200x900px (4:3) | អតិបរមា 5MB ក្នុងមួយសន្លឹក"}
        </p>

        {/* Hidden Gallery Files Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Add Image Input Bar */}
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-amber-300">
              {lang === "en"
                ? "🔗 Add Photo by URL or Upload"
                : "🔗 បញ្ចូល URL រូបភាពថ្មី ឬ Upload"}
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer"
            >
              <Upload className="h-3 w-3" />
              <span>{lang === "en" ? "Upload Files" : "Upload រូបពីកុំព្យូទ័រ"}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newGalleryUrl || ""}
              onChange={(e) =>
                onNewGalleryUrlChange && onNewGalleryUrlChange(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddGalleryImage && onAddGalleryImage();
                }
              }}
              placeholder="https://example.com/photo.jpg ឬ /facebook/all/03-card/..."
              className="h-10 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="button"
              onClick={onAddGalleryImage}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{lang === "en" ? "Add Photo" : "បន្ថែមរូបភាព"}</span>
            </button>
          </div>
        </div>

        {/* Gallery Images List */}
        <div className="space-y-3">
          {galleryImages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              {lang === "en"
                ? "No photos added yet. Enter a URL above to add."
                : "មិនទាន់មានរូបថតនៅឡើយទេ។ សូមបញ្ចូល URL ខាងលើដើម្បីបន្ថែម។"}
            </div>
          ) : (
            galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5 transition hover:border-zinc-700"
              >
                <img
                  src={imgUrl}
                  alt={`Gallery ${idx + 1}`}
                  className="h-12 w-12 rounded-lg object-cover border border-zinc-700 shrink-0 bg-zinc-950"
                  onError={(e) => {
                    e.target.src = "/facebook/all/03-card/cover-card.jpg";
                  }}
                />
                <input
                  type="text"
                  value={imgUrl}
                  onChange={(e) => onUpdateImage && onUpdateImage(idx, e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-transparent text-xs text-zinc-100 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage && onRemoveImage(idx)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                  title={lang === "en" ? "Remove" : "លុបចេញ"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
