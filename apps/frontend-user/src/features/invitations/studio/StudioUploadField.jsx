import { useEffect, useRef, useState } from "react";
import { UploadCloud, RotateCcw, Trash2, AlertCircle } from "lucide-react";
import { useUiCopy } from "@/shared/i18n/useUiCopy";

export default function StudioUploadField({
    label,
    icon: Icon,
    image,
    onUpload,
    onRemove,
    inputRef,
    hint = "PNG, JPG, WebP (ក្រោម 5MB)",
    onRestoreDefault,
    hasDefault = false,
}) {
  const uiCopy = useUiCopy();
    const internalInputRef = useRef(null);
    const activeRef = inputRef || internalInputRef;
    const [imgError, setImgError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const resolvedSrc = typeof image === "string" ? image : (image?.url || image?.preview || image?.src || image?.fileUrl || "");
    const hasImage = Boolean(resolvedSrc && resolvedSrc.trim() && resolvedSrc !== "null" && resolvedSrc !== "undefined");

    useEffect(() => {
        setImgError(false);
    }, [resolvedSrc]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && onUpload) {
            onUpload({ target: { files: [file] } });
        }
    };

    return (
        <div className="pe-form-group">
            <label className="pe-label">
                {Icon && <span className="pe-label-icon"><Icon size={16} /></span>}
                {label}
            </label>
            <div className="pe-clean-upload-card">
                {hasImage && !imgError ? (
                    <>
                        <button type="button"
                            className="pe-clean-preview-box"
                            onClick={() => activeRef.current?.click()}
                            title={uiCopy("ចុចដើម្បីប្តូររូបភាព", "Click to change image")}
                        >
                            <img
                                src={resolvedSrc}
                                alt={label}
                                onError={() => setImgError(true)}
                            />
                            <div className="pe-clean-preview-hover-overlay">
                                <UploadCloud size={20} />
                                <span>{uiCopy("ចុចដើម្បីប្តូររូបភាព", "Click to change image")}</span>
                            </div>
                        </button>
                        <div className="pe-clean-actions-bar">
                            <button
                                type="button"
                                className="pe-btn-upload-action"
                                onClick={() => activeRef.current?.click()}
                            >
                                <UploadCloud size={14} /> {uiCopy("ប្តូររូបភាព", "Change image")}
                            </button>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                {hasDefault && onRestoreDefault && (
                                    <button
                                        type="button"
                                        className="pe-btn-restore-action"
                                        onClick={onRestoreDefault}
                                        title={uiCopy("ប្រើរូបដើមរបស់គំរូ", "Reset to template default")}
                                    >
                                        <RotateCcw size={13} /> {uiCopy("រូបដើម", "Original image")}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="pe-btn-delete-action"
                                    onClick={onRemove}
                                >
                                    <Trash2 size={14} /> {uiCopy("លុប", "Delete")}
                                </button>
                            </div>
                        </div>
                    </>
                ) : hasImage && imgError ? (
                    <div className="pe-clean-error-card">
                        <button type="button"
                            className="pe-clean-error-content"
                            onClick={() => activeRef.current?.click()}
                            title={uiCopy("ចុចដើម្បីជ្រើសរើសរូបភាពថ្មី", "Click to choose a new image")}
                        >
                            <AlertCircle size={24} className="pe-clean-error-icon" />
                            <span className="pe-clean-error-title">{uiCopy("មិនអាចទាញយករូបភាពបានទេ", "Could not load image")}</span>
                            <span className="pe-clean-error-hint">{uiCopy("តំណភ្ជាប់រូបភាពអាចខូច ឬមិនមាន។ សូមចុចទីនេះដើម្បីជ្រើសរើសរូបថ្មី", "The image link may be broken or unavailable. Click to choose a new image.")}</span>
                        </button>
                        <div className="pe-clean-actions-bar" style={{ marginTop: "4px" }}>
                            <button
                                type="button"
                                className="pe-btn-upload-action"
                                onClick={() => activeRef.current?.click()}
                            >
                                <UploadCloud size={14} /> {uiCopy("ជ្រើសរើសរូបភាពថ្មី", "Choose a new image")}
                            </button>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                {hasDefault && onRestoreDefault && (
                                    <button
                                        type="button"
                                        className="pe-btn-restore-action"
                                        onClick={onRestoreDefault}
                                        title={uiCopy("ប្រើរូបដើមរបស់គំរូ", "Use template image")}
                                    >
                                        <RotateCcw size={13} /> {uiCopy("រូបដើម", "Original image")}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="pe-btn-delete-action"
                                    onClick={onRemove}
                                >
                                    <Trash2 size={14} /> {uiCopy("លុបចេញ", "Remove")}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`pe-clean-dropzone ${isDragging ? "pe-clean-dropzone-dragging" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <button type="button" className="studio-upload-browse" onClick={() => activeRef.current?.click()}>
                        <UploadCloud className="pe-clean-dropzone-icon" size={28} />
                        <span className="pe-clean-dropzone-title">{uiCopy("ចុចបញ្ចូលរូបភាព", "Click to upload image")}</span>
                        <span className="pe-clean-dropzone-hint">{hint}</span>
                        </button>
                        {hasDefault && onRestoreDefault && (
                            <button
                                type="button"
                                className="pe-btn-restore-inline"
                                onClick={(e) => { e.stopPropagation(); onRestoreDefault(); }}
                            >
                                <RotateCcw size={12} /> {uiCopy("ប្រើរូបគំរូដើម", "Use template image")}
                            </button>
                        )}
                    </div>
                )}
                <input
                    ref={activeRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: "none" }}
                    onChange={onUpload}
                />
                {resolvedSrc.startsWith('data:') && <p className="studio-field-help" role="status">{uiCopy('រូបត្រៀមរួចនៅលើឧបករណ៍នេះ។ ចុចរក្សាទុក ដើម្បីបញ្ចូលទៅម៉ាស៊ីនមេ។', 'Image ready on this device. Save to upload it to the server.')}</p>}
            </div>
        </div>
    );
}
