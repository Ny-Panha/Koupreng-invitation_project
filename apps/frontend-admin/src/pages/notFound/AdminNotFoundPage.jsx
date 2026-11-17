import { Link } from "react-router-dom";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";

export default function AdminNotFoundPage() {
  const { lang } = useAdminLanguage();
  const isEn = lang === "en";

  return (
    <main className="admin-system-page" tabIndex={-1} lang={lang} style={{ textAlign: "center", padding: "64px 20px", minHeight: '100dvh', background: 'var(--ui-theme-canvas)', color: 'var(--ui-theme-ink)' }}>
      <div aria-hidden="true" style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--ui-theme-gold)", marginBottom: "8px" }}>
        404
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "12px", color: "var(--ui-theme-ink)" }}>
        {isEn ? "Page Not Found" : "រកមិនឃើញទំព័រ"}
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--ui-theme-muted)", maxWidth: "460px", margin: "0 auto 24px" }}>
        {isEn
          ? "The requested admin URL does not exist or may have been moved."
          : "អាសយដ្ឋាន URL ដែលលោកអ្នកស្នើសុំមិនមានក្នុងប្រព័ន្ធ ឬត្រូវបានផ្លាស់ប្តូរ។"}
      </p>
      <Link
        to="/dashboard"
        className="btn btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 22px",
          borderRadius: "10px",
          fontWeight: 700,
          textDecoration: "none",
          minHeight: 44,
          background: 'var(--ui-theme-action)',
          color: 'var(--ui-theme-on-action)',
        }}
      >
        {isEn ? "Return to Dashboard" : "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង"}
      </Link>
    </main>
  );
}
