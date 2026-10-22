import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import InvitationDemo from "./InvitationDemo";
import "./LandingHero.css";

export default function LandingHero({ copy }) {
  return <section className="kp-hero kp-hero--live" aria-labelledby="kp-hero-title">
    <div className="kp-hero-copy">
      <p className="kp-hero-category">{copy("ធៀបការមង្គលការឌីជីថល", "Digital wedding invitations")}</p>
      <h1 id="kp-hero-title"><span>{copy("ធៀបការដែលបង្ហាញ", "Invitations crafted")}</span><span>{copy("រឿងរ៉ាវរបស់អ្នក។", "around your story.")}</span></h1>
      <p className="kp-hero-lead">{copy("ជ្រើសរើសគំរូដែលពេញចិត្ត បញ្ចូលព័ត៌មានមង្គលការ និងផ្ញើតំណភ្ជាប់ទៅកាន់ភ្ញៀវដោយទំនុកចិត្ត។ គ្រប់គ្រងការឆ្លើយតបយ៉ាងងាយស្រួលនៅកន្លែងតែមួយ។", "Choose a design, add your celebration details, and share one invitation. Keep your guests and their replies together.")}</p>
      <div className="kp-actions"><Link to="/app/events/new" className="kp-button">{copy("បង្កើតសន្លឹកការ", "Create invitation")}<ArrowUpRight size={18} aria-hidden="true" /></Link><Link to="/templates" className="kp-text-link">{copy("មើលគំរូធៀបការ", "Explore templates")}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      <p className="kp-hero-proof"><Check size={16} aria-hidden="true" />{copy("មើលគំរូភ្លាមៗ ដោយមិនបាច់ចុះឈ្មោះ", "Explore a real invitation before signing up")}</p>
    </div>
    <div className="kp-hero-live-art"><InvitationDemo copy={copy} /></div>
  </section>;
}
