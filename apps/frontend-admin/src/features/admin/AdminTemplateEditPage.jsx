import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Palette,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Heart,
  Calendar,
  MapPin,
  Shirt,
  Layers,
  Crown,
  ExternalLink,
  Music,
  Image as ImageIcon,
  Sliders,
  Eye,
  Upload,
} from "lucide-react";
import Toast from "../../components/Toast";
import { useToast } from "../../hooks/useToast";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "./adminManagementService";
import { userTemplateUrl } from "../../shared/config/runtime";

// Preset Theme Styles
const THEME_PRESETS = [
  {
    id: "GOLD_LUXURY",
    name: "Gold Luxury (មាសប្រណិត)",
    primary: "#D4AF37",
    secondary: "#F3E5AB",
    bg: "#FFFDF7",
    badge: "Gold Luxury",
    amp: "✦",
    fontKhmer: "Moul",
    fontLatin: "Playfair Display",
    dressColors: [
      { hex: "#D4AF37", name: "មាស" },
      { hex: "#F3E5AB", name: "សាំប៉ាញ" },
      { hex: "#FFFDF7", name: "ស" },
      { hex: "#1A1A1A", name: "ខ្មៅ" },
    ],
  },
  {
    id: "EMERALD_GREEN",
    name: "Emerald Green (ត្បូងមរកត)",
    primary: "#0F4C3A",
    secondary: "#2D8A6E",
    bg: "#F7FAF8",
    badge: "Emerald Luxe",
    amp: "❖",
    fontKhmer: "Moul",
    fontLatin: "Playfair Display",
    dressColors: [
      { hex: "#0F4C3A", name: "បៃតងចាស់" },
      { hex: "#2D8A6E", name: "បៃតងមរកត" },
      { hex: "#D4AF37", name: "មាស" },
      { hex: "#FFFDF7", name: "ស" },
    ],
  },
  {
    id: "RUBY_RED",
    name: "Ruby Red (ក្រហមទុំមាស)",
    primary: "#8B1E2D",
    secondary: "#D4AF37",
    bg: "#FFFDF7",
    badge: "Royal Ruby",
    amp: "❖",
    fontKhmer: "Moul",
    fontLatin: "Cinzel",
    dressColors: [
      { hex: "#8B1E2D", name: "ក្រហមទុំ" },
      { hex: "#D4AF37", name: "មាស" },
      { hex: "#FFFDF7", name: "ស" },
      { hex: "#4A151C", name: "ក្រហមចាស់" },
    ],
  },
  {
    id: "CHAMPAGNE",
    name: "Champagne (សាំប៉ាញប្រណិត)",
    primary: "#C5A880",
    secondary: "#E8D8C8",
    bg: "#FAF8F5",
    badge: "Champagne Elegance",
    amp: "❀",
    fontKhmer: "Moul",
    fontLatin: "Playfair Display",
    dressColors: [
      { hex: "#C5A880", name: "សាំប៉ាញ" },
      { hex: "#E8D8C8", name: "ភ្លុក" },
      { hex: "#D4AF37", name: "មាស" },
      { hex: "#FFFDF7", name: "ស" },
    ],
  },
  {
    id: "ROYAL_KHMER",
    name: "Royal Khmer (រាជវាំងខ្មែរ)",
    primary: "#8B1E2D",
    secondary: "#D4AF37",
    bg: "#FFFDF7",
    badge: "Royal Khmer",
    amp: "❖",
    fontKhmer: "Moul",
    fontLatin: "Cinzel",
    dressColors: [
      { hex: "#8B1E2D", name: "ក្រហមទុំ" },
      { hex: "#D4AF37", name: "មាស" },
      { hex: "#FFFDF7", name: "ស" },
      { hex: "#4A151C", name: "ក្រហមចាស់" },
    ],
  },
  {
    id: "GARDEN_ROYAL",
    name: "Garden Royal (សួនផ្កា)",
    primary: "#2D7FA6",
    secondary: "#6F9E2E",
    bg: "#FFFDF7",
    badge: "Garden Royal",
    amp: "❀",
    fontKhmer: "Moul",
    fontLatin: "Playfair Display",
    dressColors: [
      { hex: "#2D7FA6", name: "ខៀវផ្កា" },
      { hex: "#6F9E2E", name: "បៃតងស្លឹក" },
      { hex: "#FFFDF7", name: "ស" },
      { hex: "#D6A63C", name: "មាស" },
    ],
  },
  {
    id: "MODERN_MINIMAL",
    name: "Modern Minimal (សម័យសាមញ្ញ)",
    primary: "#0F172A",
    secondary: "#64748B",
    bg: "#FFFFFF",
    badge: "Modern Luxury",
    amp: "&",
    fontKhmer: "Kantumruy Pro",
    fontLatin: "Inter",
    dressColors: [
      { hex: "#0F172A", name: "ខ្មៅប្រណិត" },
      { hex: "#94A3B8", name: "ប្រផេះ" },
      { hex: "#FFFFFF", name: "ស" },
      { hex: "#F59E0B", name: "មាសខ្ចី" },
    ],
  },
];

