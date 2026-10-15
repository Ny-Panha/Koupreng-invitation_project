import {
  LayoutDashboard,
  WalletCards,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Settings2,
} from "lucide-react";
import { reportLabel } from "../reportModel";
import { reportGroups, workspaceText } from "../reportWorkspace";
const icons = [
  LayoutDashboard,
  WalletCards,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Settings2,
];
export default function ReportNavigation({
  definitions,
  code,
  onChoose,
  lang,
}) {
  const active = reportGroups.find((group) => group.codes.includes(code));
  return (
    <nav
      className="report-navigation"
      aria-label={workspaceText("title", lang)}
    >
      <label className="report-mobile-selector">
        {workspaceText("chooseReport", lang)}
        <select value={code} onChange={(event) => onChoose(event.target.value)}>
          {!definitions.some((item) => item.code === code) && (
            <option value={code}>{workspaceText("chooseReport", lang)}</option>
          )}
          {reportGroups.map((group) => (
            <optgroup key={group.key} label={workspaceText(group.key, lang)}>
              {definitions
                .filter((item) => group.codes.includes(item.code))
                .map((item) => (
                  <option key={item.code} value={item.code}>
                    {reportLabel(item, lang)}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="report-category-list">
        {reportGroups.map((group, index) => {
          const Icon = icons[index],
            first = definitions.find((item) => group.codes.includes(item.code));
          return (
            first && (
              <button
                type="button"
                key={group.key}
                aria-pressed={active?.key === group.key}
              onClick={() => { if (active?.key !== group.key) onChoose(first.code); }}
              >
                <Icon size={17} aria-hidden="true" />
                {workspaceText(group.key, lang)}
              </button>
            )
          );
        })}
      </div>
      <div className="report-subnavigation">
        {definitions
          .filter((item) => active?.codes.includes(item.code))
          .map((item) => (
            <button
              key={item.code}
              type="button"
              aria-current={code === item.code ? "page" : undefined}
              onClick={() => onChoose(item.code)}
            >
              {reportLabel(item, lang)}
            </button>
          ))}
      </div>
    </nav>
  );
}
