import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, MapPin, Heart, Check } from "lucide-react";
import { SILK_HERITAGE_TEMPLATE as silk } from "../../templates/data/templatesData";

export default function InvitationShowcase({ copy }) {
  const [stage, setStage] = useState("closed");
  const choices = [
    ["closed", copy("ការអញ្ជើញ", "The arrival"), copy("សន្លឹកការមួយ បើករឿងរ៉ាវថ្មី។", "A first impression, thoughtfully made."), copy("សូត្រមង្គលបើកដូចសៀវភៅតូចមួយ ជាមួយពណ៌ក្រហមទុំ និងក្រដាសភ្លុក។", "A burgundy folio and warm ivory paper set the tone for your celebration.")],
    ["open", copy("រឿងរ៉ាវរបស់អ្នក", "Your story"), copy("ឈ្មោះ រូបថត និងថ្ងៃពិសេស។", "Your names. Your photographs. Your day."), copy("បញ្ចូលឈ្មោះគូស្វាមីភរិយា រូបភាព និងកម្មវិធីពិធី ដើម្បីឱ្យសន្លឹកការក្លាយជារបស់អ្នក។", "Personalize your couple names, photographs and celebration program in the invitation builder.")],
    ["details", copy("ព័ត៌មានសម្រាប់ភ្ញៀវ", "The details"), copy("ព័ត៌មានច្បាស់លាស់ សម្រាប់ភ្ញៀវគ្រប់រូប។", "Everything your guests need, together."), copy("ភ្ញៀវមើលកម្មវិធី ទីតាំង និងឆ្លើយតប RSVP នៅលើសន្លឹកការដែលបានផ្សព្វផ្សាយ។", "Guests find the program and venue, then RSVP on the published invitation. This sample does not collect responses.")],
  ];
  const current = choices.find(([key]) => key === stage);
  return (
    <section id="invitation-story" className="kp-showcase kp-section" aria-labelledby="kp-showcase-title">
      <div className="kp-showcase-visual" role="group" aria-label={copy("គំរូបង្ហាញសូត្រមង្គល", "Silk Heritage sample illustration")}>
        <div className="kp-showcase-frame" data-stage={stage}>
          {stage === "closed" ? <img className="kp-showcase-cover" src={silk.image} width="720" height="1080" loading="lazy" alt={copy("ក្របសន្លឹកការសូត្រមង្គល", "The Silk Heritage invitation cover")} /> : (
            <div className="kp-mini-invitation">
              <p className="kp-mini-kicker">{copy("សូត្រមង្គល", "SILK HERITAGE")}</p>
              {stage === "open" ? <><img src={silk.mainImage} width="960" height="1440" loading="lazy" alt={copy("រូបថតគូស្នេហ៍គំរូ", "Sample couple portrait")} /><p className="kp-mini-names">{copy(silk.groom, silk.groomEn)} & {copy(silk.bride, silk.brideEn)}</p><p>{copy(silk.dateText, silk.dateTextEn)}</p></> : <><p className="kp-mini-names">{copy("ដោយក្តីរីករាយ", "With joy, we invite you")}</p><div className="kp-mini-detail"><CalendarDays aria-hidden="true" size={20} /><div><strong>{copy("កម្មវិធីពិធី", "The celebration")}</strong><p>{copy(silk.dateText, silk.dateTextEn)}</p><p>{copy("១៧:០០ — ពិធីជប់លៀង", "17:00 — Wedding reception")}</p></div></div><div className="kp-mini-detail"><MapPin aria-hidden="true" size={20} /><div><strong>{copy("ទីតាំងគំរូ", "Sample venue")}</strong><p>{silk.venueName}</p></div></div><div className="kp-mini-detail"><Heart aria-hidden="true" size={20} /><div><strong>RSVP</strong><p>{copy("ឆ្លើយតបតាមតំណភ្ជាប់សន្លឹកការពិត", "Replies belong on your published invitation")}</p></div></div></>}
              <span className="kp-mini-sample">{copy("គំរូបង្ហាញប៉ុណ្ណោះ", "ILLUSTRATION ONLY")}</span>
            </div>
          )}
        </div>
        <p className="kp-visual-note">{copy("រូបភាពគំរូ · មើលមុខងារពិតក្នុងគំរូពេញលេញ", "Sample illustration · Explore the working design in the full demo")}</p>
      </div>
      <div className="kp-showcase-copy">
        <p className="kp-eyebrow">{copy("ពីការអញ្ជើញ ដល់ការជួបជុំ", "FROM A LITTLE LINK TO A BEAUTIFUL GATHERING")}</p>
        <h2 id="kp-showcase-title">{copy("ការអញ្ជើញមួយ។\nអនុស្សាវរីយ៍រាប់មិនអស់។", "One invitation.\nSo much to remember.")}</h2>
        <div className="kp-stage-controls" role="group" aria-label={copy("ជ្រើសរើសផ្នែកគំរូ", "Choose a preview stage")}>
          {choices.map(([key, label], index) => <button key={key} type="button" aria-pressed={stage === key} aria-controls="kp-stage-copy" onClick={() => setStage(key)}><span aria-hidden="true">0{index + 1}</span>{label}{stage === key && <Check size={16} aria-hidden="true" />}</button>)}
        </div>
        <div id="kp-stage-copy" className="kp-stage-copy" aria-live="polite"><h3>{current[2]}</h3><p>{current[3]}</p></div>
        <Link to="/templates/silk-heritage" className="kp-text-link">{copy("មើលគំរូពេញលេញ", "View full interactive demo")}<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
