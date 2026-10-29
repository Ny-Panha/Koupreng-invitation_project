import { AdminSkeleton } from './AdminSkeleton';
import { useAdminLanguage } from '../../app/providers/AdminLanguageProvider';

export function Loading({ label, layout = 'table' }) {
    return <AdminSkeleton label={label} layout={layout} />;
}

export function ErrorState({ message, onRetry }) {
    const { lang } = useAdminLanguage();
    return (
        <div className="state state-error" role="alert">
            <p>⚠️ {message || (lang === 'en' ? 'Could not load records.' : 'មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ')}</p>
            {onRetry && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry} style={{ marginTop: 10 }}>
                    {lang === 'en' ? 'Retry' : 'ព្យាយាមម្តងទៀត'}
                </button>
            )}
        </div>
    );
}

export function Empty({ label = "មិនមានទិន្នន័យ" }) {
    return <div className="state">📭 {label}</div>;
}
