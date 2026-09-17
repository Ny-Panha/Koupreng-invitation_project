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
  Calendar,
  Hash,
  Info,
} from "lucide-react";
import { Loading, ErrorState, Empty } from "../../components/States";
import Toast from "../../components/Toast";
import { useResource } from "../../hooks/useResource";
import { useToast } from "../../hooks/useToast";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "./adminManagementService";
import "./AdminFeature.css";

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
  sortOrder: "0",
};

const FEATURE_LIST = [
  {
    key: "premiumTemplatesEnabled",
    label: "គំរូ Premium (Templates)",
    sublabel: "បើកសិទ្ធិប្រើប្រាស់ម៉ូតធៀបការលំដាប់ប្រណិត",
    icon: Crown,
  },
  {
    key: "qrInvitationsEnabled",
    label: "ធៀបការ QR (QR Invitations)",
    sublabel: "ចែករំលែកធៀបការតាម QR Code និងតំណភ្ជាប់",
    icon: QrCode,
  },
  {
    key: "qrCheckInEnabled",
    label: "ស្កេន QR ពេលចូលរោង (Check-in)",
    sublabel: "ប្រព័ន្ធស្កេនពិនិត្យវត្តមានភ្ញៀវនៅមុខរោងការ",
    icon: CheckCircle2,
  },
  {
    key: "seatingEnabled",
    label: "រៀបចំតុភ្ញៀវ (Seating Chart)",
    sublabel: "រៀបចំលេខតុ និងប្លង់អង្គុយសម្រាប់ភ្ញៀវកិត្តិយស",
    icon: Armchair,
  },
  {
    key: "advancedAnalyticsEnabled",
    label: "របាយការណ៍លម្អិត (Analytics)",
    sublabel: "ស្ថិតិការបើកមើលធៀប និងចំនួនភ្ញៀវ RSVP ជាក់ស្តែង",
    icon: BarChart3,
  },
  {
    key: "teamMembersEnabled",
    label: "សមាជិកក្រុម (Team Collaboration)",
    sublabel: "អាច Invite សមាជិកគ្រួសារជួយរៀបចំធៀបការរួមគ្នា",
    icon: Users,
  },
  {
    key: "aiAssistantEnabled",
    label: "ជំនួយការ AI (AI Assistant)",
    sublabel: "ជំនួយការឆ្លាតវៃជួយសរសេរពាក្យជូនពរ និងរៀបកាលវិភាគ",
    icon: Bot,
  },
];

