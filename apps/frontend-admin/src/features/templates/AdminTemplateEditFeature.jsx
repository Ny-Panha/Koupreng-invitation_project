import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Type,
  X,
  Check,
  Globe,
  LayoutTemplate,
} from "lucide-react";
import { Toast, DatePicker, TimePicker } from "../../shared/ui";
import { useToast } from "../../shared/hooks";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";
import { userTemplateUrl } from "../../shared/config/runtime";
import {
  TemplateCoverSection,
  TemplateGallerySection,
  TemplateQrSection,
  TemplateSectionOrderManager,
  DEFAULT_SECTIONS_LIST,
} from "./components";

// Template UI Layout Options - Only 100% Unique, Fully-functional Layouts
const TEMPLATE_LAYOUT_OPTIONS = [
  {
    code: "khmer-celestial",
    name: "Khmer Celestial",
    labelKh: "ផ្កា & ពន្លឺមាសប្រណិត",
    desc: "រចនាបទផ្កា ស៊ុម Botanical ព័ទ្ធជុំវិញ និងពន្លឺផ្កាយមាស (Flagship)",
    badge: "Flagship",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: "🌸",
  },
  {
    code: "the-digital-yes-wedding",
    name: "The Digital Yes",
    labelKh: "ស្រោមសំបុត្រ 3D & ផ្កាធ្លាក់",
    desc: "ស្រោមសំបុត្របិទត្រា Wax Seal ចុចរបើកហូតសំបុត្រ + ផ្កាធ្លាក់",
    badge: "Interactive",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    icon: "💌",
  },
  {
    code: "emerald-canva-luxe-wedding",
    name: "Emerald Luxe",
    labelKh: "កាត 3D Flip & វាំងននកម្ញី",
    desc: "វាំងននកម្ញី Velvet បៃតងត្បូងមរកត + បង្វិលកាត 3D Flip",
    badge: "Luxury",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: "🌿",
  },
  {
    code: "template-boilerplate",
    name: "Custom Boilerplate",
    labelKh: "គំរូ Starter ថ្មីសម្រាប់ Custom",
    desc: "Layout គំរូស្រាល លឿន សម្រាប់ Developer កែប្រែតាមចិត្ត",
    badge: "Starter",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    icon: "🚀",
  },
];

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
    id: "KHMER_CELESTIAL",
    name: "Khmer Celestial (ខ្មែរចន្ទតារា)",
    primary: "#541722",
    secondary: "#B88A3A",
    bg: "#F7F0E4",
    badge: "Khmer Celestial",
    amp: "◆",
    fontKhmer: "Moul",
    fontLatin: "Cormorant Garamond",
    dressColors: [
      { hex: "#541722", name: "ក្រហមទុំ" },
      { hex: "#B88A3A", name: "មាស" },
      { hex: "#EAD39E", name: "សាំប៉ាញ" },
      { hex: "#FFFAF2", name: "ភ្លុក" },
    ],
    backgroundImage: "/invitations/khmer-celestial/botanical-frame.jpg",
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

