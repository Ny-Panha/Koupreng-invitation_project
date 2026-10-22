import { useLanguageStore } from "@/stores/useLanguageStore";
import { FormField, LoadingButton } from "@/shared/ui";
import {
  IoCreateOutline,
  IoDocumentTextOutline,
  IoHeartOutline,
  IoLanguageOutline,
  IoSparklesOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { AI_ACTIONS, LANGUAGE_OPTIONS, TONE_OPTIONS } from "../model/aiAssistantConstants";

const ACTION_ICONS = {
  copy: IoCreateOutline,
  story: IoHeartOutline,
  formalText: IoDocumentTextOutline,
  translate: IoLanguageOutline,
  timeline: IoTimeOutline,
};

export default function AssistantComposer({
  form,
  setForm,
  loading,
  onSubmit,
}) {
  const en = useLanguageStore(state => state.lang) === "en";
  const copy = (kh, english) => en ? english : kh;
  return (
    <form onSubmit={onSubmit} className="pe-ai-composer">
      <FormField label={copy("ជំនួយការសរសេរ", "Writing task")} required>
        <div className="pe-ai-actions">
          {AI_ACTIONS.map((act) => {
            const ActionIcon = ACTION_ICONS[act.value] || IoCreateOutline;
            return (
              <button
                key={act.value}
                type="button"
                className={`pe-action-chip${form.action === act.value ? " active" : ""}`}
                onClick={() => setForm({ ...form, action: act.value })}
                aria-pressed={form.action === act.value}
              >
                <ActionIcon aria-hidden="true" />
                <span>{act.label.split(" / ")[en ? 0 : 1] || act.label}</span>
              </button>
            );
          })}
        </div>
      </FormField>

      <div className="pe-ai-field-grid">
        <FormField label={copy("ឈ្មោះគូស្វាមីភរិយា", "Couple names")}>
          <input
            type="text"
            value={form.coupleNames}
            onChange={(e) => setForm({ ...form, coupleNames: e.target.value })}
            placeholder="សុក ដារ៉ា & កែវ សោភា"
          />
        </FormField>

        <FormField label={copy("ឈ្មោះម្ចាស់ដើមការ", "Host name")}>
          <input
            type="text"
            value={form.hostName}
            onChange={(e) => setForm({ ...form, hostName: e.target.value })}
            placeholder="លោក សុក ចាន់ & លោកស្រី"
          />
        </FormField>
      </div>

      <div className="pe-ai-field-grid">
        <FormField label={copy("កាលបរិច្ឆេទកម្មវិធី", "Event date")}>
          <input
            type="text"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            placeholder="ថ្ងៃអាទិត្យ ទី១៥ ខែមីនា ឆ្នាំ២០២៦"
          />
        </FormField>

        <FormField label={copy("ទីតាំង", "Venue")}>
          <input
            type="text"
            value={form.venueName}
            onChange={(e) => setForm({ ...form, venueName: e.target.value })}
            placeholder="សណ្ឋាគារ ហ៊ីមវ៉ារី ភ្នំពេញ"
          />
        </FormField>
      </div>

      <div className="pe-ai-field-grid">
        <FormField label={copy("ភាសាអត្ថបទ", "Content language")}>
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.value === "Khmer" ? copy("ភាសាខ្មែរ", "Khmer") : copy("ភាសាអង់គ្លេស", "English")}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={copy("ទម្រង់សំណេរ", "Tone")}>
          <select
            value={form.tone}
            onChange={(e) => setForm({ ...form, tone: e.target.value })}
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label.split(" / ")[en ? 0 : 1] || t.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label={copy("ព័ត៌មានបន្ថែម", "Extra notes")}>
        <textarea
          rows="3"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="បន្ថែមពាក្យជូនពរ ព័ត៌មានភ្ញៀវ ឬសំណូមពរពិសេស..."
        />
      </FormField>

      <LoadingButton type="submit" isLoading={loading} className="pe-primary-btn pe-ai-generate">
        <IoSparklesOutline aria-hidden="true" />
        <span>{copy("រៀបចំអត្ថបទ", "Generate content")}</span>
      </LoadingButton>
    </form>
  );
}
