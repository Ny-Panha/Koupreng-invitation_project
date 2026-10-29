import { useAdminLanguage } from '../../app/providers/AdminLanguageProvider';
import './AdminSkeleton.css';

function Shape({ className = '' }) {
  return <div className={`admin-skeleton-shape ${className}`} />;
}

export function AdminSkeleton({ layout = 'table', label, rows = 5 }) {
  const { t } = useAdminLanguage();
  const cards = layout === 'dashboard' ? 4 : 3;
  return <div className="admin-loading" aria-busy="true" data-loading-layout={layout}>
    <p role="status">{label || t('common.loading')}</p>
    <div aria-hidden="true">
      {layout === 'table' ? <div className="admin-skeleton-table">{Array.from({ length: Math.min(10, Math.max(1, rows)) }, (_, i) => <div className="admin-skeleton-row" key={i}><Shape /><Shape /><Shape /><Shape /></div>)}</div>
        : layout === 'chart' ? <Shape className="admin-skeleton-chart" />
        : <div className="admin-skeleton-grid">{Array.from({ length: cards }, (_, i) => <div className="admin-skeleton-card" key={i}>
          {layout === 'template' && <Shape className="admin-skeleton-image" />}<Shape /><Shape className="admin-skeleton-value" /><Shape />
        </div>)}</div>}
      {layout === 'dashboard' && <><Shape className="admin-skeleton-chart" /><div className="admin-skeleton-row"><Shape /><Shape /><Shape /><Shape /></div></>}
    </div>
  </div>;
}

export function RefreshStatus({ active, error = false, onRetry }) {
  const { lang } = useAdminLanguage();
  if (error) return <div role="alert" className="admin-refresh-status"><p>{lang === 'en' ? 'Refresh failed. Previously verified records remain visible.' : 'មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ។ កំណត់ត្រាមុននៅតែបង្ហាញ។'}</p>{onRetry && <button type="button" className="btn btn-ghost" onClick={onRetry}>{lang === 'en' ? 'Retry' : 'ព្យាយាមម្ដងទៀត'}</button>}</div>;
  return active ? <p role="status" className="admin-refresh-status">{lang === 'en' ? 'Refreshing… Existing records remain visible.' : 'កំពុងធ្វើបច្ចុប្បន្នភាព… កំណត់ត្រាមុននៅតែបង្ហាញ។'}</p> : null;
}
