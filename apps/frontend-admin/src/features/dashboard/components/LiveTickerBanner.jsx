import { RefreshCw } from 'lucide-react';
import { formatRevenue } from '../../../shared/utils';

export default function LiveTickerBanner({ data = {}, lang = 'km', onReload, className = '', style = {} }) {
  const en=lang==='en';
  const items=[[en?'Account records':'កំណត់ត្រាគណនី',data.totalUsers], [en?'Invitation records':'កំណត់ត្រាធៀប',data.totalInvitations], [en?'Published invitations':'ធៀបបានផ្សាយ',data.publishedInvitations], [en?'Recorded receipts':'ប្រាក់ទទួលកត់ត្រា',formatRevenue(data)]];
  return <section style={style} className={`flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111114] ${className}`} aria-label={en?'Loaded dashboard snapshot':'ស្ថានភាពផ្ទាំងដែលបានផ្ទុក'}>
    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{en?'Loaded snapshot · refresh for changes':'ស្ថានភាពដែលបានផ្ទុក · ផ្ទុកឡើងវិញដើម្បីមើលការផ្លាស់ប្ដូរ'}</p>
    <dl className="flex flex-wrap gap-4">{items.map(([label,value]) => <div key={label} className="flex gap-2 text-sm"><dt>{label}:</dt><dd className="font-semibold">{value ?? '—'}</dd></div>)}</dl>
    <button type="button" onClick={onReload} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-600"><RefreshCw size={16} aria-hidden="true" />{en?'Refresh snapshot':'ផ្ទុកស្ថានភាពឡើងវិញ'}</button>
  </section>;
}
