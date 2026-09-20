import { useState, useEffect } from "react";
import {
    createHostRecordId,
    getActiveEventId,
    listBudgetExpenses,
    saveBudgetExpenses,
} from "../../../shared/storage/hostPlanningStorage";
import { listDrafts } from "../../../shared/storage/weddingStorage";
import { expensesApi } from "../api/expensesApi";
import { useAuth } from "../../auth/hooks/useAuth";

function toList(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
}

function pickFirstWithId(value) {
    return toList(value).find((item) => item?.id) || null;
}

function valueToNumber(...values) {
    const value = values.find((item) => item !== undefined && item !== null && item !== "");
    return Number(value) || 0;
}

export function toExpensePayload(form) {
    const sumPayments = (form.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const finalAmount = sumPayments > 0 ? sumPayments : (Number(form.amount) || 0);
    const budgetNum = Number(form.budget) || 0;
    return {
        name: form.name.trim(),
        category: form.category || "Other",
        budget: budgetNum,
        amount: finalAmount,
        date: form.date || new Date().toISOString().slice(0, 10),
        status: finalAmount >= budgetNum ? "PAID" : "PENDING",
        vendorName: form.vendorName || "",
        notes: JSON.stringify({
            text: form.notesText || "",
            payments: form.payments || []
        })
    };
}

export function normalizeExpense(expense) {
    let parsedNotes = { text: "", payments: [] };
    const rawNotes = expense.notes;
    try {
        if (rawNotes) {
            const parsed = typeof rawNotes === "string" ? JSON.parse(rawNotes) : rawNotes;
            if (parsed && typeof parsed === "object") {
                parsedNotes = {
                    text: parsed.text || "",
                    payments: Array.isArray(parsed.payments) ? parsed.payments : []
                };
            } else {
                parsedNotes.text = String(rawNotes);
            }
        }
    } catch {
        parsedNotes.text = rawNotes || "";
    }

    const name = expense.name || expense.itemName || "";
    const category = expense.category || "Other";
    const budget = valueToNumber(expense.budget, expense.estimatedCost);
    const amount = valueToNumber(expense.amount, expense.actualCost);
    const date = expense.date || expense.expenseDate || "";
    const status = (expense.status || "pending").toLowerCase();
    const vendorName = expense.vendorName || "";

    return {
        id: expense.id || createHostRecordId("expense"),
        name,
        category,
        budget,
        amount,
        date,
        status,
        vendorName,
        notesText: parsedNotes.text,
        payments: parsedNotes.payments
    };
}

export function useExpenses() {
    const { user } = useAuth();
    const ownerUserId = user?.id || user?.userId;
    const [backendInvitation, setBackendInvitation] = useState(null);
    const activeEventId = getActiveEventId();
    const drafts = listDrafts(ownerUserId);
    const currentDraft = drafts.find((draft) => draft.id === activeEventId) || drafts[0] || null;
    const backendInvitationId = currentDraft?.backendInvitationId || currentDraft?.id || "";
    const eventId = currentDraft?.id || activeEventId || backendInvitation?.id || "";

    const [expenses, setExpenses] = useState(() => listBudgetExpenses([], eventId).map(normalizeExpense));
    const [selectedCat, setSelectedCat] = useState("All");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        category: "Food & Catering",
        budget: "",
        amount: "",
        date: "",
        vendorName: "",
        notesText: "",
        payments: []
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");

        expensesApi.listMineInvitations()
            .then(async (response) => {
                if (!active) return;
                const invitations = toList(response);
                const matched = backendInvitationId
                    ? invitations.find((inv) => String(inv.id) === String(backendInvitationId)) || null
                    : null;
                const selected = matched || invitations.find((inv) => inv?.status === "PUBLISHED") || pickFirstWithId(invitations);
                setBackendInvitation(selected);

                if (selected?.id) {
                    const budgetItems = await expensesApi.listExpenses(selected.id);
                    if (active) {
                        setExpenses(toList(budgetItems).map(normalizeExpense));
                    }
                } else {
                    if (active) {
                        setExpenses(listBudgetExpenses([], eventId).map(normalizeExpense));
                    }
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err?.message || "Could not load expenses from backend");
                    setExpenses(listBudgetExpenses([], eventId).map(normalizeExpense));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backendInvitationId]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const addPaymentRow = () => {
        setForm((current) => ({
            ...current,
            payments: [...(current.payments || []), { desc: "", amount: "" }]
        }));
    };

    const updatePaymentRow = (index, field, value) => {
        setForm((current) => {
            const nextPayments = [...(current.payments || [])];
            nextPayments[index] = { ...nextPayments[index], [field]: value };
            return { ...current, payments: nextPayments };
        });
    };

    const removePaymentRow = (index) => {
        setForm((current) => ({
            ...current,
            payments: (current.payments || []).filter((_, idx) => idx !== index)
        }));
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            name: "",
            category: "Food & Catering",
            budget: "",
            amount: "",
            date: "",
            vendorName: "",
            notesText: "",
            payments: []
        });
        setShowForm(false);
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm({
            name: "",
            category: "Food & Catering",
            budget: "",
            amount: "",
            date: "",
            vendorName: "",
            notesText: "",
            payments: []
        });
        setShowForm(true);
    };

    const submitExpense = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !eventId || saving) return;
        setSaving(true);
        setError("");
        try {
            const payload = toExpensePayload(form);
            if (backendInvitation?.id) {
                if (editingId) {
                    const updated = await expensesApi.updateExpense(backendInvitation.id, editingId, payload);
                    const normalized = normalizeExpense(updated);
                    setExpenses((current) => current.map((e) => (e.id === editingId ? normalized : e)));
                } else {
                    const created = await expensesApi.createExpense(backendInvitation.id, payload);
                    const normalized = normalizeExpense(created);
                    setExpenses((current) => [normalized, ...current]);
                }
            } else {
                const nextExpense = normalizeExpense(payload);
                if (editingId) nextExpense.id = editingId;
                const nextExpenses = editingId
                    ? expenses.map((e) => (e.id === editingId ? nextExpense : e))
                    : [nextExpense, ...expenses];
                setExpenses(nextExpenses);
                saveBudgetExpenses(nextExpenses, eventId);
            }
            resetForm();
        } catch (err) {
            if (err?.status === 401 || err?.statusCode === 401) {
                setError("Session ផុតកំណត់ សូម Logout រួច Login ចូលម្ដងទៀត។ (Session expired, please log in again)");
            } else {
                setError(err.message || "Could not save expense item");
            }
        } finally {
            setSaving(false);
        }
    };

    const editExpense = (expense) => {
        setEditingId(expense.id);
        setForm({
            name: expense.name,
            category: expense.category,
            budget: String(expense.budget || ""),
            amount: String(expense.amount || ""),
            date: expense.date || "",
            vendorName: expense.vendorName || "",
            notesText: expense.notesText || "",
            payments: expense.payments || []
        });
        setShowForm(true);
    };

    const deleteExpense = async (expenseId, confirmMsg) => {
        if (!window.confirm(confirmMsg || "Are you sure you want to delete this expense?")) return;
        if (!eventId || saving) return;
        setSaving(true);
        setError("");
        try {
            if (backendInvitation?.id) {
                await expensesApi.removeExpense(backendInvitation.id, expenseId);
                setExpenses((current) => current.filter((e) => e.id !== expenseId));
            } else {
                const nextExpenses = expenses.filter((e) => e.id !== expenseId);
                setExpenses(nextExpenses);
                saveBudgetExpenses(nextExpenses, eventId);
            }
        } catch (err) {
            if (err?.status === 401 || err?.statusCode === 401) {
                setError("Session ផុតកំណត់ សូម Logout រួច Login ចូលម្ដងទៀត។ (Session expired, please log in again)");
            } else {
                setError(err.message || "Could not delete expense item");
            }
        } finally {
            setSaving(false);
        }
    };

    const totalBudget = expenses.reduce((sum, e) => sum + (Number(e.budget) || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const isOver = totalSpent > totalBudget && totalBudget > 0;
    const diff = Math.abs(totalBudget - totalSpent);
    const percent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

    return {
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
        saving,
        error,
        loading,
    };
}

export default useExpenses;
