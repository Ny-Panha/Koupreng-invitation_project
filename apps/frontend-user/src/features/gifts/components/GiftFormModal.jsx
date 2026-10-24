import { useEffect, useRef, useId } from 'react';
import Modal from '@/shared/ui/Modal';
import { GuestSelectField } from './GuestSelectField';

export default function GiftFormModal({ show, editingId, form, guestOptions, gifts, updateForm, submitGift, resetForm, isDuplicateGift, saving, error, t, lang }) {
  const body = useRef(null), en = lang === 'en';
  const formId = useId();
  useEffect(() => { if (show) requestAnimationFrame(() => body.current?.querySelector('[data-gift-name-input]')?.focus()); }, [show]);
  return <Modal isOpen={show} onClose={saving ? undefined : resetForm} title={editingId ? t('editBtn') : t('addBtn')} subtitle={en ? 'A host-entered gift record. Bank payments are not verified here.' : 'កំណត់ត្រាអំណោយដោយម្ចាស់កម្មវិធី។ មិនមែនការផ្ទៀងផ្ទាត់ការទូទាត់ពីធនាគារ។'} className="workspace-dialog" size="lg" closeOnEscape={!saving} closeOnBackdropClick={!saving}
    footer={<><button type="button" className="workspace-button" disabled={saving} onClick={resetForm}>{t('cancelBtn')}</button><button type="submit" form={formId} className="workspace-button primary" disabled={saving || !form.name.trim() || isDuplicateGift}>{saving ? t('savingText') : editingId ? t('saveBtn') : t('addItemBtn')}</button></>}>
    <form id={formId} ref={body} className="workspace-form gift-form" onSubmit={submitGift} aria-busy={saving}>
      <div className="gift-name-field"><span>{t('colName')} *</span><GuestSelectField value={form.name} guestId={form.guestId} options={guestOptions} existingGifts={gifts.filter(g => g.id !== editingId)} onChange={({ name, guestId }) => { updateForm('name', name); updateForm('guestId', guestId); }} placeholder={t('placeholderName')} ariaLabel={t('colName')} t={t} /></div>
      {isDuplicateGift && <p role="alert">{t('alreadyGiven')}</p>}
      <div className="workspace-form-grid"><label><span>{t('colAmount')}<span aria-hidden="true"> *</span></span><input aria-label={t('colAmount')} type="number" required min="0" max="9999999999.99" step="0.01" value={form.amount} onChange={e => updateForm('amount', e.target.value)} /></label><label>{en ? 'Currency' : 'រូបិយប័ណ្ណ'}<select value={form.currency || 'USD'} onChange={e => updateForm('currency', e.target.value)}><option value="USD">USD</option><option value="KHR">KHR</option></select></label></div>
      <div className="workspace-form-grid"><label>{t('colMethod')}<select value={form.method} onChange={e => updateForm('method', e.target.value)}><option value="Cash">{en ? 'Cash' : 'សាច់ប្រាក់'}</option><option value="ABA">ABA</option><option value="Bakong QR">Bakong QR</option>{!['Cash','ABA','Bakong QR'].includes(form.method) && <option value={form.method}>{form.method}</option>}</select></label><label>{t('colDate')}<input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} /></label></div>
      <label>{t('colNote')}<textarea rows={3} maxLength={2000} value={form.note} onChange={e => updateForm('note', e.target.value)} /></label>
      {error && <p className="workspace-notice" role="alert">{error} {en ? 'Your entries are retained.' : 'ទិន្នន័យរបស់អ្នកនៅតែមាន។'}</p>}
    </form>
  </Modal>;
}
