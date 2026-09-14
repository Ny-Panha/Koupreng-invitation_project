import { useState, useRef } from "react";

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
import { getTemplateById } from "../templates/data/templatesData";
import { saveDraft } from "@/shared/storage/weddingStorage";
import { toast } from "@/shared/ui/toast";
import { DatePicker } from "@/shared/ui/DatePicker";
import { TimePicker } from "@/shared/ui/TimePicker";
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
  const [searchParams] = useSearchParams();
  const templateIdParam = searchParams.get("templateId") || searchParams.get("template");
  const isCustom = !templateIdParam || templateIdParam === "custom";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    const tpl = !isCustom ? getTemplateById(templateIdParam) : null;
    const initialCover = tpl?.phoneCoverImage || tpl?.mainImage || "";
    const initialTitle = tpl?.name || "";
    const initialGroom = tpl?.groom || "";
    const initialBride = tpl?.bride || "";
    const initialDate = tpl?.targetDate ? tpl.targetDate.split("T")[0] : "";
    const initialTime = tpl?.receptionTime || "17:00";
    const initialVenue = tpl?.venueName || "";
    const initialDesc = tpl?.message || tpl?.description || "";

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
    };
  });

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

      const designPayload = {
        coverImage: form.coverImage,
        frontColor: "#f9af59",
        bottomColor: "#B08E4F",
        hideNamesOnCover: false,
        templateId: form.templateId || "garden-royal-khmer-wedding",
      };

      const contentPayload = {
        title: form.title,
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
        title: form.title,
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
        id: invitationId,
        backendInvitationId: savedResult?.id || null,
        templateId: form.templateId || "garden-royal-khmer-wedding",
        couple: {
          groom: form.groomName,
          bride: form.brideName,
        },
        event: {
          title: form.title,
          date: form.eventDate,
          receptionTime: form.eventTime,
          venueName: form.venueName,
        },
        coverImage: form.coverImage,
        schedule: flatSchedule,
        agendaDays: agendaDays,
        message: form.description,
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
    </div>
  );
}
