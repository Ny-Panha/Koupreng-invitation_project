import { ActionButton } from "../../../shared/ui/AdminUI";
import { addDays, reportPreset, reportText } from "../reportModel";
const choices = {
  eventType: [
    "WEDDING",
    "ENGAGEMENT",
    "BIRTHDAY",
    "ANNIVERSARY",
    "CORPORATE",
    "OTHER",
  ],
  status: [
    "ACTIVE",
    "DISABLED",
    "INACTIVE",
    "PUBLISHED",
    "DRAFT",
    "UNPUBLISHED",
    "ARCHIVED",
    "PENDING_PAYMENT",
    "EXPIRED",
    "REPLACED",
    "FAILED",
    "UNMATCHED",
    "PENDING_REVIEW",
    "AMOUNT_MISMATCH",
    "DUPLICATE",
    "REJECTED",
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
  const text = (key) => reportText(key, lang);
  return (
    <section className="card report-filters" aria-label={text("period")}>
      <div className="report-filter-row">
        <label>
          {text("period")}
          <select
            value={params.get("preset") || "custom"}
            onChange={(event) =>
              onQuery({
                preset: event.target.value,
                ...(event.target.value === "custom"
                  ? {}
                  : reportPreset(event.target.value)),
                page: 0,
              })
            }
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
        <form
          className="report-date-form"
          key={`${params.get("from")}-${params.get("to")}`}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onQuery({
              from: data.get("from"),
              to: addDays(data.get("through"), 1),
              preset: "custom",
              page: 0,
            });
          }}
        >
          <label>
            {text("from")}
            <input
              name="from"
              type="date"
              required
              defaultValue={params.get("from")}
            />
          </label>
          <label>
            {text("through")}
            <input
              name="through"
              type="date"
              required
              min={params.get("from")}
              defaultValue={addDays(params.get("to"), -1)}
            />
          </label>
          <ActionButton type="submit">{text("apply")}</ActionButton>
        </form>
        <label>
          {text("dimension")}
          <select
            value={
              params.get("dateDimension") || definition.defaultDateDimension
            }
            onChange={(event) =>
              onQuery({ dateDimension: event.target.value, page: 0 })
            }
          >
            {definition.dateDimensions.map((key) => (
              <option key={key} value={key}>
                {text(key)}
              </option>
            ))}
          </select>
        </label>
        <ActionButton onClick={onReset}>{text("reset")}</ActionButton>
      </div>
      <div className="report-filter-row">
        {definition.filters
          .filter((key) => key !== "search")
          .map((key) =>
            choices[key] ? (
              <label key={key}>
                {text(key)}
                <select
                  aria-label={text(key)}
                  value={params.get(key) || ""}
                  onChange={(event) =>
                    onQuery({ [key]: event.target.value, page: 0 })
                  }
                >
                  <option value="">{text("all")}</option>
                  {(key === "status"
                    ? statusByReport[definition.code] || choices.status
                    : choices[key]
                  ).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            ) : (
              <form
                key={`${key}-${params.get(key) || ""}`}
                onSubmit={(event) => {
                  event.preventDefault();
                  onQuery({
                    [key]: new FormData(event.currentTarget).get(key),
                    page: 0,
                  });
                }}
              >
                <label>
                  {text(key)}
                  <input
                    name={key}
                    type={key === "packageId" ? "number" : "text"}
                    min={key === "packageId" ? 1 : undefined}
                    maxLength={80}
                    defaultValue={params.get(key) || ""}
                  />
                </label>
                <ActionButton type="submit">{text("apply")}</ActionButton>
              </form>
            ),
          )}
        {definition.filters.includes("search") && (
          <form
            key={`search-${params.get("search") || ""}`}
            onSubmit={(event) => {
              event.preventDefault();
              onQuery({
                search: new FormData(event.currentTarget).get("search"),
                page: 0,
              });
            }}
          >
            <label>
              {text("search")}
              <input
                name="search"
                type="search"
                maxLength={160}
                defaultValue={params.get("search") || ""}
              />
            </label>
            <ActionButton type="submit">{text("apply")}</ActionButton>
          </form>
        )}
      </div>
      <p>
        {params.get("from")} ≤ {text("dimension")} &lt; {params.get("to")} ·
        Asia/Phnom_Penh
      </p>
    </section>
  );
}
