import { useState } from "react";
import { Link } from "react-router-dom";
import { IoCallOutline, IoMailOutline, IoLocationOutline, IoPaperPlaneOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import heroBg from "../../assets/icons/background.png";
import { toast } from "../../shared/ui/toast";

export default function ContactFeature() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    plan: "Enterprise (កញ្ចប់ពេជ្រ)",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast("សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ!");
    }, 600);
  };

  return (
    <div className="khmer-modern-theme">
      <section
        className="pricing-wrapper"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="glass-overlay"></div>

        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="header-content">
            <span className="sub-title">GET IN TOUCH • ទំនាក់ទំនងយើងខ្ញុំ</span>
            <h1 className="main-title">
              ទាក់ទង<span className="gold-text">ផ្នែកលក់ និងសេវាកម្ម</span>
            </h1>
            <div className="divider-modern">
              <span></span>
              <div className="diamond"></div>
              <span></span>
            </div>
            <p style={{ marginTop: "16px", color: "#666", fontSize: "0.95rem" }}>
              សម្រាប់ការប្រឹក្សាលើកញ្ចប់ Enterprise ឬដំណោះស្រាយរៀបចំអាពាហ៍ពិពាហ៍សម្រាប់ស្ទូឌីយោ
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
            alignItems: "start",
          }}>
            {/* Contact Info Card */}
            <div className="pricing-card" style={{ padding: "36px 28px" }}>
              <h3 className="plan-name" style={{ marginBottom: "16px" }}>ព័ត៌មានទំនាក់ទំនង</h3>
              <p className="plan-desc" style={{ marginBottom: "24px", minHeight: "auto" }}>
                ក្រុមការងារ Koupreng រីករាយក្នុងការជួយសម្របសម្រួល និងផ្ដល់ព័ត៌មានលម្អិត ២៤/៧។
              </p>

              <div className="features-list" style={{ margin: "16px 0" }}>
                <div className="feature-item" style={{ gap: "14px" }}>
                  <div className="check-icon"><IoCallOutline /></div>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#888" }}>ទូរស័ព្ទ / Phone</strong>
                    <span>+855 (0) 97 888 9999</span>
                  </div>
                </div>
                <div className="feature-item" style={{ gap: "14px" }}>
                  <div className="check-icon"><IoPaperPlaneOutline /></div>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#888" }}>Telegram</strong>
                    <a href="https://t.me/koupreng" target="_blank" rel="noreferrer" style={{ color: "#B0926A", textDecoration: "none" }}>
                      @koupreng_official
                    </a>
                  </div>
                </div>
                <div className="feature-item" style={{ gap: "14px" }}>
                  <div className="check-icon"><IoMailOutline /></div>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#888" }}>អ៊ីមែល / Email</strong>
                    <span>contact@koupreng.com</span>
                  </div>
                </div>
                <div className="feature-item" style={{ gap: "14px" }}>
                  <div className="check-icon"><IoLocationOutline /></div>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#888" }}>ទីតាំង / Address</strong>
                    <span>Phnom Penh & Battambang, Cambodia</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(176,146,106,0.2)" }}>
                <Link to="/pricing" className="action-btn btn-outline" style={{ display: "block", width: "100%" }}>
                  ← មើលតម្លៃកញ្ចប់ឡើងវិញ (View Pricing)
                </Link>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="pricing-card premium" style={{ padding: "36px 28px" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 10px" }}>
                  <IoCheckmarkCircleOutline style={{ fontSize: "4rem", color: "#0f766e", marginBottom: "16px" }} />
                  <h3 style={{ fontFamily: "Moul", fontSize: "1.2rem", color: "#7D6443", marginBottom: "10px" }}>
                    សូមអរគុណ!
                  </h3>
                  <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: "1.6" }}>
                    យើងខ្ញុំបានទទួលសាររបស់អ្នកហើយ។ ក្រុមការងារផ្នែកលក់នឹងទាក់ទងទៅអ្នកក្នុងពេលឆាប់ៗនេះ។
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="action-btn btn-gold"
                    style={{ marginTop: "24px", width: "100%" }}
                  >
                    ផ្ញើសារម្ដងទៀត
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 className="plan-name" style={{ margin: "0 0 10px", fontSize: "1.2rem" }}>ផ្ញើសារមកកាន់យើង</h3>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#555", marginBottom: "4px" }}>
                      ឈ្មោះរបស់អ្នក (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ឧ. ឡេង វណ្ណដា"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#555", marginBottom: "4px" }}>
                      លេខទូរស័ព្ទ ឬ Telegram *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="012 345 678"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#555", marginBottom: "4px" }}>
                      កញ្ចប់សេវាកម្មដែលចាប់អារម្មណ៍ (Plan)
                    </label>
                    <select
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        fontSize: "0.9rem",
                        outline: "none",
                        background: "#fff",
                      }}
                    >
                      <option value="Enterprise (កញ្ចប់ពេជ្រ)">កញ្ចប់ពេជ្រ (Enterprise / Custom)</option>
                      <option value="Pro (កញ្ចប់មាស)">កញ្ចប់មាស (Pro - $19)</option>
                      <option value="Basic (កញ្ចប់មង្គល)">កញ្ចប់មង្គល (Basic - Free)</option>
                      <option value="Other">ផ្សេងៗ (Other Inquiry)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#555", marginBottom: "4px" }}>
                      សារ ឬព័ត៌មានលម្អិត (Message)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="សរសេរព័ត៌មានបន្ថែម..."
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        fontSize: "0.9rem",
                        outline: "none",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="action-btn btn-gold"
                    style={{ marginTop: "10px", width: "100%", cursor: "pointer" }}
                  >
                    {submitting ? "កំពុងផ្ញើ..." : "ផ្ញើសារទាក់ទង (Submit Message)"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
