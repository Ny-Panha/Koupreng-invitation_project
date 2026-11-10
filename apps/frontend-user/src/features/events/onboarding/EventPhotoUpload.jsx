import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Trash2, Upload, AlertCircle, RefreshCw } from "lucide-react";
import "./EventPhotoUpload.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PHOTO_CONFIG = {
  WEDDING: {
    labelKh: "រូបថតគូស្វាមីភរិយា",
    labelEn: "Couple Photo",
    hintKh: "រូបថតគូស្នេហ៍នឹងត្រូវបង្ហាញលើកាតកម្មវិធី ផ្ទាំងគ្រប់គ្រង និងគំរូសំបុត្រអញ្ជើញ",
    hintEn: "This photo will appear on your event card, dashboard cover, and invitation",
  },
  ENGAGEMENT: {
    labelKh: "រូបថតគូដណ្ដឹង",
    labelEn: "Couple Photo",
    hintKh: "រូបថតគូដណ្ដឹងនឹងត្រូវបង្ហាញលើកាតកម្មវិធី ផ្ទាំងគ្រប់គ្រង និងគំរូសំបុត្រអញ្ជើញ",
    hintEn: "This photo will appear on your event card, dashboard cover, and invitation",
  },
  BIRTHDAY: {
    labelKh: "រូបថតម្ចាស់ខួបកំណើត",
    labelEn: "Celebrant Photo",
    hintKh: "រូបថតម្ចាស់ខួបនឹងត្រូវបង្ហាញលើកាតកម្មវិធី ផ្ទាំងគ្រប់គ្រង និងគំរូសំបុត្រអញ្ជើញ",
    hintEn: "This photo will appear on your event card, dashboard cover, and invitation",
  },
  ANNIVERSARY: {
    labelKh: "រូបថតគូស្វាមីភរិយា ឬការប្រារព្ធ",
    labelEn: "Celebration Photo",
    hintKh: "រូបថតនឹងត្រូវបង្ហាញលើកាតកម្មវិធី ផ្ទាំងគ្រប់គ្រង និងគំរូសំបុត្រអញ្ជើញ",
    hintEn: "This photo will appear on your event card, dashboard cover, and invitation",
  },
  CORPORATE: {
    labelKh: "រូបថតស្ថាប័ន ឬកម្មវិធី",
    labelEn: "Event / Organization Photo",
    hintKh: "រូបថតស្ថាប័ន ឬរូបតំណាងកម្មវិធីនឹងត្រូវបង្ហាញលើកាតកម្មវិធី និងផ្ទាំងគ្រប់គ្រង",
    hintEn: "This photo or emblem will appear on your event card and dashboard",
  },
  OTHER: {
    labelKh: "រូបថតគម្របកម្មវិធី",
    labelEn: "Event Cover Photo",
    hintKh: "រូបថតគម្របនឹងត្រូវបង្ហាញលើកាតកម្មវិធី ផ្ទាំងគ្រប់គ្រង និងគំរូសំបុត្រអញ្ជើញ",
    hintEn: "This photo will appear on your event card, dashboard cover, and invitation",
  },
};

