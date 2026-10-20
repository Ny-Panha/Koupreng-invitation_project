import { useParams } from "react-router-dom";
import { localDateString } from "@/shared/utils/localDate";
import { useState, useEffect } from "react";
import {
    createHostRecordId,
    saveBudgetExpenses,
} from "../../../shared/storage/hostPlanningStorage";
import { listDrafts } from "../../../shared/storage/weddingStorage";
import { expensesApi } from "../api/expensesApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { expenseTotals } from "../expenseTotals";

function toList(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
}

function valueToNumber(...values) {
    const value = values.find((item) => item !== undefined && item !== null && item !== "");
    return Number(value) || 0;
}

export function toExpensePayload(form) {
    const validPayments = (form.payments || []).filter((payment) => {
        const amount = Number(payment.amount);
        return payment.amount !== "" && Number.isFinite(amount) && amount >= 0;
    });
    const finalAmount = validPayments.reduce((total, payment) => {
        const amount = Number(payment.amount);
        return Number.isFinite(amount) && amount >= 0 ? total + amount : total;
    }, 0);
    const budgetNum = Number(form.budget) || 0;
    return {
        name: form.name.trim(),
        category: form.category || "Other",
        budget: budgetNum,
        amount: finalAmount,
        currency: form.currency || "USD",
        date: form.date || localDateString(),
        status: finalAmount > 0 && finalAmount >= budgetNum ? "PAID" : "PENDING",
        vendorName: form.vendorName || "",
        notes: JSON.stringify({
            text: form.notesText || "",
            payments: validPayments
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
    const currency = expense.currency || expense.currencyCode || "USD";
    const date = expense.date || expense.expenseDate || "";
    const status = (expense.status || "pending").toLowerCase();
    const vendorName = expense.vendorName || "";

    return {
        id: expense.id || createHostRecordId("expense"),
        name,
        category,
        budget,
        amount,
        currency,
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
    const params = useParams();
    const activeEventId = params.eventId || params.invitationId || "";
    const drafts = listDrafts(ownerUserId);
    const currentDraft = drafts.find((draft) => String(draft.id) === String(activeEventId) || String(draft.backendInvitationId) === String(activeEventId)) || null;
    const backendInvitationId = params.eventId || params.invitationId || currentDraft?.backendInvitationId || "";
    const eventId = activeEventId;

    const [expenses, setExpenses] = useState([]);
    const [selectedCat, setSelectedCat] = useState("All");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        category: "Food & Catering",
        budget: "",
        amount: "",
        currency: "USD",
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
        setBackendInvitation(null);
        setExpenses([]);
        setError("");

        expensesApi.listMineInvitations()
            .then(async (response) => {
                if (!active) return;
                const invitations = toList(response);
                const matched = backendInvitationId
                    ? invitations.find((inv) => String(inv.id) === String(backendInvitationId)) || null
                    : null;
                const selected = matched;
                if (!selected) throw new Error("Choose an event you own to manage budget");
                setBackendInvitation(selected);

                if (selected?.id) {
                    const budgetItems = await expensesApi.listExpenses(selected.id);
                    if (active) {
                        setExpenses(toList(budgetItems).map(normalizeExpense));
                    }
                } else {
                    if (active) {
                        setExpenses([]);
                    }
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err?.message || "Could not load expenses from backend");
                    setExpenses([]);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [backendInvitationId]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const addPaymentRow = () => {
        setForm((current) => ({
            ...current,
            payments: [...(current.payments || []), { desc: "", amount: "", date: "" }]
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
            currency: "USD",
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
            currency: "USD",
            date: "",
            vendorName: "",
            notesText: "",
            payments: []
        });
        setShowForm(true);
    };

    const submitExpense = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !eventId || !backendInvitation?.id || saving) return;
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
            currency: expense.currency || "USD",
            date: expense.date || "",
            vendorName: expense.vendorName || "",
            notesText: expense.notesText || "",
            payments: expense.payments?.length
                ? expense.payments
                : expense.amount > 0
                    ? [{ desc: "Previously recorded", amount: String(expense.amount), date: expense.date || "" }]
                    : []
        });
        setShowForm(true);
    };

    const deleteExpense = async (expenseId, confirmMsg) => {
        if (!window.confirm(confirmMsg || "Are you sure you want to delete this expense?")) return;
        if (!eventId || !backendInvitation?.id || saving) return;
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

    const totals = expenseTotals(expenses);

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
        ...totals,
        saving,
        error,
        loading,
    };
}

export default useExpenses;
