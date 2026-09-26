import { Link } from "react-router-dom";
import { Calendar, MapPin, Heart } from "lucide-react";
import { normalizeTemplateViewModel } from "../../model/templateModel";
import CountdownTimer from "../../shared/Countdown/CountdownTimer";
import GalleryGrid from "../../shared/Gallery/GalleryGrid";
import RsvpContainer from "../../shared/RSVP/RsvpContainer";
import ScheduleList from "../../shared/EventSchedule/ScheduleList";

/**
 * Safe fallback layout for unknown or default template IDs.
 * Ensures the app never crashes when a template slug or ID is unmapped.
 */
export default function DefaultTemplateLayout({
  tpl: tplProp,
  content: contentProp,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  preview = false,
  useTemplateLink,
  children,
}) {
  const tpl = normalizeTemplateViewModel(tplProp, contentProp);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#faf8f5", color: "#2d3748", fontFamily: "system-ui, sans-serif" }}>
      {showBack && (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem 1.5rem" }}>
          <Link to={backTo} style={{ color: "#8b5cf6", textDecoration: "none", fontSize: "0.875rem", fontWeight: "500" }}>
            ← {backLabel}
          </Link>
        </div>
      )}

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem 6rem", textAlign: "center" }}>
        <div style={{ margin: "1rem 0 2rem" }}>
          <div style={{ display: "inline-flex", padding: "0.75rem", borderRadius: "50%", background: "#ede9fe", color: "#7c3aed", marginBottom: "1rem" }}>
            <Heart size={28} />
          </div>
          <p style={{ letterSpacing: "normal", textTransform: "uppercase", fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
            អាពាហ៍ពិពាហ៍
          </p>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "700", color: "#1f2937", margin: "0.5rem 0" }}>
            {tpl.groom} &amp; {tpl.bride}
          </h1>
          {tpl.blessingMessage && (
            <p style={{ fontSize: "1rem", color: "#4b5563", lineHeight: "1.6", maxWidth: "500px", margin: "1rem auto" }}>
              {tpl.blessingMessage}
            </p>
          )}

          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f3f4f6", padding: "0.5rem 1.25rem", borderRadius: "9999px", marginTop: "1rem", color: "#374151", fontWeight: "600", fontSize: "0.95rem" }}>
            <Calendar size={18} />
            <span>{tpl.dateText}</span>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ margin: "2rem auto", padding: "1.5rem", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "0.95rem", color: "#4b5563", marginBottom: "1rem", fontWeight: "600" }}>
            រាប់ថយក្រោយដល់ថ្ងៃពិសេស
          </h3>
          <CountdownTimer targetDate={tpl.targetDate} />
        </div>

        {/* Schedule */}
        {tpl.schedule && tpl.schedule.length > 0 && (
          <div style={{ margin: "2rem auto", padding: "1.5rem", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", textAlign: "left" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "1rem", textAlign: "center" }}>
              កម្មវិធីពិធីមង្គលការ
            </h3>
            <ScheduleList items={tpl.schedule} />
          </div>
        )}

        {/* Venue */}
        <div style={{ margin: "2rem auto", padding: "1.5rem", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <MapPin size={24} color="#7c3aed" style={{ margin: "0 auto 8px" }} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#1f2937", margin: "0 0 4px" }}>
            {tpl.venueName}
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
            {tpl.venueHall && `${tpl.venueHall} • `}{tpl.venueAddress}
          </p>
        </div>

        {/* Gallery */}
        {tpl.gallery && tpl.gallery.length > 0 && (
          <div style={{ margin: "2rem auto" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#1f2937", marginBottom: "1rem" }}>
              កម្រងរូបភាព
            </h3>
            <GalleryGrid images={tpl.gallery} />
          </div>
        )}

        {/* RSVP */}
        <div style={{ margin: "2.5rem auto", padding: "2rem 1.5rem", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>
            ឆ្លើយតបការចូលរួម (RSVP)
          </h3>
          <RsvpContainer children={children} />
        </div>
      </main>

      {/* Sticky Bottom Actions Bar */}
      {!preview && useTemplateLink && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderTop: "1px solid #e5e7eb", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 50 }}>
          <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
            {tpl.name || "គំរូសន្លឹកការ"}
          </span>
          <Link
            to={useTemplateLink}
            style={{ padding: "0.5rem 1.25rem", borderRadius: "9999px", background: "#7c3aed", color: "#fff", textDecoration: "none", fontWeight: "600", fontSize: "0.875rem" }}
          >
            ប្រើគំរូនេះ
          </Link>
        </div>
      )}
    </div>
  );
}
