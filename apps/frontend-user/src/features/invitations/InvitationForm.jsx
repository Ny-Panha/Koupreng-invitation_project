import { useEffect, useRef, useState } from "react";
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
    PenSquare,
    Map,
    CheckCircle2,
    Users,
} from "lucide-react";


import { toast } from "../../shared/ui/toast";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { getTemplateById } from "../templates/data/templatesData";
import { MUSIC_TRACKS } from "../../shared/data/musicTracks";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import LivePhoneSimulator from "./LivePhoneSimulator";
import { DatePicker } from "../../shared/ui/DatePicker";
import { TimePicker } from "../../shared/ui/TimePicker";
import SpotifyMusicPicker from "./components/SpotifyMusicPicker";
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

function CleanPartyMemberItem({ idx, item, onChange, onUpload, onRemoveImage, onDelete, canDelete }) {
    const fileInputRef = useRef(null);

    return (
        <div className="pe-party-item-card" style={{
            background: "#faf8f5",
            border: "1px solid #e8e2d8",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "12px",
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            position: "relative"
        }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                {item?.image ? (
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid #B08E4F",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        background: "#fff"
                    }}>
                        <img src={item.image} alt={item.name || `Member ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                ) : (
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            border: "2px dashed #d1c7b7",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            background: "#fff"
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud size={18} style={{ color: "#94a3b8" }} />
                        <span style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: "2px" }}>រូបថត</span>
                    </div>
                )}
                <div style={{ display: "flex", gap: "4px" }}>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            color: "#475569"
                        }}
                    >
                        {item?.image ? "ប្តូរ" : "ដាក់រូប"}
                    </button>
                    {item?.image && (
                        <button
                            type="button"
                            onClick={onRemoveImage}
                            style={{
                                border: "1px solid #fee2e2",
                                background: "#fff",
                                borderRadius: "4px",
                                padding: "2px 6px",
                                fontSize: "0.7rem",
                                cursor: "pointer",
                                color: "#ef4444"
                            }}
                        >
                            លុប
                        </button>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={onUpload}
                />
            </div>

            <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#854d0e" }}>
                        សមាជិកទី {idx + 1}
                    </span>
                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#ef4444",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "0.75rem"
                            }}
                        >
                            <Trash2 size={13} /> ដកចេញ
                        </button>
                    )}
                </div>

                <div className="pe-grid-2" style={{ gap: "8px" }}>
                    <div>
                        <label style={{ fontSize: "0.73rem", color: "#64748b", display: "block", marginBottom: "3px" }}>
                            ឈ្មោះ (Name)
                        </label>
                        <input
                            type="text"
                            className="pe-input"
                            style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                            placeholder="ឧ. សុខ វិបុល"
                            value={item.name || ""}
                            onChange={(e) => onChange("name", e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.73rem", color: "#64748b", display: "block", marginBottom: "3px" }}>
                            តួនាទី (Role)
                        </label>
                        <input
                            type="text"
                            className="pe-input"
                            style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                            placeholder="ឧ. កូនកំលោះកិត្តិយស"
                            value={item.role || ""}
                            onChange={(e) => onChange("role", e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: "0.73rem", color: "#64748b", display: "block", marginBottom: "3px" }}>
                        តួនាទីជាអង់គ្លេស (Role in English)
                    </label>
                    <input
                        type="text"
                        className="pe-input"
                        style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                        placeholder="ឧ. Best Man, Maid of Honor, Family"
                        value={item.roleEn || ""}
                        onChange={(e) => onChange("roleEn", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

const DEFAULT_PARTY = [
    { id: "party-1", role: "កូនកំលោះកិត្តិយស", roleEn: "Best Man", name: "សុខ វិបុល", image: "/facebook/all/02-card/02-04.jpg" },
    { id: "party-2", role: "កូនក្រមុំកិត្តិយស", roleEn: "Maid of Honor", name: "ចាន់ ស្រីនិច", image: "/facebook/all/02-card/02-06.jpg" },
    { id: "party-3", role: "គ្រួសារ", roleEn: "Family", name: "ឪពុកម្ដាយទាំងសងខាង", image: "/facebook/all/03-card/03-03.jpg" },
    { id: "party-4", role: "មិត្តភក្ដិ", roleEn: "Friends", name: "ក្រុមមិត្តជិតស្និទ្ធ", image: "/facebook/all/03-card/03-05.jpg" },
];

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

const DEFAULT_STATE = {
    templateId: "garden-royal-khmer-wedding",
    language: "KH",
    title: "សួនរាជហង្សខ្មែរ",
    subtitle: "សូមគោរពអញ្ជើញ",
    hideCoupleNameOnCover: false,
    eventDateText: "ថ្ងៃពុធ ២៨ មករា ២០២៦",
    eventDate: "2026-01-28",
    eventTime: "17:00",
    venueName: "The Premier Center Sen Sok",
    venueAddress: "អគារ A, សែនសុខ, ភ្នំពេញ",
    googleMapUrl: "",
    hostName: "វណ្ណដា",
    partnerName: "ស្រីពេជ្រ",
    groomName: "វណ្ណដា",
    brideName: "ស្រីពេជ្រ",
    guestName: "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា",
    messageTitle: "ដំណឹងអាពាហ៍ពិពាហ៍",
    messageText: DEFAULT_INVITATION_TEXT,
    schedule: [],
    // Styling
    openingStyle: "khmer-royal",
    frontColor: "#f9af59",
    bottomColor: "#B08E4F",
    coverImage: "/facebook/all/03-card/cover-card.jpg",
    backgroundImage: "/facebook/all/03-card/cover-card.jpg",
    sketchMapImage: null,
    // Gallery (5-10 photos)
    photos: [
        { id: "p1", url: "/facebook/all/03-card/03-01.jpg" },
        { id: "p2", url: "/facebook/all/03-card/03-02.jpg" },
        { id: "p3", url: "/facebook/all/03-card/03-03.jpg" },
        { id: "p4", url: "/facebook/all/03-card/03-04.jpg" },
        { id: "p5", url: "" },
    ],
    // Love Story (ដំណើរនៃក្ដីស្រឡាញ់ - no limit)
    showStory: true,
    storyChapters: [
        {
            id: "story-1",
            image: "/facebook/all/03-card/03-01.jpg",
            kicker: "រឿងរ៉ាវស្នេហា",
            title: "ដំណើររបស់យើង",
            date: "Wednesday, January 28, 2026",
            text: "ថ្ងៃដែលយើងបានជួបគ្នា និងការចាប់ផ្តើមនៃក្តីស្រឡាញ់ដ៏ស្រស់ស្អាត...",
        },
    ],
    // Family & Wedding Party (គ្រួសារ និង ក្រុមអម)
    showParty: true,
    party: DEFAULT_PARTY,
    // Thank you
    thankYouTitle: "សារថ្លែងអំណរគុណ",
    thankYouText: DEFAULT_THANK_YOU_TEXT,
    // KHQR
    khqrDollar: { qrUrl: "", bankName: "KHQR Dollar ($)", accountNumber: "" },
    khqrRiel: { qrUrl: "", bankName: "KHQR Riel (៛)", accountNumber: "" },
    // Music
    musicTrackId: "waiting-day",
    musicUrl: MUSIC_TRACKS[0]?.url || "",
    // Extra
    languageMode: "KH",
    visibility: "PUBLIC",
};

export default function InvitationForm({ invitation }) {
    const { text: t } = useBackendMessages("invitations");
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

        const activeTplId = invitation?.templateId || customParsed.templateId || searchParams.get("templateId") || DEFAULT_STATE.templateId;
        const tpl = getTemplateById(activeTplId);

        const rawDate = invitation?.eventDate || customParsed.eventDate || DEFAULT_STATE.eventDate;
        const rawTime = invitation?.eventTime ? invitation.eventTime.slice(0, 5) : (customParsed.eventTime || tpl?.receptionTime || DEFAULT_STATE.eventTime);

        return {
            ...DEFAULT_STATE,
            templateId: activeTplId,
            openingStyle: customParsed.openingStyle || invitation?.openingStyle || tpl?.design?.openingStyle || DEFAULT_STATE.openingStyle,
            title: invitation?.title || customParsed.title || tpl?.name || DEFAULT_STATE.title,
            groomName: invitation?.groomName || customParsed.groomName || tpl?.groom || DEFAULT_STATE.groomName,
            brideName: invitation?.brideName || customParsed.brideName || tpl?.bride || DEFAULT_STATE.brideName,
            hostName: invitation?.hostName || customParsed.hostName || tpl?.groom || DEFAULT_STATE.groomName,
            partnerName: invitation?.partnerName || customParsed.partnerName || tpl?.bride || DEFAULT_STATE.brideName,
            eventDate: toStandardDate(rawDate),
            eventDateText: customParsed.eventDateText || tpl?.dateText || DEFAULT_STATE.eventDateText,
            eventTime: toStandardTime(rawTime),
            venueName: invitation?.venueName || customParsed.venueName || tpl?.venueName || DEFAULT_STATE.venueName,
            venueAddress: invitation?.venueAddress || customParsed.venueAddress || tpl?.venueAddress || DEFAULT_STATE.venueAddress,
            googleMapUrl: invitation?.googleMapUrl || customParsed.googleMapUrl || tpl?.mapQuery || "",
            coverImage: customParsed.coverImage || tpl?.phoneCoverImage || tpl?.mainImage || DEFAULT_STATE.coverImage,
            messageText: invitation?.storyText || customParsed.messageText || tpl?.message || DEFAULT_STATE.messageText,
            schedule: (customParsed.schedule && customParsed.schedule.length > 0) ? customParsed.schedule : (tpl?.schedule || []),
            languageMode: invitation?.languageMode || customParsed.languageMode || "KH",
            visibility: invitation?.visibility || "PUBLIC",
            ...customParsed,
            photos: (() => {
                let list = (customParsed.photos && customParsed.photos.length > 0 && customParsed.photos.some(p => p.url))
                    ? [...customParsed.photos]
                    : (tpl?.galleryImages && tpl.galleryImages.length > 0
                        ? tpl.galleryImages.map((url, i) => ({ id: `p${i + 1}`, url }))
                        : [...DEFAULT_STATE.photos]);
                while (list.length < 5) {
                    list.push({ id: `p${list.length + 1}`, url: "" });
                }
                if (list.length > 10) {
                    list = list.slice(0, 10);
                }
                return list;
            })(),
            showStory: customParsed.showStory !== undefined ? customParsed.showStory : true,
            storyChapters: (customParsed.storyChapters && customParsed.storyChapters.length > 0)
                ? customParsed.storyChapters
                : DEFAULT_STATE.storyChapters,
            showParty: customParsed.showParty !== undefined ? customParsed.showParty : true,
            party: (customParsed.party && customParsed.party.length > 0)
                ? customParsed.party
                : (invitation?.party && invitation.party.length > 0)
                    ? invitation.party
                    : DEFAULT_PARTY,
        };
    });

    const [activeLangTab, setActiveLangTab] = useState("KH");
    const [isSaving, setIsSaving] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [leftPercent, setLeftPercent] = useState(52);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

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
        const reader = new FileReader();
        reader.onload = (event) => {
            callback(event.target.result);
        };
        reader.readAsDataURL(file);
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

    // Party modifiers
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
                role: "មិត្តភក្តិ",
                roleEn: "Friends",
                name: "",
                image: "",
            },
        ];
        update("party", nextParty);
    };

    const removePartyMember = (index) => {
        const nextParty = (form.party || []).filter((_, i) => i !== index);
        update("party", nextParty);
    };

    // Save action
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const designPayload = {
                openingStyle: form.openingStyle || "khmer-royal",
                frontColor: form.frontColor,
                bottomColor: form.bottomColor,
                coverImage: form.coverImage,
                backgroundImage: form.backgroundImage,
                sketchMapImage: form.sketchMapImage,
                photos: form.photos,
                showStory: form.showStory !== false,
                storyChapters: form.storyChapters || [],
                showParty: form.showParty !== false,
                party: form.party || [],
                khqrDollar: form.khqrDollar,
                khqrRiel: form.khqrRiel,
                musicTrackId: form.musicTrackId,
                musicUrl: form.musicUrl,
            };

            const contentPayload = {
                subtitle: form.subtitle,
                hideCoupleNameOnCover: form.hideCoupleNameOnCover,
                eventDateText: form.eventDateText,
                guestName: form.guestName,
                messageTitle: form.messageTitle,
                messageText: form.messageText,
                schedule: form.schedule,
                showStory: form.showStory !== false,
                storyChapters: form.storyChapters || [],
                showParty: form.showParty !== false,
                party: form.party || [],
                thankYouTitle: form.thankYouTitle,
                thankYouText: form.thankYouText,
            };

            const payload = {
                title: form.title || "សិរីមង្គលអាពាហ៍ពិពាហ៍",
                eventType: "WEDDING",
                eventDate: form.eventDate || null,
                eventTime: form.eventTime || null,
                venueName: form.venueName || "",
                venueAddress: form.venueAddress || "",
                googleMapUrl: form.googleMapUrl || "",
                hostName: form.hostName || "",
                partnerName: form.partnerName || "",
                groomName: form.groomName || "",
                brideName: form.brideName || "",
                storyText: form.messageText || "",
                languageMode: form.languageMode || "KH",
                visibility: form.visibility || "PUBLIC",
                templateId: Number(form.templateId) || null,
                designJson: JSON.stringify(designPayload),
                contentJson: JSON.stringify(contentPayload),
                customColors: JSON.stringify({ front: form.frontColor, bottom: form.bottomColor }),
            };

            let saved;
            if (isEdit) {
                saved = await invitationService.update(invitationId, payload);
            } else {
                saved = await invitationService.create(payload);
            }

            toast(t("savedSuccess") || "បានរក្សាទុកគំរូធៀបដោយជោគជ័យ! (Saved successfully)");

            if (!isEdit && saved?.id) {
                navigate(`/dashboard/invitations/${saved.id}/edit`, { replace: true });
            }
        } catch (err) {
            toast(err.message || (t("savedError") || "មិនអាចរក្សាទុកបានទេ (Save error)"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pe-editor-root">

            {/* Sub-Header Banner */}
            <div className="pe-sub-header-banner">
                <div className="pe-sub-header-left">
                    <span className="pe-sub-header-label">{t("myTemplate") || "គំរូរបស់ខ្ញុំ:"}</span>
                    <span className="pe-template-tag">
                        {getTemplateById(form.templateId)?.name || form.title || "គម្រោងអាពាហ៍ពិពាហ៍ (រចនាប័ទ្ម) W01"}
                    </span>
                    <span className="pe-status-badge">
                        <CheckCircle2 size={14} /> {t("activeBadge") || "កំពុងប្រើ"}
                    </span>
                </div>
                <div className="pe-sub-header-actions">
                    <button
                        type="button"
                        className="pe-btn-outline"
                        onClick={() => navigate("/dashboard")}
                    >
                        {t("backBtn") || "ត្រឡប់ក្រោយ"}
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
                    {/* Dark Navy Header Bar */}
                    <div className="pe-editor-header-bar">
                        <h3 className="pe-editor-header-title">
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <PenSquare size={18} style={{ color: "#d97706" }} />
                                {t("editorTitle") || "កម្មវិធីកែសម្រួល"}
                            </span>
                        </h3>
                        <button
                            type="button"
                            className="pe-editor-header-icon-btn"
                            onClick={() => setIsExpanded((prev) => !prev)}
                            title={isExpanded ? "Normal View" : "Fullscreen View"}
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>

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
                        {/* 1. ក្របខាងមុខ (Front Cover / Hero - ត្រូវនឹងទំព័រមុខក្នុង Live Preview) */}
                        <div className="pe-section-card">
                            <h4 className="pe-section-heading">
                                <span className="pe-sec-icon-badge">
                                    <Sparkles size={17} />
                                </span>
                                <span>{t("secCover") || "ក្របខាងមុខ (Front Cover)"}</span>
                            </h4>

                            {/* Clean Cover Image Upload */}
                            <CleanImageUploadField
                                label={t("coverImage") || "រូបភាពក្របខាងមុខ (Front Cover Image)"}
                                icon={ImageIcon}
                                image={form.coverImage}
                                onUpload={(e) => handleFileUpload(e, (url) => update("coverImage", url))}
                                onRemove={() => update("coverImage", "")}
                                inputRef={coverInputRef}
                                hint="បង្ហាញលើក្របទំព័រដើម (Front Cover / Hero)"
                            />

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

                            {/* Switch to hide names on top cover */}
                            <div className="pe-switch-row">
                                <span className="pe-switch-label">{t("hideCoupleCover") || "បិទឈ្មោះកូនកំលោះ/កូនក្រមុំ (ក្របខាងលើ)"}</span>
                                <label className="pe-toggle">
                                    <input
                                        type="checkbox"
                                        checked={form.hideCoupleNameOnCover}
                                        onChange={(e) => update("hideCoupleNameOnCover", e.target.checked)}
                                    />
                                    <span className="pe-toggle-slider" />
                                </label>
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

                        {/* 2. សារអញ្ជើញភ្ញៀវ (Invitation Message - Screen 2 ក្នុង Live Preview) */}
                        <div className="pe-section-card">
                            <h4 className="pe-section-heading">
                                <span className="pe-sec-icon-badge">
                                    <Mail size={17} />
                                </span>
                                <span>{t("secMessage") || "សារអញ្ជើញភ្ញៀវកិត្តិយស (Invitation Message)"}</span>
                            </h4>

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

                        {/* 3. រូបថតគូស្នេហ៍ (The Bride & Groom - Screen 3 ក្នុង Live Preview) */}
                        <div className="pe-section-card">
                            <h4 className="pe-section-heading">
                                <span className="pe-sec-icon-badge">
                                    <Heart size={17} />
                                </span>
                                <span>{t("secCouple") || "រូបថតគូស្នេហ៍ (The Bride & Groom Photo)"}</span>
                            </h4>

                            {/* Clean Couple / Background Image Upload */}
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

                        {/* 4. នាឡិការាប់ថយក្រោយ (Countdown Timer - ត្រូវគ្នានឹងផ្ទាំង Preview) */}
                        <div className="pe-section-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h4 className="pe-section-heading" style={{ margin: 0 }}>
                                    <span className="pe-sec-icon-badge">
                                        <Clock size={17} />
                                    </span>
                                    <span>{t("secCountdown") || "នាឡិការាប់ថយក្រោយ (Countdown Timer)"}</span>
                                </h4>
                                <label className="pe-toggle" title="បើក/បិទ រាប់ថយក្រោយ">
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

                        {/* 5. របៀបវារៈកម្មវិធី (Program & Schedule - Screen 5 ក្នុង Live Preview) */}
                        <div className="pe-section-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h4 className="pe-section-heading" style={{ margin: 0 }}>
                                    <span className="pe-sec-icon-badge">
                                        <Clock size={17} />
                                    </span>
                                    <span>{t("secSchedule") || "របៀបវារៈកម្មវិធី"}</span>
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
                                    <div key={item.id || idx} className="pe-grid-2" style={{ alignItems: "center", background: "#f8f6f0", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e8e2d8" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Clock size={15} style={{ color: "#c51c35", flexShrink: 0 }} />
                                            <input
                                                type="text"
                                                className="pe-input"
                                                value={item.time}
                                                onChange={(e) => handleScheduleChange(idx, "time", e.target.value)}
                                                placeholder="07:00 ព្រឹក"
                                            />
                                        </div>
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

                        {/* 5. ទីតាំង & ផែនទី (Venue & Location - Screen 5 ក្នុង Live Preview) */}
                        <div className="pe-section-card">
                            <h4 className="pe-section-heading">
                                <span className="pe-sec-icon-badge">
                                    <MapPin size={17} />
                                </span>
                                <span>{t("secLocation") || "ទីតាំង & ផែនទី"}</span>
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
                                <label className="pe-label">
                                    <span className="pe-label-icon"><MapPin size={15} /></span>
                                    {t("mapsUrl") || "Google Maps Link (URL)"}
                                </label>
                                <input
                                    type="url"
                                    className="pe-input"
                                    value={form.googleMapUrl}
                                    onChange={(e) => update("googleMapUrl", e.target.value)}
                                    placeholder="https://maps.app.goo.gl/..."
                                />
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

                        {/* 6. វិចិត្រសាលរូបថត (Photo Gallery 5-10 Photos - Screen 6 ក្នុង Live Preview) */}
                        <div className="pe-section-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                                <h4 className="pe-section-heading" style={{ margin: 0 }}>
                                    <span className="pe-sec-icon-badge">
                                        <Images size={17} />
                                    </span>
                                    <span>{t("secGallery") || "វិចិត្រសាលរូបថត (Gallery 5-10 រូប)"}</span>
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

                        {/* 7. ដំណើរនៃក្ដីស្រឡាញ់ (Our Love Story - No limit image uploading) */}
                        <div className="pe-section-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                                <h4 className="pe-section-heading" style={{ margin: 0 }}>
                                    <span className="pe-sec-icon-badge">
                                        <Heart size={17} />
                                    </span>
                                    <span>ដំណើរនៃក្ដីស្រឡាញ់ (Our Love Story)</span>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e11d48", background: "#ffe4e6", padding: "2px 8px", borderRadius: "12px", marginLeft: "6px" }}>
                                        {form.storyChapters?.length || 0} រឿងរ៉ាវ (No Limit)
                                    </span>
                                </h4>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button
                                        type="button"
                                        onClick={addStoryItem}
                                        className="pe-btn-upload-action"
                                        style={{
                                            padding: "6px 12px",
                                            fontSize: "0.8rem",
                                            background: "#fff1f2",
                                            borderColor: "#fecdd3",
                                            color: "#be123c",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}
                                        title="បន្ថែមដំណាក់កាលរឿងរ៉ាវថ្មី (គ្មានកំណត់ចំនួន)"
                                    >
                                        <Plus size={14} /> បន្ថែមរឿងរ៉ាវ
                                    </button>

                                    <label className="pe-toggle" title="បើក/បិទ ដំណើរនៃក្ដីស្រឡាញ់">
                                        <input
                                            type="checkbox"
                                            checked={form.showStory !== false}
                                            onChange={(e) => update("showStory", e.target.checked)}
                                        />
                                        <span className="pe-toggle-slider" />
                                    </label>
                                </div>
                            </div>

                            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                                * អាចបញ្ចូលរូបភាព និងរៀបរាប់ដំណាក់កាលនៃក្ដីស្រឡាញ់ដោយគ្មានដែនកំណត់ (Upload story milestones & images with no limit)
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

                        {/* 8. គ្រួសារ និង ក្រុមអម (Family & Wedding Party) */}
                        <div className="pe-section-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                                <h4 className="pe-section-heading" style={{ margin: 0 }}>
                                    <span className="pe-sec-icon-badge">
                                        <Users size={17} />
                                    </span>
                                    <span>គ្រួសារ និង ក្រុមអម (Family & Wedding Party)</span>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#854d0e", background: "#fef9c3", padding: "2px 8px", borderRadius: "12px", marginLeft: "6px" }}>
                                        {form.party?.length || 0} នាក់
                                    </span>
                                </h4>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button
                                        type="button"
                                        onClick={addPartyMember}
                                        className="pe-btn-upload-action"
                                        style={{
                                            padding: "6px 12px",
                                            fontSize: "0.8rem",
                                            background: "#fefce8",
                                            borderColor: "#fef08a",
                                            color: "#854d0e",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}
                                        title="បន្ថែមសមាជិកក្រុមអមថ្មី"
                                    >
                                        <Plus size={14} /> បន្ថែមសមាជិក
                                    </button>

                                    <label className="pe-toggle" title="បើក/បិទ គ្រួសារ និង ក្រុមអម">
                                        <input
                                            type="checkbox"
                                            checked={form.showParty !== false}
                                            onChange={(e) => update("showParty", e.target.checked)}
                                        />
                                        <span className="pe-toggle-slider" />
                                    </label>
                                </div>
                            </div>

                            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#64748b" }}>
                                * បញ្ចូលព័ត៌មាន និងរូបថតរបស់កូនកំលោះ/កូនក្រមុំកិត្តិយស គ្រួសារ ឬមិត្តភក្តិ (Add wedding party members & photos)
                            </p>

                            {form.showParty !== false && (
                                <div className="pe-party-list">
                                    {(form.party || []).map((item, idx) => (
                                        <CleanPartyMemberItem
                                            key={item.id || `party-${idx}`}
                                            idx={idx}
                                            item={item}
                                            onChange={(key, val) => handlePartyChange(idx, key, val)}
                                            onUpload={(e) => handlePartyImageUpload(idx, e)}
                                            onRemoveImage={() => handlePartyChange(idx, "image", "")}
                                            onDelete={() => removePartyMember(idx)}
                                            canDelete={(form.party || []).length > 1}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 9. KHQR ផ្ញើរចំណងដៃ (Gift QR) */}
                        <div className="pe-section-card">
                            <h4 className="pe-section-heading">
                                <span className="pe-sec-icon-badge">
                                    <QrCode size={17} />
                                </span>
                                <span>{t("secKhqr") || "KHQR ផ្ញើរចំណងដៃ"}</span>
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

                        {/* 10. សារថ្លែងអំណរគុណ (Thank You Message) */}
                        <div className="pe-section-card">
                            <h4 className="pe-section-heading">
                                <span className="pe-sec-icon-badge">
                                    <Gift size={17} />
                                </span>
                                <span>{t("secThankYou") || "សារថ្លែងអំណរគុណ"}</span>
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
                                    rows="5"
                                    value={form.thankYouText}
                                    onChange={(e) => update("thankYouText", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 9. ភាសាធៀបការ (Language Mode) */}
                        <div className="pe-section-card">
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
                        data={form}
                        onSave={handleSave}
                        isSaving={isSaving}
                    />
                )}
            </div>
        </div>
    );
}
