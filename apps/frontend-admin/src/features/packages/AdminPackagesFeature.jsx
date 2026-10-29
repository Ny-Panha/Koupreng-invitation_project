import { RefreshStatus } from '../../shared/ui/AdminSkeleton';
import { useMemo, useState } from "react";
import {
  Layers,
  Plus,
  Search,
  RotateCw,
  LayoutGrid,
  Table as TableIcon,
  Pencil,
  Power,
  Check,
  X,
  Sparkles,
  Users,
  Mail,
  DollarSign,
  QrCode,
  Armchair,
  BarChart3,
  Bot,
  Crown,
  FileText,
  Sliders,
  CheckCircle2,
  Info,
  Globe,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Loading, ErrorState, Empty, Toast, StatCard } from "../../shared/ui";
import { useResource, useToast } from "../../shared/hooks";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

const EMPTY_FORM = {
  packageName: "",
  code: "",
  description: "",
  price: "0.00",
  currency: "USD",
  billingInterval: "YEARLY",
  durationDays: "365",
  maxInvitations: "1",
  maxGuests: "40",
  maxGuestsPerInvitation: "40",
  maxTeamMembers: "1",
  featuresJson: "{}",
  premiumTemplatesEnabled: false,
  qrInvitationsEnabled: true,
  qrCheckInEnabled: false,
  seatingEnabled: false,
  advancedAnalyticsEnabled: false,
  customBrandingEnabled: false,
  teamMembersEnabled: false,
  aiAssistantEnabled: false,
  active: true,
  publicVisible: false,
  sortOrder: "0",
};

const RESOLVER_PLANS = {
  BASIC: { price: "0.01", currency: "USD" },
  PRO: { price: "199.00", currency: "USD" },
  PREMIUM: { price: "499.00", currency: "USD" },
};

function getPlanCheckoutStatus(plan) {
  const code = plan?.code?.toUpperCase();
  const resolverPlan = RESOLVER_PLANS[code];
  const isSellable = Boolean(resolverPlan);
  const isDev = Boolean(code?.startsWith("DEV_"));
  const priceMismatch = isSellable && (
    Number(plan?.price || 0).toFixed(2) !== Number(resolverPlan.price).toFixed(2) ||
    plan?.currency !== resolverPlan.currency
  );
  return { isSellable, isDev, resolverPlan, priceMismatch };
}

const FEATURE_LIST = [
  {
    key: "premiumTemplatesEnabled",
    label: "គំរូ Premium (Templates)",
    labelKm: "គំរូ Premium (Templates)",
    labelEn: "Premium Templates",
    sublabel: "បើកសិទ្ធិប្រើប្រាស់ម៉ូតធៀបការលំដាប់ប្រណិត",
    sublabelKm: "បើកសិទ្ធិប្រើប្រាស់ម៉ូតធៀបការលំដាប់ប្រណិត",
    sublabelEn: "Access to luxury and premium wedding templates",
    icon: Crown,
  },
  {
    key: "qrInvitationsEnabled",
    label: "ធៀបការ QR (QR Invitations)",
    labelKm: "ធៀបការ QR (QR Invitations)",
    labelEn: "QR Invitations",
    sublabel: "ចែករំលែកធៀបការតាម QR Code និងតំណភ្ជាប់",
    sublabelKm: "ចែករំលែកធៀបការតាម QR Code និងតំណភ្ជាប់",
    sublabelEn: "Share invitations via QR Code and direct links",
    icon: QrCode,
  },
  {
    key: "qrCheckInEnabled",
    label: "ស្កេន QR ពេលចូលរោង (Check-in)",
    labelKm: "ស្កេន QR ពេលចូលរោង (Check-in)",
    labelEn: "QR Guest Check-in",
    sublabel: "ប្រព័ន្ធស្កេនពិនិត្យវត្តមានភ្ញៀវនៅមុខរោងការ",
    sublabelKm: "ប្រព័ន្ធស្កេនពិនិត្យវត្តមានភ្ញៀវនៅមុខរោងការ",
    sublabelEn: "Scan guest QR codes at reception entrance",
    icon: CheckCircle2,
  },
  {
    key: "seatingEnabled",
    label: "រៀបចំតុភ្ញៀវ (Seating Chart)",
    labelKm: "រៀបចំតុភ្ញៀវ (Seating Chart)",
    labelEn: "Seating Chart",
    sublabel: "រៀបចំលេខតុ និងប្លង់អង្គុយសម្រាប់ភ្ញៀវកិត្តិយស",
    sublabelKm: "រៀបចំលេខតុ និងប្លង់អង្គុយសម្រាប់ភ្ញៀវកិត្តិយស",
    sublabelEn: "Table numbers and seating arrangement for guests",
    icon: Armchair,
  },
  {
    key: "advancedAnalyticsEnabled",
    label: "របាយការណ៍លម្អិត (Analytics)",
    labelKm: "របាយការណ៍លម្អិត (Analytics)",
    labelEn: "Advanced Analytics",
    sublabel: "ស្ថិតិការបើកមើលធៀប និងចំនួនភ្ញៀវ RSVP ជាក់ស្តែង",
    sublabelKm: "ស្ថិតិការបើកមើលធៀប និងចំនួនភ្ញៀវ RSVP ជាក់ស្តែង",
    sublabelEn: "Track invitation views and real-time RSVP rates",
    icon: BarChart3,
  },
  {
    key: "teamMembersEnabled",
    label: "សមាជិកក្រុម (Team Collaboration)",
    labelKm: "សមាជិកក្រុម (Team Collaboration)",
    labelEn: "Team Collaboration",
    sublabel: "អាច Invite សមាជិកគ្រួសារជួយរៀបចំធៀបការរួមគ្នា",
    sublabelKm: "អាច Invite សមាជិកគ្រួសារជួយរៀបចំធៀបការរួមគ្នា",
    sublabelEn: "Invite family members to co-manage invitations",
    icon: Users,
  },
  {
    key: "aiAssistantEnabled",
    label: "ជំនួយការ AI (AI Assistant)",
    labelKm: "ជំនួយការ AI (AI Assistant)",
    labelEn: "AI Assistant",
    sublabel: "ជំនួយការឆ្លាតវៃជួយសរសេរពាក្យជូនពរ និងរៀបកាលវិភាគ",
    sublabelKm: "ជំនួយការឆ្លាតវៃជួយសរសេរពាក្យជូនពរ និងរៀបកាលវិភាគ",
    sublabelEn: "Smart AI to help write blessings and event schedules",
    icon: Bot,
  },
];

