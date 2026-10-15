import { useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ActionButton } from "../../../shared/ui/AdminUI";
import { addDays, reportPreset } from "../reportModel";
import { periodLabel, valueLabel, workspaceText } from "../reportWorkspace";
import ReportDrawer from "./ReportDrawer";

const choices = {
  status: ["ACTIVE", "DISABLED", "INACTIVE", "PUBLISHED", "DRAFT", "UNPUBLISHED", "ARCHIVED", "PENDING_PAYMENT", "EXPIRED", "REPLACED", "FAILED", "UNMATCHED", "PENDING_REVIEW", "AMOUNT_MISMATCH", "DUPLICATE", "REJECTED"],
  eventType: [
    "WEDDING",
    "ENGAGEMENT",
    "BIRTHDAY",
    "ANNIVERSARY",
    "CORPORATE",
    "OTHER",
  ],
  moderationStatus: ["ACTIVE", "HIDDEN", "REPORTED", "SUSPENDED"],
  paymentType: ["TEMPLATE", "SUBSCRIPTION"],
  paymentStatus: [
    "PENDING",
    "QR_CREATED",
    "CHECKOUT_CREATED",
    "PAID_PENDING_REVIEW",
    "REVIEW_REQUIRED",
    "PAID",
    "FAILED",
    "CANCELLED",
    "EXPIRED",
    "REJECTED",
    "UNKNOWN",
  ],
  currency: ["USD", "KHR"],
};
const statusByReport = {
  invitations: ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"],
  engagement: ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"],
  users: ["ACTIVE", "DISABLED"],
  templates: ["ACTIVE", "INACTIVE"],
  subscriptions: [
    "ACTIVE",
    "PENDING_PAYMENT",
    "REVIEW_REQUIRED",
    "EXPIRED",
    "REPLACED",
  ],
};
export default function ReportFilters({
  definition,
  params,
  onQuery,
  onReset,
  lang,
}) {
  const [open, setOpen] = useState(false),
    form = useRef(null);
  const text = (key) => workspaceText(key, lang);
  const primary = definition.filters.includes("status")
    ? "status"
    : definition.filters.includes("paymentStatus")
      ? "paymentStatus"
      : null;
  const advanced = definition.filters.filter(
    (key) => key !== "search" && key !== primary,
  );
  const active = definition.filters.filter((key) => params.get(key));
  const dimension =
    params.get("dateDimension") || definition.defaultDateDimension;
  const dimensionChanged = dimension !== definition.defaultDateDimension;
  const count =
    advanced.filter((key) => params.get(key)).length +
    Number(dimensionChanged) +
    Number(params.get("preset") === "custom");
  const options = (key) =>
    key === "status" ? statusByReport[definition.code] || choices.status : choices[key];
  const openFilters = () => { form.current?.reset(); setOpen(true); };
  const select = (key, quick = false) => (
    <label key={key}>
      {text(key)}
      <select
        name={key}
        aria-label={text(key)}
        {...(quick
          ? {
              value: params.get(key) || "",
              onChange: (event) =>
                onQuery({ [key]: event.target.value, page: 0 }),
            }
          : { defaultValue: params.get(key) || "" })}
      >
        <option value="">{text("all")}</option>
        {options(key).map((value) => (
          <option value={value} key={value}>
            {valueLabel(value, lang)}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section className="report-filters" aria-label={text("period")}>
      <div className="report-quick-filters">
        <label className="report-period-select">
          {text("period")}
          <select
            aria-label={text("period")}
            value={params.get("preset") || "custom"}
            onChange={(event) => {
              if (event.target.value === "custom") openFilters();
              else
                onQuery({
                  preset: event.target.value,
                  ...reportPreset(event.target.value),
                  page: 0,
                });
            }}
          >
            {[
              "today",
              "last7",
              "last30",
              "thisMonth",
              "previousMonth",
              "thisYear",
              "custom",
            ].map((key) => (
              <option value={key} key={key}>
                {text(key)}
              </option>
            ))}
          </select>
        </label>
        {definition.filters.includes("search") && (
          <form
            className="report-search"
            key={`search-${params.get("search") || ""}`}
            onSubmit={(event) => {
              event.preventDefault();
              onQuery({
                search: new FormData(event.currentTarget).get("search").trim(),
                page: 0,
              });
            }}
          >
            <label>
              {text("search")}
              <span>
                <input
                  name="search"
                  type="search"
                  aria-label={text("search")}
                  maxLength={160}
                  defaultValue={params.get("search") || ""}
                  placeholder={text("search")}
                />
                <button type="submit" aria-label={text("apply")}>
                  <Search size={18} aria-hidden="true" />
                </button>
              </span>
            </label>
          </form>
        )}
        {primary && select(primary, true)}
        <ActionButton
          onClick={openFilters}
          className="report-more-filters"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          {text("moreFilters")}
          {count > 0 && <span className="report-count">{count}</span>}
        </ActionButton>
        {(active.length > 0 || dimensionChanged) && (
          <button
            type="button"
            className="report-text-button"
            onClick={onReset}
          >
            {text("clearFilters")}
          </button>
        )}
      </div>
      <div className="report-period-caption">
        <strong>
          {periodLabel(params.get("from"), params.get("to"), lang)}
        </strong>
        <span>
          {text("dateScope")}: {text(dimension)} · {text("periodHint")}
        </span>
      </div>
      <p className="report-date-explanation">{text(`${dimension}Hint`)}</p>
      {(active.length > 0 || dimensionChanged) && (
        <div className="report-filter-chips" aria-label={text("clearFilters")}>
          {active.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => onQuery({ [key]: "", page: 0 })}
              aria-label={`${text("removeFilter")}: ${text(key)} ${valueLabel(params.get(key), lang)}`}
            >
              {text(key)}: {valueLabel(params.get(key), lang)}
              <X size={13} aria-hidden="true" />
            </button>
          ))}
          {dimensionChanged && (
            <button
              type="button"
              onClick={() => onQuery({ dateDimension: "", page: 0 })}
            >
              {text("dimension")}: {text(dimension)}
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      <ReportDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={text("moreFilters")}
        lang={lang}
      >
        <form
          ref={form}
          key={params.toString()}
          className="report-advanced-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget),
              from = data.get("from"),
              to = addDays(data.get("through"), 1);
            const patch = {
              from,
              to,
              preset:
                from === params.get("from") && to === params.get("to")
                  ? params.get("preset")
                  : "custom",
              dateDimension: data.get("dateDimension"),
              page: 0,
            };
            for (const key of advanced) patch[key] = data.get(key);
            onQuery(patch);
            setOpen(false);
          }}
        >
          <p className="report-muted">{text("advancedHint")}</p>
          <fieldset>
            <legend>{text("period")}</legend>
            <div className="report-date-fields">
              <label>
                {text("from")}
                <input
                  name="from"
                  type="date"
                  required
                  defaultValue={params.get("from") || ""}
                  onChange={(event) => {
                    form.current.elements.through.min = event.target.value;
                  }}
                />
              </label>
              <label>
                {text("through")}
                <input
                  name="through"
                  type="date"
                  required
                  min={params.get("from") || ""}
                  defaultValue={addDays(params.get("to"), -1)}
                />
              </label>
            </div>
            <p className="report-muted">{text("periodHint")}</p>
          </fieldset>
          <label>
            {text("dimension")}
            <select name="dateDimension" defaultValue={dimension}>
              {definition.dateDimensions.map((key) => (
                <option key={key} value={key}>
                  {text(key)}
                </option>
              ))}
            </select>
          </label>
          {advanced.map((key) =>
            options(key) ? (
              select(key)
            ) : (
              <label key={key}>
                {text(key)}
                <input
                  name={key}
                  type={key === "packageId" ? "number" : "text"}
                  min={key === "packageId" ? 1 : undefined}
                  maxLength={80}
                  defaultValue={params.get(key) || ""}
                />
              </label>
            ),
          )}
          <footer className="report-drawer-footer">
            <ActionButton type="button" onClick={() => setOpen(false)}>
              {text("cancel")}
            </ActionButton>
            <button type="submit" className="report-primary-button">
              {text("applyFilters")}
            </button>
          </footer>
        </form>
      </ReportDrawer>
    </section>
  );
}
