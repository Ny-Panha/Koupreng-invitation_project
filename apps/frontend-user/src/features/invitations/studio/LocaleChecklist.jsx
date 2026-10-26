import { LOCALIZED_FIELDS, localeContent, translationFieldLabel, translationReadiness } from '../../templates/shared/localizedContent';

export default function LocaleChecklist({ form, locale, onField, onCopy }) {
  const content = localeContent(form), readiness = translationReadiness(form, locale);
  return <details className="studio-locale-checklist">
    <summary>{locale === 'en' ? 'English' : 'Khmer'}: {readiness.complete}/{readiness.total} · {readiness.missing.length} missing</summary>
    {!readiness.missing.length && <p>{locale === 'en' ? 'Required wording is complete. Review it before approving English.' : 'Required Khmer wording is complete.'}</p>}
    <ul>{readiness.missing.map(key => <li key={key}><button type="button" onClick={() => onField(key)}>{translationFieldLabel(key)}</button>
      {locale === 'en' && LOCALIZED_FIELDS.includes(key) && content.km[key]?.trim() && <button type="button" onClick={() => onCopy(key)} aria-label={`Copy Khmer value: ${translationFieldLabel(key)}`}>Copy Khmer value</button>}
    </li>)}</ul>
  </details>;
}