const INTERVALS = [
  { value: "YEARLY", label: "ប្រចាំឆ្នាំ", labelKm: "ប្រចាំឆ្នាំ", labelEn: "Yearly", sub: "Yearly", days: "365", icon: "📅" },
  { value: "MONTHLY", label: "ប្រចាំខែ", labelKm: "ប្រចាំខែ", labelEn: "Monthly", sub: "Monthly", days: "30", icon: "🗓️" },
  { value: "ONE_TIME", label: "ម្តងគត់", labelKm: "ម្តងគត់", labelEn: "One-time", sub: "One-time", days: "90", icon: "🎫" },
  { value: "LIFETIME", label: "មួយជីវិត", labelKm: "មួយជីវិត", labelEn: "Lifetime", sub: "Lifetime", days: "9999", icon: "♾️" },
];

const PACKAGE_PRESETS = [
  {
    label: "🎁 Free",
    name: "Free",
    code: "FREE",
    price: "0.00",
    currency: "USD",
    billingInterval: "YEARLY",
    durationDays: "365",
    maxInvitations: "1",
    maxGuests: "40",
    maxGuestsPerInvitation: "40",
    maxTeamMembers: "1",
    description: "Starter plan for small wedding invitations.",
    features: {
      qrInvitationsEnabled: true,
      premiumTemplatesEnabled: false,
      qrCheckInEnabled: false,
      seatingEnabled: false,
      advancedAnalyticsEnabled: false,
      teamMembersEnabled: false,
      aiAssistantEnabled: false,
    },
  },
  {
    label: "⭐ Standard",
    name: "Standard",
    code: "STANDARD",
    price: "49.00",
    currency: "USD",
    billingInterval: "YEARLY",
    durationDays: "365",
    maxInvitations: "5",
    maxGuests: "300",
    maxGuestsPerInvitation: "60",
    maxTeamMembers: "2",
    description: "Perfect for normal wedding events with guest check-in.",
    features: {
      qrInvitationsEnabled: true,
      premiumTemplatesEnabled: true,
      qrCheckInEnabled: true,
      seatingEnabled: false,
      advancedAnalyticsEnabled: false,
      teamMembersEnabled: true,
      aiAssistantEnabled: false,
    },
  },
  {
    label: "🚀 Pro",
    name: "Pro",
    code: "PRO",
    price: "169.00",
    currency: "USD",
    billingInterval: "YEARLY",
    durationDays: "365",
    maxInvitations: "20",
    maxGuests: "2000",
    maxGuestsPerInvitation: "100",
    maxTeamMembers: "5",
    description: "Full-featured wedding suite with seating chart, analytics, and AI.",
    features: {
      qrInvitationsEnabled: true,
      premiumTemplatesEnabled: true,
      qrCheckInEnabled: true,
      seatingEnabled: true,
      advancedAnalyticsEnabled: true,
      teamMembersEnabled: true,
      aiAssistantEnabled: true,
    },
  },
  {
    label: "👑 Enterprise",
    name: "Enterprise",
    code: "ENTERPRISE",
    price: "399.00",
    currency: "USD",
    billingInterval: "YEARLY",
    durationDays: "365",
    maxInvitations: "100",
    maxGuests: "10000",
    maxGuestsPerInvitation: "500",
    maxTeamMembers: "20",
    description: "Unlimited invitations and large-scale wedding planner operations.",
    features: {
      qrInvitationsEnabled: true,
      premiumTemplatesEnabled: true,
      qrCheckInEnabled: true,
      seatingEnabled: true,
      advancedAnalyticsEnabled: true,
      teamMembersEnabled: true,
      aiAssistantEnabled: true,
    },
  },
  {
    label: "💎 VIP Lifetime",
    name: "VIP Lifetime",
    code: "VIP_LIFETIME",
    price: "499.00",
    currency: "USD",
    billingInterval: "LIFETIME",
    durationDays: "9999",
    maxInvitations: "999",
    maxGuests: "99999",
    maxGuestsPerInvitation: "1000",
    maxTeamMembers: "50",
    description: "Lifetime all-access pass with maximum quotas and VIP priority support.",
    features: {
      qrInvitationsEnabled: true,
      premiumTemplatesEnabled: true,
      qrCheckInEnabled: true,
      seatingEnabled: true,
      advancedAnalyticsEnabled: true,
      teamMembersEnabled: true,
      aiAssistantEnabled: true,
    },
  },
];

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toForm(plan) {
  return {
    ...EMPTY_FORM,
    ...plan,
    price: plan?.price ?? "0.00",
    durationDays: plan?.durationDays ?? "",
    maxInvitations: plan?.maxInvitations ?? "",
    maxGuests: plan?.maxGuests ?? "",
    maxGuestsPerInvitation: plan?.maxGuestsPerInvitation ?? "",
    maxTeamMembers: plan?.maxTeamMembers ?? "",
    sortOrder: plan?.sortOrder ?? "0",
    publicVisible: Boolean(plan?.publicVisible),
    featuresJson: plan?.featuresJson || "{}",
  };
}

