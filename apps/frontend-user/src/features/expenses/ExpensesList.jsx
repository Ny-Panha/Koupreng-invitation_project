import {
    IoAddOutline,
    IoWalletOutline,
    IoAlertCircleOutline,
} from "react-icons/io5";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useExpenses } from "./hooks/useExpenses";
import { ExpenseSummaryCards } from "./components/ExpenseSummaryCards";
import { ExpenseTable } from "./components/ExpenseTable";
import { ExpenseFormModal } from "./components/ExpenseFormModal";
import "./ExpensesPage.css";

export function ExpensesList() {
    const { text: t } = useBackendMessages("expenses");
    const {
        eventId,
        drafts,
        backendInvitation,
        expenses,
        selectedCat,
        setSelectedCat,
        search,
        setSearch,
        showForm,
        openAddModal,
        editingId,
        form,
        updateForm,
        addPaymentRow,
        updatePaymentRow,
        removePaymentRow,
        resetForm,
        submitExpense,
        editExpense,
        deleteExpense,
        totalBudget,
        totalSpent,
        isOver,
        diff,
        percent,
        byCurrency,
        currencyCode,
        saving,
        error,
        loading,
    } = useExpenses();

    if (loading) {
        return (
            <div className="exp-page">
                <div className="exp-empty">{t ? t("loadingText") || "កំពុងទាញយកទិន្នន័យ..." : "Loading..."}</div>
            </div>
        );
    }

    return (
        <div className="exp-page">
            {/* Hero */}
            <div className="exp-hero">
                <div className="exp-hero-content">
                    <span className="exp-hero-tag">{t ? t("kicker") : "Budget & Expense Planner"}</span>
                    <h1 className="exp-title">
                        <IoWalletOutline aria-hidden="true" />
                        {t ? t("title") : "Budget Planning & Expenses"}
                    </h1>
                    <p className="exp-subtitle">{t ? t("subtitle") : "Plan wedding expenses, record deposits, and monitor your total budget."}</p>
                </div>
                <button
                    type="button"
                    className="exp-add-btn"
                    disabled={!eventId || saving}
                    onClick={openAddModal}
                >
                    <IoAddOutline aria-hidden="true" />
                    {t ? t("addBtn") : "+ Add Expense"}
                </button>
            </div>

            {error && (
                <div className="exp-alert exp-alert-error" role="alert">
                    <IoAlertCircleOutline aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}

            {!backendInvitation?.id && !drafts.length && (
                <div className="exp-empty">
                    <div className="exp-empty-icon"><IoWalletOutline aria-hidden="true" /></div>
                    <h3>{t ? t("noInvitationsTitle") || "No events found" : "No events"}</h3>
                    <p>{t ? t("noInvitationsText") || "Create an event first to track expenses." : "Create event first."}</p>
                </div>
            )}

            {/* Stats */}
            {eventId && (
                <ExpenseSummaryCards
                    totalBudget={totalBudget}
                    totalSpent={totalSpent}
                    isOver={isOver}
                    diff={diff}
                    percent={percent}
                    byCurrency={byCurrency}
                    currencyCode={currencyCode}
                    t={t}
                />
            )}

            {/* Modal */}
            <ExpenseFormModal
                show={showForm && !!eventId}
                editingId={editingId}
                form={form}
                updateForm={updateForm}
                submitExpense={submitExpense}
                resetForm={resetForm}
                addPaymentRow={addPaymentRow}
                updatePaymentRow={updatePaymentRow}
                removePaymentRow={removePaymentRow}
                saving={saving}
                t={t}
            />

            {/* Table */}
            {eventId && (
                <ExpenseTable
                    expenses={expenses}
                    selectedCat={selectedCat}
                    setSelectedCat={setSelectedCat}
                    search={search}
                    setSearch={setSearch}
                    editExpense={editExpense}
                    deleteExpense={(id) => deleteExpense(id, t ? t("deleteConfirmText") : null)}
                    saving={saving}
                    t={t}
                />
            )}
        </div>
    );
}

export default ExpensesList;
