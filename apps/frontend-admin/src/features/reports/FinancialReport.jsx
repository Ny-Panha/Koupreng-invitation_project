import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
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

function paymentChannelOf(row) {
  const method = String(row.method || row.paymentMethod || "").trim().toUpperCase();
  if (method.includes("ABA") || method.includes("KHQR") || method.includes("BAKONG")) return "digital";
  if (method.includes("CASH") || method.includes("សាច់ប្រាក់")) return "cash";
  return "other";
}

function expenseCategoryLabel(value) {
  const category = String(value || "").trim();
  const key = category.toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const labels = {
    "ATTIRE & MAKEUP": "សំលៀកបំពាក់ និងការតុបតែងមុខ",
    "ATTIRE AND MAKEUP": "សំលៀកបំពាក់ និងការតុបតែងមុខ",
    ATTIRE: "សំលៀកបំពាក់",
    MAKEUP: "ការតុបតែងមុខ",
    VENUE: "ទីតាំងកម្មវិធី",
    FOOD: "ម្ហូបអាហារ",
    CATERING: "ម្ហូបអាហារ និងសេវាកម្ម",
    DECOR: "ការតុបតែងកម្មវិធី",
    DECORATION: "ការតុបតែងកម្មវិធី",
    PHOTOGRAPHY: "ការថតរូប",
    VIDEOGRAPHY: "ការថតវីដេអូ",
    MUSIC: "តន្ត្រី",
    ENTERTAINMENT: "ការកម្សាន្ត",
    FLOWERS: "ផ្កា",
    TRANSPORTATION: "ការដឹកជញ្ជូន",
    INVITATIONS: "សំបុត្រអញ្ជើញ",
    CAKE: "នំខេក",
    OTHER: "ផ្សេងៗ",
  };
  return labels[key] || category || "ផ្សេងៗ";
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
  if (!value) return "-";

  let notes = value;
  if (typeof value === "string") {
    try {
      notes = JSON.parse(value);
    } catch {
      return value.trim() || "-";
    }
  }

  if (!notes || typeof notes !== "object" || Array.isArray(notes)) return "-";

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

  return [text, ...paymentDetails].filter(Boolean).join(" · ") || "-";
}

function displayText(value) {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text || "-";
}

