import { eventTypeLabel } from "../reportConstants";
import { reportText, reportValue } from "../reportModel";

export default function CategoryBreakdownSection({
  categoryBreakdown,
  onSelectCategory,
  lang,
}) {
  return (
    <section
      className="card"
      aria-label={reportText("eventCategoryBreakdown", lang)}
    >
      <h3>{reportText("eventCategoryBreakdown", lang)}</h3>
      <table>
        <thead>
          <tr>
            <th>{reportText("eventType", lang)}</th>
            <th>{reportText("count", lang)}</th>
            <th>{reportText("publishedInvitations", lang)}</th>
            <th>{reportText("publishedRate", lang)}</th>
          </tr>
        </thead>
        <tbody>
          {categoryBreakdown.map((point) => (
            <tr key={point.category}>
              <th scope="row">
                <button
                  type="button"
                  onClick={() => onSelectCategory(point.category)}
                >
                  {eventTypeLabel(point.category, lang)} ↗
                </button>
              </th>
              <td>{point.total}</td>
              <td>{point.published}</td>
              <td>
                {reportValue(point.publishedRate, { type: "PERCENT" }, lang)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
