import { useId } from 'react';

// Shared geometry for the two authored letters; wording stays canonical.
export default function RoyalGardenCeremonialLetter({ title, body, variant }) {
  const id = useId();
  if (!title && !body) return null;
  return <article className="rg-ceremonial-letter" data-letter={variant} aria-labelledby={title ? id : undefined}>
    {title && <div className="rg-heading"><h2 id={id} lang={/[\u1780-\u17ff]/.test(title) ? 'km' : undefined}>{title}</h2><span className="rg-divider" aria-hidden="true" /></div>}
    {body && <p className="rg-copy">{body}</p>}
  </article>;
}
