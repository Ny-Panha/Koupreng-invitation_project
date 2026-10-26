import { WORDING_PRESETS, WORDING_PRESET_LABELS, wordingPresetId, interpolateWording } from './studio/wordingPresets';
import { FamilyDesignEditor, MonogramEditor } from './studio/FamilyDesignEditor';
import IllustratedMapEditor from './studio/IllustratedMapEditor';
import { invitationFeatureFields } from '../templates/shared/invitationFeatures';
import { translationFieldLabel, editLocalizedField, localeContent, projectLocale, translationReadiness } from '../templates/shared/localizedContent';
import { templateCapabilities } from "../templates/registry/templateCapabilities";
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEventWorkspace } from "../events/workspace/EventContext";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import WeddingProgramEditor from "./studio/WeddingProgramEditor";
import SaveTheDateEditor from "./studio/SaveTheDateEditor";
import { eventPresentationFields } from '../templates/shared/eventPresentation';
import { resolveEvent, validTimezone, wallTimeToInstant } from '../templates/shared/eventDateTime';
import { safeJson } from '../wedding-builder/utils/invitationDraftAdapter';
import { legacyProgram, normalizeProgram } from "../templates/shared/program";
import StudioSections from "./studio/StudioSections";
import { useStudioSplit } from './studio/useStudioSplit';
import StudioSplitControls from './studio/StudioSplitControls';
import { STUDIO_SECTION_LABELS, studioTabForSection, resolveStudioSection } from "./studio/studioNavigation";
import PreWeddingVideoEditor from "./studio/PreWeddingVideoEditor";
import StudioToolbar from "./studio/StudioToolbar";
import StudioGuide from "./studio/StudioGuide";
import PublishReview from "./studio/PublishReview";
import { publishReadiness } from "./studio/publishReadiness";
import { createPortal } from "react-dom";
import StudioAppearance from "./studio/StudioAppearance";
import { useStudioPersistence } from "./studio/useStudioPersistence";
import { replaceMediaReferences, uploadInlineReferences } from "./studio/studioMedia";
import "./studio/InvitationStudio.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Music,
    Sparkles,
    Heart,
    Mail,
    Calendar,
    Clock,
    MapPin,
    Images,
    Image as ImageIcon,
    Gift,
    QrCode,
    Globe,
    UploadCloud,
    Trash2,
    Plus,
    Maximize2,
    FileText,
    User,
    Users,
    Map,
    CheckCircle2,
    ExternalLink,
    Zap,
    X,
    Search,
    RotateCcw,
    AlertCircle,
} from "lucide-react";


import { toast } from "../../shared/ui/toast";
import Modal from "@/shared/ui/Modal";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { saveDraft } from "@/shared/storage/weddingStorage";
import { dataUrlToFile, stripInlineMedia } from "./invitationPayloadUtils";
import {
    getTemplateById,
    getTemplatePreset,
    registerDynamicTemplates,
    getCatalogVersion,
    getAllTemplates,
    resolveNumericTemplateId,
} from "../templates/data/templatesData";
import { templateCatalogService } from "../templates/api/templateCatalogApi";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { useAuth } from "@/features/auth/hooks/useAuth";
import LivePhoneSimulator from "./LivePhoneSimulator";
import { DatePicker } from "../../shared/ui/DatePicker";
import { TimePicker } from "../../shared/ui/TimePicker";
import SpotifyMusicPicker from "./components/SpotifyMusicPicker";
import { getLocalizedTemplateFormFlow } from "./config/templateFormFlowConfig";
import { resolveTemplateRenderer } from "../templates/registry/templateRegistry";
import { paymentService } from "../payments/paymentService";
import "./InvitationPlanEssentialEditor.css";

