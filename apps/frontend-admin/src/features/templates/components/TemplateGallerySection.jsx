import React, { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  X,
} from "lucide-react";

export default function TemplateGallerySection({
  galleryImages = [],
  newGalleryUrl,
  onNewGalleryUrlChange,
  onAddGalleryImage,
  onUploadGalleryFiles,
  onUpdateImage,
  onRemoveImage,
  onMoveImage,
  lang = "km",
}) {
  const fileInputRef = useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editUrlValue, setEditUrlValue] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length && onUploadGalleryFiles) {
      onUploadGalleryFiles(files);
    }
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length && onUploadGalleryFiles) {
      onUploadGalleryFiles(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const startEditing = (idx, currentUrl) => {
    setEditingIndex(idx);
    setEditUrlValue(currentUrl);
  };

  const saveEditing = (idx) => {
    if (onUpdateImage && editUrlValue.trim()) {
      onUpdateImage(idx, editUrlValue.trim());
    }
    setEditingIndex(null);
    setEditUrlValue("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditUrlValue("");
  };

  // Helper to extract clean filename from URL/path
  const getDisplayFilename = (url) => {
    if (!url) return "";
    try {
      const parts = url.split("/");
      return parts[parts.length - 1] || url;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">
              {lang === "en" ? "Photo Gallery" : "វិចិត្រសាលរូបថត (Photo Gallery)"}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {galleryImages.length} {lang === "en" ? "Photos" : "សន្លឹក"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {lang === "en"
              ? "Pre-wedding photos & memories • Recommended: 1200×900px (4:3) • Max 5MB"
              : "កម្រងរូបថត Pre-wedding និងរូបភាពអនុស្សាវរីយ៍ • ទំហំណែនាំ: 1200×900px (4:3) • អតិបរមា 5MB"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showUrlInput
                ? "bg-zinc-800 text-amber-300 border-amber-500/40"
                : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>{lang === "en" ? "Add Link" : "បញ្ចូលតាម Link"}</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{lang === "en" ? "Upload Photos" : "Upload រូបភាព"}</span>
          </button>
        </div>
      </div>

      {/* Collapsible URL Input Bar */}
      {showUrlInput && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5 flex items-center gap-2 animate-in fade-in">
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
            className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
            autoFocus
          />
          <button
            type="button"
            onClick={onAddGalleryImage}
            className="h-9 px-3.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:brightness-110 transition shrink-0 cursor-pointer"
          >
            {lang === "en" ? "Add" : "បន្ថែម"}
          </button>
        </div>
      )}

      {/* Modern Visual Photos Grid */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-2 rounded-2xl border transition-all ${
          isDraggingOver
            ? "border-amber-500/60 bg-amber-500/10"
            : "border-zinc-800/50 bg-zinc-950/40"
        }`}
      >
        {galleryImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-sm hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/10 transition-all"
          >
            {/* Image Thumbnail */}
            <img
              src={imgUrl}
              alt={`Gallery ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = "/facebook/all/03-card/cover-card.jpg";
              }}
            />

            {/* Top Bar: Index Badge + Controls */}
            <div className="absolute top-2 inset-x-2 flex items-center justify-between z-20 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300 border border-white/10 shadow-sm pointer-events-auto">
                #{idx + 1}
              </span>

              <div className="flex items-center gap-1 pointer-events-auto">
                {/* Reorder: Move Left */}
                {onMoveImage && idx > 0 && (
                  <button
                    type="button"
                    onClick={() => onMoveImage(idx, idx - 1)}
                    className="p-1 rounded-md bg-black/70 hover:bg-amber-500 hover:text-black text-zinc-300 backdrop-blur-md border border-white/10 transition shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer"
                    title={lang === "en" ? "Move earlier" : "ផ្លាស់ទីទៅមុខ"}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                )}

                {/* Reorder: Move Right */}
                {onMoveImage && idx < galleryImages.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onMoveImage(idx, idx + 1)}
                    className="p-1 rounded-md bg-black/70 hover:bg-amber-500 hover:text-black text-zinc-300 backdrop-blur-md border border-white/10 transition shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer"
                    title={lang === "en" ? "Move later" : "ផ្លាស់ទីទៅក្រោយ"}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onRemoveImage && onRemoveImage(idx)}
                  className="p-1 rounded-md bg-black/70 hover:bg-rose-600 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 transition shadow-sm cursor-pointer"
                  title={lang === "en" ? "Delete photo" : "លុបរូបថតនេះ"}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Bottom Caption Bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-4 flex items-center justify-between z-20">
              {editingIndex === idx ? (
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="text"
                    value={editUrlValue}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEditing(idx);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="flex-1 h-6 px-1.5 text-[10px] font-mono text-zinc-100 bg-zinc-900 rounded border border-amber-500 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => saveEditing(idx)}
                    className="p-1 rounded bg-amber-500 text-black hover:brightness-110 cursor-pointer"
                    title="រក្សាទុក"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                    title="បោះបង់"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className="text-[10px] font-mono text-zinc-300 truncate max-w-[80%]"
                    title={imgUrl}
                  >
                    {getDisplayFilename(imgUrl)}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEditing(idx, imgUrl)}
                    className="p-1 rounded text-zinc-400 hover:text-amber-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title={lang === "en" ? "Edit URL" : "កែប្រែ URL"}
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Upload Card at End of Grid */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-800 hover:border-amber-500/60 bg-zinc-950/60 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center gap-1.5 p-3 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-900 group-hover:bg-amber-500/20 text-zinc-400 group-hover:text-amber-400 flex items-center justify-center transition shadow-inner">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-amber-300 transition">
            {lang === "en" ? "Upload Photo" : "Upload រូបថតថ្មី"}
          </span>
          <span className="text-[9px] text-zinc-500">JPG, PNG, WebP</span>
        </button>
      </div>
    </div>
  );
}
