import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Printer,
  Search,
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  HelpCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Wallet,
  Gift,
  AlertTriangle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { ErrorState, Loading } from "../../shared/ui";
import { useFinancialReportData } from "./useFinancialReportData";
import "./FinancialReport.css";

function currencyOf(row) {
  const value = String(row.currency || row.currencyCode || row.amountCurrency || "USD").toUpperCase();
  return value === "KHR" || value === "RIEL" || value === "៛" ? "KHR" : "USD";
}

function amountOf(row, keys) {
  for (const key of keys) {
    if (row[key] !== null && row[key] !== undefined && row[key] !== "") {
      const amount = Number(row[key]);
      return Number.isFinite(amount) ? amount : 0;
    }
  }
  return 0;
}

function hasAmount(row, keys) {
  return keys.some((key) => row[key] !== null
    && row[key] !== undefined
    && row[key] !== ""
    && Number.isFinite(Number(row[key])));
}

function formatMoney(value, currency) {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: currency === "KHR" ? 0 : 2,
    minimumFractionDigits: currency === "KHR" ? 0 : 2,
  }).format(Number(value) || 0);
  return currency === "KHR" ? `${formatted} ៛` : `$${formatted}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function summarize(rows, amountKeys) {
  return rows.reduce((total, row) => {
    total[currencyOf(row)] += amountOf(row, amountKeys);
    return total;
  }, { USD: 0, KHR: 0 });
}

function formatExpenseNotes(value, currency) {
  if (!value) return "—";

  let notes = value;
  if (typeof value === "string") {
    try {
      notes = JSON.parse(value);
    } catch {
      return value.trim() || "—";
    }
  }

  if (!notes || typeof notes !== "object" || Array.isArray(notes)) return "—";

  const text = typeof notes.text === "string" ? notes.text.trim() : "";
  const payments = Array.isArray(notes.payments) ? notes.payments : [];
  const paymentDetails = payments.map((payment) => {
    const description = String(payment?.desc || payment?.description || "").trim();
    const amount = payment?.amount === null || payment?.amount === undefined || payment?.amount === ""
      ? ""
      : formatMoney(payment.amount, currency);
    if (!description && !amount) return "";
    if (!description) return amount;
    return amount ? `${description}: ${amount}` : description;
  }).filter(Boolean);

  return [text, ...paymentDetails].filter(Boolean).join(" · ") || "—";
}

export default function FinancialReport({ initialInvitationId = "", onInvitationChange }) {
  const { invitations, invitationId, setInvitationId, reportData, loading, error, refreshedAt } = useFinancialReportData(10000, initialInvitationId);
  const [invitationSearch, setInvitationSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");

  const selectedFromList = useMemo(() => {
    return invitations.find((item) => String(item.id) === String(invitationId));
  }, [invitations, invitationId]);

  const invitation = useMemo(() => {
    return reportData?.invitation || selectedFromList || null;
  }, [reportData?.invitation, selectedFromList]);

  const gifts = reportData?.gifts || [];
  const expenses = reportData?.expenses || [];
  const rsvpSummary = reportData?.rsvpSummary;
  const generatedAt = refreshedAt || new Date();

  const income = summarize(gifts, ["amount", "totalAmount"]);
  const actualExpenses = expenses.filter((item) => hasAmount(item, ["actualCost", "amount"]));
  const unrecordedExpenseCount = expenses.length - actualExpenses.length;
  const expense = summarize(actualExpenses, ["actualCost", "amount"]);
  const balance = { USD: income.USD - expense.USD, KHR: income.KHR - expense.KHR };

  const visibleInvitations = useMemo(() => {
    const query = invitationSearch.trim().toLowerCase();
    const filtered = invitations.filter((item) => {
      const matchesType = !eventTypeFilter || item.eventType === eventTypeFilter;
      const matchesSearch = !query || [
        item.title,
        item.ownerName,
        item.hostName,
        item.partnerName,
        item.groomName,
        item.brideName,
        item.eventType,
        item.slug,
        item.eventDate,
        item.id,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesType && matchesSearch;
    });
    if (invitationId && !filtered.some((item) => String(item.id) === invitationId)) {
      const selected = invitations.find((item) => String(item.id) === invitationId);
      return selected ? [selected, ...filtered] : filtered;
    }
    return filtered;
  }, [invitations, invitationId, invitationSearch, eventTypeFilter]);

  const eventTypes = useMemo(() => [...new Set(invitations.map((item) => item.eventType).filter(Boolean))].sort(), [invitations]);

  useEffect(() => {
    if (initialInvitationId && String(initialInvitationId) !== invitationId) {
      setInvitationId(String(initialInvitationId));
    }
  }, [initialInvitationId, invitationId, setInvitationId]);

  return (
    <main className="admin-financial-report">
      <header className="afr-header reports-screen-only">
        <div className="afr-header-text">
          <span className="afr-kicker">Event finance</span>
          <h1>របាយការណ៍សង្ខេបចំណូល និងចំណាយកម្មវិធី</h1>
          <p className="afr-header-subtitle">
            ទិដ្ឋភាពទូទៅនៃចំណូលអំណោយ ថវិកាគ្រោង ចំណាយជាក់ស្តែង និងស្ថិតិ RSVP តាមកម្មវិធី
          </p>
        </div>
        <div className="afr-actions">
          <a className="btn btn-secondary btn-sm afr-back-btn" href="/reports">
            <ArrowLeft size={16} /> ត្រឡប់ទៅសង្ខេប
          </a>
          <button type="button" className="btn btn-primary btn-sm afr-print-btn" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
        </div>
      </header>

      <section className="afr-filter-card reports-screen-only" aria-label="ផ្ទាំងជ្រើសរើសកម្មវិធី">
        <div className="afr-invitation-picker">
          <div className="afr-picker-field">
            <label htmlFor="afr-invitation-search">ស្វែងរកកម្មវិធី ({invitations.length})</label>
            <div className="afr-input-with-icon">
              <Search size={15} />
              <input
                id="afr-invitation-search"
                type="search"
                value={invitationSearch}
                onChange={(event) => setInvitationSearch(event.target.value)}
                placeholder="ឈ្មោះកម្មវិធី ម្ចាស់កម្មវិធី ឬប្រភេទ"
              />
            </div>
          </div>

          <div className="afr-picker-field">
            <label htmlFor="afr-event-type">ត្រងតាមប្រភេទកម្មវិធី</label>
            <select
              id="afr-event-type"
              aria-label="ត្រងតាមប្រភេទកម្មវិធី"
              value={eventTypeFilter}
              onChange={(event) => setEventTypeFilter(event.target.value)}
            >
              <option value="">គ្រប់ប្រភេទកម្មវិធី</option>
              {eventTypes.map((type) => <option key={type} value={type}>{eventTypeLabel(type)}</option>)}
            </select>
          </div>

          <div className="afr-picker-field afr-picker-field-wide">
            <label htmlFor="afr-invitation">ជ្រើសរើសកម្មវិធី</label>
            <select
              id="afr-invitation"
              value={invitationId}
              onChange={(event) => {
                setInvitationId(event.target.value);
                onInvitationChange?.(event.target.value);
              }}
              aria-label="ជ្រើសរើសកម្មវិធី"
            >
              <option value="">ជ្រើសរើសកម្មវិធី</option>
              {visibleInvitations.map((item) => <option key={item.id} value={item.id}>{invitationLabel(item)}</option>)}
            </select>
          </div>
        </div>
      </section>

      {loading && !reportData ? (
        <Loading />
      ) : error && !reportData ? (
        <ErrorState message={error} />
      ) : !invitationId ? (
        <p className="afr-empty">មិនមានកម្មវិធីសម្រាប់បង្ហាញ / No events available.</p>
      ) : (
        <>
          <section className="afr-event-heading">
            <div className="afr-event-heading-top">
              <h2>{eventDisplayName(invitation, invitationId)}</h2>
              {invitation?.eventType && (
                <span className="afr-event-badge">
                  <Tag size={13} /> {eventTypeLabel(invitation.eventType)}
                </span>
              )}
            </div>
            <div>
              {invitation?.eventType && (
                <span className="afr-meta-item">
                  <Tag size={14} /> <b>ប្រភេទ:</b> {eventTypeLabel(invitation.eventType)}
                </span>
              )}
              {eventPeople(invitation) && eventPeople(invitation) !== eventDisplayName(invitation, invitationId) && (
                <span className="afr-meta-item">
                  <Users size={14} /> <b>ម្ចាស់កម្មវិធី:</b> {eventPeople(invitation)}
                </span>
              )}
              <span className="afr-meta-item">
                <CalendarDays size={14} /> <b>ថ្ងៃកម្មវិធី:</b> {formatDate(invitation?.eventDate)}
              </span>
              <span className="afr-meta-item">
                <Clock size={14} /> <b>បង្កើតនៅ:</b> {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(generatedAt)}
              </span>
            </div>
          </section>

          <section className="afr-summary-grid">
            <SummaryCard
              title="ចំណូលដែលបានកត់ត្រា / Recorded Income"
              totals={income}
              tone="emerald"
              icon={TrendingUp}
            />
            <SummaryCard
              title="ចំណាយជាក់ស្តែង / Actual Expenses"
              totals={expense}
              tone="rose"
              icon={TrendingDown}
            />
            <SummaryCard
              title="សមតុល្យតាមកំណត់ត្រា / Recorded Net Balance"
              totals={balance}
              tone={balance.USD >= 0 ? "cyan" : "rose"}
              icon={Wallet}
            />
            <SummaryCard
              title="អំណោយ / Gifts Recorded"
              value={gifts.length}
              tone="purple"
              icon={Gift}
            />
            <SummaryCard
              title="ចំណាយមិនទាន់កត់ត្រាពិត / Actual Cost Missing"
              value={unrecordedExpenseCount}
              tone="amber"
              icon={AlertTriangle}
            />
          </section>

          <section className="afr-section">
            <div className="afr-section-title">
              <div>
                <span>RSVP / ATTENDANCE</span>
                <h2>ស្ថិតិការឆ្លើយតប និងចំនួនអ្នកចូលរួម</h2>
              </div>
            </div>
            <div className="afr-rsvp-grid">
              <SummaryCard
                title="ភ្ញៀវអញ្ជើញ / Total Invited"
                value={rsvpSummary?.totalGuests ?? 0}
                tone="slate"
                icon={Users}
              />
              <SummaryCard
                title="RSVP ឆ្លើយថាចូលរួម / Attending Responses"
                value={rsvpSummary?.attending ?? 0}
                tone="emerald"
                icon={UserCheck}
              />
              <SummaryCard
                title="ចំនួនអ្នកចូលរួមបានបញ្ជាក់ / Confirmed Attendees"
                value={rsvpSummary?.totalAttendeeCount ?? 0}
                tone="cyan"
                icon={CheckCircle2}
              />
              <SummaryCard
                title="មិនចូលរួម / Not Attending"
                value={rsvpSummary?.notAttending ?? 0}
                tone="rose"
                icon={UserX}
              />
              <SummaryCard
                title="មិនទាន់សម្រេច / Maybe"
                value={rsvpSummary?.maybe ?? 0}
                tone="amber"
                icon={HelpCircle}
              />
              <SummaryCard
                title="មិនទាន់ឆ្លើយ / Pending"
                value={rsvpSummary?.pending ?? 0}
                tone="slate"
                icon={Clock}
              />
            </div>
          </section>

          <ReportTable
            title="តារាងអំណោយ និងចំណូលផ្សេងៗ"
            kicker="INCOME"
            headings={["ឈ្មោះអ្នកផ្តល់", "ក្រុម/ខាង", "ចំនួន", "វិធីបង់ប្រាក់", "ថ្ងៃទទួល", "កំណត់សម្គាល់"]}
          >
            {gifts.length ? (
              gifts.map((gift, index) => (
                <tr key={gift.id || index}>
                  <td>{gift.name || gift.giverName || "—"}</td>
                  <td>{gift.side || gift.sideType || "—"}</td>
                  <td>{formatMoney(amountOf(gift, ["amount"]), currencyOf(gift))}</td>
                  <td>{gift.method || gift.paymentMethod || "—"}</td>
                  <td>{formatDate(gift.date || gift.receivedDate)}</td>
                  <td>{gift.note || "—"}</td>
                </tr>
              ))
            ) : (
              <EmptyRow count={6} />
            )}
          </ReportTable>

          <ReportTable
            title="តារាងថវិកាគ្រោង និងចំណាយជាក់ស្តែង"
            kicker="EXPENSES"
            headings={["ប្រភេទ", "អ្នកផ្គត់ផ្គង់", "ថវិកាគ្រោង", "ចំណាយជាក់ស្តែង", "ថ្ងៃបង់ប្រាក់", "កំណត់ចំណាំ"]}
          >
            {expenses.length ? (
              expenses.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{item.category || "ផ្សេងៗ"}</td>
                  <td>{item.vendorName || "—"}</td>
                  <td>{hasAmount(item, ["estimatedCost", "budget"]) ? formatMoney(amountOf(item, ["estimatedCost", "budget"]), currencyOf(item)) : "—"}</td>
                  <td>{hasAmount(item, ["actualCost", "amount"]) ? formatMoney(amountOf(item, ["actualCost", "amount"]), currencyOf(item)) : "មិនទាន់កត់ត្រា / Not recorded"}</td>
                  <td>{formatDate(item.date || item.expenseDate)}</td>
                  <td>{formatExpenseNotes(item.notes || item.note, currencyOf(item))}</td>
                </tr>
              ))
            ) : (
              <EmptyRow count={6} />
            )}
          </ReportTable>

          <p className="afr-data-note">
            {refreshedAt ? `បានធ្វើបច្ចុប្បន្នភាព: ${new Intl.DateTimeFormat("en-GB", { timeStyle: "medium" }).format(refreshedAt)} · ` : ""}
            កំណត់ត្រាចាស់ដែលមិនមាន currency ត្រូវបង្ហាញជា USD។ ប្រព័ន្ធមិនបម្លែងរវាង USD និង KHR ទេ។ ចំណូលសរុបរាប់តែអំណោយដែលបានកត់ត្រា ហើយចំណាយសរុបរាប់តែ actual cost ដែលមានតម្លៃ; ថវិកាគ្រោងមិនត្រូវបូកជាចំណាយពិតទេ។
          </p>

          <footer className="afr-signatures reports-print-only">
            <Signature title="អ្នករៀបចំកម្មវិធី" subtitle="ហត្ថលេខា / ស្នាមមេដៃអ្នករៀបចំ" />
            <Signature title="ម្ចាស់កម្មវិធី" subtitle="ហត្ថលេខា / ស្នាមមេដៃម្ចាស់កម្មវិធី" />
          </footer>
        </>
      )}
      <div className="afr-page-number" aria-hidden="true" />
    </main>
  );
}

function eventDisplayName(invitation, fallbackId = "") {
  return invitation?.title || eventPeople(invitation) || (invitation?.id || fallbackId ? `កម្មវិធី #${invitation?.id || fallbackId}` : "កម្មវិធី");
}

