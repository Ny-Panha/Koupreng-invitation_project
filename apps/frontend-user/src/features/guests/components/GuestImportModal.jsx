import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Upload, Check } from 'lucide-react';
import { Modal } from '@/shared/ui';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { guestService } from '../api/guestApi';
import { IMPORT_FIELDS, proposeImportMapping, mappingError, mapImportRows, importPayload, downloadImportErrors, importIssueLabel } from '../model/guestImport';
import './GuestImportModal.css';

async function batchIdentity(eventId, rows) {
  const bytes = new TextEncoder().encode(JSON.stringify(importPayload('', rows).rows));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
  const key = `koupreng.import.${eventId}.${hash}`;
  let id;
  try { id = sessionStorage.getItem(key); } catch { /* Exact retries remain safe while the dialog is open. */ }
  id ||= crypto.randomUUID();
  try { sessionStorage.setItem(key, id); } catch { /* Guest details are never stored here. */ }
  return id;
}

export default function GuestImportModal({ isOpen, onClose, invitationId, onFileImported }) {
  const en = useLanguageStore(state => state.lang) === 'en';
  const L = (english, khmer) => en ? english : khmer;
  const [step, setStep] = useState(0), [source, setSource] = useState(null), [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState([]), [rows, setRows] = useState([]), [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [fileName, setFileName] = useState(''), [text, setText] = useState(''), [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0), [uncertain, setUncertain] = useState(false), [editing, setEditing] = useState(null);
  const payload = useRef(null), inFlight = useRef(false);
  const sheet = source?.worksheets[sheetIndex];
  const steps = [L('Choose source', 'ជ្រើសប្រភព'), L('Map columns', 'ផ្គូផ្គងជួរឈរ'), L('Review rows', 'ពិនិត្យជួរដេក'), L('Confirm', 'បញ្ជាក់'), L('Results', 'លទ្ធផល')];
  const reset = () => { setStep(0); setSource(null); setRows([]); setPreview(null); setResult(null); setError(''); setUncertain(false); payload.current = null; setPage(0); };
  const close = () => {
    if (inFlight.current) return;
    if (uncertain && !window.confirm(L('The result is uncertain. Keep this dialog open to retry safely. Close anyway?', 'មិនទាន់ដឹងលទ្ធផល។ សូមសាកល្បងបាច់ដដែលនៅទីនេះ។ តើបិទមែនទេ?'))) return;
    onClose();
  };
  const inspect = async file => {
    if (inFlight.current || !file) return;
    setError('');
    if (!invitationId) { setError(L('Save this event online before importing guests.', 'សូមរក្សាទុកកម្មវិធីលើអ៊ីនធឺណិតមុននាំចូលភ្ញៀវ។')); return; }
    if (!/\.(csv|xlsx)$/i.test(file.name) || file.size > 5 * 1024 * 1024) { setError(L('Choose a CSV/XLSX file up to 5 MB.', 'ជ្រើស CSV/XLSX ទំហំមិនលើស 5 MB។')); return; }
    inFlight.current = true; setBusy(true);
    try {
      const data = await guestService.inspectImport(invitationId, file);
      if (!Array.isArray(data?.worksheets) || !data.worksheets.length || data.worksheets.some(s => !Array.isArray(s.headers) || !Array.isArray(s.rows))) throw new Error(L('Invalid file inspection response.', 'មិនអាចអានលទ្ធផលឯកសារ។'));
      const index = Math.max(0, data.worksheets.findIndex(s => s.name === 'Guests'));
      setSource(data); setSheetIndex(index); setMapping(proposeImportMapping(data.worksheets[index].headers)); setFileName(file.name); setStep(1); setPreview(null); setPage(0);
    } catch (failure) { setError(failure.message); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const validate = async proposed => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const request = importPayload(await batchIdentity(invitationId, proposed), proposed);
      const data = await guestService.previewBatch(invitationId, request);
      if (data?.committed !== false || !Array.isArray(data.rows) || data.rows.length !== proposed.length) throw new Error(L('Invalid preview response. No import confirmed.', 'លទ្ធផលពិនិត្យមិនត្រឹមត្រូវ។ មិនបានបញ្ជាក់ការនាំចូល។'));
      payload.current = request; setPreview(data); setRows(proposed); setStep(2); setEditing(null); setPage(0);
    } catch (failure) { setError(failure.message); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const commit = async () => {
    if (inFlight.current || !payload.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const data = await guestService.commitBatch(invitationId, payload.current);
      if (data?.committed !== true || data.batchId !== payload.current.batchId || ['importedCount', 'updatedCount', 'skippedCount', 'failedCount'].some(key => !Number.isInteger(data[key]) || data[key] < 0) || data.importedCount + data.updatedCount + data.skippedCount + data.failedCount !== payload.current.rows.length || !Array.isArray(data.rows) || data.rows.length !== payload.current.rows.length) throw new Error(L('Unconfirmed server result. Retry this same batch safely.', 'មិនអាចបញ្ជាក់លទ្ធផល។ សូមសាកល្បងបាច់ដដែល។'));
      setResult(data); setStep(4); setUncertain(false);
      try { await onFileImported?.(); } catch { setError(L('Import committed. Reopen Guests to refresh the list.', 'បាននាំចូល។ សូមបើកបញ្ជីភ្ញៀវឡើងវិញ។')); }
    } catch (failure) {
      const status = failure.response?.status;
      setUncertain(!status || status >= 500);
      setError(`${failure.message} ${L('No success is assumed. Retry this batch to retrieve its saved result.', 'មិនសន្មតថាជោគជ័យទេ។ សាកល្បងបាច់ដដែលដើម្បីពិនិត្យលទ្ធផល។')}`);
    } finally { inFlight.current = false; setBusy(false); }
  };
  const reviews = preview?.rows || [];
  const ready = reviews.filter(row => row.status === 'READY').length;
  const unresolved = reviews.filter(row => !['READY', 'SKIPPED'].includes(row.status));
  const visible = rows.map((row, index) => ({ ...row, index, review: reviews[index] })).filter(row => filter === 'all' || (filter === 'issues' && !['READY', 'SKIPPED'].includes(row.review?.status)) || (filter === 'skipped' && row.skip));
  const updateRow = (index, patch) => { setRows(current => current.map((row, i) => i === index ? { ...row, ...patch } : row)); setPreview(null); payload.current = null; };

  return <Modal isOpen={isOpen} onClose={close} title={L('Import guests', 'នាំចូលភ្ញៀវ')} subtitle={L('Preview your list before saving to this event.', 'ពិនិត្យបញ្ជីមុនរក្សាទុកទៅកម្មវិធីនេះ។')} size="lg" className="workspace-dialog" closeOnEscape={!busy} closeOnBackdropClick={!busy}>
    <div className="guest-import" aria-busy={busy}>
      <ol className="import-steps" aria-label={L('Import progress', 'ដំណាក់កាលនាំចូល')}>{steps.map((name, index) => <li key={name} aria-current={step === index ? 'step' : undefined}><span>{step > index ? <Check size={14} /> : index + 1}</span>{name}</li>)}</ol>
      {error && <p role="alert" className="import-error">{error}</p>}
      {busy && <p role="status">{L('Processing…', 'កំពុងដំណើរការ…')}</p>}
      {step === 0 && <>
        <section className="import-samples"><FileSpreadsheet size={28} /><div><h3>{L('Start with a sample', 'ចាប់ផ្តើមជាមួយគំរូ')}</h3><p>{L('Fictional examples. Replace or delete them before importing.', 'ទិន្នន័យគំរូប៉ុណ្ណោះ។ សូមជំនួស ឬលុបមុននាំចូល។')}</p></div><div className="import-actions">{['csv', 'xlsx'].map(ext => <a key={ext} className="workspace-button" download href={`/downloads/Koupreng-Guest-Import-Template.${ext}`}><Download size={16} />{ext.toUpperCase()}</a>)}</div></section>
        <label className="import-upload"><Upload size={28} /><strong>{L('Choose CSV or Excel workbook', 'ជ្រើសឯកសារ CSV ឬ Excel')}</strong><span>CSV / XLSX · 5 MB · {L('up to 1,000 rows', 'រហូតដល់ 1,000 ជួរដេក')}</span><input aria-label={L('Guest import file', 'ឯកសារនាំចូលភ្ញៀវ')} type="file" accept=".csv,.xlsx" disabled={busy} onChange={event => inspect(event.target.files?.[0])} /></label>
        <p className="import-help">{L('Keep phone columns as text so leading 0 stays intact. In Excel, import CSV phone columns as Text. Table labels are reference notes and do not assign seats.', 'រក្សាជួរទូរស័ព្ទជាអត្ថបទ ដើម្បីមិនបាត់លេខ 0។ ក្នុង Excel នាំចូល CSV ដោយកំណត់ទូរស័ព្ទជា Text។ ស្លាកតុជាព័ត៌មាន មិនមែនការចាត់កន្លែងអង្គុយ។')}</p>
        <details><summary>{L('Paste a guest list', 'បិទភ្ជាប់បញ្ជីភ្ញៀវ')}</summary><label className="import-field">{L('CSV text (include column headers)', 'អត្ថបទ CSV (មានចំណងជើងជួរឈរ)')}<textarea value={text} onChange={event => setText(event.target.value)} rows={5} placeholder={'guestName,phone,seatCount\nFictional Guest,012000001,2'} /></label><button className="workspace-button" disabled={busy || !text.trim()} onClick={() => inspect(new File([text], 'pasted-guests.csv', { type: 'text/csv' }))}>{L('Preview pasted list', 'ពិនិត្យបញ្ជីដែលបិទភ្ជាប់')}</button></details>
        <details className="import-sheets"><summary>Google Sheets</summary><p>{L('Download the XLSX sample, open it in Google Sheets, edit your copy, then use File → Download → CSV or Microsoft Excel and upload here. Keep the sheet private.', 'ទាញយកគំរូ XLSX បើកក្នុង Google Sheets កែសម្រួលច្បាប់ចម្លង រួចជ្រើស File → Download → CSV ឬ Microsoft Excel ហើយនាំចូលទីនេះ។ រក្សាឯកសារជាឯកជន។')}</p><button className="workspace-button" disabled>{L('Private Sheet import — not configured', 'នាំចូល Sheet ឯកជន — មិនទាន់កំណត់')}</button></details>
      </>}
      {step === 1 && <>
        <p><strong>{fileName}</strong> · {sheet?.rows.length} {L('rows', 'ជួរដេក')}</p>
        <label className="import-field">{L('Worksheet', 'សន្លឹកកិច្ចការ')}<select value={sheetIndex} disabled={busy} onChange={event => { const index = Number(event.target.value); setSheetIndex(index); setMapping(proposeImportMapping(source.worksheets[index].headers)); }}>{source.worksheets.map((item, index) => <option key={index} value={index}>{item.name}</option>)}</select></label>
        <p className="import-help">{L('Match each source column to one field, or ignore it. Ambiguous columns need your choice.', 'ផ្គូផ្គងជួរឈរទៅវាលមួយ ឬមិនយក។ ជួរមិនច្បាស់ត្រូវការជម្រើសរបស់អ្នក។')}</p>
        <div className="import-mapping">{sheet?.headers.map((header, index) => <label className="import-map-row" key={index}><span><strong>{header || L(`Column ${index + 1}`, `ជួរឈរ ${index + 1}`)}</strong><small>{sheet.rows[0]?.values[index] || '—'}</small></span><select aria-label={`${L('Map', 'ផ្គូផ្គង')} ${header || index + 1}`} value={mapping[index] || ''} onChange={event => setMapping(current => current.map((field, i) => i === index ? event.target.value : field))}><option value="">{L('Ignore column', 'មិនយកជួរឈរ')}</option>{IMPORT_FIELDS.map(([field, english, khmer]) => <option key={field} value={field}>{L(english, khmer)}</option>)}</select></label>)}</div>
        {mappingError(mapping) && <p role="status" className="import-help">{L(mappingError(mapping), 'សូមផ្គូផ្គងឈ្មោះភ្ញៀវ និងកុំជ្រើសវាលដដែលច្រើនដង។')}</p>}
        <div className="import-actions"><button className="workspace-button" disabled={busy} onClick={() => setStep(0)}>{L('Back', 'ត្រឡប់')}</button><button className="workspace-button primary" disabled={busy || !!mappingError(mapping) || !sheet?.rows.length} onClick={() => validate(mapImportRows(sheet, mapping))}>{L('Validate rows', 'ពិនិត្យទិន្នន័យ')}</button></div>
      </>}
      {step === 2 && <>
        <p role="status">{L('Nothing has been imported yet.', 'មិនទាន់បាននាំចូលទេ។')} {ready} {L('ready', 'រួចរាល់')} · {unresolved.length} {L('need review', 'ត្រូវពិនិត្យ')} · {rows.filter(row => row.skip).length} {L('skipped', 'រំលង')}</p>
        <div className="import-toolbar"><label>{L('Show rows', 'បង្ហាញជួរដេក')}<select value={filter} onChange={event => { setFilter(event.target.value); setPage(0); }}><option value="all">{L('All rows', 'ទាំងអស់')}</option><option value="issues">{L('Needs review', 'ត្រូវពិនិត្យ')}</option><option value="skipped">{L('Skipped', 'រំលង')}</option></select></label><button className="workspace-button" disabled={busy || !preview || !unresolved.length} onClick={() => validate(rows.map((row, index) => unresolved.some(item => item.rowNumber === reviews[index]?.rowNumber) ? { ...row, skip: true } : row))}>{L('Skip rows needing review', 'រំលងជួរដែលត្រូវពិនិត្យ')}</button></div>
        <div className="import-preview">{visible.slice(page * 25, (page + 1) * 25).map(row => <article key={row.rowNumber} className="import-row"><div><strong>{L('Row', 'ជួរ')} {row.rowNumber} · {row.guest.guestName || L('Name missing', 'ខ្វះឈ្មោះ')}</strong><span className="workspace-badge">{row.skip ? L('Skipped', 'រំលង') : row.review?.status === 'READY' ? L('Ready', 'រួចរាល់') : L('Review', 'ពិនិត្យ')}</span></div><p>{[row.guest.phone, row.guest.email, `${row.guest.seatCount || 1} ${L('seats', 'កន្លែង')}`].filter(Boolean).join(' · ')}</p>{[...(row.review?.issues || []), ...row.sourceIssues].map((issue, i) => <p className="import-row-issue" key={i}>{importIssueLabel(issue, en)}</p>)}<div className="import-actions"><label><input type="checkbox" checked={row.skip} disabled={busy || !!row.sourceIssues.length} onChange={event => updateRow(row.index, { skip: event.target.checked })} />{L('Skip', 'រំលង')}</label>{row.review?.status === 'NAME_MATCH' && <button className="workspace-button" disabled={busy} onClick={() => updateRow(row.index, { allowNameMatch: true })}>{L('Create separate guest with same name', 'បង្កើតភ្ញៀវផ្សេងដែលមានឈ្មោះដូចគ្នា')}</button>}<button className="workspace-button" disabled={busy || !!row.sourceIssues.length} onClick={() => setEditing(editing === row.index ? null : row.index)}>{L('Correct row', 'កែជួរដេក')}</button></div>{editing === row.index && <div className="import-corrections">{IMPORT_FIELDS.map(([field, english, khmer]) => <label className="import-field" key={field}>{L(english, khmer)}<input value={row.guest[field]} onChange={event => updateRow(row.index, { guest: { ...row.guest, [field]: event.target.value } })} /></label>)}</div>}</article>)}</div>
        {visible.length > 25 && <div className="import-actions"><button className="workspace-button" disabled={!page} onClick={() => setPage(p => p - 1)}>{L('Previous', 'មុន')}</button><span>{page + 1} / {Math.ceil(visible.length / 25)}</span><button className="workspace-button" disabled={(page + 1) * 25 >= visible.length} onClick={() => setPage(p => p + 1)}>{L('Next', 'បន្ទាប់')}</button></div>}
        <div className="import-actions"><button className="workspace-button" disabled={busy} onClick={() => setStep(1)}>{L('Back to mapping', 'ត្រឡប់ទៅផ្គូផ្គង')}</button><button className="workspace-button" disabled={busy} onClick={() => validate(rows)}>{L('Revalidate', 'ពិនិត្យឡើងវិញ')}</button><button className="workspace-button primary" disabled={busy || !preview || !!unresolved.length || !ready} onClick={() => setStep(3)}>{L('Review import', 'ពិនិត្យការនាំចូល')}</button></div>
      </>}
      {step === 3 && <section className="import-confirm"><h3>{L(`Import ${ready} new guests?`, `នាំចូលភ្ញៀវថ្មី ${ready} នាក់?`)}</h3><p>{L(`${rows.filter(row => row.skip).length} rows skipped. Existing guests, RSVP, QR, seating and gifts are preserved.`, `រំលង ${rows.filter(row => row.skip).length} ជួរ។ ទិន្នន័យភ្ញៀវចាស់ RSVP QR កន្លែងអង្គុយ និងអំណោយត្រូវបានរក្សាទុក។`)}</p><p>{L('All selected rows save in one transaction. A failed transaction imports none. Retrying this batch returns its recorded result.', 'ជួរដែលជ្រើសត្រូវបានរក្សាទុកក្នុងប្រតិបត្តិការតែមួយ។ បើបរាជ័យ គ្មានជួរណាត្រូវបាននាំចូលទេ។ សាកល្បងបាច់ដដែលនឹងទទួលលទ្ធផលដែលបានរក្សាទុក។')}</p><div className="import-actions"><button className="workspace-button" disabled={busy || uncertain} onClick={() => setStep(2)}>{L('Back', 'ត្រឡប់')}</button><button className="workspace-button primary" disabled={busy} onClick={commit}>{uncertain ? L('Retry same batch', 'សាកល្បងបាច់ដដែល') : L('Confirm import', 'បញ្ជាក់នាំចូល')}</button></div></section>}
      {step === 4 && result && <section className="import-confirm" role="status"><Check size={32} /><h3>{L('Import saved to this event', 'បាននាំចូលទៅកម្មវិធីនេះ')}</h3><p>{L('Imported', 'បាននាំចូល')}: {result.importedCount} · {L('Updated', 'បានកែប្រែ')}: {result.updatedCount} · {L('Skipped', 'រំលង')}: {result.skippedCount} · {L('Failed', 'បរាជ័យ')}: {result.failedCount}</p><div className="import-actions">{result.skippedCount > 0 && <button className="workspace-button" onClick={() => downloadImportErrors(result.rows)}><Download size={16} />{L('Download error report', 'ទាញយករបាយការណ៍កំហុស')}</button>}<button className="workspace-button" onClick={reset}>{L('Import another file', 'នាំចូលឯកសារផ្សេង')}</button><button className="workspace-button primary" onClick={onClose}>{L('View guests', 'មើលភ្ញៀវ')}</button></div></section>}
    </div>
  </Modal>;
}
