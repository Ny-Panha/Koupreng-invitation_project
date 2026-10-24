import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, Images, Music, Palette, Upload, Video } from 'lucide-react';
import { mediaService } from '@/features/invitations/api/mediaApi';
import { invitationService } from '@/features/invitations/api/invitationApi';
import { useBackendMessages } from '@/shared/i18n/useBackendMessages';
import { useEventWorkspace } from '@/features/events/workspace/EventContext';
import { toast } from '@/shared/ui';
import { invitationMediaReferences, MEDIA_CATEGORIES, validateLibraryFile } from './mediaLibraryModel';
import { resolveEventCover } from '@/features/events/model/eventCover';
import EventCover from '@/features/events/components/EventCover';
import './MediaLibrary.css';

function Preview({ file, type, title }) {
  if (type === 'audio') return <audio controls preload="none" src={file.fileUrl} aria-label={title} />;
  if (type === 'video') return <video controls preload="metadata" src={file.fileUrl} aria-label={title} />;
  return <img src={file.fileUrl} alt={title} loading="lazy" />;
}

export default function InvitationMediaManager() {
  const { eventId, id = eventId } = useParams();
  const { text: t } = useBackendMessages('mediaWorkspace');
  const workspace = useEventWorkspace();
  const [library, setLibrary] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [category, setCategory] = useState('cover');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [retry, setRetry] = useState(null);
  const picker = useRef(null);
  const replaceTarget = useRef(null);
  useEffect(() => {
    let active = true;
    Promise.all([mediaService.list(id), invitationService.get(id)]).then(([media, event]) => { if (active) { setLibrary(media); setInvitation(event); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [id]);
  const refresh = async () => { const [media, event] = await Promise.all([mediaService.list(id), invitationService.get(id)]); setLibrary(media); setInvitation(event); workspace?.updateEvent({ ...event, coverUrl: media.coverImage?.fileUrl || null, coverSource: media.coverImage ? 'owner' : 'template' }); };
  const run = async action => {
    setBusy(true); setError(''); setProgress(0); setRetry(null);
    try { await action(); await refresh(); toast(t('saved')); }
    catch (e) { setError(e.message || t('failed')); setRetry(() => action); }
    finally { setBusy(false); }
  };
  const config = MEDIA_CATEGORIES[category];
  const records = (Array.isArray(library?.[config.field]) ? library[config.field] : [library?.[config.field]]).filter(Boolean);
  const references = invitationMediaReferences(invitation);
  const choose = target => { replaceTarget.current = target || null; if (picker.current) picker.current.multiple = category === 'gallery' && !target; picker.current?.click(); };
  const selectedFiles = event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    for (const file of files) { const failure = validateLibraryFile(file, category); if (failure) { setRetry(null); setError(t(failure, { limit: config.limit })); return; } }
    const target = replaceTarget.current;
    const onProgress = e => { if (e.total) setProgress(Math.round(e.loaded / e.total * 100)); };
    run(() => target ? mediaService.replace(id, target.id, files[0], onProgress) : ({ cover: () => mediaService.uploadCover(id, files[0], onProgress), gallery: () => mediaService.uploadGallery(id, files, undefined, onProgress), video: () => mediaService.uploadVideo(id, files[0], onProgress), music: () => mediaService.uploadMusic(id, files[0], onProgress) })[category]());
  };
  const resolvedCover = resolveEventCover(invitation || {});
  const coverReference = ['owner', 'invitation'].includes(resolvedCover.source);
  const coverArtwork = resolvedCover.url;
  const isCoverInUse = category === 'cover' && records.some(file => references.has(file.fileUrl));
  return <main className="media-library workspace-page" aria-busy={busy}>
    <header className="workspace-page-heading"><div><h1>{t('title')}</h1><p>{t('subtitle')}</p></div><div className="workspace-actions"><Link className="workspace-button" to={`/app/events/${id}/preview`}><Eye size={18} />{t('preview')}</Link><Link className="workspace-button" to={`/app/events/${id}/invitation`}><Palette size={18} />{t('studio')}</Link></div></header>
    {error && <div className="workspace-notice" role="alert">{error}<button className="workspace-button" disabled={busy} onClick={() => run(retry || refresh)}>{t('retry')}</button></div>}
    {!library && !error && <p role="status">{t('loading')}</p>}
    <div className="workspace-tabs" role="group" aria-label={t('categories')}>{[['cover', Images], ['gallery', Images], ['video', Video], ['music', Music]].map(([key, Icon]) => <button type="button" key={key} aria-pressed={key === category} disabled={busy} onClick={() => { setCategory(key); setError(''); }}><Icon size={18} />{t(key)}</button>)}</div>
    <section className="workspace-section">
      <div className="workspace-section-heading"><div><h2>{t(category)}</h2><p className="workspace-muted">{t('formats', { formats: config.extensions.join(', ').toUpperCase(), limit: config.limit })}</p></div>{isCoverInUse ? <Link className="workspace-button" to={`/app/events/${id}/invitation`}>{t('editInStudio')}</Link> : <button className="workspace-button primary" disabled={busy || !library} onClick={() => choose(null)}><Upload size={18} />{t(category === 'gallery' ? 'uploadImages' : 'upload')}</button>}</div>
      <input ref={picker} hidden type="file" accept={config.accept} multiple={category === 'gallery'} aria-label={t('upload')} onChange={selectedFiles} />
      {busy && <div className="media-upload-progress" role="status"><span>{t('uploading', { progress })}</span><progress max="100" value={progress} aria-label={t('uploadProgress')} /></div>}
      {library && records.length > 0 ? <div className="media-library-grid">{records.map(file => <article className="media-asset" key={file.id}>
        <div className="media-asset-preview"><Preview file={file} type={config.type} title={file.originalFilename || t(category)} /></div>
        <div className="media-asset-body"><h3>{file.originalFilename || t(category)}</h3><p>{file.mimeType || config.type}{file.fileSize != null ? ` · ${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}</p>
          {references.has(file.fileUrl) ? <><p>{t('inUse')}</p><Link className="workspace-button" to={`/app/events/${id}/invitation`}>{t('editInStudio')}</Link></> : <div className="workspace-actions"><button className="workspace-button" disabled={busy} onClick={() => choose(file)}>{t('replace')}</button><button className="workspace-button" disabled={busy} onClick={() => { if (window.confirm(t('confirmRemove'))) run(() => mediaService.remove(id, file.id)); }}>{t('remove')}</button></div>}
        </div>
      </article>)}</div> : library && category === 'cover' && coverArtwork ? <div className="media-reference-card"><EventCover event={invitation || {}} alt={t('reference')} /><div><h3>{t(coverReference ? 'savedDesign' : 'templateArtwork')}</h3><p>{t(coverReference ? 'savedDesignHint' : 'templateHint')}</p><Link className="workspace-button" to={`/app/events/${id}/invitation`}>{t('editInStudio')}</Link></div></div> : library && <div className="workspace-empty"><Images size={32} /><h2>{t('empty')}</h2><p>{t('emptyHint')}</p></div>}
    </section>
    <p className="media-source-note">{t('sourceHint')}</p>
  </main>;
}
