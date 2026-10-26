import { eventLocaleModel } from './localizedEventModel';
import { LOCALIZED_FIELD_LABELS, editLocalizedField, localeContent, translationReadiness } from '../../templates/shared/localizedContent';
export default function LocalizedEventEditor({ form, schedule, setForm, locale, setLocale, isOwner }) {
  const model = eventLocaleModel(form, schedule);
  const content = localeContent(model), readiness = translationReadiness(model);
  const wedding = ['WEDDING', 'ENGAGEMENT'].includes(form.eventType);
  const keys = ['title', ...(wedding ? ['groomName', 'brideName'] : ['hostName']), ...(form.partnerName && !wedding ? ['partnerName'] : []), 'venueName', 'venueAddress', 'messageText'];
  const select = next => {
    if (!form.localizedContentV1 && ((next === 'en' && form.languageMode !== 'EN') || (next === 'km' && form.languageMode === 'EN'))) setForm(current => ({ ...current, localizedContentV1: localeContent(eventLocaleModel(current, schedule)) }));
    setLocale(next);
  };
  return <section className="event-settings-section" aria-label="Invitation content languages"><h2>Invitation content languages</h2>
    <div className="workspace-actions"><button type="button" aria-pressed={locale === 'km'} onClick={() => select('km')}>Edit Khmer</button><button type="button" aria-pressed={locale === 'en'} onClick={() => select('en')}>Edit English</button></div>
    <p role="status">English: {readiness.complete}/{readiness.total} fields complete. Dates, contact details and access settings are shared.</p>
    <label>Publish English version<input type="checkbox" checked={content.enabledLocales.includes('en')} disabled={isOwner === false || (!readiness.ready && !content.enabledLocales.includes('en'))} onChange={e => setForm(current => ({ ...current, localizedContentV1: { ...localeContent(eventLocaleModel(current, schedule)), enabledLocales: e.target.checked ? ['km', 'en'] : ['km'], defaultLocale: 'km' } }))} /></label>
    {locale === 'en' && keys.map(key => { const Control = key === 'messageText' ? 'textarea' : 'input'; return <label key={key}>English {LOCALIZED_FIELD_LABELS[key] || key}<Control maxLength={key === 'messageText' ? 5000 : key === 'venueAddress' ? 1000 : 255} value={content.en[key] || ''} onChange={e => setForm(current => { const next = editLocalizedField(eventLocaleModel(current, schedule), 'en', key, e.target.value); return key === 'messageText' && !next.localizedContentV1 ? { ...next, storyText: e.target.value } : next; })} /></label>; })}
    {locale === 'en' && form.saveTheDate?.enabled !== false && ['heading', 'subtitle'].map(key => <label key={key}>English calendar {key}<input maxLength={key === 'heading' ? 300 : 1000} value={content.en.collections?.saveTheDate?.['row-0']?.[key] || ''} onChange={e => setForm(current => editLocalizedField(current, 'en', 'saveTheDate', { ...content.en.collections?.saveTheDate?.['row-0'], [key]: e.target.value }))} /></label>)}
    {locale === 'en' && <button type="button" onClick={() => setForm(current => { let next = eventLocaleModel(current, schedule); for (const key of ['hostName', 'partnerName', 'groomName', 'brideName']) next = editLocalizedField(next, 'en', key, localeContent(next).km[key] || ''); return next; })}>Copy names from Khmer</button>}
  </section>;
}
