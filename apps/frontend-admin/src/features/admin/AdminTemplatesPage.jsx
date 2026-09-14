import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  Crown,
  Gift,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Upload,
  Link as LinkIcon,
  X,
  Eye,
  AlertCircle
} from "lucide-react";
import { useResource } from "../../hooks/useResource";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "../../lib/format";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "./adminManagementService";
import { AdminPageHeader, StatCard, StatusBadge, ActionButton } from "../../shared/ui/AdminUI";
import Toast from "../../components/Toast";
import { Loading, ErrorState } from "../../components/States";

const CATEGORIES = [
  { value: "ALL", label: "គ្រប់ប្រភេទ (All Categories)" },
  { value: "TRADITIONAL", label: "ប្រពៃណីខ្មែរ (Traditional)" },
  { value: "MODERN", label: "សម័យទំនើប (Modern)" },
  { value: "LUXURY", label: "ប្រណិត (Luxury Royal)" },
  { value: "MINIMALIST", label: "សាមញ្ញ (Minimalist)" },
  { value: "FLORAL", label: "ផ្កាស្រស់ (Floral Garden)" },
  { value: "OTHER", label: "ផ្សេងៗ (Other)" },
];

const EMPTY_TEMPLATE = {
  name: "",
  category: "TRADITIONAL",
  thumbnailUrl: "",
  previewUrl: "",
  premium: false,
  status: "ACTIVE",
  description: "",
};

export function formatTemplateDescription(description) {
  if (!description) return "គំរូធៀបការមង្គលការបែបប្រពៃណីខ្មែរ រចនាបទស្រស់ស្អាតនិងទំនើប";
  const str = String(description).trim();
  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str);
      if (parsed.blessingMessage && typeof parsed.blessingMessage === "string" && parsed.blessingMessage.trim()) {
        return parsed.blessingMessage.trim();
      }
      if (parsed.invitationTitle && typeof parsed.invitationTitle === "string" && parsed.invitationTitle.trim()) {
        return `${parsed.invitationTitle} — គំរូធៀបការឌីជីថលបែបប្រណិត`;
      }
      if (parsed.groomName && parsed.brideName) {
        return `គំរូធៀបការមង្គលការ ${parsed.groomName} & ${parsed.brideName}`;
      }
      if (parsed.description && typeof parsed.description === "string" && parsed.description.trim()) {
        return parsed.description.trim();
      }
      return "គំរូធៀបការមង្គលការបែបប្រពៃណីខ្មែរ រចនាបទស្រស់ស្អាតនិងទំនើប";
    } catch {
      return str;
    }
  }
  return str;
}

