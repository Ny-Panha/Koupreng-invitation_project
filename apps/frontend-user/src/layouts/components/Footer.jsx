import { Link } from "react-router-dom";
import { useLanguageStore } from "../../stores/useLanguageStore";
import "./MarketingChrome.css";

export default function Footer() {
  const lang = useLanguageStore((state) => state.lang);
  const copy = (km, en) => lang === "en" ? en : km;
  return (
    <footer className="kp-footer">
      <div className="kp-footer-grid">
        <div className="kp-footer-brand"><Link to="/">Koupreng</Link><p>{copy("សន្លឹកការឌីជីថល និងការគ្រប់គ្រងភ្ញៀវ សម្រាប់ថ្ងៃពិសេសរបស់អ្នក។", "Thoughtful invitations and guest management for your celebration.")}</p></div>
        <nav aria-label={copy("ស្វែងរក", "Explore")}><p>{copy("ស្វែងរក", "Explore")}</p><Link to="/templates">{copy("គំរូសន្លឹកការ", "Invitation designs")}</Link><Link to="/pricing">{copy("កញ្ចប់ និងសិទ្ធិ", "Packages & access")}</Link><Link to="/venues">{copy("ទីកន្លែង", "Venues")}</Link></nav>
        <nav aria-label={copy("ជំនួយ", "Support")}><p>{copy("នៅជាមួយអ្នក", "Here for you")}</p><Link to="/contact">{copy("ទាក់ទងយើង", "Contact us")}</Link><Link to="/contact">{copy("ជំនួយ", "Help with your invitation")}</Link><Link to="/login">{copy("ចូលគណនី", "Log in")}</Link></nav>
      </div>
      <div className="kp-footer-bottom"><span>© {new Date().getFullYear()} Koupreng. {copy("រក្សាសិទ្ធិគ្រប់យ៉ាង។", "All rights reserved.")}</span><span>{copy("រចនាជាមួយក្តីស្រលាញ់ សម្រាប់គូស្វាមីភរិយាខ្មែរ", "Made with care for Cambodian celebrations")}</span></div>
    </footer>
  );
}