function CleanImageUploadField({
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
                        <div
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
                        </div>
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
                        <div
                            className="pe-clean-error-content"
                            onClick={() => activeRef.current?.click()}
                            title={uiCopy("ចុចដើម្បីជ្រើសរើសរូបភាពថ្មី", "Click to choose a new image")}
                        >
                            <AlertCircle size={24} className="pe-clean-error-icon" />
                            <span className="pe-clean-error-title">{uiCopy("មិនអាចទាញយករូបភាពបានទេ", "Could not load image")}</span>
                            <span className="pe-clean-error-hint">{uiCopy("តំណភ្ជាប់រូបភាពអាចខូច ឬមិនមាន។ សូមចុចទីនេះដើម្បីជ្រើសរើសរូបថ្មី", "The image link may be broken or unavailable. Click to choose a new image.")}</span>
                        </div>
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
                        onClick={() => activeRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <UploadCloud className="pe-clean-dropzone-icon" size={28} />
                        <span className="pe-clean-dropzone-title">{uiCopy("ចុចបញ្ចូលរូបភាព", "Click to upload image")}</span>
                        <span className="pe-clean-dropzone-hint">{hint}</span>
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
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={onUpload}
                />
            </div>
        </div>
    );
}

function CleanGalleryItem({ idx, photo, onUpload, onRemove, onDeleteSlot, canDeleteSlot }) {
  const uiCopy = useUiCopy();
    const inputRef = useRef(null);

    return (
        <div className="pe-gallery-item-card">
            <div className="pe-gallery-item-badge" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <ImageIcon size={14} /> {uiCopy("រូបភាពទី", "Image")} {idx + 1}
                </span>
                {canDeleteSlot && (
                    <button
                        type="button"
                        onClick={onDeleteSlot}
                        title={uiCopy("លុបប្រអប់រូបភាពនេះ", "Remove image slot")}
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "2px",
                            display: "inline-flex",
                            alignItems: "center"
                        }}
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
            {photo?.url ? (
                <>
                    <div className="pe-gallery-thumb-box">
                        <img src={photo.url} alt={`Gallery ${idx + 1}`} />
                    </div>
                    <div className="pe-clean-actions-bar">
                        <button
                            type="button"
                            className="pe-btn-upload-action"
                            style={{ padding: "5px 8px", fontSize: "0.78rem" }}
                            onClick={() => inputRef.current?.click()}
                        >
                            <UploadCloud size={13} /> {uiCopy("ប្តូរ", "Change")}
                        </button>
                        <button
                            type="button"
                            className="pe-btn-delete-action"
                            style={{ padding: "5px 8px", fontSize: "0.78rem" }}
                            onClick={onRemove}
                            title={uiCopy("ដករូបភាពនេះចេញ", "Remove this image")}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </>
            ) : (
                <div
                    className="pe-clean-dropzone"
                    style={{ padding: "16px 8px", minHeight: "120px" }}
                    onClick={() => inputRef.current?.click()}
                >
                    <UploadCloud size={24} style={{ color: "#94a3b8" }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{uiCopy("ដាក់រូបទី", "Add image")} {idx + 1}</span>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onUpload}
            />
        </div>
    );
}

function CleanStoryItem({ idx, item, onChange, onUpload, onRemoveImage, onDelete, canDelete }) {
  const uiCopy = useUiCopy();
    const fileInputRef = useRef(null);

    return (
        <div className="pe-story-item-card" style={{
            background: "#faf8f5",
            border: "1px solid #e8e2d8",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#92400e", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Heart size={14} style={{ color: "#e11d48" }} /> {uiCopy("រឿងរ៉ាវ / ដំណាក់កាលទី", "Story / chapter")} {idx + 1}
                </span>
                {canDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="pe-btn-delete-action"
                        style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                        title={uiCopy("លុបដំណាក់កាលនេះ", "Remove this chapter")}
                    >
                        <Trash2 size={13} /> {uiCopy("លុប", "Delete")}
                    </button>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "12px", alignItems: "start" }}>
                {/* Image upload box */}
                <div>
                    {item.image ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ width: "100%", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e8e2d8", background: "#0f172a" }}>
                                <img src={item.image} alt={item.title || `Story ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="pe-btn-upload-action"
                                    style={{ flex: 1, padding: "4px", fontSize: "0.75rem", justifyContent: "center" }}
                                >
                                    <UploadCloud size={12} /> {uiCopy("ប្តូរ", "Change")}
                                </button>
                                <button
                                    type="button"
                                    onClick={onRemoveImage}
                                    className="pe-btn-delete-action"
                                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                    title={uiCopy("ដករូបភាពចេញ", "Remove image")}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="pe-clean-dropzone"
                            style={{ minHeight: "100px", padding: "10px 6px", cursor: "pointer" }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadCloud size={20} style={{ color: "#94a3b8" }} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{uiCopy("ដាក់រូបភាព", "Add image")}</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={onUpload}
                    />
                </div>

                {/* Form fields: Kicker, Title, Date, Description */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                                {uiCopy("ក្បាលរឿង", "Story kicker")}
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                                value={item.kicker || ""}
                                onChange={(e) => onChange("kicker", e.target.value)}
                                placeholder={uiCopy("រឿងរ៉ាវស្នេហា", "Love story")}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                                {uiCopy("កាលបរិច្ឆេទ", "Date")}
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                                value={item.date || ""}
                                onChange={(e) => onChange("date", e.target.value)}
                                placeholder={uiCopy("28 មករា 2026", "28 January 2026")}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                            {uiCopy("ចំណងជើងរឿងរ៉ាវ", "Story title")}
                        </label>
                        <input
                            type="text"
                            className="pe-input"
                            style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                            value={item.title || ""}
                            onChange={(e) => onChange("title", e.target.value)}
                            placeholder={uiCopy("ដំណើររបស់យើង", "Our journey")}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                            {uiCopy("អត្ថបទរៀបរាប់", "Description")}
                        </label>
                        <textarea
                            className="pe-textarea"
                            style={{ padding: "6px 10px", fontSize: "0.82rem", minHeight: "55px" }}
                            rows="2"
                            value={item.text || ""}
                            onChange={(e) => onChange("text", e.target.value)}
                            placeholder={uiCopy("រៀបរាប់ដំណើរនៃក្ដីស្រឡាញ់របស់អ្នកទាំងពីរ...", "Describe your love story...")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const DEFAULT_INVITATION_TEXT = `សម្តេច ទ្រង់ ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា 
អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញា 
ព្រមទាំងប្រិយមិត្តអញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធិពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍
កូនប្រុសស្រី របស់យើងខ្ញុំទាំងពីរ។`;

function toStandardTime(val) {
    if (!val || typeof val !== "string") return "17:00";
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    let standard = val;
    khmerDigits.forEach((kd, idx) => {
        standard = standard.replaceAll(kd, String(idx));
    });
    const match = standard.match(/(\d{1,2}):(\d{2})/);
    if (match) {
        const hh = match[1].padStart(2, "0");
        const mm = match[2];
        return `${hh}:${mm}`;
    }
    return "17:00";
}

function toStandardDate(val) {
    if (!val || typeof val !== "string") return "";
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    let standard = val;
    khmerDigits.forEach((kd, idx) => {
        standard = standard.replaceAll(kd, String(idx));
    });
    const match = standard.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
    return "";
}

function isGoogleMapsUrl(value) {
    if (!value || !/^https?:\/\//i.test(value.trim())) return false;
    try {
        const url = new URL(value.trim());
        const hostname = url.hostname.toLowerCase();
        return hostname === "maps.google.com"
            || (hostname === "www.google.com" && url.pathname.toLowerCase().startsWith("/maps"))
            || hostname === "maps.app.goo.gl"
            || (hostname === "goo.gl" && url.pathname.toLowerCase().startsWith("/maps"));
    } catch {
        return false;
    }
}

function previewMapUrl(value, venueName = "") {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (isGoogleMapsUrl(trimmed)) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return "";
    const query = [trimmed, venueName].filter(Boolean).join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const DEFAULT_STATE = {
    templateId: "garden-royal-khmer-wedding",
    language: "KH",
    title: "",
    subtitle: "",
    hideCoupleNameOnCover: false,
    eventDateText: "",
    eventDate: "",
    eventTime: "",
    venueName: "",
    venueAddress: "",
    googleMapUrl: "",
    hostName: "",
    partnerName: "",
    groomName: "",
    brideName: "",
    guestName: "",
    messageTitle: "",
    messageText: "",
    schedule: [],
    showSchedule: true,
    eventTimezone: 'Asia/Phnom_Penh',
    // Styling
    openingStyle: "khmer-royal",
    frontColor: "#f9af59",
    bottomColor: "#B08E4F",
    backgroundColor: "#ffffff",
    coverImage: null,
    coverBackgroundImage: null,
    invitationImage: null,
    invitationImage2: null,
    backgroundImage: null,
    showBrandMark: true,
    brandMarkUrl: "",
    sketchMapImage: null,
    // Gallery (5-10 photos)
    photos: Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, url: null })),
    // Countdown
    showCountdown: true,
    // Love Story (ដំណើរនៃក្ដីស្រឡាញ់ - no limit)
    showStory: true,
    storyChapters: [],
    // Dress Code (សម្លៀកបំពាក់)
    showDressCode: true,
    dressCode: null,
    dressColors: [],
    // Family & Wedding Party (គ្រួសារ និង ក្រុមអម)
    groomFather: "",
    groomMother: "",
    brideFather: "",
    brideMother: "",
    showParty: true,
    party: [],
    // Guest Notes & FAQ (សំណួរញឹកញាប់)
    showFaq: true,
    faq: [],
    // Thank you & Apology
    thankYouTitle: "",
    thankYouText: "",
    apologyTitle: "",
    apologyText: "",
    // KHQR
    khqrDollar: { qrUrl: null, bankName: "KHQR Dollar ($)", accountNumber: "" },
    khqrRiel: { qrUrl: null, bankName: "KHQR Riel (៛)", accountNumber: "" },
    // Music
    musicTrackId: "",
    musicUrl: "",
    // Extra
    languageMode: "KH",
    visibility: "PUBLIC",
};

export default function InvitationForm({ invitation }) {
    const workspace = useEventWorkspace();
  const uiCopy = useUiCopy();
    const { text: t, lang: uiLanguage } = useBackendMessages("invitations");
    const englishUI = uiLanguage === "en";
    const { user } = useAuth();
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const invitationId = invitation?.id || params.id;
    const isEdit = Boolean(invitationId);

    // Initial state parser
    const [form, setForm] = useState(() => {
        let customParsed = {};
        if (invitation) {
            try {
                if (invitation.designJson) {
                    const parsed = typeof invitation.designJson === "string" ? JSON.parse(invitation.designJson) : invitation.designJson;
                    customParsed = { ...customParsed, ...parsed };
                }
                if (invitation.contentJson) {
                    const parsed = typeof invitation.contentJson === "string" ? JSON.parse(invitation.contentJson) : invitation.contentJson;
                    customParsed = { ...customParsed, ...parsed };
                }
            } catch {
                // ignore JSON error
            }
        }

        const activeTplId = invitation?.templateCode || invitation?.templateId || customParsed.templateId || searchParams.get("templateId") || DEFAULT_STATE.templateId;
        const canonicalEvent = /^[1-9]\d*$/.test(String(invitation?.id || ""));
        const tpl = getTemplateById(activeTplId);
        const preset = getTemplatePreset(tpl) || {};

        const isDefaultGold = (customParsed.frontColor === "#f9af59" && customParsed.bottomColor === "#B08E4F") ||
            (invitation?.frontColor === "#f9af59" && invitation?.bottomColor === "#B08E4F");
        const isDefaultOpening = (customParsed.openingStyle === "khmer-royal" || invitation?.openingStyle === "khmer-royal");
        const isDefaultCover = !customParsed.coverImage || customParsed.coverImage.includes("/facebook/all/03-card/cover-card.jpg");
        const isDefaultTitle = !customParsed.title || customParsed.title === "សួនរាជហង្សខ្មែរ" || customParsed.title === "Garden Royal Khmer Wedding" || customParsed.title.includes("W01");
        const isDefaultCouple = !customParsed.groomName && !customParsed.brideName;
        const uploadedCover = invitation?.coverUrl || invitation?.media?.coverImage?.fileUrl || "";
        const templateDefaultCover = preset.coverImage || DEFAULT_STATE.coverImage;
        const templateDefaultCoverBg = preset.coverBackgroundImage || tpl?.coverBackgroundImage || DEFAULT_STATE.coverBackgroundImage;
        const templateDefaultBackground = preset.backgroundImage || tpl?.backgroundImage || (String(activeTplId).includes("celestial") ? "/invitations/khmer-celestial/botanical-frame.jpg" : "");
        const uploadedCoverFromDraft = uploadedCover || ((!isDefaultCover && customParsed.coverImage) ? customParsed.coverImage : "");
        const coverBackgroundImage = customParsed.coverBackgroundImage
            || invitation?.coverBackgroundImage
            || invitation?.design?.coverBackgroundImage
            || invitation?.content?.coverBackgroundImage
            || preset.coverBackgroundImage
            || tpl?.coverBackgroundImage
            || templateDefaultCoverBg
            || "";

        const frontColor = (!isDefaultGold && (customParsed.frontColor || invitation?.frontColor)) || tpl?.primaryColor || preset.frontColor || DEFAULT_STATE.frontColor;
        const bottomColor = (!isDefaultGold && (customParsed.bottomColor || invitation?.bottomColor)) || tpl?.secondaryColor || preset.bottomColor || DEFAULT_STATE.bottomColor;
        const backgroundColor = customParsed.backgroundColor || invitation?.backgroundColor || tpl?.backgroundColor || preset.backgroundColor || DEFAULT_STATE.backgroundColor;
        const openingStyle = (!isDefaultOpening && (customParsed.openingStyle || invitation?.openingStyle)) || preset.openingStyle || DEFAULT_STATE.openingStyle;
        const coverImage = uploadedCoverFromDraft || templateDefaultCover;
        const title = canonicalEvent ? (invitation.title || customParsed.title || "") : ((!isDefaultTitle && (invitation?.title || customParsed.title)) ? (invitation?.title || customParsed.title) : (preset.title || DEFAULT_STATE.title));
        const groomName = canonicalEvent ? (invitation.groomName || invitation.hostName || customParsed.groomName || "") : ((!isDefaultCouple && (invitation?.groomName || customParsed.groomName)) ? (invitation?.groomName || customParsed.groomName) : "");
        const brideName = canonicalEvent ? (invitation.brideName || invitation.partnerName || customParsed.brideName || "") : ((!isDefaultCouple && (invitation?.brideName || customParsed.brideName)) ? (invitation?.brideName || customParsed.brideName) : "");
        const venueName = canonicalEvent ? (invitation.venueName || customParsed.venueName || "") : (invitation?.venueName || customParsed.venueName) && (invitation?.venueName !== "The Premier Center Sen Sok" && customParsed.venueName !== "The Premier Center Sen Sok")
            ? (invitation?.venueName || customParsed.venueName)
            : "";
        const contentAddress = customParsed.venueAddress || customParsed.event?.venueAddress || customParsed.venue?.address;
        const venueAddress = canonicalEvent ? (invitation.venueAddress || contentAddress || "") : (invitation?.venueAddress || contentAddress) && (invitation?.venueAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ" && contentAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ")
            ? (invitation?.venueAddress || contentAddress)
            : "";
        const isEmptyDraft = Boolean(
            invitation
            && String(invitation.status || "").toUpperCase() === "DRAFT"
            && !invitation.title
            && !invitation.groomName
            && !invitation.brideName
            && !invitation.eventDate
            && !invitation.storyText
            && !customParsed.title
            && !customParsed.groomName
            && !customParsed.brideName
            && !customParsed.eventDate
        );

        const rawDate = invitation?.eventDate || customParsed.eventDate || DEFAULT_STATE.eventDate;
        const rawTime = invitation?.eventTime ? invitation.eventTime.slice(0, 5) : (customParsed.eventTime || tpl?.receptionTime || DEFAULT_STATE.eventTime);

        return {
            ...DEFAULT_STATE,
            ...customParsed,
            templateId: activeTplId,
            templateCode: tpl?.code || tpl?.slug || "",
            presetId: preset.presetId || tpl?.presetId || invitation?.presetId || "",
            openingStyle,
            frontColor,
            bottomColor,
            backgroundColor,
            title,
            groomName,
            brideName,
            hostName: groomName,
            partnerName: brideName,
            groomFather: customParsed.groomFather ?? "",
            groomMother: customParsed.groomMother ?? "",
            brideFather: customParsed.brideFather ?? "",
            brideMother: customParsed.brideMother ?? "",
            eventDate: toStandardDate(rawDate),
            eventDateText: customParsed.eventDateText || tpl?.dateText || DEFAULT_STATE.eventDateText,
            eventTime: toStandardTime(rawTime),
            venueName,
            venueAddress,
            googleMapUrl: invitation?.googleMapUrl || invitation?.event?.mapLink || customParsed.googleMapUrl || preset.mapQuery || "",
            sketchMapImage: invitation?.sketchMapImage || customParsed.sketchMapImage || DEFAULT_STATE.sketchMapImage || null,
            coverImage,
            uploadedCoverUrl: uploadedCoverFromDraft,
            templateDefaultCover,
            coverBackgroundImage,
            templateDefaultCoverBg,
            templateDefaultBackground,
            backgroundImage: customParsed.backgroundImage || invitation?.backgroundImage || templateDefaultBackground || "",
            messageText: (invitation?.storyText && invitation.storyText !== DEFAULT_INVITATION_TEXT)
                ? invitation.storyText
                : ((customParsed.messageText && customParsed.messageText !== DEFAULT_INVITATION_TEXT)
                    ? customParsed.messageText
                    : (preset.messageText || DEFAULT_STATE.messageText)),
            schedule: Array.isArray(customParsed.schedule)
                ? normalizeProgram(customParsed.schedule)
                : (Array.isArray(customParsed.agendaDays) ? legacyProgram(customParsed.agendaDays) : []),
            dressCode: customParsed.dressCode || preset.dressCode || tpl?.dressCode || {
                name: "ខ្មែរប្រពៃណី / សម័យ",
                description: "សូមជ្រើសរើសសម្លៀកបំពាក់តាមពណ៌ដែលបានកំណត់ ដើម្បីបង្កើនភាពស្រស់ស្អាតនៃពិធី។",
                colors: preset.dressColors?.length ? preset.dressColors : (tpl?.dressColors || []),
            },
            dressColors: Array.isArray(customParsed.dressColors)
                ? customParsed.dressColors
                : (customParsed.dressCode?.colors?.length
                    ? customParsed.dressCode.colors
                    : (preset.dressColors?.length ? preset.dressColors : (tpl?.dressColors || tpl?.dressCode?.colors || []))),
            showDressCode: customParsed.showDressCode !== undefined ? customParsed.showDressCode : (tpl?.enabledSections?.dressCode !== false),
            showCountdown: customParsed.showCountdown !== undefined ? customParsed.showCountdown : (tpl?.enabledSections?.countdown !== false),
            showSchedule: customParsed.showSchedule ?? safeJson(invitation?.enabledSections).schedule ?? true,
            calendarUid: customParsed.calendarUid || crypto.randomUUID(),
            languageMode: invitation?.languageMode || customParsed.languageMode || "KH",
            visibility: invitation?.visibility || "PUBLIC",
            photos: (() => {
                let list = Array.isArray(customParsed.photos)
                    ? [...customParsed.photos]
                    : (preset.photos && preset.photos.length > 0
                        ? preset.photos
                        : (tpl?.galleryImages && tpl.galleryImages.length > 0
                            ? tpl.galleryImages.map((url, i) => ({ id: `p${i + 1}`, url: typeof url === "string" ? url : (url.src || url.url) }))
                            : (tpl?.slideshowImages && tpl.slideshowImages.length > 0
                                ? tpl.slideshowImages.map((url, i) => ({ id: `p${i + 1}`, url: typeof url === "string" ? url : (url.src || url.url) }))
                                : [...DEFAULT_STATE.photos])));
                while (list.length < 5) {
                    list.push({ id: `p${list.length + 1}`, url: "" });
                }
                if (list.length > 10) {
                    list = list.slice(0, 10);
                }
                return list;
            })(),
            showStory: customParsed.showStory !== undefined ? customParsed.showStory : (tpl?.enabledSections?.story !== false),
            storyChapters: Array.isArray(customParsed.storyChapters)
                ? customParsed.storyChapters
                : (preset.storyChapters?.length
                    ? preset.storyChapters
                    : (tpl?.storyChapters?.length
                        ? tpl.storyChapters
                        : (tpl?.storyText ? [{ id: "story-1", kicker: "រឿងរ៉ាវស្នេហា", title: "ដំណើររបស់យើង", date: tpl.dateText || "", text: tpl.storyText, image: tpl.phoneCoverImage || tpl.mainImage || "" }] : []))),
            showParty: customParsed.showParty !== undefined ? customParsed.showParty : (tpl?.enabledSections?.party !== false),
            party: Array.isArray(customParsed.party)
                ? customParsed.party
                : (invitation?.party && invitation.party.length > 0
                    ? invitation.party
                    : (preset.party?.length ? preset.party : (tpl?.party || []))),
            showFaq: customParsed.showFaq !== undefined ? customParsed.showFaq : (tpl?.enabledSections?.faq !== false),
            faq: Array.isArray(customParsed.faq)
                ? customParsed.faq
                : (preset.faq?.length ? preset.faq : (tpl?.faq || [])),
            ...(isEmptyDraft ? {
                title: "",
                subtitle: "",
                eventDateText: "",
                eventDate: "",
                eventTime: "",
                venueName: "",
                venueAddress: "",
                hostName: "",
                partnerName: "",
                groomName: "",
                brideName: "",
                guestName: "",
                messageTitle: "",
                messageText: "",
                coverImage: "",
                coverBackgroundImage: "",
                backgroundImage: "",
                photos: Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, url: "" })),
                storyChapters: [],
                party: [],
            } : {}),
        };
    });

    const initialSection = searchParams.get("section") || searchParams.get("tab") || window.location.hash.slice(1) || "eventInfo";
    const [selectedSection, setSelectedSectionValue] = useState(initialSection);
    const [expandedSections, setExpandedSections] = useState({ [initialSection]: true });
    const setSelectedSection = key => {
        setSelectedSectionValue(key);
        setExpandedSections(current => ({ ...current, [key]: true }));
    };
    const [editorMode, setEditorMode] = useState(searchParams.get("mode") === "guided" ? "guided" : "advanced");
    const [workspaceGrid, workspaceSplit] = useStudioSplit(editorMode);
    const [guideStep, setGuideStep] = useState(0);
    const [publishReviewOpen, setPublishReviewOpen] = useState(false);
    const [publishError, setPublishError] = useState("");
    const [publishedUrl, setPublishedUrl] = useState(invitation?.status === "PUBLISHED" && invitation?.slug ? new URL(`/i/${encodeURIComponent(invitation.slug)}`, window.location.origin).href : "");
    const fieldId = useId();
    const [compactPreview, setCompactPreview] = useState(() => window.matchMedia("(max-width: 1023px)").matches);
    const editorRoot = useRef(null), lastEditorField = useRef(null), previewReturn = useRef(null);
    useEffect(() => {
        const media = window.matchMedia("(max-width: 1023px)");
        const change = event => setCompactPreview(event.matches);
        media.addEventListener("change", change); return () => media.removeEventListener("change", change);
    }, []);

    // Mirrors the module-level catalog counter so the live preview recomputes
    // once the async catalog fetch registers the Admin-created templates.
    const [catalogVersion, setCatalogVersion] = useState(getCatalogVersion());
    const flowConfig = useMemo(() => {
        void catalogVersion;
        const template = getTemplateById(form.templateId);
        const capabilities = templateCapabilities(template || { id: form.templateId });
        const config = getLocalizedTemplateFormFlow(capabilities.appearance ? 'khmer-celestial' : template || form.templateId, uiLanguage);
        config.sectionOrder = config.sectionOrder.filter(key => capabilities[key] !== false && (key !== "story" || !invitation?.eventType || invitation.eventType === "WEDDING"));
        const appearance = capabilities.typography;
        return { ...config, sectionOrder: ["eventInfo", ...config.sectionOrder.flatMap(key => key === "cover" && appearance ? [key, "appearance"] : [key]), "music", "preWeddingVideo"] };
    }, [form.templateId, catalogVersion, invitation?.eventType, uiLanguage]);
    const activeSection = resolveStudioSection(selectedSection, flowConfig.sectionOrder);
    const activeStudioTab = studioTabForSection(activeSection);
    function editPreviewSection(section) {
        if (!flowConfig.sectionOrder.includes(section)) return;
        setSelectedSection(section);
        if (editorMode === 'guided') setGuideStep(1);
        requestAnimationFrame(() => {
            const control = editorRoot.current?.querySelector(`[data-studio-section="${section}"] input, [data-studio-section="${section}"] textarea, [data-studio-section="${section}"] select`);
            if (!control) return;
            // Let the native disclosure lay out before moving focus out of the iframe.
            control.scrollIntoView({ block: 'nearest' });
            window.focus();
            requestAnimationFrame(() => { if (control.isConnected) control.focus({ preventScroll: true }); });
        });
    }
    const [catalogTemplates, setCatalogTemplates] = useState(() => getAllTemplates());
    const [templateSearchQuery, setTemplateSearchQuery] = useState("");
    const [templateCategoryFilter, setTemplateCategoryFilter] = useState("ALL");

    useEffect(() => {
        let active = true;
        templateCatalogService.list()
            .then((items) => {
                if (active && items && items.length > 0) {
                    const activeTemplates = items.filter((item) => String(item.status || "ACTIVE").toUpperCase() === "ACTIVE");
                    registerDynamicTemplates(items);
                    setCatalogTemplates(getAllTemplates().filter(template => activeTemplates.some(item => String(item.id) === String(template.backendId))));
                    setCatalogVersion(getCatalogVersion());
                }
            })
            .catch(() => {
                // Ignore catalog fetch failure
            });
        return () => {
            active = false;
        };
    }, []);

    const displayedTemplates = (catalogTemplates && catalogTemplates.length > 0 ? catalogTemplates : getAllTemplates())
        .filter((tpl) => {
            const query = templateSearchQuery.trim().toLowerCase();
            if (query) {
                const matchName = String(tpl.name || "").toLowerCase().includes(query);
                const matchStyle = String(tpl.style || "").toLowerCase().includes(query);
                const matchCode = String(tpl.code || tpl.id || "").toLowerCase().includes(query);
                if (!matchName && !matchStyle && !matchCode) return false;
            }
            if (templateCategoryFilter === "ADMIN") {
                return Boolean(tpl.backendId || !isNaN(Number(tpl.id)));
            }
            if (templateCategoryFilter === "CURTAIN") {
                return tpl.openingStyle === "curtain" || String(tpl.id || tpl.code).includes("emerald");
            }
            if (templateCategoryFilter === "ENVELOPE") {
                return tpl.openingStyle === "envelope-3d" || String(tpl.id || tpl.code).includes("yes");
            }
            if (templateCategoryFilter === "KHMER") {
                return tpl.openingStyle === "khmer-royal" || String(tpl.id || tpl.code).includes("khmer") || String(tpl.id || tpl.code).includes("garden");
            }
            return true;
        });

    const [wordingPreset, setWordingPreset] = useState("formal");
    const [wordingError, setWordingError] = useState("");
    const [activeLangTab, setActiveLangTab] = useState(() => form.languageMode === "EN" ? "EN" : "KH");
    const authoredForm = projectLocale(form, activeLangTab === "EN" ? "en" : "km");
    const englishReadiness = translationReadiness({ ...form, translationCapabilities: templateCapabilities(getTemplateById(form.templateId) || {}), eventType: invitation?.eventType || "WEDDING" });
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [published, setPublished] = useState(invitation?.status === "PUBLISHED");
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const rememberEditorPosition = () => {
        previewReturn.current = { field: lastEditorField.current, x: window.scrollX, y: window.scrollY,
            containers: [...editorRoot.current.querySelectorAll(".pe-editor-column,.pe-editor-scroll-body")].map(node => ({ node, top: node.scrollTop })) };
    };
    const openPreview = () => {
        if (!previewReturn.current) rememberEditorPosition();
        setIsMobilePreviewOpen(true);
    };
    const closePreview = useCallback(() => {
        setIsMobilePreviewOpen(false);
        requestAnimationFrame(() => {
            const position = previewReturn.current;
            if (!position) return;
            if (position.field?.isConnected) position.field.focus({ preventScroll: true });
            for (const { node, top } of position.containers) if (node.isConnected) node.scrollTo({ top, behavior: 'instant' });
            window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
        });
    }, []);
    const [pendingCoverFile, setPendingCoverFile] = useState(null);
    const [pendingCoverBgFile, setPendingCoverBgFile] = useState(null);
    const [pendingBackgroundFile, setPendingBackgroundFile] = useState(null);
    const [pendingInvitationFile, setPendingInvitationFile] = useState(null);
    const [pendingInvitation2File, setPendingInvitation2File] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [venueAddressError, setVenueAddressError] = useState("");
    const venueAddressInput = useRef(null);
    useEffect(() => {
        if (venueAddressError && activeSection === "venue") venueAddressInput.current?.focus();
    }, [venueAddressError, activeSection]);
    const [isLocating, setIsLocating] = useState(false);
    const serverRevision = useRef(invitation?.updatedAt || null);
    const savedBackendId = useRef(invitation?.backendInvitationId || (/^[1-9]\d*$/.test(String(invitationId)) ? invitationId : null));

    const handleChangeTemplate = async (template) => {
        if (!template) return;
        if (!resolveTemplateRenderer(template).available) {
            toast(englishUI ? "This template's renderer is unavailable. Your current design is preserved." : "គំរូនេះមិនអាចបើកបានទេ។ គំរូបច្ចុប្បន្នត្រូវបានរក្សាទុក។", "error");
            return;
        }
        if (template.supportedEventTypes?.length && !template.supportedEventTypes.includes(invitation?.eventType || "WEDDING")) {
            toast(englishUI ? "This template does not support your event type." : "គំរូនេះមិនគាំទ្រប្រភេទកម្មវិធីនេះទេ។", "error");
            return;
        }
        if (template.premium || template.isPremium || Number(template.price) > 0) {
            try {
                const access = await paymentService.templateAccess(resolveNumericTemplateId(template.code || template.id));
                if (!access?.hasAccess) throw new Error("Premium template access is required");
            } catch {
                toast(englishUI ? "Premium access is required. Review your template access in Packages before switching." : "ត្រូវការសិទ្ធិប្រើគំរូបុព្វលាភ។ សូមពិនិត្យសិទ្ធិរបស់អ្នកមុនប្ដូរ។", "error");
                return;
            }
        }
        if (!window.confirm(englishUI
            ? "Change invitation template? Your event details and uploaded images will stay. Template-specific appearance and optional sections may change; unsupported customizations remain saved for recovery."
            : "ប្ដូរគំរូធៀប? ព័ត៌មានកម្មវិធី និងរូបភាពផ្ទាល់ខ្លួនត្រូវបានរក្សា។ រចនាបថ និងផ្នែកពិសេសមួយចំនួនអាចផ្លាស់ប្ដូរ។")) return;
        const preset = getTemplatePreset(template) || {};
        const uploadedCoverUrl = form.uploadedCoverUrl || "";

        const nextForm = {
            ...form,
            templateId: template.code || template.slug || template.id || form.templateId,
            templateCode: template.code || template.slug || "",
            presetId: preset.presetId || template.presetId || "",
            templateDefaultCover: preset.coverImage || template.phoneCoverImage || template.mainImage || "",
            templateDefaultCoverBg: preset.coverBackgroundImage || template.coverBackgroundImage || "",
            templateDefaultBackground: preset.backgroundImage || template.backgroundImage || (String(template.id || template.slug).includes("celestial") ? "/invitations/khmer-celestial/botanical-frame.jpg" : ""),
            theme: template.theme || preset.theme || template.presetId || form.theme || "",
            fontFamily: template.fontFamily || preset.fontFamily || form.fontFamily || "",
            layoutStyles: template.layoutStyles || preset.layoutStyles || form.layoutStyles || {},
            openingStyle: preset.openingStyle || template.openingStyle || form.openingStyle || "khmer-royal",
            frontColor: template.primaryColor || preset.frontColor || template.frontColor || form.frontColor,
            bottomColor: template.secondaryColor || preset.bottomColor || template.bottomColor || form.bottomColor,
            backgroundColor: template.backgroundColor || preset.backgroundColor || template.bgColor || form.backgroundColor,
            title: form.title,
            groomName: form.groomName || "",
            brideName: form.brideName || "",
            groomFather: form.groomFather,
            groomMother: form.groomMother,
            brideFather: form.brideFather,
            brideMother: form.brideMother,
            eventDate: form.eventDate,
            eventTime: form.eventTime,
            venueName: form.venueName || "",
            venueAddress: form.venueAddress || "",
            schedule: form.schedule,
                programDays: form.programDays || [],
            dressCode: form.dressCode,
            dressColors: form.dressColors,
            // Sync ALL section toggles from template.enabledSections so the form
            // adapts its visible sections when the user switches templates.
            showDressCode: template.enabledSections?.dressCode !== undefined
                ? (template.enabledSections.dressCode !== false)
                : form.showDressCode,
            showCountdown: form.showCountdown,
            showStory: form.showStory,
            showParty: template.enabledSections?.party !== undefined
                ? (template.enabledSections.party !== false)
                : form.showParty,
            showFaq: template.enabledSections?.faq !== undefined
                ? (template.enabledSections.faq !== false)
                : form.showFaq,
            storyChapters: form.storyChapters,
            party: form.party,
            faq: form.faq,
        };
        nextForm.hostName = nextForm.groomName;
        nextForm.partnerName = nextForm.brideName;
        nextForm.uploadedCoverUrl = uploadedCoverUrl;
        nextForm.coverImage = uploadedCoverUrl || nextForm.templateDefaultCover;
        setForm(nextForm);
        setCatalogVersion(getCatalogVersion());

        // The studio writer persists the full template selection with the other changes.
        setIsTemplateModalOpen(false);
    };

    // File input refs
    const coverInputRef = useRef(null);
    const coverBgInputRef = useRef(null);
    const bgFrameInputRef = useRef(null);
    const bgInputRef = useRef(null);
    const sketchInputRef = useRef(null);
    const qrDollarInputRef = useRef(null);
    const qrRielInputRef = useRef(null);

    const update = (field, value) => {
        if (field === "venueAddress" && String(value).trim()) setVenueAddressError("");
        setForm(prev => editLocalizedField(prev, activeLangTab === "EN" ? "en" : "km", field, value));
    };
    const moveItem = (field, index, direction) => {
        const items = [...(form[field] || [])];
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        [items[index], items[target]] = [items[target], items[index]];
        update(field, items);
    };

    const handleFileUpload = (e, callback) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
            toast(uiCopy("សូមជ្រើសរូប JPEG, PNG ឬ WebP ក្រោម 5 MB។", "Choose JPEG, PNG or WebP images under 5 MB."), "warning");
            return;
        }

        if (file.type?.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const maxDim = 1200;
                    let { width, height } = img;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    const isPng = file.type === "image/png";
                    const format = isPng ? "image/png" : "image/jpeg";
                    const quality = isPng ? undefined : 0.88;
                    const compressedDataUrl = canvas.toDataURL(format, quality);
                    callback(compressedDataUrl, file);
                };
                img.onerror = () => callback(event.target.result, file);
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                callback(event.target.result, file);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = "";
    };

    const updatePhoto = (index, url) => {
        const nextPhotos = [...(form.photos || [])];
        if (!nextPhotos[index]) {
            nextPhotos[index] = { id: `p${index + 1}`, url: "" };
        }
        nextPhotos[index] = { ...nextPhotos[index], url };
        update("photos", nextPhotos);
    };

    const addPhotoSlot = () => {
        const current = form.photos || [];
        if (current.length >= 10) {
            toast(uiCopy("អាចបន្ថែមបានអតិបរមាត្រឹម 10 រូបប៉ុណ្ណោះ", "You can add up to 10 photos."));
            return;
        }
        const nextPhotos = [
            ...current,
            { id: `p${current.length + 1}`, url: "" },
        ];
        update("photos", nextPhotos);
    };

    const removePhotoSlot = (index) => {
        const current = form.photos || [];
        if (current.length <= 5) {
            updatePhoto(index, "");
            return;
        }
        const nextPhotos = current.filter((_, i) => i !== index);
        update("photos", nextPhotos);
    };

    const handleBatchGalleryUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        if (files.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
            toast(uiCopy("សូមជ្រើសរូប JPEG, PNG ឬ WebP ក្រោម 5 MB។", "Choose JPEG, PNG or WebP images under 5 MB."), "warning"); return;
        }

        const selectedFiles = files.slice(0, 10);
        const readers = selectedFiles.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then((dataUrls) => {
            const current = form.photos || [];
            let nextPhotos = dataUrls.map((url, i) => ({
                id: current[i]?.id || `p${i + 1}`,
                url,
            }));
            while (nextPhotos.length < 5) {
                nextPhotos.push({ id: `p${nextPhotos.length + 1}`, url: "" });
            }
            update("photos", nextPhotos);
            toast(uiCopy(`បានបញ្ចូល ${dataUrls.length} រូបក្នុងវិចិត្រសាល!`, `Added ${dataUrls.length} photos to the gallery.`));
        });
        e.target.value = "";
    };

    // Story Chapters modifiers (No limit)
    const handleStoryChange = (index, key, value) => {
        const nextStories = [...(form.storyChapters || [])];
        nextStories[index] = { ...nextStories[index], [key]: value };
        update("storyChapters", nextStories);
    };

    const handleStoryImageUpload = (index, e) => {
        handleFileUpload(e, (url) => {
            handleStoryChange(index, "image", url);
        });
    };

    const addStoryItem = () => {
        update("showStory", true);
        const nextStories = [
            ...(form.storyChapters || []),
            {
                id: String(Date.now()),
                image: "",
                kicker: "រឿងរ៉ាវស្នេហា",
                title: "ដំណើររបស់យើង",
                date: form.eventDateText || "",
                text: "",
            },
        ];
        update("storyChapters", nextStories);
    };

    const removeStoryItem = (index) => {
        const nextStories = (form.storyChapters || []).filter((_, i) => i !== index);
        update("storyChapters", nextStories);
    };

    // Dress Code modifiers
    const handleDressCodeFieldChange = (key, value) => {
        const nextDressCode = { ...(form.dressCode || {}), [key]: value };
        update("dressCode", nextDressCode);
    };

    const handleDressColorChange = (index, key, value) => {
        const nextColors = [...(form.dressColors || [])];
        const currentItem = nextColors[index];
        const normalized = typeof currentItem === "string" ? { hex: currentItem, name: "" } : { ...(currentItem || {}) };
        nextColors[index] = { ...normalized, [key]: value };
        update("dressColors", nextColors);
        update("dressCode", { ...(form.dressCode || {}), colors: nextColors });
    };

    const addDressColor = () => {
        const nextColors = [
            ...(form.dressColors || []),
            { hex: "#B88A3A", name: "មាស" },
        ];
        update("dressColors", nextColors);
        update("dressCode", { ...(form.dressCode || {}), colors: nextColors });
    };

    const removeDressColor = (index) => {
        const nextColors = (form.dressColors || []).filter((_, i) => i !== index);
        update("dressColors", nextColors);
        update("dressCode", { ...(form.dressCode || {}), colors: nextColors });
    };

    // Wedding Party modifiers
    const handlePartyChange = (index, key, value) => {
        const nextParty = [...(form.party || [])];
        nextParty[index] = { ...nextParty[index], [key]: value };
        update("party", nextParty);
    };

    const handlePartyImageUpload = (index, e) => {
        handleFileUpload(e, (url) => {
            handlePartyChange(index, "image", url);
        });
    };

    const addPartyMember = () => {
        const nextParty = [
            ...(form.party || []),
            {
                id: String(Date.now()),
                role: "កូនកំលោះកិត្តិយស",
                roleEn: "Best Man",
                name: "ឈ្មោះសមាជិក",
                image: "",
            },
        ];
        update("party", nextParty);
    };

    const removePartyMember = (index) => {
        const nextParty = (form.party || []).filter((_, i) => i !== index);
        update("party", nextParty);
    };

    // FAQ modifiers
    const handleFaqChange = (index, key, value) => {
        const nextFaq = [...(form.faq || [])];
        nextFaq[index] = { ...nextFaq[index], [key]: value };
        update("faq", nextFaq);
    };

    const addFaqItem = () => {
        const nextFaq = [
            ...(form.faq || []),
            {
                id: `faq-${Date.now()}`,
                q: "សំណួរថ្មី?",
                a: "ចម្លើយសម្រាប់ភ្ញៀវ...",
            },
        ];
        update("faq", nextFaq);
    };

    const removeFaqItem = (index) => {
        const nextFaq = (form.faq || []).filter((_, i) => i !== index);
        update("faq", nextFaq);
    };

    const handleGenerateMapLink = () => {
        const query = (form.googleMapUrl || form.venueName || "").trim();
        if (!query) {
            toast(t("enterVenueFirst") || "សូមបញ្ចូលឈ្មោះទីតាំងជាមុនសិន!");
            return;
        }
        const generatedUrl = /^https?:\/\//i.test(query)
            ? query
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        update("googleMapUrl", generatedUrl);
        setLocationError("");
        toast(t("mapLinkGenerated") || "បានបង្កើត Link Google Maps ដោយជោគជ័យ!");
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(uiCopy("ឧបករណ៍នេះមិនគាំទ្រការកំណត់ទីតាំងទេ។ សូមបិទភ្ជាប់តំណផែនទី។", "This device does not support geolocation. Paste a Google Maps link."));
            return;
        }
        setIsLocating(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                update("googleMapUrl", `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`);
                setIsLocating(false);
                toast(uiCopy("បានយកទីតាំងបច្ចុប្បន្នរួចរាល់!", "Current location found."));
            },
            (error) => {
                setIsLocating(false);
                setLocationError(error.code === error.PERMISSION_DENIED
                    ? uiCopy("សូមអនុញ្ញាតការកំណត់ទីតាំងក្នុងកម្មវិធីរុករក ដើម្បីប្រើមុខងារនេះ។", "Allow location access in your browser to use this feature.")
                    : uiCopy("មិនអាចយកទីតាំងបានទេ។ សូមពិនិត្យការកំណត់ទីតាំង ឬបិទភ្ជាប់តំណផែនទី។", "Could not find your location. Check location services or paste a Google Maps link."));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    };

    const handleSearchMap = () => {
        const query = (form.googleMapUrl || form.venueName || "").trim();
        const searchUrl = query
            ? (/^https?:\/\//i.test(query)
                ? query
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`)
            : "https://www.google.com/maps";
        window.open(searchUrl, "_blank", "noopener,noreferrer");
    };
    // Save action
    const handleSave = async ({ redirectToPreview = false, stayInStudio = false, quiet = false } = {}) => {
        const event = resolveEvent(form);
        const end = form.eventEndTime ? wallTimeToInstant(form.eventEndDate || event.date, form.eventEndTime, event.timezone) : null;
        if (!validTimezone(event.timezone) || (event.validDate && event.time && event.instant === null) || (form.eventEndTime && (end === null || event.instant === null || end <= event.instant))) {
            toast(uiCopy('សូមពិនិត្យតំបន់ម៉ោង និងម៉ោងបញ្ចប់កម្មវិធី។', 'Check the event timezone and end time before saving.'), 'warning');
            setSelectedSection('countdown');
            return;
        }
        if (!redirectToPreview && /^https?:\/\//i.test(form.googleMapUrl || "") && !isGoogleMapsUrl(form.googleMapUrl)) {
            setLocationError(uiCopy("សូមបញ្ចូលតំណ Google Maps ត្រឹមត្រូវ។", "Enter a valid Google Maps link."));
            setSelectedSection("venue");
            return;
        }

        const activeTpl = getTemplateById(form.templateId);
        const activePreset = getTemplatePreset(activeTpl) || {};
        const finalGroom = String(form.groomName || "").trim();
        const finalBride = String(form.brideName || "").trim();
        const finalDate = String(form.eventDate || "").trim();
        const finalTitle = String(form.title || "").trim() || activePreset.title || activeTpl?.name || "សិរីមង្គលអាពាហ៍ពិពាហ៍";
        const finalTime = String(form.eventTime || "").trim();
        const finalVenueName = String(form.venueName || "").trim();
        const finalVenueAddress = String(form.venueAddress || "").trim();

        if (finalTitle && !form.title) {
            setForm((prev) => ({
                ...prev,
                title: finalTitle,
            }));
        }

        setIsSaving(true);
        try {
            let savedPhotos = form.photos || [];
            const designPayload = {
                studioStyle: form.studioStyle,
                fontKhmer: form.fontKhmer,
                fontLatin: form.fontLatin,
                elementFonts: form.elementFonts,
                backgroundColor: form.backgroundColor,
                sectionOrder: form.sectionOrder,
                templateId: form.templateId,
                presetId: form.presetId || "",
                theme: form.theme || "",
                fontFamily: form.fontFamily || "",
                layoutStyles: form.layoutStyles || {},
                openingStyle: form.openingStyle || activePreset.openingStyle || "khmer-royal",
                frontColor: form.frontColor || activePreset.frontColor || "#f9af59",
                bottomColor: form.bottomColor || activePreset.bottomColor || "#B08E4F",
                coverImage: form.uploadedCoverUrl || form.coverImage || null,
                coverBackgroundImage: form.coverBackgroundImage || null,
                invitationImage: form.uploadedInvitationUrl || form.invitationImage || null,
                invitationImage2: form.invitationImage2 || null,
                backgroundImage: form.backgroundImage,
                sketchMapImage: form.sketchMapImage,
                photos: form.photos,
                groomFather: form.groomFather || "",
                groomMother: form.groomMother || "",
                brideFather: form.brideFather || "",
                brideMother: form.brideMother || "",
                showCountdown: form.showCountdown !== false,
                showStory: form.showStory !== false,
                storyChapters: form.storyChapters || [],
                showDressCode: form.showDressCode !== false,
                dressCode: form.dressCode || (form.dressColors?.length ? { colors: form.dressColors } : null),
                dressColors: form.dressColors || [],
                showParty: form.showParty !== false,
                party: form.party || [],
                showFaq: form.showFaq !== false,
                faq: form.faq || [],
                khqrDollar: form.khqrDollar,
                khqrRiel: form.khqrRiel,
                musicTrackId: form.musicTrackId,
                musicUrl: form.musicUrl,
                showBrandMark: form.showBrandMark !== false,
                brandMarkUrl: form.brandMarkUrl || "",
            };

            const contentPayload = {
                ...invitationFeatureFields(form),
                ...(form.localizedContentV1 ? { localizedContentV1: localeContent(form) } : {}),
                ...safeJson(invitation?.contentJson),
                ...eventPresentationFields(form),
                ...invitationFeatureFields(form),
                ...(form.preWeddingVideo ? { preWeddingVideo: form.preWeddingVideo } : {}),
                eventDate: finalDate,
                eventTime: finalTime,
                studioStyle: form.studioStyle,
                fontKhmer: form.fontKhmer,
                fontLatin: form.fontLatin,
                elementFonts: form.elementFonts,
                backgroundColor: form.backgroundColor,
                sectionOrder: form.sectionOrder,
                templateId: form.templateId,
                presetId: form.presetId || "",
                theme: form.theme || "",
                fontFamily: form.fontFamily || "",
                layoutStyles: form.layoutStyles || {},
                title: finalTitle,
                subtitle: form.subtitle || "សូមគោរពអញ្ជើញ",
                coverImage: form.uploadedCoverUrl || form.coverImage || null,
                coverBackgroundImage: form.coverBackgroundImage || null,
                backgroundImage: form.backgroundImage || null,
                invitationImage: form.uploadedInvitationUrl || form.invitationImage || null,
                invitationImage2: form.invitationImage2 || null,
                hideCoupleNameOnCover: form.hideCoupleNameOnCover,
                showBrandMark: form.showBrandMark !== false,
                brandMarkUrl: form.brandMarkUrl || "",
                eventDateText: form.eventDateText || finalDate,
                guestName: form.guestName,
                groomName: finalGroom,
                brideName: finalBride,
                groomFather: form.groomFather || "",
                groomMother: form.groomMother || "",
                brideFather: form.brideFather || "",
                brideMother: form.brideMother || "",
                venueName: finalVenueName,
                venueAddress: finalVenueAddress,
                messageTitle: form.messageTitle,
                messageText: form.messageText,
                schedule: form.schedule,
                programDays: form.programDays || [],
                showCountdown: form.showCountdown !== false,
                showStory: form.showStory !== false,
                storyChapters: form.storyChapters || [],
                showDressCode: form.showDressCode !== false,
                dressCode: form.dressCode || (form.dressColors?.length ? { colors: form.dressColors } : null),
                dressColors: form.dressColors || [],
                showParty: form.showParty !== false,
                party: form.party || [],
                showFaq: form.showFaq !== false,
                faq: form.faq || [],
                gallery: savedPhotos
                    .filter((photo) => photo?.url)
                    .map(({ id, url }) => ({ id, preview: url, type: "image" })),
                khqrDollar: form.khqrDollar,
                khqrRiel: form.khqrRiel,
                thankYouTitle: form.thankYouTitle,
                thankYouText: form.thankYouText,
                apologyTitle: form.apologyTitle,
                apologyText: form.apologyText,
            };

            const payload = {
                expectedUpdatedAt: serverRevision.current,
                title: finalTitle,
                eventType: invitation?.eventType || "WEDDING",
                eventDate: finalDate || null,
                eventTime: finalTime || null,
                venueName: finalVenueName || "",
                venueAddress: finalVenueAddress || "",
                googleMapUrl: form.googleMapUrl || "",
                hostName: finalGroom || "",
                partnerName: finalBride || "",
                groomName: finalGroom || "",
                brideName: finalBride || "",
                storyText: form.messageText || "",
                languageMode: form.languageMode || "KH",
                visibility: form.visibility || "PUBLIC",
                rsvpDeadline: invitation?.rsvpDeadline || null,
                templateId: resolveNumericTemplateId(form.templateId),
                designJson: JSON.stringify(stripInlineMedia(designPayload)),
                contentJson: JSON.stringify(stripInlineMedia(contentPayload)),
                enabledSections: JSON.stringify({
                    countdown: form.showCountdown !== false,
                    story: form.showStory !== false && templateCapabilities(getTemplateById(form.templateId) || {}).story !== false,
                    party: form.showParty !== false && templateCapabilities(getTemplateById(form.templateId) || {}).party !== false,
                    dressCode: form.showDressCode !== false && templateCapabilities(getTemplateById(form.templateId) || {}).dressCode !== false,
                    faq: form.showFaq !== false && templateCapabilities(getTemplateById(form.templateId) || {}).faq !== false,
                    schedule: form.showSchedule !== false && templateCapabilities(getTemplateById(form.templateId) || {}).schedule !== false,
                    map: true,
                    gallery: true,
                    gift: Boolean(form.khqrDollar?.qrUrl || form.khqrRiel?.qrUrl),
                    rsvp: true,
                    music: Boolean(form.musicUrl),
                }),
                customColors: JSON.stringify({ front: form.frontColor || activePreset.frontColor, bottom: form.bottomColor || activePreset.bottomColor }),
            };

            let saved;
            let apiSyncFailed = false;
            let apiSyncError = "";
            let apiSyncStatus;
            const effectiveBackendId = savedBackendId.current;
            try {
                if (!payload.templateId) throw new Error(uiCopy("គំរូដែលបានជ្រើសមិនមានក្នុងបណ្ណាល័យទេ។ សូមជ្រើសគំរូដែលអាចប្រើបាន មុនពេលរក្សាទុកលើម៉ាស៊ីនមេ។", "The selected template is unavailable in the catalog. Choose an available template before saving online."));
                if (effectiveBackendId) {
                    saved = await invitationService.update(effectiveBackendId, payload, { suppressAuthRedirect: true });
                } else {
                    saved = await invitationService.create(payload);
                }
                if (saved?.id) savedBackendId.current = saved.id;
                if (saved?.updatedAt) serverRevision.current = saved.updatedAt;
            } catch (apiErr) {
                apiSyncFailed = true;
                apiSyncError = apiErr?.message || "The server could not save these changes. Retry saving.";
                apiSyncStatus = apiErr?.status || apiErr?.response?.status;
                if ([401, 409].includes(apiSyncStatus)) return { synced: false, status: apiSyncStatus, error: apiSyncError };
            }

            let savedCoverUrl = form.uploadedCoverUrl || "";
            let savedInvitationUrl = form.uploadedInvitationUrl || "";
            let savedInvitationUrl2 = "";
            let mediaSyncError = "";
            const backendId = saved?.id || (isEdit && !isNaN(Number(invitationId)) ? invitationId : (invitation?.backendInvitationId || null));
            const coverFile = pendingCoverFile || dataUrlToFile(form.coverImage, "cover.jpg");
            if (coverFile && backendId) {
                try {
                    const uploaded = await mediaService.uploadCover(backendId, coverFile);
                    savedCoverUrl = uploaded?.fileUrl || uploaded?.data?.fileUrl || savedCoverUrl;
                    setPendingCoverFile(null);
                    update("coverImage", savedCoverUrl);
                } catch (uploadError) {
                    mediaSyncError = uploadError?.message || "Cover image upload failed";
                }
            }
            if (backendId) {
                const photoUploads = savedPhotos
                    .map((photo, index) => ({ index, file: dataUrlToFile(photo?.url, `gallery-${index + 1}.jpg`) }))
                    .filter((item) => item.file);
                const invitationImageUpload = pendingInvitationFile || dataUrlToFile(form.invitationImage, "invitation.jpg");
                const invitationImage2Upload = pendingInvitation2File || dataUrlToFile(form.invitationImage2, "invitation-2.jpg");
                const galleryUploads = [
                    ...photoUploads.map((item) => ({ ...item, purpose: "photo" })),
                    ...(invitationImageUpload ? [{ file: invitationImageUpload, purpose: "invitation" }] : []),
                    ...(invitationImage2Upload ? [{ file: invitationImage2Upload, purpose: "invitation2" }] : []),
                ];
                if (galleryUploads.length) {
                    try {
                        const uploadedGallery = await mediaService.uploadGallery(backendId, galleryUploads.map((item) => item.file));
                        const uploadedItems = Array.isArray(uploadedGallery) ? uploadedGallery : uploadedGallery?.items || uploadedGallery?.data || [];
                        for (const [uploadIndex, upload] of galleryUploads.entries()) {
                            const fileUrl = uploadedItems[uploadIndex]?.fileUrl;
                            if (!fileUrl) continue;
                            if (upload.purpose === "photo") {
                                savedPhotos = savedPhotos.map((photo, index) => index === upload.index ? { ...photo, url: fileUrl } : photo);
                            } else if (upload.purpose === "invitation") {
                                savedInvitationUrl = fileUrl;
                                setPendingInvitationFile(null);
                                update("invitationImage", fileUrl);
                            } else if (upload.purpose === "invitation2") {
                                savedInvitationUrl2 = fileUrl;
                                setPendingInvitation2File(null);
                                update("invitationImage2", fileUrl);
                            }
                        }
                    } catch (uploadError) {
                        mediaSyncError ||= uploadError?.message || "Gallery upload failed";
                    }
                }
            }

            let savedCoverBgUrl = form.coverBackgroundImage || "";
            const coverBgFile = pendingCoverBgFile || dataUrlToFile(form.coverBackgroundImage, "cover-bg.jpg");
            if (coverBgFile && backendId) {
                try {
                    const items = await mediaService.uploadGallery(backendId, [coverBgFile]);
                    const uploadedCoverBg = (Array.isArray(items) ? items : items?.items || items?.data || [])[0];
                    savedCoverBgUrl = uploadedCoverBg?.fileUrl || uploadedCoverBg?.data?.fileUrl || form.coverBackgroundImage;
                    setPendingCoverBgFile(null);
                    update("coverBackgroundImage", savedCoverBgUrl);
                } catch (uploadError) {
                    mediaSyncError ||= uploadError?.message || "Cover background upload failed";
                }
            }

            let savedBgUrl = form.backgroundImage || "";
            const bgFile = pendingBackgroundFile || dataUrlToFile(form.backgroundImage, "background.jpg");
            if (bgFile && backendId) {
                try {
                    const items = await mediaService.uploadGallery(backendId, [bgFile]);
                    const uploadedBg = (Array.isArray(items) ? items : items?.items || items?.data || [])[0];
                    savedBgUrl = uploadedBg?.fileUrl || uploadedBg?.data?.fileUrl || form.backgroundImage;
                    setPendingBackgroundFile(null);
                    update("backgroundImage", savedBgUrl);
                } catch (uploadError) {
                    mediaSyncError ||= uploadError?.message || "Background upload failed";
                }
            }

            const finalDesign = { ...designPayload, coverImage: savedCoverUrl || designPayload.coverImage,
                photos: savedPhotos, coverBackgroundImage: savedCoverBgUrl || null, backgroundImage: savedBgUrl || null,
                invitationImage: savedInvitationUrl || designPayload.invitationImage, invitationImage2: savedInvitationUrl2 || designPayload.invitationImage2 };
            const finalContent = { ...contentPayload, ...Object.fromEntries(["coverImage", "coverBackgroundImage", "backgroundImage", "invitationImage", "invitationImage2"].map(key => [key, finalDesign[key]])),
                gallery: savedPhotos.filter(photo => photo?.url).map(({ id, url }) => ({ id, preview: url, type: "image" })) };
            let extraMedia = new globalThis.Map();
            if (backendId && !apiSyncFailed) {
                try {
                    extraMedia = await uploadInlineReferences([finalDesign, finalContent], files => mediaService.uploadGallery(backendId, files));
                    if (extraMedia.size) setForm(previous => replaceMediaReferences(previous, extraMedia));
                } catch (error) { mediaSyncError ||= error.message; }
            }
            const hasMediaUpdates = backendId && (
                extraMedia.size ||
                savedCoverUrl ||
                savedPhotos.some((photo, index) => photo?.url !== form.photos?.[index]?.url) ||
                savedInvitationUrl ||
                savedInvitationUrl2 ||
                (savedCoverBgUrl && savedCoverBgUrl !== form.coverBackgroundImage) ||
                (savedBgUrl && savedBgUrl !== form.backgroundImage)
            );

            if (savedPhotos.some((photo, index) => photo?.url !== form.photos?.[index]?.url)) {
                setForm(previous => ({ ...previous, photos: previous.photos.map((photo, index) => photo?.url === form.photos?.[index]?.url ? savedPhotos[index] : photo) }));
            }

            if (hasMediaUpdates) {
                try {
                    saved = await invitationService.update(backendId, {
                        ...payload,
                        expectedUpdatedAt: serverRevision.current,
                        designJson: JSON.stringify(stripInlineMedia(replaceMediaReferences({
                            ...designPayload,
                            coverImage: savedCoverUrl || designPayload.coverImage,
                            photos: savedPhotos,
                            coverBackgroundImage: savedCoverBgUrl || form.coverBackgroundImage || null,
                            backgroundImage: savedBgUrl || form.backgroundImage || null,
                            invitationImage: savedInvitationUrl || form.invitationImage || null,
                            invitationImage2: savedInvitationUrl2 || form.invitationImage2 || null,
                        }, extraMedia))),
                        contentJson: JSON.stringify(stripInlineMedia(replaceMediaReferences({
                            ...contentPayload,
                            coverImage: savedCoverUrl || contentPayload.coverImage,
                            gallery: savedPhotos.filter(photo => photo?.url).map(({ id, url }) => ({ id, preview: url, type: "image" })),
                            coverBackgroundImage: savedCoverBgUrl || form.coverBackgroundImage || null,
                            backgroundImage: savedBgUrl || form.backgroundImage || null,
                            invitationImage: savedInvitationUrl || form.invitationImage || null,
                            invitationImage2: savedInvitationUrl2 || form.invitationImage2 || null,
                        }, extraMedia))),
                    }, { suppressAuthRedirect: true });
                } catch (updateError) {
                    mediaSyncError ||= updateError?.message || "Invitation photo references could not be saved";
                    apiSyncStatus = updateError?.status || updateError?.response?.status;
                }
            }

            if (saved?.updatedAt) serverRevision.current = saved.updatedAt;
            const targetDraftId = invitationId || saved?.id || `wed-${Date.now().toString(36)}`;

            // Always persist to local wedding draft storage
            saveDraft(stripInlineMedia(replaceMediaReferences({
                ownerUserId: user?.id || user?.userId,
                id: targetDraftId,
                rsvpDeadline: invitation?.rsvpDeadline || null,
                slug: saved?.slug || invitation?.slug || form.slug || "wedding",
                backendInvitationId: saved?.id || invitation?.backendInvitationId || (!isNaN(Number(invitationId)) ? Number(invitationId) : null),
                syncStatus: apiSyncFailed || mediaSyncError ? (effectiveBackendId || saved?.id ? "SYNC_FAILED" : "LOCAL_ONLY") : "SYNCED",
                syncError: apiSyncFailed ? "មិនអាចភ្ជាប់ទៅ server បានទេ។" : (mediaSyncError || ""),
                templateId: form.templateId || "garden-royal-khmer-wedding",
                presetId: form.presetId || "",
                couple: {
                    groom: finalGroom,
                    bride: finalBride,
                    groomParents: [form.groomFather, form.groomMother].filter(Boolean),
                    brideParents: [form.brideFather, form.brideMother].filter(Boolean),
                },
                groomName: finalGroom,
                brideName: finalBride,
                groomFather: form.groomFather || "",
                groomMother: form.groomMother || "",
                brideFather: form.brideFather || "",
                brideMother: form.brideMother || "",
                family: {
                    groomParents: [form.groomFather, form.groomMother].filter(Boolean),
                    brideParents: [form.brideFather, form.brideMother].filter(Boolean),
                },
                event: {
                    title: finalTitle,
                    date: finalDate,
                    receptionTime: finalTime,
                    venueName: finalVenueName,
                    venueAddress: finalVenueAddress,
                    mapLink: form.googleMapUrl,
                },
                title: finalTitle,
                eventDate: finalDate,
                eventTime: finalTime,
                venueName: finalVenueName,
                venueAddress: finalVenueAddress,
                googleMapUrl: form.googleMapUrl,
                sketchMapImage: form.sketchMapImage,
                coverImage: savedCoverUrl || form.coverImage,
                coverUrl: savedCoverUrl || form.coverImage,
                uploadedCoverUrl: savedCoverUrl,
                coverBackgroundImage: savedCoverBgUrl || form.coverBackgroundImage || "",
                templateDefaultCoverBg: form.templateDefaultCoverBg || "",
                invitationImage: savedInvitationUrl || form.invitationImage || null,
                invitationImage2: savedInvitationUrl2 || form.invitationImage2 || null,
                backgroundImage: savedBgUrl || form.backgroundImage || "",
                templateDefaultCover: form.templateDefaultCover,
                openingStyle: form.openingStyle || activePreset.openingStyle || "khmer-royal",
                gateEnabled: form.gateEnabled,
                hasGate: form.hasGate,
                openingVideo: form.openingVideo || null,
                frontColor: form.frontColor || activePreset.frontColor,
                bottomColor: form.bottomColor || activePreset.bottomColor,
                subtitle: form.subtitle || "",
                guestName: form.guestName || "",
                isPersonalizedGuest: form.isPersonalizedGuest || false,
                messageTitle: form.messageTitle || "",
                message: form.messageText,
                messageText: form.messageText || "",
                schedule: form.schedule,
                programDays: form.programDays || [],
                ...eventPresentationFields(form),
                ...invitationFeatureFields(form),
                ...(form.preWeddingVideo ? { preWeddingVideo: form.preWeddingVideo } : {}),
                photos: savedPhotos,
                gallery: (form.photos || [])
                    .filter((photo) => photo?.url)
                    .map(({ id }, index) => ({ id, preview: savedPhotos[index]?.url || form.photos[index]?.url, type: "image" })),
                musicUrl: form.musicUrl,
                storyChapters: form.storyChapters,
                party: form.party,
                faq: form.faq || [],
                dressCode: form.dressCode || null,
                dressColors: form.dressColors || [],
                showDressCode: form.showDressCode,
                showCountdown: form.showCountdown,
                showStory: form.showStory,
                showParty: form.showParty,
                showFaq: form.showFaq,
                khqrDollar: form.khqrDollar,
                khqrRiel: form.khqrRiel,
                gift: form.gift || [],
                showBrandMark: form.showBrandMark !== false,
                brandMarkUrl: form.brandMarkUrl || "",
                brandMark: form.brandMarkUrl || "",
                thankYouTitle: form.thankYouTitle || "",
                thankYouText: form.thankYouText || "",
                apologyTitle: form.apologyTitle ?? "",
                apologyText: form.apologyText ?? "",
                designJson: JSON.stringify(stripInlineMedia(replaceMediaReferences(finalDesign, extraMedia))),
                contentJson: JSON.stringify(stripInlineMedia(replaceMediaReferences(finalContent, extraMedia))),
                languageMode: form.languageMode || "KH",
                enabledSections: {
                    countdown: form.showCountdown !== false,
                    story: form.showStory !== false && templateCapabilities(getTemplateById(form.templateId) || {}).story !== false,
                    party: form.showParty !== false && templateCapabilities(getTemplateById(form.templateId) || {}).party !== false,
                    dressCode: form.showDressCode !== false && templateCapabilities(getTemplateById(form.templateId) || {}).dressCode !== false,
                    faq: form.showFaq !== false && templateCapabilities(getTemplateById(form.templateId) || {}).faq !== false,
                    schedule: form.showSchedule !== false && templateCapabilities(getTemplateById(form.templateId) || {}).schedule !== false,
                    map: true,
                    gallery: true,
                    gift: Boolean(form.khqrDollar?.qrUrl || form.khqrRiel?.qrUrl),
                    rsvp: true,
                    music: Boolean(form.musicUrl),
                },
            }, extraMedia)));

            const successMsg = apiSyncFailed
                ? effectiveBackendId
                    ? uiCopy("បានរក្សាទុកការកែប្រែក្នុងឧបករណ៍ប៉ុណ្ណោះ។ មិនទាន់រក្សាទុកលើម៉ាស៊ីនមេទេ។ សូមពិនិត្យអ៊ីនធឺណិត ហើយរក្សាទុកម្ដងទៀត។", "Changes were saved on this device only. Check your connection and save again to sync them.")
                    : uiCopy("បានរក្សាទុកក្នុងឧបករណ៍ប៉ុណ្ណោះ។ សូមពិនិត្យអ៊ីនធឺណិត ហើយរក្សាទុកម្ដងទៀត។", "Saved on this device only. Check your connection and save again to sync the invitation.")
                : mediaSyncError
                    ? uiCopy("កម្មវិធីត្រូវបានរក្សាទុកហើយ ប៉ុន្តែរូបភាពខ្លះមិនទាន់បានផ្ទុកឡើងទេ។", "Your event was saved, but some images have not finished uploading.")
                : t("savedSuccess") || "បានរក្សាទុកដោយជោគជ័យ!";

            const finalSavedId = saved?.id || targetDraftId;
            if (stayInStudio) {
                if (!quiet) toast(successMsg, apiSyncFailed || mediaSyncError ? "warning" : "success");
                return { id: finalSavedId, synced: !apiSyncFailed && !mediaSyncError, status: apiSyncStatus, error: mediaSyncError || (apiSyncFailed ? (apiSyncError || uiCopy("ម៉ាស៊ីនមេមិនអាចរក្សាទុកការកែប្រែបានទេ។ សូមរក្សាទុកម្ដងទៀត។", "The server could not save these changes. Retry saving.")) : "") };
            }
            if (redirectToPreview && finalSavedId) {
                toast(successMsg, apiSyncFailed || mediaSyncError ? "warning" : "success");
                navigate(`/dashboard/invitations/${finalSavedId}/preview`);
            } else {
                toast(successMsg, apiSyncFailed || mediaSyncError ? "warning" : "success");
                navigate(finalSavedId ? `/dashboard?id=${finalSavedId}` : "/dashboard/events", {
                    state: { savedSuccess: true, syncFailed: apiSyncFailed || Boolean(mediaSyncError), message: successMsg },
                });
            }
            return finalSavedId;
        } catch (err) {
            toast(err.message || (t("savedError") || "មិនអាចរក្សាទុកបានទេ (Save error)"));
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const studio = useStudioPersistence({ value: form, initialSaved: /^[1-9]\d*$/.test(String(invitationId || "")), onRestore: value => {
        setPendingCoverFile(null); setPendingCoverBgFile(null); setPendingBackgroundFile(null);
        setPendingInvitationFile(null); setPendingInvitation2File(null); setForm(value);
    }, persist: () => handleSave({ stayInStudio: true, quiet: true }),
        english: englishUI, enabled: Boolean(invitationId && /^[1-9]\d*$/.test(String(invitationId))) && !pendingCoverFile && !pendingCoverBgFile && !pendingBackgroundFile && !pendingInvitationFile && !pendingInvitation2File && !JSON.stringify(form).includes("data:") });

    const readiness = publishReadiness(form, invitation?.eventType || "WEDDING");
    const canPublish = (workspace ? workspace.isOwner : true) && Boolean(invitation?.backendInvitationId || /^[1-9]\d*$/.test(String(invitationId || "")));
    function goToGuideStep(step) {
        setGuideStep(step);
        if (step === 0) setSelectedSection("eventInfo");
        if (step === 1 && (!flowConfig.sectionOrder.includes(activeSection) || ["eventInfo", "venue"].includes(activeSection))) setSelectedSection(flowConfig.sectionOrder.find(key => !["eventInfo", "venue"].includes(key)) || "eventInfo");
        requestAnimationFrame(() => document.getElementById("studio-guide-heading")?.focus());
    }
    function completePublishField(check) {
        setPublishReviewOpen(false);
        setGuideStep(0);
        setSelectedSection(check.section);
        requestAnimationFrame(() => document.getElementById(`${fieldId}-${check.field}`)?.focus());
    }
    function reviewPublication() {
        setPublishError("");
        if (!String(authoredForm.venueAddress || "").trim()) {
            setVenueAddressError(uiCopy("សូមបញ្ចូលអាសយដ្ឋានទីកន្លែងមុនពេលផ្សព្វផ្សាយ។", "Enter the venue address before publishing."));
            completePublishField({ section: "venue", field: "venueAddress" });
            return;
        }
        setPublishReviewOpen(true);
    }
    async function openEventTool(tool) {
        if (await studio.flush()) navigate(`/app/events/${savedBackendId.current}/${tool}`);
    }
    function confirmPublished(result) {
        if (result.updatedAt) serverRevision.current = result.updatedAt;
        setPublishedUrl(result.slug ? new URL(`/i/${encodeURIComponent(result.slug)}`, window.location.origin).href : "");
        setPublished(true);
        setPublishReviewOpen(false);
        setEditorMode("guided");
        setGuideStep(4);
        toast(uiCopy("បានផ្សព្វផ្សាយធៀបអញ្ជើញ", "Invitation published"), "success");
    }
    async function checkPublication() {
        setIsPublishing(true);
        try {
            const result = await invitationService.get(savedBackendId.current);
            if (result?.status === "PUBLISHED") confirmPublished(result);
            else setPublishError(uiCopy("ម៉ាស៊ីនមេបង្ហាញថានៅជាពង្រាង។ អ្នកអាចព្យាយាមផ្សព្វផ្សាយម្ដងទៀត។", "The server still reports a draft. You can retry publication."));
        } catch { setPublishError(uiCopy("មិនអាចពិនិត្យស្ថានភាពបាន។ ពិនិត្យការតភ្ជាប់ រួចព្យាយាមម្ដងទៀត។", "Could not check publication. Reconnect and check again before sharing.")); }
        finally { setIsPublishing(false); }
    }

    async function publishInvitation() {
        if (isPublishing) return;
        if (!String(authoredForm.venueAddress || "").trim()) {
            setVenueAddressError(englishUI ? "Enter the venue address before publishing." : "សូមបញ្ចូលអាសយដ្ឋានទីកន្លែងមុនពេលផ្សព្វផ្សាយ។");
            setSelectedSection("venue");
            return;
        }
        setIsPublishing(true);
        try {
            if (!await studio.flush()) {
                setPublishError(uiCopy("ពង្រាងមិនទាន់បានរក្សាទុក។ ត្រឡប់ទៅកែសម្រួល ដើម្បីពិនិត្យស្ថានភាពរក្សាទុក។", "The draft has not been saved. Keep editing to review the save status before publishing."));
                return;
            }
            const result = await invitationService.publish(savedBackendId.current);
            if (result?.status !== "PUBLISHED") throw new Error(uiCopy("ម៉ាស៊ីនមេមិនទាន់បានបញ្ជាក់ការផ្សព្វផ្សាយទេ។ សូមព្យាយាមម្ដងទៀត។", "The server has not confirmed publication. Please retry."));
            confirmPublished(result);
        } catch (error) {
            if (/Publish requirements missing:.*\bvenueAddress\b/.test(error.message || "")) {
                setVenueAddressError(englishUI ? "The server has not saved this venue address. Save it again before publishing." : "ម៉ាស៊ីនមេមិនទាន់រក្សាទុកអាសយដ្ឋាននេះទេ។ សូមរក្សាទុកម្ដងទៀតមុនផ្សព្វផ្សាយ។");
                completePublishField({ section: "venue", field: "venueAddress" });
            } else setPublishError(error.message || uiCopy("មិនទាន់អាចបញ្ជាក់ការផ្សព្វផ្សាយបានទេ។ ពិនិត្យស្ថានភាពម្ដងទៀត។", "Publication is not confirmed. Check the server status before sharing."));
        }
        finally { setIsPublishing(false); }
    }

    // --- Dynamic Section Renderers (Driven by templateFormFlowConfig) ---

    const renderEventInfoSection = () => <section className="pe-section-card" aria-label={uiCopy("ព័ត៌មានកម្មវិធី", "Event information")}>
        <h2 className="pe-section-heading">{englishUI ? uiCopy("ព័ត៌មានកម្មវិធី", "Event information") : "ព័ត៌មានកម្មវិធី"}</h2>
            {/* Main Title on Cover */}
            <div className="pe-form-group">
                <label className="pe-label" htmlFor={`${fieldId}-title`}>
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("mainTitle") || uiCopy("ចំណងជើងធំលើក្រប", "Cover title")}
                </label>
                <input
                    id={`${fieldId}-title`}
                    type="text"
                    className="pe-input"
                    value={authoredForm.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder={uiCopy("សិរីមង្គលអាពាហ៍ពិពាហ៍", "Wedding celebration")}
                />
            </div>

            {/* Couple Names on Cover */}
            <div className="pe-grid-2">
                <div className="pe-form-group">
                    <label className="pe-label" htmlFor={`${fieldId}-groom`}>
                        <span className="pe-label-icon"><User size={15} /></span>
                        {t("groom") || uiCopy("ឈ្មោះកូនកំលោះ", "Groom name")}
                    </label>
                    <input
                        id={`${fieldId}-groom`}
                        type="text"
                        className="pe-input"
                        value={authoredForm.groomName}
                        onChange={(e) => update("groomName", e.target.value)}
                        placeholder={uiCopy("វណ្ណដា", "VannDa")}
                    />
                </div>
                <div className="pe-form-group">
                    <label className="pe-label" htmlFor={`${fieldId}-bride`}>
                        <span className="pe-label-icon"><Heart size={15} /></span>
                        {t("bride") || uiCopy("ឈ្មោះកូនក្រមុំ", "Bride name")}
                    </label>
                    <input
                        id={`${fieldId}-bride`}
                        type="text"
                        className="pe-input"
                        value={authoredForm.brideName}
                        onChange={(e) => update("brideName", e.target.value)}
                        placeholder={uiCopy("ស្រីពេជ្រ", "Sreypich")}
                    />
                </div>
            </div>

            {/* Event Date & Time on Cover */}
            <div className="pe-grid-2">
                <div className="pe-form-group">
                    <label className="pe-label" htmlFor={`${fieldId}-date`}>
                        <span className="pe-label-icon"><Calendar size={15} /></span>
                        {t("dateTime") || uiCopy("កាលបរិច្ឆេទកម្មវិធី", "Event date")}
                    </label>
                    <DatePicker
                        id={`${fieldId}-date`}
                        value={form.eventDate}
                        onChange={(val) => {
                            update("eventDate", val);
                            update("eventDateText", val);
                        }}
                        placeholder={uiCopy("ជ្រើសកាលបរិច្ឆេទ", "Choose date")}
                    />
                </div>
                <div className="pe-form-group">
                    <label className="pe-label" htmlFor={`${fieldId}-time`}>
                        <span className="pe-label-icon"><Clock size={15} /></span>
                        {t("timePicker") || uiCopy("ម៉ោងទទួលភ្ញៀវ", "Event time")}
                    </label>
                    <TimePicker
                        id={`${fieldId}-time`}
                        value={form.eventTime}
                        onChange={(val) => update("eventTime", val)}
                        placeholder={uiCopy("ជ្រើសម៉ោង", "Choose time")}
                    />
                </div>
            </div>

    </section>;
    const renderMusicSection = () => <section className="pe-section-card" aria-label={uiCopy("តន្ត្រី", "Music")}>
        <h2 className="pe-section-heading">{englishUI ? uiCopy("តន្ត្រី", "Music") : "តន្ត្រី"}</h2>
            {/* Spotify-style Music Selector & Player */}
            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Music size={15} /></span>
                    {t("labelMusic") || uiCopy("ជ្រើសរើសបទភ្លេង", "Music track")}
                </label>
                <SpotifyMusicPicker
                    value={form.musicTrackId || "waiting-day"}
                    onChange={(trackId, trackUrl) => {
                        update("musicTrackId", trackId);
                        update("musicUrl", trackUrl || "");
                    }}
                />
            </div>
    </section>;

    const renderCoverSection = () => (
        <div className="pe-section-card" key="cover">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <Sparkles size={17} />
                </span>
                <span>{flowConfig.labels.coverSection || t("secCover") || "ក្របខាងមុខ (Front Cover)"}</span>
            </h4>

            {/* Clean Cover Image Upload (Image 1) */}
            {flowConfig.hasCoverImage !== false && (
                <CleanImageUploadField
                    label={flowConfig.labels.coverImage || (englishUI ? (flowConfig.labels.coverImageEn || "Front Cover Image") : (t("coverImage") || uiCopy("រូបភាពក្របខាងមុខ", "Front cover image")))}
                    icon={ImageIcon}
                    image={form.coverImage}
                    onUpload={(e) => handleFileUpload(e, (url, file) => {
                        update("uploadedCoverUrl", url);
                        update("coverImage", url);
                        setPendingCoverFile(file);
                    })}
                    onRemove={() => {
                        update("uploadedCoverUrl", "");
                        update("coverImage", "");
                        setPendingCoverFile(null);
                    }}
                    onRestoreDefault={form.templateDefaultCover ? () => {
                        update("uploadedCoverUrl", "");
                        update("coverImage", form.templateDefaultCover);
                        setPendingCoverFile(null);
                    } : undefined}
                    hasDefault={Boolean(form.templateDefaultCover && form.coverImage !== form.templateDefaultCover)}
                    inputRef={coverInputRef}
                    hint={flowConfig.hints.coverImage || (englishUI ? (flowConfig.hints.coverImageEn || "Shown on front cover / hero") : "បង្ហាញលើក្របទំព័រដើម (Front Cover / Hero)")}
                />
            )}

            {/* Cover Background (Closed State) Image Upload (Field 1 for Celestial / Royal Khmer) */}
            {Boolean(flowConfig.hasCoverBackgroundImage) && (
                <div style={{ marginTop: 12 }}>
                    <CleanImageUploadField
                        label={englishUI ? (flowConfig.labels.coverBackgroundImageEn || "Cover background (closed state)") : (flowConfig.labels.coverBackgroundImage || uiCopy("ផ្ទៃខាងក្រោយគ្របមុខ (ពេលមិនទាន់បើក)", "Cover background (closed state)"))}
                        icon={ImageIcon}
                        image={form.coverBackgroundImage}
                        onUpload={(e) => handleFileUpload(e, (url, file) => {
                            update("coverBackgroundImage", url);
                            setPendingCoverBgFile(file);
                        })}
                        onRemove={() => {
                            update("coverBackgroundImage", "");
                            setPendingCoverBgFile(null);
                        }}
                        onRestoreDefault={form.templateDefaultCoverBg ? () => {
                            update("coverBackgroundImage", form.templateDefaultCoverBg);
                            setPendingCoverBgFile(null);
                        } : undefined}
                        hasDefault={Boolean(form.templateDefaultCoverBg && form.coverBackgroundImage !== form.templateDefaultCoverBg)}
                        inputRef={coverBgInputRef}
                        hint={englishUI ? (flowConfig.hints.coverBackgroundImageEn || "Shown on the cover before the invitation is opened") : (flowConfig.hints.coverBackgroundImage || "បង្ហាញលើគ្របមុខពេលមិនទាន់បើកធៀបការ")}
                    />
                </div>
            )}

            {/* Background Frame / Botanical Image Upload (Opened State) (Field 2 for Full / Botanical Frame) */}
            {Boolean(flowConfig.hasBackgroundImage) && (
                <div style={{ marginTop: 12 }}>
                    <CleanImageUploadField
                        label={englishUI ? (flowConfig.labels.backgroundImageEn || "Botanical frame (opened state)") : (flowConfig.labels.backgroundImage || uiCopy("ស៊ុមផ្កា ឬរូបភាពផ្ទៃខាងក្រោយ", "Botanical frame / background image"))}
                        icon={Sparkles}
                        image={form.backgroundImage || form.templateDefaultBackground || (String(form.templateId).includes("celestial") ? "/invitations/khmer-celestial/botanical-frame.jpg" : "")}
                        onUpload={(e) => handleFileUpload(e, (url, file) => {
                            update("backgroundImage", url);
                            setPendingBackgroundFile(file);
                        })}
                        onRemove={() => {
                            update("backgroundImage", "");
                            setPendingBackgroundFile(null);
                        }}
                        onRestoreDefault={form.templateDefaultBackground || String(form.templateId).includes("celestial") ? () => {
                            const def = form.templateDefaultBackground || "/invitations/khmer-celestial/botanical-frame.jpg";
                            update("backgroundImage", def);
                            setPendingBackgroundFile(null);
                        } : undefined}
                        hasDefault={Boolean(
                            (form.templateDefaultBackground || String(form.templateId).includes("celestial")) &&
                            form.backgroundImage &&
                            form.backgroundImage !== (form.templateDefaultBackground || "/invitations/khmer-celestial/botanical-frame.jpg")
                        )}
                        inputRef={bgFrameInputRef}
                        hint={englishUI ? (flowConfig.hints.backgroundImageEn || "Shown as background or frame once invitation is opened (Full)") : (flowConfig.hints.backgroundImage || "ស៊ុមផ្កា ឬរូបភាពផ្ទៃខាងក្រោយពេលបើកធៀបការពេញ (Full)")}
                    />
                </div>
            )}

            {/* Wedding Logo / Calligraphy Mark Controls (Turn On / Turn Off / Custom Upload) */}
            <div style={{ padding: "14px 16px", background: "#fdfbf7", border: "1px solid #f0e6d6", borderRadius: 10, margin: "14px 0" }}>
                <div className="pe-switch-row" style={{ margin: 0, paddingBottom: form.showBrandMark !== false ? 12 : 0, borderBottom: form.showBrandMark !== false ? "1px dashed #e6dbcb" : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span className="pe-switch-label" style={{ fontWeight: 600, color: "#43250b", display: "flex", alignItems: "center", gap: 6 }}>
                            <Sparkles size={16} color="#b88a3a" />
                            {uiCopy("បង្ហាញស្លាកឈ្មោះមាស ឬឡូហ្គោ", "Show gold mark / logo")}
                        </span>
                        <small style={{ color: "#786148", fontSize: "0.76rem" }}>
                            {form.showBrandMark !== false ? uiCopy("កំពុងបើកបង្ហាញលើក្របទំព័រ", "Visible on the cover") : uiCopy("បានបិទ (បង្ហាញតែឈ្មោះគូស្នេហ៍ជាអក្សរមាស)", "Hidden (couple names appear in gold text)")}
                        </small>
                    </div>
                    <label className="pe-toggle">
                        <input
                            type="checkbox"
                            checked={form.showBrandMark !== false}
                            onChange={(e) => update("showBrandMark", e.target.checked)}
                        />
                        <span className="pe-toggle-slider" />
                    </label>
                </div>

                {form.showBrandMark !== false && (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                        {form.brandMarkUrl ? (
                            <div className="studio-brand-mark-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                <img
                                    src={form.brandMarkUrl}
                                    alt="Custom Logo"
                                    style={{ width: 48, height: 48, objectFit: "contain", background: "#fafafa", borderRadius: 6, border: "1px solid #cbd5e1" }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#1e293b" }}>{uiCopy("ឡូហ្គោផ្ទាល់ខ្លួន", "Custom logo")}</div>
                                    <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{uiCopy("បានបញ្ចូលរូបភាពផ្ទាល់ខ្លួន", "Custom image uploaded")}</div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <label className="pe-btn-upload-cover" style={{ cursor: "pointer", padding: "4px 8px", fontSize: "0.75rem", margin: 0 }}>
                                        {uiCopy("ប្តូរ", "Change")}
                                        <input
                                            type="file"
                                            accept="image/png,image/webp,image/jpeg"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const url = URL.createObjectURL(file);
                                                        update("brandMarkUrl", url);
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className="pe-btn-del-item"
                                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                        onClick={() => update("brandMarkUrl", "")}
                                        title={uiCopy("ប្រើឡូហ្គោគំរូដើម", "Use the template’s original logo")}
                                    >
                                        <RotateCcw size={13} /> {uiCopy("គំរូដើម", "Template default")}
                                    </button>
                                    <button
                                        type="button"
                                        className="pe-btn-del-item"
                                        style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2" }}
                                        onClick={() => update("showBrandMark", false)}
                                        title={uiCopy("បិទមិនបង្ហាញឡូហ្គោលើក្រប", "Hide logo on cover")}
                                    >
                                        <X size={13} /> {uiCopy("បិទ", "Close")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="studio-brand-mark-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e8decb" }}>
                                <img
                                    src="/invitations/khmer-celestial/koupreng-gold-mark.webp"
                                    alt="Template Default Logo"
                                    style={{ width: 52, height: 38, objectFit: "contain", background: "#faf7f2", borderRadius: 6, border: "1px solid #e2d7c3" }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#5c401d" }}>{uiCopy("ឡូហ្គោគំរូដើម", "Template logo")}</div>
                                    <div style={{ fontSize: "0.74rem", color: "#8a755d" }}>{uiCopy("ស្លាកឈ្មោះមាសរបស់គំរូ", "Template gold name mark")}</div>
                                </div>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <label className="pe-btn-upload-cover" style={{ cursor: "pointer", padding: "6px 10px", fontSize: "0.76rem", margin: 0, display: "inline-flex", alignItems: "center", gap: 5 }}>
                                        <UploadCloud size={14} />
                                        <span>{uiCopy("ប្តូរជារូបផ្ទាល់ខ្លួន", "Use your own image")}</span>
                                        <input
                                            type="file"
                                            accept="image/png,image/webp,image/jpeg"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const url = URL.createObjectURL(file);
                                                        update("brandMarkUrl", url);
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className="pe-btn-del-item"
                                        style={{ padding: "6px 10px", fontSize: "0.76rem", display: "inline-flex", alignItems: "center", gap: 4, color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2" }}
                                        onClick={() => update("showBrandMark", false)}
                                        title={uiCopy("បិទមិនបង្ហាញឡូហ្គោលើក្រប", "Hide logo on cover")}
                                    >
                                        <X size={14} />
                                        <span>{uiCopy("បិទ", "Close")}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="pe-switch-row" style={{ margin: "4px 0 0", padding: "8px 10px", background: "rgba(255,255,255,0.7)", borderRadius: 6 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <span className="pe-switch-label" style={{ fontSize: "0.82rem" }}>{t("hideCoupleCover") || uiCopy("បិទឈ្មោះកូនកំលោះ/កូនក្រមុំ (ក្របខាងលើ)", "Hide couple names on the cover")}</span>
                                <small style={{ color: "#786148", fontSize: "0.72rem" }}>{uiCopy("* ប្រើពេលឡូហ្គោរបស់អ្នកមានឈ្មោះស្រាប់ ដើម្បីកុំឱ្យជាន់ឈ្មោះគ្នា", "* Use when your logo already includes names to avoid duplicates")}</small>
                            </div>
                            <label className="pe-toggle">
                                <input
                                    type="checkbox"
                                    checked={form.hideCoupleNameOnCover}
                                    onChange={(e) => update("hideCoupleNameOnCover", e.target.checked)}
                                />
                                <span className="pe-toggle-slider" />
                            </label>
                        </div>
                    </div>
                )}

                {form.showBrandMark === false && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.85)", borderRadius: 8, border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {uiCopy("🚫 បានបិទឡូហ្គោ (បង្ហាញតែឈ្មោះគូស្នេហ៍ជាអក្សរមាស)", "🚫 Logo hidden (couple names appear in gold text)")}
                        </span>
                        <button
                            type="button"
                            className="pe-btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.74rem", borderRadius: 6, whiteSpace: "nowrap" }}
                            onClick={() => update("showBrandMark", true)}
                        >
                            {uiCopy("បើកបង្ហាញឡើងវិញ", "Show again")}
                        </button>
                    </div>
                )}
            </div>

            {/* Subtitle / Invitation Line on Cover */}
            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Sparkles size={15} /></span>
                    {t("subTitle") || uiCopy("ចំណងជើងរងលើក្រប", "Cover subtitle / kicker")}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    name="subtitle" value={authoredForm.subtitle}
                    onChange={(e) => update("subtitle", e.target.value)}
                    placeholder={uiCopy("សូមគោរពអញ្ជើញ", "You are cordially invited")}
                />
            </div>

        </div>
    );

    const renderFamilySection = () => (
        <div className="pe-section-card" key="family">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <Users size={17} />
                </span>
                <span>{flowConfig.labels.familySection || uiCopy("មាតាបិតាទាំងសងខាង", "Together with our families")}</span>
            </h4>
            <p style={{ margin: "0 0 14px 0", fontSize: "0.8rem", color: "#64748b" }}>
                {uiCopy("* បញ្ចូលឈ្មោះលោកឪពុក និងអ្នកម្តាយទាំងសងខាងសម្រាប់បង្ហាញក្នុងធៀបការ", "* Enter the names of parents of both the groom and bride")}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                {/* Groom's Family */}
                <div style={{ background: "#fdfbf7", border: "1px solid #ebdcc5", borderRadius: "10px", padding: "12px" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: 700, color: "#8c6b32", display: "flex", alignItems: "center", gap: "6px" }}>
                        <User size={15} /> {uiCopy("ខាងកូនកំលោះ", "Groom’s side")}
                    </h5>
                    <div className="pe-form-group" style={{ marginBottom: "8px" }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>{uiCopy("លោកឪពុក", "Father")}</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={authoredForm.groomFather || ""}
                            onChange={(e) => update("groomFather", e.target.value)}
                            placeholder={uiCopy("លោក ឃុន ស៊ីវខេង", "Mr. Khun Sivkheng")}
                        />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: 0 }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>{uiCopy("អ្នកម្តាយ", "Mother")}</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={authoredForm.groomMother || ""}
                            onChange={(e) => update("groomMother", e.target.value)}
                            placeholder={uiCopy("លោកស្រី គុយ ដាលី", "Mrs. Kuy Daly")}
                        />
                    </div>
                </div>

                {/* Bride's Family */}
                <div style={{ background: "#fdfbf7", border: "1px solid #ebdcc5", borderRadius: "10px", padding: "12px" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: 700, color: "#8c6b32", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Heart size={15} /> {uiCopy("ខាងកូនក្រមុំ", "Bride’s side")}
                    </h5>
                    <div className="pe-form-group" style={{ marginBottom: "8px" }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>{uiCopy("លោកឪពុក", "Father")}</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={authoredForm.brideFather || ""}
                            onChange={(e) => update("brideFather", e.target.value)}
                            placeholder={uiCopy("លោក ឡាំ គីមឡុង", "Mr. Lam Kimlong")}
                        />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: 0 }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>{uiCopy("អ្នកម្តាយ", "Mother")}</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={authoredForm.brideMother || ""}
                            onChange={(e) => update("brideMother", e.target.value)}
                            placeholder={uiCopy("លោកស្រី ឡេង​ យ៉ុងស៊ី", "Mrs. Leng Yongsy")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderInvitationSection = () => (
        <div className="pe-section-card" key="invitation">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <Mail size={17} />
                </span>
                <span>{flowConfig.labels.invitationSection || t("secMessage") || uiCopy("សារលិខិតអញ្ជើញ", "The invitation")}</span>
            </h4>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("messageTitle") || uiCopy("ចំណងជើងសារ", "Message kicker")}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    name="messageTitle" value={authoredForm.messageTitle}
                    onChange={(e) => update("messageTitle", e.target.value)}
                    placeholder={uiCopy("ដំណឹងអាពាហ៍ពិពាហ៍", "Wedding announcement")}
                />
            </div>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Mail size={15} /></span>
                    {t("messageText") || uiCopy("អត្ថបទសារអញ្ជើញ", "Invitation message")}
                </label>
                <textarea
                    className="pe-textarea"
                    rows="6"
                    name="messageText" value={authoredForm.messageText}
                    onChange={(e) => update("messageText", e.target.value)}
                />
            </div>
        </div>
    );

    const renderCouplePhotoSection = () => (
        <div className="pe-section-card" key="couplePhoto">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <Heart size={17} />
                </span>
                <span>{t("secCouple") || uiCopy("រូបថតគូស្នេហ៍", "Couple photo")}</span>
            </h4>

            <CleanImageUploadField
                label={t("backgroundImage") || uiCopy("រូបថតគូស្នេហ៍ខាងក្នុង", "Couple / inner photo")}
                icon={ImageIcon}
                image={form.backgroundImage}
                onUpload={(e) => handleFileUpload(e, (url, file) => {
                    update("backgroundImage", url);
                    setPendingBackgroundFile(file);
                })}
                onRemove={() => {
                    update("backgroundImage", "");
                    setPendingBackgroundFile(null);
                }}
                inputRef={bgInputRef}
                hint="បង្ហាញក្នុងផ្នែកកូនកំលោះ និងកូនក្រមុំ (The Bride & Groom Card)"
            />
        </div>
    );

    const renderCountdownSection = () => <SaveTheDateEditor form={authoredForm} english={englishUI}
        supportsOrdering={templateCapabilities(getTemplateById(form.templateId) || {}).sectionOrdering}
        onChange={patch => setForm(previous => Object.entries(patch).reduce((next, [key, value]) => editLocalizedField(next, activeLangTab === "EN" ? "en" : "km", key, value), previous))} />;

    const renderScheduleSection = () => <WeddingProgramEditor value={form.schedule} programDays={form.programDays} masterDate={form.eventDate}
        enabled={form.showSchedule !== false} onEnabled={value => update("showSchedule", value)}
        onChange={(schedule, programDays) => setForm(previous => ({ ...previous, schedule, programDays }))} english={englishUI} />;

    const renderVenueSection = () => (
        <div className="pe-section-card" key="venue">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <MapPin size={17} />
                </span>
                <span>{flowConfig.labels.venueSection || t("secLocation") || uiCopy("ទីតាំង និងផែនទី", "Venue & map")}</span>
            </h4>

            <div className="pe-form-group">
                <label className="pe-label" htmlFor={`${fieldId}-venueName`}>
                    <span className="pe-label-icon"><MapPin size={15} /></span>
                    {t("venue") || uiCopy("ទីតាំងប្រារព្ធពិធី", "Venue name")}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    value={authoredForm.venueName}
                    id={`${fieldId}-venueName`}
                    onChange={(e) => update("venueName", e.target.value)}
                    placeholder="The Premier Center Sen Sok"
                />
            </div>

            <div className="pe-form-group">
                <label className="pe-label" htmlFor={`${fieldId}-venueAddress`}>
                    {englishUI ? "Venue address" : "អាសយដ្ឋានទីកន្លែង"}
                </label>
                <input ref={venueAddressInput} id={`${fieldId}-venueAddress`} name="venueAddress" type="text"
                    className="pe-input" value={authoredForm.venueAddress} maxLength={1000} autoComplete="street-address"
                    aria-required="true" aria-invalid={Boolean(venueAddressError)}
                    aria-describedby={venueAddressError ? `${fieldId}-venueAddress-error` : `${fieldId}-venueAddress-hint`}
                    onChange={e => update("venueAddress", e.target.value)} />
                {venueAddressError ? <p id={`${fieldId}-venueAddress-error`} className="workspace-field-error" role="alert">{venueAddressError}</p>
                    : <p id={`${fieldId}-venueAddress-hint`} className="workspace-muted">{englishUI ? "Required to publish. Include the street, area and city." : "ត្រូវការសម្រាប់ផ្សព្វផ្សាយ។ សូមបញ្ចូលផ្លូវ តំបន់ និងក្រុង។"}</p>}
            </div>

            <div className="pe-form-group">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
                    <label className="pe-label" style={{ margin: 0 }}>
                        <span className="pe-label-icon"><MapPin size={15} /></span>
                        {t("mapsUrl") || uiCopy("តំណផែនទី Google Maps", "Google Maps link (URL)")}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={isLocating}
                            title={uiCopy("យកទីតាំងបច្ចុប្បន្នរបស់អ្នក", "Use your current location")}
                            style={{
                                fontSize: "0.75rem",
                                padding: "5px 10px",
                                borderRadius: "6px",
                                border: "1px solid #0ea5e9",
                                background: "#f0f9ff",
                                color: "#0369a1",
                                cursor: isLocating ? "wait" : "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                            }}
                        >
                            <MapPin size={13} />
                            {isLocating ? uiCopy("កំពុងស្វែងរក...", "Finding location...") : uiCopy("យកទីតាំងបច្ចុប្បន្ន", "Use current location")}
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerateMapLink}
                            title={uiCopy("បំលែងឈ្មោះទីតាំងទៅជាតំណផែនទីដោយស្វ័យប្រវត្តិ", "Generate a Google Maps link from the venue name")}
                            style={{
                                fontSize: "0.75rem",
                                padding: "5px 10px",
                                borderRadius: "6px",
                                border: "1px solid #f59e0b",
                                background: "#fffbeb",
                                color: "#b45309",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Zap size={13} />
                            {uiCopy("បង្កើតតំណដោយស្វ័យប្រវត្តិ", "Generate link")}
                        </button>
                        <button
                            type="button"
                            onClick={handleSearchMap}
                            title={uiCopy("បើកស្វែងរកលើ Google Maps", "Search on Google Maps")}
                            style={{
                                fontSize: "0.75rem",
                                padding: "5px 10px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                background: "#f8fafc",
                                color: "#334155",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                            }}
                        >
                            <ExternalLink size={13} />
                            {uiCopy("ស្វែងរក / សាកល្បងមើល", "Search / test")}
                        </button>
                    </div>
                </div>
                <input
                    type="text"
                    className="pe-input"
                    value={form.googleMapUrl}
                    onChange={(e) => {
                        const value = e.target.value;
                        update("googleMapUrl", value);
                        setLocationError(/^https?:\/\//i.test(value) && !isGoogleMapsUrl(value)
                            ? "Link នេះមិនមែនជា Google Maps URL ត្រឹមត្រូវទេ។"
                            : "");
                    }}
                    placeholder={uiCopy("តំណផែនទី ឬឈ្មោះទីតាំង", "Google Maps link or venue name")}
                />
                {locationError && (
                    <div role="alert" style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "6px" }}>
                        {locationError}
                    </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px", lineHeight: "1.4" }}>
                    <span className="pe-location-help-mobile">{uiCopy("ចុចប៊ូតុង 📍 ដើម្បីយកទីតាំងបច្ចុប្បន្ន ឬបិទភ្ជាប់តំណផែនទី", "Tap 📍 to use your current location or paste a Google Maps link")}</span>
                    <span className="pe-location-help-desktop">{uiCopy("បញ្ចូលតំណផែនទី ឬស្វែងរកឈ្មោះទីតាំងរោងការ", "Paste a Google Maps link or search for your venue")}</span>
                </div>
            </div>

            <CleanImageUploadField
                label={t("sketchMap") || uiCopy("រូបគំនូសប្លង់ទីតាំង", "Venue sketch map")}
                icon={Map}
                image={form.sketchMapImage}
                onUpload={(e) => handleFileUpload(e, (url) => update("sketchMapImage", url))}
                onRemove={() => update("sketchMapImage", null)}
                inputRef={sketchInputRef}
                hint="រូបប្លង់បង្ហាញផ្លូវទៅកាន់រោងការ (អាចទុកទំនេរបាន)"
            />
        </div>
    );

    const renderGallerySection = () => (
        <div className="pe-section-card" key="gallery">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                <h4 className="pe-section-heading" style={{ margin: 0 }}>
                    <span className="pe-sec-icon-badge">
                        <Images size={17} />
                    </span>
                    <span>{flowConfig.labels.gallerySection || t("secGallery") || uiCopy("វិចិត្រសាលរូបថត (5–10 រូប)", "Photo gallery (5–10 images)")}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: "12px", marginLeft: "6px" }}>
                        {form.photos.filter((p) => Boolean(p?.url)).length} / {form.photos.length} {uiCopy("រូប", "images")}
                    </span>
                </h4>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {/* Batch upload */}
                    <label
                        className="pe-btn-upload-action"
                        style={{
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            margin: 0
                        }}
                        title={uiCopy("ជ្រើសរើសរូបថតច្រើនសន្លឹកក្នុងពេលតែមួយ", "Upload multiple photos")}
                    >
                        <UploadCloud size={14} />
                        {uiCopy("ជ្រើសរើសរូបច្រើនសន្លឹក", "Choose multiple photos")}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleBatchGalleryUpload}
                        />
                    </label>

                    {/* Add slot button up to 10 */}
                    {form.photos.length < 10 && (
                        <button
                            type="button"
                            onClick={addPhotoSlot}
                            className="pe-btn-upload-action"
                            style={{
                                padding: "6px 12px",
                                fontSize: "0.8rem",
                                background: "#f0fdf4",
                                borderColor: "#86efac",
                                color: "#166534",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                            }}
                            title={uiCopy("បន្ថែមប្រអប់រូបថតថ្មី (អតិបរមា 10 រូប)", "Add image slot (up to 10 images)")}
                        >
                            <Plus size={14} /> {uiCopy("បន្ថែមរូប (", "Add image (")}{form.photos.length}/10)
                        </button>
                    )}
                </div>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                {uiCopy("* លោកអ្នកអាចបញ្ចូលរូបថតពី 5 ដល់ 10 សន្លឹកសម្រាប់បង្ហាញក្នុងវិចិត្រសាលធៀបការ", "* Upload 5 to 10 photos for your invitation gallery")}
            </p>

            <div className="pe-gallery-grid-clean">
                {form.photos.map((photo, idx) => (
                    <div key={photo.id || idx}>
                    <CleanGalleryItem
                        key={photo.id || `photo-${idx}`}
                        idx={idx}
                        photo={photo}
                        onUpload={(e) => handleFileUpload(e, (url) => updatePhoto(idx, url))}
                        onRemove={() => updatePhoto(idx, "")}
                        canDeleteSlot={form.photos.length > 5}
                        onDeleteSlot={() => removePhotoSlot(idx)}
                    />
                    <div className="studio-reorder"><button type="button" disabled={idx === 0} onClick={() => moveItem("photos", idx, -1)} aria-label={`Move photo ${idx + 1} up`}>↑</button><button type="button" disabled={idx === form.photos.length - 1} onClick={() => moveItem("photos", idx, 1)} aria-label={`Move photo ${idx + 1} down`}>↓</button></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStorySection = () => (
        <div className="pe-section-card" key="story">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <h4 className="pe-section-heading" style={{ margin: 0, border: "none", paddingBottom: 0, flex: 1, minWidth: 0 }}>
                    <span className="pe-sec-icon-badge">
                        <Heart size={17} />
                    </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {uiCopy("ដំណើរនៃក្ដីស្រឡាញ់", "Our love story")}
                    </span>
                </h4>
                <label className="pe-toggle" title={uiCopy("បើក/បិទ ដំណើររឿង", "Toggle love story")} style={{ flexShrink: 0 }}>
                    <input
                        type="checkbox"
                        checked={form.showStory !== false}
                        onChange={(e) => update("showStory", e.target.checked)}
                    />
                    <span className="pe-toggle-slider" />
                </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: "12px" }}>
                    {authoredForm.storyChapters?.length || 0} {uiCopy("ដំណាក់កាល", "chapters")}
                </span>
                <button
                    type="button"
                    onClick={addStoryItem}
                    className="pe-btn-upload-action"
                    style={{
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        background: "#fffbeb",
                        borderColor: "#fde68a",
                        color: "#b45309",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}
                >
                    <Plus size={14} /> {uiCopy("បន្ថែមដំណាក់កាល", "Add chapter")}
                </button>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                {uiCopy("* បង្ហាញដំណើររឿងស្នេហាតាមពេលវេលា ដូចជាថ្ងៃដំបូងដែលជួបគ្នា ថ្ងៃសុំស្នេហ៍ ឬដំណាក់កាលសំខាន់ៗ", "* Show your love story as a timeline of your first meeting, proposal and other milestones")}
            </p>

            {form.showStory !== false && (
                <div className="pe-story-list">
                    {(authoredForm.storyChapters || []).map((item, idx) => (
                        <CleanStoryItem
                            key={item.id || `story-${idx}`}
                            idx={idx}
                            item={item}
                            onChange={(key, val) => handleStoryChange(idx, key, val)}
                            onUpload={(e) => handleStoryImageUpload(idx, e)}
                            onRemoveImage={() => handleStoryChange(idx, "image", "")}
                            onDelete={() => removeStoryItem(idx)}
                            canDelete={(authoredForm.storyChapters || []).length > 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    const renderDressCodeSection = () => (
        <div className="pe-section-card" key="dressCode">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <h4 className="pe-section-heading" style={{ margin: 0, border: "none", paddingBottom: 0, flex: 1, minWidth: 0 }}>
                    <span className="pe-sec-icon-badge">
                        <Sparkles size={17} />
                    </span>
                    <span>{flowConfig.labels.dressCodeSection || uiCopy("សម្លៀកបំពាក់", "Dress code")}</span>
                </h4>
                <label className="pe-toggle" title={uiCopy("បើក/បិទ សម្លៀកបំពាក់", "Toggle dress code")} style={{ flexShrink: 0 }}>
                    <input
                        type="checkbox"
                        checked={form.showDressCode !== false}
                        onChange={(e) => update("showDressCode", e.target.checked)}
                    />
                    <span className="pe-toggle-slider" />
                </label>
            </div>

            {form.showDressCode !== false && (
                <>
                    <div className="pe-grid-2">
                        <div className="pe-form-group">
                            <label className="pe-label">
                                <span className="pe-label-icon"><FileText size={15} /></span>
                                {uiCopy("ឈ្មោះកូដសម្លៀកបំពាក់", "Dress code name")}
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                value={authoredForm.dressCode?.name || ""}
                                onChange={(e) => handleDressCodeFieldChange("name", e.target.value)}
                                placeholder={uiCopy("ខ្មែរប្រពៃណី", "Formal Khmer")}
                            />
                        </div>
                        <div className="pe-form-group">
                            <label className="pe-label">
                                <span className="pe-label-icon"><Sparkles size={15} /></span>
                                {uiCopy("រចនាបថ", "Style")}
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                value={authoredForm.dressCode?.style || ""}
                                onChange={(e) => handleDressCodeFieldChange("style", e.target.value)}
                                placeholder={uiCopy("ប្រពៃណីដ៏ប្រណិត", "Traditional elegance")}
                            />
                        </div>
                    </div>

                    <div className="pe-form-group">
                        <label className="pe-label">
                            <span className="pe-label-icon"><FileText size={15} /></span>
                            {uiCopy("ការណែនាំសម្លៀកបំពាក់", "Dress code description")}
                        </label>
                        <textarea
                            className="pe-textarea"
                            rows="2"
                            value={authoredForm.dressCode?.description || ""}
                            onChange={(e) => handleDressCodeFieldChange("description", e.target.value)}
                            placeholder={uiCopy("សូមជ្រើសរើសសម្លៀកបំពាក់តាមពណ៌ដែលបានកំណត់ ដើម្បីបង្កើនភាពស្រស់ស្អាតនៃពិធី...", "Please choose clothing in the suggested colors for our celebration...")}
                        />
                    </div>

                    <div className="pe-form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <label className="pe-label" style={{ margin: 0 }}>
                                <span className="pe-label-icon"><Sparkles size={15} /></span>
                                {uiCopy("ក្ដារពណ៌សម្លៀកបំពាក់", "Dress code color palette")}
                            </label>
                            <button
                                type="button"
                                onClick={addDressColor}
                                className="pe-btn-upload-action"
                                style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                            >
                                <Plus size={13} /> {uiCopy("បន្ថែមពណ៌", "Add color")}
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                            {(form.dressColors || []).map((color, cIdx) => {
                                const hex = typeof color === "string" ? color : color?.hex || "#D4AF37";
                                const name = typeof color === "string" ? "" : color?.name || "";
                                return (
                                    <div
                                        key={`color-${cIdx}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            background: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "6px 8px",
                                        }}
                                    >
                                        <input
                                            type="color"
                                            value={hex}
                                            onChange={(e) => handleDressColorChange(cIdx, "hex", e.target.value)}
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "6px",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: 0,
                                                background: "transparent",
                                            }}
                                            title={uiCopy("ជ្រើសពណ៌", "Choose color")}
                                        />
                                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                                            <input
                                                type="text"
                                                className="pe-input"
                                                style={{ padding: "3px 6px", fontSize: "0.75rem", height: "auto" }}
                                                value={name}
                                                onChange={(e) => handleDressColorChange(cIdx, "name", e.target.value)}
                                                placeholder={uiCopy("ឈ្មោះពណ៌ (ឧ. មាស)", "Color name (e.g. gold)")}
                                            />
                                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "monospace" }}>
                                                {hex}
                                            </span>
                                        </div>
                                        {(form.dressColors || []).length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDressColor(cIdx)}
                                                style={{
                                                    border: "none",
                                                    background: "transparent",
                                                    color: "#94a3b8",
                                                    cursor: "pointer",
                                                    padding: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                                title={uiCopy("លុបពណ៌នេះ", "Remove color")}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderPartySection = () => (
        <div className="pe-section-card" key="party">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <h4 className="pe-section-heading" style={{ margin: 0, border: "none", paddingBottom: 0, flex: 1, minWidth: 0 }}>
                    <span className="pe-sec-icon-badge">
                        <User size={17} />
                    </span>
                    <span>{flowConfig.labels.partySection || uiCopy("មនុស្សជាទីស្រឡាញ់ ឬក្រុមអម", "Wedding party")}</span>
                </h4>
                <label className="pe-toggle" title={uiCopy("បើក/បិទ ក្រុមអម", "Toggle wedding party")} style={{ flexShrink: 0 }}>
                    <input
                        type="checkbox"
                        checked={form.showParty !== false}
                        onChange={(e) => update("showParty", e.target.checked)}
                    />
                    <span className="pe-toggle-slider" />
                </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0284c7", background: "#e0f2fe", padding: "3px 10px", borderRadius: "12px" }}>
                    {authoredForm.party?.length || 0} {uiCopy("នាក់", "people")}
                </span>
                <button
                    type="button"
                    onClick={addPartyMember}
                    className="pe-btn-upload-action"
                    style={{
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        background: "#f0f9ff",
                        borderColor: "#bae6fd",
                        color: "#0369a1",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}
                >
                    <Plus size={14} /> {uiCopy("បន្ថែមសមាជិក", "Add member")}
                </button>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                {uiCopy("* បង្ហាញកូនកំលោះកិត្តិយស កូនក្រមុំកិត្តិយស ឬក្រុមគ្រួសារ និងមិត្តភក្ដិជិតស្និទ្ធ", "* Introduce your best man, maid of honor, family and close friends")}
            </p>

            {form.showParty !== false && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(authoredForm.party || []).map((member, mIdx) => (
                        <div
                            key={member.id || `party-${mIdx}`}
                            style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                                padding: "10px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                            }}
                        >
                            <div style={{ position: "relative", width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#e2e8f0" }}>
                                {member.image ? (
                                    <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                        <User size={24} />
                                    </div>
                                )}
                                <label
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        cursor: "pointer",
                                        background: member.image ? "rgba(0,0,0,0.3)" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: member.image ? 0 : 1,
                                        transition: "opacity 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = member.image ? "0" : "1"; }}
                                    title={uiCopy("បញ្ចូលរូបថតសមាជិក", "Upload member photo")}
                                >
                                    <UploadCloud size={16} color="#fff" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => handlePartyImageUpload(mIdx, e)}
                                    />
                                </label>
                            </div>

                            <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <div>
                                    <label style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "2px" }}>{uiCopy("តួនាទី", "Role")}</label>
                                    <input
                                        type="text"
                                        className="pe-input"
                                        style={{ padding: "4px 8px", fontSize: "0.8rem", height: "auto" }}
                                        value={member.role || ""}
                                        onChange={(e) => handlePartyChange(mIdx, "role", e.target.value)}
                                        placeholder={uiCopy("កូនកំលោះកិត្តិយស", "Best man")}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "2px" }}>{uiCopy("ឈ្មោះ", "Name")}</label>
                                    <input
                                        type="text"
                                        className="pe-input"
                                        style={{ padding: "4px 8px", fontSize: "0.8rem", height: "auto" }}
                                        value={member.name || ""}
                                        onChange={(e) => handlePartyChange(mIdx, "name", e.target.value)}
                                        placeholder={uiCopy("ឈ្មោះសមាជិក", "Member name")}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => removePartyMember(mIdx)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#94a3b8",
                                    cursor: "pointer",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                                title={uiCopy("លុបសមាជិកនេះ", "Remove member")}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderFaqSection = () => (
        <div className="pe-section-card" key="faq">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <h4 className="pe-section-heading" style={{ margin: 0, border: "none", paddingBottom: 0, flex: 1, minWidth: 0 }}>
                    <span className="pe-sec-icon-badge">
                        <FileText size={17} />
                    </span>
                    <span>{flowConfig.labels.faqSection || uiCopy("សំណួរញឹកញាប់ និងចំណាំសម្រាប់ភ្ញៀវ", "Guest notes & FAQ")}</span>
                </h4>
                <label className="pe-toggle" title={uiCopy("បើក/បិទ សំណួរញឹកញាប់", "Toggle frequently asked questions")} style={{ flexShrink: 0 }}>
                    <input
                        type="checkbox"
                        checked={form.showFaq !== false}
                        onChange={(e) => update("showFaq", e.target.checked)}
                    />
                    <span className="pe-toggle-slider" />
                </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", background: "#ede9fe", padding: "3px 10px", borderRadius: "12px" }}>
                    {authoredForm.faq?.length || 0} {uiCopy("សំណួរ", "questions")}
                </span>
                <button
                    type="button"
                    onClick={addFaqItem}
                    className="pe-btn-upload-action"
                    style={{
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        background: "#f5f3ff",
                        borderColor: "#ddd6fe",
                        color: "#6d28d9",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}
                >
                    <Plus size={14} /> {uiCopy("បន្ថែមសំណួរ", "Add question")}
                </button>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                {uiCopy("* ផ្តល់ព័ត៌មានលម្អិតដូចជាចំណតយានយន្ត ការនាំកុមារតូចៗ ឬពេលវេលាកម្មវិធីដល់ភ្ញៀវ", "* Give guests details about parking, children and the event schedule")}
            </p>

            {form.showFaq !== false && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(authoredForm.faq || []).map((faqItem, fIdx) => (
                        <div
                            key={faqItem.id || `faq-${fIdx}`}
                            style={{
                                padding: "10px 12px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                                    {uiCopy("សំណួរទី", "Question")} {fIdx + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFaqItem(fIdx)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "#94a3b8",
                                        cursor: "pointer",
                                        padding: "2px",
                                    }}
                                    title={uiCopy("លុបសំណួរនេះ", "Remove question")}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                className="pe-input"
                                style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                                value={faqItem.q || ""}
                                onChange={(e) => handleFaqChange(fIdx, "q", e.target.value)}
                                placeholder={uiCopy("តើមានចំណតរថយន្ត និងម៉ូតូដែរឬទេ?", "Is there parking for cars and motorbikes?")}
                            />
                            <textarea
                                className="pe-textarea"
                                style={{ padding: "6px 10px", fontSize: "0.82rem", minHeight: "50px" }}
                                rows="2"
                                value={faqItem.a || ""}
                                onChange={(e) => handleFaqChange(fIdx, "a", e.target.value)}
                                placeholder={uiCopy("បាទ/ចាស មានចំណតធំទូលាយដោយឥតគិតថ្លៃ...", "Yes, free parking is available...")}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderKhqrSection = () => (
        <div className="pe-section-card" key="khqr">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <QrCode size={17} />
                </span>
                <span>{flowConfig.labels.khqrSection || t("secKhqr") || uiCopy("កូដសម្រាប់ផ្ញើចងដៃ", "Gift payment QR")}</span>
            </h4>

            <div className="pe-grid-2">
                {/* Dollar QR */}
                <CleanImageUploadField
                    label={t("qrDollar") || uiCopy("កូដចងដៃជាប្រាក់ដុល្លារ ($)", "USD gift QR ($)")}
                    icon={QrCode}
                    image={form.khqrDollar?.qrUrl}
                    onUpload={(e) =>
                        handleFileUpload(e, (url) =>
                            update("khqrDollar", { ...form.khqrDollar, qrUrl: url })
                        )
                    }
                    onRemove={() => update("khqrDollar", { ...form.khqrDollar, qrUrl: "" })}
                    inputRef={qrDollarInputRef}
                    hint="រូបភាព QR កូដប្រាក់ដុល្លារ ($)"
                />

                {/* Riel QR */}
                <CleanImageUploadField
                    label={t("qrRiel") || uiCopy("កូដចងដៃជាប្រាក់រៀល (៛)", "KHR gift QR")}
                    icon={QrCode}
                    image={form.khqrRiel?.qrUrl}
                    onUpload={(e) =>
                        handleFileUpload(e, (url) =>
                            update("khqrRiel", { ...form.khqrRiel, qrUrl: url })
                        )
                    }
                    onRemove={() => update("khqrRiel", { ...form.khqrRiel, qrUrl: "" })}
                    inputRef={qrRielInputRef}
                    hint="រូបភាព QR កូដប្រាក់រៀល (៛)"
                />
            </div>
        </div>
    );

    const renderClosingSection = () => (
        <div className="pe-section-card" key="closing">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <Gift size={17} />
                </span>
                <span>{flowConfig.labels.closingSection || t("secThankYou") || uiCopy("សារថ្លែងអំណរគុណ", "Thank-you message")}</span>
            </h4>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("thankYouTitle") || uiCopy("ចំណងជើងសារអរគុណ", "Thank-you title")}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    name="thankYouTitle" value={authoredForm.thankYouTitle}
                    onChange={(e) => update("thankYouTitle", e.target.value)}
                    placeholder={uiCopy("សារថ្លែងអំណរគុណ", "Thank-you message")}
                />
            </div>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Gift size={15} /></span>
                    {t("thankYouText") || uiCopy("អត្ថបទសារអរគុណ", "Thank-you message")}
                </label>
                <textarea
                    className="pe-textarea"
                    rows="4"
                    name="thankYouText" value={authoredForm.thankYouText}
                    onChange={(e) => update("thankYouText", e.target.value)}
                    placeholder={uiCopy("វត្តមាន និងពរជ័យរបស់លោកអ្នក គឺជាអំណោយដ៏មានតម្លៃសម្រាប់យើងខ្ញុំ...", "Your presence and blessings are a precious gift to us...")}
                />
            </div>

            <div style={{ margin: "20px 0 16px", borderTop: "1px dashed #e2e8f0" }} />

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("apologyTitle") || uiCopy("ចំណងជើងលិខិតសូមអភ័យទោស", "Apology title")}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    name="apologyTitle" value={authoredForm.apologyTitle}
                    onChange={(e) => update("apologyTitle", e.target.value)}
                    placeholder={uiCopy("លិខិតសូមអភ័យទោស", "Apology message")}
                />
            </div>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Heart size={15} /></span>
                    {t("apologyText") || uiCopy("អត្ថបទសូមអភ័យទោស", "Apology message")}
                </label>
                <textarea
                    className="pe-textarea"
                    rows="4"
                    name="apologyText" value={authoredForm.apologyText}
                    onChange={(e) => update("apologyText", e.target.value)}
                    placeholder={uiCopy("យើងខ្ញុំសូមអភ័យទោសក្នុងករណីពុំបានជូនសំបុត្រអញ្ជើញដោយផ្ទាល់...", "Please accept our apologies if we could not deliver your invitation in person...")}
                />
            </div>
        </div>
    );

    const renderLanguageModeSection = () => (
        <div className="pe-section-card" key="languageMode">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <Globe size={17} />
                </span>
                <span>{t("secLangMode") || uiCopy("ភាសាធៀបការ", "Invitation language")}</span>
            </h4>
            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Globe size={15} /></span>
                    {uiCopy("ភាសាបង្ហាញក្នុងសំបុត្រ", "Invitation language")}
                </label>
                <select
                    className="pe-select"
                    value={form.languageMode}
                    onChange={(e) => update("languageMode", e.target.value)}
                >
                    <option value="KH">{uiCopy("ភាសាខ្មែរ", "Khmer")}</option>
                    <option value="EN">{uiCopy("ភាសាអង់គ្លេស", "English")}</option>
                    <option value="BILINGUAL">{uiCopy("ភាសាខ្មែរ និងអង់គ្លេស", "Khmer and English")}</option>
                </select>
            </div>
        </div>
    );

    const renderWordingPresets = wordingSection => (
<div className="studio-message-presets">
                            <label>Editable wording preset<select value={wordingPresetId(wordingPreset)} onChange={e => setWordingPreset(e.target.value)}>{Object.entries(WORDING_PRESET_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                            <p>{WORDING_PRESETS[wordingPresetId(wordingPreset)][activeLangTab === 'EN' ? 'en' : 'km'][wordingSection === 'invitation' ? 'messageText' : 'thankYouText']}</p>
                            {wordingError && <p role="alert">{wordingError}</p>}
                            <p>{uiCopy("ឃ្លាអញ្ជើញគំរូ (", "Wording preset (")}{activeLangTab})</p>
                            <button type="button" onClick={() => {
                                if (!window.confirm(uiCopy("ជំនួសឃ្លានៅក្នុងផ្នែកនេះដោយឃ្លាគំរូដែលបានជ្រើសរើស?", "Replace the wording in this section with the selected preset?"))) return;
                                const locale = activeLangTab === 'EN' ? 'en' : 'km';
                                const selected = WORDING_PRESETS[wordingPresetId(wordingPreset)][locale];
                                const keys = wordingSection === 'invitation' ? ['messageTitle', 'messageText'] : ['thankYouTitle', 'thankYouText', 'apologyTitle', 'apologyText'];
                                const values = { guest_honorific: '', guest_name: authoredForm.guestName || '', groom_name: authoredForm.groomName, bride_name: authoredForm.brideName, event_date: authoredForm.eventDateText || form.eventDate, event_time: form.eventTime, venue_name: authoredForm.venueName, venue_address: authoredForm.venueAddress };
                                const resolved = keys.map(key => [key, interpolateWording(selected[key], values)]);
                                const missing = resolved.flatMap(([, result]) => result.missing);
                                if (missing.length) { setWordingError('Complete these values before applying: ' + [...new Set(missing)].join(', ')); return; }
                                setWordingError('');
                                setForm(previous => {
                                    let next = previous;
                                    for (const [key, result] of resolved) next = editLocalizedField(next, locale, key, result.text);
                                    return { ...next, localizedContentV1: { ...localeContent(next), [locale]: { ...localeContent(next)[locale], presetId: wordingPreset } } };
                                });
                            }}>{uiCopy("ប្រើឃ្លាសុភាព", "Apply formal wording")}</button>
                        </div>
    );

    const sectionRenderers = {
        eventInfo: renderEventInfoSection,
        music: renderMusicSection,
        preWeddingVideo: () => <PreWeddingVideoEditor eventId={invitation?.backendInvitationId || invitationId} value={form.preWeddingVideo} onChange={value => update("preWeddingVideo", value)} english={englishUI} />,
        appearance: () => <StudioAppearance form={form} update={update}
            supportsPalette={templateCapabilities(getTemplateById(form.templateId) || { id: form.templateId }).appearance} />,
        cover: renderCoverSection,
        family: renderFamilySection,
        invitation: renderInvitationSection,
        couplePhoto: renderCouplePhotoSection,
        countdown: renderCountdownSection,
        schedule: renderScheduleSection,
        venue: renderVenueSection,
        gallery: renderGallerySection,
        story: renderStorySection,
        dressCode: renderDressCodeSection,
        party: renderPartySection,
        faq: renderFaqSection,
        khqr: renderKhqrSection,
        closing: renderClosingSection,
        languageMode: renderLanguageModeSection,
    };

    return (
        <div ref={editorRoot} className="pe-editor-root invitation-studio" data-editor-mode={editorMode} data-guide-step={guideStep} role="main" onFocusCapture={event => {
            if (event.target.closest(".pe-editor-column") && event.target.matches("input,textarea,select,button")) lastEditorField.current = event.target;
        }} onBlurCapture={event => {
            if (event.target === lastEditorField.current) rememberEditorPosition();
        }}>

            {(() => {
                const toolbar = <StudioToolbar title={authoredForm.title} templateName={getTemplateById(form.templateId)?.name || form.templateId}
                    english={englishUI} studio={studio} saving={isSaving} publishing={isPublishing} published={published}
                    canPublish={canPublish}
                    onTemplate={() => setIsTemplateModalOpen(true)} onPreview={openPreview} previewOpen={isMobilePreviewOpen} onPublish={reviewPublication}
                    onBack={() => navigate(params.eventId ? `/app/events/${params.eventId}` : invitationId ? `/app/events/${invitationId}` : "/app/events")} />;
                const mount = params.eventId && document.getElementById("invitation-studio-toolbar");
                return mount ? createPortal(toolbar, mount) : toolbar;
            })()}
            {studio.error && <div className="studio-save-error" role="alert"><span>{studio.error}</span>{!["conflict", "expired"].includes(studio.phase) && <button type="button" onClick={() => studio.save()} disabled={isSaving}>{uiCopy("រក្សាទុកម្ដងទៀត", "Retry save")}</button>}{["conflict", "expired"].includes(studio.phase) && <><p>{uiCopy("ចម្លងអត្ថបទសំខាន់ ឬទាញយកពង្រាងនេះ មុនបើកកម្មវិធីម្ដងទៀត។", "Copy important text or download this draft before reopening the event.")}</p><button type="button" onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify(form, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "invitation-unsaved-draft.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>{uiCopy("ទាញយកពង្រាងមិនទាន់រក្សាទុក", "Download unsaved draft")}</button></>}</div>}
            <StudioGuide mode={editorMode} onMode={mode => { setEditorMode(mode); if (mode === 'guided') goToGuideStep(guideStep); }} step={guideStep} onStep={goToGuideStep} sections={flowConfig.sectionOrder} activeSection={activeSection} onSection={setSelectedSection} english={englishUI} checks={readiness} onField={completePublishField} onPreview={openPreview} onGuests={() => openEventTool("guests")} onRsvp={() => openEventTool("rsvp")} onPublish={reviewPublication} published={published} publishedUrl={publishedUrl} saving={isSaving || isPublishing} canPublish={canPublish} canManageGuests={workspace ? workspace.can?.("MANAGE_GUESTS") : true} />
            <PublishReview open={publishReviewOpen} onClose={() => setPublishReviewOpen(false)} onConfirm={publishInvitation} onCheck={checkPublication} checks={readiness} onField={completePublishField} english={englishUI} publishing={isPublishing} error={publishError} visibility={form.visibility} published={published} />
            {/* The controls and preview continue to use the original template engine. */}
            {!compactPreview && !isMobilePreviewOpen && <StudioSplitControls split={workspaceSplit} english={englishUI} />}
            <div className="pe-workspace-grid" ref={workspaceGrid} data-has-preview={!compactPreview && !isMobilePreviewOpen}>
                {editorMode === "advanced" && <StudioSections sections={flowConfig.sectionOrder} active={activeSection}
                    onChange={section => { lastEditorField.current = null; previewReturn.current = null; setSelectedSection(section); }} english={englishUI} />}
                {/* CENTER COLUMN: Existing template controls */}
                <div className="pe-editor-column">


                    {/* Neutral Language Sub-Banner */}
                    <div className="pe-lang-sub-banner">
                        <div className="pe-lang-switch-pills">
                            <button
                                type="button"
                                className={`pe-lang-pill-btn ${activeLangTab === "KH" ? "is-active" : ""}`}
                                aria-pressed={activeLangTab === "KH"} onClick={() => { setActiveLangTab("KH"); setWordingPreset(localeContent(form).km.presetId || "formal"); }}
                            >
                                <Globe size={13} /> {t("langKh") || uiCopy("ភាសាខ្មែរ", "Khmer")}
                            </button>
                            <button
                                type="button"
                                className={`pe-lang-pill-btn ${activeLangTab === "EN" ? "is-active" : ""}`}
                                aria-pressed={activeLangTab === "EN"} onClick={() => { setActiveLangTab("EN"); setWordingPreset(localeContent(form).en.presetId || "formal"); }}
                            >
                                <Globe size={13} /> {t("langEn") || uiCopy("អង់គ្លេស", "English")}
                            </button>
                        </div>
                        <span className="pe-lang-editing-indicator" role="status">
                            {activeLangTab === "KH" ? (t("editingKh") || uiCopy("កំពុងកែសម្រួល៖ ភាសាខ្មែរ", "Editing: Khmer")) : (t("editingEn") || uiCopy("កំពុងកែសម្រួល៖ អង់គ្លេស", "Editing: English"))}
                        </span>
                        <small>{activeLangTab}: {JSON.stringify(localeContent(form)[activeLangTab === 'EN' ? 'en' : 'km']) !== JSON.stringify(studio.savedValue ? localeContent(studio.savedValue)[activeLangTab === 'EN' ? 'en' : 'km'] : null) ? uiCopy('មិនទាន់រក្សាទុក', 'Unsaved') : uiCopy('បានរក្សាទុក', 'Saved')} · English: {englishReadiness.complete}/{englishReadiness.total}</small>
                        <label className="studio-inline-check"><input type="checkbox" checked={localeContent(form).enabledLocales.includes('en')}
                          disabled={!(workspace ? workspace.isOwner : true) || (!englishReadiness.ready && !localeContent(form).enabledLocales.includes('en'))}
                          onChange={e => setForm(previous => ({ ...previous, localizedContentV1: { ...localeContent(previous), enabledLocales: e.target.checked ? ['km', 'en'] : ['km'], defaultLocale: e.target.checked ? localeContent(previous).defaultLocale : 'km' } }))} />{uiCopy('ផ្សព្វផ្សាយជាភាសាអង់គ្លេស', 'Publish English version')}</label>
                        {form.localizedContentV1 && <label>Default guest language<select value={localeContent(form).defaultLocale} onChange={e => setForm(previous => ({ ...previous, localizedContentV1: { ...localeContent(previous), defaultLocale: e.target.value } }))}><option value="km">Khmer</option>{localeContent(form).enabledLocales.includes('en') && <option value="en">English</option>}</select></label>}
                        {activeLangTab === 'EN' && <button type="button" onClick={() => setForm(previous => { let next = previous; for (const key of ['groomName', 'brideName', 'hostName', 'partnerName']) next = editLocalizedField(next, 'en', key, localeContent(previous).km[key] || ''); return next; })}>Copy names from Khmer</button>}
                        {activeLangTab === 'EN' && <details><summary>{uiCopy('ត្រូវបំពេញការបកប្រែ', 'Translation fields to complete')}</summary>{englishReadiness.missing.map(key => <button type="button" key={key} onClick={() => { const section = key.startsWith('schedule.') || key.startsWith('programDays.') ? 'schedule' : key.startsWith('map.') ? 'venue' : key.startsWith('family.') || /Father|Mother/.test(key) ? 'family' : /message/i.test(key) ? 'invitation' : /thankYou|apology/.test(key) ? 'closing' : key.split('.')[0] === 'saveTheDate' ? 'countdown' : key.split('.')[0] === 'storyChapters' ? 'story' : ['faq', 'party', 'dressCode'].includes(key.split('.')[0]) ? key.split('.')[0] : 'eventInfo'; setSelectedSection(section); setExpandedSections(current => ({ ...current, [section]: true })); requestAnimationFrame(() => { const node = editorRoot.current?.querySelector(`[data-studio-section="${section}"] [name="${key}"], [data-studio-section="${section}"] input, [data-studio-section="${section}"] textarea`); node?.focus(); }); }}>{translationFieldLabel(key)}</button>)}</details>}
                    </div>

                    <div className="pe-editor-scroll-body">
                        {editorMode === "advanced" && <h2 className="studio-tab-heading">{activeStudioTab.labels[englishUI ? 1 : 0]}</h2>}
                        {activeStudioTab.sections.some(key => templateCapabilities(getTemplateById(form.templateId) || { id: form.templateId })[key] === false) && <p className="workspace-notice">{uiCopy('ផ្នែកខ្លះមិនមានក្នុងគំរូនេះទេ។ មាតិកាដែលបានសរសេរត្រូវបានរក្សាទុកសម្រាប់ពេលប្ដូរគំរូ។', 'Some sections are unavailable in this template. Your authored content stays saved for switching templates.')}</p>}
                        {editorMode === "advanced" && activeStudioTab.id !== 'ticketsQr' && !activeStudioTab.sections.some(key => flowConfig.sectionOrder.includes(key)) && <p className="workspace-notice">{uiCopy('គំរូនេះមិនបង្ហាញផ្នែកទាំងនេះទេ។ មាតិកាដែលរក្សាទុកត្រូវបានរក្សាដដែល។', 'This template does not provide these sections. Your saved content is retained.')}</p>}
                        {flowConfig.sectionOrder.map((sectionKey) => {
                            const renderer = sectionRenderers[sectionKey];
                            if (!renderer) return null;
                            const advanced = editorMode === "advanced";
                            const visible = advanced ? activeStudioTab.sections.includes(sectionKey) : sectionKey === activeSection;
                            return <div key={sectionKey} data-studio-section={sectionKey} hidden={!visible}>
                                <details className="studio-subsection" open={!advanced || (expandedSections[sectionKey] ?? sectionKey === activeSection)}
                                    onToggle={event => {
                                        if (advanced) {
                                            const open = event.currentTarget.open;
                                            setExpandedSections(current => current[sectionKey] === open ? current : { ...current, [sectionKey]: open });
                                        }
                                    }}>
                                    <summary hidden={!advanced}>{STUDIO_SECTION_LABELS[sectionKey]?.[englishUI ? 1 : 0] || sectionKey}</summary>
                                    <div className="studio-subsection-body">{["invitation", "closing"].includes(sectionKey) && renderWordingPresets(sectionKey)}{renderer()}
                                    {sectionKey === 'family' && <FamilyDesignEditor form={form} locale={activeLangTab === 'EN' ? 'en' : 'km'} onChange={update} supported={templateCapabilities(getTemplateById(form.templateId) || {}).familyLayout} />}
                                    {sectionKey === 'cover' && <MonogramEditor value={form.coupleMonogram} onChange={value => update('coupleMonogram', value)} entitled={workspace?.access?.ownerFeatures?.includes('COUPLE_MONOGRAM') === true} supported={templateCapabilities(getTemplateById(form.templateId) || {}).monogram} />}
                                    {sectionKey === 'venue' && <IllustratedMapEditor value={form.illustratedMap} onChange={value => update('illustratedMap', value)} locale={activeLangTab === 'EN' ? 'en' : 'km'} entitled={workspace?.access?.ownerFeatures?.includes('ILLUSTRATED_VENUE_MAP') === true} onUndo={studio.undo} onRedo={studio.redo} />}</div>
                                </details>
                            </div>;
                        })}
                        <section hidden={activeSection !== "ticketsQr"} className="studio-ticket-entry">
                            <h3>{uiCopy("រចនាកាត និង QR ភ្ញៀវ", "Ticket design & guest QR")}</h3>
                            <p>{uiCopy("រក្សាទុកពង្រាង មុនបើករចនាកាត ឬកាតភ្ញៀវ។ QR ប្រើសិទ្ធិចូលរួមកម្មវិធីដដែល។", "Save your draft, then customize tickets or open personalized guest tickets. QR admission keeps the existing guest identity.")}</p>
                            <button type="button" className="workspace-button primary" disabled={!workspace?.isOwner || isSaving} onClick={() => openEventTool("tickets/design")}>{uiCopy("រក្សាទុក និងរចនាកាត", "Save & open ticket designer")}</button>
                            <button type="button" className="workspace-button" disabled={!workspace?.can?.("MANAGE_GUESTS") || isSaving} onClick={() => openEventTool("guests")}>{uiCopy("រក្សាទុក និងបើកកាតភ្ញៀវ", "Save & open guest tickets")}</button>
                            {!workspace?.isOwner && <p>{uiCopy("ម្ចាស់កម្មវិធីគ្រប់គ្រងរចនាកាត។", "The event owner manages ticket appearance.")}</p>}
                        </section>
                    </div>
                </div>

                {!compactPreview && !isMobilePreviewOpen && <>
                    <div className="studio-splitter" role="separator" tabIndex={0} aria-orientation="vertical"
                        aria-label={englishUI ? 'Editor and preview size' : 'ទំហំកន្លែងកែសម្រួល និងមើលជាមុន'}
                        aria-valuemin={workspaceSplit.min} aria-valuemax={workspaceSplit.max} aria-valuenow={workspaceSplit.value}
                        aria-valuetext={englishUI ? `${workspaceSplit.value}% editor` : `${workspaceSplit.value}% កន្លែងកែសម្រួល`}
                        {...workspaceSplit.separator}><span /></div>
                    <LivePhoneSimulator data={{ ...authoredForm, googleMapUrl: previewMapUrl(form.googleMapUrl, authoredForm.venueName) }} catalogVersion={catalogVersion} onEditSection={editPreviewSection} />
                </>}
            </div>

            {/* Mobile Live Phone Simulator Overlay */}
            {isMobilePreviewOpen && (
                <Modal isOpen onClose={closePreview} size="full" className="studio-preview-sheet" title={englishUI ? "Invitation preview" : "មើលធៀបជាមុន"} closeLabel={englishUI ? "Return to editing" : "ត្រឡប់ទៅកែសម្រួល"}>
                    <div className="pe-mobile-preview-drawer">
                        <div className="pe-mobile-preview-drawer-header" hidden>
                            <span className="pe-mobile-preview-drawer-title">
                                <Maximize2 size={15} /> {t("previewTitle") || uiCopy("មើលគំរូជាមុន", "Preview template")}
                            </span>
                            <button
                                type="button"
                                className="pe-mobile-preview-close-btn"
                                onClick={closePreview}
                                aria-label={uiCopy("បិទការមើលជាមុន", "Close preview")}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pe-mobile-preview-drawer-body">
                            <LivePhoneSimulator
                                data={{
                                    ...form,
                                    googleMapUrl: previewMapUrl(form.googleMapUrl, authoredForm.venueName),
                                }}
                                catalogVersion={catalogVersion}
                                onRequestClose={closePreview}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Template Selection Modal */}
            {isTemplateModalOpen && (
                <Modal isOpen onClose={() => setIsTemplateModalOpen(false)} size="xl" title={uiCopy("ប្តូរគំរូ", "Change template")}>
                    <div className="pe-modal-card pe-tpl-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="pe-modal-header">
                            <div>
                                <h3 className="pe-modal-title">
                                    <Sparkles size={18} style={{ color: "#d97706", marginRight: 8 }} /> {uiCopy("ប្តូរគំរូធៀបការ", "Change invitation template")}
                                </h3>
                                <p className="pe-modal-subtitle">
                                    {uiCopy("ជ្រើសរើសគំរូរចនាប័ទ្មដែលអ្នកពេញចិត្តសម្រាប់ធៀបការ", "Choose your preferred invitation design")}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="pe-modal-close-btn"
                                onClick={() => setIsTemplateModalOpen(false)}
                                title={uiCopy("បិទ", "Close")}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="pe-modal-toolbar">
                            <div className="pe-modal-search-box">
                                <Search size={16} className="pe-modal-search-icon" />
                                <input
                                    type="text"
                                    className="pe-modal-search-input"
                                    placeholder={uiCopy("ស្វែងរកតាមឈ្មោះគំរូ...", "Search template names...")}
                                    value={templateSearchQuery}
                                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                                />
                                {templateSearchQuery && (
                                    <button
                                        type="button"
                                        className="pe-search-clear-btn"
                                        onClick={() => setTemplateSearchQuery("")}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="pe-modal-filter-pills">
                                {[
                                    { id: "ALL", label: uiCopy("ទាំងអស់", "All") },
                                    { id: "ADMIN", label: uiCopy("គំរូថ្មីពីអ្នកគ្រប់គ្រង", "New templates") },
                                    { id: "CURTAIN", label: uiCopy("វាំងនន", "Curtain") },
                                    { id: "ENVELOPE", label: uiCopy("ស្រោមសំបុត្របីវិមាត្រ", "3D envelope") },
                                    { id: "KHMER", label: uiCopy("ប្រពៃណីខ្មែរ", "Khmer traditional") },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`pe-filter-pill ${templateCategoryFilter === cat.id ? "is-active" : ""}`}
                                        onClick={() => setTemplateCategoryFilter(cat.id)}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Templates Grid */}
                        <div className="pe-tpl-grid-scroll">
                            <div className="pe-tpl-modal-grid">
                                {displayedTemplates.map((tpl) => {
                                    const isSelected = String(form.templateId) === String(tpl.id) || String(form.templateId) === String(tpl.code) || String(form.templateId) === String(tpl.slug);
                                    const preset = getTemplatePreset(tpl) || {};
                                    const cover = tpl.phoneCoverImage || tpl.mainImage || tpl.thumbnailUrl || preset.coverImage || tpl.image;
                                    const openingStyle = preset.openingStyle || tpl.openingStyle;
                                    return (
                                        <div
                                            key={tpl.id || tpl.code}
                                            className={`pe-tpl-card-modal ${isSelected ? "is-active" : ""}`}
                                            onClick={() => handleChangeTemplate(tpl)}
                                        >
                                            <div className="pe-tpl-thumb-box">
                                                <img
                                                    src={cover || "/facebook/all/03-card/cover-card.jpg"}
                                                    alt={tpl.name || tpl.style}
                                                    className="pe-tpl-thumb-img"
                                                    loading="lazy"
                                                />
                                                {isSelected && (
                                                    <div className="pe-tpl-active-badge">
                                                        <CheckCircle2 size={15} /> {uiCopy("កំពុងប្រើ", "In use")}
                                                    </div>
                                                )}
                                                <div className="pe-tpl-style-pill">
                                                    {openingStyle === "curtain"
                                                        ? uiCopy("វាំងនន", "Curtain gate")
                                                        : openingStyle === "envelope-3d"
                                                            ? uiCopy("ស្រោមសំបុត្របីវិមាត្រ", "3D envelope")
                                                            : (openingStyle === "celestial-cover" || tpl.code === "khmer-celestial" || tpl.id === "khmer-celestial")
                                                                ? uiCopy("ខ្មែរមេឃា", "Khmer Celestial")
                                                                : uiCopy("រាជខ្មែរ", "Khmer Royal")}
                                                </div>
                                            </div>

                                            <div className="pe-tpl-card-details">
                                                <h5 className="pe-tpl-name">{tpl.name || tpl.style}</h5>
                                                <div className="pe-tpl-footer">
                                                    <div className="pe-tpl-dots">
                                                        <span className="pe-dot" style={{ background: preset.frontColor || "#D4AF37" }} />
                                                        <span className="pe-dot" style={{ background: preset.bottomColor || "#F3E5AB" }} />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`pe-btn-select-tpl ${isSelected ? "is-selected" : ""}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleChangeTemplate(tpl);
                                                        }}
                                                    >
                                                        {isSelected ? uiCopy("បានជ្រើស ✓", "Selected ✓") : uiCopy("ជ្រើសរើស", "Select")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {displayedTemplates.length === 0 && (
                                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", gridColumn: "1 / -1" }}>
                                        <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{uiCopy("មិនមានគំរូធៀបការដែលត្រូវគ្នានឹងការស្វែងរកទេ", "No invitation templates match your search")}</p>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem" }}>{uiCopy("សូមព្យាយាមស្វែងរកដោយពាក្យគន្លឹះផ្សេងទៀត", "Try searching with different keywords")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
}
