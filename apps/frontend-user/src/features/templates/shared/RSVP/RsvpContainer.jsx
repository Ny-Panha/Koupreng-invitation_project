import DemoRsvpNotice from "./DemoRsvpNotice";
import { useId, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

/**
 * Shared RSVP primitive.
 * If children (e.g. PublicRsvpForm) is passed, delegates to children.
 * Otherwise, renders an interactive demo RSVP form that won't break or crash.
 */
export default function RsvpContainer({
  children,
  onSubmitDemo,
  themeClass = "",
  labels = {
    title: "សូមបញ្ជាក់ការចូលរួម",
    subtitle: "RSVP",
    lead: "សូមជួយបញ្ជាក់ការចូលរួមមុនថ្ងៃពិធី ដើម្បីឱ្យយើងខ្ញុំរៀបចំទទួលបដិសណ្ឋារកិច្ចបានសមរម្យ",
    namePlaceholder: "ឈ្មោះរបស់អ្នក",
    phonePlaceholder: "លេខទូរស័ព្ទ",
    attendingYes: "ចូលរួម (Attending)",
    attendingNo: "មិនអាចចូលរួម (Decline)",
    guestCount: "ចំនួនភ្ញៀវ",
    wishes: "ពាក្យជូនពរដល់គូស្នេហ៍...",
    submitBtn: "ផ្ញើការឆ្លើយតប",
    thankYou: "អរគុណសម្រាប់ការឆ្លើយតប!",
    thankYouDesc: "ការឆ្លើយតបរបស់អ្នកត្រូវបានកត់ត្រាដោយជោគជ័យ។",
  },
}) {
  const rsvpId = useId();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    attending: "yes",
    guestCount: 1,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (children) {
    return (
      <div className={`rsvp-container-root ${themeClass}`}>
        {children}
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitDemo) {
      onSubmitDemo(form);
    }
    setSubmitted(true);
  };

  return (
    <div className={`rsvp-container-root ${themeClass}`}>
      {submitted ? (
        <div className="rsvp-submitted-card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <CheckCircle2 size={48} color="#22c55e" style={{ margin: "0 auto 12px" }} />
          <DemoRsvpNotice completed />
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "1px solid currentColor",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            កែប្រែការឆ្លើយតប
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rsvp-form-grid" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <DemoRsvpNotice />
          <div>
            <label htmlFor={`${rsvpId}-name`} style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", opacity: 0.9 }}>
              ឈ្មោះ / Name *
            </label>
            <input
              type="text"
              required
              id={`${rsvpId}-name`} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={labels.namePlaceholder}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label htmlFor={`${rsvpId}-phone`} style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", opacity: 0.9 }}>
              លេខទូរស័ព្ទ / Phone
            </label>
            <input
              type="tel"
              id={`${rsvpId}-phone`} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={labels.phonePlaceholder}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor={`${rsvpId}-attending`} style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", opacity: 0.9 }}>
                ការចូលរួម / Attendance
              </label>
              <select
                id={`${rsvpId}-attending`} value={form.attending}
                onChange={(e) => setForm({ ...form, attending: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "inherit",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="yes" style={{ background: "#222", color: "#fff" }}>{labels.attendingYes}</option>
                <option value="no" style={{ background: "#222", color: "#fff" }}>{labels.attendingNo}</option>
              </select>
            </div>

            <div>
              <label htmlFor={`${rsvpId}-guestCount`} style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", opacity: 0.9 }}>
                ចំនួនភ្ញៀវ / Guests
              </label>
              <select
                id={`${rsvpId}-guestCount`} value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "inherit",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n} style={{ background: "#222", color: "#fff" }}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${rsvpId}-message`} style={{ display: "block", fontSize: "0.85rem", marginBottom: "4px", opacity: 0.9 }}>
              សារជូនពរ / Wishes
            </label>
            <textarea
              rows={3}
              id={`${rsvpId}-message`} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={labels.wishes}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "6px",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #d4af37, #b88a2e)",
              color: "#1a1205",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Send size={18} />
            <span>{labels.submitBtn}</span>
          </button>
        </form>
      )}
    </div>
  );
}
