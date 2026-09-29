const CURRENCY_FIELDS = ["currency", "currencyCode", "amountCurrency", "currencyType"];

export function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

export function normalizeCurrency(record) {
  const currency = CURRENCY_FIELDS.map((field) => record?.[field]).find(Boolean);
  const normalized = String(currency || "USD").trim().toUpperCase();
  return normalized === "KHR" || normalized === "RIEL" || normalized === "៛" ? "KHR" : "USD";
}

function numericAmount(record, fields) {
  for (const field of fields) {
    const value = record?.[field];
    if (value !== null && value !== undefined && value !== "") {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount : 0;
    }
  }
  return 0;
}

function guestSide(guest) {
  const value = String(guest?.sideType || guest?.side || guest?.guestGroup || "").toUpperCase();
  if (value.includes("GROOM") || value.includes("GROOM_SIDE")) return "ខាងកូនកំលោះ";
  if (value.includes("BRIDE") || value.includes("BRIDE_SIDE")) return "ខាងកូនក្រមុំ";
  if (value.includes("FRIEND")) return "មិត្តភក្តិ";
  return "មិនបានកំណត់";
}

function paymentMethod(value) {
  const method = String(value || "").trim();
  if (!method) return "—";
  if (/aba|bakong|qr/i.test(method)) return "ABA QR";
  if (/cash/i.test(method)) return "សាច់ប្រាក់ / Cash";
  return method;
}

function addByCurrency(totals, amount, currency) {
  totals[currency] += amount;
}

export function buildFinancialReport({ invitation, gifts = [], expenses = [], guests = [], rsvps = [] }) {
  const guestByName = new Map(guests.map((guest) => [
    String(guest.guestName || guest.name || "").trim().toLowerCase(),
    guest,
  ]));
  const incomeRows = gifts.map((gift, index) => {
    const name = gift.name || gift.giverName || gift.guestName || "";
    const linkedGuest = guestByName.get(String(name).trim().toLowerCase());
    return {
      id: gift.id || `gift-${index}`,
      name,
      side: guestSide(linkedGuest || gift),
      amount: numericAmount(gift, ["amount", "totalAmount"]),
      currency: normalizeCurrency(gift),
      method: paymentMethod(gift.method || gift.paymentMethod),
      note: gift.note || "",
    };
  });
  const expenseRows = expenses.map((expense, index) => ({
    id: expense.id || `expense-${index}`,
    category: expense.category || "ផ្សេងៗ / Other",
    vendor: expense.vendorName || expense.vendor || "",
    amount: numericAmount(expense, ["actualCost", "amount"]),
    currency: normalizeCurrency(expense),
    date: expense.date || expense.expenseDate || "",
  }));

  const totalIncome = { USD: 0, KHR: 0 };
  const totalExpenses = { USD: 0, KHR: 0 };
  incomeRows.forEach((row) => addByCurrency(totalIncome, row.amount, row.currency));
  expenseRows.forEach((row) => addByCurrency(totalExpenses, row.amount, row.currency));

  const attending = rsvps.filter((rsvp) => {
    const status = String(rsvp.responseStatus || rsvp.status || "").toUpperCase();
    return ["ATTENDING", "ACCEPTED", "YES"].includes(status);
  }).length;

  return {
    invitation,
    incomeRows,
    expenseRows,
    totalIncome,
    totalExpenses,
    netBalance: {
      USD: totalIncome.USD - totalExpenses.USD,
      KHR: totalIncome.KHR - totalExpenses.KHR,
    },
    guestStats: {
      invited: guests.length,
      attending,
      gifted: incomeRows.length,
    },
  };
}