export default function EventPhotoUpload({
  previewUrl,
  focalPoint = "center",
  eventType = "WEDDING",
  onFileChange,
  onFocalPointChange,
  onRemove,
  error = "",
  required = true,
  disabled = false,
  en = false,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [internalError, setInternalError] = useState("");

  const config = PHOTO_CONFIG[eventType] || PHOTO_CONFIG.OTHER;
  const label = en ? config.labelEn : config.labelKh;
  const hint = en ? config.hintEn : config.hintKh;
  const activeError = error || internalError;

  const validateAndHandleFile = (candidateFile) => {
    setInternalError("");
    if (!candidateFile) return;

    // Check for HEIC / HEIF
    const nameLower = candidateFile.name?.toLowerCase() || "";
    const typeLower = candidateFile.type?.toLowerCase() || "";
    if (
      typeLower.includes("heic") ||
      typeLower.includes("heif") ||
      nameLower.endsWith(".heic") ||
      nameLower.endsWith(".heif")
    ) {
      setInternalError(
        en
          ? "Please convert your HEIC/HEIF photo to JPG, PNG, or WebP before uploading."
          : "សូមបម្លែងរូបថតរបស់អ្នកជាទម្រង់ JPG, PNG ឬ WebP ជាមុនសិន។"
      );
      return;
    }

    // Check MIME type
    if (!ACCEPTED_TYPES.includes(candidateFile.type)) {
      setInternalError(
        en
          ? "Invalid file format. Please choose a JPG, PNG, or WebP image."
          : "ទម្រង់រូបភាពមិនត្រឹមត្រូវទេ។ សូមជ្រើសរើសរូបភាពជា JPG, PNG ឬ WebP។"
      );
      return;
    }

    // Check file size (max 5 MB)
    if (candidateFile.size > MAX_FILE_SIZE) {
      setInternalError(
        en
          ? "Photo exceeds 5 MB limit. Please select an image under 5 MB."
          : "ទំហំរូបភាពលើសពី 5 MB។ សូមជ្រើសរើសរូបភាពតូចជាង 5 MB។"
      );
      return;
    }

    const objectUrl = URL.createObjectURL(candidateFile);
    onFileChange(candidateFile, objectUrl);
  };

  const handleInputChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) {
      validateAndHandleFile(selected);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      validateAndHandleFile(dropped);
    }
  };

  const handleRemove = () => {
    setInternalError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  const focalPointLabels = {
    top: en ? "Top focus" : "ផ្នែកលើ",
    center: en ? "Center focus" : "កណ្ដាល",
    bottom: en ? "Bottom focus" : "ផ្នែកក្រោម",
  };

  return (
    <div
      className={`event-photo-upload-wrapper ${activeError ? "has-error" : ""}`}
      id="event-photo-upload"
      data-testid="event-photo-upload"
    >
      <div className="event-photo-header">
        <label className="event-photo-label" htmlFor="event-photo-input">
          <Camera size={18} className="event-photo-icon" aria-hidden="true" />
          <span>{label}</span>
          {required && (
            <span className="event-photo-required" aria-label={en ? "Required" : "ត្រូវមាន"}>
              *
            </span>
          )}
        </label>
        <span className="event-photo-badge">
          {required
            ? en
              ? "Required for event card & cover"
              : "ត្រូវមានសម្រាប់កាត & គម្រប"
            : en
            ? "Optional for draft"
            : "មិនបង្ខំសម្រាប់ព្រាង"}
        </span>
      </div>

      <p className="event-photo-hint">{hint}</p>

      {previewUrl ? (
        <div className="event-photo-preview-card">
          <div className="event-photo-preview-media">
            <img
              src={previewUrl}
              alt={en ? "Event photo preview" : "គំរូរូបថតកម្មវិធី"}
              className="event-photo-img"
              style={{ objectPosition: focalPoint }}
            />
            <div className="event-photo-focal-overlay">
              <span className="event-photo-focal-badge">
                {focalPointLabels[focalPoint] || focalPointLabels.center}
              </span>
            </div>
          </div>

          <div className="event-photo-preview-controls">
            <div className="event-photo-focal-selector" role="group" aria-label={en ? "Photo alignment" : "ការតម្រឹមកម្ពស់រូបថត"}>
              <span className="event-photo-focal-title">{en ? "Focal alignment:" : "ចំណុចតម្រង់រូបថត៖"}</span>
              <div className="event-photo-focal-buttons">
                {["top", "center", "bottom"].map((point) => (
                  <button
                    key={point}
                    type="button"
                    className={`event-photo-focal-btn ${focalPoint === point ? "is-active" : ""}`}
                    onClick={() => onFocalPointChange?.(point)}
                    disabled={disabled}
                    aria-pressed={focalPoint === point}
                  >
                    {point === "top" ? (en ? "Top" : "លើ") : point === "bottom" ? (en ? "Bottom" : "ក្រោម") : (en ? "Center" : "កណ្ដាល")}
                  </button>
                ))}
              </div>
            </div>

            <div className="event-photo-actions">
              <button
                type="button"
                className="event-photo-btn replace"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <RefreshCw size={15} aria-hidden="true" />
                <span>{en ? "Change Photo" : "ប្ដូររូបថត"}</span>
              </button>
              <button
                type="button"
                className="event-photo-btn remove"
                onClick={handleRemove}
                disabled={disabled}
              >
                <Trash2 size={15} aria-hidden="true" />
                <span>{en ? "Remove" : "លុបចេញ"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`event-photo-dropzone ${dragOver ? "is-dragover" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label={`${label}. ${hint}. ${en ? "Click or drag and drop to select photo" : "ចុច ឬទម្លាក់រូបភាពដើម្បីជ្រើសរើស"}`}
        >
          <div className="event-photo-dropzone-icon" aria-hidden="true">
            <Upload size={32} />
          </div>
          <div className="event-photo-dropzone-text">
            <strong>{en ? "Click to upload or drag & drop" : "ចុចដើម្បីបញ្ចូលរូបថត ឬទាញទម្លាក់ទីនេះ"}</strong>
            <span>{en ? "JPG, PNG, or WebP up to 5 MB" : "JPG, PNG ឬ WebP ទំហំមិនលើសពី 5 MB"}</span>
          </div>
          <div className="event-photo-dropzone-badge">
            <ImageIcon size={14} aria-hidden="true" />
            <span>{en ? "Appears on event card & invitation" : "បង្ហាញលើកាតកម្មវិធី & គំរូសំបុត្រ"}</span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        id="event-photo-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleInputChange}
        disabled={disabled}
      />

      {activeError && (
        <div className="event-photo-error-message" role="alert">
          <AlertCircle size={15} aria-hidden="true" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
