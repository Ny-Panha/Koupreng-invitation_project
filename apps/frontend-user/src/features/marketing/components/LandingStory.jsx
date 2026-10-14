import { Link } from "react-router-dom";
import { ArrowUpRight, LayoutTemplate, PencilLine, Send, Languages, MapPin, Heart, Link2 } from "lucide-react";

export default function LandingStory({ copy }) {
  const steps = [
    [LayoutTemplate, copy("ជ្រើសគំរូ", "Choose design"), copy("ស្វែងរកគំរូដែលសមនឹងស្ទីល និងរឿងរ៉ាវរបស់អ្នក។", "Explore the complete demos and find a design that feels like you."), "/templates"],
    [PencilLine, copy("បញ្ចូលព័ត៌មាន", "Add details"), copy("បញ្ចូលឈ្មោះ រូបភាព កាលបរិច្ឆេទ កម្មវិធី និងទីតាំងពិធី។", "Sign in, then add your names, photographs, date and celebration program."), "/templates/browse"],
    [Send, copy("ចែករំលែកទៅភ្ញៀវ", "Share with guests"), copy("ផ្ញើតំណភ្ជាប់ផ្ទាល់ខ្លួនទៅភ្ញៀវ និងដឹងចំនួនអ្នកឆ្លើយតប RSVP។", "Review, publish and send your guest links. Follow their RSVP replies in your dashboard."), "/templates/browse"],
  ];
  const benefits = [
    [Languages, copy("ភាសាខ្មែរ និងអង់គ្លេស", "Khmer & English"), copy("សន្លឹកការជាភាសាខ្មែរ និងអង់គ្លេស ឱ្យភ្ញៀវអានបានងាយស្រួល។", "Khmer and English invitation content, with a welcome your guests can read comfortably.")],
    [Link2, copy("តំណភ្ជាប់ភ្ញៀវផ្ទាល់ខ្លួន", "Personalized guest link"), copy("តំណភ្ជាប់ផ្ទាល់ខ្លួន អាចបង្ហាញឈ្មោះភ្ញៀវនៅលើសន្លឹកការ។", "Individual guest links can greet each guest by name on your invitation.")],
    [Heart, copy("ដឹងចំនួនភ្ញៀវដែលបានឆ្លើយតប", "Know who is coming"), copy("ប្រមូល និងមើលការឆ្លើយតប RSVP ដើម្បីរៀបចំទទួលភ្ញៀវបានត្រឹមត្រូវ។", "Collect and review RSVP replies to help prepare for your guests accurately.")],
    [MapPin, copy("ព័ត៌មាននៅកន្លែងតែមួយ", "All details together"), copy("កម្មវិធីពិធី ផែនទីទីតាំង និងកម្រងរូបភាព នៅក្នុងសន្លឹកការតែមួយ។", "Your celebration program, venue map and photo gallery, gathered in one invitation.")],
  ];
  return (
    <>
      <section className="kp-steps kp-section" aria-labelledby="kp-steps-title">
        <div className="kp-section-heading">
          <div>
            <p className="kp-eyebrow">{copy("ជំហានងាយៗ ទៅកាន់ថ្ងៃពិសេស", "A SIMPLE THREE-STEP JOURNEY")}</p>
            <h2 id="kp-steps-title">{copy("ពីការជ្រើសរើស ដល់ការចែករំលែក", "From selection to sharing")}</h2>
          </div>
          <p>{copy("បីជំហានងាយៗ ដើម្បីបង្កើតសន្លឹកការដែលជារបស់អ្នក។", "Three thoughtful steps to create an invitation that is yours.")}</p>
        </div>
        <div className="kp-step-grid">
          {steps.map(([Icon, title, description, path], index) => (
            <article key={title} className="kp-step">
              <div className="kp-step-top">
                <span>0{index + 1}</span>
                <Icon size={26} strokeWidth={1.25} aria-hidden="true" />
              </div>
              <h3><Link to={path}>{title}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="kp-benefits" aria-labelledby="kp-benefits-title">
        <div className="kp-benefits-inner">
          <div className="kp-benefits-intro">
            <p className="kp-eyebrow">{copy("ស្រស់ស្អាត ហើយមានប្រយោជន៍", "BEAUTIFUL IN EVERY LITTLE WAY")}</p>
            <h2 id="kp-benefits-title">{copy("រៀបចំពិធីដោយក្តីរីករាយ និងទំនុកចិត្ត", "Thoughtful details for your wedding")}</h2>
            <p>{copy("នៅពីក្រោយសន្លឹកការស្រស់ស្អាត គឺជាមុខងារដែលជួយអ្នករៀបចំថ្ងៃពិសេស។", "Behind the beautiful invitation are practical details that help bring everyone together.")}</p>
            <Link to="/templates/silk-heritage" className="kp-text-link">{copy("ស្វែងយល់ក្នុងគំរូ", "See the details in a demo")}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className="kp-benefit-grid">
            {benefits.map(([Icon, title, text]) => (
              <article key={title}>
                <Icon size={24} strokeWidth={1.3} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="kp-details kp-section" aria-labelledby="kp-details-title">
        <div className="kp-details-photos">
          <img src="/templates/silk-heritage/together.webp" width="960" height="1440" loading="lazy" decoding="async" alt={copy("រូបភាពគូស្នេហ៍គំរូសម្រាប់កម្រងរូបភាពសន្លឹកការ", "Sample couple photograph for the invitation gallery")} />
          <div className="kp-details-paper" aria-hidden="true">
            <img src="/templates/silk-heritage/woven-ornament.svg" width="360" height="80" loading="lazy" alt="" />
            <span>{copy("ថ្ងៃរបស់យើង", "Our day,\nour story.")}</span>
          </div>
        </div>
        <div>
          <p className="kp-eyebrow">{copy("ព័ត៌មានតូចៗ ដែលមានន័យ", "THE DETAILS THAT MAKE THE DAY YOURS")}</p>
          <h2 id="kp-details-title">{copy("រូបថតមួយ។ ឈ្មោះមួយ។\nអារម្មណ៍ដែលជារបស់អ្នក។", "The photographs.\nThe names. The feeling.")}</h2>
          <p className="kp-section-lead">{copy("បង្កើតសន្លឹកការពីរឿងរ៉ាវរបស់អ្នក ជាមួយរូបភាព គ្រួសារ និងកម្មវិធីដែលមានន័យ។ មើលរចនាបទសូត្រមង្គលដើម្បីស្វែងយល់។", "Turn a design into your invitation with your photographs, family details and celebration program. Explore Silk Heritage to see how the pieces come together.")}</p>
          <Link to="/templates/silk-heritage" className="kp-text-link">{copy("មើលសូត្រមង្គល", "Explore Silk Heritage")}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
