import { RotateCw, Calendar, Clock, MapPin, QrCode, Sparkles } from "lucide-react";

export default function Card3DFlip({
  isFlipped,
  setIsFlipped,
  tpl,
}) {
  const scheduleItems = tpl.schedule || [];

  return (
    <div className="el-card-stage">
      <div className={`el-flipper-card ${isFlipped ? "flipped" : ""}`}>
        {/* Card Front Face */}
        <div className="el-card-face front">
          <div className="el-corner-kbach el-corner-tl" />
          <div className="el-corner-kbach el-corner-tr" />
          <div className="el-corner-kbach el-corner-bl" />
          <div className="el-corner-kbach el-corner-br" />

          <div className="el-card-header">
            <Sparkles className="el-ornament-icon" />
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--el-gold-primary)", textTransform: "uppercase" }}>
              ROYAL EMERALD INVITATION
            </p>
          </div>

          {(tpl.groomParents || tpl.brideParents) && (
            <div className="el-parents-blessing">
              <p className="el-parents-title">មាតាបិតាទាំងសងខាង</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--el-gold-primary)" }}>ខាងកូនប្រុស</p>
                  <p className="el-parents-names">{tpl.groomParents || "លោកឪពុក & អ្នកម្តាយ"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--el-gold-primary)" }}>ខាងកូនស្រី</p>
                  <p className="el-parents-names">{tpl.brideParents || "លោកឪពុក & អ្នកម្តាយ"}</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--el-gold-primary)", marginBottom: "0.5rem" }}>
              សូមគោរពអញ្ជើញមកកាន់ពិធីមង្គលការ
            </p>
            <h1 className="el-names-title">{tpl.groom}</h1>
            <p style={{ fontFamily: "Cinzel, serif", fontSize: "1.5rem", color: "var(--el-gold-primary)", margin: "0.25rem 0" }}>
              &amp;
            </p>
            <h1 className="el-names-title">{tpl.bride}</h1>
            {(tpl.groomEn || tpl.brideEn) && (
              <p style={{ fontSize: "0.9rem", color: "#e2e8f0", marginTop: "0.75rem" }}>
                {tpl.groomEn} &amp; {tpl.brideEn}
              </p>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <span className="el-date-badge">
              <Calendar className="w-4 h-4 inline mr-2" />
              {tpl.dateText}
            </span>
            <p style={{ fontSize: "0.9rem", color: "var(--el-text-muted)", lineHeight: "1.6", maxWidth: "420px", margin: "0 auto" }}>
              {tpl.blessingMessage || "វត្តមានដ៏ថ្លៃថ្លារបស់លោកអ្នក គឺជាកិត្តិយសដ៏ធំធេងសម្រាប់ក្រុមគ្រួសារយើងខ្ញុំ។"}
            </p>
          </div>

          <button type="button" className="el-flip-btn" onClick={() => setIsFlipped(true)}>
            <RotateCw className="w-4 h-4" /> មើលកម្មវិធី &amp; ទីតាំង (Flip Card)
          </button>
        </div>

        {/* Card Back Face */}
        <div className="el-card-face back">
          <div className="el-corner-kbach el-corner-tl" />
          <div className="el-corner-kbach el-corner-tr" />
          <div className="el-corner-kbach el-corner-bl" />
          <div className="el-corner-kbach el-corner-br" />

          <div className="el-card-header">
            <Clock className="el-ornament-icon" />
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.25em", color: "var(--el-gold-primary)", textTransform: "uppercase" }}>
              PROGRAM &amp; DETAILS
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            {scheduleItems.slice(0, 4).map((item, idx) => (
              <div key={item.id || idx} className="el-schedule-item">
                <div className="el-time font-mono">{item.time}</div>
                <div>
                  <h4 style={{ color: "#fff", fontSize: "0.95rem", fontWeight: "600", margin: 0 }}>{item.title}</h4>
                  <p style={{ color: "var(--el-text-muted)", fontSize: "0.8rem", margin: "2px 0 0" }}>{item.description || item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "12px", padding: "1rem", border: "1px solid rgba(212, 175, 55, 0.2)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--el-gold-primary)", marginBottom: "0.3rem" }}>
              <MapPin className="w-4 h-4" />
              <strong style={{ fontSize: "0.95rem" }}>{tpl.venueName}</strong>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--el-text-muted)", margin: 0 }}>
              {tpl.venueHall ? `${tpl.venueHall} — ` : ""}{tpl.venueAddress}
            </p>
            {tpl.googleMapsUrl && (
              <div style={{ marginTop: "0.75rem" }}>
                <a
                  href={tpl.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, var(--el-gold-primary), #997320)",
                    color: "#061510",
                    padding: "0.4rem 1rem",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "0.75rem",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  មើលទីតាំងលើ Google Maps
                </a>
              </div>
            )}
            {tpl.sketchMapImage && (
              <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(212,175,55,0.15)", paddingTop: "0.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--el-gold-light)", margin: "0 0 6px", fontWeight: "600" }}>
                  🗺️ គំនូសប្លង់ទីតាំង (Sketch Map)
                </p>
                <img
                  src={tpl.sketchMapImage}
                  alt="Sketch Map"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "140px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    border: "1px solid rgba(212, 175, 55, 0.25)",
                    background: "rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Gift QR */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(0,0,0,0.3)", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(212, 175, 55, 0.25)" }}>
            <QrCode className="w-10 h-10 text-amber-300" />
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--el-gold-primary)", fontWeight: "700", margin: 0 }}>
                ចងដៃតាម KHQR ({tpl.bankAccount?.bank})
              </p>
              <p style={{ fontSize: "0.75rem", color: "#e2e8f0", margin: 0, fontFamily: "monospace" }}>
                {tpl.bankAccount?.accountNumber} ({tpl.bankAccount?.accountName})
              </p>
            </div>
          </div>

          <button type="button" className="el-flip-btn" onClick={() => setIsFlipped(false)}>
            <RotateCw className="w-4 h-4" /> ត្រឡប់មកមុខវិញ (Flip Back)
          </button>
        </div>
      </div>
    </div>
  );
}
