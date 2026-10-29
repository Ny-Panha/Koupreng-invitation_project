import { lazy, Suspense, useState } from 'react';
import { Eye, LockKeyhole, Map, Pencil, RefreshCw } from 'lucide-react';
import { useFeatureAccess } from '@/shared/access/useFeatureAccess';
import { MapDrawing } from '../../templates/shared/IllustratedMap';
import './IllustratedMapDesigner.css';

const IllustratedMapDesignerModal = lazy(() => import('./IllustratedMapDesignerModal'));

export default function IllustratedMapEditor({ value, onChange, locale = 'km', onUndo, onRedo, canUndo, canRedo, onSave, savedValue, savePhase, saveError }) {
  const [mode, setMode] = useState(null);
  const access = useFeatureAccess({ feature: 'ILLUSTRATED_VENUE_MAP', permission: 'MANAGE_INVITATION' });
  const allowed = access.allowed;
  const en = locale === 'en';
  const L = (km, english) => en ? english : km;
  const unverified = ['SUBSCRIPTION_UNVERIFIED','EVENT_UNAVAILABLE','PLAN_CATALOG_UNAVAILABLE'].includes(access.decision.reason);
  const open = () => { if (allowed) setMode('edit'); else access.explain(); };
  return <section className="map-entry" data-map-entry data-map-locked={!allowed || undefined} aria-label={L('ផែនទីទីតាំងកម្មវិធី','Illustrated venue map')}>
    <div className="map-entry-art" aria-hidden="true">{value?.nodes?.length ? <MapDrawing value={value} locale={locale} /> : <><Map size={44} strokeWidth={1} /><span>ផែនទី · VENUE MAP</span></>}</div>
    <div className="map-entry-copy"><span className="map-eyebrow">{L('ផែនទីទីតាំងកម្មវិធី','Illustrated venue map')}</span><h4>{L('ស្ទូឌីយោផែនទី','Map Studio')}</h4>
      <p>{L('រចនាផែនទីជាមួយផ្លូវ សញ្ញាសម្គាល់ និងអក្សរខ្មែរ ឬអង់គ្លេស។','Design a clear route with roads, landmarks and Khmer or English labels.')}</p>
      <div className="map-entry-actions"><button type="button" className="map-primary" onClick={open}>{allowed ? <Pencil size={16} /> : <LockKeyhole size={16} />}{L('កែសម្រួលផែនទី','Edit map')}</button>
        {value?.nodes?.length > 0 && <button type="button" onClick={() => setMode('preview')}><Eye size={16} />{L('មើលជាមុន','Preview')}</button>}
        {!allowed && <span role={unverified ? 'status' : undefined}>{unverified ? L('មិនទាន់អាចផ្ទៀងផ្ទាត់សិទ្ធិ','Access not yet verified') : L('សម្រាប់ Pro ឬ Premium','Available with Pro or Premium')}</span>}
        {unverified && <button type="button" onClick={() => { access.refresh?.(); window.dispatchEvent(new Event('koupreng:access-refresh')); }}><RefreshCw size={16} />{L('សាកម្តងទៀត','Retry')}</button>}
      </div>
      {access.decision.reason === 'PACKAGE_FEATURE_REQUIRED' && value?.enabled && <button type="button" className="map-text-button" onClick={() => onChange({ ...value, enabled: false })}>{L('លាក់ផែនទីសាធារណៈ','Disable public diagram')}</button>}
    </div>
    {mode && <Suspense fallback={<p role="status">{L('កំពុងបើកកម្មវិធីរចនា…','Opening map designer…')}</p>}><IllustratedMapDesignerModal value={value} onChange={onChange} locale={locale} previewOnly={mode === 'preview'} onClose={() => setMode(null)} onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo} onSave={onSave} savedValue={savedValue} savePhase={savePhase} saveError={saveError} allowed={allowed} onReviewAccess={access.explain} /></Suspense>}
  </section>;
}