const ensureGoogleFontLoaded = (fontFamily) => {
  if (!fontFamily || typeof document === "undefined") return;
  const cleanName = fontFamily.trim().replace(/^['"]|['"]$/g, "");
  const fontId = `gfont-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}&display=swap`;
  document.head.appendChild(link);
};

const ensureCustomFontFace = (fontFamily, fontUrl) => {
  if (!fontFamily || !fontUrl || typeof document === "undefined" || typeof FontFace === "undefined") return;
  const cleanName = fontFamily.trim().replace(/^['"]|['"]$/g, "");
  try {
    const font = new FontFace(cleanName, `url("${fontUrl}")`);
    font.load().then((loaded) => {
      document.fonts.add(loaded);
    }).catch(() => {});
  } catch {}
};

const KHMER_FONTS = [
  // 👑 Royal & Traditional Khmer Wedding Fonts
  { value: "Moul", label: "Moul (អក្សរមូលឆ្លាក់បុរាណ)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Bayon", label: "Bayon (អក្សរបាយ័ន បុរាណរាជវាំង)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Koulen", label: "Koulen (អក្សរគូលែន ដិតស្រួចអំណាច)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Preahvihear", label: "Preahvihear (អក្សរព្រះវិហារ ថ្លៃថ្នូរ)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Angkor", label: "Angkor (អក្សរអង្គរ បុរាណវិចិត្រ)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Dangrek", label: "Dangrek (អក្សរដងរែក សង្ហាស្វាហាប់)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Bokor", label: "Bokor (អក្សរបូកគោ បែបសិល្បៈឆ្លាក់)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Chenla", label: "Chenla (អក្សរចេនឡា កេរដំណែលបុរាណ)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Taprom", label: "Taprom (អក្សរតាព្រហ្ម បែបសក្ការៈ)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },
  { value: "Suwannaphum", label: "Suwannaphum (អក្សរសុវណ្ណភូមិ)", group: "👑 ម៉ូតបុរាណ & រាជវាំង" },

  // ✨ Modern & Soft Khmer Fonts
  { value: "Kantumruy Pro", label: "Kantumruy Pro (សម័យទំនើបស្អាត)", group: "✨ ម៉ូតសម័យទំនើប & ស្រទន់" },
  { value: "Battambang", label: "Battambang (ស្រទន់រៀបរយ)", group: "✨ ម៉ូតសម័យទំនើប & ស្រទន់" },
  { value: "Siemreap", label: "Siemreap (រៀបរយទន់ភ្លន់)", group: "✨ ម៉ូតសម័យទំនើប & ស្រទន់" },
  { value: "Fasthand", label: "Fasthand (អក្សរសរសេរដៃរហ័ស)", group: "✨ ម៉ូតសម័យទំនើប & ស្រទន់" },
  { value: "Nokora", label: "Nokora (អក្សរនគរាជ សង្ហារៀបរយ)", group: "✨ ម៉ូតសម័យទំនើប & ស្រទន់" },
];

const LATIN_FONTS = [
  // 💎 Luxury Roman & Serif
  { value: "Cinzel", label: "Cinzel (Royal Classical Roman)", group: "💎 Luxury Roman & Serif" },
  { value: "Cinzel Decorative", label: "Cinzel Decorative (Royal Ornate)", group: "💎 Luxury Roman & Serif" },
  { value: "Playfair Display", label: "Playfair Display (Luxury Editorial)", group: "💎 Luxury Roman & Serif" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond (Ultra Elegant Fine Serif)", group: "💎 Luxury Roman & Serif" },

  // ✒️ Calligraphy & Script
  { value: "Great Vibes", label: "Great Vibes (Romantic Calligraphy)", group: "✒️ Calligraphy & Script" },
  { value: "Alex Brush", label: "Alex Brush (Classic Graceful Script)", group: "✒️ Calligraphy & Script" },
  { value: "Pinyon Script", label: "Pinyon Script (Aristocratic French Script)", group: "✒️ Calligraphy & Script" },
  { value: "Allura", label: "Allura (Flowing Handwritten Script)", group: "✒️ Calligraphy & Script" },

  // 🏢 Modern Sans
  { value: "Montserrat", label: "Montserrat (Clean Luxury Sans)", group: "🏢 Modern Sans" },
  { value: "Inter", label: "Inter (Clean Contemporary)", group: "🏢 Modern Sans" },
];

const POPULAR_GOOGLE_FONTS_SUGGESTIONS = [
  { name: "Odor Mean Chey", category: "khmer" },
  { name: "Koh Santepheap", category: "khmer" },
  { name: "Kdam Thmor Pro", category: "khmer" },
  { name: "MonteCarlo", category: "latin" },
  { name: "Italianno", category: "latin" },
  { name: "Parisienne", category: "latin" },
  { name: "Marck Script", category: "latin" },
  { name: "Satisfy", category: "latin" },
];

export const TYPOGRAPHY_ELEMENTS = [
  { id: "couple", label: "1. 💑 ឈ្មោះគូដណ្ដឹង", sub: "Couple Names", previewText: "នី បញ្ញា & កត់ ស្រីផ្កាយ" },
  { id: "date", label: "2. 📅 កាលបរិច្ឆេទ", sub: "Date Text", previewText: "ថ្ងៃពុធ ២៨ មករា ២០២៦" },
  { id: "time", label: "3. ⏰ ពេលវេលា", sub: "Time Text", previewText: "១៧:០០" },
  { id: "subtitle", label: "4. 💌 ពាក្យអញ្ជើញ", sub: "Subtitle", previewText: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ" },
  { id: "guestLabel", label: "5. 🏷️ ពាក្យស្វាគមន៍", sub: "Guest Label", previewText: "ជូនចំពោះ:" },
  { id: "guestName", label: "6. 👤 ឈ្មោះភ្ញៀវ", sub: "Guest Name", previewText: "លោកអ្នក និងក្រុមគ្រួសារ" },
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
  elementFonts: {
    couple: "",
    date: "",
    time: "",
    subtitle: "",
    guestLabel: "",
    guestName: "",
  },
  customFonts: [],
  mood: "light",

  // Hero & Envelope & Motion (Media Cover Styles)
  gateStyle: "celestial-cover",
  openingStyle: "celestial-cover",
  cardMotion: "3D_FLIP",
  cardLayout: "3D_FLIP",
  bgMusicUrl: "/music/wedding.mp3",
  videoUrl: "",
  openingVideoUrl: "",
  showCoverVideo: false,
  enableFloatingBar: true,
  showBrandMark: true,
  brandMark: "/invitations/khmer-celestial/koupreng-gold-mark.webp",
  showOpenButton: true,
  openButtonImage: "/invitations/khmer-celestial/butto_invitation.webp",
  showGuestBanner: true,
  guestNameBanner: "/invitations/khmer-celestial/guest-name-banner1.webp",
  invitationTitle: "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
  invitationSubtitle: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
  guestLabel: "ជូនចំពោះ:",
  guestName: "លោកអ្នក និងក្រុមគ្រួសារ",
  coverImage: "/facebook/all/03-card/cover-card.jpg",
  backgroundImage: "/invitations/khmer-celestial/botanical-frame.jpg",
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
  sectionOrder: DEFAULT_SECTIONS_LIST.map((s) => s.key),
};

function VisualKhmerFontPicker({
  value,
  onChange,
  inheritFont = "",
  customFonts = [],
  sampleText = "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
}) {
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredFonts = useMemo(() => {
    let list = [];
    if (filterCategory === "royal") {
      list = KHMER_FONTS.filter((f) => f.group.includes("បុរាណ"));
    } else if (filterCategory === "modern") {
      list = KHMER_FONTS.filter((f) => f.group.includes("សម័យ"));
    } else if (filterCategory === "custom") {
      list = customFonts.map((cf) => ({
        value: cf.value,
        label: cf.label,
        sub: "Custom Font",
        isCustom: true,
      }));
    } else {
      const customList = customFonts.map((cf) => ({
        value: cf.value,
        label: cf.label,
        sub: "Custom Font",
        isCustom: true,
      }));
      list = [...customList, ...KHMER_FONTS];
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.value.toLowerCase().includes(q) ||
          f.label.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filterCategory, search, customFonts]);

  const isInherited = !value;

  return (
    <div className="space-y-2">
      {/* Category Filter Pills & Search */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === "all"
                ? "bg-amber-500 text-black font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800"
            }`}
          >
            ទាំងអស់ ({KHMER_FONTS.length + customFonts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("royal")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === "royal"
                ? "bg-amber-500 text-black font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800"
            }`}
          >
            👑 បុរាណ
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("modern")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === "modern"
                ? "bg-amber-500 text-black font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800"
            }`}
          >
            ✨ សម័យ
          </button>
          {customFonts.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterCategory("custom")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === "custom"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800"
              }`}
            >
              ⭐ Custom ({customFonts.length})
            </button>
          )}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ស្វែងរក..."
          className="h-6 w-24 sm:w-28 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-[10px] text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500/80"
        />
      </div>

      {/* Visual Font Cards Grid */}
      <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1 no-scrollbar select-none">
        {filteredFonts.map((f) => {
          const isSelected = value === f.value || (!value && f.value === (inheritFont || "Moul"));
          const cleanDesc = f.label.replace(f.value, "").replace(/[()]/g, "").trim();

          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onChange(f.value)}
              className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-400 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10"
                  : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70"
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-0.5">
                <span className={`text-[11px] font-bold truncate ${isSelected ? "text-amber-300" : "text-zinc-300 group-hover:text-white"}`}>
                  {f.value}
                </span>
                {isSelected ? (
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[9px] font-black shrink-0 shadow-sm">
                    ✓
                  </span>
                ) : (
                  <span className="text-[9px] text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    រើស
                  </span>
                )}
              </div>

              {/* Sample Text Rendered in this EXACT Font */}
              <div
                className={`text-sm leading-normal py-0.5 truncate transition-colors ${
                  isSelected ? "text-amber-200 font-medium" : "text-zinc-200 group-hover:text-zinc-100"
                }`}
                style={{ fontFamily: `"${f.value}", "Moul", serif` }}
              >
                {sampleText}
              </div>

              <div className="mt-0.5 text-[9px] text-zinc-500 truncate">
                {cleanDesc || f.sub || "Khmer Font"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminTemplateEditPage() {
  const { lang, t } = useAdminLanguage();
  const { templateId } = useParams();
  const isNew = templateId === "new";
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();

  const [activeTab, setActiveTab] = useState("theme"); // 'theme' | 'couple' | 'events' | 'venue' | 'settings'
  const [themeSubTab, setThemeSubTab] = useState("layouts"); // 'layouts' | 'presets' | 'cover'
  const [coverSubTab, setCoverSubTab] = useState("media"); // 'media' | 'ornaments' | 'text' | 'music'
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioPlayerRef = useRef(null);
  const musicFileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);
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
  const bgFileInputRef = useRef(null);
  const brandMarkFileInputRef = useRef(null);
  const openButtonFileInputRef = useRef(null);
  const guestBannerFileInputRef = useRef(null);

  // Custom Fonts State
  const [customFonts, setCustomFonts] = useState(() => {
    try {
      const saved = localStorage.getItem("koupreng_custom_fonts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedFontElement, setSelectedFontElement] = useState("couple");
  const [showFontModal, setShowFontModal] = useState(false);
  const [fontModalTab, setFontModalTab] = useState("google"); // 'google' | 'file'
  const [newFontName, setNewFontName] = useState("");
  const [newFontCategory, setNewFontCategory] = useState("khmer"); // 'khmer' | 'latin'
  const fontFileInputRef = useRef(null);

  // Dynamic Font Loading in Admin Studio
  useEffect(() => {
    if (form.fontKhmer) ensureGoogleFontLoaded(form.fontKhmer);
    if (form.fontLatin) ensureGoogleFontLoaded(form.fontLatin);
    if (form.elementFonts) {
      Object.values(form.elementFonts).forEach((f) => {
        if (f) ensureGoogleFontLoaded(f);
      });
    }
    if (Array.isArray(customFonts)) {
      customFonts.forEach((cf) => {
        if (cf.source === "google") {
          ensureGoogleFontLoaded(cf.value);
        } else if (cf.source === "file" && cf.dataUrl) {
          ensureCustomFontFace(cf.value, cf.dataUrl);
        }
      });
    }
  }, [form.fontKhmer, form.fontLatin, form.elementFonts, customFonts]);

  const customKhmerFonts = customFonts.filter((f) => f.category === "khmer");
  const customLatinFonts = customFonts.filter((f) => f.category === "latin");

  const handleAddGoogleFont = (fontNameInput, categoryInput) => {
    const clean = (fontNameInput || newFontName).trim();
    if (!clean) {
      show("សូមបញ្ចូលឈ្មោះ Google Font", "error");
      return;
    }
    const cat = categoryInput || newFontCategory;
    const exists = customFonts.some((f) => f.value.toLowerCase() === clean.toLowerCase());
    if (exists) {
      show(`ពុម្ពអក្សរ "${clean}" មានរួចហើយ`, "error");
      return;
    }

    ensureGoogleFontLoaded(clean);
    const newEntry = {
      id: `custom-gfont-${Date.now()}`,
      value: clean,
      label: `${clean} (Custom Google Font)`,
      category: cat,
      source: "google",
    };

    const updated = [...customFonts, newEntry];
    setCustomFonts(updated);
    try {
      localStorage.setItem("koupreng_custom_fonts", JSON.stringify(updated));
    } catch {}

    if (cat === "khmer") {
      setField("fontKhmer", clean);
    } else {
      setField("fontLatin", clean);
    }

    setNewFontName("");
    setShowFontModal(false);
    show(`បានបន្ថែមពុម្ពអក្សរ "${clean}" ជោគជ័យ ✓`);
  };

  const handleUploadFontFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const fontName = newFontName.trim() || baseName;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;

      ensureCustomFontFace(fontName, dataUrl);
      const newEntry = {
        id: `custom-file-${Date.now()}`,
        value: fontName,
        label: `${fontName} (Uploaded File)`,
        category: newFontCategory,
        source: "file",
        dataUrl,
      };

      const updated = [...customFonts, newEntry];
      setCustomFonts(updated);
      try {
        localStorage.setItem("koupreng_custom_fonts", JSON.stringify(updated));
      } catch {}

      if (newFontCategory === "khmer") {
        setField("fontKhmer", fontName);
      } else {
        setField("fontLatin", fontName);
      }

      setNewFontName("");
      setShowFontModal(false);
      show(`បាន Upload និងប្រើប្រាស់ពុម្ពអក្សរ "${fontName}" ជោគជ័យ ✓`);
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteCustomFont = (fontId, fontVal, cat) => {
    const updated = customFonts.filter((f) => f.id !== fontId);
    setCustomFonts(updated);
    try {
      localStorage.setItem("koupreng_custom_fonts", JSON.stringify(updated));
    } catch {}

    if (cat === "khmer" && form.fontKhmer === fontVal) {
      setField("fontKhmer", "Moul");
    } else if (cat === "latin" && form.fontLatin === fontVal) {
      setField("fontLatin", "Playfair Display");
    }
    show("បានលុបពុម្ពអក្សរផ្ទាល់ខ្លួនចេញ ✓");
  };

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
  const broadcastSync = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "LIVE_PREVIEW_SYNC",
          data: { ...form, customFonts, selectedFontElement },
        },
        "*"
      );
    } catch {
      // ignore
    }
  }, [form, customFonts, selectedFontElement]);

  useEffect(() => {
    broadcastSync();
  }, [broadcastSync, selectedFontElement]);

  useEffect(() => {
    const handlePreviewHandshake = (event) => {
      if (
        event.data?.type === "PREVIEW_READY" ||
        event.data?.type === "REQUEST_PREVIEW_SYNC"
      ) {
        broadcastSync();
        if (previewGateOpen && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              {
                type: "TOGGLE_GATE",
                open: true,
                isOpen: true,
              },
              "*"
            );
          } catch {}
        }
      }

      if (event.data?.type === "SELECT_TARGET_ELEMENT" && event.data.elementId) {
        setSelectedFontElement(event.data.elementId);
        setActiveTab("theme");
        setThemeSubTab("presets");
        setTimeout(() => {
          const targetCard = document.getElementById("typography-element-settings");
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
            targetCard.classList.add("ring-2", "ring-amber-400");
            setTimeout(() => targetCard.classList.remove("ring-2", "ring-amber-400"), 1200);
          }
        }, 50);
      }
    };
    window.addEventListener("message", handlePreviewHandshake);
    return () => window.removeEventListener("message", handlePreviewHandshake);
  }, [broadcastSync, previewGateOpen]);

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

        if (Array.isArray(parsedConfig.customFonts) && parsedConfig.customFonts.length > 0) {
          setCustomFonts((prev) => {
            const map = new Map();
            [...prev, ...parsedConfig.customFonts].forEach((item) => {
              if (item?.value) map.set(item.value.toLowerCase(), item);
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem("koupreng_custom_fonts", JSON.stringify(merged));
            } catch {}
            return merged;
          });
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
      KHMER_CELESTIAL: "khmer-celestial",
      GOLD_LUXURY: "the-digital-yes-wedding",
      EMERALD_GREEN: "emerald-canva-luxe-wedding",
      RUBY_RED: "khmer-celestial",
      CHAMPAGNE: "cover-khmer-golden-wedding",
      ROYAL_KHMER: "khmer-celestial",
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
      backgroundImage: preset.backgroundImage !== undefined ? preset.backgroundImage : prev.backgroundImage,
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

    if (!file.type.startsWith("image/") || file.type.includes("svg") || file.name.toLowerCase().endsWith(".svg")) {
      show(lang === "en" ? "Please select an image file (PNG, JPG, WEBP)" : "សូមជ្រើសរើសប្រភេទ File រូបភាព (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      show(lang === "en" ? "Image size exceeds 5MB (Max: 5MB)" : "ទំហំរូបភាពធំជាង 5MB សូមបន្ថយទំហំរូបភាព (អតិបរមា 5MB)", "error");
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

    if (!file.type.startsWith("image/") || file.type.includes("svg") || file.name.toLowerCase().endsWith(".svg")) {
      show(lang === "en" ? "Please select an image file (PNG, JPG, WEBP)" : "សូមជ្រើសរើសប្រភេទ File រូបភាព (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      show(lang === "en" ? "Image size exceeds 5MB (Max: 5MB)" : "ទំហំរូបភាពធំជាង 5MB សូមបន្ថយទំហំរូបភាព (អតិបរមា 5MB)", "error");
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

  const handleBackgroundFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.type.includes("svg") || file.name.toLowerCase().endsWith(".svg")) {
      show(lang === "en" ? "Please select an image file (PNG, JPG, WEBP)" : "សូមជ្រើសរើសប្រភេទ File រូបភាព (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      show(lang === "en" ? "Image size exceeds 5MB (Max: 5MB)" : "ទំហំរូបភាពធំជាង 5MB សូមបន្ថយទំហំរូបភាព (អតិបរមា 5MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setField("backgroundImage", result);
        show(lang === "en" ? "Background frame image uploaded ✓" : "បានជ្រើសរើសរូបភាពផ្ទៃខាងក្រោយ/ស៊ុមផ្កា ជោគជ័យ ✓");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenericImageUpload = (e, fieldName, successMessage) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      show(lang === "en" ? "Please select an image file (PNG, JPG, WEBP, SVG)" : "សូមជ្រើសរើសប្រភេទ File រូបភាព (PNG, JPG, WEBP, SVG)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      show(lang === "en" ? "Image size exceeds 5MB (Max: 5MB)" : "ទំហំរូបភាពធំជាង 5MB សូមបន្ថយទំហំរូបភាព (អតិបរមា 5MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setField(fieldName, result);
        show(successMessage || (lang === "en" ? "Image uploaded ✓" : "បានបញ្ចូលរូបភាពជោគជ័យ ✓"));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      show(lang === "en" ? "Please select a video file (MP4, WebM)" : "សូមជ្រើសរើសប្រភេទ File វីដេអូ (MP4, WebM)", "error");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      show(lang === "en" ? "Video file exceeds 50MB" : "ទំហំវីដេអូធំជាង 50MB សូមជ្រើសរើសវីដេអូតូចជាង 50MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setField("videoUrl", result);
        setField("openingVideoUrl", result);
        show(lang === "en" ? "Video uploaded successfully ✓" : "បានបញ្ចូលវីដេអូជោគជ័យ ✓");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const MUSIC_PRESETS = [
    {
      id: "waiting-day",
      title: "ថ្ងៃដែលរង់ចាំ (Official Song)",
      artist: "ចម្រៀងមង្គលការខ្មែរ",
      url: "/music/wedding-waiting-day.mp3",
      tag: "Vocal",
    },
    {
      id: "instrumental",
      title: "Instrumental Wedding Music",
      artist: "VioSounds Classical Violin Cover",
      url: "/music/instrumental-wedding.m4a",
      tag: "Violin",
    },
    {
      id: "default",
      title: "បទភ្លេងលំនាំដើម (Default)",
      artist: "Traditional Suite",
      url: "/music/wedding.mp3",
      tag: "Default",
    },
  ];

  const handleSelectMusic = (url) => {
    setField("bgMusicUrl", url);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingMusic(false);
      audioPlayerRef.current.src = url;
    }
  };

  const toggleMusicPreview = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingMusic) {
      audioPlayerRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioPlayerRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));
    }
  };

  const handleMusicFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|m4a|wav|ogg)$/i)) {
      show(lang === "en" ? "Please select an audio file (MP3, M4A, WAV)" : "សូមជ្រើសរើសប្រភេទ File សំឡេង (MP3, M4A, WAV)", "error");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      show(lang === "en" ? "Audio file exceeds 15MB" : "ទំហំសំឡេងធំជាង 15MB សូមជ្រើសរើស File តូចជាងនេះ", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setField("bgMusicUrl", result);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = result;
          audioPlayerRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
        }
        show(lang === "en" ? "Wedding music uploaded ✓" : "បានបញ្ចូលបទភ្លេងមង្គលការជោគជ័យ ✓");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.type.startsWith("image/") && !f.type.includes("svg") && !f.name.toLowerCase().endsWith(".svg"));
    if (validFiles.length === 0) {
      show(lang === "en" ? "Please select valid image files (PNG, JPG, WEBP)" : "សូមជ្រើសរើសប្រភេទ File រូបភាព (PNG, JPG, WEBP)", "error");
      return;
    }

    const oversized = validFiles.some((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      show(lang === "en" ? "Some images exceed 5MB. Max size is 5MB per photo." : "រូបភាពមួយចំនួនធំជាង 5MB។ អតិបរមា 5MB ក្នុងមួយសន្លឹក។", "error");
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
        code: form.code,
        presetId: form.presetId,
        theme: form.presetId,
        gateStyle: form.gateStyle || "celestial-cover",
        openingStyle: form.gateStyle || "celestial-cover",
        cardMotion: form.cardMotion || "3D_FLIP",
        cardLayout: form.cardMotion || "3D_FLIP",
        bgMusicUrl: form.bgMusicUrl,
        videoUrl: form.videoUrl || form.openingVideoUrl || "",
        openingVideoUrl: form.openingVideoUrl || form.videoUrl || "",
        showButterflies: form.showButterflies !== false,
        showBrandMark: form.showBrandMark !== false && Boolean(form.brandMark),
        brandMark: form.showBrandMark === false ? "" : (form.brandMark || ""),
        showGuestBanner: form.showGuestBanner !== false && Boolean(form.guestNameBanner),
        guestNameBanner: form.showGuestBanner === false ? "" : (form.guestNameBanner || ""),
        showOpenButton: form.showOpenButton !== false && Boolean(form.openButtonImage),
        openButtonImage: form.showOpenButton === false ? "" : (form.openButtonImage || ""),
        enableFloatingBar: form.enableFloatingBar !== false,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        backgroundColor: form.backgroundColor,
        badgeText: form.badgeText,
        ampSymbol: form.ampSymbol,
        fontKhmer: form.fontKhmer,
        fontLatin: form.fontLatin,
        customFonts: customFonts,
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
        code: form.code,
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
                    onClick={() => setThemeSubTab("layouts")}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                      themeSubTab === "layouts"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    <span>ម៉ូដ Template (UI Layouts)</span>
                  </button>
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

                {themeSubTab === "layouts" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <LayoutTemplate className="h-4 w-4 text-amber-500" />
                          <span>រចនាបថម៉ូដ Template (UI Layout Engines)</span>
                        </h3>
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          {form.code || "khmer-celestial"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        ជ្រើសរើស Architecture & Interactive Style របស់ទំព័រធៀបការ។ ចុចប្តូរ Layout ដើម្បីមើល Live Preview ខាងស្តាំភ្លាមៗ។
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {TEMPLATE_LAYOUT_OPTIONS.map((layout) => {
                        const isSelected = (form.code || "khmer-celestial") === layout.code;
                        return (
                          <button
                            key={layout.code}
                            type="button"
                            onClick={() => {
                              setField("code", layout.code);
                              show(`បានប្តូរទៅកាន់ម៉ូដ: ${layout.name}`, "success");
                            }}
                            className={`group relative text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                                : "bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`text-2xl p-2.5 rounded-xl border ${
                                    isSelected
                                      ? "bg-amber-500/20 border-amber-500/40"
                                      : "bg-zinc-800 border-zinc-700/60 group-hover:border-zinc-600"
                                  }`}
                                >
                                  {layout.icon}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4
                                      className={`text-sm font-bold ${
                                        isSelected ? "text-amber-300" : "text-zinc-100 group-hover:text-white"
                                      }`}
                                    >
                                      {layout.name}
                                    </h4>
                                    <span
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${layout.badgeColor}`}
                                    >
                                      {layout.badge}
                                    </span>
                                  </div>
                                  <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                                    {layout.labelKh}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center shrink-0">
                                {isSelected ? (
                                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                                    <Check className="h-3 w-3" />
                                    <span>កំពុងប្រើ</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-zinc-500 group-hover:text-amber-400 px-2.5 py-1 rounded-lg border border-transparent group-hover:border-zinc-700 group-hover:bg-zinc-800/60 transition">
                                    ជ្រើសរើស
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-400 mt-2 pl-12 leading-relaxed">
                              {layout.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                                  key={`preset-${preset.id}-color-${i}`}
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
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Type className="h-4 w-4 text-amber-500" />
                            <span>ពុម្ពអក្សរធៀបការ (Typography & Fonts)</span>
                          </h3>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            កំណត់ Font រួម ឬបំបែកកំណត់តាម Element ទាំង ៦ លើក្របសំបុត្រ
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowFontModal(true)}
                          className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition cursor-pointer shadow-sm shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Add Custom Font</span>
                        </button>
                      </div>

                      {/* Selected Element Font Settings Card */}
                      {(() => {
                        const activeElem = TYPOGRAPHY_ELEMENTS.find((e) => e.id === selectedFontElement) || TYPOGRAPHY_ELEMENTS[0];
                        const currentElementFont = form.elementFonts?.[selectedFontElement] || "";
                        const effectiveFont = currentElementFont || form.fontKhmer;
                        const isCustomized = Boolean(currentElementFont);
                        const elementSampleText = (() => {
                          if (selectedFontElement === "couple") return `${form.groomName || "ជា វណ្ណដា"} & ${form.brideName || "សុខ ស្រីពេជ្រ"}`;
                          if (selectedFontElement === "date") return form.weddingDate || "ថ្ងៃពុធ ២៨ មករា ២០២៦";
                          if (selectedFontElement === "time") return form.weddingTime || "១៧:០០";
                          if (selectedFontElement === "subtitle") return form.invitationSubtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ";
                          if (selectedFontElement === "guestLabel") return form.guestLabel || "ជូនចំពោះ:";
                          if (selectedFontElement === "guestName") return form.guestName || "លោកអ្នក និងក្រុមគ្រួសារ";
                          return form.invitationTitle || "សិរីសួស្តី អាពាហ៍ពិពាហ៍";
                        })();

                        return (
                          <div id="typography-element-settings" className="space-y-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 transition-all duration-300">
                            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-zinc-800/80">
                              <div className="flex items-center gap-2 flex-wrap">
                                <label className="text-xs font-semibold text-zinc-400">
                                  Element:
                                </label>
                                <select
                                  value={selectedFontElement}
                                  onChange={(e) => setSelectedFontElement(e.target.value)}
                                  className="text-xs font-bold bg-zinc-900 border border-amber-500/40 rounded-lg px-2.5 py-1 text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                  {TYPOGRAPHY_ELEMENTS.map((elem) => (
                                    <option key={elem.id} value={elem.id}>
                                      {elem.label}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                                  Font: {effectiveFont}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-400 hidden sm:inline-flex items-center gap-1 font-medium">
                                ⚡ ចុចលើអក្សរក្នុង Live Simulator ដើម្បីរើស
                              </span>
                            </div>

                            {/* Visual Font Selector */}
                            <VisualKhmerFontPicker
                              value={currentElementFont}
                                onChange={(val) => {
                                  const nextElementFonts = {
                                    ...(form.elementFonts || {}),
                                    [selectedFontElement]: val,
                                  };
                                  setForm((prev) => ({
                                    ...prev,
                                    elementFonts: nextElementFonts,
                                  }));
                                  if (val) ensureGoogleFontLoaded(val);
                                  if (iframeRef.current?.contentWindow) {
                                    try {
                                      iframeRef.current.contentWindow.postMessage(
                                        {
                                          type: "LIVE_PREVIEW_SYNC",
                                          data: {
                                            ...form,
                                            elementFonts: nextElementFonts,
                                            customFonts,
                                          },
                                        },
                                        "*"
                                      );
                                    } catch {}
                                  }
                                }}
                                inheritFont={form.fontKhmer}
                                customFonts={customKhmerFonts}
                                sampleText={elementSampleText}
                              />

                            {/* Quick Text Editor for Selected Element */}
                            {selectedFontElement === "couple" && (
                              <div className="space-y-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                <label className="text-[11px] font-medium text-amber-300 flex items-center justify-between">
                                  <span>💑 កែប្រែឈ្មោះកូនកំលោះ & កូនក្រមុំ (Couple Names):</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">Live Edit</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={form.groomName || ""}
                                    onChange={(e) => setField("groomName", e.target.value)}
                                    placeholder="ឈ្មោះកូនកំលោះ (Groom)"
                                    className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                                  />
                                  <input
                                    type="text"
                                    value={form.brideName || ""}
                                    onChange={(e) => setField("brideName", e.target.value)}
                                    placeholder="ឈ្មោះកូនក្រមុំ (Bride)"
                                    className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>
                            )}

                            {selectedFontElement === "date" && (
                              <div className="space-y-1.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                <label className="text-[11px] font-medium text-amber-300 flex items-center justify-between">
                                  <span>📅 កែប្រែកាលបរិច្ឆេទ (Wedding Date):</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">DatePicker</span>
                                </label>
                                <DatePicker
                                  value={form.weddingDate}
                                  onChange={(dateVal, isoVal) => {
                                    setField("weddingDate", dateVal);
                                    if (isoVal) setField("targetDate", isoVal);
                                  }}
                                  placeholder="ជ្រើសរើសថ្ងៃមង្គលការ"
                                />
                              </div>
                            )}

                            {selectedFontElement === "time" && (
                              <div className="space-y-1.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                <label className="text-[11px] font-medium text-amber-300 flex items-center justify-between">
                                  <span>⏰ កែប្រែពេលវេលា (Wedding Time):</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">TimePicker</span>
                                </label>
                                <TimePicker
                                  value={form.weddingTime}
                                  onChange={(timeVal) => setField("weddingTime", timeVal)}
                                  placeholder="ជ្រើសរើសម៉ោង"
                                />
                              </div>
                            )}

                            {selectedFontElement === "subtitle" && (
                              <div className="space-y-1 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                <label className="text-[11px] font-medium text-amber-300 flex items-center justify-between">
                                  <span>💌 កែប្រែខ្លឹមសារពាក្យអញ្ជើញ (Subtitle Text):</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">Live Edit</span>
                                </label>
                                <input
                                  type="text"
                                  value={form.invitationSubtitle || ""}
                                  onChange={(e) => setField("invitationSubtitle", e.target.value)}
                                  placeholder="យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ"
                                  className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                                />
                              </div>
                            )}

                            {selectedFontElement === "guestLabel" && (
                              <div className="space-y-1 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                <label className="text-[11px] font-medium text-amber-300 flex items-center justify-between">
                                  <span>🏷️ កែប្រែពាក្យស្វាគមន៍ / ហៅភ្ញៀវ (Guest Label):</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">Live Edit</span>
                                </label>
                                <input
                                  type="text"
                                  value={form.guestLabel || ""}
                                  onChange={(e) => setField("guestLabel", e.target.value)}
                                  placeholder="ជូនចំពោះ:"
                                  className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                                />
                              </div>
                            )}

                            {selectedFontElement === "guestName" && (
                              <div className="space-y-1 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                <label className="text-[11px] font-medium text-amber-300 flex items-center justify-between">
                                  <span>👤 កែប្រែឈ្មោះភ្ញៀវតេស្ត (Preview Guest Name):</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">Live Edit</span>
                                </label>
                                <input
                                  type="text"
                                  value={form.guestName || ""}
                                  onChange={(e) => setField("guestName", e.target.value)}
                                  placeholder="លោកអ្នក និងក្រុមគ្រួសារ"
                                  className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Active Custom Fonts Manager List */}
                      {customFonts.length > 0 && (
                        <div className="pt-2 border-t border-zinc-800/60">
                          <span className="block text-[11px] font-bold text-zinc-400 mb-2">
                            ⭐ Custom Fonts ដែលបានបន្ថែម ({customFonts.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {customFonts.map((cf, idx) => (
                              <div
                                key={`cf-pill-${cf.id || cf.value}-${idx}`}
                                className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs text-zinc-200 shadow-sm"
                              >
                                <span className="font-semibold text-amber-300">{cf.value}</span>
                                <span className="text-[10px] text-zinc-400 uppercase">({cf.category})</span>
                                <button
                                  type="button"
                                  title="លុប Font នេះ"
                                  onClick={() => handleDeleteCustomFont(cf.id, cf.value, cf.category)}
                                  className="text-zinc-400 hover:text-rose-400 transition ml-1 cursor-pointer p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {themeSubTab === "cover" && (
                  <div className="space-y-6">
                    {/* Hidden Background File Input */}
                    <input
                      type="file"
                      ref={bgFileInputRef}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleBackgroundFileUpload}
                    />

                    {/* 1. Cover Style Selector (Pure Video & Image Driven) */}
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>ម៉ូដក្រប Cover បើកសំបុត្រ (Cover Styles)</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {(form.gateStyle === "cinematic-video")
                            ? "Full Video Mode"
                            : (form.videoUrl || form.openingVideoUrl)
                            ? "Video & Image Mode"
                            : "Image Mode (រូបភាពសុទ្ធ)"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          {
                            id: "celestial-cover",
                            name: "ខ្មែរចន្ទតារា",
                            sub: "Khmer Celestial",
                            icon: "✨",
                            tag: (form.videoUrl || form.openingVideoUrl) ? "Video & Image" : "រូបភាព (Image)",
                          },
                          {
                            id: "cinematic-video",
                            name: "វីដេអូបើកឆាក",
                            sub: "Cinematic Pre-wedding",
                            icon: "🎬",
                            tag: "Full Video",
                          },
                        ].map((item) => {
                          const isSelected = (form.gateStyle || "celestial-cover") === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setField("gateStyle", item.id);
                                setField("openingStyle", item.id);
                                if (item.id === "celestial-cover") {
                                  if (!form.backgroundImage) setField("backgroundImage", "/invitations/khmer-celestial/botanical-frame.jpg");
                                } else if (item.id === "cinematic-video") {
                                  if (!form.videoUrl) setField("videoUrl", "/invitations/khmer-celestial/burgundy-bokeh.mp4");
                                }
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
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    isSelected
                                      ? "bg-amber-500 text-black font-bold"
                                      : "bg-zinc-800 text-zinc-400"
                                  }`}
                                >
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

                    {/* ============================================================== */}
                    {/* SUB-TABS NAVIGATION (កាត់បន្ថយ Scrollbar និងធ្វើឱ្យ Clean) */}
                    {/* ============================================================== */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setCoverSubTab("media")}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                          coverSubTab === "media"
                            ? "bg-amber-500 text-black shadow-sm font-bold"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        <span>🎨 ផ្ទៃ &amp; វីដេអូ</span>
                      </button>
                      {(form.gateStyle || "celestial-cover") !== "cinematic-video" && (
                        <button
                          type="button"
                          onClick={() => setCoverSubTab("ornaments")}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                            coverSubTab === "ornaments"
                              ? "bg-amber-500 text-black shadow-sm font-bold"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                          }`}
                        >
                          <span>👑 គ្រឿងលម្អ</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCoverSubTab("text")}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                          coverSubTab === "text"
                            ? "bg-amber-500 text-black shadow-sm font-bold"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        <span>✍️ អត្ថបទ Cover</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverSubTab("music")}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                          coverSubTab === "music"
                            ? "bg-amber-500 text-black shadow-sm font-bold"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        <span>🎵 ភ្លេងកំដរ</span>
                      </button>
                    </div>

                    {/* ============================================================== */}
                    {/* TAB 1: 🎨 ផ្ទៃខាងក្រោយ & វីដេអូ (BACKGROUND & MEDIA) */}
                    {/* ============================================================== */}
                    {coverSubTab === "media" && (
                      <div className="space-y-3">
                        {/* Hidden Video File Input */}
                        <input
                          type="file"
                          ref={videoFileInputRef}
                          accept="video/mp4, video/webm, video/*"
                          className="hidden"
                          onChange={handleVideoFileUpload}
                        />

                        {/* 1.1 FULL VIDEO MODE */}
                        {(form.gateStyle || "celestial-cover") === "cinematic-video" && (
                          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                <span>🎬 វីដេអូបើកឆាកអាពាហ៍ពិពាហ៍ (Fullscreen Video)</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setField("videoUrl", "/invitations/khmer-celestial/burgundy-bokeh.mp4");
                                    setField("openingVideoUrl", "/invitations/khmer-celestial/burgundy-bokeh.mp4");
                                  }}
                                  className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 transition cursor-pointer"
                                >
                                  + Bokeh Burgundy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => videoFileInputRef.current?.click()}
                                  className="text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700/80 transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="h-3 w-3" />
                                  <span>Upload</span>
                                </button>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                              ✨ ម៉ូដ Full Video នឹងចាក់វីដេអូអាពាហ៍ពិពាហ៍ពេញអេក្រង់ទូរស័ព្ទ អមដោយប៊ូតុងសំឡេង និងប៊ូតុងរំលង (Skip) ចូលមើលសំបុត្រដោយស្វ័យប្រវត្តិ។
                            </div>
                          </div>
                        )}

                        {/* 1.2 BOKEH VIDEO (FOR HYBRID CELESTIAL COVER) */}
                        {(form.gateStyle || "celestial-cover") === "celestial-cover" && (
                          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                                <span>🎬 វីដេអូ Bokeh ផ្ទៃខាងក្រោយ</span>
                                {(form.videoUrl || form.openingVideoUrl) ? (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                    កំពុងប្រើ
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium">
                                    គ្មានវីដេអូ (រូបភាពសុទ្ធ)
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {(form.videoUrl || form.openingVideoUrl) ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setField("videoUrl", "");
                                      setField("openingVideoUrl", "");
                                      setField("showCoverVideo", false);
                                      show("បានដកចេញវីដេអូ (ប្តូរទៅជារូបភាពសុទ្ធ)");
                                    }}
                                    className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-lg border border-red-500/20 transition cursor-pointer"
                                  >
                                    🗑️ ដកវីដេអូចេញ
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setField("videoUrl", "/invitations/khmer-celestial/burgundy-bokeh.mp4");
                                      setField("openingVideoUrl", "/invitations/khmer-celestial/burgundy-bokeh.mp4");
                                      setField("showCoverVideo", true);
                                      show("បានបន្ថែម Burgundy Bokeh Video ✓");
                                    }}
                                    className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/20 transition cursor-pointer"
                                  >
                                    + Burgundy Bokeh
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => videoFileInputRef.current?.click()}
                                  className="text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-0.5 rounded-lg border border-zinc-700 transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="h-3 w-3" />
                                  <span>Upload</span>
                                </button>
                              </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
                              <input
                                type="checkbox"
                                checked={form.showButterflies !== false}
                                onChange={(e) => setField("showButterflies", e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                              />
                              <span className="text-xs font-medium text-zinc-300">
                                🦋 បង្ហាញមេអំបៅហោះ (Floating Butterflies)
                              </span>
                            </label>
                          </div>
                        )}

                        {/* 1.3 VISUAL IMAGE FRAME CARDS (FOR ALL NON-VIDEO MODES) */}
                        {(form.gateStyle || "celestial-cover") !== "cinematic-video" && (
                          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-zinc-200">
                                🌿 រូបភាពស៊ុមផ្កា &amp; ផ្ទៃខាងក្រោយ (Frame Styles)
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => bgFileInputRef.current?.click()}
                                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg border border-zinc-700 transition cursor-pointer"
                                >
                                  <Upload className="h-3 w-3" />
                                  <span>Upload</span>
                                </button>
                              </div>
                            </div>

                            {/* VISUAL CARDS GRID */}
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                {
                                  id: "botanical",
                                  title: "Botanical",
                                  src: "/invitations/khmer-celestial/botanical-frame.jpg",
                                },
                                {
                                  id: "corners",
                                  title: "Corners",
                                  src: "/invitations/khmer-celestial/ceremonial-corners.webp",
                                },
                                {
                                  id: "folio",
                                  title: "Royal Folio",
                                  src: "/invitations/khmer-celestial/ceremonial-folio.webp",
                                },
                              ].map((item) => {
                                const isSelected = form.backgroundImage === item.src;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setField("backgroundImage", item.src)}
                                    className={`relative p-1.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer group ${
                                      isSelected
                                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40"
                                        : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                                    }`}
                                  >
                                    <div className="w-full h-16 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/80">
                                      <img
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold ${
                                        isSelected ? "text-amber-400" : "text-zinc-400"
                                      }`}
                                    >
                                      {item.title}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ============================================================== */}
                    {/* TAB 2: 👑 គ្រឿងលម្អលើ COVER (LOGO, BUTTON, BANNER) */}
                    {/* ============================================================== */}
                    {coverSubTab === "ornaments" && (form.gateStyle || "celestial-cover") !== "cinematic-video" && (
                      <div className="space-y-3">
                        {/* Hidden File Inputs for Ornaments Upload */}
                        <input
                          type="file"
                          ref={brandMarkFileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleGenericImageUpload(e, "brandMark", "បានបញ្ចូល Logo មាសជោគជ័យ ✓")}
                        />
                        <input
                          type="file"
                          ref={openButtonFileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleGenericImageUpload(e, "openButtonImage", "បានបញ្ចូលរូបប៊ូតុងបើកសំបុត្រជោគជ័យ ✓")}
                        />
                        <input
                          type="file"
                          ref={guestBannerFileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleGenericImageUpload(e, "guestNameBanner", "បានបញ្ចូលរូបបូទ្រឈ្មោះភ្ញៀវជោគជ័យ ✓")}
                        />

                        {/* 2.1 LOGO MONOGRAM */}
                        {(() => {
                          const isBrandMarkActive = form.showBrandMark !== false && form.brandMark !== "" && form.brandMark !== "none";
                          return (
                            <div className={`rounded-2xl border transition-all p-3.5 space-y-2 ${
                              isBrandMarkActive ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-800/50 bg-zinc-950/40 opacity-80"
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-10 w-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden relative">
                                    {isBrandMarkActive ? (
                                      <img
                                        src={form.brandMark || "/invitations/khmer-celestial/koupreng-gold-mark.webp"}
                                        alt="Logo"
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-[9px] font-bold text-zinc-500">
                                        <span>បិទ</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="block text-xs font-bold text-zinc-100 whitespace-nowrap">
                                        ស្លាកសញ្ញាមាស (Brand Mark Monogram)
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                                        isBrandMarkActive
                                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                          : "text-zinc-500 border-zinc-800 bg-zinc-900"
                                      }`}>
                                        {isBrandMarkActive ? "កំពុងបើក" : "បានបិទ"}
                                      </span>
                                    </div>
                                    <span className="block text-[10px] text-zinc-400">
                                      បង្ហាញនៅផ្នែកខាងលើនៃ Cover
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  {isBrandMarkActive ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, showBrandMark: true, brandMark: "/invitations/khmer-celestial/koupreng-gold-mark.webp" }))}
                                        className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/20 transition cursor-pointer"
                                      >
                                        + Koupreng Mark
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => brandMarkFileInputRef.current?.click()}
                                        className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg border border-zinc-700 transition cursor-pointer"
                                      >
                                        <Upload className="h-3 w-3" />
                                        <span>Upload</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, showBrandMark: false, brandMark: "" }))}
                                        className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 px-2 py-1 rounded-lg border border-rose-500/20 transition cursor-pointer"
                                        title="បិទមិនប្រើស្លាកសញ្ញានេះ"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span>បិទ</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setForm((prev) => ({
                                        ...prev,
                                        showBrandMark: true,
                                        brandMark: "/invitations/khmer-celestial/koupreng-gold-mark.webp",
                                      }))}
                                      className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition cursor-pointer"
                                    >
                                      <Plus className="h-3 w-3" />
                                      <span>បើកប្រើ Logo</span>
                                    </button>
                                  )}

                                  {/* Toggle Switch */}
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isBrandMarkActive}
                                    onClick={() => {
                                      if (isBrandMarkActive) {
                                        setForm((prev) => ({ ...prev, showBrandMark: false, brandMark: "" }));
                                      } else {
                                        setForm((prev) => ({
                                          ...prev,
                                          showBrandMark: true,
                                          brandMark: prev.brandMark || "/invitations/khmer-celestial/koupreng-gold-mark.webp",
                                        }));
                                      }
                                    }}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      isBrandMarkActive ? "bg-amber-500" : "bg-zinc-700"
                                    }`}
                                    title={isBrandMarkActive ? "ចុចដើម្បីបិទ" : "ចុចដើម្បីបើក"}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        isBrandMarkActive ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2.2 GUEST NAME BANNER RIBBON (ផ្ទៃខាងក្រោយឈ្មោះភ្ញៀវ) */}
                        {(() => {
                          const isGuestBannerActive = form.showGuestBanner !== false && form.guestNameBanner !== "" && form.guestNameBanner !== "none";
                          return (
                            <div className={`rounded-2xl border transition-all p-3.5 space-y-2 ${
                              isGuestBannerActive ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-800/50 bg-zinc-950/40 opacity-80"
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-10 w-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden relative">
                                    {isGuestBannerActive ? (
                                      <img
                                        src={form.guestNameBanner || "/invitations/khmer-celestial/guest-name-banner1.webp"}
                                        alt="Banner"
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-[9px] font-bold text-zinc-500">
                                        <span>បិទ</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="block text-xs font-bold text-zinc-100 whitespace-nowrap">
                                        បូទ្រឈ្មោះភ្ញៀវ (Guest Ribbon Banner)
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                                        isGuestBannerActive
                                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                          : "text-zinc-500 border-zinc-800 bg-zinc-900"
                                      }`}>
                                        {isGuestBannerActive ? "កំពុងបើក" : "បានបិទ"}
                                      </span>
                                    </div>
                                    <span className="block text-[10px] text-zinc-400">
                                      ផ្ទៃខាងក្រោយសម្រាប់ឈ្មោះភ្ញៀវ
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  {isGuestBannerActive ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, showGuestBanner: true, guestNameBanner: "/invitations/khmer-celestial/guest-name-banner1.webp" }))}
                                        className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/20 transition cursor-pointer"
                                      >
                                        + Ribbon Banner
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => guestBannerFileInputRef.current?.click()}
                                        className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg border border-zinc-700 transition cursor-pointer"
                                      >
                                        <Upload className="h-3 w-3" />
                                        <span>Upload</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, showGuestBanner: false, guestNameBanner: "" }))}
                                        className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 px-2 py-1 rounded-lg border border-rose-500/20 transition cursor-pointer"
                                        title="បិទមិនប្រើបូទ្រឈ្មោះ"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span>បិទ</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setForm((prev) => ({
                                        ...prev,
                                        showGuestBanner: true,
                                        guestNameBanner: "/invitations/khmer-celestial/guest-name-banner1.webp",
                                      }))}
                                      className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition cursor-pointer"
                                    >
                                      <Plus className="h-3 w-3" />
                                      <span>បើកប្រើ Banner</span>
                                    </button>
                                  )}

                                  {/* Toggle Switch */}
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isGuestBannerActive}
                                    onClick={() => {
                                      if (isGuestBannerActive) {
                                        setForm((prev) => ({ ...prev, showGuestBanner: false, guestNameBanner: "" }));
                                      } else {
                                        setForm((prev) => ({
                                          ...prev,
                                          showGuestBanner: true,
                                          guestNameBanner: prev.guestNameBanner || "/invitations/khmer-celestial/guest-name-banner1.webp",
                                        }));
                                      }
                                    }}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      isGuestBannerActive ? "bg-amber-500" : "bg-zinc-700"
                                    }`}
                                    title={isGuestBannerActive ? "ចុចដើម្បីបិទ" : "ចុចដើម្បីបើក"}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        isGuestBannerActive ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2.3 OPEN BUTTON GRAPHIC (ប៊ូតុងបើកសំបុត្រ) */}
                        {(() => {
                          const isOpenButtonActive = form.showOpenButton !== false && form.openButtonImage !== "" && form.openButtonImage !== "none";
                          return (
                            <div className={`rounded-2xl border transition-all p-3.5 space-y-2 ${
                              isOpenButtonActive ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-800/50 bg-zinc-950/40 opacity-80"
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-10 w-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden relative">
                                    {isOpenButtonActive ? (
                                      <img
                                        src={form.openButtonImage || "/invitations/khmer-celestial/butto_invitation.webp"}
                                        alt="Button"
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-[9px] font-bold text-zinc-500">
                                        <span>បិទ</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="block text-xs font-bold text-zinc-100 whitespace-nowrap">
                                        ប៊ូតុងបើកមាស (Open Button Graphic)
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                                        isOpenButtonActive
                                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                          : "text-zinc-500 border-zinc-800 bg-zinc-900"
                                      }`}>
                                        {isOpenButtonActive ? "កំពុងបើក" : "បានបិទ"}
                                      </span>
                                    </div>
                                    <span className="block text-[10px] text-zinc-400">
                                      ប៊ូតុងចុចដើម្បីបើកសំបុត្រអញ្ជើញ
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  {isOpenButtonActive ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, showOpenButton: true, openButtonImage: "/invitations/khmer-celestial/butto_invitation.webp" }))}
                                        className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/20 transition cursor-pointer"
                                      >
                                        + Gold Button
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openButtonFileInputRef.current?.click()}
                                        className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg border border-zinc-700 transition cursor-pointer"
                                      >
                                        <Upload className="h-3 w-3" />
                                        <span>Upload</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, showOpenButton: false, openButtonImage: "" }))}
                                        className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 px-2 py-1 rounded-lg border border-rose-500/20 transition cursor-pointer"
                                        title="បិទមិនប្រើប៊ូតុងក្រាហ្វិក"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span>បិទ</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setForm((prev) => ({
                                        ...prev,
                                        showOpenButton: true,
                                        openButtonImage: "/invitations/khmer-celestial/butto_invitation.webp",
                                      }))}
                                      className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition cursor-pointer"
                                    >
                                      <Plus className="h-3 w-3" />
                                      <span>បើកប្រើ Button</span>
                                    </button>
                                  )}

                                  {/* Toggle Switch */}
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isOpenButtonActive}
                                    onClick={() => {
                                      if (isOpenButtonActive) {
                                        setForm((prev) => ({ ...prev, showOpenButton: false, openButtonImage: "" }));
                                      } else {
                                        setForm((prev) => ({
                                          ...prev,
                                          showOpenButton: true,
                                          openButtonImage: prev.openButtonImage || "/invitations/khmer-celestial/butto_invitation.webp",
                                        }));
                                      }
                                    }}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      isOpenButtonActive ? "bg-amber-500" : "bg-zinc-700"
                                    }`}
                                    title={isOpenButtonActive ? "ចុចដើម្បីបិទ" : "ចុចដើម្បីបើក"}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        isOpenButtonActive ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    )}

                    {/* ============================================================== */}
                    {/* ============================================================== */}
                    {/* TAB 3: ✍️ អត្ថបទលើ COVER (COVER TEXTS) */}
                    {/* ============================================================== */}
                    {coverSubTab === "text" && (
                      <div className="space-y-3">
                        {/* 3.1 ឈ្មោះគូស្នេហ៍លើ COVER */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                          <span className="block text-xs font-bold text-amber-400">
                            💑 ឈ្មោះគូស្នេហ៍លើ Cover (Couple Names)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">ឈ្មោះកូនកំលោះ (Groom)</label>
                              <input
                                type="text"
                                value={form.groomName || ""}
                                onChange={(e) => setField("groomName", e.target.value)}
                                placeholder="ជា វណ្ណដា"
                                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">ឈ្មោះកូនក្រមុំ (Bride)</label>
                              <input
                                type="text"
                                value={form.brideName || ""}
                                onChange={(e) => setField("brideName", e.target.value)}
                                placeholder="សុខ ស្រីពេជ្រ"
                                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500 font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3.2 កាលបរិច្ឆេទ & ម៉ោងលើ COVER */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                          <span className="block text-xs font-bold text-amber-400">
                            📅 កាលបរិច្ឆេទ & ម៉ោង (Date & Time)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">ថ្ងៃមង្គលការ (Date)</label>
                              <DatePicker
                                value={form.weddingDate}
                                onChange={(dateVal, isoVal) => {
                                  setField("weddingDate", dateVal);
                                  if (isoVal) setField("targetDate", isoVal);
                                }}
                                placeholder="ជ្រើសរើសថ្ងៃមង្គលការ"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">ម៉ោងកម្មវិធី (Time)</label>
                              <TimePicker
                                value={form.weddingTime}
                                onChange={(timeVal) => setField("weddingTime", timeVal)}
                                placeholder="ជ្រើសរើសម៉ោង"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3.3 ស្លាកភ្ញៀវ & ឈ្មោះសាកល្បង */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                          <span className="block text-xs font-bold text-amber-400">
                            ✉️ ស្លាកអញ្ជើញភ្ញៀវ (Guest Card Info)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">ពាក្យហៅភ្ញៀវ (Guest Label)</label>
                              <input
                                type="text"
                                value={form.guestLabel || ""}
                                onChange={(e) => setField("guestLabel", e.target.value)}
                                placeholder="ជូនចំពោះ:"
                                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-400 mb-1">ឈ្មោះភ្ញៀវតេស្ត (Preview Name)</label>
                              <input
                                type="text"
                                value={form.guestName || ""}
                                onChange={(e) => setField("guestName", e.target.value)}
                                placeholder="លោកអ្នក និងក្រុមគ្រួសារ"
                                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3.4 ពាក្យស្វាគមន៍ & ជូនពរ */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                          <span className="block text-xs font-bold text-zinc-300">
                            📝 ពាក្យស្វាគមន៍ & ជូនពរ
                          </span>
                          <div>
                            <label className="block text-[10px] text-zinc-400 mb-1">
                              ពាក្យស្វាគមន៍ (Subtitle / Greeting)
                            </label>
                            <input
                              type="text"
                              value={form.invitationSubtitle || ""}
                              onChange={(e) => setField("invitationSubtitle", e.target.value)}
                              placeholder="យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ"
                              className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 mb-1">
                              ពាក្យជូនពរផ្លូវការ (Formal Blessing Message)
                            </label>
                            <textarea
                              rows={2}
                              value={form.blessingMessage || ""}
                              onChange={(e) => setField("blessingMessage", e.target.value)}
                              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-100 outline-none focus:border-amber-500 leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ============================================================== */}
                    {/* TAB 4: 🎵 ភ្លេងមង្គលការ (BACKGROUND WEDDING MUSIC) */}
                    {/* ============================================================== */}
                    {coverSubTab === "music" && (
                      <div className="space-y-4 animate-in fade-in">
                        {/* Hidden Audio File Input */}
                        <input
                          type="file"
                          ref={musicFileInputRef}
                          accept="audio/mp3, audio/mpeg, audio/m4a, audio/wav, audio/ogg"
                          className="hidden"
                          onChange={handleMusicFileUpload}
                        />

                        {/* Audio HTML element for admin preview */}
                        <audio
                          ref={audioPlayerRef}
                          src={form.bgMusicUrl || "/music/wedding-waiting-day.mp3"}
                          onEnded={() => setIsPlayingMusic(false)}
                          onError={() => setIsPlayingMusic(false)}
                        />

                        {/* Active Music Player Header Card */}
                        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-zinc-950 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={toggleMusicPreview}
                                disabled={!form.bgMusicUrl}
                                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 ${
                                  !form.bgMusicUrl
                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    : isPlayingMusic
                                    ? "bg-amber-500 text-black shadow-amber-500/30 ring-2 ring-amber-400"
                                    : "bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40"
                                }`}
                                title={isPlayingMusic ? "ផ្អាក (Pause)" : "ចាក់ស្តាប់ (Play)"}
                              >
                                {isPlayingMusic ? (
                                  <Pause className="h-5 w-5 fill-current" />
                                ) : (
                                  <Play className="h-5 w-5 fill-current ml-0.5" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                                  <span>{isPlayingMusic ? "កំពុងចាក់ស្តាប់..." : "បទភ្លេងមង្គលការបច្ចុប្បន្ន"}</span>
                                  {isPlayingMusic && (
                                    <span className="flex items-center gap-0.5 text-amber-400">
                                      <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
                                      <span className="w-1 h-4 bg-amber-400 rounded-full animate-pulse delay-75" />
                                      <span className="w-1 h-2 bg-amber-400 rounded-full animate-pulse delay-150" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 truncate">
                                  {form.bgMusicUrl ? (
                                    MUSIC_PRESETS.find((p) => p.url === form.bgMusicUrl)?.title || form.bgMusicUrl
                                  ) : (
                                    <span className="text-zinc-500 italic">🔇 បានបិទភ្លេង (គ្មានសំឡេង)</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => musicFileInputRef.current?.click()}
                                className="text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/80 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Upload className="h-3.5 w-3.5 text-amber-400" />
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Presets List */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                            ជ្រើសរើសបទភ្លេងគំរូ (Wedding Music Presets)
                          </label>
                          <div className="space-y-1.5">
                            {MUSIC_PRESETS.map((track) => {
                              const isSelected = form.bgMusicUrl === track.url;
                              return (
                                <button
                                  key={track.id}
                                  type="button"
                                  onClick={() => handleSelectMusic(track.url)}
                                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition cursor-pointer ${
                                    isSelected
                                      ? "border-amber-500/80 bg-amber-500/10 text-white ring-1 ring-amber-500/30"
                                      : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 text-zinc-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400"
                                      }`}
                                    >
                                      <Music className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold leading-tight">{track.title}</div>
                                      <div className="text-[10px] text-zinc-400">{track.artist}</div>
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                                      isSelected ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400"
                                    }`}
                                  >
                                    {isSelected ? "✓ ជ្រើសរើស" : track.tag}
                                  </span>
                                </button>
                              );
                            })}

                            {/* Mute / Silent Option */}
                            <button
                              type="button"
                              onClick={() => handleSelectMusic("")}
                              className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition cursor-pointer ${
                                !form.bgMusicUrl
                                  ? "border-amber-500/80 bg-amber-500/10 text-white ring-1 ring-amber-500/30"
                                  : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 text-zinc-400"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
                                  <VolumeX className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold leading-tight">បិទសំឡេង (គ្មានភ្លេងកំដរ)</div>
                                  <div className="text-[10px] text-zinc-500">បើកសំបុត្រដោយស្ងាត់ (Silent Mode)</div>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                                  !form.bgMusicUrl ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {!form.bgMusicUrl ? "✓ បានបិទ" : "Mute"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                          key={`sched-${item.id || index}-${index}`}
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
                              <TimePicker
                                value={item.time}
                                onChange={(timeVal) => handleUpdateScheduleItem(item.id, "time", timeVal)}
                                placeholder="ជ្រើសរើសម៉ោង"
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
                    <TemplateGallerySection
                      galleryImages={form.galleryImages || []}
                      newGalleryUrl={newGalleryUrl}
                      onNewGalleryUrlChange={setNewGalleryUrl}
                      onAddGalleryImage={handleAddGalleryImage}
                      onUploadGalleryFiles={(files) => handleGalleryFileUpload({ target: { files } })}
                      onUpdateImage={(idx, val) => {
                        const newImages = [...form.galleryImages];
                        newImages[idx] = val;
                        setField("galleryImages", newImages);
                      }}
                      onRemoveImage={(idx) => {
                        const newImages = form.galleryImages.filter((_, i) => i !== idx);
                        setField("galleryImages", newImages);
                      }}
                      onMoveImage={(fromIdx, toIdx) => {
                        if (toIdx < 0 || toIdx >= form.galleryImages.length) return;
                        const newImages = [...form.galleryImages];
                        const [moved] = newImages.splice(fromIdx, 1);
                        newImages.splice(toIdx, 0, moved);
                        setField("galleryImages", newImages);
                      }}
                      lang={lang}
                    />

                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                          <h3 className="text-sm font-bold text-white">
                            {lang === "en" ? "Love Story Timeline Intro" : "សាច់រឿងស្នេហា (Love Story Timeline Intro)"}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {(form.storyText || "").length} {lang === "en" ? "chars" : "តួអក្សរ"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {lang === "en"
                          ? "Share the heartfelt journey and romantic memories of bride & groom"
                          : "រៀបរាប់ដំណើរដើមទងនៃក្ដីស្រឡាញ់ និងការចងចាំដ៏មានន័យរបស់គូស្វាមីភរិយា"}
                      </p>
                      <textarea
                        rows={3}
                        value={form.storyText || ""}
                        onChange={(e) => setField("storyText", e.target.value)}
                        placeholder="ពីការជួបគ្នាដំបូង រហូតដល់ថ្ងៃសន្យារួមដំណើរជីវិត..."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-zinc-100 outline-none focus:border-amber-500 leading-relaxed shadow-inner transition-colors"
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
                            key={`dress-color-${color.hex || idx}-${idx}`}
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

                    <TemplateQrSection
                      qrGiftUrl={form.qrGiftUrl}
                      onQrChange={(val) => setField("qrGiftUrl", val)}
                      onUploadQr={(file) => handleQrFileUpload({ target: { files: [file] } })}
                      lang={lang}
                    />

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
                    <TemplateSectionOrderManager
                      sectionOrder={form.sectionOrder || DEFAULT_SECTIONS_LIST.map((s) => s.key)}
                      enabledSections={form.enabledSections || {}}
                      onReorderSections={(newOrder) => setField("sectionOrder", newOrder)}
                      onToggleSection={(key) => {
                        const isEnabled = form.enabledSections?.[key] !== false;
                        setForm((prev) => ({
                          ...prev,
                          enabledSections: {
                            ...prev.enabledSections,
                            [key]: !isEnabled,
                          },
                        }));
                      }}
                      onResetDefault={() => {
                        const defaultKeys = DEFAULT_SECTIONS_LIST.map((s) => s.key);
                        setField("sectionOrder", defaultKeys);
                        show(lang === "en" ? "Reset to default order ✓" : "បានកំណត់ទៅលំដាប់ដើមវិញ ✓");
                      }}
                      onJumpToTab={(tabId, subTabId) => {
                        setActiveTab(tabId);
                        if (tabId === "events" && subTabId) setEventsSubTab(subTabId);
                        if (tabId === "venue" && subTabId) setVenueSubTab(subTabId);
                      }}
                      lang={lang}
                    />
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
                key={form.code || form.presetId || "template-preview"}
                ref={iframeRef}
                allow="clipboard-write; clipboard-read; autoplay"
                src={userTemplateUrl(`${
                  form.code ||
                  (form.presetId === "KHMER_CELESTIAL"
                    ? "khmer-celestial"
                    : form.presetId === "GARDEN_ROYAL"
                    ? "garden-royal-khmer-wedding"
                    : form.presetId === "KHMER_GOLDEN" || form.presetId === "CHAMPAGNE"
                    ? "cover-khmer-golden-wedding"
                    : form.presetId === "ROYAL_KHMER" || form.presetId === "RUBY_RED"
                    ? "khmer-celestial"
                    : form.presetId === "EMERALD_GREEN"
                    ? "emerald-canva-luxe-wedding"
                    : "the-digital-yes-wedding")
                }/preview?embed=true`)}
                className={`w-full h-full border-0 bg-zinc-950 ${
                  isDraggingDivider ? "pointer-events-none" : ""
                }`}
                title="Live User Template Preview"
                onLoad={() => {
                  broadcastSync();
                  [100, 300, 600, 1200, 2000].forEach((delay) => {
                    setTimeout(() => broadcastSync(), delay);
                  });
                  if (previewGateOpen && iframeRef.current?.contentWindow) {
                    try {
                      iframeRef.current.contentWindow.postMessage(
                        {
                          type: "TOGGLE_GATE",
                          open: true,
                          isOpen: true,
                        },
                        "*"
                      );
                    } catch {}
                  }
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* CUSTOM FONT MODAL (GOOGLE FONTS & LOCAL FILE UPLOAD) */}
      {/* ============================================================== */}
      {showFontModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">បន្ថែមពុម្ពអក្សរផ្ទាល់ខ្លួន (Add Custom Font)</h3>
                  <p className="text-[11px] text-zinc-400">ប្រើ Google Font ឬ Upload file .ttf / .woff2</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFontModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-tab Pills */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setFontModalTab("google")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  fontModalTab === "google"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Google Fonts</span>
              </button>
              <button
                type="button"
                onClick={() => setFontModalTab("file")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  fontModalTab === "file"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File Font</span>
              </button>
            </div>

            {/* Category Selector: Khmer vs Latin */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                ប្រភេទ Font (Font Target)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewFontCategory("khmer")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                    newFontCategory === "khmer"
                      ? "border-amber-500 bg-amber-500/10 text-amber-300 font-bold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span>🇰🇭 អក្សរខ្មែរ (Khmer)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewFontCategory("latin")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                    newFontCategory === "latin"
                      ? "border-amber-500 bg-amber-500/10 text-amber-300 font-bold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span>🔤 អក្សរឡាតាំង (Latin)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Google Font Mode */}
            {fontModalTab === "google" && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    ឈ្មោះ Google Font (Family Name)
                  </label>
                  <input
                    type="text"
                    value={newFontName}
                    onChange={(e) => {
                      setNewFontName(e.target.value);
                      if (e.target.value.trim()) {
                        ensureGoogleFontLoaded(e.target.value.trim());
                      }
                    }}
                    placeholder={
                      newFontCategory === "khmer"
                        ? "ឧ. Odor Mean Chey, Koh Santepheap, Kdam Thmor Pro..."
                        : "e.g. MonteCarlo, Italianno, Parisienne, Marck Script..."
                    }
                    className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Popular Suggestions Chips */}
                <div>
                  <span className="block text-[10px] font-semibold text-zinc-400 mb-1.5">
                    💡 ពុម្ពអក្សរពេញនិយម (ចុចដើម្បីជ្រើសរើសភ្លាមៗ)៖
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_GOOGLE_FONTS_SUGGESTIONS
                      .filter((s) => s.category === newFontCategory)
                      .map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => {
                            setNewFontName(s.name);
                            ensureGoogleFontLoaded(s.name);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            newFontName === s.name
                              ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold"
                              : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                {newFontName.trim() && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-center space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">Live Preview:</span>
                    <div
                      className="text-base text-zinc-100 py-1"
                      style={{ fontFamily: `"${newFontName.trim()}", sans-serif` }}
                    >
                      {newFontCategory === "khmer" ? "នី បញ្ញា & កត់ ស្រីផ្កាយ ២០២៦" : "Nha & SreyPkay Wedding Invitation 2026"}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleAddGoogleFont()}
                  disabled={!newFontName.trim()}
                  className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add & Apply This Google Font</span>
                </button>
              </div>
            )}

            {/* TAB 2: File Upload Mode */}
            {fontModalTab === "file" && (
              <div className="space-y-3.5">
                <input
                  type="file"
                  ref={fontFileInputRef}
                  accept=".ttf,.otf,.woff,.woff2"
                  className="hidden"
                  onChange={handleUploadFontFile}
                />

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    ឈ្មោះ Font (Font Family Name)
                  </label>
                  <input
                    type="text"
                    value={newFontName}
                    onChange={(e) => setNewFontName(e.target.value)}
                    placeholder="ឧ. My Royal Wedding Font"
                    className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div
                  onClick={() => fontFileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/50 hover:bg-amber-500/5 p-6 text-center transition cursor-pointer space-y-2"
                >
                  <Upload className="h-7 w-7 text-amber-500 mx-auto" />
                  <div>
                    <span className="text-xs font-bold text-zinc-200">
                      ចុចដើម្បីជ្រើសរើស file Font
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      គាំទ្រប្រភេទ file: .ttf, .otf, .woff, .woff2
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
