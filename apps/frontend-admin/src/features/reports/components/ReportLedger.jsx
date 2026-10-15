import { useRef, useState } from "react";
import { ActionButton, StatusBadge } from "../../../shared/ui/AdminUI";
import {
  columnLabel,
  reportLabel,
  reportText,
  reportValue,
  safeTsv,
} from "../reportModel";

export default function ReportLedger({
  report,
  lang,
  onQuery,
  disabled = false,
}) {
  const [hidden, setHidden] = useState([]),
    [selection, setSelection] = useState({ snapshotId: null, ids: [] }),
    [detail, setDetail] = useState(null),
    [feedback, setFeedback] = useState("");
  const dialog = useRef(null);
  const text = (key) => reportText(key, lang);
  const columns = report.definition.columns.filter(
    (column) => !hidden.includes(column.key),
  );
  const rows = report.rows || [],
    start = report.page * report.size;
  const selected =
    selection.snapshotId === report.metadata.snapshotId ? selection.ids : [];
  const setSelected = (update) =>
    setSelection({
      snapshotId: report.metadata.snapshotId,
      ids: update(selected),
    });
  const copy = async () => {
    const chosen = rows.filter((row) => selected.includes(String(row.id)));
    const lines = [
      columns.map((column) => columnLabel(column, lang)),
      ...chosen.map((row) =>
        columns.map((column) =>
          ["DATETIME", "DATE"].includes(column.type) && row[column.key] != null
            ? reportValue(row[column.key], column, lang, row)
            : row[column.key],
        ),
      ),
    ];
    // Raw data is already minimized and authorized by the server. No guest identities.
    try {
      await navigator.clipboard.writeText(
        lines.map((row) => row.map(safeTsv).join("\t")).join("\r\n"),
      );
      setFeedback(text("copied"));
    } catch {
      setFeedback(text("copyFailed"));
    }
  };
  return (
    <section
      className="card report-ledger"
      aria-label={reportLabel(report.definition, lang)}
    >
      <div className="report-ledger-toolbar">
        <div>
          <h3>{reportLabel(report.definition, lang)}</h3>
          <p>
            {text("matching")}: <strong>{report.totalElements}</strong> ·{" "}
            {text("pageScope")}: {rows.length}
          </p>
        </div>
        <div className="report-actions">
          <details className="report-column-menu">
            <summary>{text("columns")}</summary>
            <fieldset>
              <legend className="sr-only">{text("columns")}</legend>
              {report.definition.columns.map((column) => (
                <label key={column.key}>
                  <input
                    type="checkbox"
                    checked={!hidden.includes(column.key)}
                    disabled={
                      columns.length === 1 && !hidden.includes(column.key)
                    }
                    onChange={(event) =>
                      setHidden((current) =>
                        event.target.checked
                          ? current.filter((key) => key !== column.key)
                          : [...current, column.key],
                      )
                    }
                  />
                  {columnLabel(column, lang)}
                </label>
              ))}
            </fieldset>
          </details>
          <ActionButton
            disabled={selected.length === 0 || disabled}
            onClick={copy}
          >
            {text("copy")} ({selected.length})
          </ActionButton>
        </div>
      </div>
      <p role="status">{feedback}</p>
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
              <th scope="col">{text("select")}</th>
              <th scope="col">#</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    report.metadata.sort === column.key
                      ? report.metadata.direction === "ASC"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onQuery({
                        sort: column.key,
                        direction:
                          report.metadata.sort === column.key &&
                          report.metadata.direction === "ASC"
                            ? "DESC"
                            : "ASC",
                        page: 0,
                      })
                    }
                  >
                    {columnLabel(column, lang)}{" "}
                    {report.metadata.sort === column.key
                      ? report.metadata.direction === "ASC"
                        ? "↑"
                        : "↓"
                      : "↕"}
                  </button>
                </th>
              ))}
              <th scope="col">{text("details")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3}>{text("empty")}</td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${text("select")} ${start + index + 1}`}
                      checked={selected.includes(String(row.id))}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, String(row.id)]
                            : current.filter((id) => id !== String(row.id)),
                        )
                      }
                    />
                  </td>
                  <td>{start + index + 1}</td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={
                        ["NUMBER", "MONEY", "PERCENT"].includes(column.type)
                          ? "report-number"
                          : undefined
                      }
                    >
                      {/^(status|paymentStatus|moderationStatus|activeState|reconciliationOutcome)$/.test(
                        column.key,
                      ) && row[column.key] ? (
                        <StatusBadge status={row[column.key]} />
                      ) : (
                        reportValue(row[column.key], column, lang, row)
                      )}
                    </td>
                  ))}
                  <td>
                    <ActionButton
                      onClick={() => {
                        setDetail(row);
                        dialog.current.showModal();
                      }}
                    >
                      {text("details")} #{start + index + 1}
                    </ActionButton>
                  </td>
                </tr>
              ))
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
      <dialog
        ref={dialog}
        className="report-detail-dialog"
        aria-label={text("details")}
        onClose={() => setDetail(null)}
      >
        <h3>{text("details")}</h3>
        <dl>
          {detail &&
            report.definition.columns.map((column) => (
              <div key={column.key}>
                <dt>{columnLabel(column, lang)}</dt>
                <dd>{reportValue(detail[column.key], column, lang, detail)}</dd>
              </div>
            ))}
        </dl>
        <ActionButton onClick={() => dialog.current.close()}>
          {text("close")}
        </ActionButton>
      </dialog>
    </section>
  );
}
