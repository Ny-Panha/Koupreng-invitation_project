import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventWorkspace } from '@/features/events/workspace/EventContext';
import { mediaService } from '../api/mediaApi';
import { validateLibraryFile } from '../mediaLibraryModel';
import CinematicVideoOpening from '@/features/templates/shared/Openings/CinematicVideoOpening';

export default function PreWeddingVideoEditor({ eventId, value, onChange, english }) {
  const workspace = useEventWorkspace();
  const entitled = workspace?.access?.ownerFeatures?.includes('PRE_WEDDING_VIDEO') === true;
  const text = (en, kh) => english ? en : kh;
  const [library, setLibrary] = useState(null), [error, setError] = useState('');
  const [busy, setBusy] = useState(false), [progress, setProgress] = useState(0), [preview, setPreview] = useState(false);
  const config = value || { enabled: false, videoMediaId: null, posterMediaId: null };
  useEffect(() => {
    if (!entitled || !/^[1-9]\d*$/.test(String(eventId))) return;
    let active = true;
    mediaService.list(eventId).then(media => { if (active) { setLibrary(media); setError(''); } })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [eventId, entitled]);
  const loadVideo = useCallback(signal => mediaService.ownerCinematicContent(eventId, config.videoMediaId, signal), [eventId, config.videoMediaId]);
  const videos = (library?.all || []).filter(item => item.mediaType === 'PRE_WEDDING_VIDEO');
  const posters = [library?.coverImage, ...(library?.galleryImages || [])].filter(item => item?.id && /^image\//.test(item.mimeType));
  async function upload(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    const invalid = validateLibraryFile(file, 'video');
    if (invalid) { setError(text('Choose an MP4 or WebM video up to 50 MB.', 'សូមជ្រើសរើសវីដេអូ MP4 ឬ WebM ទំហំមិនលើស 50 MB។')); return; }
    setBusy(true); setError(''); setProgress(0); setPreview(false);
    try {
      const uploaded = await mediaService.uploadPreWeddingVideo(eventId, file, event => { if (event.total) setProgress(Math.round(event.loaded / event.total * 100)); });
      setLibrary(current => ({ ...current, all: [...(current?.all || []), uploaded] }));
      onChange({ ...config, videoMediaId: uploaded.id });
    } catch (err) { setError(err.message || text('Upload failed. Try again.', 'មិនអាចបញ្ចូលបាន។ សូមព្យាយាមម្ដងទៀត។')); }
    finally { setBusy(false); }
  }
  return <section className="studio-video-editor" aria-label={text('Premium cinematic opening', 'ការបើកវីដេអូ Premium')}>
    <p>{text('An optional video after guests open your existing invitation cover. Starts muted and can be skipped immediately.', 'វីដេអូជាជម្រើស បន្ទាប់ពីភ្ញៀវបើកក្របធៀបដើម។ វីដេអូចាប់ផ្ដើមដោយបិទសំឡេង ហើយអាចរំលងបានភ្លាមៗ។')}</p>
    {!entitled && <div className="workspace-notice"><strong>Premium</strong><p>{text('The event owner needs an active Premium package for this opening. Gallery, photos and music keep their existing access.', 'ម្ចាស់កម្មវិធីត្រូវមានកញ្ចប់ Premium ដែលកំពុងដំណើរការ សម្រាប់ការបើកនេះ។ រូបភាព និងតន្ត្រីនៅតែអាចប្រើតាមសិទ្ធិដដែល។')}</p><Link className="workspace-button" to="/app/packages">{text('View packages', 'មើលកញ្ចប់')}</Link></div>}
    {error && <p role="alert">{error}</p>}
    <label><input type="checkbox" checked={config.enabled === true} disabled={busy || (!entitled && !config.enabled) || (entitled && !config.videoMediaId && !config.enabled)} onChange={event => onChange({ ...config, enabled: event.target.checked })} />{text('Enable pre-wedding video', 'បើកវីដេអូមុនអាពាហ៍ពិពាហ៍')}</label>
    {entitled && <>
      <label>{text('Pre-wedding video', 'វីដេអូមុនអាពាហ៍ពិពាហ៍')}<select disabled={busy} value={config.videoMediaId || ''} onChange={event => { setPreview(false); onChange({ ...config, videoMediaId: Number(event.target.value) || null, enabled: event.target.value ? config.enabled : false }); }}><option value="">{text('No video', 'គ្មានវីដេអូ')}</option>{videos.map(item => <option key={item.id} value={item.id}>{item.originalFilename}</option>)}</select></label>
      <label>{text('Upload or replace video · MP4 / WebM · 50 MB', 'បញ្ចូល ឬប្ដូរវីដេអូ · MP4 / WebM · 50 MB')}<input disabled={busy || !library} type="file" accept="video/mp4,video/webm" onChange={upload} /></label>
      {busy && <div role="status">{text('Uploading video', 'កំពុងបញ្ចូលវីដេអូ')} {progress}%<progress max="100" value={progress} aria-label={text('Video upload progress', 'ដំណើរការបញ្ចូលវីដេអូ')} /></div>}
      <label>{text('Poster / thumbnail', 'រូបមុខវីដេអូ')}<select disabled={busy} value={config.posterMediaId || ''} onChange={event => onChange({ ...config, posterMediaId: Number(event.target.value) || null })}><option value="">{text('No poster', 'គ្មានរូបមុខ')}</option>{posters.map(item => <option key={item.id} value={item.id}>{item.originalFilename}</option>)}</select></label>
      <p>{text('Choose a cover or gallery image as the poster. Cover background videos remain separate. Save the invitation to apply these preferences.', 'ជ្រើសរើសរូបក្រប ឬរូបវិចិត្រសាលជារូបមុខ។ វីដេអូផ្ទៃក្របគឺជាផ្នែកផ្សេង។ សូមរក្សាទុកធៀប ដើម្បីអនុវត្តការកំណត់នេះ។')}</p>
      <div className="workspace-actions"><button className="workspace-button" type="button" disabled={!config.videoMediaId || busy} onClick={() => setPreview(value => !value)}>{preview ? text('Close video preview', 'បិទវីដេអូមើលជាមុន') : text('Preview video', 'មើលវីដេអូជាមុន')}</button>
        <button type="button" className="workspace-button" disabled={!config.videoMediaId || busy} onClick={() => { setPreview(false); onChange({ enabled: false, videoMediaId: null, posterMediaId: config.posterMediaId }); }}>{text('Remove selected video', 'ដកវីដេអូដែលបានជ្រើស')}</button></div>
      {preview && <CinematicVideoOpening stageOnly english={english} loadVideo={loadVideo} posterUrl={posters.find(item => item.id === config.posterMediaId)?.fileUrl} onOpen={() => setPreview(false)} />}
      {videos.filter(item => item.id !== config.videoMediaId).map(item => <div key={item.id}><span>{item.originalFilename}</span> <button type="button" disabled={busy} onClick={async () => {
        setBusy(true); setError('');
        try { await mediaService.remove(eventId, item.id); setLibrary(current => ({ ...current, all: current.all.filter(asset => asset.id !== item.id) })); }
        catch (err) { setError(err.message); } finally { setBusy(false); }
      }}>{text('Delete unused video', 'លុបវីដេអូមិនប្រើ')}</button></div>)}
    </>}
  </section>;
}