function eventPeople(invitation) {
  const couple = [invitation?.groomName, invitation?.brideName].filter(Boolean).join(" & ");
  return couple || [invitation?.hostName, invitation?.partnerName].filter(Boolean).join(" & ") || invitation?.ownerName || "";
}

function eventTypeLabel(type) {
  const labels = {
    WEDDING: "អាពាហ៍ពិពាហ៍",
    ENGAGEMENT: "ពិធីភ្ជាប់ពាក្យ",
    BIRTHDAY: "ខួបកំណើត",
    ANNIVERSARY: "ខួបអនុស្សាវរីយ៍",
    CORPORATE: "កម្មវិធីស្ថាប័ន",
    OTHER: "កម្មវិធីផ្សេងៗ",
  };
  return labels[type] || String(type || "កម្មវិធីផ្សេងៗ");
}

function invitationLabel(invitation) {
  const primary = eventDisplayName(invitation);
  const details = [
    eventPeople(invitation) !== primary ? eventPeople(invitation) : "",
    invitation.eventType ? eventTypeLabel(invitation.eventType) : "",
    invitation.eventDate ? formatDate(invitation.eventDate) : "",
  ].filter(Boolean);
  return details.length ? `${primary} · ${details.join(" · ")}` : primary;
}

function SummaryCard({ title, totals, value, tone = "slate", icon: Icon }) {
  return (
    <article className={`afr-summary-card afr-card--${tone}`}>
      <div className="afr-card-head">
        <span>{title}</span>
        {Icon && (
          <div className="afr-card-icon" aria-hidden="true">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="afr-card-values">
        {totals ? (
          <>
            <strong>{formatMoney(totals.USD, "USD")}</strong>
            <strong className="afr-khr-value">{formatMoney(totals.KHR, "KHR")}</strong>
          </>
        ) : (
          <strong>{typeof value === "number" ? new Intl.NumberFormat("en-US").format(value) : value}</strong>
        )}
      </div>
    </article>
  );
}

function ReportTable({ title, kicker, headings, children }) {
  return (
    <section className="afr-section">
      <div className="afr-section-title">
        <div>
          <span>{kicker}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="afr-table-wrap">
        <table>
          <thead>
            <tr>
              {headings.map((heading) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  );
}

function EmptyRow({ count }) {
  return (
    <tr>
      <td colSpan={count} className="afr-empty">
        មិនមានទិន្នន័យ / No records
      </td>
    </tr>
  );
}

function Signature({ title, subtitle }) {
  return (
    <div className="afr-signature">
      <div />
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}