// Component: Reliable Template Thumbnail with Graceful Fallback
function TemplateThumbnail({ src, alt, category }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-amber-600/70 dark:text-amber-400/60 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-slate-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        <div className="relative flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/15 flex items-center justify-center border border-amber-500/25 mb-2 shadow-inner">
            <Palette className="h-6 w-6 text-amber-500" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {category || "Khmer Wedding"}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
            Wedding Template
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Template Thumbnail"}
      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminTemplatesPage() {
  const { lang, t } = useAdminLanguage();
  const navigate = useNavigate();
  const { data, setData, loading, error, reload } = useResource(adminManagementService.templates);
  const { toast, show, clear } = useToast();
  const fileInputRef = useRef(null);

  // Filters & State
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState(EMPTY_TEMPLATE);
  const [imageInputMode, setImageInputMode] = useState("url"); // 'url' | 'upload'
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Raw templates list
  const templatesList = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = templatesList.length;
    const premium = templatesList.filter((t) => Boolean(t.premium)).length;
    const free = total - premium;
    const active = templatesList.filter((t) => t.status === "ACTIVE" || !t.status).length;
    return { total, premium, free, active };
  }, [templatesList]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templatesList.filter((t) => {
      // Category filter
      if (categoryFilter !== "ALL" && (t.category || "OTHER") !== categoryFilter) {
        return false;
      }
      // Type filter (Free vs Premium)
      if (typeFilter === "PREMIUM" && !t.premium) return false;
      if (typeFilter === "FREE" && t.premium) return false;
      // Status filter
      if (statusFilter === "ACTIVE" && t.status === "INACTIVE") return false;
      if (statusFilter === "INACTIVE" && t.status !== "INACTIVE") return false;

      // Text search
      if (!q) return true;
      return [t.name, t.category, t.slug, t.status, String(t.id), formatTemplateDescription(t.description)]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [templatesList, query, categoryFilter, typeFilter, statusFilter]);

  // Open Full Studio for Create
  const handleOpenCreate = () => {
    navigate("/templates/new");
  };

  // Open Full Studio for Edit
  const handleOpenEdit = (template) => {
    navigate(`/templates/${template.id}`);
  };

  // Close Modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTemplate(null);
    setFormData(EMPTY_TEMPLATE);
  };

  // Handle Local File Upload (Convert to Data URL)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      show("សូមជ្រើសរើសប្រភេទ File រូបភាព (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      show("ទំហំរូបភាពធំជាង 8MB សូមបន្ថយទំហំរូបភាព", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setFormData((prev) => ({ ...prev, thumbnailUrl: result }));
        show("បានជ្រើសរើសរូបភាពជោគជ័យ ✓");
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Form (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      show("សូមបញ្ចូលឈ្មោះគំរូធៀបការ", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTemplate) {
        const updated = await adminManagementService.updateTemplate(editingTemplate.id, formData);
        setData((current) =>
          (current || []).map((t) =>
            t.id === editingTemplate.id ? { ...t, ...formData, ...updated } : t
          )
        );
        show("បានកែប្រែគំរូធៀបការជោគជ័យ ✓");
      } else {
        const created = await adminManagementService.createTemplate(formData);
        setData((current) => [created || { id: Date.now(), ...formData }, ...(current || [])]);
        show("បានបង្កើតគំរូធៀបការថ្មីជោគជ័យ ✓");
      }
      handleCloseModal();
    } catch (err) {
      show(err?.message || "បរាជ័យក្នុងការរក្សាទុកគំរូ", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Premium Status
  const handleTogglePremium = async (template) => {
    const nextVal = !template.premium;
    setBusyId(template.id);
    // Optimistic UI update
    setData((current) =>
      (current || []).map((t) => (t.id === template.id ? { ...t, premium: nextVal } : t))
    );
    try {
      const updated = await adminManagementService.updateTemplatePremium(template.id, nextVal);
      setData((current) =>
        (current || []).map((t) =>
          t.id === template.id ? { ...t, premium: nextVal, ...(updated || {}) } : t
        )
      );
      show(nextVal ? "បានកំណត់ជា Premium 👑" : "បានកំណត់ជា Free 🎁");
    } catch (err) {
      // Rollback on error
      setData((current) =>
        (current || []).map((t) => (t.id === template.id ? { ...t, premium: !nextVal } : t))
      );
      show(err?.message || "មិនអាចប្ដូរប្រភេទគំរូបានទេ", "error");
    } finally {
      setBusyId(null);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleActive = async (template) => {
    const isActive = template.status === "ACTIVE" || !template.status;
    const nextStatus = isActive ? "INACTIVE" : "ACTIVE";
    setBusyId(template.id);
    // Optimistic UI update
    setData((current) =>
      (current || []).map((t) => (t.id === template.id ? { ...t, status: nextStatus } : t))
    );
    try {
      const updated = isActive
        ? await adminManagementService.deactivateTemplate(template.id)
        : await adminManagementService.activateTemplate(template.id);
      setData((current) =>
        (current || []).map((t) =>
          t.id === template.id ? { ...t, status: nextStatus, ...(updated || {}) } : t
        )
      );
      show(isActive ? "បានបិទដំណើរការគំរូ" : "បានបើកដំណើរការគំរូ ✓");
    } catch (err) {
      // Rollback on error
      setData((current) =>
        (current || []).map((t) =>
          t.id === template.id ? { ...t, status: isActive ? "ACTIVE" : "INACTIVE" } : t
        )
      );
      show(err?.message || "បរាជ័យក្នុងការប្ដូរស្ថានភាព", "error");
    } finally {
      setBusyId(null);
    }
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setBusyId(deleteConfirm.id);
    try {
      await adminManagementService.deleteTemplate(deleteConfirm.id);
      setData((current) => (current || []).filter((t) => t.id !== deleteConfirm.id));
      show("បានលុបគំរូធៀបការរួចរាល់ ✓");
      setDeleteConfirm(null);
    } catch (err) {
      show(err?.message || "មិនអាចលុបគំរូនេះបានទេ", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        eyebrow={lang === "en" ? "Catalog & Templates" : "គំរូ & កាតាឡុក"}
        title={t("nav.templates", "គំរូធៀបការ")}
        subtitle={
          lang === "en"
            ? "Manage digital invitation templates, packages, and publishing statuses"
            : "គ្រប់គ្រងគំរូធៀបការឌីជីថល កំណត់កញ្ចប់សេវា និងស្ថានភាពបង្ហាញជូនអតិថិជន"
        }
        actions={
          <>
            <ActionButton variant="ghost" size="sm" onClick={reload}>
              <RefreshCw className="h-4 w-4" />
              <span>{t("common.refresh", "ផ្ទុកឡើងវិញ")}</span>
            </ActionButton>
            <ActionButton variant="primary" size="sm" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              <span>{lang === "en" ? "+ New Template" : "+ បង្កើតគំរូថ្មី"}</span>
            </ActionButton>
          </>
        }
      />

      {/* 4 Stat Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={lang === "en" ? "All Templates" : "គំរូទាំងអស់"}
          value={stats.total}
          note={lang === "en" ? "Total templates in system" : "ចំនួនគំរូសរុបក្នុងប្រព័ន្ធ"}
          icon={Palette}
          tone="amber"
        />
        <StatCard
          label={lang === "en" ? "Premium Templates" : "គំរូ PREMIUM"}
          value={stats.premium}
          note={lang === "en" ? "For paid tier packages" : "សម្រាប់គណនីបង់ប្រាក់"}
          icon={Crown}
          tone="purple"
        />
        <StatCard
          label={lang === "en" ? "Free Templates" : "គំរូឥតគិតថ្លៃ (FREE)"}
          value={stats.free}
          note={lang === "en" ? "Available for all users" : "សម្រាប់អតិថិជនទូទៅ"}
          icon={Gift}
          tone="emerald"
        />
        <StatCard
          label={lang === "en" ? "Active Templates" : "កំពុងដំណើរការ (ACTIVE)"}
          value={stats.active}
          note={lang === "en" ? "Visible on public site" : "បង្ហាញលើគេហទំព័រ"}
          icon={CheckCircle2}
          tone="cyan"
        />
      </section>

      {/* Filter Toolbar */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-[#111113]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-amber-500 transition-colors"
              placeholder={lang === "en" ? "Search by name, category, ID..." : "ស្វែងរកតាមឈ្មោះ, ប្រភេទ, ID..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Select */}
            <select
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">{lang === "en" ? "All Categories" : "គ្រប់ប្រភេទ (All Categories)"}</option>
              <option value="TRADITIONAL">{lang === "en" ? "Traditional Khmer" : "ប្រពៃណីខ្មែរ (Traditional)"}</option>
              <option value="MODERN">{lang === "en" ? "Modern Minimal" : "សម័យទំនើប (Modern)"}</option>
              <option value="LUXURY">{lang === "en" ? "Luxury Royal" : "ប្រណិត (Luxury Royal)"}</option>
              <option value="MINIMALIST">{lang === "en" ? "Minimalist" : "សាមញ្ញ (Minimalist)"}</option>
              <option value="FLORAL">{lang === "en" ? "Floral Garden" : "ផ្កាស្រស់ (Floral Garden)"}</option>
              <option value="OTHER">{lang === "en" ? "Other" : "ផ្សេងៗ (Other)"}</option>
            </select>

            {/* Type Select (Free / Premium) */}
            <select
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">{lang === "en" ? "All Pricing Types" : "ប្រភេទតម្លៃទាំងអស់"}</option>
              <option value="FREE">{lang === "en" ? "Free" : "ឥតគិតថ្លៃ (Free)"}</option>
              <option value="PREMIUM">Premium 👑</option>
            </select>

            {/* Status Select */}
            <select
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">{lang === "en" ? "All Statuses" : "ស្ថានភាពទាំងអស់"}</option>
              <option value="ACTIVE">{lang === "en" ? "Active" : "ដំណើរការ (Active)"}</option>
              <option value="INACTIVE">{lang === "en" ? "Inactive" : "បានបិទ (Inactive)"}</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-amber-600 shadow-xs dark:bg-zinc-800 dark:text-amber-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                title={lang === "en" ? "Grid Cards View" : "ទម្រង់ Grid Cards"}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-amber-600 shadow-xs dark:bg-zinc-800 dark:text-amber-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                title={lang === "en" ? "Table View" : "ទម្រង់តារាង Table"}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {loading ? (
        <Loading label="កំពុងទាញយកបញ្ជីគំរូធៀបការ..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-zinc-800 dark:bg-[#111113]/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
            <Palette className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            រកមិនឃើញគំរូធៀបការឡើយ
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            មិនមានគំរូដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។ សូមសាកល្បងប្ដូរពាក្យគន្លឹះ ឬបង្កើតគំរូថ្មី។
          </p>
          <div className="mt-5">
            <ActionButton variant="primary" size="sm" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              <span>បង្កើតគំរូថ្មីឥឡូវនេះ</span>
            </ActionButton>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            const isPremium = Boolean(template.premium || template.isPremium);
            const isActive = template.status === "ACTIVE" || !template.status;
            const isBusy = busyId === template.id;

            return (
              <div
                key={template.id}
                onClick={() => handleOpenEdit(template)}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl dark:border-zinc-800 dark:bg-[#111113] cursor-pointer"
              >
                {/* Thumbnail Preview Header */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
                  <TemplateThumbnail
                    src={template.thumbnailUrl}
                    alt={template.name}
                    category={template.category}
                  />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    {/* Premium / Free Badge */}
                    {isPremium ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-amber-500/20 backdrop-blur-md">
                        <Crown className="h-3 w-3" />
                        <span>👑 PREMIUM</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-500/20 backdrop-blur-md">
                        <Gift className="h-3 w-3" />
                        <span>🎁 FREE</span>
                      </span>
                    )}

                    {/* Active / Inactive Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                        isActive
                          ? "bg-slate-900/85 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-900/85 text-rose-400 border border-rose-500/40"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                        }`}
                      />
                      <span>{isActive ? "ដំណើរការ" : "បានបិទ"}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-block rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {template.category || "TRADITIONAL"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                      ID #{template.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors line-clamp-1">
                    {template.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed flex-1">
                    {formatTemplateDescription(template.description)}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                    <span>បង្កើត៖ {formatDate(template.createdAt)}</span>
                  </div>

                  {/* Card Quick Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    {/* Toggle Premium / Free Labeled Button */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePremium(template);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isPremium
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 shadow-xs"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-xs"
                      }`}
                      title={isPremium ? "ចុចដើម្បីប្ដូរទៅ Free 🎁" : "ចុចដើម្បីប្ដូរទៅ Premium 👑"}
                    >
                      {isPremium ? (
                        <>
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                          <span>Premium</span>
                        </>
                      ) : (
                        <>
                          <Gift className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Free</span>
                        </>
                      )}
                    </button>

                    {/* Action Icon Group */}
                    <div className="flex items-center gap-1.5">
                      {/* Toggle Active/Inactive */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(template);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all border cursor-pointer ${
                          isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                        }`}
                        title={isActive ? "បិទការប្រើប្រាស់ (Deactivate)" : "បើកការប្រើប្រាស់ (Activate)"}
                      >
                        {isActive ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(template);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-amber-500/50 dark:hover:text-amber-400 transition-all cursor-pointer"
                        title="កែប្រែព័ត៌មានគំរូ (Edit)"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(template);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
                        title="លុបគំរូធៀបការ (Delete)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-[#111113]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-500">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">គំរូធៀបការ (Template)</th>
                  <th className="px-3 py-3.5">ប្រភេទ (Category)</th>
                  <th className="px-3 py-3.5">កញ្ចប់ (Tier)</th>
                  <th className="px-3 py-3.5">ស្ថានភាព (Status)</th>
                  <th className="px-3 py-3.5">កាលបរិច្ឆេទ</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filteredTemplates.map((template) => {
                  const isPremium = Boolean(template.premium || template.isPremium);
                  const isActive = template.status === "ACTIVE" || !template.status;
                  const isBusy = busyId === template.id;

                  return (
                    <tr
                      key={template.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden border border-slate-200 dark:border-zinc-700">
                            <TemplateThumbnail
                              src={template.thumbnailUrl}
                              alt={template.name}
                              category={template.category}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-zinc-100">
                              {template.name}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                              ID: #{template.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {template.category || "TRADITIONAL"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {isPremium ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Crown className="h-3 w-3" />
                            <span>PREMIUM</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Gift className="h-3 w-3" />
                            <span>FREE</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge
                          status={isActive ? "ACTIVE" : "INACTIVE"}
                          tone={isActive ? "green" : "rose"}
                        />
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-500 dark:text-zinc-400">
                        {formatDate(template.createdAt)}
                      </td>
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleTogglePremium(template)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                            title="ដូរ Premium/Free"
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggleActive(template)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                            title="ដូរ Status"
                          >
                            {isActive ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-rose-500" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(template)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                            title="កែប្រែ"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setDeleteConfirm(template)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400 cursor-pointer"
                            title="លុប"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= CREATE / EDIT STUDIO MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121215] transition-all my-8 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{editingTemplate ? "កែប្រែគំរូធៀបការ" : "បង្កើតគំរូធៀបការថ្មី (Template Studio)"}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Live User Preview
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {editingTemplate
                      ? `កែប្រែព័ត៌មានសម្រាប់ ID #${editingTemplate.id} (Sync ជាមួយ Frontend User ភ្លាមៗ)`
                      : "បង្កើតគំរូធៀបការថ្មីសម្រាប់ដាក់បង្ហាញជូនភ្ញៀវ/User លើគេហទំព័រ"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Split 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 p-6 gap-6">
              
              {/* Left Column: Form Controls (7 cols) */}
              <form onSubmit={handleSubmitForm} id="template-studio-form" className="lg:col-span-7 space-y-4">
                
                {/* Presets Bar */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>ជ្រើសរើសគំរូស្រាប់ (Quick Presets)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      {
                        label: "⚜️ រាជហង្សបុរាណ",
                        name: "សួនរាជហង្សខ្មែរ",
                        category: "TRADITIONAL",
                        thumbnailUrl: "/facebook/all/03-card/cover-card.jpg",
                        description: "គំរូសន្លឹកការរចនាបថសួនផ្កា និងទឹកពណ៌បែបព្រះរាជវង្សខ្មែរ ពណ៌ខៀវស្រាល បៃតង និងមាស។",
                        premium: false,
                      },
                      {
                        label: "✨ មាសទំនើប",
                        name: "សំបុត្រអញ្ជើញមាសខ្មែរ",
                        category: "MODERN",
                        thumbnailUrl: "/templates/cover-khmer-golden-wedding/cover-preview.svg",
                        description: "គំរូសំបុត្រអញ្ជើញរចនាបថមាសខ្មែរបែបទំនើប ស្រស់ស្អាត ទាក់ទាញ និងងាយស្រួលប្ដូរព័ត៌មាន។",
                        premium: false,
                      },
                      {
                        label: "👑 ប្រណិត Luxury",
                        name: "មាសប្រណិតអាពាហ៍ពិពាហ៍ខ្មែរ",
                        category: "LUXURY",
                        thumbnailUrl: "/invitations/khmer-golden-canva-inspired/cover-card.svg",
                        description: "គំរូសន្លឹកការអាពាហ៍ពិពាហ៍ខ្មែរបែបមាសលើក្រដាស ivory មានស៊ុមលម្អ និងអារម្មណ៍ប្រណិតស្នេហា។",
                        premium: true,
                      },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            name: p.name,
                            category: p.category,
                            thumbnailUrl: p.thumbnailUrl,
                            description: p.description,
                            premium: p.premium,
                          }));
                          show(`បានជ្រើស Preset «${p.name}» ✓`);
                        }}
                        className="p-2 text-left rounded-xl border border-slate-200 hover:border-amber-500/80 bg-slate-50/80 hover:bg-amber-500/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-amber-500/80 transition-all text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                    ឈ្មោះគំរូ (Template Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. សួនរាជហង្សខ្មែរ ឬ Khmer Golden Wedding"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                      ប្រភេទ (Category)
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="TRADITIONAL">TRADITIONAL (ប្រពៃណីខ្មែរ)</option>
                      <option value="MODERN">MODERN (សម័យទំនើប)</option>
                      <option value="LUXURY">LUXURY (ប្រណិត Royal)</option>
                      <option value="MINIMALIST">MINIMALIST (សាមញ្ញ)</option>
                      <option value="FLORAL">FLORAL (ផ្កាស្រស់)</option>
                      <option value="OTHER">OTHER (ផ្សេងៗ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                      ស្ថានភាព (Status)
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE (បង្ហាញលើ User)</option>
                      <option value="INACTIVE">INACTIVE (លាក់ទុក)</option>
                    </select>
                  </div>
                </div>

                {/* Premium & Price Toggle */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Crown className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          កំណត់ជាគំរូ Premium 👑
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {formData.premium ? "ទាមទារទិញកញ្ចប់សេវាដើម្បីប្រើប្រាស់" : "ឥតគិតថ្លៃ (Free) សម្រាប់ភ្ញៀវទូទៅ"}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      checked={formData.premium}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.checked })}
                    />
                  </div>

                  {formData.premium && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 shrink-0">
                        តម្លៃលក់ (USD $):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="ឧ. 9.99"
                        className="w-32 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Thumbnail Cover Image Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      រូបភាពគំរូ (Cover Thumbnail) *
                    </label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("upload")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          imageInputMode === "upload"
                            ? "bg-white text-amber-600 font-bold shadow-xs dark:bg-zinc-800 dark:text-amber-400"
                            : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                      >
                        <Upload className="h-3 w-3" />
                        <span>Upload រូបភាព</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          imageInputMode === "url"
                            ? "bg-white text-amber-600 font-bold shadow-xs dark:bg-zinc-800 dark:text-amber-400"
                            : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                      >
                        <LinkIcon className="h-3 w-3" />
                        <span>ដាក់ URL</span>
                      </button>
                    </div>
                  </div>

                  {imageInputMode === "upload" ? (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center hover:border-amber-500 hover:bg-amber-500/5 transition-all dark:border-zinc-700 dark:hover:border-amber-500"
                      >
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
                          <Upload className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          ចុចទីនេះដើម្បី Upload រូបភាពពីកុំព្យូទ័រ
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          គាំទ្រ PNG, JPG, WEBP, SVG
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="https://.../cover.jpg ឬ /facebook/all/03-card/cover-card.jpg"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Sample Quick Asset Pickers */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">រូបគំរូរហ័ស:</span>
                    {[
                      { name: "សួនរាជហង្ស", path: "/facebook/all/03-card/cover-card.jpg" },
                      { name: "មាសខ្មែរ", path: "/templates/cover-khmer-golden-wedding/cover-preview.svg" },
                      { name: "មាសប្រណិត", path: "/invitations/khmer-golden-canva-inspired/cover-card.svg" },
                    ].map((sample, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnailUrl: sample.path })}
                        className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[10px] text-slate-600 hover:border-amber-500 hover:text-amber-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-amber-400 cursor-pointer"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                    ការពិពណ៌នា & ចំណុចលេចធ្លោ (Description)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ពិពណ៌នាសង្ខេបអំពីទម្រង់ និងរចនាបថនៃគំរូធៀបការ..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </form>

              {/* Right Column: Live User Preview Studio (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 via-slate-50/50 to-amber-500/10 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col items-center justify-start relative">
                <div className="w-full flex items-center justify-between pb-3 border-b border-amber-500/15 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Eye className="h-4 w-4" />
                    <span>ទិដ្ឋភាពដែល User ឃើញ (Live User Preview)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Sync Realtime</span>
                </div>

                {/* Live Card Preview (Exact replica of User /templates card) */}
                <div className="w-full max-w-[290px] rounded-2xl border border-slate-200/90 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-[#151518] relative group">
                  
                  {/* Category badge */}
                  <div className="absolute top-5 left-5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                    {formData.category === "TRADITIONAL"
                      ? "បុរាណ"
                      : formData.category === "MODERN"
                      ? "ទំនើប"
                      : formData.category === "LUXURY"
                      ? "ប្រណិត"
                      : formData.category || "ខ្មែរ"}
                  </div>

                  {/* Premium Badge */}
                  <div className="absolute top-5 right-5 z-10">
                    {formData.premium ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-xs flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        <span>Premium</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        🎁 Free
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Frame */}
                  <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800 mb-3 border border-slate-100 dark:border-zinc-800">
                    <TemplateThumbnail
                      src={formData.thumbnailUrl}
                      alt={formData.name}
                      category={formData.category}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/90 text-[11px] font-bold text-slate-900 shadow-sm">
                        មើលលម្អិត
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {formData.name || "ឈ្មោះគំរូធៀបការ"}
                    </h4>
                    <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      {formData.category || "TRADITIONAL"} WEDDING TEMPLATE
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed text-left pt-1">
                      {formData.description || "គំរូសន្លឹកការដែលរួចរាល់សម្រាប់បង្ហាញ និង RSVP"}
                    </p>

                    {/* Mock Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="py-1.5 text-[11px] font-bold rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-center shadow-xs">
                        ប្រើគំរូនេះ
                      </div>
                      <div className="py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-700 dark:border-zinc-700 dark:text-zinc-300 text-center">
                        មើលលម្អិត
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    💡 រាល់ពេល Admin រក្សាទុក គំរូនេះនឹងបង្ហាញជូនភ្ញៀវ/User នៅលើ <code>http://localhost:5173/templates</code> ភ្លាមៗ។
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40">
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                {editingTemplate ? `កែប្រែ ID: #${editingTemplate.id}` : "គំរូថ្មីនឹងស្ថិតក្នុងស្ថានភាព ACTIVE"}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  form="template-studio-form"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>កំពុងរក្សាទុក...</span>
                    </>
                  ) : (
                    <span>{editingTemplate ? "រក្សាទុកការកែប្រែ" : "បង្កើត & បង្ហាញលើ User"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#121215]">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-normal">
                បញ្ជាក់ការលុបគំរូធៀបការ
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              តើ Nha ពិតជាចង់លុបគំរូ <strong>"{deleteConfirm.name}"</strong> (ID: #{deleteConfirm.id}) មែនទេ?
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onClose={clear} />
    </div>
  );
}
