import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEventWorkspace } from "../workspace/EventContext";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { eventPath } from "../workspace/eventRoutes";
import { eventPayload } from "./eventFields";
import EventFields from "./EventFields.jsx";
import StudioGuide from '@/features/invitations/studio/StudioGuide';
import SaveTheDateEditor from '@/features/invitations/studio/SaveTheDateEditor';
import WeddingProgramEditor from '@/features/invitations/studio/WeddingProgramEditor';
import PreWeddingVideoEditor from '@/features/invitations/studio/PreWeddingVideoEditor';
import { eventPresentationFields } from '@/features/templates/shared/eventPresentation';
import PublishReview from '@/features/invitations/studio/PublishReview';
import { publishReadiness } from '@/features/invitations/studio/publishReadiness';
import { useStudioPersistence } from '@/features/invitations/studio/useStudioPersistence';
import '@/features/invitations/studio/InvitationStudio.css';
import './EventDetails.css';

function readContent(value) {
  try { const parsed = JSON.parse(value || "{}"); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; }
  catch { return {}; }
}

export default function EventDetails() {
  const uiCopy = useUiCopy();
  const { event, eventId, updateEvent, isOwner } = useEventWorkspace();
  const workspace = useEventWorkspace(), navigate = useNavigate(), [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'guided' ? 'guided' : 'advanced');
  const [step, setStep] = useState(0), [review, setReview] = useState(false), [publishing, setPublishing] = useState(false);
  const revision = useRef(event.updatedAt);
  const settingsForm = useRef(null);
  const [form, setForm] = useState(() => {
    const content = readContent(event.contentJson);
    return { ...event, ...eventPresentationFields(content), preWeddingVideo: content.preWeddingVideo, saveTheDate: content.saveTheDate || { enabled: false }, venueAddress: event.venueAddress ?? content.venueAddress ?? content.event?.venueAddress ?? '',
      googleMapUrl: event.googleMapUrl ?? content.googleMapUrl ?? content.event?.mapLink ?? '' };
  });
  const [content] = useState(() => readContent(event.contentJson));
  const [contact, setContact] = useState(content.contact || {});
  const [schedule, setSchedule] = useState(Array.isArray(content.schedule) ? content.schedule : []);
  const generic = event.templateCode === "event-essential";
  const [error, setError] = useState("");
  const en = useLanguageStore(s => s.lang) === "en";
  const persistence = useStudioPersistence({ value: { form, contact, schedule }, enabled: false, english: en,
    onRestore: value => { setForm(value.form); setContact(value.contact); setSchedule(value.schedule); },
    persist: async () => {
      if (form.visibility !== event.visibility && !window.confirm(en ? 'Change who can access this invitation?' : 'ប្ដូរសិទ្ធិមើលសំបុត្រអញ្ជើញនេះឬ?')) {
        return { synced: false, error: en ? 'Access change cancelled. Your edits are still here.' : 'បានបោះបង់ការប្ដូរសិទ្ធិមើល។ ការកែប្រែរបស់អ្នកនៅទីនេះ។' };
      }
      const payload = { ...eventPayload(form, event.eventType), expectedUpdatedAt: revision.current };
      if (generic) payload.contentJson = JSON.stringify({ ...readContent(payload.contentJson), ...eventPresentationFields(form), ...(form.preWeddingVideo ? { preWeddingVideo: form.preWeddingVideo } : {}), eventDate: form.eventDate, eventTime: form.eventTime || '', messageText: form.storyText || "", contact, schedule });
      if (generic) payload.enabledSections = JSON.stringify({ ...readContent(payload.enabledSections), countdown: form.saveTheDate?.enabled !== false, schedule: form.showSchedule !== false });
      const saved = await invitationService.update(eventId, payload, { suppressAuthRedirect: true });
      revision.current = saved.updatedAt; updateEvent(saved); return { synced: true };
    },
  });
  const saving = persistence.phase === 'saving', saved = persistence.phase === 'saved' && !persistence.dirty && persistence.version > 0;
  const checks = publishReadiness(eventPayload(form,event.eventType),event.eventType);
  const published = event.status === 'PUBLISHED';
  const publishedUrl = published && event.slug ? `${window.location.origin}/i/${encodeURIComponent(event.slug)}` : '';
  const blocked = ['conflict','expired'].includes(persistence.phase);
  const go = async module => { if (await persistence.flush()) navigate(eventPath(eventId,module)); };
  const field = check => { setMode('guided'); setStep(0); setReview(false); requestAnimationFrame(() => document.getElementById(`event-${check.key}`)?.focus()); };
  async function publish() {
    if (publishing || isOwner === false) return;
    setPublishing(true); setError('');
    try {
      if (!await persistence.flush()) return;
      const result = await invitationService.publish(eventId);
      if (result.status !== 'PUBLISHED' || !result.slug) throw new Error(en ? 'Publication could not be confirmed. Check its status.' : 'មិនអាចបញ្ជាក់ការផ្សព្វផ្សាយ។ សូមពិនិត្យស្ថានភាព។');
      revision.current = result.updatedAt; updateEvent(result); setReview(false); setStep(4);
    } catch (err) { setError(err.message); }
    finally { setPublishing(false); }
  }
  async function checkPublication() {
    try { const result = await invitationService.get(eventId); if (result.status === 'PUBLISHED') { revision.current=result.updatedAt; updateEvent(result); setReview(false); setStep(4); } else setError(en ? 'The server has not confirmed publication. Review before trying again.' : 'ម៉ាស៊ីនមេមិនទាន់បញ្ជាក់ការផ្សព្វផ្សាយ។ សូមពិនិត្យមុនព្យាយាមម្ដងទៀត។'); }
    catch (err) { setError(err.message); }
  }
  function downloadEdits() {
    const blob = new Blob([JSON.stringify({ ...eventPayload(form,event.eventType), contact, schedule },null,2)], { type: 'application/json' });
    const url=URL.createObjectURL(blob), link=document.createElement('a'); link.href=url; link.download=`event-${eventId}-unsaved-private.json`; link.click(); URL.revokeObjectURL(url);
  }
  const save = async e => {
    e.preventDefault(); setError('');
    if (!settingsForm.current?.reportValidity()) return;
    await persistence.save();
  };
  return <main className="event-wizard event-settings workspace-page"><header className="workspace-page-heading"><div><h1>{en ? "Event settings" : "ការកំណត់កម្មវិធី"}</h1><p>{en ? 'Keep your invitation details, venue and visibility up to date.' : 'កែព័ត៌មានធៀប ទីកន្លែង និងការមើលកម្មវិធីរបស់អ្នក។'}</p></div><Link className="workspace-button" to={eventPath(eventId, 'invitation')}>{en ? 'Open invitation Studio' : 'បើករចនាធៀប'}</Link></header>
    <StudioGuide mode={mode} onMode={setMode} step={step} onStep={value => { setStep(value); requestAnimationFrame(() => document.getElementById('studio-guide-heading')?.focus()); }} sections={['eventInfo','invitation']} activeSection={step === 0 ? 'eventInfo' : 'invitation'} onSection={value => setStep(value === 'eventInfo' ? 0 : 1)} english={en} checks={checks} onField={field} onPreview={() => go('preview')} onGuests={() => go('guests')} onRsvp={() => go('rsvp')} onPublish={() => setReview(true)} published={published} publishedUrl={publishedUrl} saving={saving || publishing || blocked} canPublish={isOwner !== false} canManageGuests={workspace.can?.('MANAGE_GUESTS') !== false} />
    {(error || persistence.error) && <div role="alert"><p>{error || persistence.error}</p>{persistence.dirty && <button type="button" className="workspace-button" onClick={downloadEdits}>{en ? 'Download private unsaved edits' : 'ទាញយកការកែប្រែមិនទាន់រក្សាទុក'}</button>}{blocked && <button type="button" className="workspace-button" onClick={() => window.location.reload()}>{en ? 'Reload latest event' : 'ផ្ទុកកម្មវិធីចុងក្រោយឡើងវិញ'}</button>}</div>}
    <nav className="event-settings-nav" aria-label={en ? 'Settings sections' : 'ផ្នែកការកំណត់'}>
      <a href="#settings-general">{en ? 'General' : 'ព័ត៌មានទូទៅ'}</a><a href="#settings-access">{en ? 'Privacy & access' : 'ឯកជនភាព និងសិទ្ធិ'}</a><a href="#settings-rsvp">{en ? 'RSVP & guests' : 'ការឆ្លើយតប និងភ្ញៀវ'}</a><a href="#settings-team">{en ? 'Team' : 'ក្រុមការងារ'}</a>
    </nav>
    <form ref={settingsForm} onSubmit={save} aria-busy={saving} noValidate>
    <div id="settings-general" hidden={mode === 'guided' && step !== 0}><EventFields grouped draft form={form} setForm={setForm} type={event.eventType} en={en} /></div>
    {/https?:\/\//i.test(form.venueAddress || '') && <p className="workspace-notice">{en ? 'The saved address contains a link. Review the address and Maps link separately before changing them.' : 'អាសយដ្ឋានដែលរក្សាទុកមានតំណភ្ជាប់។ សូមពិនិត្យអាសយដ្ឋាន និងតំណផែនទីដោយឡែកមុនកែប្រែ។'}</p>}
    <div hidden={mode === 'guided' && step !== 1}>{generic && <>
      <SaveTheDateEditor form={form} english={en} showEventFields={false} onChange={patch => setForm(current => ({ ...current, ...patch }))} />
      <label>{en ? "Invitation message or description (optional)" : "សារអញ្ជើញ ឬការពិពណ៌នា (មិនបាច់បំពេញ)"}<textarea maxLength={5000} value={form.storyText || ""} onChange={e => setForm(current => ({ ...current, storyText: e.target.value }))} /></label>
      <label>{en ? "Invitation language" : "ភាសាសំបុត្រអញ្ជើញ"}<select value={form.languageMode || "KH"} onChange={e => setForm(current => ({ ...current, languageMode: e.target.value }))}><option value="KH">{uiCopy("ភាសាខ្មែរ", "Khmer")}</option><option value="EN">{uiCopy("ភាសាអង់គ្លេស", "English")}</option><option value="BOTH">{uiCopy("ភាសាខ្មែរ និងអង់គ្លេស", "Khmer and English")}</option></select></label>
      <fieldset><legend>{en ? "Contact (optional)" : "ទំនាក់ទំនង (មិនបាច់បំពេញ)"}</legend>
        {[["name", "ឈ្មោះទំនាក់ទំនង", "Contact name", "text"], ["phone", "លេខទូរស័ព្ទ", "Phone", "tel"], ["email", "អ៊ីមែល", "Email", "email"]].map(([key, kh, english, type]) =>
          <label key={key}>{en ? english : kh}<input type={type} maxLength={key === "phone" ? 30 : 255} value={contact[key] || ""} onChange={e => setContact(current => ({ ...current, [key]: e.target.value }))} /></label>)}
      </fieldset>
      {event.eventType === 'WEDDING' ? <WeddingProgramEditor english={en} value={schedule} programDays={form.programDays} masterDate={form.eventDate}
        enabled={form.showSchedule !== false} onEnabled={value => setForm(current => ({ ...current, showSchedule: value }))}
        onChange={(rows, days) => { setSchedule(rows); setForm(current => ({ ...current, programDays: days })); }} /> : <fieldset><legend>{en ? "Schedule (optional)" : "កាលវិភាគ (មិនបាច់បំពេញ)"}</legend>
        {schedule.map((item, index) => <div className="event-wizard-card" key={index}>
          <label>{en ? "Time" : "ម៉ោង"}<input type="time" value={item.time || ""} onChange={e => setSchedule(current => current.map((row, i) => i === index ? { ...row, time: e.target.value } : row))} /></label>
          <label>{en ? "Activity" : "សកម្មភាព"}<input required maxLength={255} value={item.title || ""} onChange={e => setSchedule(current => current.map((row, i) => i === index ? { ...row, title: e.target.value } : row))} /></label>
          <button type="button" onClick={() => setSchedule(current => current.filter((_, i) => i !== index))}>{en ? "Remove activity" : "លុបសកម្មភាព"}</button>
        </div>)}
        <button type="button" disabled={schedule.length >= 20} onClick={() => setSchedule(current => [...current, { time: "", title: "" }])}>{en ? "Add activity" : "បន្ថែមសកម្មភាព"}</button>
      </fieldset>}
      <details className="studio-subsection"><summary>{en ? 'Media & Opening' : 'មេឌៀ និងការបើកធៀប'}</summary><div className="studio-subsection-body"><PreWeddingVideoEditor eventId={eventId} value={form.preWeddingVideo} english={en} onChange={value => setForm(current => ({ ...current, preWeddingVideo: value }))} /></div></details>
    </>}{!generic && <p>{en ? 'Design artwork and optional media in the invitation and media tools.' : 'រចនារូបភាព និងមាតិកាជាជម្រើសក្នុងឧបករណ៍រចនា និងរូបភាព។'}</p>}<Link className="workspace-button" to={eventPath(eventId,'media')}>{en ? 'Media tools' : 'ឧបករណ៍រូបភាព'}</Link></div>
    <fieldset id="settings-access" hidden={mode === 'guided' && step !== 0} disabled={isOwner === false} className="event-settings-section"><legend>{en ? 'Privacy & access' : 'ឯកជនភាព និងសិទ្ធិ'}</legend><p>{isOwner === false ? (en ? 'Only the event owner can change access settings.' : 'មានតែម្ចាស់កម្មវិធីអាចប្ដូរសិទ្ធិមើលបាន។') : (en ? 'Private invitations require their access link. Public invitations become discoverable after publication. Changes apply when you save.' : 'ការប្ដូរសិទ្ធិមើលមានប្រសិទ្ធភាពពេលរក្សាទុក។')}</p><label>{en ? "Invitation visibility" : "ការមើលសំបុត្រអញ្ជើញ"}<select value={form.visibility || "PRIVATE"} onChange={e => setForm(current => ({ ...current, visibility: e.target.value }))}>
      <option value="PRIVATE">{en ? "Private" : "ឯកជន"}</option><option value="PUBLIC">{en ? "Public when published" : "សាធារណៈពេលផ្សាយ"}</option><option value="PASSWORD_PROTECTED">{en ? "Password protected" : "ការពារដោយពាក្យសម្ងាត់"}</option>
    </select></label>
    {form.visibility === "PASSWORD_PROTECTED" && <label>{en ? "Invitation password (leave blank to keep the current password)" : "ពាក្យសម្ងាត់សំបុត្រអញ្ជើញ (ទុកទទេដើម្បីរក្សាពាក្យសម្ងាត់ចាស់)"}<input type="password" autoComplete="new-password" value={form.accessPassword || ""} onChange={e => setForm(current => ({ ...current, accessPassword: e.target.value }))} /></label>}
    </fieldset>
    <fieldset id="settings-rsvp" hidden={mode === 'guided' && step !== 0} disabled={isOwner === false} className="event-settings-section"><legend>{en ? 'RSVP & guests' : 'ការឆ្លើយតប និងភ្ញៀវ'}</legend><p>{en ? 'Set an optional response deadline. Manage individual responses in RSVP.' : 'កំណត់ថ្ងៃផុតកំណត់សម្រាប់ការឆ្លើយតប និងគ្រប់គ្រងចម្លើយក្នុងផ្នែក RSVP។'}</p><label htmlFor="settings-rsvp-deadline">{en ? 'RSVP deadline' : 'ថ្ងៃផុតកំណត់ឆ្លើយតប'}<input id="settings-rsvp-deadline" type="date" max={form.eventDate || undefined} value={form.rsvpDeadline || ''} onChange={e => setForm(current => ({ ...current, rsvpDeadline: e.target.value || null }))} /></label></fieldset>
    <section id="settings-team" className="event-settings-section"><h2>{en ? 'Team & permissions' : 'ក្រុមការងារ និងសិទ្ធិ'}</h2><p>{en ? 'Manage collaborators and their roles in your event team.' : 'គ្រប់គ្រងសមាជិក និងតួនាទីក្នុងក្រុមការងាររបស់កម្មវិធី។'}</p><Link className="workspace-button" to={eventPath(eventId, 'team')}>{en ? 'Open event team' : 'បើកក្រុមការងារ'}</Link></section>
    <div className="event-settings-save"><button className="workspace-button primary" disabled={saving || blocked} type="submit">{saving ? en ? "Saving…" : "កំពុងរក្សាទុក…" : en ? "Save details" : "រក្សាទុក"}</button><span role="status">{saved ? en ? 'Saved to event' : 'បានរក្សាទុកទៅកម្មវិធី' : persistence.dirty ? en ? 'Unsaved changes' : 'មិនទាន់រក្សាទុកការកែប្រែ' : ''}</span>{isOwner !== false && !published && <button type="button" className="workspace-button" onClick={() => setReview(true)} disabled={saving || blocked}>{en ? 'Review publication' : 'ពិនិត្យមុនផ្សព្វផ្សាយ'}</button>}</div></form>
    <PublishReview open={review} onClose={() => setReview(false)} onConfirm={publish} onCheck={checkPublication} onField={field} checks={checks} english={en} publishing={publishing} error={error || persistence.error} visibility={form.visibility} published={published} />
  </main>;
}
