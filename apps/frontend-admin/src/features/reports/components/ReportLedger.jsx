import { useState } from "react";
import {
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Columns3,
  Copy,
  Inbox,
} from "lucide-react";
import { ActionButton } from "../../../shared/ui/AdminUI";
import { columnLabel, reportLabel, safeTsv } from "../reportModel";
import {
  displayValue,
  priorityColumns,
  workspaceText,
} from "../reportWorkspace";
import ReportDrawer from "./ReportDrawer";

export default function ReportLedger({
  report,
  lang,
  onQuery,
  onReset,
  disabled = false,
}) {
  const allColumns = report.definition.columns;
  const storageKey = `koupreng.admin.report.columns.${report.report}`;
  const [visible, setVisible] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (
        Array.isArray(stored) &&
        stored.some((key) => allColumns.some((column) => column.key === key))
      )
        return stored;
    } catch {
      /* An unavailable preference must not prevent report access. */
    }
    const preferred = priorityColumns[report.report]?.filter((key) =>
      allColumns.some((column) => column.key === key),
    );
    return preferred?.length
      ? [
          ...preferred,
          ...allColumns
            .filter((column) => !preferred.includes(column.key))
            .map((column) => column.key),
        ].slice(0, Math.min(7, Math.max(5, preferred.length)))
      : allColumns.slice(0, 6).map((column) => column.key);
  });
  const [selection, setSelection] = useState({ snapshotId: null, ids: [] }),
    [detail, setDetail] = useState(null),
    [feedback, setFeedback] = useState("");
  const text = (key) => workspaceText(key, lang);
  const columns = visible
    .map((key) => allColumns.find((column) => column.key === key))
    .filter(Boolean);
  const rows = report.rows || [],
    start = report.page * report.size;
  const selected =
    selection.snapshotId === report.metadata.snapshotId ? selection.ids : [];
  const setSelected = (update) =>
    setSelection({
      snapshotId: report.metadata.snapshotId,
      ids: update(selected),
    });
  const toggleColumn = (key, checked) => {
    const next = checked
      ? [...visible, key]
      : visible.filter((value) => value !== key);
    setVisible(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Session-only selection remains usable. */
    }
  };
  const copy = async () => {
    const chosen = rows.filter((row) => selected.includes(String(row.id)));
    const lines = [
      columns.map((column) => columnLabel(column, lang)),
      ...chosen.map((row) =>
        columns.map((column) =>
          displayValue(row[column.key], column, lang, row),
        ),
      ),
    ];
    try {
      await navigator.clipboard.writeText(
        lines.map((row) => row.map(safeTsv).join("\t")).join("\r\n"),
      );
      setFeedback(text("copied"));
    } catch {
      setFeedback(text("copyFailed"));
    }
  };
  const cell = (row, column) => {
    const value = displayValue(row[column.key], column, lang, row);
    return /^(status|paymentStatus|moderationStatus|activeState|reconciliationOutcome)$/.test(
      column.key,
    ) && row[column.key] ? (
      <span className="report-status" data-status={row[column.key]}>
        {value}
      </span>
    ) : (
      <span className="report-cell-value" title={value}>
        {value}
      </span>
    );
  };
  const rowTitle = (row) =>
    row.title ||
    row.orderCode ||
    row.displayName ||
    row.name ||
    (lang === "en" ? row.labelEn : row.labelKm) ||
    row.label ||
    row.id;
  const empty = (
    <div className="report-empty">
      <Inbox size={28} aria-hidden="true" />
      <h4>{report.totalElements === 0 ? text("empty") : text("noRecords")}</h4>
      <p>{text("emptyHint")}</p>
      {onReset && (
        <ActionButton onClick={onReset}>{text("clearFilters")}</ActionButton>
      )}
    </div>
  );
  return (
    <section
      className="card report-ledger"
      aria-label={reportLabel(report.definition, lang)}
      aria-busy={disabled}
    >
      <div className="report-ledger-toolbar">
        <div>
          <h3>{text("records")}</h3>
          <p>
            {text("matching")}: <strong>{report.totalElements}</strong> ·{" "}
            {text("pageScope")}: {rows.length}
          </p>
        </div>
        <div className="report-table-tools">
          <details
            className="report-column-menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary").focus();
              }
            }}
          >
            <summary>
              <Columns3 size={16} aria-hidden="true" />
              {text("columns")}{" "}
              <span className="report-muted">
                {columns.length}/{allColumns.length}
              </span>
            </summary>
            <fieldset>
              <legend className="sr-only">{text("columns")}</legend>
              {allColumns.map((column) => (
                <label key={column.key}>
                  <input
                    type="checkbox"
                    checked={visible.includes(column.key)}
                    disabled={
                      columns.length === 1 && visible.includes(column.key)
                    }
                    onChange={(event) =>
                      toggleColumn(column.key, event.target.checked)
                    }
                  />
                  {columnLabel(column, lang)}
                </label>
              ))}
            </fieldset>
          </details>
          <ActionButton disabled={!selected.length || disabled} onClick={copy}>
            <Copy size={15} aria-hidden="true" />
            {text("copy")} ({selected.length})
          </ActionButton>
        </div>
      </div>
      <p className="report-selection-hint">{text("selectHint")}</p>
      {feedback && <p role="status">{feedback}</p>}
      <div
        className="table-wrap management-report-scroll"
        tabIndex={0}
        role="region"
        aria-label={text("columns")}
      >
        <table className="data management-report-table">
          <caption className="sr-only">
            {text("pageScope")} · {report.metadata.snapshotId}
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">{text("select")}</span>
                <input
                  type="checkbox"
                  aria-label={text("select") + " · " + text("pageScope")}
                  checked={rows.length > 0 && selected.length === rows.length}
                  disabled={disabled || !rows.length}
                  onChange={(event) =>
                    setSelected(() =>
                      event.target.checked
                        ? rows.map((row) => String(row.id))
                        : [],
                    )
                  }
                />
              </th>
              <th scope="col">#</th>
              {columns.map((column, index) => {
                const sorted = report.metadata.sort === column.key,
                  asc = report.metadata.direction === "ASC",
                  Icon = sorted ? (asc ? ArrowUp : ArrowDown) : ArrowDownUp;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={`${index === 0 ? "report-sticky" : ""} ${["NUMBER", "MONEY", "PERCENT"].includes(column.type) ? "report-number" : ""}`}
                    aria-sort={
                      sorted ? (asc ? "ascending" : "descending") : undefined
                    }
                  >
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        onQuery({
                          sort: column.key,
                          direction: sorted && asc ? "DESC" : "ASC",
                          page: 0,
                        })
                      }
                    >
                      {columnLabel(column, lang)}
                      <Icon size={13} aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
              <th scope="col">{text("details")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr
                  key={row.id}
                  data-selected={selected.includes(String(row.id))}
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${text("select")} ${start + index + 1}`}
                      checked={selected.includes(String(row.id))}
                      disabled={disabled}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, String(row.id)]
                            : current.filter((id) => id !== String(row.id)),
                        )
                      }
                    />
                  </td>
                  <td className="report-muted">{start + index + 1}</td>
                  {columns.map((column, position) => (
                    <td
                      key={column.key}
                      data-label={columnLabel(column, lang)}
                      className={`${position > 4 ? "report-mobile-hidden" : ""} ${position === 0 ? "report-sticky" : ""} ${["NUMBER", "MONEY", "PERCENT"].includes(column.type) ? "report-number" : ""}`}
                    >
                      {cell(row, column)}
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      className="report-row-details"
                      onClick={() => setDetail(row)}
                      aria-label={`${text("details")} #${start + index + 1}`}
                    >
                      <ChevronRight size={19} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 3}>{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="report-pagination">
        <label>
          {text("pageSize")}
          <select
            value={report.size}
            disabled={disabled}
            onChange={(event) =>
              onQuery({ size: Number(event.target.value), page: 0 })
            }
          >
            {[20, 50, 100, 200].map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
        <span>
          {report.totalElements ? start + 1 : 0}–
          {Math.min(start + rows.length, report.totalElements)} /{" "}
          {report.totalElements}
        </span>
        <div>
          <ActionButton
            disabled={report.page === 0 || disabled}
            onClick={() => onQuery({ page: report.page - 1 })}
          >
            {text("previous")}
          </ActionButton>
          <ActionButton
            disabled={report.page + 1 >= report.totalPages || disabled}
            onClick={() => onQuery({ page: report.page + 1 })}
          >
            {text("next")}
          </ActionButton>
        </div>
      </div>
      <ReportDrawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={text("details")}
        lang={lang}
      >
        {detail && (
          <div className="report-detail-content">
            <p className="report-detail-title">{rowTitle(detail)}</p>
            <p className="report-muted">
              {text("snapshot")}: {report.metadata.snapshotId}
            </p>
            <dl>
              {allColumns.map((column) => (
                <div key={column.key}>
                  <dt>{columnLabel(column, lang)}</dt>
                  <dd>
                    {displayValue(detail[column.key], column, lang, detail)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </ReportDrawer>
    </section>
  );
}
