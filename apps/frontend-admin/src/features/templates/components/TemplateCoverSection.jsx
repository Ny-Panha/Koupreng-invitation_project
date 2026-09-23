import React, { useRef } from "react";
import { Upload } from "lucide-react";

export default function TemplateCoverSection({
  coverImage,
  invitationTitle,
  onCoverChange,
  onTitleChange,
  onUploadCover,
  lang = "km",
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadCover) {
      onUploadCover(file);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Invitation Title */}
      <div>
        <label className="text-xs font-semibold text-zinc-300 block mb-1">
          {lang === "en" ? "Invitation Title (Heading)" : "ចំណងជើងធៀបការ (Title Header)"}
        </label>
        <input
          type="text"
          value={invitationTitle || ""}
          onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
          placeholder="សិរីសួស្តី អាពាហ៍ពិពាហ៍"
          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-moul"
        />
      </div>

      {/* Hidden Cover File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Cover Banner Photo */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div>
            <label className="text-xs font-semibold text-zinc-300">
              {lang === "en" ? "Cover Banner Photo (URL / Upload)" : "រូបភាព Cover Banner (URL / Upload)"}
            </label>
            <p className="text-[10px] text-amber-400 font-medium">
              {lang === "en"
                ? "Recommended: 1920x1080px (16:9) or 900x1200px (3:4) | Max 5MB"
                : "ទំហំដែលណែនាំ: 1920x1080px (16:9) ឬ 900x1200px (3:4) | អតិបរមា 5MB"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
          >
            <Upload className="h-3 w-3" />
            <span>{lang === "en" ? "Upload Cover" : "Upload រូប Cover"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {coverImage && (
            <img
              src={coverImage}
              alt="Cover Preview"
              className="h-10 w-16 rounded-lg object-cover border border-zinc-700 shrink-0 bg-zinc-950"
              onError={(e) => {
                e.target.src = "/facebook/all/03-card/cover-card.jpg";
              }}
            />
          )}
          <input
            type="text"
            value={coverImage || ""}
            onChange={(e) => onCoverChange && onCoverChange(e.target.value)}
            placeholder={
              lang === "en"
                ? "https://... or click Upload Cover"
                : "https://... ឬចុច Upload ពីកុំព្យូទ័រ"
            }
            className="h-10 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
}
