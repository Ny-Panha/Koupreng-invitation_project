import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguageStore } from "../../../stores/useLanguageStore";
import "../AuthPage.css";

export default function AuthLayout({ children }) {
  const { lang, setLang } = useLanguageStore();
  const copy = (km, en) => (lang === "en" ? en : km);

  return (
    <div className="auth-page auth-page--centered" lang={lang}>
      {/* Decorative ambient background */}
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />

      <div className="auth-centered-container">
        <div className="auth-top-bar">
          <Link to="/" className="auth-home-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{copy("ត្រឡប់ទៅទំព័រដើម", "Back to home")}</span>
          </Link>
          <div className="auth-lang-pill" role="group" aria-label="Language selection">
            <button
              type="button"
              className={`auth-lang-btn${lang === "km" ? " active" : ""}`}
              onClick={() => setLang("km")}
              aria-pressed={lang === "km"}
            >
              ភាសាខ្មែរ
            </button>
            <span className="auth-lang-sep" aria-hidden="true">/</span>
            <button
              type="button"
              className={`auth-lang-btn${lang === "en" ? " active" : ""}`}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              English
            </button>
          </div>
        </div>

        <div className="auth-card-wrap">
          {children}
        </div>
      </div>
    </div>
  );
}