export default function FinancialReport({ initialInvitationId = "", onInvitationChange }) {
  const { invitations, invitationId, setInvitationId, reportData, loading, error, refreshedAt } = useFinancialReportData(10000, initialInvitationId);
  const [invitationSearch, setInvitationSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const invitation = reportData?.invitation;
  const gifts = reportData?.gifts || [];
  const expenses = reportData?.expenses || [];
  const rsvpSummary = reportData?.rsvpSummary;
  const generatedAt = refreshedAt || new Date();

  const income = summarize(gifts, ["amount", "totalAmount"]);
  const digitalPayments = summarize(gifts.filter((gift) => paymentChannelOf(gift) === "digital"), ["amount", "totalAmount"]);
  const cashPayments = summarize(gifts.filter((gift) => paymentChannelOf(gift) === "cash"), ["amount", "totalAmount"]);
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
      <header className="afr-header">
        <div>
          <span className="afr-kicker">Event finance</span>
          <h1>របាយការណ៍សង្ខេបចំណូល និងចំណាយកម្មវិធី</h1>
        </div>
        <div className="afr-actions reports-screen-only">
          <a className="btn btn-secondary btn-sm" href="/reports"><ArrowLeft size={16} /> ត្រឡប់ទៅសង្ខេប</a>
          <div className="afr-invitation-picker">
            <label htmlFor="afr-invitation-search">ស្វែងរកកម្មវិធី ({invitations.length})</label>
            <input
              id="afr-invitation-search"
              type="search"
              value={invitationSearch}
              onChange={(event) => setInvitationSearch(event.target.value)}
              placeholder="ឈ្មោះកម្មវិធី ម្ចាស់កម្មវិធី ឬប្រភេទ"
            />
            <label className="afr-visually-hidden" htmlFor="afr-event-type">ត្រងតាមប្រភេទកម្មវិធី</label>
            <select
              id="afr-event-type"
              value={eventTypeFilter}
              onChange={(event) => setEventTypeFilter(event.target.value)}
            >
              <option value="">គ្រប់ប្រភេទកម្មវិធី</option>
              {eventTypes.map((type) => <option key={type} value={type}>{eventTypeLabel(type)}</option>)}
            </select>
            <label className="afr-visually-hidden" htmlFor="afr-invitation">ជ្រើសរើសកម្មវិធី</label>
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
          <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}><Printer size={16} /> Print</button>
        </div>
      </header>

      {loading ? <Loading /> : error ? <ErrorState message={error} /> : !invitationId ? (
        <p className="afr-empty">មិនមានកម្មវិធីសម្រាប់បង្ហាញ / No events available.</p>
      ) : (
        <>
          <section className="afr-event-heading">
            <h2>{eventDisplayName(invitation)}</h2>
            <div>
              {invitation?.eventType && <span><b>ប្រភេទ:</b> {eventTypeLabel(invitation.eventType)}</span>}
              {eventPeople(invitation) && eventPeople(invitation) !== eventDisplayName(invitation) && <span><b>ម្ចាស់កម្មវិធី:</b> {eventPeople(invitation)}</span>}
              <span><b>ថ្ងៃកម្មវិធី:</b> {formatDate(invitation?.eventDate)}</span>
              <span><b>បង្កើតនៅ:</b> {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(generatedAt)}</span>
            </div>
          </section>

          <section className="afr-summary-grid">
            <SummaryCard title="ចំណូលដែលបានកត់ត្រា / Recorded Income" totals={income} />
            <SummaryCard title="ចំណាយជាក់ស្តែង / Actual Expenses" totals={expense} />
            <BalanceSummaryCard title="សមតុល្យសុទ្ធ / Net Balance" totals={balance} />
            <SummaryCard title="អំណោយ / Gifts Recorded" value={gifts.length} />
            <SummaryCard title="ចំណាយមិនទាន់កត់ត្រាពិត / Actual Cost Missing" value={unrecordedExpenseCount} />
            <PaymentBreakdown digital={digitalPayments} cash={cashPayments} />
          </section>

          <section className="afr-section">
            <div className="afr-section-title"><div><span>RSVP / ATTENDANCE</span><h2>ស្ថិតិការឆ្លើយតប និងចំនួនអ្នកចូលរួម</h2></div></div>
            <div className="afr-rsvp-grid">
              <SummaryCard title="ភ្ញៀវអញ្ជើញ / Total Invited" value={rsvpSummary?.totalGuests ?? 0} />
              <SummaryCard title="RSVP ឆ្លើយថាចូលរួម / Attending Responses" value={rsvpSummary?.attending ?? 0} />
              <SummaryCard title="ចំនួនអ្នកចូលរួមបានបញ្ជាក់ / Confirmed Attendees" value={rsvpSummary?.totalAttendeeCount ?? 0} />
              <SummaryCard title="មិនចូលរួម / Not Attending" value={rsvpSummary?.notAttending ?? 0} />
              <SummaryCard title="មិនទាន់សម្រេច / Maybe" value={rsvpSummary?.maybe ?? 0} />
              <SummaryCard title="មិនទាន់ឆ្លើយ / Pending" value={rsvpSummary?.pending ?? 0} />
            </div>
          </section>

          <p className="afr-data-note no-print">{refreshedAt ? `បានធ្វើបច្ចុប្បន្នភាព: ${new Intl.DateTimeFormat("en-GB", { timeStyle: "medium" }).format(refreshedAt)}` : ""} កំណត់ត្រាចាស់ដែលមិនមាន currency ត្រូវបង្ហាញជា USD។ ប្រព័ន្ធមិនបម្លែងរវាង USD និង KHR ទេ។ ចំណូលសរុបរាប់តែអំណោយដែលបានកត់ត្រា ហើយចំណាយសរុបរាប់តែ actual cost ដែលមានតម្លៃ; ថវិកាគ្រោងមិនត្រូវបូកជាចំណាយពិតទេ។</p>

          <ReportTable title="តារាងអំណោយ និងចំណូលផ្សេងៗ" kicker="INCOME" headings={["ឈ្មោះអ្នកផ្តល់", "ក្រុម/ខាង", "ចំនួន", "វិធីបង់ប្រាក់", "ថ្ងៃទទួល", "កំណត់សម្គាល់"]}>
            {gifts.length ? gifts.map((gift, index) => <tr key={gift.id || index}><td>{gift.name || gift.giverName || "-"}</td><td>{displayText(gift.side) !== "-" ? displayText(gift.side) : displayText(gift.sideType)}</td><td className="afr-money-cell">{formatMoney(amountOf(gift, ["amount"]), currencyOf(gift))}</td><td>{gift.method || gift.paymentMethod || "-"}</td><td>{formatDate(gift.date || gift.receivedDate)}</td><td>{gift.note || "-"}</td></tr>) : <EmptyRow count={6} />}
          </ReportTable>

          <ReportTable title="តារាងថវិកាគ្រោង និងចំណាយជាក់ស្តែង" kicker="EXPENSES" headings={["ប្រភេទ", "អ្នកផ្គត់ផ្គង់", "ថវិកាគ្រោង", "ចំណាយជាក់ស្តែង", "ថ្ងៃបង់ប្រាក់", "កំណត់ចំណាំ"]}>
            {expenses.length ? expenses.map((item, index) => <tr key={item.id || index}>
              <td><span className="afr-category">{expenseCategoryLabel(item.category)}</span></td>
              <td>{item.vendorName || "-"}</td>
              <td className="afr-money-cell">{hasAmount(item, ["estimatedCost", "budget"]) ? formatMoney(amountOf(item, ["estimatedCost", "budget"]), currencyOf(item)) : "—"}</td>
              <td className="afr-money-cell">{hasAmount(item, ["actualCost", "amount"]) ? formatMoney(amountOf(item, ["actualCost", "amount"]), currencyOf(item)) : "មិនទាន់កត់ត្រា / Not recorded"}</td>
              <td>{formatDate(item.date || item.expenseDate)}</td>
              <td>{formatExpenseNotes(item.notes || item.note, currencyOf(item))}</td>
            </tr>) : <EmptyRow count={6} />}
          </ReportTable>

          <footer className="afr-signatures reports-print-only">
            <Signature title="អ្នករៀបចំកម្មវិធី" subtitle="ហត្ថលេខា / ស្នាមមេដៃអ្នករៀបចំ" />
            <Signature title="ម្ចាស់កម្មវិធី" subtitle="ហត្ថលេខា / ស្នាមមេដៃម្ចាស់កម្មវិធី" />
          </footer>
        </>
      )}
    </main>
  );
}

