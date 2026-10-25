export default function AuthoredFamilies({ content }) {
  const families = [content.family?.groomParents || content.groomParents, content.family?.brideParents || content.brideParents];
  if (!families.some(value => Array.isArray(value) ? value.length : value)) return null;
  return <div className="template-authored-families" data-tx-section="couple">{families.map((value, index) => <p key={index}>{Array.isArray(value) ? value.join(' · ') : value}</p>)}</div>;
}
