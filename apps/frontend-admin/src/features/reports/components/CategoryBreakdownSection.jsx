import { reportValue } from "../reportModel";
import { valueLabel, workspaceText } from "../reportWorkspace";
export default function CategoryBreakdownSection({
  categoryBreakdown,
  onSelectCategory,
  lang,
}) {
  const max = Math.max(...categoryBreakdown.map((point) => point.total), 1);
  return (
    <div className="report-rankings report-category-rankings">
      {categoryBreakdown.map((point) => (
        <div key={point.category}>
          <div>
            {onSelectCategory ? (
              <button
                type="button"
                onClick={() => onSelectCategory(point.category)}
              >
                {valueLabel(point.category, lang)} ↗
              </button>
            ) : (
              <span>{valueLabel(point.category, lang)}</span>
            )}
            <strong>{point.total}</strong>
          </div>
          <div className="report-ranking-track" aria-hidden="true">
            <span style={{ width: `${(point.total / max) * 100}%` }} />
          </div>
          <small>
            {workspaceText("publishedRate", lang)}:{" "}
            {reportValue(point.publishedRate, { type: "PERCENT" }, lang)}
          </small>
        </div>
      ))}
    </div>
  );
}
