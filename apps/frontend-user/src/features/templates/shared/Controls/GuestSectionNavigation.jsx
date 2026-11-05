import { useEffect, useRef, useState } from 'react';
import { Heart, CalendarDays, ListMusic, MapPin, Images, MessageCircle, QrCode } from 'lucide-react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import './guest-section-navigation.css';

const labels = { family: ['គូស្វាមីភរិយា', 'Couple', Heart], couple: ['គូស្វាមីភរិយា', 'Couple', Heart], countdown: ['កាលបរិច្ឆេទ', 'Date', CalendarDays], invitation: ['ប្រតិទិន', 'Calendar', CalendarDays], schedule: ['កម្មវិធី', 'Program', ListMusic], map: ['ទីតាំង', 'Map', MapPin], venue: ['ទីតាំង', 'Map', MapPin], gallery: ['រូបថត', 'Photos', Images], gift: ['ចំណងដៃ', 'Gift QR', QrCode], rsvp: ['ឆ្លើយតប', 'RSVP', MessageCircle] };
// Register actual rendered section nodes. No invented anchors or unsupported actions.
export default function GuestSectionNavigation({ rootRef, visible, english, sectionKeys, availableKeys }) {
  const [sections, setSections] = useState([]), [active, setActive] = useState('');
  const nodes = useRef(new Map()), reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!visible || !rootRef.current) return;
    const registered = [], seen = new Set(), registeredNodes = nodes.current;
    rootRef.current.querySelectorAll('[data-section-key],[data-tx-section]').forEach(node => {
      const key = node.dataset.sectionKey || node.dataset.txSection;
      if (!labels[key] || seen.has(key) || node.hidden || node.closest('[hidden]')) return;
      if (availableKeys && !availableKeys.split(',').includes(key)) return;
      if (key === 'countdown' && seen.has('invitation')) return;
      seen.add(key); registered.push(key); registeredNodes.set(key, node);
    });
    setSections(registered);
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const candidates = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (candidates[0]) setActive(candidates[0].target.dataset.sectionKey || candidates[0].target.dataset.txSection);
    }, { rootMargin: '-15% 0px -45% 0px', threshold: [0, .15, .5] });
    registered.forEach(key => observer.observe(registeredNodes.get(key)));
    return () => { observer.disconnect(); registeredNodes.clear(); };
  }, [rootRef, visible, sectionKeys, availableKeys]);
  if (!visible || !sections.length) return null;
  return <nav className="guest-section-navigation" aria-label={english ? 'Invitation sections' : 'ផ្នែកក្នុងធៀប'}>{sections.map(key => {
    const [km, en, Icon] = labels[key];
    return <button key={key} type="button" aria-label={english ? en : km} aria-current={active === key ? 'location' : undefined} onClick={() => {
      const target = nodes.current.get(key);
      target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      setActive(key);
    }}><Icon size={18} aria-hidden="true" /><span>{english ? en : km}</span></button>;
  })}</nav>;
}
