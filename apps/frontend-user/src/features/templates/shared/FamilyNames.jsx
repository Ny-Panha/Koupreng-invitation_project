import { COUPLE_LAYOUTS } from './invitationFeatures';
import './invitation-features.css';

export function CoupleMonogram({ value }) {
  if (!value?.enabled || !value.text) return null;
  const size = Math.max(60, Math.min(180, Number(value.size) || 100));
  const color = /^#[0-9a-f]{6}$/i.test(value.color) ? value.color : 'currentColor';
  const font = ({ MOUL: 'Moul, serif', KANTUMRUY: 'Kantumruy Pro, sans-serif', SERIF: 'Georgia, Kantumruy Pro, serif' })[value.font] || 'Moul, serif';
  return <svg className="kp-monogram" aria-hidden="true" focusable="false" viewBox="0 0 200 200" style={{ width: size, color }}>
    {value.layout !== 'plain' && <ellipse cx="100" cy="100" rx={value.layout === 'oval' ? 70 : 90} ry="90" fill="none" stroke="currentColor" strokeWidth="2" />}
    {value.motif === 'diamond' && <path d="M100 10 112 24 100 38 88 24Z M100 162 112 176 100 190 88 176Z" fill="currentColor" />}
    {value.motif === 'petals' && <g fill="none" stroke="currentColor"><ellipse cx="100" cy="25" rx="6" ry="14" /><ellipse cx="100" cy="175" rx="6" ry="14" /></g>}
    <text x="100" y="108" textAnchor="middle" dominantBaseline="middle" fontFamily={font} fontSize={value.text.length > 12 ? 20 : 30}>{value.text}</text>
  </svg>;
}
export default function FamilyNames({ content = {} }) {
  const locale = String(content.languageMode).toLowerCase() === 'en' ? 'en' : 'km';
  const layout = COUPLE_LAYOUTS.includes(content.coupleLayout) ? content.coupleLayout : 'template-default';
  const lines = value => Array.isArray(value) ? value : value ? String(value).split('\n') : [];
  return <div className="kp-family-names" data-couple-layout={layout} lang={locale}>
    {content.coupleMonogram?.position !== 'below' && <CoupleMonogram value={content.coupleMonogram} />}
    <div className="kp-family-names__grid">{['groom', 'bride'].map(side => {
      const group = content.familyGroupsV1?.find(item => item.side === side);
      const name = content[side] || content[`${side}Name`] || '';
      const parents = lines(content.family?.[`${side}Parents`] || content.couple?.[`${side}Parents`] || content[`${side}Parents`]).filter(Boolean);
      const members = group ? group.members.filter(member => member.name?.[locale]?.trim()) : [];
      if (!name && !parents.length && !members.length) return null;
      return <article key={side} data-couple-side={side}>
        {group?.label?.[locale] && <p>{group.label[locale]}</p>}
        {group ? members.map(member => <p key={member.id}>{[member.honorific?.[locale], member.name[locale]].filter(Boolean).join(' ')}{member.relationship?.[locale] && <small>{member.relationship[locale]}</small>}</p>) : parents.map((parent, i) => <p key={i}>{parent}</p>)}
        {name && <h3 style={locale === "en" ? { fontFamily: "var(--font-en-romantic, Georgia, serif)" } : undefined}>{content[`${side}Honorific`] ? `${content[`${side}Honorific`]} ` : ''}{name}</h3>}
      </article>;
    })}</div>
    {content.coupleMonogram?.position === 'below' && <CoupleMonogram value={content.coupleMonogram} />}
  </div>;
}