const INTERVALS = [
  { value: "YEARLY", label: "ប្រចាំឆ្នាំ", sub: "Yearly", days: "365", icon: "📅" },
  { value: "MONTHLY", label: "ប្រចាំខែ", sub: "Monthly", days: "30", icon: "🗓️" },
  { value: "ONE_TIME", label: "ម្តងគត់", sub: "One-time", days: "90", icon: "🎫" },
  { value: "LIFETIME", label: "មួយជីវិត", sub: "Lifetime", days: "9999", icon: "♾️" },
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
  const { data, setData, loading, error, reload } = useResource(adminManagementService.packages);
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
    show(`បានជ្រើសរើសគំរូ "${preset.name}" ✓`);
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

  // Count active features for badge
  const enabledFeaturesCount = useMemo(() => {
    return FEATURE_LIST.filter((f) => Boolean(form[f.key])).length;
  }, [form]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                កញ្ចប់សេវាកម្ម (Packages)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                កំណត់តម្លៃ កូតា និងសិទ្ធិប្រើប្រាស់មុខងារសម្រាប់ User
              </p>
            </div>
          </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={reload}
            className="btn btn-ghost h-9 px-3 text-xs"
            title="Refresh"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>{lang === "en" ? "Refresh" : "ផ្ទុកឡើងវិញ"}</span>
          </button>
          <button
            type="button"
            onClick={openCreateDrawer}
            className="btn btn-primary h-9 px-4 text-xs shadow-md shadow-amber-500/20 font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>{lang === "en" ? "+ New Package" : "+ បង្កើតកញ្ចប់ថ្មី"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              កញ្ចប់ទាំងអស់
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              សកម្ម (Active)
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.active}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Power className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              កញ្ចប់បង់ប្រាក់ (Paid)
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {stats.paid}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              ឥតគិតថ្លៃ (Free)
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1">
              {stats.free}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ឬ Code..."
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
            <option value="ALL">ស្ថានភាពទាំងអស់</option>
            <option value="ACTIVE">សកម្ម (Active)</option>
            <option value="INACTIVE">អសកម្ម (Inactive)</option>
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
            <span>Cards</span>
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
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : filteredPackages.length === 0 ? (
        <Empty label="រកមិនឃើញកញ្ចប់សេវាកម្មទេ" />
      ) : viewMode === "cards" ? (
        /* Cards / Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredPackages.map((plan) => {
            const isFree = Number(plan.price) === 0;
            const enabledCount = FEATURE_LIST.filter((f) => Boolean(plan[f.key])).length;
            const intervalText =
              plan.billingInterval === "YEARLY"
                ? "ឆ្នាំ"
                : plan.billingInterval === "MONTHLY"
                ? "ខែ"
                : plan.billingInterval === "LIFETIME"
                ? "មួយជីវិត"
                : "ម្តងគត់";

            return (
              <div
                key={plan.id}
                className={`card p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-amber-500/40 relative overflow-hidden ${
                  !plan.active ? "opacity-70 bg-slate-50/50 dark:bg-zinc-950/40" : ""
                }`}
              >
                <div className="space-y-3.5">
                  {/* Section 1: ១. ព័ត៌មានទូទៅ (Basic Info, Price & Duration) */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        ១. ព័ត៌មានទូទៅ
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          {plan.code}
                        </span>
                        <span
                          className={`badge text-[10px] ${
                            plan.active ? "badge-green" : "badge-gray"
                          }`}
                        >
                          {plan.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {plan.packageName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5 min-h-[32px]">
                      {plan.description || "គ្មានការពិពណ៌នា"}
                    </p>

                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
                          {isFree ? "$0.00" : `${plan.currency || "USD"} ${plan.price}`}
                        </span>
                        {isFree ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Free $0
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                            / {intervalText} ({plan.billingInterval})
                          </span>
                        )}
                      </div>
                      {plan.durationDays && (
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                          <span>📅 សុពលភាព:</span>
                          <span className="font-semibold text-slate-600 dark:text-zinc-400">
                            {plan.durationDays} ថ្ងៃ
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Section 2: ២. កូតាកំណត់ (Quotas & Limits) */}
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        ២. កូតាកំណត់
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                          <Mail className="h-3.5 w-3.5 text-amber-500" /> ធៀបការអតិបរមា:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {plan.maxInvitations ? `${plan.maxInvitations} ធៀប` : "មិនកំណត់"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                          <Users className="h-3.5 w-3.5 text-amber-500" /> ចំនួនភ្ញៀវអតិបរមា:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {plan.maxGuests ? `${plan.maxGuests} នាក់` : "មិនកំណត់"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: ៣. មុខងារពិសេស (Features & Permissions) */}
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        ៣. មុខងារពិសេស
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {enabledCount}/{FEATURE_LIST.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      {FEATURE_LIST.map(({ key, label }) => {
                        const enabled = Boolean(plan[key]);
                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-2 ${
                              enabled
                                ? "text-slate-700 dark:text-zinc-300"
                                : "text-slate-400 dark:text-zinc-600 line-through"
                            }`}
                          >
                            {enabled ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-slate-300 dark:text-zinc-700 shrink-0" />
                            )}
                            <span className="truncate">{label.split(" (")[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditDrawer(plan)}
                    className="btn btn-ghost flex-1 h-8 text-xs font-semibold hover:border-amber-500"
                  >
                    <Pencil className="h-3.5 w-3.5 text-amber-500" />
                    <span>កែសម្រួល</span>
                  </button>
                  <button
                    type="button"
                    disabled={busyId === plan.id}
                    onClick={() => toggleActive(plan)}
                    className={`btn h-8 text-xs font-semibold px-2.5 ${
                      plan.active
                        ? "btn-danger"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                    }`}
                    title={plan.active ? "ផ្អាកដំណើរការ" : "បើកដំណើរការ"}
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
                <th>Code</th>
                <th>ឈ្មោះកញ្ចប់</th>
                <th>តម្លៃ (Price)</th>
                <th>កូតាកំណត់ (Limits)</th>
                <th>មុខងារសំខាន់ៗ</th>
                <th>ស្ថានភាព</th>
                <th>សកម្មភាព</th>
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
                          💌 {plan.maxInvitations || "—"} ធៀប
                        </p>
                        <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
                          👥 {plan.maxGuests || "—"} ភ្ញៀវ
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {FEATURE_LIST.filter((f) => Boolean(plan[f.key])).map((f) => (
                          <span
                            key={f.key}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                          >
                            {f.label.split(" (")[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${plan.active ? "badge-green" : "badge-gray"}`}>
                        {plan.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditDrawer(plan)}
                        >
                          <Pencil className="h-3 w-3 text-amber-500" />
                          <span>{lang === "en" ? "Edit" : "កែ"}</span>
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
                          {plan.active ? (lang === "en" ? "Deactivate" : "បិទ") : (lang === "en" ? "Activate" : "បើក")}
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
                      {editingId ? `កែសម្រួលកញ្ចប់: ${form.packageName || "—"}` : "បង្កើតកញ្ចប់សេវាថ្មី"}
                    </h2>
                    {form.code && (
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {form.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {editingId ? "កែប្រែព័ត៌មានកញ្ចប់ កូតា និងសិទ្ធិមុខងារ" : "បន្ថែម Subscription Package ថ្មីសម្រាប់ User"}
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
                  <span>១. ព័ត៌មានទូទៅ</span>
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
                  <span>២. កូតាកំណត់</span>
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
                  <span>៣. មុខងារពិសេស</span>
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
                        <span>១. ជ្រើសរើសគំរូរហ័ស (QUICK PRESETS)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">ចុច ១ Click បំពេញគ្រប់ប្រឡោះ</span>
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
                        ២. ឈ្មោះកញ្ចប់ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="text-input w-full font-medium"
                        value={form.packageName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                        placeholder="ឧ. Pro, Standard, Enterprise"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          កូដសម្គាល់ (Code) <span className="text-rose-500">*</span>
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
                        placeholder="ឧ. PRO, FREE, VIP"
                      />
                    </div>
                  </div>

                  {/* 3. Description (Right after Name & Code, matching Card order) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      ៣. ការពិពណ៌នាសង្ខេប (Description)
                    </label>
                    <textarea
                      rows={2}
                      className="text-input w-full h-auto py-2.5 resize-none"
                      value={form.description || ""}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="ពន្យល់ពីអត្ថប្រយោជន៍ ឬលក្ខណៈពិសេសនៃកញ្ចប់នេះ..."
                    />
                  </div>

                  {/* 4. Pricing & Currency Merged Input Group */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        ៤. តម្លៃកញ្ចប់ (Pricing)
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
                        {Number(form.price) === 0 ? "✓ កញ្ចប់ឥតគិតថ្លៃ (Free $0)" : "កំណត់ជា Free ($0)"}
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
                      ៥. របៀបបង់ប្រាក់ (Billing Interval)
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
                            <span>{int.label}</span>
                            <span className="text-[10px] font-normal opacity-70">({int.sub})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6. Duration & Sort Order */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      ៦. សុពលភាព និងលំដាប់បង្ហាញ (Duration & Sort Order)
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
                            ថ្ងៃ
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">សុពលភាពជាថ្ងៃ</span>
                      </div>

                      <div>
                        <input
                          className="text-input w-full"
                          type="number"
                          value={form.sortOrder}
                          onChange={(e) => setField("sortOrder", e.target.value)}
                          placeholder="0"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">លេខលំដាប់បង្ហាញ (Sort Order)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Quotas & Limits */}
              {activeTab === "quotas" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5 mb-2">
                    <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                      កំណត់កូតា និងទំហំផ្ទុកសម្រាប់គណនី User ដែលប្រើប្រាស់កញ្ចប់នេះ។
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          ចំនួនធៀបការអតិបរមា
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        ចំនួនធៀបការមង្គលការដែល User អាចបង្កើតបាន
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxInvitations}
                          onChange={(e) => setField("maxInvitations", e.target.value)}
                          placeholder="ឧ. 1, 10, 50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          ធៀប
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          ចំនួនភ្ញៀវអតិបរមា
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        ចំនួនភ្ញៀវសរុបទាំងអស់ដែលគណនីអាចផ្ទុកបាន
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxGuests}
                          onChange={(e) => setField("maxGuests", e.target.value)}
                          placeholder="ឧ. 100, 500, 2000"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          នាក់
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          ភ្ញៀវក្នុង១ធៀបការ
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        ចំនួនភ្ញៀវអតិបរមាក្នុងធៀបនីមួយៗ
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxGuestsPerInvitation}
                          onChange={(e) => setField("maxGuestsPerInvitation", e.target.value)}
                          placeholder="ឧ. 40"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          នាក់
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          សមាជិកក្រុមជំនួយការ
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                        ចំនួន Team members អាចសហការគ្នាបាន
                      </p>
                      <div className="relative">
                        <input
                          className="text-input w-full pr-12 font-semibold"
                          type="number"
                          value={form.maxTeamMembers}
                          onChange={(e) => setField("maxTeamMembers", e.target.value)}
                          placeholder="ឧ. 1, 5"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                          នាក់
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
                      label="ស្ថានភាពដំណើរការ (Status: Active)"
                      sublabel={
                        form.active
                          ? "កញ្ចប់នេះកំពុងផ្សាយផ្ទាល់ User អាចមើលឃើញ និងទិញបាន"
                          : "កញ្ចប់នេះត្រូវបានលាក់បណ្ដោះអាសន្ន"
                      }
                      icon={Power}
                    />
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 pt-1">
                    សិទ្ធិប្រើប្រាស់មុខងារនីមួយៗ (Feature Switches)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FEATURE_LIST.map(({ key, label, sublabel, icon }) => (
                      <ToggleSwitch
                        key={key}
                        checked={Boolean(form[key])}
                        onChange={(val) => setField(key, val)}
                        label={label}
                        sublabel={sublabel}
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
                <span>ជំហាន:</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  {activeTab === "basic" ? "១. ព័ត៌មានទូទៅ" : activeTab === "quotas" ? "២. កូតាកំណត់" : "៣. មុខងារពិសេស"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="btn btn-ghost px-4 py-2"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  form="package-form"
                  disabled={busyId === (editingId || "new")}
                  className="btn btn-primary px-5 py-2 font-bold shadow-md shadow-amber-500/20"
                >
                  {editingId ? "រក្សាទុកការកែប្រែ" : "បង្កើតកញ្ចប់ថ្មី"}
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