function eventDisplayName(invitation) {
  return invitation?.title || eventPeople(invitation) || `កម្មវិធី #${invitation?.id || ""}`;
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

function SummaryCard({ title, totals, value }) {
  return <article className="afr-summary-card"><span>{title}</span>{totals ? <><strong>{formatMoney(totals.USD, "USD")}</strong><strong>{formatMoney(totals.KHR, "KHR")}</strong></> : <strong>{typeof value === "number" ? new Intl.NumberFormat("en-US").format(value) : value}</strong>}</article>;
}

function BalanceSummaryCard({ title, totals }) {
  return <article className="afr-summary-card afr-balance-card">
    <span>{title}</span>
    {(["USD", "KHR"]).map((currency) => {
      const amount = totals[currency];
      return <strong className={amount < 0 ? "afr-deficit" : ""} key={currency}>
        {amount < 0 ? `Deficit ${formatMoney(Math.abs(amount), currency)}` : formatMoney(amount, currency)}
      </strong>;
    })}
  </article>;
}

function PaymentBreakdown({ digital, cash }) {
  return <article className="afr-summary-card afr-payment-card">
    <span>ការទូទាត់តាមវិធី / Payment Breakdown</span>
    <div className="afr-payment-channels">
      <div className="afr-payment-channel">
        <b>ABA / KHQR</b>
        <div className="afr-payment-amounts"><span>USD</span><strong>{formatMoney(digital.USD, "USD")}</strong><span>KHR</span><strong>{formatMoney(digital.KHR, "KHR")}</strong></div>
      </div>
      <div className="afr-payment-channel">
        <b>សាច់ប្រាក់ / Cash</b>
        <div className="afr-payment-amounts"><span>USD</span><strong>{formatMoney(cash.USD, "USD")}</strong><span>KHR</span><strong>{formatMoney(cash.KHR, "KHR")}</strong></div>
      </div>
    </div>
  </article>;
}

function ReportTable({ title, kicker, headings, children }) {
  return <section className="afr-section"><div className="afr-section-title"><div><span>{kicker}</span><h2>{title}</h2></div></div><div className="afr-table-wrap"><table><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{children}</tbody></table></div></section>;
}

function EmptyRow({ count }) {
  return <tr><td colSpan={count} className="afr-empty">មិនមានទិន្នន័យ / No records</td></tr>;
}

function Signature({ title, subtitle }) {
  return <div className="afr-signature"><div /><strong>{title}</strong><span>{subtitle}</span></div>;
}
