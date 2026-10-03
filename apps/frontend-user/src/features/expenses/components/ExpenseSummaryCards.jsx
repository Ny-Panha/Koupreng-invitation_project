import {
    IoCashOutline,
    IoStatsChartOutline,
    IoTimeOutline,
    IoWalletOutline,
    IoWarningOutline,
} from "react-icons/io5";

export function ExpenseSummaryCards({ totalBudget = 0, totalSpent = 0, isOver, diff = 0, percent = 0, byCurrency = {}, currencyCode, t }) {
    if (Object.keys(byCurrency).length > 1) return <div>{Object.entries(byCurrency).map(([currency, totals]) =>
        <section key={currency} aria-label={`${currency} expense summary`}><h3>{currency}</h3><ExpenseSummaryCards {...totals} currencyCode={currency} t={t} /></section>
    )}</div>;
    const money = (value) => `${currencyCode === "KHR" ? "KHR " : currencyCode && Object.keys(byCurrency).length === 0 ? "USD " : "$"}${Number(value ?? 0).toLocaleString()}`;
    return (
        <div className="exp-summary">
            <div className="exp-sum-card exp-sum-total">
                <div className="exp-sum-icon"><IoWalletOutline aria-hidden="true" /></div>
                <div>
                    <span className="exp-sum-label">{t ? t("sumTotal") : "Total Budget Planned"}</span>
                    <span className="exp-sum-value">{money(totalBudget)}</span>
                </div>
            </div>
            <div className="exp-sum-card">
                <div className="exp-sum-icon"><IoCashOutline aria-hidden="true" /></div>
                <div>
                    <span className="exp-sum-label">{t ? t("sumSpent") : "Total Actual Spent"}</span>
                    <span className="exp-sum-value">{money(totalSpent)}</span>
                </div>
            </div>
            <div className={`exp-sum-card ${isOver ? "exp-sum-over" : ""}`}>
                <div className="exp-sum-icon">
                    {isOver ? <IoWarningOutline aria-hidden="true" /> : <IoTimeOutline aria-hidden="true" />}
                </div>
                <div>
                    <span className="exp-sum-label">
                        {isOver ? (t ? t("sumOverBudget") : "Over Budget") : (t ? t("sumRemaining") : "Remaining Budget")}
                    </span>
                    <span className="exp-sum-value" style={{ color: isOver ? "#ef4444" : "inherit" }}>
                        {isOver ? `+${money(diff)}` : money(diff)}
                    </span>
                </div>
            </div>
            <div className="exp-sum-card">
                <div className="exp-sum-icon"><IoStatsChartOutline aria-hidden="true" /></div>
                <div style={{ flex: 1 }}>
                    <span className="exp-sum-label">{t ? t("sumPercent") : "Budget Used %"}</span>
                    <span className="exp-sum-value">{percent}%</span>
                    <div style={{
                        marginTop: "8px",
                        width: "100%",
                        height: "6px",
                        background: "#f0e6d8",
                        borderRadius: "999px",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            width: `${Math.min(percent, 100)}%`,
                            height: "100%",
                            background: isOver
                                ? "linear-gradient(90deg, #ef4444, #dc2626)"
                                : "linear-gradient(90deg, #B0926A, #8c6f4b)",
                            borderRadius: "999px",
                            transition: "width 0.4s ease"
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExpenseSummaryCards;