function toPayload(form) {
  return {
    ...form,
    price: numberOrNull(form.price),
    durationDays: numberOrNull(form.durationDays),
    maxInvitations: numberOrNull(form.maxInvitations),
    maxGuests: numberOrNull(form.maxGuests),
    maxGuestsPerInvitation: numberOrNull(form.maxGuestsPerInvitation),
    maxTeamMembers: numberOrNull(form.maxTeamMembers),
    sortOrder: numberOrNull(form.sortOrder) || 0,
    publicVisible: Boolean(form.publicVisible),
  };
}

// Custom iOS-style toggle switch
function ToggleSwitch({ checked, onChange, label, sublabel, icon: Icon }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
        checked
          ? "bg-amber-500/10 border-amber-500/40 dark:bg-amber-500/15"
          : "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              checked
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "bg-slate-200/70 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block truncate">
            {label}
          </span>
          {sublabel && (
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      <div
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ml-3 ${
          checked ? "bg-amber-500" : "bg-slate-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-4.5" : "translate-x-1"
          }`}
        />
      </div>
    </div>
  );
}

export default function AdminPackagesPage() {
  const { lang, t } = useAdminLanguage();
  const { data, setData, loading, refreshing, error, reload } = useResource(adminManagementService.packages);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' | 'quotas' | 'features'
  const [busyId, setBusyId] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const { toast, show, clear } = useToast();

  const packages = useMemo(() => {
    return [...(data || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [data]);

  const filteredPackages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return packages.filter((plan) => {
      const matchSearch =
        !q ||
        (plan.packageName && plan.packageName.toLowerCase().includes(q)) ||
        (plan.code && plan.code.toLowerCase().includes(q)) ||
        (plan.description && plan.description.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && plan.active) ||
        (statusFilter === "INACTIVE" && !plan.active);

      return matchSearch && matchStatus;
    });
  }, [packages, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = packages.length;
    const active = packages.filter((p) => p.active).length;
    const paid = packages.filter((p) => Number(p.price) > 0).length;
    const free = total - paid;
    return { total, active, paid, free };
  }, [packages]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleNameChange = (val) => {
    setField("packageName", val);
    if (!editingId) {
      const autoCode = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setField("code", autoCode);
    }
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      packageName: preset.name,
      code: preset.code,
      price: preset.price,
      currency: preset.currency || "USD",
      billingInterval: preset.billingInterval,
      durationDays: preset.durationDays,
      maxInvitations: preset.maxInvitations,
      maxGuests: preset.maxGuests,
      maxGuestsPerInvitation: preset.maxGuestsPerInvitation,
      maxTeamMembers: preset.maxTeamMembers,
      description: preset.description,
      ...preset.features,
    }));
    show(lang === "en" ? `Selected preset "${preset.name}" ✓` : `បានជ្រើសរើសគំរូ "${preset.name}" ✓`);
  };

  const openCreateDrawer = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setActiveTab("basic");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (plan) => {
    setEditingId(plan.id);
    setForm(toForm(plan));
    setActiveTab("basic");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const save = async (event) => {
    event?.preventDefault();
    if (editingId && form.publicVisible && !window.confirm(lang === "en" ? "Publish these package benefits for new orders? Existing purchased benefits stay unchanged." : "ផ្សព្វផ្សាយអត្ថប្រយោជន៍សម្រាប់ការជាវថ្មី? សិទ្ធិដែលបានទិញនៅតែរក្សាទុក។")) return;
    setBusyId(editingId || "new");
    try {
      const payload = toPayload(form);
      const saved = editingId
        ? await adminManagementService.updatePackage(editingId, payload)
        : await adminManagementService.createPackage(payload);
      setData((current) => {
        const rows = current || [];
        return editingId
          ? rows.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...rows];
      });
      show(editingId ? (lang === "en" ? "Package updated successfully ✓" : "បានកែប្រែកញ្ចប់សេវាជោគជ័យ ✓") : (lang === "en" ? "Package created successfully ✓" : "បានបង្កើតកញ្ចប់សេវាថ្មីជោគជ័យ ✓"));
      closeDrawer();
    } catch (err) {
      show(err?.message || (lang === "en" ? "Package save failed" : "បរាជ័យក្នុងការរក្សាទុកកញ្ចប់"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (plan) => {
    setBusyId(plan.id);
    try {
      const saved = plan.active
        ? await adminManagementService.deactivatePackage(plan.id)
        : await adminManagementService.activatePackage(plan.id);
      setData((current) => (current || []).map((item) => (item.id === saved.id ? saved : item)));
      show(plan.active ? (lang === "en" ? "Package deactivated ✓" : "បានផ្អាកដំណើរការកញ្ចប់ ✓") : (lang === "en" ? "Package reactivated ✓" : "បានបើកដំណើរការកញ្ចប់ឡើងវិញ ✓"));
    } catch (err) {
      show(err?.message || (lang === "en" ? "Operation failed" : "ប្រតិបត្តិការបរាជ័យ"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const toggleVisibility = async (plan) => {
    setBusyId(plan.id);
    try {
      const saved = await adminManagementService.togglePackageVisibility(plan.id);
      setData((current) => (current || []).map((item) => (item.id === saved.id ? saved : item)));
      show(
        saved.publicVisible
          ? (lang === "en" ? "Package is now public ✓" : "បានកំណត់កញ្ចប់ជាសាធារណៈ ✓")
          : (lang === "en" ? "Package is now unlisted/private ✓" : "បានកំណត់កញ្ចប់ជាឯកជន/មិនបង្ហាញ ✓")
      );
    } catch (err) {
      show(err?.message || (lang === "en" ? "Operation failed" : "ប្រតិបត្តិការបរាជ័យ"), "error");
    } finally {
      setBusyId(null);
    }
  };

  // Count active features for badge
  const enabledFeaturesCount = useMemo(() => {
    return FEATURE_LIST.filter((f) => Boolean(form[f.key])).length;
  }, [form]);

  return (
    <div className="space-y-6">
      <RefreshStatus active={refreshing} error={Boolean(error && data)} onRetry={reload} />
      {/* Page Header with Tavola Luxury Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
              {t("packages.title", lang === "en" ? "Pricing & Packages" : "កញ្ចប់សេវាកម្ម (Packages)")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              {t("packages.subtitle", lang === "en" ? "Manage package tiers, quotas, and feature access for users" : "កំណត់តម្លៃ កូតា និងសិទ្ធិប្រើប្រាស់មុខងារសម្រាប់ User")}
            </p>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-2 leading-relaxed">
              {lang === "en" ? "Published revisions apply to new orders. Purchased benefits remain frozen. Free is the default; account roles stay separate." : "កំណែថ្មីអនុវត្តចំពោះការជាវថ្មី។ សិទ្ធិដែលបានទិញត្រូវបានរក្សាទុក។ Free ជាកញ្ចប់លំនាំដើម ហើយតួនាទីគណនីនៅដាច់ដោយឡែក។"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={reload}
            className="btn btn-ghost h-9 px-3 text-xs"
            title={lang === "en" ? "Refresh" : "ផ្ទុកឡើងវិញ"}
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>{t("packages.refresh", lang === "en" ? "Refresh" : "ផ្ទុកឡើងវិញ")}</span>
          </button>
          <button
            type="button"
            onClick={openCreateDrawer}
            className="btn btn-primary h-9 px-4 text-xs shadow-md shadow-amber-500/20 font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>{t("packages.createBtn", lang === "en" ? "+ New Package" : "+ បង្កើតកញ្ចប់ថ្មី")}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview with Luxury Tavola StatCards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("packages.allPackages", lang === "en" ? "All Packages" : "កញ្ចប់ទាំងអស់")}
          value={String(stats.total)}
          note={lang === "en" ? "Total tiers in system" : "កញ្ចប់សេវាទាំងអស់ក្នុងប្រព័ន្ធ"}
          icon={Layers}
          tone="amber"
        />
        <StatCard
          label={t("packages.activePackages", lang === "en" ? "Active" : "សកម្ម (Active)")}
          value={String(stats.active)}
          note={lang === "en" ? "Live & available" : "កំពុងដំណើរការលើគេហទំព័រ"}
          icon={Power}
          tone="emerald"
        />
        <StatCard
          label={t("packages.paidPackages", lang === "en" ? "Paid" : "កញ្ចប់បង់ប្រាក់ (Paid)")}
          value={String(stats.paid)}
          note={lang === "en" ? "Commercial tiers" : "កញ្ចប់បង់ប្រាក់ពាណិជ្ជកម្ម"}
          icon={DollarSign}
          tone="cyan"
        />
        <StatCard
          label={t("packages.freePackages", lang === "en" ? "Free" : "ឥតគិតថ្លៃ (Free)")}
          value={String(stats.free)}
          note={lang === "en" ? "Free starter tiers" : "កញ្ចប់ឥតគិតថ្លៃសាកល្បង"}
          icon={Sparkles}
          tone="purple"
        />
      </div>

      {/* Filter & Toolbar */}
      <div className="tavola-glass p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("packages.searchPlaceholder", lang === "en" ? "Search by name or code..." : "ស្វែងរកតាមឈ្មោះ ឬ Code...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-input pl-9 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select text-xs"
          >
            <option value="ALL">{t("packages.allStatus", lang === "en" ? "All Statuses" : "ស្ថានភាពទាំងអស់")}</option>
            <option value="ACTIVE">{t("packages.activeStatus", lang === "en" ? "Active" : "សកម្ម (Active)")}</option>
            <option value="INACTIVE">{t("packages.inactiveStatus", lang === "en" ? "Inactive" : "អសកម្ម (Inactive)")}</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "cards"
                ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{t("packages.viewCards", "Cards")}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "table"
                ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>{t("packages.viewTable", "Table")}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <Loading layout="pricing" />
      ) : error && !data ? (
        <ErrorState onRetry={reload} />
      ) : filteredPackages.length === 0 ? (
        <Empty label={t("packages.empty", lang === "en" ? "No packages found" : "រកមិនឃើញកញ្ចប់សេវាកម្មទេ")} />
      ) : viewMode === "cards" ? (
        /* Cards / Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredPackages.map((plan) => {
            const isFree = Number(plan.price) === 0;
            const checkoutStatus = getPlanCheckoutStatus(plan);
            const enabledCount = FEATURE_LIST.filter((f) => Boolean(plan[f.key])).length;
            const intervalText = lang === "en"
              ? (plan.billingInterval === "YEARLY" ? "year" : plan.billingInterval === "MONTHLY" ? "month" : plan.billingInterval === "LIFETIME" ? "lifetime" : "one-time")
              : (plan.billingInterval === "YEARLY" ? "ឆ្នាំ" : plan.billingInterval === "MONTHLY" ? "ខែ" : plan.billingInterval === "LIFETIME" ? "មួយជីវិត" : "ម្តងគត់");

            const isPremiumTier = (plan.code || "").toUpperCase().includes("PREMIUM") || Number(plan.price) >= 300;
            const isProTier = (plan.code || "").toUpperCase().includes("PRO") || (Number(plan.price) > 0 && !isPremiumTier);

            return (
              <div
                key={plan.id}
                className={`tavola-glass-card group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs dark:border-zinc-800 dark:bg-[#111114]/90 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  !plan.active ? "opacity-75 bg-slate-50/50 dark:bg-zinc-950/40" : ""
                }`}
              >
                {/* Top Subtle Luxury Rim Accent */}
                <div
                  className={`absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r ${
                    isPremiumTier
                      ? "from-amber-400 via-amber-500 to-amber-600"
                      : isProTier
                      ? "from-cyan-400 via-blue-500 to-indigo-500"
                      : "from-emerald-400 via-emerald-500 to-teal-500"
                  }`}
                />

                <div className="space-y-3.5">
                  {/* Tier Header with Icon, Name & Status Pills */}
                  <div>
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                            isPremiumTier
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : isProTier
                              ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          } shadow-xs group-hover:scale-105 transition-transform`}
                        >
                          {isPremiumTier ? <Crown className="h-5 w-5" /> : isProTier ? <Sparkles className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {plan.packageName}
                          </h3>
                          <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400 block truncate">
                            {plan.code}
                          </span>
                          <small className="text-[10px] text-slate-500">{lang === 'en' ? 'Revision' : 'កំណែ'} {plan.revision ?? 0}</small>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                            plan.publicVisible
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
                          }`}
                          title={plan.publicVisible ? "Publicly listed on /pricing" : "Unlisted / hidden from /pricing"}
                        >
                          {plan.publicVisible ? (lang === "en" ? "PUBLIC" : "សាធារណៈ") : (lang === "en" ? "UNLISTED" : "ឯកជន")}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                            plan.active
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
                          }`}
                        >
                          {plan.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 min-h-[32px] mt-1">
                      {plan.description || t("packages.noDescription", lang === "en" ? "No description provided" : "គ្មានការពិពណ៌នា")}
                    </p>

                    {/* Price & Duration */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                          {isFree ? "$0.00" : `${plan.currency || "USD"} ${plan.price}`}
                        </span>
                        {isFree ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {t("packages.freeBadge", "Free $0")}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                            / {intervalText} ({plan.billingInterval})
                          </span>
                        )}
                      </div>

                      {plan.durationDays && (
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>{t("packages.validity", lang === "en" ? "Duration:" : "សុពលភាព:")}</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">
                            {plan.durationDays} {t("packages.days", lang === "en" ? "days" : "ថ្ងៃ")}
                          </span>
                        </p>
                      )}

                      {checkoutStatus.priceMismatch && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                          <span>
                            {lang === "en"
                              ? `PayWay resolver enforces $${checkoutStatus.resolverPlan.price}, DB has $${plan.price}`
                              : `PayWay គិតថ្លៃ $${checkoutStatus.resolverPlan.price}, ឯក្នុង DB គឺ $${plan.price}`}
                          </span>
                        </div>
                      )}

                      {checkoutStatus.isDev && (
                        <div className="mt-2.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-800 dark:text-purple-300 text-[11px] flex items-center gap-1.5">
                          <Bot className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                          <span>{lang === "en" ? "Dev/Internal code (unlisted)" : "កូដ Dev/Internal (មិនបង្ហាញ)"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quotas & Capacity (Clean dual metric capsules) */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50/90 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-amber-500" />
                        <span>{lang === "en" ? "Invitations" : "ធៀបការ"}</span>
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                        {plan.maxInvitations ? `${plan.maxInvitations} ${t("packages.invitationsCount", lang === "en" ? "invites" : "ធៀប")}` : t("packages.unlimited", lang === "en" ? "Unlimited" : "មិនកំណត់")}
                      </p>
                    </div>
                    <div className="border-l border-slate-200/80 dark:border-zinc-800 pl-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <Users className="h-3 w-3 text-amber-500" />
                        <span>{lang === "en" ? "Guests" : "ចំនួនភ្ញៀវ"}</span>
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                        {plan.maxGuests ? `${plan.maxGuests} ${t("packages.guestsCount", lang === "en" ? "guests" : "នាក់")}` : t("packages.unlimited", lang === "en" ? "Unlimited" : "មិនកំណត់")}
                      </p>
                    </div>
                  </div>

                  {/* Features & Permissions (Clean Checklist) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        {t("packages.featuresSec", lang === "en" ? "Key Features" : "មុខងារពិសេស")}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {enabledCount}/{FEATURE_LIST.length} {lang === "en" ? "Active" : "សកម្ម"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      {FEATURE_LIST.map((feat) => {
                        const enabled = Boolean(plan[feat.key]);
                        const featLabel = lang === "en" ? (feat.labelEn || feat.label) : (feat.labelKm || feat.label).split(" (")[0];
                        return (
                          <div
                            key={feat.key}
                            className={`flex items-center gap-2 ${
                              enabled
                                ? "text-slate-700 dark:text-zinc-300 font-medium"
                                : "text-slate-400 dark:text-zinc-600"
                            }`}
                          >
                            {enabled ? (
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800/80 text-slate-300 dark:text-zinc-600">
                                <X className="h-2.5 w-2.5" />
                              </div>
                            )}
                            <span className={`truncate ${!enabled ? "opacity-60" : ""}`}>{featLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditDrawer(plan)}
                    className="btn btn-ghost flex-1 h-8.5 rounded-xl text-xs font-semibold hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t("packages.edit", lang === "en" ? "Edit" : "កែសម្រួល")}</span>
                  </button>
                  <button
                    type="button"
                    disabled={busyId === plan.id}
                    onClick={() => toggleVisibility(plan)}
                    className={`btn h-8.5 px-3 rounded-xl text-xs font-semibold transition-colors ${
                      plan.publicVisible
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                        : "btn-ghost text-slate-400 dark:text-zinc-500"
                    }`}
                    title={plan.publicVisible ? (lang === "en" ? "Make unlisted" : "លាក់ពីសាធារណៈ") : (lang === "en" ? "Make public" : "បង្ហាញជាសាធារណៈ")}
                  >
                    {plan.publicVisible ? <Globe className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === plan.id}
                    onClick={() => toggleActive(plan)}
                    className={`btn h-8.5 px-3 rounded-xl text-xs font-semibold transition-colors ${
                      plan.active
                        ? "btn-danger"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                    }`}
                    title={plan.active ? t("packages.deactivate", lang === "en" ? "Deactivate" : "ផ្អាកដំណើរការ") : t("packages.activate", lang === "en" ? "Activate" : "បើកដំណើរការ")}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>{t("packages.colCode", "Code")}</th>
                <th>{t("packages.colName", "ឈ្មោះកញ្ចប់")}</th>
                <th>{t("packages.colPrice", "តម្លៃ (Price)")}</th>
                <th>{t("packages.colLimits", "កូតាកំណត់ (Limits)")}</th>
                <th>{t("packages.colFeatures", "មុខងារសំខាន់ៗ")}</th>
                <th>{t("packages.colStatus", "ស្ថានភាព")}</th>
                <th>{t("packages.colActions", "សកម្មភាព")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((plan) => {
                const isFree = Number(plan.price) === 0;
                return (
                  <tr key={plan.id}>
                    <td>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {plan.code}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-zinc-100">
                          {plan.packageName}
                        </p>
                        <small className="text-[10px] text-slate-500">{lang === 'en' ? 'Revision' : 'កំណែ'} {plan.revision ?? 0}</small>
                        {plan.description && (
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate max-w-xs">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {isFree ? "Free" : `${plan.currency || "USD"} ${plan.price}`}
                      </span>
                      {!isFree && (
                        <span className="text-[10px] text-slate-400 ml-1">
                          /{plan.billingInterval}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs space-y-0.5">
                        <p className="text-slate-700 dark:text-zinc-300">
                          💌 {plan.maxInvitations || "—"} {t("packages.invitationsCount", "ធៀប")}
                        </p>
                        <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
                          👥 {plan.maxGuests || "—"} {t("packages.guestsCount", "ភ្ញៀវ")}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {FEATURE_LIST.filter((f) => Boolean(plan[f.key])).map((f) => {
                          const badgeLabel = lang === "en" ? (f.labelEn || f.label) : (f.labelKm || f.label).split(" (")[0];
                          return (
                            <span
                              key={f.key}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                            >
                              {badgeLabel}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`badge ${plan.active ? "badge-green" : "badge-gray"}`}>
                          {plan.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <button
                          type="button"
                          disabled={busyId === plan.id}
                          onClick={() => toggleVisibility(plan)}
                          className={`badge text-[10px] cursor-pointer hover:opacity-80 transition ${
                            plan.publicVisible
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                          }`}
                          title={lang === "en" ? "Click to toggle public visibility" : "ចុចដើម្បីផ្លាស់ប្តូរការបង្ហាញជាសាធារណៈ"}
                        >
                          {plan.publicVisible ? (lang === "en" ? "PUBLIC ✓" : "សាធារណៈ ✓") : (lang === "en" ? "UNLISTED" : "ឯកជន")}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditDrawer(plan)}
                        >
                          <Pencil className="h-3 w-3 text-amber-500" />
                          <span>{t("packages.editShort", lang === "en" ? "Edit" : "កែ")}</span>
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            plan.publicVisible
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              : "btn-ghost text-slate-500"
                          }`}
                          disabled={busyId === plan.id}
                          onClick={() => toggleVisibility(plan)}
                          title={plan.publicVisible ? (lang === "en" ? "Make unlisted" : "លាក់ពីសាធារណៈ") : (lang === "en" ? "Make public" : "បង្ហាញជាសាធារណៈ")}
                        >
                          {plan.publicVisible ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          className={
                            plan.active
                              ? "btn btn-danger btn-sm"
                              : "btn btn-primary btn-sm"
                          }
                          disabled={busyId === plan.id}
                          onClick={() => toggleActive(plan)}
                        >
                          {plan.active ? t("packages.deactivateShort", lang === "en" ? "Deactivate" : "បិទ") : t("packages.activateShort", lang === "en" ? "Activate" : "បើក")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Clean, Modern Centered Modal with Clean Tabs */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#111113] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {editingId ? `${t("packages.modalEditTitle", "កែសម្រួលកញ្ចប់:")} ${form.packageName || "—"}` : t("packages.modalCreateTitle", "បង្កើតកញ្ចប់សេវាថ្មី")}
                    </h2>
                    {form.code && (
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {form.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {editingId ? t("packages.modalEditSub", "កែប្រែព័ត៌មានកញ្ចប់ កូតា និងសិទ្ធិមុខងារ") : t("packages.modalCreateSub", "បន្ថែម Subscription Package ថ្មីសម្រាប់ User")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Clean Segmented Tabs Navigation */}
            <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-[#111113] shrink-0">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/80">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === "basic"
                      ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{t("packages.basicInfoSec", "១. ព័ត៌មានទូទៅ")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("quotas")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === "quotas"
                      ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>{t("packages.quotasSec", "២. កូតាកំណត់")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("features")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === "features"
                      ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>{t("packages.featuresSec", "៣. មុខងារពិសេស")}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold">
                    {enabledFeaturesCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={save} id="package-form" className="flex-1 overflow-y-auto p-6">
              {/* Tab 1: Basic Information */}
              {activeTab === "basic" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* 1. Quick Presets Bar */}
                  <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>{t("packages.quickPresets", "១. ជ្រើសរើសគំរូរហ័ស (QUICK PRESETS)")}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{t("packages.quickPresetsSub", "ចុច ១ Click បំពេញគ្រប់ប្រឡោះ")}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PACKAGE_PRESETS.map((preset) => {
                        const isCurrent = form.code === preset.code;
                        return (
                          <button
                            key={preset.code}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              isCurrent
                                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                                : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Name & Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        {t("packages.packageNameLabel", "២. ឈ្មោះកញ្ចប់")} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="text-input w-full font-medium"
                        value={form.packageName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                        placeholder={lang === "en" ? "e.g. Pro, Standard, Enterprise" : "ឧ. Pro, Standard, Enterprise"}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          {t("packages.packageCodeLabel", "កូដសម្គាល់ (Code)")} <span className="text-rose-500">*</span>
                        </label>
                        {!editingId && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            Auto-generated
                          </span>
                        )}
                      </div>
                      <input
                        className="text-input w-full uppercase font-mono tracking-wider font-bold"
                        value={form.code}
                        onChange={(e) => setField("code", e.target.value.toUpperCase())}
                        required
                        placeholder={lang === "en" ? "e.g. PRO, FREE, VIP" : "ឧ. PRO, FREE, VIP"}
                      />
                    </div>
                  </div>

                  {/* 3. Description (Right after Name & Code, matching Card order) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      {t("packages.descriptionLabel", "៣. ការពិពណ៌នាសង្ខេប (Description)")}
                    </label>
                    <textarea
                      rows={2}
                      className="text-input w-full h-auto py-2.5 resize-none"
                      value={form.description || ""}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder={lang === "en" ? "Explain package benefits and special features..." : "ពន្យល់ពីអត្ថប្រយោជន៍ ឬលក្ខណៈពិសេសនៃកញ្ចប់នេះ..."}
                    />
                  </div>

                  {/* 4. Pricing & Currency Merged Input Group */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {t("packages.pricingLabel", "៤. តម្លៃកញ្ចប់ (Pricing)")}
                      </label>
                      <button
                        type="button"
                        onClick={() => setField("price", "0.00")}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition cursor-pointer ${
                          Number(form.price) === 0
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                        }`}
                      >
                        {Number(form.price) === 0 ? t("packages.freePackageOpt", "✓ កញ្ចប់ឥតគិតថ្លៃ (Free $0)") : t("packages.setFreeOpt", "កំណត់ជា Free ($0)")}
                      </button>
                    </div>

                    <div className="flex rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 bg-white dark:bg-zinc-900/60 transition">
                      <select
                        value={form.currency}
                        onChange={(e) => setField("currency", e.target.value)}
                        className="bg-slate-100 dark:bg-zinc-800/80 px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 border-r border-slate-200 dark:border-zinc-800 outline-none cursor-pointer hover:bg-slate-200/60 dark:hover:bg-zinc-800"
                      >
                        <option value="USD">$ USD</option>
                        <option value="KHR">៛ KHR</option>
                      </select>
                      <input
                        className="flex-1 h-9 bg-transparent px-3.5 text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none placeholder:text-slate-400"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* 5. 1-Click Segmented Buttons for Billing Interval */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      {t("packages.billingIntervalLabel", "៥. របៀបបង់ប្រាក់ (Billing Interval)")}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {INTERVALS.map((int) => {
                        const isSelected = form.billingInterval === int.value;
                        return (
                          <button
                            key={int.value}
                            type="button"
                            onClick={() => {
                              setField("billingInterval", int.value);
                              setField("durationDays", int.days);
                            }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                              isSelected
                                ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-xs ring-1 ring-amber-500/30"
                                : "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <span className="text-sm mb-0.5">{int.icon}</span>
                            <span>{lang === "en" ? (int.labelEn || int.label) : (int.labelKm || int.label)}</span>
                            <span className="text-[10px] font-normal opacity-70">({int.sub})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6. Duration & Sort Order */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      {t("packages.durationOrderLabel", "៦. សុពលភាព និងលំដាប់បង្ហាញ (Duration & Sort Order)")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                          <input
                            className="text-input w-full pr-12 font-medium"
                            type="number"
                            value={form.durationDays}
                            onChange={(e) => setField("durationDays", e.target.value)}
                            placeholder="365"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                            {t("packages.days", "ថ្ងៃ")}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">{t("packages.durationDaysSub", "សុពលភាពជាថ្ងៃ")}</span>
                      </div>

                      <div>
                        <input
                          className="text-input w-full"
                          type="number"
                          value={form.sortOrder}
                          onChange={(e) => setField("sortOrder", e.target.value)}
                          placeholder="0"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">{t("packages.sortOrderSub", "លេខលំដាប់បង្ហាញ (Sort Order)")}</span>
                      </div>
                    </div>
                  </div>

                  {/* 7. Public Pricing Visibility Switch */}
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      {t("packages.visibilityLabel", lang === "en" ? "7. Public Catalog Visibility" : "៧. ការបង្ហាញជាសាធារណៈ (Public Pricing)")}
                    </label>
                    <ToggleSwitch
                      checked={Boolean(form.publicVisible)}
                      onChange={(val) => setField("publicVisible", val)}
                      label={lang === "en" ? "List on Public Pricing (/pricing)" : "បង្ហាញលើទំព័រតម្លៃសាធារណៈ (/pricing)"}
                      sublabel={lang === "en" ? "Allow anonymous visitors to view this package without logging in" : "អនុញ្ញាតឱ្យភ្ញៀវទូទៅមើលឃើញកញ្ចប់នេះដោយមិនបាច់ Login"}
                      icon={Globe}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Quotas & Limits */}
              {activeTab === "quotas" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5 mb-2">
                    <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                      {t("packages.quotaBanner", "កំណត់កូតា និងទំហំផ្ទុកសម្រាប់គណនី User ដែលប្រើប្រាស់កញ្ចប់នេះ។")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {t("packages.quotaMaxInvites", "ចំនួនធៀបការអតិបរមា")}
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        {t("packages.quotaMaxInvitesSub", "ចំនួនធៀបការមង្គលការដែល User អាចបង្កើតបាន")}
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxInvitations}
                          onChange={(e) => setField("maxInvitations", e.target.value)}
                          placeholder={lang === "en" ? "e.g. 1, 10, 50" : "ឧ. 1, 10, 50"}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          {t("packages.invitationsCount", "ធៀប")}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {t("packages.quotaMaxGuests", "ចំនួនភ្ញៀវអតិបរមា")}
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        {t("packages.quotaMaxGuestsSub", "ចំនួនភ្ញៀវសរុបទាំងអស់ដែលគណនីអាចផ្ទុកបាន")}
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxGuests}
                          onChange={(e) => setField("maxGuests", e.target.value)}
                          placeholder={lang === "en" ? "e.g. 100, 500, 2000" : "ឧ. 100, 500, 2000"}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          {t("packages.guestsCount", "នាក់")}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {t("packages.quotaPerInvite", "ភ្ញៀវក្នុង១ធៀបការ")}
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        {t("packages.quotaPerInviteSub", "ចំនួនភ្ញៀវអតិបរមាក្នុងធៀបនីមួយៗ")}
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxGuestsPerInvitation}
                          onChange={(e) => setField("maxGuestsPerInvitation", e.target.value)}
                          placeholder={lang === "en" ? "e.g. 40" : "ឧ. 40"}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          {t("packages.guestsCount", "នាក់")}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {t("packages.quotaTeam", "សមាជិកក្រុមជំនួយការ")}
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        {t("packages.quotaTeamSub", "ចំនួន Team members អាចសហការគ្នាបាន")}
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxTeamMembers}
                          onChange={(e) => setField("maxTeamMembers", e.target.value)}
                          placeholder={lang === "en" ? "e.g. 1, 5" : "ឧ. 1, 5"}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          {lang === "en" ? "members" : "នាក់"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Features & Permissions */}
              {activeTab === "features" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Status Toggle (Highlight) */}
                  <div className="mb-4">
                    <ToggleSwitch
                      checked={Boolean(form.active)}
                      onChange={(val) => setField("active", val)}
                      label={t("packages.statusActiveLabel", "ស្ថានភាពដំណើរការ (Status: Active)")}
                      sublabel={
                        form.active
                          ? t("packages.statusActiveSub", "កញ្ចប់នេះកំពុងផ្សាយផ្ទាល់ User អាចមើលឃើញ និងទិញបាន")
                          : t("packages.statusInactiveSub", "កញ្ចប់នេះត្រូវបានលាក់បណ្ដោះអាសន្ន")
                      }
                      icon={Power}
                    />
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 pt-1">
                    {t("packages.featureSwitches", "សិទ្ធិប្រើប្រាស់មុខងារនីមួយៗ (Feature Switches)")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FEATURE_LIST.map(({ key, labelKm, labelEn, label, sublabelKm, sublabelEn, sublabel, icon }) => (
                      <ToggleSwitch
                        key={key}
                        checked={Boolean(form[key])}
                        onChange={(val) => setField(key, val)}
                        label={lang === "en" ? (labelEn || label) : (labelKm || label)}
                        sublabel={lang === "en" ? (sublabelEn || sublabel) : (sublabelKm || sublabel)}
                        icon={icon}
                      />
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>{t("packages.stepLabel", "ជំហាន:")}</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  {activeTab === "basic" ? t("packages.basicInfoSec", "១. ព័ត៌មានទូទៅ") : activeTab === "quotas" ? t("packages.quotasSec", "២. កូតាកំណត់") : t("packages.featuresSec", "៣. មុខងារពិសេស")}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="btn btn-ghost px-4 py-2"
                >
                  {t("packages.cancelBtn", "បោះបង់")}
                </button>
                <button
                  type="submit"
                  form="package-form"
                  disabled={busyId === (editingId || "new")}
                  className="btn btn-primary px-5 py-2 font-bold shadow-md shadow-amber-500/20"
                >
                  {editingId ? t("packages.saveBtn", "រក្សាទុកការកែប្រែ") : t("packages.createSubmitBtn", "បង្កើតកញ្ចប់ថ្មី")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
