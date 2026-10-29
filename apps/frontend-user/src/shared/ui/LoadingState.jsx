import { Skeleton, SkeletonCard, SkeletonTable } from './Skeleton';
import { useState } from 'react';
import { useUiCopy } from '@/shared/i18n/useUiCopy';
import { STUDIO_SPLIT_KEY } from '@/features/invitations/studio/useStudioSplit';

// One announcement per pending region. Shapes carry no business data or controls.
export function LoadingRegion({ label, children, className = '', layout }) {
  const copy = useUiCopy();
  return <div className={`k-loading-region ${className}`} aria-busy="true" data-loading-layout={layout}>
    <p className="k-loading-label" role="status">{label || copy('កំពុងផ្ទុក…', 'Loading…')}</p>
    <div aria-hidden="true">{children}</div>
  </div>;
}

function CardShapes({ variant = 'event', count = 3 }) {
  return <div className={`k-loading-grid k-loading-grid--${variant}`}>
    {Array.from({ length: Math.min(8, Math.max(1, count)) }, (_, i) => <div className="k-skeleton-card" key={i}>
      {['event', 'template', 'gallery'].includes(variant) && <Skeleton className={`k-loading-image k-loading-image--${variant}`} height="auto" />}
      <Skeleton width="62%" height="1.4rem" /><Skeleton width="88%" /><Skeleton width="48%" />
      {variant === 'pricing' && <><Skeleton height="2.8rem" width="50%" /><Skeleton /><Skeleton /><Skeleton width="74%" /><Skeleton height="2.75rem" /></>}
    </div>)}
  </div>;
}

export function CardGridSkeleton({ variant = 'event', count = 3, label }) {
  return <LoadingRegion label={label} layout={variant}><CardShapes variant={variant} count={count} /></LoadingRegion>;
}

export function InvitationStudioSkeleton({ label }) {
  const [split] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STUDIO_SPLIT_KEY));
      return typeof saved === 'number' && saved >= 30 && saved <= 75 ? saved : 60;
    } catch { return 60; }
  });
  return <LoadingRegion label={label} layout="studio" className="k-studio-loading">
    <div className="k-studio-loading-toolbar"><Skeleton width="38%" height="2rem" /><Skeleton width="7rem" height="2.75rem" /></div>
    <div className="k-studio-loading-body" style={{ '--skeleton-editor-ratio': `${split}fr`, '--skeleton-preview-ratio': `${100 - split}fr` }}>
      <div className="k-studio-loading-sidebar">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} height="3rem" />)}</div>
      <div className="k-studio-loading-editor"><Skeleton width="58%" height="1.75rem" />{Array.from({ length: 5 }, (_, i) => <div key={i}><Skeleton width="35%" /><Skeleton height="2.75rem" /></div>)}</div>
      <div className="k-studio-loading-preview"><div className="k-loading-phone"><Skeleton height="100%" borderRadius="inherit" /></div></div>
    </div>
  </LoadingRegion>;
}

export function PageSkeleton({ layout = 'form', label, rows = 5, columns = 4 }) {
  if (layout === 'studio') return <InvitationStudioSkeleton label={label} />;
  if (['event', 'template', 'gallery', 'pricing'].includes(layout)) return <CardGridSkeleton variant={layout} label={label} />;
  return <LoadingRegion label={label} layout={layout}>
    {layout === 'table' ? <SkeletonTable rows={rows} columns={columns} />
      : layout === 'dashboard' ? <><Skeleton height="12rem" /><CardShapes variant="stat" count={4} /><div className="k-loading-grid"><SkeletonCard height="20rem" /><SkeletonCard height="20rem" /></div></>
      : layout === 'public' || layout === 'preview' ? <div className="k-loading-invitation"><Skeleton width="35%" height="2rem" /><Skeleton width="66%" height="3rem" /><Skeleton className="k-loading-portrait" height="auto" /><Skeleton width="55%" /></div>
      : layout === 'chart' ? <Skeleton height="18rem" />
      : layout === 'ticket' ? <div className="k-loading-ticket"><Skeleton height="100%" /></div>
      : layout === 'list' ? <div className="k-loading-list">{Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} height="5rem" />)}</div>
      : <div className="k-loading-form"><Skeleton width="50%" height="1.75rem" />{Array.from({ length: 4 }, (_, i) => <div key={i}><Skeleton width="35%" /><Skeleton height="2.75rem" /></div>)}</div>}
  </LoadingRegion>;
}
