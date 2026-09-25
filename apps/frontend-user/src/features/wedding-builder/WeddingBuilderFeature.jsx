import { useState, useRef, useEffect } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IoCloudUploadOutline,
  IoCloseOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCheckmarkOutline,
  IoChevronBackOutline,
  IoTrashOutline,
  IoAddOutline,
} from "react-icons/io5";

import { invitationService } from "@/features/invitations/api/invitationApi";
import {
  getTemplateById,
  getTemplatePreset,
  registerDynamicTemplates,
  getAllTemplates,
} from "../templates/data/templatesData";
import { templateCatalogService } from "../templates/api/templateCatalogApi";
import { saveDraft } from "@/shared/storage/weddingStorage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "@/shared/ui/toast";
import { DatePicker } from "@/shared/ui/DatePicker";
import { TimePicker } from "@/shared/ui/TimePicker";
import {
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import "./WeddingBuilderFeature.css";

const EVENT_TYPES = [
  { value: "WEDDING", label: "អាពាហ៍ពិពាហ៍" },
  { value: "ENGAGEMENT", label: "ភ្ជាប់ពាក្យ" },
  { value: "BIRTHDAY", label: "ខួបកំណើត" },
  { value: "HOUSEWARMING", label: "ឡើងផ្ទះ" },
  { value: "PARTY", label: "ជប់លៀង" },
  { value: "OTHER", label: "ពិធីបុណ្យផ្សេងៗ" },
];

export default function WeddingBuilderFeature() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const templateIdParam = searchParams.get("templateId") || searchParams.get("template");
  const isCustom = !templateIdParam || templateIdParam === "custom";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    const tpl = !isCustom ? getTemplateById(templateIdParam) : null;
    const preset = getTemplatePreset(tpl) || {};
    const initialCover = tpl?.phoneCoverImage || tpl?.mainImage || preset.coverImage || "";
    const initialTitle = tpl?.name || preset.title || "";
    const initialGroom = tpl?.groom || preset.groom || "";
    const initialBride = tpl?.bride || preset.bride || "";
    const initialDate = tpl?.targetDate ? tpl.targetDate.split("T")[0] : "";
    const initialTime = tpl?.receptionTime || "17:00";
    const initialVenue = tpl?.venueName || preset.venueName || "";
    const initialDesc = tpl?.message || tpl?.description || preset.messageText || "";

    return {
      title: initialTitle,
      eventType: "WEDDING",
      groomName: initialGroom,
      brideName: initialBride,
      eventDate: initialDate,
      eventTime: initialTime,
      venueName: initialVenue,
      description: initialDesc,
      coverImage: initialCover,
      quality: true,
      templateId: templateIdParam || "garden-royal-khmer-wedding",
      presetId: preset.presetId || tpl?.presetId || "",
      openingStyle: preset.openingStyle || "khmer-royal",
      frontColor: preset.frontColor || "#D4AF37",
      bottomColor: preset.bottomColor || "#F3E5AB",
    };
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState(() => getAllTemplates());
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("ALL");

  // Multi-day Nested Agenda State matching PlanEssential
  const [agendaDays, setAgendaDays] = useState(() => {
    const tpl = !isCustom ? getTemplateById(templateIdParam) : null;
    if (tpl?.schedule && tpl.schedule.length > 0) {
      return [
        {
          id: `day-1`,
          title: "កម្មវិធីថ្ងៃទី ១",
          items: tpl.schedule.map((s, idx) => ({
            id: s.id || `item-${idx + 1}`,
            name: s.title || "កម្មវិធី",
            time: s.time || "07:00",
          })),
        },
      ];
    }
    return [];
  });
  const [isAgendaOpen, setIsAgendaOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    templateCatalogService.list()
      .then((items) => {
        if (active && items && items.length > 0) {
          registerDynamicTemplates(items);
          setAvailableTemplates(getAllTemplates());
          if (templateIdParam && !isCustom) {
            const tpl = getTemplateById(templateIdParam);
            const preset = getTemplatePreset(tpl) || {};
            if (tpl) {
              setForm((prev) => ({
                ...prev,
                title: prev.title || preset.title || tpl.name || "",
                groomName: prev.groomName || preset.groom || tpl.groom || "",
                brideName: prev.brideName || preset.bride || tpl.bride || "",
                venueName: prev.venueName || preset.venueName || tpl.venueName || "",
                coverImage: prev.coverImage || preset.coverImage || tpl.phoneCoverImage || tpl.mainImage || "",
                description: prev.description || preset.messageText || tpl.message || "",
                templateId: templateIdParam,
                presetId: preset.presetId || tpl.presetId || "",
                openingStyle: prev.openingStyle || preset.openingStyle || "khmer-royal",
                frontColor: prev.frontColor || preset.frontColor || "#D4AF37",
                bottomColor: prev.bottomColor || preset.bottomColor || "#F3E5AB",
              }));
              if (tpl.schedule && tpl.schedule.length > 0) {
                setAgendaDays((prev) => (prev.length === 0 ? [{
                  id: "day-1",
                  title: "កម្មវិធីថ្ងៃទី ១",
                  items: tpl.schedule.map((s, idx) => ({
                    id: s.id || `item-${idx + 1}`,
                    name: s.title || "កម្មវិធី",
                    time: s.time || "07:00",
                  })),
                }] : prev));
              }
            }
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [templateIdParam, isCustom]);

  const handleSelectTemplate = (selectedTpl) => {
    if (!selectedTpl) return;
    const preset = getTemplatePreset(selectedTpl) || {};

    setForm((prev) => {
      const isPrevDefaultCover = !prev.coverImage || prev.coverImage.includes("/facebook/all/") || prev.coverImage.includes("cover-card.jpg");
      const isPrevDefaultTitle = !prev.title || prev.title === "សួនរាជហង្សខ្មែរ" || prev.title === "Garden Royal Khmer Wedding";
      const isPrevDefaultGroom = !prev.groomName || prev.groomName === "វណ្ណដា";
      const isPrevDefaultBride = !prev.brideName || prev.brideName === "ស្រីពេជ្រ";
      const isPrevDefaultVenue = !prev.venueName || prev.venueName === "The Premier Center Sen Sok";

      return {
        ...prev,
        templateId: selectedTpl.id || selectedTpl.code || preset.templateId,
        presetId: selectedTpl.presetId || preset.presetId || "",
        openingStyle: preset.openingStyle || prev.openingStyle || "khmer-royal",
        frontColor: preset.frontColor || prev.frontColor || "#D4AF37",
        bottomColor: preset.bottomColor || prev.bottomColor || "#F3E5AB",
        coverImage: isPrevDefaultCover ? (preset.coverImage || selectedTpl.phoneCoverImage || selectedTpl.mainImage || prev.coverImage) : prev.coverImage,
        title: isPrevDefaultTitle ? (preset.title || selectedTpl.name || prev.title) : prev.title,
        groomName: isPrevDefaultGroom ? (preset.groom || selectedTpl.groom || prev.groomName) : prev.groomName,
        brideName: isPrevDefaultBride ? (preset.bride || selectedTpl.bride || prev.brideName) : prev.brideName,
        venueName: isPrevDefaultVenue ? (preset.venueName || selectedTpl.venueName || prev.venueName) : prev.venueName,
      };
    });

    if (selectedTpl.schedule && selectedTpl.schedule.length > 0 && agendaDays.length === 0) {
      setAgendaDays([
        {
          id: "day-1",
          title: "កម្មវិធីថ្ងៃទី ១",
          items: selectedTpl.schedule.map((s, idx) => ({
            id: s.id || `item-${idx + 1}`,
            name: s.title || "កម្មវិធី",
            time: s.time || "07:00",
          })),
        },
      ]);
    }

    setIsTemplateModalOpen(false);
    toast("បានជ្រើសរើសគំរូធៀបដោយជោគជ័យ");
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, coverImage: reader.result }));
      toast("បានដាក់រូបភាពក្របរួចរាល់");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setForm((prev) => ({ ...prev, coverImage: "" }));
  };

  // Agenda Management Functions (Pure Immutable Updates)
  const handleInitAgenda = () => {
    setAgendaDays([
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: "",
        items: [{ id: `${Date.now()}-1`, name: "", time: "07:00" }],
      },
    ]);
  };

  const handleAddNewDay = () => {
    setAgendaDays((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: "",
        items: [{ id: `${Date.now()}-item`, name: "", time: "07:00" }],
      },
    ]);
  };

  const handleDeleteDay = (dayIndex) => {
    setAgendaDays((prev) => prev.filter((_, idx) => idx !== dayIndex));
  };

  const handleDayTitleChange = (dayIndex, value) => {
    setAgendaDays((prev) =>
      prev.map((day, idx) => (idx === dayIndex ? { ...day, title: value } : day))
    );
  };

  const handleAddSubItem = (dayIndex) => {
    setAgendaDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        return {
          ...day,
          items: [
            ...day.items,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: "",
              time: "07:00",
            },
          ],
        };
      })
    );
  };

  const handleDeleteSubItem = (dayIndex, itemIndex) => {
    setAgendaDays((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;
        return {
          ...day,
          items: day.items.filter((_, iIdx) => iIdx !== itemIndex),
        };
      })
    );
  };

  const handleSubItemChange = (dayIndex, itemIndex, field, value) => {
    setAgendaDays((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;
        return {
          ...day,
          items: day.items.map((item, iIdx) => {
            if (iIdx !== itemIndex) return item;
            return { ...item, [field]: value };
          }),
        };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast("សូមបញ្ចូលឈ្មោះកម្មវិធី (Please enter event title)");
      return;
    }

    setIsSubmitting(true);

    try {
      // Flatten agenda items for general compatibility
      const flatSchedule = agendaDays.flatMap((day, dIdx) =>
        day.items.map((it) => ({
          dayTitle: day.title || `ថ្ងៃទី ${dIdx + 1}`,
          title: it.name || "កម្មវិធី",
          time: it.time || "07:00 ព្រឹក",
        }))
      );

      const selectedTpl = getTemplateById(form.templateId);
      const preset = getTemplatePreset(selectedTpl) || {};

      const designPayload = {
        coverImage: form.coverImage || preset.coverImage || "/facebook/all/03-card/cover-card.jpg",
        frontColor: form.frontColor || preset.frontColor || "#D4AF37",
        bottomColor: form.bottomColor || preset.bottomColor || "#F3E5AB",
        openingStyle: form.openingStyle || preset.openingStyle || "khmer-royal",
        hideNamesOnCover: false,
        templateId: form.templateId || "garden-royal-khmer-wedding",
        presetId: preset.presetId || selectedTpl?.presetId || "",
      };

      const contentPayload = {
        templateId: form.templateId || "garden-royal-khmer-wedding",
        presetId: preset.presetId || selectedTpl?.presetId || "",
        title: form.title || preset.title || "សិរីមង្គលអាពាហ៍ពិពាហ៍",
        subtitle: "សូមគោរពអញ្ជើញ",
        groomName: form.groomName,
        brideName: form.brideName,
        eventDateText: form.eventDate,
        schedule: flatSchedule,
        agendaDays: agendaDays,
        venueName: form.venueName,
        storyText: form.description,
      };

      const numericTemplateId = Number(form.templateId);

      const payload = {
        title: form.title || preset.title || "សិរីមង្គលអាពាហ៍ពិពាហ៍",
        eventType: form.eventType,
        eventDate: form.eventDate || null,
        eventTime: form.eventTime || null,
        venueName: form.venueName || "",
        venueAddress: form.venueName || "",
        groomName: form.groomName || "",
        brideName: form.brideName || "",
        storyText: form.description || "",
        visibility: form.quality ? "PUBLIC" : "PRIVATE",
        templateId: !isNaN(numericTemplateId) && numericTemplateId > 0 ? numericTemplateId : null,
        designJson: JSON.stringify(designPayload),
        contentJson: JSON.stringify(contentPayload),
      };

      // 1. Save to backend
      let savedResult;
      try {
        savedResult = await invitationService.create(payload);
      } catch (backendErr) {
        console.warn("Backend creation failed, creating locally:", backendErr);
      }

      const invitationId = savedResult?.id || `wed-${Date.now().toString(36)}`;

      // 2. Save to local wedding storage draft
      saveDraft({
        ownerUserId: user?.id || user?.userId,
        id: invitationId,
        backendInvitationId: savedResult?.id || null,
        templateId: form.templateId || "garden-royal-khmer-wedding",
        presetId: preset.presetId || selectedTpl?.presetId || "",
        openingStyle: designPayload.openingStyle,
        frontColor: designPayload.frontColor,
        bottomColor: designPayload.bottomColor,
        couple: {
          groom: form.groomName || preset.groom || "",
          bride: form.brideName || preset.bride || "",
        },
        groomName: form.groomName || preset.groom || "",
        brideName: form.brideName || preset.bride || "",
        event: {
          title: form.title || preset.title || "",
          date: form.eventDate,
          receptionTime: form.eventTime,
          venueName: form.venueName || preset.venueName || "",
        },
        venueName: form.venueName || preset.venueName || "",
        title: form.title || preset.title || "",
        coverImage: designPayload.coverImage,
        schedule: flatSchedule,
        agendaDays: agendaDays,
        message: form.description || preset.messageText || "",
      });

      toast("បានបង្កើតកម្មវិធីដោយជោគជ័យ! (Event created successfully)");

      // 3. Immediately redirect to PlanEssential Customizer & Live Mobile Phone Preview!
      navigate(`/dashboard/invitations/${invitationId}/edit`, { replace: true });
    } catch (err) {
      toast(err.message || "មិនអាចបង្កើតកម្មវិធីបានទេ (Failed to create event)");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pe-create-page-wrapper">
      <div className="pe-create-card">
        <h1 className="pe-create-card-title">
          {isCustom ? "បង្កើតកម្មវិធីផ្ទាល់ខ្លួន (Custom Wedding Card)" : "បង្កើតកម្មវិធីថ្មី"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* 0. គំរូធៀប & រចនាប័ទ្ម (Template & Opening Theme) */}
          <div className="pe-section-card pe-template-selector-card">
            <div className="pe-tpl-card-top">
              <div className="pe-tpl-card-info">
                <h4 className="pe-section-heading" style={{ marginBottom: 4 }}>
                  <span className="pe-sec-icon-badge">
                    <Sparkles size={17} />
                  </span>
                  <span>គំរូធៀប & រចនាប័ទ្ម (Template & Theme)</span>
                </h4>
                <p className="pe-tpl-card-sub">
                  គំរូបច្ចុប្បន្ន៖ <strong>{getTemplateById(form.templateId)?.name || "Garden Royal Khmer Wedding"}</strong>
                </p>
              </div>
            </div>

            {/* Opening Gate Style Selector */}
            <div className="pe-form-group" style={{ marginTop: "16px" }}>
              <label className="pe-field-label">
                <span className="pe-label-icon" style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Layers size={15} /></span>
                រចនាបទផ្ទាំងបើកធៀប (Opening Gate Style)
              </label>
              <div className="pe-gate-options-grid">
                {[
                  { id: "curtain", label: "វាំងននប្រណិត (Velvet Curtain)", desc: "បើកវាំងននសងខាង" },
                  { id: "envelope-3d", label: "ស្រោមសំបុត្រ 3D (Wax Envelope)", desc: "បកត្រា និងបើកស្រោមសំបុត្រ" },
                  { id: "khmer-royal", label: "រាជវាំងខ្មែរ (Royal Khmer)", desc: "ក្បាច់ភ្ញីទេស និងវាំងននព្រះរាជវាំង" },
                  { id: "magical-gate", label: "ទ្វារវេទមន្ត (Magical Portal)", desc: "ពន្លឺផ្កាយ និងទ្វារប្រណិត" },
                ].map((gate) => (
                  <button
                    key={gate.id}
                    type="button"
                    className={`pe-gate-btn ${form.openingStyle === gate.id ? "is-selected" : ""}`}
                    onClick={() => handleFieldChange("openingStyle", gate.id)}
                  >
                    <div className="pe-gate-btn-left">
                      <span className="pe-gate-btn-title">{gate.label}</span>
                      <span className="pe-gate-btn-desc">{gate.desc}</span>
                    </div>
                    {form.openingStyle === gate.id && <CheckCircle2 size={16} className="pe-gate-check" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Customization */}
            <div className="pe-colors-row">
              <div className="pe-form-group" style={{ flex: 1 }}>
                <label className="pe-field-label">
                  <span className="pe-label-icon" style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Palette size={15} /></span>
                  ពណ៌ចម្បង (Primary / Front Color)
                </label>
                <div className="pe-color-input-wrap">
                  <input
                    type="color"
                    className="pe-color-picker"
                    value={form.frontColor || "#D4AF37"}
                    onChange={(e) => handleFieldChange("frontColor", e.target.value)}
                  />
                  <input
                    type="text"
                    className="pe-input pe-color-text"
                    value={form.frontColor || "#D4AF37"}
                    onChange={(e) => handleFieldChange("frontColor", e.target.value)}
                  />
                </div>
              </div>
              <div className="pe-form-group" style={{ flex: 1 }}>
                <label className="pe-field-label">
                  <span className="pe-label-icon" style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Palette size={15} /></span>
                  ពណ៌រំលេច (Accent / Secondary Color)
                </label>
                <div className="pe-color-input-wrap">
                  <input
                    type="color"
                    className="pe-color-picker"
                    value={form.bottomColor || "#F3E5AB"}
                    onChange={(e) => handleFieldChange("bottomColor", e.target.value)}
                  />
                  <input
                    type="text"
                    className="pe-input pe-color-text"
                    value={form.bottomColor || "#F3E5AB"}
                    onChange={(e) => handleFieldChange("bottomColor", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quick Palette Chips */}
            <div className="pe-color-presets">
              <span className="pe-color-preset-label">ក្ដារពណ៌រហ័ស (Quick Palettes):</span>
              <div className="pe-color-presets-list">
                {[
                  { name: "ត្បូងមរកត (Emerald)", primary: "#0F4C3A", secondary: "#D4AF37" },
                  { name: "រាជហង្ស (Royal Ruby)", primary: "#8B1E2D", secondary: "#D4AF37" },
                  { name: "សួនរាជហង្ស (Garden Gold)", primary: "#f9af59", secondary: "#B08E4F" },
                  { name: "សាំប៉ាញ (Champagne)", primary: "#C5A880", secondary: "#E8D8C8" },
                  { name: "ទឹកប៊ិចរាជវង្ស (Royal Navy)", primary: "#1E3A8A", secondary: "#F59E0B" },
                ].map((pal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="pe-color-palette-chip"
                    onClick={() => {
                      handleFieldChange("frontColor", pal.primary);
                      handleFieldChange("bottomColor", pal.secondary);
                    }}
                    title={pal.name}
                  >
                    <span className="pe-chip-dot" style={{ background: pal.primary }} />
                    <span className="pe-chip-dot" style={{ background: pal.secondary }} />
                    <span className="pe-chip-name">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 1. Cover Image / Link Preview */}
          <section className="pe-cover-preview-section">
            <label className="pe-field-label">
              រូបភាពក្របនៃកម្មវិធី (Link Preview)
            </label>

            <div className="pe-cover-image-box">
              {form.coverImage ? (
                <img src={form.coverImage} alt="Cover Preview" />
              ) : (
                <div className="pe-cover-image-placeholder">
                  <IoCloudUploadOutline style={{ fontSize: "2rem" }} />
                  <span>មិនទាន់មានរូបភាពក្របនៅឡើយទេ</span>
                </div>
              )}
            </div>

            <div className="pe-cover-actions">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleCoverUpload}
              />
              <button
                type="button"
                className="pe-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <IoCloudUploadOutline style={{ fontSize: "1.1rem" }} />
                <span>ដាក់រូបភាព</span>
              </button>

              {form.coverImage && (
                <button
                  type="button"
                  className="pe-remove-cover-btn"
                  onClick={handleRemoveCover}
                  title="លុបរូបភាព"
                >
                  <IoCloseOutline style={{ fontSize: "1.2rem" }} />
                </button>
              )}
            </div>
          </section>

          {/* 2. Grid Form Fields */}
          <div className="pe-form-grid">
            {/* Row 1: Event Name & Event Type */}
            <div className="pe-form-group">
              <label className="pe-field-label">
                ឈ្មោះកម្មវិធី <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="pe-input"
                placeholder="ឧ. លោកហាក់ ម៉េង និង ទេវីរីយា"
                value={form.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                required
              />
            </div>

            <div className="pe-form-group">
              <label className="pe-field-label">
                ជ្រើសរើសប្រភេទកម្មវិធី <span className="required-star">*</span>
              </label>
              <select
                className="pe-select"
                value={form.eventType}
                onChange={(e) => handleFieldChange("eventType", e.target.value)}
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Groom Name & Bride Name */}
            <div className="pe-form-group">
              <label className="pe-field-label">
                កូនប្រុសនាម <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="pe-input"
                placeholder="ឧ. ហាក់ ម៉េង"
                value={form.groomName}
                onChange={(e) => handleFieldChange("groomName", e.target.value)}
                required
              />
            </div>

            <div className="pe-form-group">
              <label className="pe-field-label">
                កូនស្រីនាម <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="pe-input"
                placeholder="ឧ. ទេវីរីយា"
                value={form.brideName}
                onChange={(e) => handleFieldChange("brideName", e.target.value)}
                required
              />
            </div>

            {/* Row 3: Start Date & Reception Time */}
            <div className="pe-form-group">
              <label className="pe-field-label">
                កាលបរិច្ឆេទចាប់ផ្តើមកម្មវិធី <span className="required-star">*</span>
              </label>
              <DatePicker
                value={form.eventDate}
                onChange={(val) => handleFieldChange("eventDate", val)}
                placeholder="ជ្រើសកាលបរិច្ឆេទ"
              />
            </div>

            <div className="pe-form-group">
              <label className="pe-field-label">
                ម៉ោងពិសារភោជនាហារពេលល្ងាច <span className="required-star">*</span>
              </label>
              <TimePicker
                value={form.eventTime}
                onChange={(val) => handleFieldChange("eventTime", val)}
                placeholder="ជ្រើសម៉ោង"
              />
            </div>

            {/* Row 4: Venue Location & Description */}
            <div className="pe-form-group">
              <label className="pe-field-label">
                ទីតាំងប្រារព្ធពិធី (អាចបំពេញពេលក្រោយបាន)
              </label>
              <textarea
                className="pe-textarea"
                placeholder="ឧ. សាលមហោស្រពកោះពេជ្រ អាគារ A"
                value={form.venueName}
                onChange={(e) => handleFieldChange("venueName", e.target.value)}
                rows={3}
              />
            </div>

            <div className="pe-form-group">
              <label className="pe-field-label">
                ពិពណ៌នា (មិនចាំបាច់)
              </label>
              <textarea
                className="pe-textarea"
                placeholder="ការបរិយាយអំពីកម្មវិធីរបស់អ្នក"
                value={form.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* 3. Quality / Visibility Switch */}
          <div className="pe-toggle-section">
            <span className="pe-field-label" style={{ margin: 0 }}>គុណភាព</span>
            <label className="pe-toggle-switch">
              <input
                type="checkbox"
                checked={form.quality}
                onChange={(e) => handleFieldChange("quality", e.target.checked)}
              />
              <span className="pe-slider"></span>
            </label>
          </div>

          {/* 4. Agenda Accordion (PlanEssential Multi-Day Agenda) */}
          <div className="pe-agenda-accordion">
            <div
              className="pe-agenda-header"
              onClick={() => setIsAgendaOpen(!isAgendaOpen)}
            >
              <div className="pe-agenda-header-left">
                <IoCalendarOutline style={{ color: "#2563eb", fontSize: "1.2rem" }} />
                <span>របៀបវារៈកម្មវិធី</span>
                {agendaDays.length > 0 && (
                  <span className="pe-agenda-badge">
                    {agendaDays.length} របៀបវារៈ
                  </span>
                )}
              </div>
              {isAgendaOpen ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
            </div>

            {isAgendaOpen && (
              <div className="pe-agenda-body">
                {agendaDays.length === 0 ? (
                  /* Empty State */
                  <div className="pe-agenda-empty">
                    <IoCalendarOutline className="pe-agenda-empty-icon" />
                    <div className="pe-agenda-empty-text">មិនទាន់មានកម្មវិធី</div>
                    <button
                      type="button"
                      className="pe-create-agenda-btn"
                      onClick={handleInitAgenda}
                    >
                      <IoCalendarOutline />
                      <span>បង្កើតរបៀបវារៈ</span>
                    </button>
                  </div>
                ) : (
                  /* Days List */
                  <div>
                    {agendaDays.map((day, dayIndex) => (
                      <div key={day.id || dayIndex} className="pe-day-card">
                        <div className="pe-day-card-header">
                          <div className="pe-day-title">
                            <IoCalendarOutline style={{ color: "#e11d48" }} />
                            <span>របៀបវារៈថ្ងៃទី {dayIndex + 1}</span>
                          </div>
                          <button
                            type="button"
                            className="pe-day-del-btn"
                            onClick={() => handleDeleteDay(dayIndex)}
                            title="លុបថ្ងៃនេះ"
                          >
                            <IoTrashOutline />
                          </button>
                        </div>

                        {/* Day Description */}
                        <div className="pe-day-desc-group">
                          <label className="pe-field-label">
                            អត្ថបទរៀបរាប់ <span className="required-star">*</span>
                          </label>
                          <input
                            type="text"
                            className="pe-input"
                            placeholder="ឧ. កម្មវិធីថ្ងៃទី ១ : ថ្ងៃអាទិត្យ ទី២០ ខែកញ្ញា ឆ្នាំ២០២៥"
                            value={day.title}
                            onChange={(e) => handleDayTitleChange(dayIndex, e.target.value)}
                          />
                        </div>

                        {/* Sub Items List */}
                        <div className="pe-subitem-list">
                          {day.items.map((item, itemIndex) => (
                            <div key={item.id || itemIndex} className="pe-subitem-row">
                              <div>
                                <label className="pe-field-label" style={{ fontSize: "0.75rem" }}>
                                  ឈ្មោះកម្មវិធី <span className="required-star">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="pe-input"
                                  placeholder="ឧ. ជួបជុំភ្ញៀវកិត្តិយស បញ្ចូន ឡើងពិធីពិសាភោជនា..."
                                  value={item.name}
                                  onChange={(e) =>
                                    handleSubItemChange(dayIndex, itemIndex, "name", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="pe-field-label" style={{ fontSize: "0.75rem" }}>
                                  ម៉ោង <span className="required-star">*</span>
                                </label>
                                <TimePicker
                                  value={item.time}
                                  onChange={(val) =>
                                    handleSubItemChange(dayIndex, itemIndex, "time", val)
                                  }
                                  placeholder="ជ្រើសរើសម៉ោង"
                                />
                              </div>

                              <div className="pe-subitem-del-wrap">
                                <button
                                  type="button"
                                  className="pe-subitem-del-btn"
                                  onClick={() => handleDeleteSubItem(dayIndex, itemIndex)}
                                  title="លុប"
                                >
                                  <IoTrashOutline />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="pe-add-subitem-btn"
                          onClick={() => handleAddSubItem(dayIndex)}
                        >
                          <IoAddOutline />
                          <span>បន្ថែមកម្មវិធី</span>
                        </button>
                      </div>
                    ))}

                    <div className="pe-add-day-wrapper">
                      <button
                        type="button"
                        className="pe-add-day-btn"
                        onClick={handleAddNewDay}
                      >
                        <IoCalendarOutline />
                        <span>បន្ថែមរបៀបវារៈថ្ងៃថ្មី</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Footer Actions */}
          <div className="pe-create-actions">
            <button
              type="button"
              className="pe-btn-back"
              onClick={() => navigate("/dashboard/events")}
            >
              <IoChevronBackOutline />
              <span>ត្រឡប់ក្រោយ</span>
            </button>

            <button
              type="submit"
              className="pe-btn-submit"
              disabled={isSubmitting}
            >
              <IoCheckmarkOutline style={{ fontSize: "1.2rem" }} />
              <span>{isSubmitting ? "កំពុងបង្កើត..." : "បង្កើតថ្មី"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="pe-modal-overlay" onClick={() => setIsTemplateModalOpen(false)}>
          <div className="pe-modal-card pe-tpl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pe-modal-header">
              <div>
                <h3 className="pe-modal-title">
                  <Sparkles size={18} style={{ color: "#d97706" }} /> ជ្រើសរើសគំរូធៀប (Select Template)
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
                {availableTemplates
                  .filter((tpl) => {
                    const query = templateSearchQuery.trim().toLowerCase();
                    if (query) {
                      const matchName = String(tpl.name || "").toLowerCase().includes(query);
                      const matchStyle = String(tpl.style || "").toLowerCase().includes(query);
                      const matchCode = String(tpl.code || "").toLowerCase().includes(query);
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
                      return tpl.openingStyle === "khmer-royal" || String(tpl.id || tpl.code).includes("khmer");
                    }
                    return true;
                  })
                  .map((tpl) => {
                    const isSelected = String(form.templateId) === String(tpl.id) || String(form.templateId) === String(tpl.code);
                    const preset = getTemplatePreset(tpl) || {};
                    const cover = tpl.phoneCoverImage || tpl.mainImage || tpl.thumbnailUrl || tpl.image;
                    return (
                      <div
                        key={tpl.id || tpl.code}
                        className={`pe-tpl-card-modal ${isSelected ? "is-active" : ""}`}
                        onClick={() => handleSelectTemplate(tpl)}
                      >
                        <div className="pe-tpl-thumb-box">
                          <img
                            src={cover || "/facebook/all/03-card/cover-card.jpg"}
                            alt={tpl.name}
                            className="pe-tpl-thumb-img"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="pe-tpl-active-badge">
                              <CheckCircle2 size={16} /> កំពុងប្រើ
                            </div>
                          )}
                          <div className="pe-tpl-style-pill">
                            {preset.openingStyle === "curtain"
                              ? "Curtain Gate"
                              : preset.openingStyle === "envelope-3d"
                                ? "Envelope 3D"
                                : (preset.openingStyle === "celestial-cover" || tpl.code === "khmer-celestial" || tpl.id === "khmer-celestial")
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
                                handleSelectTemplate(tpl);
                              }}
                            >
                              {isSelected ? "បានជ្រើស ✓" : "ជ្រើសរើស"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
