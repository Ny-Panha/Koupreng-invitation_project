import { useState } from 'react';
import { Eye, EyeOff, Globe, KeyRound, Lock } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { ReadinessChecklist } from './StudioGuide';

const VISIBILITY_OPTIONS = [
  {
    value: 'PUBLIC',
    Icon: Globe,
    en: 'Public link',
    km: 'សាធារណៈ (បើកតាមតំណ)',
    descEn: 'Anyone with the invitation URL or QR code can open and RSVP.',
    descKm: 'ភ្ញៀវណាក៏អាចបើកមើល និងឆ្លើយតប RSVP តាមតំណភ្ជាប់ ឬ QR បាន។',
  },
  {
    value: 'PRIVATE',
    Icon: Lock,
    en: 'Private (personal guest links only)',
    km: 'ឯកជន (សម្រាប់តែតំណភ្ញៀវផ្ទាល់ខ្លួន)',
    descEn: 'Only guests with personalized invite tokens or the owner can view.',
    descKm: 'មានតែភ្ញៀវដែលមានតំណភ្ជាប់ផ្ទាល់ខ្លួន និងម្ចាស់កម្មវិធីប៉ុណ្ណោះអាចបើកមើលបាន។',
  },
  {
    value: 'PASSWORD_PROTECTED',
    Icon: KeyRound,
    en: 'Password protected',
    km: 'ការពារដោយពាក្យសម្ងាត់',
    descEn: 'Guests must enter this shared password or use their personal guest link.',
    descKm: 'ភ្ញៀវត្រូវបញ្ចូលពាក្យសម្ងាត់ ឬប្រើតំណភ្ជាប់ផ្ទាល់ខ្លួនដើម្បីចូលមើល។',
  },
];

