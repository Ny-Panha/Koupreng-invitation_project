import { Link } from "react-router-dom";
import { ArrowUpRight, Check, MessageSquare, Plus } from "lucide-react";
import PricingFactors from "./PricingFactors";

export default function LandingConversion({ copy }) {
  const questions = [
    [copy("អាចមើលគំរូដោយមិនចូលគណនីបានទេ?", "Can I preview a design without an account?"), copy("បាន។ មើលគំរូបង្ហាញសាធារណៈដោយមិនចូលគណនី។ អ្នកត្រូវចូលគណនីពេលបង្កើតសន្លឹកការរបស់អ្នក។", "Yes. Public demos are available without signing in. You will need an account to create your own invitation.")],
    [copy("តើអាចកែសម្រួលអ្វីខ្លះ?", "What can I personalize?"), copy("បញ្ចូលឈ្មោះ រូបភាព កាលបរិច្ឆេទ ព័ត៌មានគ្រួសារ កម្មវិធី និងទីតាំង។ ជម្រើសអាស្រ័យលើគំរូដែលអ្នកជ្រើសរើស។", "Add your names, photographs, date, family details, program and venue. Available options depend on the design you choose.")],
    [copy("ភ្ញៀវឆ្លើយតបនៅឯណា?", "Where do my guests RSVP?"), copy("ភ្ញៀវឆ្លើយតបនៅលើសន្លឹកការដែលបានផ្សព្វផ្សាយ តាមតំណភ្ជាប់ដែលអ្នកផ្ញើ។ គំរូបង្ហាញមិនផ្ញើ ឬរក្សាទុកការឆ្លើយតបទេ។", "Guests respond on the published invitation through the link you share. Demo forms do not send or save a real response.")],
    [copy("ការមើលគំរូបើកសិទ្ធិប្រើគំរូប្រណិតទេ?", "Does previewing unlock a premium design?"), copy("ការមើលគំរូអនុញ្ញាតឱ្យអ្នកស្វែងយល់ពីរចនាបទ។ គំរូប្រណិតតម្រូវឱ្យមានសិទ្ធិប្រើប្រាស់ និងការបញ្ជាក់ការទូទាត់។ មើលព័ត៌មានបច្ចុប្បន្នមុនជ្រើសរើស។", "A preview lets you explore the design. Premium templates require access and confirmed payment. Check current details before choosing.")],
    [copy("តើការទូទាត់ត្រូវបានបញ្ជាក់ដោយរបៀបណា?", "How is payment confirmed?"), copy("ធ្វើតាមការណែនាំនៅទំព័រទូទាត់។ ប្រព័ន្ធត្រូវពិនិត្យ និងបញ្ជាក់ការទូទាត់ មុនបើកសិទ្ធិប្រើប្រាស់។ ការផ្ញើព័ត៌មានទូទាត់មិនមែនជាការបញ្ជាក់ភ្លាមៗទេ។", "Follow the checkout instructions. Payment must be verified before premium access is activated; submitting payment details is not instant approval.")],
  ];
  return <>
    <section className="kp-pricing-preview kp-section" aria-labelledby="kp-pricing-title">
      <div className="kp-section-heading"><div><p className="kp-eyebrow">{copy("ស្វែងយល់មុនជ្រើសរើស", "Before you choose")}</p><h2 id="kp-pricing-title">{copy("គំរូដែលអ្នកពេញចិត្ត។\nកញ្ចប់ដែលអ្នកត្រូវការ។", "The design you love.\nThe package you need.")}</h2></div><p>{copy("ស្វែងយល់ពីគំរូ និងកញ្ចប់សេវាកម្ម។ ចូលគណនីដើម្បីមើលតម្លៃ និងសិទ្ធិបច្ចុប្បន្ន។", "Understand designs and service packages. Sign in for current prices and access.")}</p></div>

      <div className="kp-pricing-tier-grid" role="group" aria-label={copy("កញ្ចប់តម្លៃសេវាកម្ម", "Pricing tiers")}>
        <article className="kp-pricing-card">
          <div className="kp-pricing-card-header">
            <h3>{copy("កញ្ចប់សាកល្បង (Basic)", "Basic Starter")}</h3>
            <p className="kp-pricing-amount">$0.01 <small>/ {copy("កម្មវិធី", "event")}</small></p>
            <p className="kp-pricing-khr">~40 KHR</p>
            <p className="kp-pricing-desc">{copy("សាកសមសម្រាប់ការសាកល្បង និងពិធីជួបជុំតូចៗ", "Great for trial setups and small family gatherings")}</p>
          </div>
          <ul className="kp-pricing-features">
            <li><Check size={16} aria-hidden="true" />{copy("១ សន្លឹកការឌីជីថល", "1 Digital Invitation")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ភ្ញៀវរហូតដល់ ១០០ នាក់", "Up to 100 Guests")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ប្រព័ន្ធឆ្លើយតប RSVP ស្វ័យប្រវត្តិ", "Automated RSVP replies")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("គំរូសន្លឹកការទូទៅ", "Standard templates")}</li>
          </ul>
          <Link to="/pricing" className="kp-button kp-button--outline">{copy("ជ្រើសរើស Basic", "Select Basic")}</Link>
        </article>

        <article className="kp-pricing-card kp-pricing-card--popular">
          <div className="kp-pricing-badge">{copy("ពេញនិយមបំផុត", "Most Popular")}</div>
          <div className="kp-pricing-card-header">
            <h3>{copy("កញ្ចប់មង្គល (Pro)", "Pro Celebration")}</h3>
            <p className="kp-pricing-amount">$199 <small>/ {copy("កម្មវិធី", "event")}</small></p>
            <p className="kp-pricing-khr">~800,000 KHR</p>
            <p className="kp-pricing-desc">{copy("កញ្ចប់ពេញលេញសម្រាប់ពិធីមង្គលការខ្មែរគ្រប់ទំហំ", "The complete suite for Khmer weddings of any size")}</p>
          </div>
          <ul className="kp-pricing-features">
            <li><Check size={16} aria-hidden="true" />{copy("៥ សន្លឹកការ (ក្រុងពាលី កាត់សក់ មង្គលការ...)", "5 Invitations for all ceremonies")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ភ្ញៀវមិនកំណត់ចំនួន", "Unlimited Guests")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("គ្រប់គ្រងតុ និងកន្លែងអង្គុយ (Seating)", "Visual Table Seating")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ស្កេន QR ទទួលភ្ញៀវនៅច្រកចូល", "QR Check-in scanner")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ប្រើបានគ្រប់គំរូប្រណិតទាំងអស់", "Access all Premium designs")}</li>
          </ul>
          <Link to="/pricing" className="kp-button">{copy("ជ្រើសរើស Pro", "Select Pro")}</Link>
        </article>

        <article className="kp-pricing-card">
          <div className="kp-pricing-card-header">
            <h3>{copy("កញ្ចប់ប្រណិត (Royal Luxury)", "Royal Luxury")}</h3>
            <p className="kp-pricing-amount">$499 <small>/ {copy("កម្មវិធី", "event")}</small></p>
            <p className="kp-pricing-khr">~2,000,000 KHR</p>
            <p className="kp-pricing-desc">{copy("សេវាកម្មរៀបចំពិសេស និងចលនា 3D កម្រិតខ្ពស់", "Bespoke design concierge & 3D cinematic opening")}</p>
          </div>
          <ul className="kp-pricing-features">
            <li><Check size={16} aria-hidden="true" />{copy("សន្លឹកការ និងភ្ញៀវមិនកំណត់", "Unlimited Invitations & Guests")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ឈ្មោះគេហទំព័រផ្ទាល់ខ្លួន (Custom Domain)", "Custom Domain & Branding")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ជំនួយការផ្ទាល់រៀបចំសន្លឹកការជូន", "Dedicated Concierge Setup")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("ចលនាបើកស្រោមសំបុត្រ Wax Seal 3D", "3D Wax Seal Animation")}</li>
            <li><Check size={16} aria-hidden="true" />{copy("គាំទ្រអាទិភាព ២៤/៧", "24/7 Priority Support")}</li>
          </ul>
          <Link to="/pricing" className="kp-button kp-button--outline">{copy("ជ្រើសរើស Royal", "Select Royal")}</Link>
        </article>
      </div>

      <PricingFactors copy={copy} compact />
      <div className="kp-pricing-preview-actions"><p>{copy("ជ្រើសរើសគំរូ ចូលគណនី រួចពិនិត្យតម្លៃ និងសិទ្ធិមុនបង្កើត។ ការមើលគំរូមិនបើកសិទ្ធិប្រណិតទេ។", "Choose a design, sign in, then review its price and your access before creating. A preview does not unlock premium access.")}</p><div className="kp-actions"><Link to="/pricing" className="kp-button">{copy("ស្វែងយល់ពីកញ្ចប់ និងសិទ្ធិ", "Understand packages & access")}<ArrowUpRight size={18} aria-hidden="true" /></Link><Link to="/contact" className="kp-text-link">{copy("សួរអំពីកញ្ចប់", "Ask about packages")}</Link></div></div>
    </section>
    <section className="kp-faq kp-section" aria-labelledby="kp-faq-title"><div><p className="kp-eyebrow">{copy("ព័ត៌មានមុនចាប់ផ្តើម", "Before you begin")}</p><h2 id="kp-faq-title">{copy("សំណួររបស់អ្នក។\nចម្លើយច្បាស់លាស់។", "Your questions,\nclearly answered.")}</h2></div><div className="kp-faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>
    <section className="kp-help-preview kp-section" aria-labelledby="kp-help-title"><div className="kp-help-mark" aria-hidden="true"><MessageSquare size={28} strokeWidth={1.5} /></div><div><h2 id="kp-help-title">{copy("ចង់បានការណែនាំបន្ថែម?", "A little guidance goes a long way.")}</h2><p>{copy("សួរអំពីគំរូ កញ្ចប់ ឬរបៀបរៀបចំសន្លឹកការរបស់អ្នក។ ក្រុមការងាររីករាយស្វែងយល់ពីតម្រូវការរបស់អ្នក។", "Ask about designs, packages or setting up your invitation. Tell our team what you’re planning.")}</p></div><Link to="/contact" className="kp-button kp-button--outline">{copy("ទាក់ទងក្រុមការងារ", "Contact the team")}<ArrowUpRight size={18} aria-hidden="true" /></Link></section>
    <section className="kp-final" aria-labelledby="kp-final-title"><h2 id="kp-final-title">{copy("ចាប់ផ្តើមថ្ងៃពិសេសរបស់អ្នក\nដោយការអញ្ជើញដ៏មានន័យ។", "Begin your celebration\nwith a thoughtful invitation.")}</h2><p>{copy("ជ្រើសរើសគំរូដែលអ្នកពេញចិត្ត ហើយបញ្ចូលរឿងរ៉ាវរបស់អ្នក។", "Choose a design you love and make it part of your story.")}</p><div className="kp-actions"><Link to="/templates" className="kp-button kp-button--light">{copy("មើលគំរូសន្លឹកការ", "Explore templates")}<ArrowUpRight size={18} aria-hidden="true" /></Link><Link to="/templates/browse" className="kp-text-link">{copy("ចាប់ផ្តើមបង្កើត", "Start creating")}<ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
  </>;
}
