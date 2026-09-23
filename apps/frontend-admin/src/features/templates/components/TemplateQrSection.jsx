import React, { useRef } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

export default function TemplateQrSection({
  qrGiftUrl,
  onQrChange,
  onUploadQr,
  lang = "km",
}) {
  const qrFileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadQr) {
      onUploadQr(file);
    }
    e.target.value = "";
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-white mb-3">
        {lang === "en" ? "Digital Gift (QR Code & Bank Info)" : "QR Code ចងដៃ (Digital Gift)"}
      </h3>

      {/* Hidden QR File Input */}
      <input
        type="file"
        ref={qrFileInputRef}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-4">
        {/* QR Image Input & Upload */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-amber-500" />
                <span>
                  {lang === "en"
                    ? "QR Code Image (ABA / Bakong KHQR)"
                    : "រូបភាព QR Code (ABA / Bakong KHQR)"}
                </span>
              </label>
              <p className="text-[10px] text-amber-400/80 font-medium mt-0.5">
                {lang === "en"
                  ? "Recommended: 500x500px (1:1) | Max 5MB"
                  : "ទំហំដែលណែនាំ: 500x500px (1:1) | អតិបរមា 5MB"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => qrFileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{lang === "en" ? "Upload QR Image" : "Upload រូប QR ពីកុំព្យូទ័រ"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* QR Preview Thumbnail */}
            {qrGiftUrl ? (
              <div className="relative group shrink-0">
                <img
                  src={qrGiftUrl}
                  alt="QR Preview"
                  className="h-16 w-16 rounded-xl object-contain bg-white p-1 border border-amber-500/50 shadow-md shadow-amber-500/10"
                  onError={(e) => {
                    e.target.src = "/facebook/all/03-card/cover-card.jpg";
                  }}
                />
                <button
                  type="button"
                  onClick={() => onQrChange && onQrChange("")}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                  title={lang === "en" ? "Clear QR" : "លុបចេញ"}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => qrFileInputRef.current?.click()}
                className="h-16 w-16 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/80 flex flex-col items-center justify-center text-zinc-500 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition cursor-pointer shrink-0"
                title={lang === "en" ? "Upload QR Image" : "Upload រូបភាព QR"}
              >
                <Upload className="h-5 w-5 mb-0.5" />
                <span className="text-[9px] font-bold">
                  {lang === "en" ? "Upload" : "Upload"}
                </span>
              </div>
            )}

            <div className="flex-1">
              <input
                type="text"
                value={qrGiftUrl || ""}
                onChange={(e) => onQrChange && onQrChange(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "https://... or click Upload QR Image"
                    : "https://... ឬចុច Upload ពីកុំព្យូទ័រ"
                }
                className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
