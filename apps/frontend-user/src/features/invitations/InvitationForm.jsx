import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Music,
    Sparkles,
    Heart,
    Mail,
    Calendar,
    CalendarHeart,
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
    PenSquare,
    Map,
    CheckCircle2,
    ExternalLink,
    Zap,
    X,
    Check,
    Search,
    ArrowLeft,
    RotateCcw,
    Eye,
    ArrowRight,
} from "lucide-react";


import { toast } from "../../shared/ui/toast";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { saveDraft } from "@/shared/storage/weddingStorage";
import {
    getTemplateById,
    getTemplatePreset,
    registerDynamicTemplates,
    getCatalogVersion,
    getAllTemplates,
    resolveNumericTemplateId,
} from "../templates/data/templatesData";
import { templateCatalogService } from "../templates/api/templateCatalogApi";
import { MUSIC_TRACKS } from "../../shared/data/musicTracks";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { useAuth } from "@/features/auth/hooks/useAuth";
import LivePhoneSimulator from "./LivePhoneSimulator";
import { DatePicker } from "../../shared/ui/DatePicker";
import { TimePicker } from "../../shared/ui/TimePicker";
import SpotifyMusicPicker from "./components/SpotifyMusicPicker";
import { getTemplateFormFlow } from "./config/templateFormFlowConfig";
import "./InvitationPlanEssentialEditor.css";