const DEFAULT_SCHEDULE = [
  { id: "1", time: "07:00 ព្រឹក", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", desc: "នៅគេហដ្ឋានខាងស្រី" },
  { id: "2", time: "08:30 ព្រឹក", title: "ពិធីហែកំណត់ និងកាត់សក់បង្កក់សិរី", desc: "ជួបជុំញាតិមិត្តទាំងសងខាង" },
  { id: "3", time: "10:00 ព្រឹក", title: "ពិធីសំពះផ្ទឹម និងចងដៃសិរីសួស្តី", desc: "ជូនពរជ័យដល់គូស្វាមីភរិយាថ្មី" },
  { id: "4", time: "05:00 ល្ងាច", title: "ពិធីពិសាភោជនាហារ និងរាំកម្សាន្ត", desc: "សូមអញ្ជើញចូលរួមពិធីលៀងសាយភោជនាហារ" },
];

const DEFAULT_STUDIO_STATE = {
  // Metadata
  name: "Royal Khmer Wedding Studio 2026",
  category: "TRADITIONAL",
  status: "ACTIVE",
  premium: true,
  price: "0.00",
  thumbnailUrl: "/facebook/all/03-card/cover-card.jpg",
  previewUrl: "",

  // Theme & Appearance
  presetId: "ROYAL_KHMER",
  primaryColor: "#8B1E2D",
  secondaryColor: "#D4AF37",
  backgroundColor: "#FFFDF7",
  badgeText: "Royal Khmer",
  ampSymbol: "❖",
  fontKhmer: "Moul",
  fontLatin: "Playfair Display",
  mood: "light",

  // Hero & Envelope & Motion
  gateStyle: "ribbon-untie",
  openingStyle: "ribbon-untie",
  cardMotion: "3D_FLIP",
  cardLayout: "3D_FLIP",
  bgMusicUrl: "/music/wedding.mp3",
  videoUrl: "",
  enableFloatingBar: true,
  invitationTitle: "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
  invitationSubtitle: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
  coverImage: "/facebook/all/03-card/cover-card.jpg",
  weddingDate: "ថ្ងៃពុធ ២៨ មករា ២០២៦",
  weddingTime: "17:00",
  blessingMessage: "ដោយសេចក្តីសោមនស្សរីករាយក្រៃលែង យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យសិរីមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំទាំងពីរ។",

  // Couple & Parents
  groomName: "ជា វណ្ណដា",
  groomNameEn: "Vanda Chea",
  groomFather: "លោក ជា សុផល",
  groomMother: "លោកស្រី កែវ ចរិយា",
  brideName: "សុខ ស្រីពេជ្រ",
  brideNameEn: "Sreypich Sok",
  brideFather: "លោក សុខ វិបុល",
  brideMother: "លោកស្រី អ៊ុំ សោភា",

  // Schedule
  schedule: DEFAULT_SCHEDULE,

  // Venue & Location
  venueName: "The Premier Center Sen Sok",
  venueHall: "អគារ A (Building A)",
  venueAddress: "ផ្លូវ 1003, សង្កាត់ភ្នំពេញថ្មី, ខណ្ឌសែនសុខ, រាជធានីភ្នំពេញ",
  googleMapUrl: "https://maps.google.com",

  // Dress code & Gift QR
  dressColors: [
    { hex: "#8B1E2D", name: "ក្រហមទុំ" },
    { hex: "#D4AF37", name: "មាស" },
    { hex: "#FFFDF7", name: "ស" },
    { hex: "#4A151C", name: "ក្រហមចាស់" },
  ],
  qrGiftUrl: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?auto=format&fit=crop&w=400&q=80",
  bankName: "ABA Bank",
  bankAccountNumber: "000 123 456",
  bankAccountName: "VANDA & SREYPICHOfficial",

  // Story & Photo Gallery
  storyText: "ពីការជួបគ្នាដំបូង រហូតដល់ថ្ងៃសន្យារួមដំណើរជីវិត យើងបានរៀនថាសេចក្តីស្រឡាញ់ពិតប្រាកដ គឺកើតពីការគោរព ការយកចិត្តទុកដាក់ និងស្នាមញញឹមរៀងរាល់ថ្ងៃ។",
  galleryImages: [
    "/facebook/all/03-card/03-01.jpg",
    "/facebook/all/03-card/03-02.jpg",
    "/facebook/all/03-card/03-03.jpg",
    "/facebook/all/03-card/03-04.jpg",
  ],

  // Full Template Section Visibility Controls
  enabledSections: {
    countdown: true,
    schedule: true,
    story: true,
    party: true,
    gallery: true,
    gift: true,
    map: true,
    dressCode: false,
    faq: false,
    rsvp: true,
  },
};

export default function AdminTemplateEditPage() {
  const { lang, t } = useAdminLanguage();
  const { templateId } = useParams();
  const isNew = templateId === "new";
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();

  const [activeTab, setActiveTab] = useState("theme"); // 'theme' | 'couple' | 'events' | 'venue' | 'settings'
  const [themeSubTab, setThemeSubTab] = useState("presets"); // 'presets' | 'cover'
  const [eventsSubTab, setEventsSubTab] = useState("schedule"); // 'schedule' | 'gallery'
  const [venueSubTab, setVenueSubTab] = useState("map"); // 'map' | 'dress'
  const [settingsSubTab, setSettingsSubTab] = useState("sections"); // 'sections' | 'catalog'
  const [deviceView, setDeviceView] = useState("mobile"); // 'mobile' | 'tablet' | 'desktop'
  const [previewGateOpen, setPreviewGateOpen] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [form, setForm] = useState(DEFAULT_STUDIO_STATE);
  const iframeRef = useRef(null);
  const qrFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);

  // Draggable Split Divider State (Left Controls vs Right Live Preview)
  const [leftWidthPercent, setLeftWidthPercent] = useState(48); // default 48% split
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const workspaceRef = useRef(null);

  // Mouse drag handler for horizontal panel resizing
  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let pct = (x / rect.width) * 100;
      if (pct < 25) pct = 25; // min 25% for controls panel
      if (pct > 75) pct = 75; // max 75% for controls panel
      setLeftWidthPercent(pct);
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDivider]);

  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  const handleDividerDoubleClick = () => {
    setLeftWidthPercent(48); // Reset to default 48% on double-click
  };

  // Sync form inputs to iframe live engine in real-time
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "LIVE_PREVIEW_SYNC",
          data: form,
        },
        "*"
      );
    } catch {
      // ignore
    }
  }, [form]);

  const handleSetGate = (shouldOpen) => {
    setPreviewGateOpen(shouldOpen);
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "TOGGLE_GATE",
            open: shouldOpen,
            isOpen: shouldOpen,
          },
          "*"
        );
      } catch {
        // ignore
      }
    }
  };

  // Load existing template data if editing
  useEffect(() => {
    if (isNew) return;
    let active = true;
    adminManagementService
      .template(templateId)
      .then((t) => {
        if (!active) return;
        let parsedConfig = {};
        try {
          if (t.description && t.description.startsWith("{")) {
            parsedConfig = JSON.parse(t.description);
          }
        } catch {
          // Ignore invalid JSON config
        }

        setForm((prev) => ({
          ...prev,
          code: t.code || prev.code,
          name: t.name || prev.name,
          category: t.category || prev.category,
          thumbnailUrl: t.thumbnailUrl || prev.thumbnailUrl,
          previewUrl: t.previewUrl || prev.previewUrl,
          premium: Boolean(t.premium),
          status: t.status || "ACTIVE",
          price: t.price != null ? String(t.price) : prev.price,
          ...parsedConfig,
        }));
      })
      .catch((err) => {
        if (active) show(err?.message || "មិនអាចទាញយកទិន្នន័យគំរូបានទេ", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isNew, templateId, show]);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // Apply Theme Preset
  const handleApplyPreset = (preset) => {
    const presetMap = {
      GOLD_LUXURY: "the-digital-yes-wedding",
      EMERALD_GREEN: "emerald-canva-luxe-wedding",
      RUBY_RED: "royal-khmer-wedding",
      CHAMPAGNE: "cover-khmer-golden-wedding",
      ROYAL_KHMER: "royal-khmer-wedding",
      GARDEN_ROYAL: "garden-royal-khmer-wedding",
      KHMER_GOLDEN: "cover-khmer-golden-wedding",
      MODERN_MINIMAL: "the-digital-yes-wedding",
    };
    setForm((prev) => ({
      ...prev,
      code: isNew ? (presetMap[preset.id] || prev.code) : prev.code,
      presetId: preset.id,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.bg,
      badgeText: preset.badge,
      ampSymbol: preset.amp,
      fontKhmer: preset.fontKhmer,
      fontLatin: preset.fontLatin,
      dressColors: preset.dressColors,
    }));
    show(`បានកំណត់ Theme "${preset.name}" ✓`);
  };

  // Schedule management
  const handleAddScheduleItem = () => {
    const newItem = {
      id: String(Date.now()),
      time: "12:00 ថ្ងៃត្រង់",
      title: "កម្មវិធីថ្មី",
      desc: "ពិពណ៌នាកម្មវិធី",
    };
    setForm((prev) => ({ ...prev, schedule: [...prev.schedule, newItem] }));
  };

  const handleUpdateScheduleItem = (id, field, val) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item) => (item.id === id ? { ...item, [field]: val } : item)),
    }));
  };

  const handleDeleteScheduleItem = (id) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((item) => item.id !== id),
    }));
  };

  const handleAddGalleryImage = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) {
      show(lang === "en" ? "Please enter an image URL" : "សូមបញ្ចូល URL រូបភាពជាមុនសិន", "error");
      return;
    }
    const newImages = [...(form.galleryImages || []), trimmed];
    setField("galleryImages", newImages);
    setNewGalleryUrl("");
    show(lang === "en" ? "Image added to gallery ✓" : "បានបន្ថែមរូបភាពទៅវិចិត្រសាល ✓");
  };

  const handleQrFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      show(lang === "en" ? "Please select an image file (PNG, JPG, WEBP)" : "សូមជ្រើសរើសប្រភេទ File រូបភាព (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      show(lang === "en" ? "Image size exceeds 8MB" : "ទំហំរូបភាពធំជាង 8MB សូមបន្ថយទំហំរូបភាព", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setField("qrGiftUrl", result);
        show(lang === "en" ? "QR code image uploaded ✓" : "បានជ្រើសរើសរូបភាព QR ជោគជ័យ ✓");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      show(lang === "en" ? "Please select an image file" : "សូមជ្រើសរើសប្រភេទ File រូបភាព", "error");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      show(lang === "en" ? "Image size exceeds 8MB" : "ទំហំរូបភាពធំជាង 8MB សូមបន្ថយទំហំរូបភាព", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setField("coverImage", result);
        show(lang === "en" ? "Cover image uploaded ✓" : "បានជ្រើសរើសរូបភាព Cover ជោគជ័យ ✓");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      show(lang === "en" ? "Please select valid image files" : "សូមជ្រើសរើសប្រភេទ File រូបភាព", "error");
      return;
    }

    let loaded = 0;
    const newResults = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          newResults.push(result);
        }
        loaded += 1;
        if (loaded === validFiles.length) {
          setField("galleryImages", [...(form.galleryImages || []), ...newResults]);
          show(lang === "en" ? `Added ${newResults.length} photo(s) ✓` : `បានបន្ថែមរូបថត ${newResults.length} សន្លឹកជោគជ័យ ✓`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Save Template
  const handleSave = async () => {
    if (!form.name.trim()) {
      show("សូមបញ្ចូលឈ្មោះគំរូធៀបការ (Template Name)", "error");
      return;
    }

    setSaving(true);
    try {
      // Serialize full studio config into description JSON
      const fullConfigJson = JSON.stringify({
        presetId: form.presetId,
        theme: form.presetId,
        gateStyle: form.gateStyle || "khmer-royal",
        openingStyle: form.gateStyle || "khmer-royal",
        cardMotion: form.cardMotion || "3D_FLIP",
        cardLayout: form.cardMotion || "3D_FLIP",
        bgMusicUrl: form.bgMusicUrl,
        videoUrl: form.videoUrl,
        enableFloatingBar: form.enableFloatingBar !== false,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        backgroundColor: form.backgroundColor,
        badgeText: form.badgeText,
        ampSymbol: form.ampSymbol,
        fontKhmer: form.fontKhmer,
        fontLatin: form.fontLatin,
        mood: form.mood,
        invitationTitle: form.invitationTitle,
        invitationSubtitle: form.invitationSubtitle,
        coverImage: form.coverImage,
        weddingDate: form.weddingDate,
        weddingTime: form.weddingTime,
        blessingMessage: form.blessingMessage,
        groomName: form.groomName,
        groomNameEn: form.groomNameEn,
        groomFather: form.groomFather,
        groomMother: form.groomMother,
        brideName: form.brideName,
        brideNameEn: form.brideNameEn,
        brideFather: form.brideFather,
        brideMother: form.brideMother,
        schedule: form.schedule,
        venueName: form.venueName,
        venueHall: form.venueHall,
        venueAddress: form.venueAddress,
        googleMapUrl: form.googleMapUrl,
        dressColors: form.dressColors,
        qrGiftUrl: form.qrGiftUrl,
        bankName: form.bankName || "ABA Bank",
        bankAccountNumber: form.bankAccountNumber || "",
        bankAccountName: form.bankAccountName || "",
        enabledSections: form.enabledSections,
      });

      const payload = {
        name: form.name.trim(),
        category: form.category,
        thumbnailUrl: form.thumbnailUrl || form.coverImage,
        previewUrl: form.previewUrl || `/templates/${form.presetId?.toLowerCase() || "custom"}`,
        premium: form.premium,
        status: form.status,
        price: parseFloat(form.price) || 0,
        description: fullConfigJson,
      };

      const res = isNew
        ? await adminManagementService.createTemplate(payload)
        : await adminManagementService.updateTemplate(templateId, payload);

      show("បានរក្សាទុក និងផ្សព្វផ្សាយគំរូធៀបការជោគជ័យ ✓");
      navigate(`/templates/${res.id || templateId}`, { replace: true });
    } catch (err) {
      show(err?.message || "បរាជ័យក្នុងការរក្សាទុកគំរូ", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-amber-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <span className="text-sm font-semibold">កំពុងដំណើរការទាញយក Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* 1. TOP STUDIO TOOLBAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/templates"
            className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 px-3.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("templateEditor.back", "ត្រឡប់ទៅបញ្ជីគំរូ")}</span>
          </Link>
          <div className="h-6 w-px bg-zinc-800 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
                {isNew
                  ? (lang === "en" ? "✨ Create New Template (Studio)" : "✨ បង្កើតគំរូថ្មី (Template Visual Studio)")
                  : (lang === "en" ? `🎨 Edit: ${form.name}` : `🎨 កែសម្រួល: ${form.name}`)}
              </h1>
              <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                Studio Editor v2
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {lang === "en"
                ? "Configure Themes, Layouts, Couple Info, and Live Realtime Preview"
                : "រៀបចំ Themes, Layouts, ព័ត៌មានកូនកំលោះ-កូនក្រមុំ និងកម្មវិធី Live Realtime"}
            </p>
          </div>
        </div>

        {/* Device Mode Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-1 shrink-0">
          <button
            type="button"
            onClick={() => setDeviceView("mobile")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              deviceView === "mobile"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>{t("templateEditor.mobileView", "Mobile (380px)")}</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceView("tablet")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              deviceView === "tablet"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
            <span>{t("templateEditor.tabletView", "Tablet (680px)")}</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceView("desktop")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              deviceView === "desktop"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>{t("templateEditor.desktopView", "Desktop")}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={userTemplateUrl(form.code || form.slug || form.presetId?.toLowerCase() || "the-digital-yes-wedding")}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
          >
            <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
            <span>{t("templateEditor.userTab", "មើល User Tab")}</span>
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? t("templateEditor.saving", "កំពុងរក្សាទុក...") : t("templateEditor.save", "រក្សាទុក & ផ្សព្វផ្សាយ")}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT STUDIO WORKSPACE */}
      <div
        ref={workspaceRef}
        className={`flex flex-1 overflow-hidden relative ${
          isDraggingDivider ? "select-none cursor-col-resize" : ""
        }`}
      >
        {/* Transparent backdrop overlay while dragging to capture all mousemove/mouseup and prevent iframe mouse trapping */}
        {isDraggingDivider && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none" />
        )}

        {/* ================= LEFT CONTROLS PANEL ================= */}
        <aside
          style={{ width: `${leftWidthPercent}%` }}
          className="flex flex-col border-r border-zinc-800 bg-zinc-900/50 shrink-0 min-w-[320px] max-w-[80vw]"
        >
          {/* Studio Navigation Tabs - Clean 5 Symmetrical Tabs on 1 Single Row */}
          <div className="border-b border-zinc-800/80 bg-zinc-950/80 p-3">
            <div className="grid grid-cols-5 gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-1.5">
              {[
                { id: "theme", label: lang === "en" ? "Theme & Styles" : "រចនាបថ", icon: Palette },
                { id: "couple", label: lang === "en" ? "Couple Info" : "សាមីខ្លួន", icon: Heart },
                { id: "events", label: lang === "en" ? "Schedule & Media" : "កម្មវិធី & រូប", icon: Calendar },
                { id: "venue", label: lang === "en" ? "Venue & QR" : "ទីតាំង & QR", icon: MapPin },
                { id: "settings", label: lang === "en" ? "Settings" : "ការកំណត់", icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-slate-950" : "text-amber-400/90"}`} />
                    <span className="text-xs font-semibold leading-none">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: THEME & APPEARANCE (Styles + Cover) */}
            {activeTab === "theme" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Sub-tab Pill Switcher */}
                <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
                  <button
                    type="button"
                    onClick={() => setThemeSubTab("presets")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      themeSubTab === "presets"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>ពណ៌ & ពុម្ពអក្សរ (Colors & Fonts)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeSubTab("cover")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      themeSubTab === "cover"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>ស្រោម & ពាក្យជូនពរ (Cover & Hero)</span>
                  </button>
                </div>

                {themeSubTab === "presets" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>រចនាបថគំរូ Preset Styles</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mb-4">
                        ជ្រើសរើស Style មេមួយ ដើម្បីកំណត់ Theme Color និង Font ដោយស្វ័យប្រវត្តិ
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {THEME_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              form.presetId === preset.id
                                ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                                : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/40"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-zinc-100">{preset.name}</span>
                              <span className="text-xs">{preset.amp}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-auto">
                              {preset.dressColors.map((c, i) => (
                                <span
                                  key={i}
                                  className="h-4 w-4 rounded-full border border-black/30 shadow-sm"
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <hr className="border-zinc-800/80" />

                    {/* Custom Color Overrides */}
                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">ពណ៌ចម្បង (Custom Colors)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                            ពណ៌គោល (Primary)
                          </label>
                          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2">
                            <input
                              type="color"
                              value={form.primaryColor}
                              onChange={(e) => setField("primaryColor", e.target.value)}
                              className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={form.primaryColor}
                              onChange={(e) => setField("primaryColor", e.target.value)}
                              className="w-full bg-transparent text-xs text-zinc-200 outline-none uppercase font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                            ពណ៌បន្ទាប់បន្សំ (Secondary)
                          </label>
                          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2">
                            <input
                              type="color"
                              value={form.secondaryColor}
                              onChange={(e) => setField("secondaryColor", e.target.value)}
                              className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={form.secondaryColor}
                              onChange={(e) => setField("secondaryColor", e.target.value)}
                              className="w-full bg-transparent text-xs text-zinc-200 outline-none uppercase font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                            ផ្ទៃខាងក្រោយ (Background)
                          </label>
                          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2">
                            <input
                              type="color"
                              value={form.backgroundColor}
                              onChange={(e) => setField("backgroundColor", e.target.value)}
                              className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={form.backgroundColor}
                              onChange={(e) => setField("backgroundColor", e.target.value)}
                              className="w-full bg-transparent text-xs text-zinc-200 outline-none uppercase font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-zinc-800/80" />

                    {/* Typography & Fonts */}
                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">ពុម្ពអក្សរ (Typography)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                            Khmer Font (អក្សរខ្មែរ)
                          </label>
                          <select
                            value={form.fontKhmer}
                            onChange={(e) => setField("fontKhmer", e.target.value)}
                            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-200 outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="Moul">Moul (អក្សរមូលឆ្លាក់បុរាណ)</option>
                            <option value="Kantumruy Pro">Kantumruy Pro (សម័យទំនើប)</option>
                            <option value="Battambang">Battambang (ស្រទន់)</option>
                            <option value="Siemreap">Siemreap (រៀបរយ)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                            Latin Font (អក្សរឡាតាំង)
                          </label>
                          <select
                            value={form.fontLatin}
                            onChange={(e) => setField("fontLatin", e.target.value)}
                            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-200 outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                            <option value="Cinzel">Cinzel (Royal Classical)</option>
                            <option value="Inter">Inter (Clean Modern Sans)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {themeSubTab === "cover" && (
                  <div className="space-y-5">
                    {/* Gate Style Selector (The Digital Yes 3D Styles) */}
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>ម៉ូដខ្លោងទ្វារបើកសំបុត្រ (Gate Opening Style - The Digital Yes)</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Live Animation
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: "ribbon-untie", name: "ស្រាយខ្សែបូ", sub: "Silk Ribbon Untie", icon: "🎀", tag: "Viral Reels" },
                          { id: "envelope-3d", name: "ហែកត្រាទៀន 3D", sub: "3D Wax Seal", icon: "✉️", tag: "Trending" },
                          { id: "cinematic-video", name: "វីដេអូបើកឆាក", sub: "Cinematic Pre-wedding", icon: "🎬", tag: "Full Video" },
                          { id: "khmer-royal", name: "ទ្វាររាជវាំងមាស", sub: "Palace Gate Swing", icon: "🏛️", tag: "Royal" },
                          { id: "curtain", name: "វាំងននល្ខោន", sub: "Theatrical Velvet", icon: "🎭", tag: "Prestige" },
                          { id: "magical-gate", name: "ទ្វារវេទមន្ត", sub: "Magical Portal", icon: "✨", tag: "Glow" },
                        ].map((item) => {
                          const isSelected = (form.gateStyle || "ribbon-untie") === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setField("gateStyle", item.id);
                                handleSetGate(false);
                              }}
                              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                                  : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-2xl">{item.icon}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  isSelected ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400"
                                }`}>
                                  {item.tag}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-zinc-100">{item.name}</span>
                              <span className="text-[10px] text-zinc-400">{item.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Video URL Input when Cinematic Video Opening is selected */}
                    {(form.gateStyle === "cinematic-video" || form.gateStyle === "CINEMATIC_VIDEO") && (
                      <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-4 space-y-2 animate-in fade-in">
                        <label className="block text-xs font-semibold text-amber-300">
                          🎬 តំណភ្ជាប់វីដេអូបើកឆាក (Pre-wedding Video URL - MP4 / WebM)
                        </label>
                        <input
                          type="text"
                          value={form.videoUrl || ""}
                          onChange={(e) => setField("videoUrl", e.target.value)}
                          placeholder="https://example.com/prewedding-cinematic.mp4"
                          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                        />
                        <p className="text-[11px] text-zinc-400">
                          វីដេអូនឹងចាក់បើកឆាក Fullscreen Reel មុនពេលបង្ហាញកាតធៀបការ។ ភ្ញៀវអាចចុច Skip បានគ្រប់ពេល។
                        </p>
                      </div>
                    )}

                    {/* Card Motion & Layout Effects */}
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Sliders className="h-4 w-4 text-amber-500" />
                          <span>ចលនាកាត & ការរំកិល (Card Motion & Layout)</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Effects
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: "3D_FLIP", name: "កាតបង្វិល 3D Flip", sub: "មើលខាងមុខ និងខាងក្រោយ", icon: "🔄", tag: "3D Motion" },
                          { id: "VERTICAL_REEL", name: "រំកិលចុះក្រោមបែប Reels", sub: "TikTok / IG Snap Scroll", icon: "📱", tag: "Reels" },
                          { id: "BOOK_SPREAD", name: "បើកបែបសៀវភៅ", sub: "Book Spread Elegance", icon: "📖", tag: "Elegance" },
                          { id: "STANDARD_SCROLL", name: "រំកិលរលូនធម្មតា", sub: "Standard Smooth Scroll", icon: "📜", tag: "Smooth" },
                        ].map((item) => {
                          const isSelected = (form.cardMotion || "3D_FLIP") === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setField("cardMotion", item.id);
                                handleSetGate(true);
                              }}
                              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                                  : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-2xl">{item.icon}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  isSelected ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400"
                                }`}>
                                  {item.tag}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-zinc-100">{item.name}</span>
                              <span className="text-[10px] text-zinc-400">{item.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Background Wedding Music & Floating Action Dock */}
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Music className="h-4 w-4 text-amber-500" />
                          <span>បទភ្លេងមង្គលការ & របារសកម្មភាព (Music & Actions)</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Vinyl Spin
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                            URL នៃបទភ្លេងមង្គលការ (Background Music URL)
                          </label>
                          <input
                            type="text"
                            value={form.bgMusicUrl || ""}
                            onChange={(e) => setField("bgMusicUrl", e.target.value)}
                            placeholder="/music/wedding.mp3 ឬ https://..."
                            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.enableFloatingBar !== false}
                            onChange={(e) => setField("enableFloatingBar", e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-xs font-medium text-zinc-200">
                            បង្ហាញរបារប៊ូតុងអណ្តែត Floating Action Bar (ចាក់ភ្លេង Vinyl, Google Maps, ABA KHQR, RSVP)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Badge លើស្រោមសំបុត្រ (Seal Badge)
                      </label>
                      <input
                        type="text"
                        value={form.badgeText}
                        onChange={(e) => setField("badgeText", e.target.value)}
                        placeholder="Garden Royal / Royal Khmer"
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        និមិត្តសញ្ញាផ្កា (Ornament Amp Symbol)
                      </label>
                      <input
                        type="text"
                        value={form.ampSymbol}
                        onChange={(e) => setField("ampSymbol", e.target.value)}
                        placeholder="❀ ឬ ❖ ឬ ✦"
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        ចំណងជើងធៀប (Hero Title)
                      </label>
                      <input
                        type="text"
                        value={form.invitationTitle}
                        onChange={(e) => setField("invitationTitle", e.target.value)}
                        placeholder="សិរីសួស្តី អាពាហ៍ពិពាហ៍"
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-moul"
                      />
                    </div>
                    {/* Hidden Cover File Input */}
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                      onChange={handleCoverFileUpload}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-zinc-300">
                          {lang === "en" ? "Cover Banner Photo (URL / Upload)" : "រូបភាព Cover Banner (URL / Upload)"}
                        </label>
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          <span>{lang === "en" ? "Upload Cover" : "Upload រូប Cover"}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        {form.coverImage && (
                          <img
                            src={form.coverImage}
                            alt="Cover Preview"
                            className="h-10 w-16 rounded-lg object-cover border border-zinc-700 shrink-0 bg-zinc-950"
                            onError={(e) => {
                              e.target.src = "/facebook/all/03-card/cover-card.jpg";
                            }}
                          />
                        )}
                        <input
                          type="text"
                          value={form.coverImage}
                          onChange={(e) => setField("coverImage", e.target.value)}
                          placeholder={lang === "en" ? "https://... or click Upload Cover" : "https://... ឬចុច Upload ពីកុំព្យូទ័រ"}
                          className="h-10 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        ពាក្យជូនពរផ្លូវការ (Formal Blessing Greeting)
                      </label>
                      <textarea
                        rows={4}
                        value={form.blessingMessage}
                        onChange={(e) => setField("blessingMessage", e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 outline-none focus:border-amber-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COUPLE & PARENTS */}
            {activeTab === "couple" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Groom Info */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🤵 ព័ត៌មានខាងកូនកំលោះ (Groom)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះខ្មែរ</label>
                      <input
                        type="text"
                        value={form.groomName}
                        onChange={(e) => setField("groomName", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះឡាតាំង</label>
                      <input
                        type="text"
                        value={form.groomNameEn}
                        onChange={(e) => setField("groomNameEn", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះឪពុក</label>
                      <input
                        type="text"
                        value={form.groomFather}
                        onChange={(e) => setField("groomFather", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះម្តាយ</label>
                      <input
                        type="text"
                        value={form.groomMother}
                        onChange={(e) => setField("groomMother", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bride Info */}
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>👰 ព័ត៌មានខាងកូនក្រមុំ (Bride)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះខ្មែរ</label>
                      <input
                        type="text"
                        value={form.brideName}
                        onChange={(e) => setField("brideName", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះឡាតាំង</label>
                      <input
                        type="text"
                        value={form.brideNameEn}
                        onChange={(e) => setField("brideNameEn", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះឪពុក</label>
                      <input
                        type="text"
                        value={form.brideFather}
                        onChange={(e) => setField("brideFather", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">ឈ្មោះម្តាយ</label>
                      <input
                        type="text"
                        value={form.brideMother}
                        onChange={(e) => setField("brideMother", e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EVENTS & GALLERY (Schedule + Photos + Story) */}
            {activeTab === "events" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Sub-tab Pill Switcher */}
                <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
                  <button
                    type="button"
                    onClick={() => setEventsSubTab("schedule")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      eventsSubTab === "schedule"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>កាលវិភាគកម្មវិធី (Schedule)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventsSubTab("gallery")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      eventsSubTab === "gallery"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>វិចិត្រសាល & Story (Gallery)</span>
                  </button>
                </div>

                {eventsSubTab === "schedule" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">
                        {lang === "en" ? "Ceremony Agenda" : "កាលវិភាគកម្មវិធី (Ceremony Agenda)"}
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddScheduleItem}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{lang === "en" ? "Add Schedule Item" : "បន្ថែមកម្មវិធី"}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {form.schedule.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-zinc-700"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-400">
                            {index + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">
                                {lang === "en" ? "Time" : "ម៉ោង (Time)"}
                              </label>
                              <input
                                type="text"
                                value={item.time}
                                onChange={(e) => handleUpdateScheduleItem(item.id, "time", e.target.value)}
                                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">
                                {lang === "en" ? "Title" : "ឈ្មោះកម្មវិធី (Title)"}
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleUpdateScheduleItem(item.id, "title", e.target.value)}
                                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[10px] text-zinc-400 mb-1">
                                {lang === "en" ? "Description" : "ពិពណ៌នាសង្ខេប (Description)"}
                              </label>
                              <input
                                type="text"
                                value={item.desc}
                                onChange={(e) => handleUpdateScheduleItem(item.id, "desc", e.target.value)}
                                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteScheduleItem(item.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                            title={lang === "en" ? "Delete" : "លុប"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {eventsSubTab === "gallery" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-amber-500" />
                          <span>{lang === "en" ? "Photo Gallery" : "វិចិត្រសាលរូបថត (Photo Gallery)"}</span>
                        </h3>
                        <span className="text-xs text-zinc-400 font-mono">
                          {(form.galleryImages || []).length} {lang === "en" ? "Photos" : "រូបថត"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-4">
                        {lang === "en"
                          ? "Pre-wedding photo collection and memories (Enter Image URL)"
                          : "កម្រងរូបថត Pre-wedding និងរូបភាពអនុស្សាវរីយ៍ (បញ្ចូល URL រូបភាព)"}
                      </p>

                      {/* Hidden Gallery Files Input */}
                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        multiple
                        className="hidden"
                        onChange={handleGalleryFileUpload}
                      />

                      {/* Add Image Input Bar */}
                      <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-amber-300">
                            {lang === "en" ? "🔗 Add Photo by URL or Upload" : "🔗 បញ្ចូល URL រូបភាពថ្មី ឬ Upload"}
                          </label>
                          <button
                            type="button"
                            onClick={() => galleryFileInputRef.current?.click()}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer"
                          >
                            <Upload className="h-3 w-3" />
                            <span>{lang === "en" ? "Upload Files" : "Upload រូបពីកុំព្យូទ័រ"}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newGalleryUrl}
                            onChange={(e) => setNewGalleryUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddGalleryImage();
                              }
                            }}
                            placeholder="https://example.com/photo.jpg ឬ /facebook/all/03-card/..."
                            className="h-10 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleAddGalleryImage}
                            className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition shrink-0 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            <span>{lang === "en" ? "Add Photo" : "បន្ថែមរូបភាព"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Gallery Images List */}
                      <div className="space-y-3">
                        {(form.galleryImages || []).length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                            {lang === "en" ? "No photos added yet. Enter a URL above to add." : "មិនទាន់មានរូបថតនៅឡើយទេ។ សូមបញ្ចូល URL ខាងលើដើម្បីបន្ថែម។"}
                          </div>
                        ) : (
                          (form.galleryImages || []).map((imgUrl, idx) => (
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
                                onChange={(e) => {
                                  const newImages = [...form.galleryImages];
                                  newImages[idx] = e.target.value;
                                  setField("galleryImages", newImages);
                                }}
                                placeholder="https://..."
                                className="flex-1 bg-transparent text-xs text-zinc-100 outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = form.galleryImages.filter((_, i) => i !== idx);
                                  setField("galleryImages", newImages);
                                }}
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

                    <hr className="border-zinc-800/80" />

                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">
                        សាច់រឿងស្នេហា (Love Story Timeline Intro)
                      </h3>
                      <p className="text-xs text-zinc-400 mb-3">
                        រៀបរាប់ដំណើរដើមទងនៃក្តីស្រឡាញ់របស់គូស្វាមីភរិយា
                      </p>
                      <textarea
                        rows={4}
                        value={form.storyText || ""}
                        onChange={(e) => setField("storyText", e.target.value)}
                        placeholder="ពីការជួបគ្នាដំបូង រហូតដល់ថ្ងៃសន្យារួមដំណើរជីវិត..."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 outline-none focus:border-amber-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VENUE & DRESS CODE (Location + Dress + Gift QR) */}
            {activeTab === "venue" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Sub-tab Pill Switcher */}
                <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
                  <button
                    type="button"
                    onClick={() => setVenueSubTab("map")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      venueSubTab === "map"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>ទីតាំងសាល & Google Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVenueSubTab("dress")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      venueSubTab === "dress"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Shirt className="h-3.5 w-3.5" />
                    <span>សម្លៀកបំពាក់ & QR ចងដៃ</span>
                  </button>
                </div>

                {venueSubTab === "map" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        ឈ្មោះសាលមង្គលការ (Venue / Hall Name)
                      </label>
                      <input
                        type="text"
                        value={form.venueName}
                        onChange={(e) => setField("venueName", e.target.value)}
                        placeholder="The Premier Center Sen Sok"
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        អគារ / បន្ទប់ (Building / Room)
                      </label>
                      <input
                        type="text"
                        value={form.venueHall}
                        onChange={(e) => setField("venueHall", e.target.value)}
                        placeholder="អគារ A (Building A)"
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        អាសយដ្ឋានលម្អិត (Address)
                      </label>
                      <input
                        type="text"
                        value={form.venueAddress}
                        onChange={(e) => setField("venueAddress", e.target.value)}
                        placeholder="ផ្លូវ 1003, សង្កាត់ភ្នំពេញថ្មី, ខណ្ឌសែនសុខ, រាជធានីភ្នំពេញ"
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Link Google Maps URL
                      </label>
                      <input
                        type="text"
                        value={form.googleMapUrl}
                        onChange={(e) => setField("googleMapUrl", e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                {venueSubTab === "dress" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">ពណ៌សម្លៀកបំពាក់ភ្ញៀវ (Dress Code)</h3>
                      <p className="text-xs text-zinc-400 mb-4">
                        កំណត់ពណ៌ និងឈ្មោះពណ៌ដែលភ្ញៀវត្រូវស្លៀកពាក់ចូលរួម
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {form.dressColors.map((color, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-2"
                          >
                            <input
                              type="color"
                              value={color.hex}
                              onChange={(e) => {
                                const newColors = [...form.dressColors];
                                newColors[idx] = { ...newColors[idx], hex: e.target.value };
                                setField("dressColors", newColors);
                              }}
                              className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) => {
                                const newColors = [...form.dressColors];
                                newColors[idx] = { ...newColors[idx], name: e.target.value };
                                setField("dressColors", newColors);
                              }}
                              placeholder="ឈ្មោះពណ៌ (ឧ. មាស)"
                              className="w-full bg-transparent text-xs text-zinc-100 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr className="border-zinc-800/80" />

                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">
                        {lang === "en" ? "Digital Gift (QR Code & Bank Info)" : "QR Code ចងដៃ (Digital Gift)"}
                      </h3>

                      {/* Hidden QR File Input */}
                      <input
                        type="file"
                        ref={qrFileInputRef}
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                        onChange={handleQrFileUpload}
                      />

                      <div className="space-y-4">
                        {/* QR Image Input & Upload */}
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                              <ImageIcon className="h-4 w-4 text-amber-500" />
                              <span>{lang === "en" ? "QR Code Image (ABA / Bakong KHQR)" : "រូបភាព QR Code (ABA / Bakong KHQR)"}</span>
                            </label>
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
                            {form.qrGiftUrl ? (
                              <div className="relative group shrink-0">
                                <img
                                  src={form.qrGiftUrl}
                                  alt="QR Preview"
                                  className="h-16 w-16 rounded-xl object-contain bg-white p-1 border border-amber-500/50 shadow-md shadow-amber-500/10"
                                  onError={(e) => {
                                    e.target.src = "/facebook/all/03-card/cover-card.jpg";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setField("qrGiftUrl", "")}
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
                                <span className="text-[9px] font-bold">Upload</span>
                              </div>
                            )}

                            {/* URL Text Input */}
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                value={form.qrGiftUrl}
                                onChange={(e) => setField("qrGiftUrl", e.target.value)}
                                placeholder={lang === "en" ? "https://... or click Upload QR Image" : "https://... ឬចុច Upload ពីកុំព្យូទ័រ"}
                                className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                              />
                              <p className="text-[10px] text-zinc-400">
                                {lang === "en"
                                  ? "Paste direct image URL or click Upload to pick a QR image file from your device."
                                  : "អាច Paste URL រូបភាព ឬចុច Upload ដើម្បីជ្រើសរើសរូបពីកុំព្យូទ័រ។"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                              ឈ្មោះធនាគារ (Bank Name)
                            </label>
                            <input
                              type="text"
                              value={form.bankName || ""}
                              onChange={(e) => setField("bankName", e.target.value)}
                              placeholder="ABA Bank"
                              className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                              លេខគណនី (Account Number)
                            </label>
                            <input
                              type="text"
                              value={form.bankAccountNumber || ""}
                              onChange={(e) => setField("bankAccountNumber", e.target.value)}
                              placeholder="000 123 456"
                              className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                            ឈ្មោះគណនីធនាគារ (Account Name)
                          </label>
                          <input
                            type="text"
                            value={form.bankAccountName}
                            onChange={(e) => setField("bankAccountName", e.target.value)}
                            placeholder="VANDA & SREYPICHOfficial"
                            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SETTINGS & CATALOG (Sections + Catalog) */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Sub-tab Pill Switcher */}
                <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("sections")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      settingsSubTab === "sections"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>គ្រប់គ្រង Sections ទាំង ១០</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsSubTab("catalog")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      settingsSubTab === "catalog"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>កំណត់ Catalog & តម្លៃ</span>
                  </button>
                </div>

                {settingsSubTab === "sections" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                        <Sliders className="h-4 w-4 text-amber-500" />
                        <span>គ្រប់គ្រង Sections ទាំងអស់ (Section Visibility)</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mb-4">
                        បើក (ON) ឬបិទ (OFF) ផ្នែកណាមួយក្នុងទំព័រធៀបការពេញលេញ
                      </p>

                      <div className="space-y-2.5">
                        {[
                          { key: "countdown", label: "⏱️ រាប់ថយក្រោយ (Countdown Timer)", desc: "បង្ហាញនាឡិការាប់ថយក្រោយដល់ថ្ងៃមង្គលការ" },
                          { key: "schedule", label: "📅 កម្មវិធីមង្គលការ (Schedule Timeline)", desc: "បង្ហាញកម្មវិធី និងម៉ោងតាមលំដាប់លំដោយ" },
                          { key: "story", label: "📖 សាច់រឿងស្នេហា (Love Story Cards)", desc: "បង្ហាញដំណើររឿងស្នេហាជា Card រូបថត" },
                          { key: "party", label: "👥 ក្រុមការងារមង្គល (Wedding Party)", desc: "បង្ហាញមិត្តភក្តិ និងក្រុមអ្នកកំដរ" },
                          { key: "gallery", label: "🖼️ វិចិត្រសាលរូបថត (Photo Gallery)", desc: "បង្ហាញកម្រងរូបថតរៀបអាពាហ៍ពិពាហ៍" },
                          { key: "gift", label: "🎁 ចំណងដៃឌីជីថល (Digital Gift QR)", desc: "បង្ហាញ QR Code ធនាគារ ABA/Bakong" },
                          { key: "map", label: "📍 ទីតាំង និងផែនទី (Google Map)", desc: "បង្ហាញទីតាំង និងតំណភ្ជាប់ Google Maps" },
                          { key: "dressCode", label: "👗 ពណ៌សម្លៀកបំពាក់ (Dress Code)", desc: "បង្ហាញ Palette ពណ៌សម្លៀកបំពាក់សម្រាប់ភ្ញៀវ" },
                          { key: "faq", label: "❓ សំណួរដែលសួរញឹកញាប់ (FAQ Accordion)", desc: "សំណួរ-ចម្លើយលម្អិតសម្រាប់ភ្ញៀវកិត្តិយស" },
                          { key: "rsvp", label: "✍️ បញ្ជាក់ការចូលរួម (RSVP Form)", desc: "ទម្រង់បែបបទសម្រាប់ភ្ញៀវចុះឈ្មោះចូលរួម" },
                        ].map((sec) => {
                          const isEnabled = form.enabledSections?.[sec.key] !== false;
                          return (
                            <div
                              key={sec.key}
                              className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 transition hover:border-zinc-700"
                            >
                              <div>
                                <h4 className="text-xs font-bold text-zinc-200">{sec.label}</h4>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{sec.desc}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    enabledSections: {
                                      ...prev.enabledSections,
                                      [sec.key]: !isEnabled,
                                    },
                                  }));
                                }}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isEnabled ? "bg-amber-500" : "bg-zinc-700"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    isEnabled ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === "catalog" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        ឈ្មោះគំរូធៀបការ (Template Name) *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Royal Khmer Wedding Studio 2026"
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          ប្រភេទ (Category)
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => setField("category", e.target.value)}
                          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="TRADITIONAL">ប្រពៃណីខ្មែរ (TRADITIONAL)</option>
                          <option value="LUXURY">ប្រណិតរាជវាំង (LUXURY)</option>
                          <option value="MODERN">សម័យទំនើប (MODERN)</option>
                          <option value="FLORAL">ផ្កាស្រស់ (FLORAL)</option>
                          <option value="MINIMALIST">សាមញ្ញ (MINIMALIST)</option>
                          <option value="OTHER">ផ្សេងៗ (OTHER)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          ស្ថានភាព (Status)
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) => setField("status", e.target.value)}
                          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="ACTIVE">ACTIVE (ផ្សព្វផ្សាយ)</option>
                          <option value="INACTIVE">INACTIVE (ព្រាងទុក)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          កម្រិតសេវាកម្ម (Pricing Tier)
                        </label>
                        <select
                          value={form.premium ? "true" : "false"}
                          onChange={(e) => setField("premium", e.target.value === "true")}
                          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="false">FREE (ឥតគិតថ្លៃ)</option>
                          <option value="true">PREMIUM (បង់ប្រាក់)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          តម្លៃ (Price in USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) => setField("price", e.target.value)}
                          placeholder="0.00"
                          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        រូប Thumbnail Card (URL)
                      </label>
                      <input
                        type="text"
                        value={form.thumbnailUrl}
                        onChange={(e) => setField("thumbnailUrl", e.target.value)}
                        placeholder="https://..."
                        className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* DRAGGABLE RESIZER DIVIDER (Can drag horizontally to resize panels) */}
        <div
          onMouseDown={handleDividerMouseDown}
          onDoubleClick={handleDividerDoubleClick}
          className={`group relative z-30 flex w-3 -ml-1.5 -mr-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors select-none ${
            isDraggingDivider ? "bg-amber-500/20" : "hover:bg-amber-500/10"
          }`}
          title="ចុចទាញពង្រីក/បង្រួម (Drag to resize, Double-click to reset)"
        >
          {/* Vertical line indicator */}
          <div
            className={`h-full w-px transition-colors ${
              isDraggingDivider
                ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                : "bg-zinc-800 group-hover:bg-amber-500/80"
            }`}
          />
          {/* Handle pill knob with grip dots */}
          <div
            className={`absolute flex h-10 w-4 items-center justify-center rounded-full border shadow-sm transition-all ${
              isDraggingDivider
                ? "border-amber-400 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 scale-110"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 group-hover:border-amber-500 group-hover:text-amber-400 group-hover:bg-zinc-800"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
              <span className="h-0.5 w-0.5 rounded-full bg-current" />
            </div>
          </div>
        </div>

        {/* ================= RIGHT LIVE PREVIEW PANEL ================= */}
        <main className="flex-1 flex flex-col bg-zinc-950/90 relative overflow-hidden items-center justify-center p-6 min-w-[360px]">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-20 -right-20 h-96 w-96 rounded-full blur-[140px] opacity-20 pointer-events-none"
            style={{ backgroundColor: form.primaryColor }}
          />

          {/* Single Clean Live Control Bar */}
          <div
            className={`mb-3 flex items-center justify-between w-full px-1 z-10 transition-all duration-300 gap-2 ${
              deviceView === "mobile"
                ? "max-w-[380px]"
                : deviceView === "tablet"
                ? "max-w-[620px]"
                : "max-w-4xl"
            }`}
          >
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900/90 px-2.5 py-1 text-xs font-semibold text-zinc-300 border border-zinc-800 shadow-sm whitespace-nowrap">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-tight text-zinc-200">Live Simulator</span>
              </div>
            </div>

            {/* Fast Gate Toggle Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1 shadow-lg backdrop-blur-md shrink-0">
              <button
                type="button"
                onClick={() => handleSetGate(false)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  !previewGateOpen
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>ស្រោមសំបុត្រ (Cover)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetGate(true)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  previewGateOpen
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>មាតិកាពេញ (Full)</span>
              </button>
            </div>
          </div>

          {/* Interactive Frame Box */}
          <div
            className={`h-full flex flex-col rounded-[36px] border-4 border-zinc-800/90 bg-zinc-950 shadow-2xl overflow-hidden transition-all duration-300 relative ${
              deviceView === "mobile"
                ? "w-[380px]"
                : deviceView === "tablet"
                ? "w-[620px]"
                : "w-full max-w-4xl"
            }`}
            style={{
              "--primary-color": form.primaryColor,
              "--secondary-color": form.secondaryColor,
            }}
          >
            {/* Mockup Mobile Status Bar */}
            <div className="flex h-7 shrink-0 items-center justify-between px-6 bg-black/80 text-[10px] text-zinc-300 font-semibold border-b border-black/10 z-20">
              <span>9:41</span>
              <div className="h-3.5 w-20 rounded-full bg-black mx-auto" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* REAL-TIME LIVE TEMPLATE SIMULATOR */}
            <div className="flex-1 w-full h-full relative bg-zinc-950">
              <iframe
                ref={iframeRef}
                allow="clipboard-write; clipboard-read; autoplay"
                src={userTemplateUrl(`${
                  form.code ||
                  (form.presetId === "GARDEN_ROYAL"
                    ? "garden-royal-khmer-wedding"
                    : form.presetId === "KHMER_GOLDEN" || form.presetId === "CHAMPAGNE"
                    ? "cover-khmer-golden-wedding"
                    : form.presetId === "ROYAL_KHMER" || form.presetId === "RUBY_RED"
                    ? "royal-khmer-wedding"
                    : form.presetId === "EMERALD_GREEN"
                    ? "emerald-canva-luxe-wedding"
                    : "the-digital-yes-wedding")
                }/preview?embed=true`)}
                className={`w-full h-full border-0 bg-zinc-950 ${
                  isDraggingDivider ? "pointer-events-none" : ""
                }`}
                title="Live User Template Preview"
                onLoad={() => {
                  if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(
                      {
                        type: "LIVE_PREVIEW_SYNC",
                        data: form,
                      },
                      "*"
                    );
                    if (previewGateOpen) {
                      iframeRef.current.contentWindow.postMessage(
                        {
                          type: "TOGGLE_GATE",
                          open: true,
                          isOpen: true,
                        },
                        "*"
                      );
                    }
                  }
                }}
              />
            </div>
          </div>
        </main>
      </div>

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
