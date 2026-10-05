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

export function buildFinancialReport({ invitation, gifts = [], expenses = [], guests = [], rsvps = [], checkIns = [] }) {
  const guestById = new Map(guests
    .filter((guest) => guest.id != null || guest.guestId != null)
    .map((guest) => [String(guest.id ?? guest.guestId), guest]));
  const guestsByName = new Map();
  guests.forEach((guest) => {
    const nameKey = String(guest.guestName || guest.name || "").trim().toLowerCase();
    if (!nameKey) return;
    const matches = guestsByName.get(nameKey) || [];
    matches.push(guest);
    guestsByName.set(nameKey, matches);
  });
  const incomeRows = gifts.map((gift, index) => {
    const name = gift.name || gift.giverName || gift.guestName || "";
    const guestId = gift.guestId ?? gift.guest_id;
    const sameNameGuests = guestsByName.get(String(name).trim().toLowerCase()) || [];
    const linkedGuest = guestId != null
      ? guestById.get(String(guestId))
      : sameNameGuests.length === 1 ? sameNameGuests[0] : null;
    return {
      id: gift.id || `gift-${index}`,
      guestId: guestId ?? null,
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
    budget: numericAmount(expense, ["estimatedCost", "budget", "plannedCost"]),
    amount: numericAmount(expense, ["actualCost", "amount"]),
    hasActual: ["actualCost", "amount"].some((field) => expense?.[field] !== null && expense?.[field] !== undefined && expense?.[field] !== ""),
    currency: normalizeCurrency(expense),
    date: expense.date || expense.expenseDate || "",
  }));

  const totalIncome = { USD: 0, KHR: 0 };
  const digitalIncome = { USD: 0, KHR: 0 };
  const cashIncome = { USD: 0, KHR: 0 };
  const otherIncome = { USD: 0, KHR: 0 };
  const plannedBudget = { USD: 0, KHR: 0 };
  const totalExpenses = { USD: 0, KHR: 0 };
  incomeRows.forEach((row) => {
    addByCurrency(totalIncome, row.amount, row.currency);
    const channel = paymentChannel(row.method);
    addByCurrency(channel === "digital" ? digitalIncome : channel === "cash" ? cashIncome : otherIncome, row.amount, row.currency);
  });
  expenseRows.forEach((row) => {
    addByCurrency(plannedBudget, row.budget, row.currency);
    if (row.hasActual) addByCurrency(totalExpenses, row.amount, row.currency);
  });

  const attending = rsvps.filter((rsvp) => {
    const status = String(rsvp.responseStatus || rsvp.status || "").toUpperCase();
    return ["ATTENDING", "ACCEPTED", "YES"].includes(status);
  }).reduce((total, rsvp) => total + Math.max(1, Number(rsvp.attendeeCount ?? rsvp.count) || 1), 0);

  const unpaidBalance = {
    USD: plannedBudget.USD - totalExpenses.USD,
    KHR: plannedBudget.KHR - totalExpenses.KHR,
  };
  const checkedIn = checkIns.filter((checkIn) => checkIn?.active !== false).length;

  return {
    invitation,
    incomeRows,
    expenseRows,
    totalIncome,
    digitalIncome,
    cashIncome,
    otherIncome,
    plannedBudget,
    totalExpenses,
    unpaidBalance,
    netBalance: {
      USD: totalIncome.USD - totalExpenses.USD,
      KHR: totalIncome.KHR - totalExpenses.KHR,
    },
    guestStats: {
      invited: guests.length,
      attending,
      gifted: incomeRows.length,
      checkedIn,
    },
  };
}

function paymentChannel(method) {
  if (/aba|bakong|khqr|qr/i.test(String(method || ""))) return "digital";
  if (/cash|សាច់ប្រាក់/i.test(String(method || ""))) return "cash";
  return "other";
}