export default function PublishReview({
  open,
  onClose,
  onConfirm,
  onCheck,
  onField,
  checks,
  english,
  publishing,
  error,
  visibility = 'PUBLIC',
  onVisibilityChange,
  accessPassword = '',
  onPasswordChange,
  hasSavedPassword = false,
  previewUrl = '',
  published,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const currentVisibility = visibility || 'PUBLIC';
  const passwordMissing = currentVisibility === 'PASSWORD_PROTECTED' && !hasSavedPassword && !String(accessPassword || '').trim();
  const ready = checks.every((check) => check.complete) && !passwordMissing;

  return (
    <Modal
      isOpen={open}
      onClose={publishing ? undefined : onClose}
      className="workspace-dialog"
      size="md"
      title={english ? 'Review publication' : 'ពិនិត្យការផ្សព្វផ្សាយ'}
      closeOnEscape={!publishing}
      closeOnBackdropClick={!publishing}
    >
      <div className="studio-publish-review-body">
        <ReadinessChecklist checks={checks} english={english} onField={publishing ? undefined : onField} />

        <fieldset className="studio-access-fieldset" disabled={publishing}>
          <legend>{english ? 'Guest access & privacy' : 'ការកំណត់សិទ្ធិមើលរបស់ភ្ញៀវ'}</legend>
          <div className="studio-access-options" role="radiogroup" aria-label={english ? 'Invitation visibility' : 'ភាពមើលឃើញនៃសំបុត្រអញ្ជើញ'}>
            {VISIBILITY_OPTIONS.map((opt) => {
              const Icon = opt.Icon;
              const selected = currentVisibility === opt.value;
              return (
                <label key={opt.value} className={`studio-access-option${selected ? ' is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="publish-review-visibility"
                    value={opt.value}
                    checked={selected}
                    onChange={() => onVisibilityChange?.(opt.value)}
                  />
                  <span className="studio-access-option-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="studio-access-option-copy">
                    <strong>{english ? opt.en : opt.km}</strong>
                    <small>{english ? opt.descEn : opt.descKm}</small>
                  </span>
                </label>
              );
            })}
          </div>

          {currentVisibility === 'PASSWORD_PROTECTED' && (
            <div className="studio-access-password-box">
              <label htmlFor="publish-review-password">
                {english ? 'Invitation access password' : 'ពាក្យសម្ងាត់ចូលមើលសំបុត្រអញ្ជើញ'}
              </label>
              <div className="studio-access-password-input-wrap">
                <input
                  id="publish-review-password"
                  type={showPassword ? 'text' : 'password'}
                  value={accessPassword}
                  onChange={(e) => onPasswordChange?.(e.target.value)}
                  autoComplete="new-password"
                  placeholder={hasSavedPassword
                    ? (english ? 'Leave blank to keep saved password, or enter new…' : 'ទុកទទេដើម្បីរក្សាពាក្យសម្ងាត់ចាស់ ឬវាយថ្មី…')
                    : (english ? 'Enter password for guests (required)' : 'បញ្ចូលពាក្យសម្ងាត់សម្រាប់ភ្ញៀវ (ចាំបាច់)')}
                  aria-invalid={passwordMissing}
                />
                <button
                  type="button"
                  className="studio-password-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? (english ? 'Hide password' : 'លាក់ពាក្យសម្ងាត់') : (english ? 'Show password' : 'បង្ហាញពាក្យសម្ងាត់')}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
              {hasSavedPassword && !accessPassword?.trim() && (
                <small className="studio-access-saved-hint">
                  {english ? 'A password is already configured on the server.' : 'មានពាក្យសម្ងាត់ត្រូវបានកំណត់រួចលើម៉ាស៊ីនមេ។'}
                </small>
              )}
              {passwordMissing && (
                <p className="studio-access-inline-alert" role="alert">
                  {english ? 'Set an access password before publishing in Password Protected mode.' : 'សូមកំណត់ពាក្យសម្ងាត់មុនពេលផ្សព្វផ្សាយក្នុងរបៀបការពារដោយពាក្យសម្ងាត់។'}
                </p>
              )}
            </div>
          )}
        </fieldset>

        {previewUrl && (
          <div className="studio-access-url-preview">
            <span>{english ? 'Public address preview' : 'តំណភ្ជាប់សាធារណៈ'}</span>
            <code>{previewUrl}</code>
          </div>
        )}

        <p className="studio-publish-note">
          {english
            ? `Visibility: ${currentVisibility}. Publishing saves the current draft and makes the invitation available under these access rules. Later successful edits update the published invitation.`
            : `ភាពមើលឃើញ៖ ${currentVisibility}។ ការផ្សព្វផ្សាយរក្សាទុកពង្រាង និងអនុញ្ញាតឱ្យមើលតាមសិទ្ធិនេះ។ ការកែប្រែដែលរក្សាទុកជោគជ័យនឹងធ្វើបច្ចុប្បន្នភាពសំបុត្រអញ្ជើញ។`}
        </p>

        {error && <p className="studio-access-inline-alert" role="alert">{error}</p>}
        {error && onCheck && (
          <button type="button" className="workspace-button" disabled={publishing} onClick={onCheck}>
            {english ? 'Check publication status' : 'ពិនិត្យស្ថានភាពផ្សព្វផ្សាយ'}
          </button>
        )}

        <div className="studio-guide-navigation">
          <button type="button" disabled={publishing} onClick={onClose}>
            {english ? 'Keep editing' : 'បន្តកែសម្រួល'}
          </button>
          <button type="button" className="workspace-button primary" disabled={publishing || (published ? passwordMissing : !ready)} onClick={onConfirm}>
            {published
              ? (english ? (publishing ? 'Saving…' : 'Save access settings') : (publishing ? 'កំពុងរក្សាទុក…' : 'រក្សាទុកការកំណត់សិទ្ធិ'))
              : (english ? (publishing ? 'Publishing…' : 'Confirm publication') : (publishing ? 'កំពុងផ្សព្វផ្សាយ…' : 'បញ្ជាក់ការផ្សព្វផ្សាយ'))}
          </button>
        </div>
      </div>
    </Modal>
  );
}
