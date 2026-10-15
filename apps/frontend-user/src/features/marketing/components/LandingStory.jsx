import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, LayoutTemplate, PencilLine, Send } from "lucide-react";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";

export default function LandingStory({ copy }) {
  const timeline = useRef(null);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      const current = entries.find(entry => entry.isIntersecting);
      if (current) setActive(Number(current.target.dataset.step));
    }, { rootMargin: "-25% 0px -35%", threshold: .2 });
    timeline.current?.querySelectorAll("[data-step]").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [reduced]);
  const steps = [
    [LayoutTemplate, copy("ជ្រើសគំរូ", "Choose a design"), copy("មើលគំរូពេញលេញ ហើយជ្រើសរើសរចនាបទសម្រាប់ពិធីរបស់អ្នក។", "Explore the complete demos and choose a design for your event."), "/templates"],
    [PencilLine, copy("កែសម្រួលព័ត៌មាន", "Make it yours"), copy("ចូលគណនី រួចបញ្ចូលឈ្មោះ រូបភាព កម្មវិធី និងទីតាំងពិធី។", "Sign in, then add your names, photos, program and venue."), "/templates/browse"],
    [Send, copy("ចែករំលែក និងទទួលចម្លើយ", "Share & follow replies"), copy("ពិនិត្យសន្លឹកការ រួចផ្សព្វផ្សាយ និងផ្ញើតំណភ្ជាប់ទៅភ្ញៀវ។ តាមដានចម្លើយក្នុងគណនីរបស់អ្នក។", "Review, publish and share your guest links. Follow the replies in your account."), "/templates/browse"],
  ];
  return <section className="kp-steps kp-section" aria-labelledby="kp-steps-title">
    <div className="kp-section-heading"><div><p className="kp-eyebrow">{copy("ពីគំនិត ទៅកាន់ការអញ្ជើញ", "From an idea to an invitation")}</p><h2 id="kp-steps-title">{copy("បីជំហាន។\nថ្ងៃពិសេសមួយ។", "Three steps.\nOne special day.")}</h2></div><p>{copy("ចាប់ផ្តើមពីរចនាបទដែលអ្នកពេញចិត្ត រួចរៀបចំព័ត៌មានឱ្យភ្ញៀវ។", "Start with a design you love, then bring the details together for your guests.")}</p></div>
    <ol ref={timeline} className="kp-journey">{steps.map(([Icon, title, text, path], index) => <li key={title} data-step={index} data-active={!reduced && active === index}>
      <div className="kp-journey-top"><span aria-hidden="true">0{index + 1}</span><Icon size={25} strokeWidth={1.4} aria-hidden="true" /></div><h3><Link to={path}>{title}<ArrowUpRight size={17} aria-hidden="true" /></Link></h3><p>{text}</p>
    </li>)}</ol>
  </section>;
}
