export function formatDate(value) {
    if (!value) return "—";
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    } catch {
        return "—";
    }
}

export function formatDateTime(value) {
    if (!value) return "—";
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

export function formatMoney(amount, currency = "USD") {
    if (amount === null || amount === undefined || amount === "") return "—";
    const num = Number(amount);
    if (Number.isNaN(num)) return "—";
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(num);
    } catch {
        return `${num.toFixed(2)} ${currency || ""}`.trim();
    }
}

export function formatRevenue(report) {
    if (report?.revenueComparable === false) {
        const totals = report.revenueByCurrency;
        if (!totals || typeof totals !== "object" || Array.isArray(totals)) return "—";
        return Object.entries(totals)
            .map(([currency, amount]) => `${currency} ${formatMoney(amount, currency)}`)
            .join(" · ") || "—";
    }
    return formatMoney(report?.totalRevenue, report?.currency || "USD");
}
