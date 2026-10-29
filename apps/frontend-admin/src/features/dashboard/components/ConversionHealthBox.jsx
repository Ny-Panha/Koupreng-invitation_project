import '../../../shared/ui/AdminSkeleton.css';
export default function ConversionHealthBox({ analytics = {}, lang = 'km', loading = false }) {
  const en=lang==='en', unavailable=en?'Unavailable':'មិនទាន់មាន';
  const rsvp=analytics.rsvp?.summary, checkIn=analytics.checkIn?.summary, delivery=analytics.delivery?.summary, health=analytics.health?.summary;
  const entries=[
    ['rsvp',en?'Stored RSVP records':'កំណត់ត្រា RSVP',rsvp?.totalRsvps],
    ['rsvp',en?'Attending RSVP records':'RSVP ចូលរួម',rsvp?.attending],
    ['checkIn',en?'Active check-in records':'កំណត់ត្រាវត្តមានសកម្ម',checkIn?.checkedIn],
    ['delivery',en?'Marked sent records':'កំណត់ត្រាបានផ្ញើ',delivery?.sent],
    ['delivery',en?'Recorded opened records':'កំណត់ត្រាបានបើក',delivery?.opened],
    ['health',en?'Operational alert status':'ស្ថានភាពការជូនដំណឹង',health?.status],
  ];
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#121622]"><h3 className="font-bold text-slate-900 dark:text-white">{en?'Stored attendance and operations':'វត្តមាន និងប្រតិបត្តិការដែលបានកត់ត្រា'}</h3>
    {loading && entries.some(([key]) => analytics[key] === undefined) && <p role="status">{en ? 'Loading operations…' : 'កំពុងផ្ទុកប្រតិបត្តិការ…'}</p>}
    <dl className="my-4 space-y-3">{entries.map(([key,label,value]) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-sm text-slate-600 dark:text-slate-300">{label}</dt><dd className="font-semibold text-slate-900 dark:text-white">{loading && analytics[key] === undefined ? <span aria-hidden="true" className="admin-skeleton-shape inline-block w-16" /> : value ?? unavailable}</dd></div>)}</dl>
    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{en?'Current server snapshots, not individual arrival counts. Send/open flags do not verify delivery. Alert status summarizes recorded failures; uptime and bank connectivity are not measured here.':'ស្ថានភាពបច្ចុប្បន្នពីម៉ាស៊ីនមេ មិនមែនចំនួនមនុស្សមកដល់។ ស្ថានភាពផ្ញើ/បើក មិនបញ្ជាក់ការទទួលទេ។ ការជូនដំណឹងផ្អែកលើកំហុសដែលកត់ត្រា មិនវាស់ពេលដំណើរការ ឬការភ្ជាប់ធនាគារ។'}</p>
  </section>;
}
