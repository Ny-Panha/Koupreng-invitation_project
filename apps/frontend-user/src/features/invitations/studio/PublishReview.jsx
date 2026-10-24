import Modal from '@/shared/ui/Modal';
import { ReadinessChecklist } from './StudioGuide';

export default function PublishReview({ open, onClose, onConfirm, onCheck, onField, checks, english, publishing, error, visibility, published }) {
  const ready = checks.every(check => check.complete);
  return <Modal isOpen={open} onClose={publishing ? undefined : onClose} className="workspace-dialog" size="md"
    title={english ? 'Review publication' : 'ពិនិត្យការផ្សព្វផ្សាយ'} closeOnEscape={!publishing} closeOnBackdropClick={!publishing}>
    <ReadinessChecklist checks={checks} english={english} onField={publishing ? undefined : onField}/>
    <p>{english ? `Visibility: ${visibility || 'PUBLIC'}. Publishing saves the current draft and makes the invitation available under these access rules. Later successful edits update the published invitation.` : `ភាពមើលឃើញ៖ ${visibility || 'PUBLIC'}។ ការផ្សព្វផ្សាយរក្សាទុកពង្រាង និងអនុញ្ញាតឱ្យមើលតាមសិទ្ធិនេះ។ ការកែប្រែដែលរក្សាទុកជោគជ័យនឹងធ្វើបច្ចុប្បន្នភាពធៀបអញ្ជើញ។`}</p>
    <p>{english ? 'Guest links follow the existing visibility and RSVP settings. A private or protected invitation still requires its configured access.' : 'តំណភ្ញៀវគោរពតាមការកំណត់ភាពមើលឃើញ និង RSVP។ ធៀបឯកជននៅតែត្រូវការសិទ្ធិដែលបានកំណត់។'}</p>
    {error && <p role="alert">{error}</p>}
    {error && onCheck && <button type="button" disabled={publishing} onClick={onCheck}>{english ? 'Check publication status' : 'ពិនិត្យស្ថានភាពផ្សព្វផ្សាយ'}</button>}
    <div className="studio-guide-navigation"><button type="button" disabled={publishing} onClick={onClose}>{english ? 'Keep editing' : 'បន្តកែសម្រួល'}</button><button type="button" className="workspace-button primary" disabled={!ready || publishing || published} onClick={onConfirm}>{english ? (publishing ? 'Publishing…' : 'Confirm publication') : (publishing ? 'កំពុងផ្សព្វផ្សាយ…' : 'បញ្ជាក់ការផ្សព្វផ្សាយ')}</button></div>
  </Modal>;
}
