import { Link } from 'react-router-dom';
import { formatMoney, formatDateTime } from '../../../shared/utils';

// The legacy dashboard API supplies current receipt totals, not a daily time series.
export default function AnimatedTrendChart({ lang = 'km', report }) {
  const en=lang==='en', summary=report?.summary;
  const currencies=Object.keys(summary?.paidRevenueByCurrency || summary?.revenueByCurrency || {}).sort();
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#121622]">
    <h3 className="font-bold text-slate-900 dark:text-white">{en?'Recorded platform receipts':'ប្រាក់ដែលបានកត់ត្រារបស់ប្រព័ន្ធ'}</h3>
    <p className="my-3 text-sm text-slate-600 dark:text-slate-300">{en?'All recorded paid orders, grouped by currency. Demo grants are not receipts. Daily comparison is unavailable.':'បញ្ជាទិញដែលបានទូទាត់ទាំងអស់ បែងចែកតាមរូបិយប័ណ្ណ។ សិទ្ធិសាកល្បងមិនមែនចំណូលទេ។ មិនទាន់មានទិន្នន័យប្រៀបធៀបប្រចាំថ្ងៃ។'}</p>
    {!summary ? <p role="status">{en?'Receipt report unavailable. Open reports or refresh to retry.':'មិនទាន់មានរបាយការណ៍ប្រាក់។ សូមបើករបាយការណ៍ ឬផ្ទុកឡើងវិញ។'}</p> : currencies.length ? <div className="overflow-auto" tabIndex={0} role="region" aria-label={en?'Receipt totals by currency':'ប្រាក់តាមរូបិយប័ណ្ណ'}><table className="w-full text-sm"><caption className="sr-only">{en?'Recorded receipt totals':'ប្រាក់ដែលបានកត់ត្រា'}</caption><thead><tr><th scope="col" className="p-3 text-left">{en?'Currency':'រូបិយប័ណ្ណ'}</th><th scope="col" className="p-3 text-left">{en?'Paid receipts':'ប្រាក់ទទួល'}</th></tr></thead><tbody>{currencies.map(currency => <tr key={currency}><th scope="row" className="p-3 text-left">{currency}</th><td className="p-3">{formatMoney((summary.paidRevenueByCurrency || summary.revenueByCurrency)[currency],currency)}</td></tr>)}</tbody></table></div> : <p>{en?'No recorded receipts.':'មិនមានប្រាក់ទទួលដែលបានកត់ត្រា។'}</p>}
    {report?.generatedAt && <p className="my-3 text-xs text-slate-500">{en?'Generated':'បង្កើតនៅ'}: {formatDateTime(report.generatedAt)}</p>}
    <Link to="/reports" className="mt-3 inline-block font-semibold text-amber-700 dark:text-amber-300">{en?'Open dated reports and exports':'បើករបាយការណ៍តាមកាលបរិច្ឆេទ និងការនាំចេញ'}</Link>
  </section>;
}
