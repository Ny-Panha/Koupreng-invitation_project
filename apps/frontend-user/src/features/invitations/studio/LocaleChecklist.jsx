import { LOCALIZED_FIELDS, localeContent, translationFieldLabel, translationReadiness } from '../../templates/shared/localizedContent';

export default function LocaleChecklist({ form, locale, onField, onCopy, english }) {
  const isEn = typeof english === 'boolean' ? english : (locale === 'en');
  const content = localeContent(form);
  const readiness = translationReadiness(form, locale);

  const langLabel = isEn
    ? (locale === 'en' ? 'English' : 'Khmer')
    : (locale === 'en' ? 'ភាសាអង់គ្លេស' : 'ភាសាខ្មែរ');

  const summarySuffix = isEn
    ? `${readiness.missing.length} missing`
    : `${readiness.missing.length} ខ្វះ`;

  const completeMessage = isEn
    ? (locale === 'en' ? 'Required wording is complete. Review it before approving English.' : 'Required Khmer wording is complete.')
    : (locale === 'en' ? 'ខ្លឹមសារចាំបាច់ជាភាសាអង់គ្លេសត្រូវបានបំពេញរួចរាល់។ សូមពិនិត្យមើលមុននឹងអនុម័ត។' : 'ខ្លឹមសារចាំបាច់ជាភាសាខ្មែរត្រូវបានបំពេញរួចរាល់។');

  const copyLabel = isEn ? 'Copy Khmer value' : 'ចម្លងតម្លៃភាសាខ្មែរ';

  return (
    <details className="studio-locale-checklist">
      <summary>{langLabel}: {readiness.complete}/{readiness.total} · {summarySuffix}</summary>
      {!readiness.missing.length && <p>{completeMessage}</p>}
      <ul>
        {readiness.missing.map(key => {
          const fieldLabel = translationFieldLabel(key, isEn ? 'en' : 'km');
          return (
            <li key={key}>
              <button type="button" onClick={() => onField(key)}>
                {fieldLabel}
              </button>
              {locale === 'en' && LOCALIZED_FIELDS.includes(key) && content.km[key]?.trim() && (
                <button
                  type="button"
                  onClick={() => onCopy(key)}
                  aria-label={`${copyLabel}: ${fieldLabel}`}
                >
                  {copyLabel}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
