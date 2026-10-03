import {
    IoPeopleOutline,
    IoStarOutline,
    IoStatsChartOutline,
    IoWalletOutline,
} from "react-icons/io5";
import { budgetMoney } from "@/features/budget/currencyTotals";

export function GiftStatsCards({ gifts = [], t }) {
    const groups = gifts.reduce((result, gift) => {
        const currency = gift.currency || "USD";
        (result[currency] ||= []).push(Number(gift.amount) || 0);
        return result;
    }, {});
    const amountText = (kind) => Object.entries(groups).map(([currency, amounts]) => {
        const total = amounts.reduce((sum, amount) => sum + amount, 0);
        const value = kind === "total" ? total : kind === "average" ? total / amounts.length : Math.max(...amounts);
        if (Object.keys(groups).length === 1 && currency === "USD") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        return budgetMoney(value, currency);
    }).join(" · ") || "$0";

    return (
        <div className="wg-summary">
            <div className="wg-sum-card wg-sum-total">
                <div className="wg-sum-icon"><IoWalletOutline aria-hidden="true" /></div>
                <div>
                    <span className="wg-sum-label">{t ? t("sumTotal") : "Total Gifts"}</span>
                    <span className="wg-sum-value">{amountText("total")}</span>
                </div>
            </div>
            <div className="wg-sum-card">
                <div className="wg-sum-icon"><IoPeopleOutline aria-hidden="true" /></div>
                <div>
                    <span className="wg-sum-label">{t ? t("sumCount") : "Contributors"}</span>
                    <span className="wg-sum-value">{t ? t("countPersons", { count: gifts.length }) : `${gifts.length}`}</span>
                </div>
            </div>
            <div className="wg-sum-card">
                <div className="wg-sum-icon"><IoStatsChartOutline aria-hidden="true" /></div>
                <div>
                    <span className="wg-sum-label">{t ? t("sumAverage") : "Average"}</span>
                    <span className="wg-sum-value">{amountText("average")}</span>
                </div>
            </div>
            <div className="wg-sum-card">
                <div className="wg-sum-icon"><IoStarOutline aria-hidden="true" /></div>
                <div>
                    <span className="wg-sum-label">{t ? t("sumMax") : "Highest"}</span>
                    <span className="wg-sum-value">{amountText("max")}</span>
                </div>
            </div>
        </div>
    );
}

export default GiftStatsCards;
