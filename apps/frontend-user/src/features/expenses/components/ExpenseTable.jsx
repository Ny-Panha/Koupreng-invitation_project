import { EXPENSE_CATEGORIES, expenseCategoryLabel } from "../expenseCategories";
import { formatLocalDate } from "@/shared/utils/localDate";
import {
    IoCalendarClearOutline,
    IoCarOutline,
    IoCheckmarkCircleOutline,
    IoColorPaletteOutline,
    IoCreateOutline,
    IoCubeOutline,
    IoFastFoodOutline,
    IoSearchOutline,
    IoShirtOutline,
    IoTimeOutline,
    IoTrashOutline,
    IoWalletOutline,
    IoWarningOutline,
} from "react-icons/io5";

const CAT_ICONS = {
    "Food & Catering": IoFastFoodOutline,
    "Decor & Flowers": IoColorPaletteOutline,
    "Attire & Makeup": IoShirtOutline,
    "Venue & Transport": IoCarOutline,
    "Other": IoCubeOutline,
};

export function ExpenseTable({
    expenses = [],
    selectedCat,
    setSelectedCat,
    search,
    setSearch,
    editExpense,
    deleteExpense,
    saving,
    t,
    lang = "en",
}) {
    const filtered = expenses.filter((e) => {
        const matchCat = selectedCat === "All" || e.category === selectedCat;
        const matchSearch = !search || (e.name || "").toLowerCase().includes(search.toLowerCase()) || (e.vendorName || "").toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="exp-content">
            {/* Filter bar */}
            <div className="exp-filter-bar">
                <div className="exp-cats">
                    <button
                        type="button"
                        className={`exp-cat-btn ${selectedCat === "All" ? "active" : ""}`}
                        aria-pressed={selectedCat === "All"}
                        onClick={() => setSelectedCat("All")}
                    >
                        {t ? t("catAll") : "All"}
                    </button>
                    {EXPENSE_CATEGORIES.map(({ value: cat }) => {
                        const Icon = CAT_ICONS[cat];
                        return (
                            <button
                                key={cat}
                                type="button"
                                className={`exp-cat-btn ${selectedCat === cat ? "active" : ""}`}
                                aria-pressed={selectedCat === cat}
                                onClick={() => setSelectedCat(cat)}
                            >
                                <Icon aria-hidden="true" />
                                {expenseCategoryLabel(cat, t)}
                            </button>
                        );
                    })}
                </div>
                <div className="exp-search-box">
                    <IoSearchOutline aria-hidden="true" />
                    <input
                        type="search"
                        aria-label={t ? t("searchPlaceholder") : "Search expenses"}
                        placeholder={t ? t("searchPlaceholder") : "Search expenses..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="exp-empty">
                    <div className="exp-empty-icon"><IoWalletOutline aria-hidden="true" /></div>
                    <h3>{t ? t(expenses.length ? "noMatches" : "emptyTitle") : "No expense records yet"}</h3>
                    <p>{t ? t(expenses.length ? "noMatchesText" : "emptyText") : "Start by recording your first wedding expense."}</p>
                    {expenses.length > 0 && <button type="button" className="workspace-button" onClick={() => { setSelectedCat("All"); setSearch(""); }}>{t ? t("clearFilters") : "Clear filters"}</button>}
                </div>
            ) : (
                <div className="exp-table-wrap">
                    <table className="exp-table">
                        <thead>
                            <tr>
                                <th>{t ? t("colExpense") : "Expense Item"}</th>
                                <th>{t ? t("colCategory") : "Category"}</th>
                                <th>{t ? t("colBudget") : "Estimated Budget"}</th>
                                <th>{t ? t("colAmount") : "Actual Spent"}</th>
                                <th>{t ? t("colDate") : "Date"}</th>
                                <th>{t ? t("colStatus") : "Status"}</th>
                                <th className="exp-th-actions">{t ? t("colActions") : "Actions"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => {
                                const Icon = CAT_ICONS[item.category] || IoCubeOutline;
                                const isItemOver = item.budget > 0 && item.amount > item.budget;
                                return (
                                    <tr key={item.id} className={isItemOver ? "exp-row-over" : ""}>
                                        <td data-label={t ? t("colExpense") : "Expense"}>
                                            <div className="exp-item-name-cell">
                                                <span className="exp-name-text">{item.name}</span>
                                                {item.vendorName && (
                                                    <span className="exp-vendor-sub">{item.vendorName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label={t ? t("colCategory") : "Category"}>
                                            <span className="exp-cat-badge">
                                                <Icon aria-hidden="true" />
                                                {expenseCategoryLabel(item.category, t)}
                                            </span>
                                        </td>
                                        <td data-label={t ? t("colBudget") : "Budget"}>
                                            <span className="exp-budget-val">{item.currency === "KHR" ? `${item.budget.toLocaleString()} ៛` : `$${item.budget.toLocaleString()}`}</span>
                                        </td>
                                        <td data-label={t ? t("colAmount") : "Amount"}>
                                            <span className="exp-amount" style={{ color: isItemOver ? "#ef4444" : "inherit" }}>
                                                {item.currency === "KHR" ? `${item.amount.toLocaleString()} ៛` : `$${item.amount.toLocaleString()}`}
                                            </span>
                                            {isItemOver && (
                                                <span className="exp-over-tag">
                                                    <IoWarningOutline aria-hidden="true" />
                                                    {t ? t("sumOverBudget") : "Over"}
                                                </span>
                                            )}
                                        </td>
                                        <td data-label={t ? t("colDate") : "Date"}>
                                            <span className="exp-date-val">
                                                <IoCalendarClearOutline aria-hidden="true" />
                                                {formatLocalDate(item.date, lang)}
                                            </span>
                                        </td>
                                        <td data-label={t ? t("colStatus") : "Status"}>
                                            <span className={`exp-status-badge ${item.status === "paid" ? "paid" : "pending"}`}>
                                                {item.status === "paid" ? (
                                                    <><IoCheckmarkCircleOutline aria-hidden="true" />{t ? t("statusPaid") : "Paid"}</>
                                                ) : (
                                                    <><IoTimeOutline aria-hidden="true" />{t ? t("statusPending") : "Pending"}</>
                                                )}
                                            </span>
                                        </td>
                                        <td data-label={t ? t("colActions") : "Actions"}>
                                            <div className="exp-row-actions">
                                                <button
                                                    type="button"
                                                    className="exp-action-btn"
                                                    onClick={() => editExpense(item)}
                                                >
                                                    <IoCreateOutline aria-hidden="true" />
                                                    {t ? t("editBtn") : "Edit"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="exp-action-btn exp-danger-btn"
                                                    disabled={saving}
                                                    onClick={() => deleteExpense(item.id)}
                                                >
                                                    <IoTrashOutline aria-hidden="true" />
                                                    {t ? t("deleteBtn") : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ExpenseTable;
