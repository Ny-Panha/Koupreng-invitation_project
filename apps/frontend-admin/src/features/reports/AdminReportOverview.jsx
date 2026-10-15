import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ActionButton, AdminPageHeader } from "../../shared/ui/AdminUI";
import adminService from "../../shared/api/adminService";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import { exportCsv } from "../../shared/utils/csvExport";
import {
  columnLabel,
  reportLabel,
  reportPreset,
  reportText,
  reportValue,
} from "./reportModel";
import ReportOverviewCards from "./components/ReportOverviewCards";
import InvitationsReportSection from "./components/InvitationsReportSection";
import FinancialReportSection from "./components/FinancialReportSection";
import SubscriptionsReportSection from "./components/SubscriptionsReportSection";
import GuestsRsvpCheckinSection from "./components/GuestsRsvpCheckinSection";
import SystemHealthSection from "./components/SystemHealthSection";
import ReportPrintPreviewModal from "./components/ReportPrintPreviewModal";
import ReportLedger from "./components/ReportLedger";
import ReportFilters from "./components/ReportFilters";
import ReportAnalytics from "./components/ReportAnalytics";
import "./reports.css";

export default function AdminReportOverview() {
  const { lang } = useAdminLanguage(),
    text = (key) => reportText(key, lang);
  const [urlParams, setParams] = useSearchParams();
  const [defaults] = useState(() => reportPreset("last30"));
  const params = useMemo(() => {
    const next = new URLSearchParams(urlParams);
    if (!next.has("from") && !next.has("to")) {
      next.set("from", defaults.from);
      next.set("to", defaults.to);
      next.set("preset", "last30");
    } else if (!next.has("preset")) next.set("preset", "custom");
    if (!next.has("report")) next.set("report", "executive");
    return next;
  }, [urlParams, defaults]);
  const [definitions, setDefinitions] = useState(null),
    [definitionError, setDefinitionError] = useState("");
  const [snapshot, setSnapshot] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [refresh, setRefresh] = useState(0);
  const [exporting, setExporting] = useState(""),
    [feedback, setFeedback] = useState(""),
    [preview, setPreview] = useState(null);
  const code = params.get("report"),
    definition = definitions?.find((item) => item.code === code);
  useEffect(() => {
    if (params.toString() !== urlParams.toString())
      setParams(params, { replace: true });
  }, [params, urlParams, setParams]);
  useEffect(() => {
    let active = true;
    adminService
      .reportDefinitions()
      .then((data) => {
        if (active) {
          if (!Array.isArray(data?.definitions))
            throw new Error("Report definitions unavailable");
          setDefinitions(data.definitions);
          setDefinitionError("");
        }
      })
      .catch((failure) => {
        if (active)
          setDefinitionError(
            failure.status === 403
              ? "FORBIDDEN"
              : failure.message || "Report definitions unavailable",
          );
      });
    return () => {
      active = false;
    };
  }, [refresh]);
  const request = useMemo(() => {
    if (!definition) return null;
    const result = {
      from: params.get("from"),
      to: params.get("to"),
      dateDimension:
        params.get("dateDimension") || definition.defaultDateDimension,
      page: Number(params.get("page") || 0),
      size: Number(params.get("size") || 20),
    };
    for (const key of [...definition.filters, "sort", "direction"])
      if (params.get(key)) result[key] = params.get(key);
    return result;
  }, [definition, params]);
  const requestKey = JSON.stringify([code, request]);
  useEffect(() => {
    if (!request) return;
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const operation =
      code === "invitations"
        ? adminService.invitationsReport(
            { ...request, view: "ledger" },
            controller.signal,
          )
        : adminService.managementReport(code, request, controller.signal);
    operation
      .then((data) => {
        if (active) {
          if (
            !data?.definition ||
            !data?.metadata?.snapshotId ||
            !Array.isArray(data.rows)
          )
            throw new Error("Incomplete report response");
          setSnapshot({ key: requestKey, data });
        }
      })
      .catch((failure) => {
        if (active)
          setError(
            failure.status === 403
              ? "FORBIDDEN"
              : failure.message || "Report unavailable",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [requestKey, refresh, request, code]); // requestKey captures the immutable serialized request; stale responses are discarded.
  const report = snapshot?.key === requestKey ? snapshot.data : null;
  const updateQuery = (patch) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch))
      if (value == null || value === "" || value === "ALL") next.delete(key);
      else next.set(key, String(value));
    setParams(next);
  };
  const chooseReport = (nextCode, extra = {}) =>
    setParams({
      report: nextCode,
      from: params.get("from"),
      to: params.get("to"),
      preset: params.get("preset") || "custom",
      ...extra,
    });
  const reset = () =>
    setParams({ report: code, ...reportPreset("last30"), preset: "last30" });
  const disabled = loading || Boolean(error) || !report || Boolean(exporting);
  const download = async (format, wholeWorkbook = false) => {
    const captured = {
      code: wholeWorkbook ? "all" : code,
      parameters: wholeWorkbook
        ? { from: request.from, to: request.to }
        : { ...request },
      definition,
    };
    setExporting(
      `${captured.code} \u00b7 ${captured.parameters.from} / ${captured.parameters.to}`,
    );
    setFeedback("");
    try {
      const result = await adminService.exportManagementReport(
        captured.code,
        format,
        captured.parameters,
      );
      const blob = result instanceof Blob ? result : result?.data;
      if (!(blob instanceof Blob) || blob.size === 0)
        throw new Error(text("exportError"));
      if (format === "html")
        setPreview({
          blob,
          title: reportLabel(captured.definition, lang),
          wide: captured.definition.columns.length > 6,
          from: captured.parameters.from,
          to: captured.parameters.to,
        });
      else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `koupreng-${captured.code}-${captured.parameters.from}-${captured.parameters.to}.${format}`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setFeedback(text("exported"));
      }
    } catch (failure) {
      let message =
        failure.status === 403 ? text("permission") : text("exportError");
      if (failure.data instanceof Blob) {
        try {
          const details = JSON.parse(await failure.data.text());
          if (details.message) message = details.message;
        } catch {
          /* A non-JSON proxy response has no safe message contract. */
        }
      } else if (failure.message) message = failure.message;
      setFeedback(message);
    } finally {
      setExporting("");
    }
  };
  const pageCsv = () =>
    exportCsv(
      `koupreng-${code}-page-${report.page + 1}`,
      report.definition.columns.map((column) => columnLabel(column, lang)),
      report.rows.map((row) =>
        report.definition.columns.map((column) =>
          ["DATETIME", "DATE"].includes(column.type)
            ? reportValue(row[column.key], column, lang, row)
            : row[column.key],
        ),
      ),
      [
        [
          "Scope",
          `CURRENT PAGE ${report.page + 1}; ${report.rows.length} of ${report.totalElements} matching records`,
        ],
        ["Snapshot", report.metadata.snapshotId],
        [
          "Period",
          `${params.get("from")} inclusive / ${params.get("to")} exclusive`,
        ],
        ["Timezone", "Asia/Phnom_Penh"],
        ["Date dimension", report.metadata.dateDimension],
        ["Filters", JSON.stringify(report.metadata.filters)],
      ],
    );
  let ledger;
  if (report) {
    const props = {
      report,
      lang,
      onQuery: updateQuery,
      disabled: loading,
      children: (
        <ReportAnalytics
          report={report}
          lang={lang}
          onCategory={(category) =>
            chooseReport("invitations", { eventType: category })
          }
        />
      ),
    };
    ledger = ["payments", "reconciliation"].includes(code) ? (
      <FinancialReportSection key={code} {...props} />
    ) : code === "invitations" ? (
      <InvitationsReportSection key={code} {...props} />
    ) : code === "engagement" ? (
      <GuestsRsvpCheckinSection {...props} />
    ) : code === "system" ? (
      <SystemHealthSection {...props} />
    ) : code === "subscriptions" ? (
      <SubscriptionsReportSection {...props} />
    ) : (
      <>
        {props.children}
        <ReportLedger key={code} {...props} />
      </>
    );
  }
  return (
    <section
      className="management-reports space-y-5"
      lang={lang}
      aria-busy={Boolean(definition) && loading}
    >
      <AdminPageHeader
        title={text("title")}
        subtitle={text("subtitle")}
        actions={
          <ActionButton
            disabled={loading && Boolean(definitions)}
            onClick={() => setRefresh((value) => value + 1)}
          >
            {text("refresh")}
          </ActionButton>
        }
      />
      {definitionError && (
        <div role="alert">
          {definitionError === "FORBIDDEN"
            ? text("permission")
            : definitionError}
          <ActionButton onClick={() => setRefresh((value) => value + 1)}>
            {text("retry")}
          </ActionButton>
        </div>
      )}
      {definitions && (
        <nav className="report-tabs" aria-label={text("title")}>
          {definitions.map((item) => (
            <button
              key={item.code}
              type="button"
              aria-current={code === item.code ? "page" : undefined}
              onClick={() => chooseReport(item.code)}
            >
              {reportLabel(item, lang)}
            </button>
          ))}
        </nav>
      )}
      {definition && (
        <>
          <ReportFilters
            definition={definition}
            params={params}
            onQuery={updateQuery}
            onReset={reset}
            lang={lang}
          />
          <div className="report-actions">
            <ActionButton disabled={disabled} onClick={() => download("xlsx")}>
              {text("excel")}
            </ActionButton>
            <ActionButton disabled={disabled} onClick={() => download("csv")}>
              {text("csvAll")}
            </ActionButton>
            <ActionButton disabled={disabled} onClick={pageCsv}>
              {text("csvPage")}
            </ActionButton>
            <ActionButton disabled={disabled} onClick={() => download("html")}>
              {text("preview")}
            </ActionButton>
            <ActionButton
              disabled={disabled}
              onClick={() => download("xlsx", true)}
            >
              {text("workbook")}
            </ActionButton>
          </div>
        </>
      )}
      <p role="status">
        {exporting
          ? `${text("exporting")} ${exporting}`
          : feedback || (loading && definition ? text("loading") : "")}
      </p>
      {error && (
        <div role="alert">
          {error === "FORBIDDEN" ? text("permission") : error}
          {report && <p>{text("stale")}</p>}
          <ActionButton onClick={() => setRefresh((value) => value + 1)}>
            {text("retry")}
          </ActionButton>
        </div>
      )}
      {definitions && !definition && (
        <div role="alert">
          {text("unavailable")}
          <ActionButton onClick={() => chooseReport("executive")}>
            {text("reset")}
          </ActionButton>
        </div>
      )}
      {report && (
        <>
          {code === "executive" && (
            <ReportOverviewCards summary={report.filteredSummary} lang={lang} />
          )}
          {ledger}
          <details className="card report-notes">
            <summary>{text("notes")}</summary>
            <p>
              {text("snapshot")}: {report.metadata.snapshotId} &middot;{" "}
              {reportValue(
                report.metadata.generatedAt,
                { type: "DATETIME" },
                lang,
              )}{" "}
              &middot; {report.metadata.timezone}
            </p>
            {report.notices.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </details>
        </>
      )}
      {preview && (
        <ReportPrintPreviewModal
          preview={preview}
          onClose={() => setPreview(null)}
          lang={lang}
        />
      )}
    </section>
  );
}
