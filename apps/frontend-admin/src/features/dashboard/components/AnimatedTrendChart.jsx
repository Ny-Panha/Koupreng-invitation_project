import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { formatMoney, formatDateTime } from "../../../shared/utils";

// This API provides all-time receipt totals, not a daily trend series.
export default function AnimatedTrendChart({ lang = "km", report, loading = false, data = {} }) {
  const en = lang === "en";
  const summary = report?.summary;
  const totals = summary?.paidRevenueByCurrency || summary?.revenueByCurrency || {};
  const currencies = Object.keys(totals).sort();

  return (
    <section className="dashboard-panel dashboard-receipts" aria-labelledby="dashboard-receipts-title">
      <div className="dashboard-panel-header">
        <div>
          <h2 id="dashboard-receipts-title">{en ? "Recorded receipts" : "ប្រាក់ទទួលដែលបានកត់ត្រា"}</h2>
          <p>{en ? "Paid orders, shown separately by currency." : "បញ្ជាទិញដែលបានទូទាត់ បែងចែកតាមរូបិយប័ណ្ណ។"}</p>
        </div>
        <span className="dashboard-period">{en ? "All time" : "គ្រប់ពេល"}</span>
      </div>

      {loading ? <p className="dashboard-empty" role="status">{en ? "Loading receipts…" : "កំពុងផ្ទុកប្រាក់ទទួល…"}</p>
        : !summary ? <p className="dashboard-empty" role="status">{en ? "Receipt report unavailable. Open reports or refresh to retry." : "មិនទាន់មានរបាយការណ៍ប្រាក់។ សូមបើករបាយការណ៍ ឬផ្ទុកឡើងវិញ។"}</p>
        : currencies.length ? (
          <table className="dashboard-receipt-table">
            <caption className="sr-only">{en ? "Recorded receipt totals by currency" : "ប្រាក់ទទួលតាមរូបិយប័ណ្ណ"}</caption>
            <thead><tr><th scope="col">{en ? "Currency" : "រូបិយប័ណ្ណ"}</th><th scope="col">{en ? "Paid receipts" : "ប្រាក់ទទួល"}</th></tr></thead>
            <tbody>{currencies.map(currency => (
              <tr key={currency}><th scope="row">{currency}</th><td>{formatMoney(totals[currency], currency)}</td></tr>
            ))}</tbody>
          </table>
        ) : <p className="dashboard-empty">{en ? "No recorded receipts." : "មិនមានប្រាក់ទទួលដែលបានកត់ត្រា។"}</p>}

      <dl className="dashboard-payment-counts">
        <div><dt>{en ? "Payment records" : "កំណត់ត្រាការទូទាត់"}</dt><dd>{data.totalPayments ?? "—"}</dd></div>
        <div><dt>{en ? "Failed payments" : "ការទូទាត់បរាជ័យ"}</dt><dd>{data.failedPayments ?? "—"}</dd></div>
      </dl>
      <details className="dashboard-details">
        <summary>{en ? "About these totals" : "អំពីចំនួនសរុបទាំងនេះ"}</summary>
        <p>{en ? "All recorded paid orders, grouped by currency. Demo grants are not receipts. Daily comparison is unavailable." : "បញ្ជាទិញដែលបានទូទាត់ទាំងអស់ បែងចែកតាមរូបិយប័ណ្ណ។ សិទ្ធិសាកល្បងមិនមែនចំណូលទេ។ មិនទាន់មានទិន្នន័យប្រៀបធៀបប្រចាំថ្ងៃ។"}</p>
        {report?.generatedAt && <p>{en ? "Generated" : "បង្កើតនៅ"}: {formatDateTime(report.generatedAt)}</p>}
      </details>
      <Link to="/reports" className="dashboard-text-link dashboard-panel-footer">{en ? "View financial reports" : "មើលរបាយការណ៍ហិរញ្ញវត្ថុ"}<ArrowUpRight size={16} aria-hidden="true" /></Link>
    </section>
  );
}