function CleanImageUploadField({ label, icon: Icon, image, onUpload, onRemove, inputRef, hint = "PNG, JPG, WebP (ក្រោម 10MB)" }) {
    return (
        <div className="pe-form-group">
            <label className="pe-label">
                {Icon && <span className="pe-label-icon"><Icon size={16} /></span>}
                {label}
            </label>
            <div className="pe-clean-upload-card">
                {image ? (
                    <>
                        <div className="pe-clean-preview-box">
                            <img src={image} alt={label} />
                        </div>
                        <div className="pe-clean-actions-bar">
                            <button
                                type="button"
                                className="pe-btn-upload-action"
                                onClick={() => inputRef.current?.click()}
                            >
                                <UploadCloud size={14} /> ប្តូររូបភាព
                            </button>
                            <button
                                type="button"
                                className="pe-btn-delete-action"
                                onClick={onRemove}
                            >
                                <Trash2 size={14} /> លុប
                            </button>
                        </div>
                    </>
                ) : (
                    <div
                        className="pe-clean-dropzone"
                        onClick={() => inputRef.current?.click()}
                    >
                        <UploadCloud className="pe-clean-dropzone-icon" size={28} />
                        <span className="pe-clean-dropzone-title">ចុចទីនេះដើម្បីបញ្ចូលរូបភាព</span>
                        <span className="pe-clean-dropzone-hint">{hint}</span>
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
        </div>
    );
}

function CleanGalleryItem({ idx, photo, onUpload, onRemove, onDeleteSlot, canDeleteSlot }) {
    const inputRef = useRef(null);

    return (
        <div className="pe-gallery-item-card">
            <div className="pe-gallery-item-badge" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <ImageIcon size={14} /> រូបភាពទី {idx + 1}
                </span>
                {canDeleteSlot && (
                    <button
                        type="button"
                        onClick={onDeleteSlot}
                        title="លុបប្រអប់រូបភាពនេះ (Remove slot)"
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
                            <UploadCloud size={13} /> ប្តូរ
                        </button>
                        <button
                            type="button"
                            className="pe-btn-delete-action"
                            style={{ padding: "5px 8px", fontSize: "0.78rem" }}
                            onClick={onRemove}
                            title="ដករូបភាពនេះចេញ"
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
                    <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>ដាក់រូបទី {idx + 1}</span>
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
                    <Heart size={14} style={{ color: "#e11d48" }} /> រឿងរ៉ាវ / ដំណាក់កាលទី {idx + 1}
                </span>
                {canDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="pe-btn-delete-action"
                        style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                        title="លុបដំណាក់កាលនេះ"
                    >
                        <Trash2 size={13} /> លុប
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
                                    <UploadCloud size={12} /> ប្តូរ
                                </button>
                                <button
                                    type="button"
                                    onClick={onRemoveImage}
                                    className="pe-btn-delete-action"
                                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                    title="ដករូបភាពចេញ"
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
                            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>ដាក់រូបភាព</span>
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
                                ក្បាលរឿង (Kicker)
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                                value={item.kicker || ""}
                                onChange={(e) => onChange("kicker", e.target.value)}
                                placeholder="រឿងរ៉ាវស្នេហា"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                                កាលបរិច្ឆេទ (Date)
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                                value={item.date || ""}
                                onChange={(e) => onChange("date", e.target.value)}
                                placeholder="28 មករា 2026"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                            ចំណងជើងរឿងរ៉ាវ (Title)
                        </label>
                        <input
                            type="text"
                            className="pe-input"
                            style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                            value={item.title || ""}
                            onChange={(e) => onChange("title", e.target.value)}
                            placeholder="ដំណើររបស់យើង"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "3px" }}>
                            អត្ថបទរៀបរាប់ (Description)
                        </label>
                        <textarea
                            className="pe-textarea"
                            style={{ padding: "6px 10px", fontSize: "0.82rem", minHeight: "55px" }}
                            rows="2"
                            value={item.text || ""}
                            onChange={(e) => onChange("text", e.target.value)}
                            placeholder="រៀបរាប់ដំណើរនៃក្ដីស្រឡាញ់របស់អ្នកទាំងពីរ..."
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

const DEFAULT_THANK_YOU_TEXT = `យើងខ្ញុំទាំងពីរ សូមថ្លែងអំណរគុណ យ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តមរបស់ សម្តេច ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា ដែលបាន អញ្ជើញចូលរួមជាកិត្តិយស ក្នុងពិធីសិរីសួស្តីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំ នាពេលខាងមុខនេះ។ យើងខ្ញុំសូមការខន្តីអភ័យទោស ដែលពុំបានជូនលិខិតអញ្ជើញ ដោយផ្ទាល់ ។ ដោយការវកិច្ចដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។`;

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
    if (!val || typeof val !== "string") return "2026-01-28";
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    let standard = val;
    khmerDigits.forEach((kd, idx) => {
        standard = standard.replaceAll(kd, String(idx));
    });
    const match = standard.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
    return "2026-01-28";
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
    // Styling
    openingStyle: "khmer-royal",
    frontColor: "#f9af59",
    bottomColor: "#B08E4F",
    coverImage: null,
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
    const { text: t } = useBackendMessages("invitations");
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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

        const activeTplId = invitation?.templateId || customParsed.templateId || searchParams.get("templateId") || DEFAULT_STATE.templateId;
        const tpl = getTemplateById(activeTplId);
        const preset = getTemplatePreset(tpl) || {};

        const isDefaultGold = (customParsed.frontColor === "#f9af59" && customParsed.bottomColor === "#B08E4F") ||
            (invitation?.frontColor === "#f9af59" && invitation?.bottomColor === "#B08E4F");
        const isDefaultOpening = (customParsed.openingStyle === "khmer-royal" || invitation?.openingStyle === "khmer-royal");
        const isDefaultCover = !customParsed.coverImage || customParsed.coverImage.includes("/facebook/all/03-card/cover-card.jpg");
        const isDefaultTitle = !customParsed.title || customParsed.title === "សួនរាជហង្សខ្មែរ" || customParsed.title === "Garden Royal Khmer Wedding" || customParsed.title.includes("W01");
        const isDefaultCouple = (!customParsed.groomName || customParsed.groomName === "វណ្ណដា") && (!customParsed.brideName || customParsed.brideName === "ស្រីពេជ្រ");
        const uploadedCover = invitation?.coverUrl || invitation?.media?.coverImage?.fileUrl || "";
        const templateDefaultCover = preset.coverImage || DEFAULT_STATE.coverImage;
        const uploadedCoverFromDraft = uploadedCover || ((!isDefaultCover && customParsed.coverImage) ? customParsed.coverImage : "");

        const frontColor = (!isDefaultGold && (customParsed.frontColor || invitation?.frontColor)) || preset.frontColor || DEFAULT_STATE.frontColor;
        const bottomColor = (!isDefaultGold && (customParsed.bottomColor || invitation?.bottomColor)) || preset.bottomColor || DEFAULT_STATE.bottomColor;
        const openingStyle = (!isDefaultOpening && (customParsed.openingStyle || invitation?.openingStyle)) || preset.openingStyle || DEFAULT_STATE.openingStyle;
        const coverImage = uploadedCoverFromDraft || templateDefaultCover;
        const title = (!isDefaultTitle && (invitation?.title || customParsed.title)) ? (invitation?.title || customParsed.title) : (preset.title || DEFAULT_STATE.title);
        const groomName = (!isDefaultCouple && (invitation?.groomName || customParsed.groomName)) ? (invitation?.groomName || customParsed.groomName) : (preset.groom || DEFAULT_STATE.groomName);
        const brideName = (!isDefaultCouple && (invitation?.brideName || customParsed.brideName)) ? (invitation?.brideName || customParsed.brideName) : (preset.bride || DEFAULT_STATE.brideName);
        const venueName = (invitation?.venueName || customParsed.venueName) && (invitation?.venueName !== "The Premier Center Sen Sok" && customParsed.venueName !== "The Premier Center Sen Sok")
            ? (invitation?.venueName || customParsed.venueName)
            : (preset.venueName || DEFAULT_STATE.venueName);
        const venueAddress = (invitation?.venueAddress || customParsed.venueAddress) && (invitation?.venueAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ" && customParsed.venueAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ")
            ? (invitation?.venueAddress || customParsed.venueAddress)
            : (preset.venueAddress || DEFAULT_STATE.venueAddress);
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
            presetId: customParsed.presetId || invitation?.presetId || preset.presetId || tpl?.presetId || "",
            openingStyle,
            frontColor,
            bottomColor,
            title,
            groomName,
            brideName,
            hostName: groomName,
            partnerName: brideName,
            groomFather: customParsed.groomFather || tpl?.family?.groomParents?.[0] || tpl?.groomFather || DEFAULT_STATE.groomFather,
            groomMother: customParsed.groomMother || tpl?.family?.groomParents?.[1] || tpl?.groomMother || DEFAULT_STATE.groomMother,
            brideFather: customParsed.brideFather || tpl?.family?.brideParents?.[0] || tpl?.brideFather || DEFAULT_STATE.brideFather,
            brideMother: customParsed.brideMother || tpl?.family?.brideParents?.[1] || tpl?.brideMother || DEFAULT_STATE.brideMother,
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
            backgroundImage: customParsed.backgroundImage || invitation?.backgroundImage || preset.backgroundImage || tpl?.backgroundImage || "",
            messageText: (invitation?.storyText && invitation.storyText !== DEFAULT_INVITATION_TEXT)
                ? invitation.storyText
                : ((customParsed.messageText && customParsed.messageText !== DEFAULT_INVITATION_TEXT)
                    ? customParsed.messageText
                    : (preset.messageText || DEFAULT_STATE.messageText)),
            schedule: (customParsed.schedule && customParsed.schedule.length > 0)
                ? customParsed.schedule
                : (preset.schedule?.length ? preset.schedule : (tpl?.schedule || [])),
            dressCode: customParsed.dressCode || preset.dressCode || tpl?.dressCode || {
                name: "ខ្មែរប្រពៃណី / សម័យ",
                description: "សូមជ្រើសរើសសម្លៀកបំពាក់តាមពណ៌ដែលបានកំណត់ ដើម្បីបង្កើនភាពស្រស់ស្អាតនៃពិធី។",
                colors: preset.dressColors?.length ? preset.dressColors : (tpl?.dressColors || []),
            },
            dressColors: (customParsed.dressColors && customParsed.dressColors.length > 0)
                ? customParsed.dressColors
                : (customParsed.dressCode?.colors?.length
                    ? customParsed.dressCode.colors
                    : (preset.dressColors?.length ? preset.dressColors : (tpl?.dressColors || tpl?.dressCode?.colors || []))),
            showDressCode: customParsed.showDressCode !== undefined ? customParsed.showDressCode : (tpl?.enabledSections?.dressCode !== false),
            showCountdown: customParsed.showCountdown !== undefined ? customParsed.showCountdown : (tpl?.enabledSections?.countdown !== false),
            languageMode: invitation?.languageMode || customParsed.languageMode || "KH",
            visibility: invitation?.visibility || "PUBLIC",
            photos: (() => {
                let list = (customParsed.photos && customParsed.photos.length > 0 && customParsed.photos.some(p => p.url))
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
            storyChapters: (customParsed.storyChapters && customParsed.storyChapters.length > 0)
                ? customParsed.storyChapters
                : (preset.storyChapters?.length
                    ? preset.storyChapters
                    : (tpl?.storyChapters?.length
                        ? tpl.storyChapters
                        : (tpl?.storyText ? [{ id: "story-1", kicker: "រឿងរ៉ាវស្នេហា", title: "ដំណើររបស់យើង", date: tpl.dateText || "", text: tpl.storyText, image: tpl.phoneCoverImage || tpl.mainImage || "" }] : []))),
            showParty: customParsed.showParty !== undefined ? customParsed.showParty : (tpl?.enabledSections?.party !== false),
            party: (customParsed.party && customParsed.party.length > 0)
                ? customParsed.party
                : (invitation?.party && invitation.party.length > 0
                    ? invitation.party
                    : (preset.party?.length ? preset.party : (tpl?.party || []))),
            showFaq: customParsed.showFaq !== undefined ? customParsed.showFaq : (tpl?.enabledSections?.faq !== false),
            faq: (customParsed.faq && customParsed.faq.length > 0)
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
                backgroundImage: "",
                photos: Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, url: "" })),
                storyChapters: [],
                party: [],
            } : {}),
        };
    });

    const flowConfig = useMemo(() => getTemplateFormFlow(form.templateId), [form.templateId]);

    // Mirrors the module-level catalog counter so the live preview recomputes
    // once the async catalog fetch registers the Admin-created templates.
    const [catalogVersion, setCatalogVersion] = useState(getCatalogVersion());
    const [catalogTemplates, setCatalogTemplates] = useState(() => getAllTemplates());
    const [templateSearchQuery, setTemplateSearchQuery] = useState("");
    const [templateCategoryFilter, setTemplateCategoryFilter] = useState("ALL");

    useEffect(() => {
        let active = true;
        templateCatalogService.list()
            .then((items) => {
                if (active && items && items.length > 0) {
                    const activeTemplates = items.filter((item) => String(item.status || "ACTIVE").toUpperCase() === "ACTIVE");
                    registerDynamicTemplates(activeTemplates);
                    setCatalogTemplates(getAllTemplates());
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

    const [activeLangTab, setActiveLangTab] = useState("KH");
    const [isSaving, setIsSaving] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const [pendingCoverFile, setPendingCoverFile] = useState(null);
    const [pendingInvitationFile, setPendingInvitationFile] = useState(null);
    const [pendingInvitation2File, setPendingInvitation2File] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [leftPercent, setLeftPercent] = useState(52);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleChangeTemplate = async (template) => {
        if (!template) return;
        const preset = getTemplatePreset(template) || {};
        const currentTpl = getTemplateById(form.templateId);
        const uploadedCoverUrl = form.uploadedCoverUrl || "";

        const isPrevDefaultTitle = !form.title ||
            form.title === "សួនរាជហង្សខ្មែរ" ||
            form.title === "Garden Royal Khmer Wedding" ||
            form.title === "គំរូធៀបការ" ||
            form.title === "សិរីមង្គលអាពាហ៍ពិពាហ៍" ||
            (currentTpl && (form.title === currentTpl.name || form.title === currentTpl.style || form.title === currentTpl.title));

        const nextTitle = isPrevDefaultTitle
            ? (template.name || template.style || preset.title || "សិរីមង្គលអាពាហ៍ពិពាហ៍")
            : form.title;

        const isPrevDefaultDate = !form.eventDate || form.eventDate === "2026-11-28" || (currentTpl?.targetDate && form.eventDate === currentTpl.targetDate.split("T")[0]);
        const nextDate = isPrevDefaultDate
            ? (template.targetDate ? template.targetDate.split("T")[0] : form.eventDate || "2026-12-20")
            : form.eventDate;

        const nextForm = {
            ...form,
            templateId: template.id || template.code || template.slug || form.templateId,
            presetId: preset.presetId || template.presetId || "",
            templateDefaultCover: preset.coverImage || template.phoneCoverImage || template.mainImage || "",
            theme: template.theme || preset.theme || template.presetId || form.theme || "",
            fontFamily: template.fontFamily || preset.fontFamily || form.fontFamily || "",
            layoutStyles: template.layoutStyles || preset.layoutStyles || form.layoutStyles || {},
            openingStyle: preset.openingStyle || template.openingStyle || form.openingStyle || "khmer-royal",
            frontColor: preset.frontColor || template.frontColor || form.frontColor,
            bottomColor: preset.bottomColor || template.bottomColor || form.bottomColor,
            title: nextTitle,
            groomName: form.groomName || preset.groom || template.groom || "វណ្ណដា",
            brideName: form.brideName || preset.bride || template.bride || "ស្រីពេជ្រ",
            groomFather: form.groomFather || template.family?.groomParents?.[0] || "",
            groomMother: form.groomMother || template.family?.groomParents?.[1] || "",
            brideFather: form.brideFather || template.family?.brideParents?.[0] || "",
            brideMother: form.brideMother || template.family?.brideParents?.[1] || "",
            eventDate: nextDate,
            eventTime: form.eventTime || template.receptionTime || "17:00",
            venueName: form.venueName || preset.venueName || template.venueName || "The Premier Center Sen Sok",
            venueAddress: form.venueAddress || preset.venueAddress || template.venueAddress || "អគារ A, សែនសុខ, ភ្នំពេញ",
            schedule: (template.schedule && template.schedule.length > 0)
                ? template.schedule
                : (preset.schedule?.length ? preset.schedule : form.schedule),
            dressCode: template.dressCode || preset.dressCode || form.dressCode,
            dressColors: (template.dressColors && template.dressColors.length > 0)
                ? template.dressColors
                : (preset.dressColors?.length ? preset.dressColors : form.dressColors),
            // Sync ALL section toggles from template.enabledSections so the form
            // adapts its visible sections when the user switches templates.
            showDressCode: template.enabledSections?.dressCode !== undefined
                ? (template.enabledSections.dressCode !== false)
                : form.showDressCode,
            showCountdown: template.enabledSections?.countdown !== undefined
                ? (template.enabledSections.countdown !== false)
                : form.showCountdown,
            showStory: template.enabledSections?.story !== undefined
                ? (template.enabledSections.story !== false)
                : form.showStory,
            showParty: template.enabledSections?.party !== undefined
                ? (template.enabledSections.party !== false)
                : form.showParty,
            showFaq: template.enabledSections?.faq !== undefined
                ? (template.enabledSections.faq !== false)
                : form.showFaq,
            storyChapters: (template.storyChapters && template.storyChapters.length > 0)
                ? template.storyChapters
                : (template.storyText
                    ? [{ id: "story-1", kicker: "រឿងរ៉ាវស្នេហា", title: "ដំណើររបស់យើង", date: template.dateText || "", text: template.storyText, image: template.phoneCoverImage || template.mainImage || "" }]
                    : form.storyChapters),
            party: (template.party && template.party.length > 0)
                ? template.party
                : (preset.party?.length ? preset.party : form.party),
            faq: (template.faq && template.faq.length > 0)
                ? template.faq
                : (preset.faq?.length ? preset.faq : form.faq),
        };
        nextForm.hostName = nextForm.groomName;
        nextForm.partnerName = nextForm.brideName;
        nextForm.uploadedCoverUrl = uploadedCoverUrl;
        nextForm.coverImage = uploadedCoverUrl || nextForm.templateDefaultCover;
        setForm(nextForm);
        setCatalogVersion(getCatalogVersion());

        if (isEdit && !isNaN(Number(invitationId))) {
            try {
                const numericTemplateId = resolveNumericTemplateId(nextForm.templateId);
                await invitationService.update(invitationId, {
                    title: nextForm.title || "សិរីមង្គលអាពាហ៍ពិពាហ៍",
                    eventType: "WEDDING",
                    eventDate: nextForm.eventDate || null,
                    eventTime: nextForm.eventTime || null,
                    venueName: nextForm.venueName || "",
                    venueAddress: nextForm.venueAddress || "",
                    googleMapUrl: nextForm.googleMapUrl || "",
                    hostName: nextForm.hostName || "",
                    partnerName: nextForm.partnerName || "",
                    groomName: nextForm.groomName || "",
                    brideName: nextForm.brideName || "",
                    storyText: nextForm.messageText || "",
                    languageMode: nextForm.languageMode || "KH",
                    visibility: nextForm.visibility || "PUBLIC",
                    templateId: numericTemplateId,
                    designJson: JSON.stringify({
                        templateId: String(numericTemplateId || nextForm.templateId),
                        presetId: nextForm.presetId || "",
                        theme: nextForm.theme,
                        fontFamily: nextForm.fontFamily,
                        layoutStyles: nextForm.layoutStyles,
                        coverImage: uploadedCoverUrl || undefined,
                    }),
                    contentJson: JSON.stringify({
                        templateId: String(numericTemplateId || nextForm.templateId),
                        theme: nextForm.theme,
                        fontFamily: nextForm.fontFamily,
                        layoutStyles: nextForm.layoutStyles,
                    }),
                });
                saveDraft({ ...invitation, ...nextForm, id: invitationId, backendInvitationId: invitationId });
            } catch (error) {
                console.warn("Template selection backend sync failed:", error);
            }
        }
        setIsTemplateModalOpen(false);
    };

    // Draggable Resizer Handler
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const offset = e.clientX - rect.left;
            const newPercent = (offset / rect.width) * 100;
            const clamped = Math.min(Math.max(newPercent, 28), 76);
            setLeftPercent(clamped);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "none";
            document.body.style.cursor = "col-resize";
        } else {
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [isDragging]);

    // File input refs
    const coverInputRef = useRef(null);
    const invitationInputRef = useRef(null);
    const invitation2InputRef = useRef(null);
    const bgInputRef = useRef(null);
    const sketchInputRef = useRef(null);
    const qrDollarInputRef = useRef(null);
    const qrRielInputRef = useRef(null);

    const update = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e, callback) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type?.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const maxDim = 600;
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
                    const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
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

    // Schedule modifiers
    const handleScheduleChange = (index, key, value) => {
        const nextSchedule = [...(form.schedule || [])];
        nextSchedule[index] = { ...nextSchedule[index], [key]: value };
        update("schedule", nextSchedule);
    };

    const addScheduleItem = () => {
        const nextSchedule = [
            ...(form.schedule || []),
            { id: String(Date.now()), time: "06:00 ល្ងាច", title: "ពិធីថ្មី" },
        ];
        update("schedule", nextSchedule);
    };

    const removeScheduleItem = (index) => {
        const nextSchedule = (form.schedule || []).filter((_, i) => i !== index);
        update("schedule", nextSchedule);
    };

    // Gallery modifiers (5-10 photos)
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
            toast("អាចបន្ថែមបានអតិបរមាត្រឹម 10 រូបប៉ុណ្ណោះ (Maximum 10 photos)");
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
            toast(`បានបញ្ចូល ${dataUrls.length} រូបក្នុងវិចិត្រសាល!`);
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

    // Music Selector
    const handleMusicSelect = (trackId) => {
        const track = MUSIC_TRACKS.find((t) => t.id === trackId) || MUSIC_TRACKS[0];
        update("musicTrackId", track.id);
        update("musicUrl", track.url);
        if (audioPreviewRef.current) {
            audioPreviewRef.current.load();
            setAudioPlaying(false);
        }
    };

    const toggleAudioPreview = () => {
        if (!audioPreviewRef.current) return;
        if (audioPlaying) {
            audioPreviewRef.current.pause();
            setAudioPlaying(false);
        } else {
            audioPreviewRef.current.play().then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
        }
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
            setLocationError("ឧបករណ៍នេះមិនគាំទ្រ Location ទេ។ សូម Paste Google Maps Link។");
            return;
        }
        setIsLocating(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                update("googleMapUrl", `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`);
                setIsLocating(false);
                toast("បានយកទីតាំងបច្ចុប្បន្នរួចរាល់!");
            },
            (error) => {
                setIsLocating(false);
                setLocationError(error.code === error.PERMISSION_DENIED
                    ? "សូមអនុញ្ញាត Location ក្នុង Browser ដើម្បីប្រើមុខងារនេះ។"
                    : "មិនអាចយកទីតាំងបានទេ។ សូមពិនិត្យ GPS របស់អ្នក ឬ Paste Google Maps Link។");
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
    const handleSave = async ({ redirectToPreview = false } = {}) => {
        if (!redirectToPreview && /^https?:\/\//i.test(form.googleMapUrl || "") && !isGoogleMapsUrl(form.googleMapUrl)) {
            setLocationError("សូមបញ្ចូល Google Maps Link ត្រឹមត្រូវ (maps.google.com ឬ maps.app.goo.gl)។");
            return;
        }

        const activeTpl = getTemplateById(form.templateId);
        const activePreset = getTemplatePreset(activeTpl) || {};
        const finalGroom = String(form.groomName || "").trim() || activePreset.groom || activeTpl?.groom || "វណ្ណដា";
        const finalBride = String(form.brideName || "").trim() || activePreset.bride || activeTpl?.bride || "ស្រីពេជ្រ";
        const finalDate = String(form.eventDate || "").trim() || (activeTpl?.targetDate ? activeTpl.targetDate.split("T")[0] : "2026-03-28");
        const finalTitle = String(form.title || "").trim() || activePreset.title || activeTpl?.name || "សិរីមង្គលអាពាហ៍ពិពាហ៍";
        const finalTime = String(form.eventTime || "").trim() || activeTpl?.receptionTime || "17:00";
        const finalVenueName = String(form.venueName || "").trim() || activePreset.venueName || activeTpl?.venueName || "The Premier Center Sen Sok";
        const finalVenueAddress = String(form.venueAddress || "").trim() || activePreset.venueAddress || activeTpl?.venueAddress || "អគារ A, សែនសុខ, ភ្នំពេញ";

        if (!form.groomName || !form.brideName || !form.eventDate || !form.title) {
            setForm((prev) => ({
                ...prev,
                groomName: prev.groomName || finalGroom,
                brideName: prev.brideName || finalBride,
                hostName: prev.hostName || finalGroom,
                partnerName: prev.partnerName || finalBride,
                title: prev.title || finalTitle,
                eventDate: prev.eventDate || finalDate,
                eventTime: prev.eventTime || finalTime,
                venueName: prev.venueName || finalVenueName,
                venueAddress: prev.venueAddress || finalVenueAddress,
            }));
        }

        setIsSaving(true);
        try {
            const designPayload = {
                templateId: form.templateId,
                presetId: form.presetId || "",
                theme: form.theme || "",
                fontFamily: form.fontFamily || "",
                layoutStyles: form.layoutStyles || {},
                openingStyle: form.openingStyle || activePreset.openingStyle || "khmer-royal",
                frontColor: form.frontColor || activePreset.frontColor || "#f9af59",
                bottomColor: form.bottomColor || activePreset.bottomColor || "#B08E4F",
                coverImage: form.uploadedCoverUrl || form.coverImage || null,
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
                templateId: form.templateId,
                presetId: form.presetId || "",
                theme: form.theme || "",
                fontFamily: form.fontFamily || "",
                layoutStyles: form.layoutStyles || {},
                title: finalTitle,
                subtitle: form.subtitle || "សូមគោរពអញ្ជើញ",
                coverImage: form.uploadedCoverUrl || form.coverImage || null,
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
                gallery: (form.photos || [])
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
                title: finalTitle,
                eventType: "WEDDING",
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
                templateId: resolveNumericTemplateId(form.templateId),
                designJson: JSON.stringify(designPayload),
                contentJson: JSON.stringify(contentPayload),
                enabledSections: JSON.stringify({
                    countdown: form.showCountdown !== false,
                    story: form.showStory !== false,
                    party: form.showParty !== false,
                    dressCode: form.showDressCode !== false,
                    faq: form.showFaq !== false,
                    schedule: true,
                    map: true,
                    gallery: true,
                    gift: Boolean(form.khqrDollar?.qrUrl || form.khqrRiel?.qrUrl),
                    rsvp: true,
                    music: Boolean(form.musicUrl),
                }),
                customColors: JSON.stringify({ front: form.frontColor || activePreset.frontColor, bottom: form.bottomColor || activePreset.bottomColor }),
            };

            let saved;
            try {
                const effectiveBackendId = (!isNaN(Number(invitationId)) ? invitationId : (invitation?.backendInvitationId || (!isNaN(Number(invitation?.id)) ? invitation.id : null)));
                if (effectiveBackendId) {
                    saved = await invitationService.update(effectiveBackendId, payload);
                } else {
                    saved = await invitationService.create(payload);
                }
            } catch (apiErr) {
                console.warn("Backend sync failed, saved locally:", apiErr);
            }

            let savedCoverUrl = form.uploadedCoverUrl || "";
            let savedInvitationUrl = form.uploadedInvitationUrl || "";
            const backendId = saved?.id || (isEdit && !isNaN(Number(invitationId)) ? invitationId : (invitation?.backendInvitationId || null));
            if (pendingCoverFile && backendId) {
                const uploaded = await mediaService.uploadCover(backendId, pendingCoverFile);
                savedCoverUrl = uploaded?.fileUrl || uploaded?.data?.fileUrl || savedCoverUrl;
                setPendingCoverFile(null);
                update("coverImage", savedCoverUrl);
            }
            if (pendingInvitationFile && backendId) {
                const uploaded = await mediaService.uploadCover(backendId, pendingInvitationFile);
                savedInvitationUrl = uploaded?.fileUrl || uploaded?.data?.fileUrl || savedInvitationUrl;
                setPendingInvitationFile(null);
                update("invitationImage", savedInvitationUrl);
            }
            if (pendingInvitation2File && backendId) {
                const uploaded2 = await mediaService.uploadCover(backendId, pendingInvitation2File);
                const saved2Url = uploaded2?.fileUrl || uploaded2?.data?.fileUrl || form.invitationImage2 || "";
                setPendingInvitation2File(null);
                update("invitationImage2", saved2Url);
            }

            const targetDraftId = invitationId || saved?.id || `wed-${Date.now().toString(36)}`;

            // Always persist to local wedding draft storage
            saveDraft({
                ownerUserId: user?.id || user?.userId,
                id: targetDraftId,
                slug: saved?.slug || invitation?.slug || form.slug || "wedding",
                backendInvitationId: saved?.id || invitation?.backendInvitationId || (!isNaN(Number(invitationId)) ? Number(invitationId) : null),
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
                invitationImage: savedInvitationUrl || form.invitationImage || null,
                invitationImage2: form.invitationImage2 || null,
                templateDefaultCover: form.templateDefaultCover,
                openingStyle: form.openingStyle || activePreset.openingStyle || "khmer-royal",
                frontColor: form.frontColor || activePreset.frontColor,
                bottomColor: form.bottomColor || activePreset.bottomColor,
                schedule: form.schedule,
                photos: form.photos,
                gallery: (form.photos || [])
                    .filter((photo) => photo?.url)
                    .map(({ id, url }) => ({ id, preview: url, type: "image" })),
                musicUrl: form.musicUrl,
                message: form.messageText,
                storyChapters: form.storyChapters,
                party: form.party,
                khqrDollar: form.khqrDollar,
                khqrRiel: form.khqrRiel,
            });

            const successMsg = t("savedSuccess") || "បានរក្សាទុកដោយជោគជ័យ!";

            const finalSavedId = saved?.id || targetDraftId;
            if (redirectToPreview && finalSavedId) {
                toast(successMsg);
                navigate(`/dashboard/invitations/${finalSavedId}/preview`);
            } else {
                navigate("/dashboard/events", { state: { savedSuccess: true, message: successMsg } });
            }
            return finalSavedId;
        } catch (err) {
            toast(err.message || (t("savedError") || "មិនអាចរក្សាទុកបានទេ (Save error)"));
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    // --- Dynamic Section Renderers (Driven by templateFormFlowConfig) ---

    const renderCoverSection = () => (
        <div className="pe-section-card" key="cover">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <Sparkles size={17} />
                </span>
                <span>{flowConfig.labels.coverSection || t("secCover") || "ក្របខាងមុខ (Front Cover)"}</span>
            </h4>

            {/* Clean Cover Image Upload (Image 1) */}
            <CleanImageUploadField
                label={flowConfig.labels.coverImage || t("coverImage") || "រូបភាពក្របខាងមុខ (Front Cover Image)"}
                icon={ImageIcon}
                image={form.coverImage}
                onUpload={(e) => handleFileUpload(e, (url, file) => {
                    update("uploadedCoverUrl", url);
                    update("coverImage", url);
                    setPendingCoverFile(file);
                })}
                onRemove={() => {
                    update("uploadedCoverUrl", "");
                    update("coverImage", form.templateDefaultCover || "");
                    setPendingCoverFile(null);
                }}
                inputRef={coverInputRef}
                hint={flowConfig.hints.coverImage || "បង្ហាញលើក្របទំព័រដើម (Front Cover / Hero)"}
            />

            {/* Background Frame / Botanical Image Upload */}
            {(String(form.templateId || "").toLowerCase().includes("celestial") || Boolean(form.backgroundImage)) && (
                <div style={{ marginTop: 12 }}>
                    <CleanImageUploadField
                        label="ស៊ុមផ្កា / រូបភាពផ្ទៃខាងក្រោយ (Botanical Frame / Background Image)"
                        icon={Sparkles}
                        image={form.backgroundImage || "/invitations/khmer-celestial/botanical-frame.jpg"}
                        onUpload={(e) => handleFileUpload(e, (url) => {
                            update("backgroundImage", url);
                        })}
                        onRemove={() => {
                            update("backgroundImage", "/invitations/khmer-celestial/botanical-frame.jpg");
                        }}
                        hint="ស៊ុមផ្កាប្រណិតព័ទ្ធជុំវិញកាតធៀបការ (អាចប្តូរជារូបស៊ុមផ្ទាល់ខ្លួនបាន)"
                    />
                </div>
            )}

            {/* Main Title on Cover */}
            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("mainTitle") || "ចំណងជើងធំលើក្រប"}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="សិរីមង្គលអាពាហ៍ពិពាហ៍"
                />
            </div>

            {/* Couple Names on Cover */}
            <div className="pe-grid-2">
                <div className="pe-form-group">
                    <label className="pe-label">
                        <span className="pe-label-icon"><User size={15} /></span>
                        {t("groom") || "កូនប្រុស (Groom Name)"}
                    </label>
                    <input
                        type="text"
                        className="pe-input"
                        value={form.groomName}
                        onChange={(e) => update("groomName", e.target.value)}
                        placeholder="វណ្ណដា"
                    />
                </div>
                <div className="pe-form-group">
                    <label className="pe-label">
                        <span className="pe-label-icon"><Heart size={15} /></span>
                        {t("bride") || "កូនស្រី (Bride Name)"}
                    </label>
                    <input
                        type="text"
                        className="pe-input"
                        value={form.brideName}
                        onChange={(e) => update("brideName", e.target.value)}
                        placeholder="ស្រីពេជ្រ"
                    />
                </div>
            </div>

            {/* Wedding Logo / Calligraphy Mark Controls (Turn On / Turn Off / Custom Upload) */}
            <div style={{ padding: "14px 16px", background: "#fdfbf7", border: "1px solid #f0e6d6", borderRadius: 10, margin: "14px 0" }}>
                <div className="pe-switch-row" style={{ margin: 0, paddingBottom: form.showBrandMark !== false ? 12 : 0, borderBottom: form.showBrandMark !== false ? "1px dashed #e6dbcb" : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span className="pe-switch-label" style={{ fontWeight: 600, color: "#43250b", display: "flex", alignItems: "center", gap: 6 }}>
                            <Sparkles size={16} color="#b88a3a" />
                            បង្ហាញស្លាកឈ្មោះមាស / ឡូហ្គោ (Gold Mark / Logo)
                        </span>
                        <small style={{ color: "#786148", fontSize: "0.76rem" }}>
                            {form.showBrandMark !== false ? "កំពុងបើកបង្ហាញលើក្របទំព័រ" : "បានបិទ (បង្ហាញតែឈ្មោះគូស្នេហ៍ជាអក្សរមាស)"}
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
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                <img
                                    src={form.brandMarkUrl}
                                    alt="Custom Logo"
                                    style={{ width: 48, height: 48, objectFit: "contain", background: "#fafafa", borderRadius: 6, border: "1px solid #cbd5e1" }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#1e293b" }}>ឡូហ្គោផ្ទាល់ខ្លួន (Custom Logo)</div>
                                    <div style={{ fontSize: "0.74rem", color: "#64748b" }}>បានបញ្ចូលរូបភាពផ្ទាល់ខ្លួន</div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <label className="pe-btn-upload-cover" style={{ cursor: "pointer", padding: "4px 8px", fontSize: "0.75rem", margin: 0 }}>
                                        ប្តូរ
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
                                        title="ប្រើឡូហ្គោគំរូដើមរបស់ Template"
                                    >
                                        <RotateCcw size={13} /> គំរូដើម
                                    </button>
                                    <button
                                        type="button"
                                        className="pe-btn-del-item"
                                        style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2" }}
                                        onClick={() => update("showBrandMark", false)}
                                        title="បិទមិនបង្ហាញឡូហ្គោលើក្រប"
                                    >
                                        <X size={13} /> បិទ
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #e8decb" }}>
                                <img
                                    src="/invitations/khmer-celestial/koupreng-gold-mark.webp"
                                    alt="Template Default Logo"
                                    style={{ width: 52, height: 38, objectFit: "contain", background: "#faf7f2", borderRadius: 6, border: "1px solid #e2d7c3" }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#5c401d" }}>ឡូហ្គោគំរូដើម (Template Preset)</div>
                                    <div style={{ fontSize: "0.74rem", color: "#8a755d" }}>ស្លាកឈ្មោះមាសរបស់ Template</div>
                                </div>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <label className="pe-btn-upload-cover" style={{ cursor: "pointer", padding: "6px 10px", fontSize: "0.76rem", margin: 0, display: "inline-flex", alignItems: "center", gap: 5 }}>
                                        <UploadCloud size={14} />
                                        <span>ប្តូរជារូបផ្ទាល់ខ្លួន</span>
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
                                        title="បិទមិនបង្ហាញឡូហ្គោលើក្រប"
                                    >
                                        <X size={14} />
                                        <span>បិទ</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="pe-switch-row" style={{ margin: "4px 0 0", padding: "8px 10px", background: "rgba(255,255,255,0.7)", borderRadius: 6 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <span className="pe-switch-label" style={{ fontSize: "0.82rem" }}>{t("hideCoupleCover") || "បិទឈ្មោះកូនកំលោះ/កូនក្រមុំ (ក្របខាងលើ)"}</span>
                                <small style={{ color: "#786148", fontSize: "0.72rem" }}>* ប្រើពេលឡូហ្គោរបស់អ្នកមានឈ្មោះស្រាប់ ដើម្បីកុំឱ្យជាន់ឈ្មោះគ្នា</small>
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
                            🚫 បានបិទឡូហ្គោ (បង្ហាញតែឈ្មោះគូស្នេហ៍ជាអក្សរមាស)
                        </span>
                        <button
                            type="button"
                            className="pe-btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.74rem", borderRadius: 6, whiteSpace: "nowrap" }}
                            onClick={() => update("showBrandMark", true)}
                        >
                            បើកបង្ហាញឡើងវិញ
                        </button>
                    </div>
                )}
            </div>

            {/* Subtitle / Invitation Line on Cover */}
            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Sparkles size={15} /></span>
                    {t("subTitle") || "ចំណងជើងរងលើក្រប (Subtitle / Kicker)"}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    value={form.subtitle}
                    onChange={(e) => update("subtitle", e.target.value)}
                    placeholder="សូមគោរពអញ្ជើញ"
                />
            </div>

            {/* Event Date & Time on Cover */}
            <div className="pe-grid-2">
                <div className="pe-form-group">
                    <label className="pe-label">
                        <span className="pe-label-icon"><Calendar size={15} /></span>
                        {t("dateTime") || "កាលបរិច្ឆេទ (Event Date)"}
                    </label>
                    <DatePicker
                        value={form.eventDate}
                        onChange={(val) => {
                            update("eventDate", val);
                            update("eventDateText", val);
                        }}
                        placeholder="ជ្រើសកាលបរិច្ឆេទ"
                    />
                </div>
                <div className="pe-form-group">
                    <label className="pe-label">
                        <span className="pe-label-icon"><Clock size={15} /></span>
                        {t("timePicker") || "ម៉ោងទទួលភ្ញៀវ (Event Time)"}
                    </label>
                    <TimePicker
                        value={form.eventTime}
                        onChange={(val) => update("eventTime", val)}
                        placeholder="ជ្រើសម៉ោង"
                    />
                </div>
            </div>

            {/* Spotify-style Music Selector & Player */}
            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Music size={15} /></span>
                    {t("labelMusic") || "ជ្រើសរើសបទភ្លេង / Music Track"}
                </label>
                <SpotifyMusicPicker
                    value={form.musicTrackId || "waiting-day"}
                    onChange={(trackId, trackUrl) => {
                        update("musicTrackId", trackId);
                        update("musicUrl", trackUrl || "");
                    }}
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
                <span>{flowConfig.labels.familySection || "មាតាបិតាទាំងសងខាង (Together with our families)"}</span>
            </h4>
            <p style={{ margin: "0 0 14px 0", fontSize: "0.8rem", color: "#64748b" }}>
                {activeLangTab === "KH"
                    ? "* បញ្ចូលឈ្មោះលោកឪពុក និងអ្នកម្តាយទាំងសងខាងសម្រាប់បង្ហាញក្នុងធៀបការ"
                    : "* Enter the names of parents of both the groom and bride"}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                {/* Groom's Family */}
                <div style={{ background: "#fdfbf7", border: "1px solid #ebdcc5", borderRadius: "10px", padding: "12px" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: 700, color: "#8c6b32", display: "flex", alignItems: "center", gap: "6px" }}>
                        <User size={15} /> ខាងកូនប្រុស (Groom's Side)
                    </h5>
                    <div className="pe-form-group" style={{ marginBottom: "8px" }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>លោកឪពុក (Father)</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={form.groomFather || ""}
                            onChange={(e) => update("groomFather", e.target.value)}
                            placeholder="លោក ឃុន ស៊ីវខេង"
                        />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: 0 }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>អ្នកម្តាយ (Mother)</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={form.groomMother || ""}
                            onChange={(e) => update("groomMother", e.target.value)}
                            placeholder="លោកស្រី គុយ ដាលី"
                        />
                    </div>
                </div>

                {/* Bride's Family */}
                <div style={{ background: "#fdfbf7", border: "1px solid #ebdcc5", borderRadius: "10px", padding: "12px" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: 700, color: "#8c6b32", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Heart size={15} /> ខាងកូនស្រី (Bride's Side)
                    </h5>
                    <div className="pe-form-group" style={{ marginBottom: "8px" }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>លោកឪពុក (Father)</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={form.brideFather || ""}
                            onChange={(e) => update("brideFather", e.target.value)}
                            placeholder="លោក ឡាំ គីមឡុង"
                        />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: 0 }}>
                        <label className="pe-label" style={{ fontSize: "0.78rem" }}>អ្នកម្តាយ (Mother)</label>
                        <input
                            type="text"
                            className="pe-input"
                            value={form.brideMother || ""}
                            onChange={(e) => update("brideMother", e.target.value)}
                            placeholder="លោកស្រី ឡេង​ យ៉ុងស៊ី"
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
                <span>{flowConfig.labels.invitationSection || t("secMessage") || "សារអញ្ជើញភ្ញៀវកិត្តិយស (Invitation Message)"}</span>
            </h4>

            {/* When hasInvitationPhoto or placePhotoInInvitation is active, photo card is rendered seamlessly inside The Invitation */}
            {(flowConfig.hasInvitationPhoto || flowConfig.placePhotoInInvitation) && (
                <>
                    {/* Photo 1 */}
                    <CleanImageUploadField
                        label={flowConfig.labels.invitationImage || "រូបថតទី១ — ប្តី/ប្រពន្ធ (Portrait Photo #1)"}
                        icon={ImageIcon}
                        image={form.invitationImage || form.uploadedInvitationUrl || ""}
                        onUpload={(e) => handleFileUpload(e, (url, file) => {
                            update("uploadedInvitationUrl", url);
                            update("invitationImage", url);
                            setPendingInvitationFile(file);
                        })}
                        onRemove={() => {
                            update("uploadedInvitationUrl", "");
                            update("invitationImage", "");
                            setPendingInvitationFile(null);
                        }}
                        inputRef={invitationInputRef}
                        hint="រូបបង្ហាញក្នុង Section លិខិតអញ្ជើញ (The Invitation)"
                    />
                    {/* Photo 2 — side by side */}
                    <CleanImageUploadField
                        label="រូបថតទី២ — គូស្នេហ៍ (Portrait Photo #2 · side-by-side)"
                        icon={ImageIcon}
                        image={form.invitationImage2 || ""}
                        onUpload={(e) => handleFileUpload(e, (url, file) => {
                            update("invitationImage2", url);
                            setPendingInvitation2File(file);
                        })}
                        onRemove={() => {
                            update("invitationImage2", "");
                            setPendingInvitation2File(null);
                        }}
                        inputRef={invitation2InputRef}
                        hint="រូបបង្ហាញខាងស្ដាំ — នឹងដាក់ 2 រូបនៅក្បែរគ្នា ប្រសិនបើបំពេញ"
                    />
                </>
            )}

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("messageTitle") || "ចំណងជើងសារ (Kicker)"}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    value={form.messageTitle}
                    onChange={(e) => update("messageTitle", e.target.value)}
                    placeholder="ដំណឹងអាពាហ៍ពិពាហ៍"
                />
            </div>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Mail size={15} /></span>
                    {t("messageText") || "អត្ថបទសារអញ្ជើញ"}
                </label>
                <textarea
                    className="pe-textarea"
                    rows="6"
                    value={form.messageText}
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
                <span>{t("secCouple") || "រូបថតគូស្នេហ៍ (The Bride & Groom Photo)"}</span>
            </h4>

            <CleanImageUploadField
                label={t("backgroundImage") || "រូបថតគូស្នេហ៍ / ខាងក្នុង (Couple & Inner Photo)"}
                icon={ImageIcon}
                image={form.backgroundImage}
                onUpload={(e) => handleFileUpload(e, (url) => update("backgroundImage", url))}
                onRemove={() => update("backgroundImage", "")}
                inputRef={bgInputRef}
                hint="បង្ហាញក្នុងផ្នែកកូនកំលោះ និងកូនក្រមុំ (The Bride & Groom Card)"
            />
        </div>
    );

    const renderCountdownSection = () => (
        <div className="pe-section-card" key="countdown">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h4 className="pe-section-heading" style={{ margin: 0, flex: "1 1 auto", minWidth: 0 }}>
                    <span className="pe-sec-icon-badge">
                        <Clock size={17} />
                    </span>
                    <span>{flowConfig.labels.countdownSection || t("secCountdown") || "នាឡិការាប់ថយក្រោយ (Countdown Timer)"}</span>
                </h4>
                <label className="pe-toggle" style={{ flexShrink: 0 }} title="បើក/បិទ រាប់ថយក្រោយ">
                    <input
                        type="checkbox"
                        checked={form.showCountdown !== false}
                        onChange={(e) => update("showCountdown", e.target.checked)}
                    />
                    <span className="pe-toggle-slider" />
                </label>
            </div>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: "10px 0 0 0", lineHeight: "1.5" }}>
                គណនាចំនួន <strong>ថ្ងៃ • ម៉ោង • នាទី • វិនាទី</strong> ដោយស្វ័យប្រវត្តិតាមកាលបរិច្ឆេទនៃពិធីមង្គលការ។ (បើក ឬបិទកាតនេះបាន)
            </p>
        </div>
    );

    const renderScheduleSection = () => (
        <div className="pe-section-card" key="schedule">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 className="pe-section-heading" style={{ margin: 0 }}>
                    <span className="pe-sec-icon-badge">
                        <Clock size={17} />
                    </span>
                    <span>{flowConfig.labels.scheduleSection || t("secSchedule") || "របៀបវារៈកម្មវិធី"}</span>
                </h4>
                <button
                    type="button"
                    className="pe-btn-upload-action"
                    onClick={addScheduleItem}
                >
                    <Plus size={14} /> {t("addSchedule") || "បន្ថែមកម្មវិធី"}
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {form.schedule?.map((item, idx) => (
                    <div key={item.id || idx} className="pe-grid-2" style={{ alignItems: "center", background: "#f8f6f0", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e8e2d8", marginBottom: 0 }}>
                        <TimePicker
                            value={item.time}
                            onChange={(val) => handleScheduleChange(idx, "time", val)}
                            placeholder="ជ្រើសម៉ោង"
                        />
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                                type="text"
                                className="pe-input"
                                value={item.title}
                                onChange={(e) => handleScheduleChange(idx, "title", e.target.value)}
                                placeholder="ពិធីហែជំនូន"
                            />
                            <button
                                type="button"
                                className="pe-btn-delete-action"
                                style={{ padding: "6px 10px" }}
                                onClick={() => removeScheduleItem(idx)}
                                title="Delete item"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderVenueSection = () => (
        <div className="pe-section-card" key="venue">
            <h4 className="pe-section-heading">
                <span className="pe-sec-icon-badge">
                    <MapPin size={17} />
                </span>
                <span>{flowConfig.labels.venueSection || t("secLocation") || "ទីតាំង & ផែនទី"}</span>
            </h4>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><MapPin size={15} /></span>
                    {t("venue") || "ទីតាំងប្រារព្ធពិធី (Venue Name)"}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    value={form.venueName}
                    onChange={(e) => update("venueName", e.target.value)}
                    placeholder="The Premier Center Sen Sok"
                />
            </div>

            <div className="pe-form-group">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
                    <label className="pe-label" style={{ margin: 0 }}>
                        <span className="pe-label-icon"><MapPin size={15} /></span>
                        {t("mapsUrl") || "Google Maps Link (URL)"}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={isLocating}
                            title="យកទីតាំងបច្ចុប្បន្នរបស់អ្នក"
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
                            {isLocating ? "កំពុងស្វែងរក..." : "យកទីតាំងបច្ចុប្បន្ន"}
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerateMapLink}
                            title="បំលែងឈ្មោះទីតាំងទៅជា Link Google Maps ស្វ័យប្រវត្តិ"
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
                            បង្កើត Link ស្វ័យប្រវត្តិ
                        </button>
                        <button
                            type="button"
                            onClick={handleSearchMap}
                            title="បើកស្វែងរកលើ Google Maps ផ្ទាល់"
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
                            ស្វែងរក / តេស្តមើល
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
                    placeholder="https://maps.app.goo.gl/... ឬ ឈ្មោះទីតាំង"
                />
                {locationError && (
                    <div role="alert" style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "6px" }}>
                        {locationError}
                    </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px", lineHeight: "1.4" }}>
                    <span className="pe-location-help-mobile">ចុចប៊ូតុង 📍 ដើម្បីទាញយកទីតាំងបច្ចុប្បន្នរបស់អ្នក ឬ Paste Google Maps Link</span>
                    <span className="pe-location-help-desktop">បញ្ចូល Google Maps Link ឬស្វែងរកឈ្មោះទីតាំងរោងការ</span>
                </div>
            </div>

            <CleanImageUploadField
                label={t("sketchMap") || "រូបគំនូសប្លង់ទីតាំង (Sketch Map)"}
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
                    <span>{flowConfig.labels.gallerySection || t("secGallery") || "វិចិត្រសាលរូបថត (Gallery 5-10 រូប)"}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: "12px", marginLeft: "6px" }}>
                        {form.photos.filter((p) => Boolean(p?.url)).length} / {form.photos.length} រូប
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
                        title="ជ្រើសរើសរូបថតច្រើនសន្លឹកក្នុងពេលតែមួយ (Upload multiple photos)"
                    >
                        <UploadCloud size={14} />
                        ជ្រើសរើសរូបច្រើនសន្លឹក
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
                            title="បន្ថែមប្រអប់រូបថតថ្មី (អតិបរមា 10 រូប)"
                        >
                            <Plus size={14} /> បន្ថែមរូប ({form.photos.length}/10)
                        </button>
                    )}
                </div>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                * លោកអ្នកអាចបញ្ចូលរូបថតពី 5 ដល់ 10 សន្លឹកសម្រាប់បង្ហាញក្នុងវិចិត្រសាលធៀបការ (Can upload 5 to 10 photos)
            </p>

            <div className="pe-gallery-grid-clean">
                {form.photos.map((photo, idx) => (
                    <CleanGalleryItem
                        key={photo.id || `photo-${idx}`}
                        idx={idx}
                        photo={photo}
                        onUpload={(e) => handleFileUpload(e, (url) => updatePhoto(idx, url))}
                        onRemove={() => updatePhoto(idx, "")}
                        canDeleteSlot={form.photos.length > 5}
                        onDeleteSlot={() => removePhotoSlot(idx)}
                    />
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
                        ដំណើរនៃក្ដីស្រឡាញ់ (Our Love Story)
                    </span>
                </h4>
                <label className="pe-toggle" title="បើក/បិទ ដំណើររឿង" style={{ flexShrink: 0 }}>
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
                    {form.storyChapters?.length || 0} ដំណាក់កាល
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
                    <Plus size={14} /> បន្ថែមដំណាក់កាល
                </button>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                * បង្ហាញដំណើររឿងស្នេហាជា Timeline ដូចជា ថ្ងៃដំបូងដែលជួបគ្នា, ថ្ងៃសុំស្នេហ៍, ឬដំណាក់កាលសំខាន់ៗ
            </p>

            {form.showStory !== false && (
                <div className="pe-story-list">
                    {(form.storyChapters || []).map((item, idx) => (
                        <CleanStoryItem
                            key={item.id || `story-${idx}`}
                            idx={idx}
                            item={item}
                            onChange={(key, val) => handleStoryChange(idx, key, val)}
                            onUpload={(e) => handleStoryImageUpload(idx, e)}
                            onRemoveImage={() => handleStoryChange(idx, "image", "")}
                            onDelete={() => removeStoryItem(idx)}
                            canDelete={(form.storyChapters || []).length > 1}
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
                    <span>{flowConfig.labels.dressCodeSection || "សម្លៀកបំពាក់ (Dress Code)"}</span>
                </h4>
                <label className="pe-toggle" title="បើក/បិទ សម្លៀកបំពាក់" style={{ flexShrink: 0 }}>
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
                                ឈ្មោះកូដសម្លៀកបំពាក់ (Name)
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                value={form.dressCode?.name || ""}
                                onChange={(e) => handleDressCodeFieldChange("name", e.target.value)}
                                placeholder="ខ្មែរប្រពៃណី / Formal Khmer"
                            />
                        </div>
                        <div className="pe-form-group">
                            <label className="pe-label">
                                <span className="pe-label-icon"><Sparkles size={15} /></span>
                                រចនាបថ (Style)
                            </label>
                            <input
                                type="text"
                                className="pe-input"
                                value={form.dressCode?.style || ""}
                                onChange={(e) => handleDressCodeFieldChange("style", e.target.value)}
                                placeholder="Traditional elegance"
                            />
                        </div>
                    </div>

                    <div className="pe-form-group">
                        <label className="pe-label">
                            <span className="pe-label-icon"><FileText size={15} /></span>
                            ការណែនាំសម្លៀកបំពាក់ (Description)
                        </label>
                        <textarea
                            className="pe-textarea"
                            rows="2"
                            value={form.dressCode?.description || ""}
                            onChange={(e) => handleDressCodeFieldChange("description", e.target.value)}
                            placeholder="សូមជ្រើសរើសសម្លៀកបំពាក់តាមពណ៌ដែលបានកំណត់ ដើម្បីបង្កើនភាពស្រស់ស្អាតនៃពិធី..."
                        />
                    </div>

                    <div className="pe-form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <label className="pe-label" style={{ margin: 0 }}>
                                <span className="pe-label-icon"><Sparkles size={15} /></span>
                                ក្ដារពណ៌សម្លៀកបំពាក់ (Color Palette Swatches)
                            </label>
                            <button
                                type="button"
                                onClick={addDressColor}
                                className="pe-btn-upload-action"
                                style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                            >
                                <Plus size={13} /> បន្ថែមពណ៌
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
                                            title="ជ្រើសពណ៌"
                                        />
                                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                                            <input
                                                type="text"
                                                className="pe-input"
                                                style={{ padding: "3px 6px", fontSize: "0.75rem", height: "auto" }}
                                                value={name}
                                                onChange={(e) => handleDressColorChange(cIdx, "name", e.target.value)}
                                                placeholder="ឈ្មោះពណ៌ (e.g. មាស)"
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
                                                title="លុបពណ៌នេះ"
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
                    <span>{flowConfig.labels.partySection || "មនុស្សជាទីស្រឡាញ់ / ក្រុមអម (Wedding Party)"}</span>
                </h4>
                <label className="pe-toggle" title="បើក/បិទ ក្រុមអម" style={{ flexShrink: 0 }}>
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
                    {form.party?.length || 0} នាក់
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
                    <Plus size={14} /> បន្ថែមសមាជិក
                </button>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                * បង្ហាញកូនកំលោះកិត្តិយស (Best Man), កូនក្រមុំកិត្តិយស (Maid of Honor), ឬក្រុមគ្រួសារ និងមិត្តភក្ដិជិតស្និទ្ធ
            </p>

            {form.showParty !== false && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(form.party || []).map((member, mIdx) => (
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
                                    title="បញ្ចូលរូបថតសមាជិក"
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
                                    <label style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "2px" }}>តួនាទី (Role)</label>
                                    <input
                                        type="text"
                                        className="pe-input"
                                        style={{ padding: "4px 8px", fontSize: "0.8rem", height: "auto" }}
                                        value={member.role || ""}
                                        onChange={(e) => handlePartyChange(mIdx, "role", e.target.value)}
                                        placeholder="កូនកំលោះកិត្តិយស"
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "2px" }}>ឈ្មោះ (Name)</label>
                                    <input
                                        type="text"
                                        className="pe-input"
                                        style={{ padding: "4px 8px", fontSize: "0.8rem", height: "auto" }}
                                        value={member.name || ""}
                                        onChange={(e) => handlePartyChange(mIdx, "name", e.target.value)}
                                        placeholder="ឈ្មោះសមាជិក"
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
                                title="លុបសមាជិកនេះ"
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
                    <span>{flowConfig.labels.faqSection || "សំណួរញឹកញាប់ (Guest Notes & FAQ)"}</span>
                </h4>
                <label className="pe-toggle" title="បើក/បិទ សំណួរញឹកញាប់" style={{ flexShrink: 0 }}>
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
                    {form.faq?.length || 0} សំណួរ
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
                    <Plus size={14} /> បន្ថែមសំណួរ
                </button>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                * ផ្តល់ព័ត៌មានលម្អិតដូចជាចំណតយានយន្ត ការនាំកុមារតូចៗ ឬពេលវេលាកម្មវិធីដល់ភ្ញៀវ
            </p>

            {form.showFaq !== false && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(form.faq || []).map((faqItem, fIdx) => (
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
                                    សំណួរទី {fIdx + 1}
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
                                    title="លុបសំណួរនេះ"
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
                                placeholder="តើមានចំណតរថយន្ត និងម៉ូតូដែរឬទេ?"
                            />
                            <textarea
                                className="pe-textarea"
                                style={{ padding: "6px 10px", fontSize: "0.82rem", minHeight: "50px" }}
                                rows="2"
                                value={faqItem.a || ""}
                                onChange={(e) => handleFaqChange(fIdx, "a", e.target.value)}
                                placeholder="បាទ/ចាស មានចំណតធំទូលាយដោយឥតគិតថ្លៃ..."
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
                <span>{flowConfig.labels.khqrSection || t("secKhqr") || "KHQR ផ្ញើរចំណងដៃ"}</span>
            </h4>

            <div className="pe-grid-2">
                {/* Dollar QR */}
                <CleanImageUploadField
                    label={t("qrDollar") || "KHQR Dollar ($)"}
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
                    label={t("qrRiel") || "KHQR Riel (៛)"}
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
                <span>{flowConfig.labels.closingSection || t("secThankYou") || "សារថ្លែងអំណរគុណ"}</span>
            </h4>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("thankYouTitle") || "ចំណងជើងសារអរគុណ"}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    value={form.thankYouTitle}
                    onChange={(e) => update("thankYouTitle", e.target.value)}
                    placeholder="សារថ្លែងអំណរគុណ"
                />
            </div>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Gift size={15} /></span>
                    {t("thankYouText") || "អត្ថបទសារអរគុណ"}
                </label>
                <textarea
                    className="pe-textarea"
                    rows="4"
                    value={form.thankYouText}
                    onChange={(e) => update("thankYouText", e.target.value)}
                    placeholder="វត្តមាន និងពរជ័យរបស់លោកអ្នក គឺជាអំណោយដ៏មានតម្លៃសម្រាប់យើងខ្ញុំ..."
                />
            </div>

            <div style={{ margin: "20px 0 16px", borderTop: "1px dashed #e2e8f0" }} />

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><FileText size={15} /></span>
                    {t("apologyTitle") || "ចំណងជើងលិខិតសូមអភ័យទោស"}
                </label>
                <input
                    type="text"
                    className="pe-input"
                    value={form.apologyTitle}
                    onChange={(e) => update("apologyTitle", e.target.value)}
                    placeholder="លិខិតសូមអភ័យទោស"
                />
            </div>

            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Heart size={15} /></span>
                    {t("apologyText") || "អត្ថបទសូមអភ័យទោស"}
                </label>
                <textarea
                    className="pe-textarea"
                    rows="4"
                    value={form.apologyText}
                    onChange={(e) => update("apologyText", e.target.value)}
                    placeholder="យើងខ្ញុំសូមអភ័យទោសក្នុងករណីពុំបានជូនសំបុត្រអញ្ជើញដោយផ្ទាល់..."
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
                <span>{t("secLangMode") || "ភាសាធៀបការ"}</span>
            </h4>
            <div className="pe-form-group">
                <label className="pe-label">
                    <span className="pe-label-icon"><Globe size={15} /></span>
                    ភាសាបង្ហាញក្នុងសំបុត្រ
                </label>
                <select
                    className="pe-select"
                    value={form.languageMode}
                    onChange={(e) => update("languageMode", e.target.value)}
                >
                    <option value="KH">ភាសាខ្មែរ (Khmer)</option>
                    <option value="EN">ភាសាអង់គ្លេស (English)</option>
                    <option value="BILINGUAL">ភាសាទាំងពីរ (Bilingual Khmer + English)</option>
                </select>
            </div>
        </div>
    );

    const sectionRenderers = {
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
        <div className="pe-editor-root">

            {/* Unified Studio Header */}
            <div className="pe-sub-header-banner">
                <div className="pe-sub-header-left">
                    <button
                        type="button"
                        className="pe-btn-back"
                        onClick={() => {
                            if (location.state?.from) {
                                navigate(location.state.from);
                            } else {
                                navigate("/dashboard/events");
                            }
                        }}
                        title={t("backBtn") || "ត្រឡប់ក្រោយ"}
                    >
                        <ArrowLeft size={16} />
                        <span>{t("backBtn") || "ត្រឡប់ក្រោយ"}</span>
                    </button>
                    <span className="pe-header-divider" />
                    <span className="pe-sub-header-label">{t("myTemplate") || "គំរូ:"}</span>
                    <span className="pe-template-tag">
                        {getTemplateById(form.templateId)?.name || form.title || "គម្រោងអាពាហ៍ពិពាហ៍ W01"}
                    </span>
                    <span className="pe-status-badge">
                        <CheckCircle2 size={13} /> {t("activeBadge") || "កំពុងប្រើ"}
                    </span>
                    <button
                        type="button"
                        className="pe-btn-switch-tpl"
                        onClick={() => setIsTemplateModalOpen(true)}
                    >
                        <Sparkles size={14} /> {t("changeTemplateBtn") || "ប្តូរគំរូធៀប (Change Template)"}
                    </button>
                </div>
                <div className="pe-sub-header-actions">
                    <button
                        type="button"
                        className="pe-btn-expand-editor"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        title={isExpanded ? "មើលធម្មតា (Normal View)" : "ពង្រីកពេញ (Fullscreen View)"}
                    >
                        <Maximize2 size={15} />
                        <span>{isExpanded ? "បង្រួម" : "ពង្រីក"}</span>
                    </button>
                    <button
                        type="button"
                        className="pe-btn-mobile-preview"
                        onClick={() => setIsMobilePreviewOpen(true)}
                        aria-label="មើលគំរូ Preview"
                    >
                        <Maximize2 size={14} /> {t("previewBtn") || "មើលគំរូ"}
                    </button>
                    <button
                        type="button"
                        className="pe-save-main-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (t("saving") || "កំពុងរក្សា...") : (t("saveBtn") || "រក្សាទុក")}
                    </button>
                </div>
            </div>

            {/* Split-Screen Main Workspace */}
            <div
                ref={containerRef}
                className={`pe-workspace-grid ${isDragging ? "is-resizing" : ""}`}
                style={{
                    gridTemplateColumns: isExpanded
                        ? "1fr"
                        : `${leftPercent}% 24px 1fr`,
                }}
            >
                {/* LEFT COLUMN: Customizer Form */}
                <div className="pe-editor-column">


                    {/* Neutral Language Sub-Banner */}
                    <div className="pe-lang-sub-banner">
                        <div className="pe-lang-switch-pills">
                            <button
                                type="button"
                                className={`pe-lang-pill-btn ${activeLangTab === "KH" ? "is-active" : ""}`}
                                onClick={() => setActiveLangTab("KH")}
                            >
                                <Globe size={13} /> {t("langKh") || "ភាសាខ្មែរ"}
                            </button>
                            <button
                                type="button"
                                className={`pe-lang-pill-btn ${activeLangTab === "EN" ? "is-active" : ""}`}
                                onClick={() => setActiveLangTab("EN")}
                            >
                                <Globe size={13} /> {t("langEn") || "អង់គ្លេស"}
                            </button>
                        </div>
                        <span className="pe-lang-editing-indicator">
                            {activeLangTab === "KH" ? (t("editingKh") || "កំពុងកែសម្រួល៖ ភាសាខ្មែរ") : (t("editingEn") || "កំពុងកែសម្រួល៖ អង់គ្លេស")}
                        </span>
                    </div>

                    <div className="pe-editor-scroll-body">
                        {flowConfig.sectionOrder.map((sectionKey) => {
                            const renderer = sectionRenderers[sectionKey];
                            if (!renderer) return null;
                            return <React.Fragment key={sectionKey}>{renderer()}</React.Fragment>;
                        })}
                    </div>
                </div>

                {/* CENTER DIVIDER / RESIZER */}
                {!isExpanded && (
                    <div
                        className={`pe-workspace-divider ${isDragging ? "is-active" : ""}`}
                        onMouseDown={handleMouseDown}
                        title="អូសទៅឆ្វេង ឬស្តាំដើម្បីប្តូរទំហំ (Drag left/right to resize)"
                    >
                        <div className="pe-divider-line">
                            <button
                                type="button"
                                className="pe-divider-toggle-btn"
                                title={isExpanded ? "បង្រួម / Normal View" : "ពង្រីក / Full View"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded((prev) => !prev);
                                }}
                            >
                                {isExpanded ? "▶" : "◀"}
                            </button>
                        </div>
                    </div>
                )}

                {/* RIGHT COLUMN: Live Mobile Phone Simulation */}
                {!isExpanded && (
                    <LivePhoneSimulator
                        data={{
                            ...form,
                            googleMapUrl: previewMapUrl(form.googleMapUrl, form.venueName),
                        }}
                        catalogVersion={catalogVersion}
                    />
                )}
            </div>

            {/* Mobile Live Phone Simulator Overlay */}
            {isMobilePreviewOpen && (
                <div
                    className="pe-mobile-preview-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="មើលគំរូការ (Mobile Preview)"
                >
                    <div className="pe-mobile-preview-drawer">
                        <div className="pe-mobile-preview-drawer-header">
                            <span className="pe-mobile-preview-drawer-title">
                                <Maximize2 size={15} /> {t("previewTitle") || "មើលគំរូជាមុន"}
                            </span>
                            <button
                                type="button"
                                className="pe-mobile-preview-close-btn"
                                onClick={() => setIsMobilePreviewOpen(false)}
                                aria-label="បិទ Preview"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pe-mobile-preview-drawer-body">
                            <LivePhoneSimulator
                                data={{
                                    ...form,
                                    googleMapUrl: previewMapUrl(form.googleMapUrl, form.venueName),
                                }}
                                catalogVersion={catalogVersion}
                                onSave={handleSave}
                                isSaving={isSaving}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selection Modal */}
            {isTemplateModalOpen && (
                <div className="pe-modal-overlay" onClick={() => setIsTemplateModalOpen(false)}>
                    <div className="pe-modal-card pe-tpl-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="pe-modal-header">
                            <div>
                                <h3 className="pe-modal-title">
                                    <Sparkles size={18} style={{ color: "#d97706", marginRight: 8 }} /> ប្តូរគំរូធៀបការ (Change Template)
                                </h3>
                                <p className="pe-modal-subtitle">
                                    ជ្រើសរើសគំរូរចនាប័ទ្មដែលអ្នកពេញចិត្តសម្រាប់ធៀបការ
                                </p>
                            </div>
                            <button
                                type="button"
                                className="pe-modal-close-btn"
                                onClick={() => setIsTemplateModalOpen(false)}
                                title="បិទ"
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
                                    placeholder="ស្វែងរកតាមឈ្មោះគំរូ..."
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
                                    { id: "ALL", label: "ទាំងអស់" },
                                    { id: "ADMIN", label: "គំរូថ្មី Admin" },
                                    { id: "CURTAIN", label: "វាំងនន (Curtain)" },
                                    { id: "ENVELOPE", label: "ស្រោមសំបុត្រ 3D" },
                                    { id: "KHMER", label: "ប្រពៃណីខ្មែរ" },
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
                                                        <CheckCircle2 size={15} /> កំពុងប្រើ
                                                    </div>
                                                )}
                                                <div className="pe-tpl-style-pill">
                                                    {openingStyle === "curtain"
                                                        ? "Curtain Gate"
                                                        : openingStyle === "envelope-3d"
                                                            ? "Envelope 3D"
                                                            : (openingStyle === "celestial-cover" || tpl.code === "khmer-celestial" || tpl.id === "khmer-celestial")
                                                                ? "Khmer Celestial"
                                                                : "Khmer Royal"}
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
                                                        {isSelected ? "បានជ្រើស ✓" : "ជ្រើសរើស"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {displayedTemplates.length === 0 && (
                                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", gridColumn: "1 / -1" }}>
                                        <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>មិនមានគំរូធៀបការដែលត្រូវគ្នានឹងការស្វែងរកទេ</p>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem" }}>សូមព្យាយាមស្វែងរកដោយពាក្យគន្លឹះផ្សេងទៀត</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
