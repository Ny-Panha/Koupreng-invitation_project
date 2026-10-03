import { useCallback, useEffect, useMemo, useState } from "react";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { seatingService } from "../seatingService";
import { toast } from "../../../shared/ui/toast";
import { writeTablePosition } from "../model/tableNotes";

const emptyTable = { tableName: "", tableLabel: "", capacity: 10, sortOrder: 0, notes: "" };
const emptyAssignment = { guestId: "", tableId: "", seatLabel: "", seatCount: 1, notes: "" };

export function useSeating(invitationId) {
    const [invitation, setInvitation] = useState(null);
    const [plan, setPlan] = useState(null);
    const [summary, setSummary] = useState(null);
    const [tableForm, setTableForm] = useState(emptyTable);
    const [assignmentForm, setAssignmentForm] = useState(emptyAssignment);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [invitationData, planData, summaryData] = await Promise.all([
                invitationService.get(invitationId),
                seatingService.plan(invitationId),
                seatingService.summary?.(invitationId) ?? Promise.resolve(null),
            ]);
            setInvitation(invitationData);
            setPlan(planData);
            setSummary(summaryData);
        } catch (err) {
            setError(err.message || "Could not load seating plan");
        } finally {
            setLoading(false);
        }
    }, [invitationId]);

    useEffect(() => {
        let active = true;
        Promise.resolve().then(() => {
            if (active) {
                setLoading(true);
                setError("");
            }
        });

        Promise.all([
            invitationService.get(invitationId),
            seatingService.plan(invitationId),
            seatingService.summary?.(invitationId) ?? Promise.resolve(null),
        ])
            .then(([invitationData, planData, summaryData]) => {
                if (!active) return;
                setInvitation(invitationData);
                setPlan(planData);
                setSummary(summaryData);
                setError("");
            })
            .catch((err) => {
                if (active) setError(err.message || "Could not load seating plan");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [invitationId]);

    const assignmentsByTable = useMemo(() => {
        const grouped = new Map();
        (plan?.assignments || []).forEach((assignment) => {
            const list = grouped.get(assignment.tableId) || [];
            list.push(assignment);
            grouped.set(assignment.tableId, list);
        });
        return grouped;
    }, [plan]);

    const createTable = async (event) => {
        if (event && event.preventDefault) event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await seatingService.createTable(invitationId, {
                ...tableForm,
                capacity: Number(tableForm.capacity || 10),
                sortOrder: Number(tableForm.sortOrder || 0),
            });
            setTableForm(emptyTable);
            toast("Table created");
            await load();
        } catch (err) {
            setError(err.message || "Could not create table");
        } finally {
            setSaving(false);
        }
    };

    const createTableWithData = async (payload) => {
        setSaving(true);
        setError("");
        try {
            await seatingService.createTable(invitationId, {
                tableName: payload.tableName,
                tableLabel: payload.tableLabel || "",
                capacity: Number(payload.capacity || 10),
                sortOrder: Number(payload.sortOrder || 0),
                notes: payload.notes || JSON.stringify({ x: 50, y: 50 }),
            });
            toast("បានបន្ថែមតុលើប្លង់ជោគជ័យ (Table added to canvas)");
            await load();
        } catch (err) {
            setError(err.message || "Could not create table");
        } finally {
            setSaving(false);
        }
    };

    const assignGuest = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await seatingService.assign(invitationId, {
                ...assignmentForm,
                guestId: Number(assignmentForm.guestId),
                tableId: Number(assignmentForm.tableId),
                seatCount: Number(assignmentForm.seatCount || 1),
            });
            setAssignmentForm(emptyAssignment);
            toast("Guest assigned");
            await load();
        } catch (err) {
            setError(err.message || "Could not assign guest");
        } finally {
            setSaving(false);
        }
    };

    const unassign = async (assignmentId) => {
        setSaving(true);
        setError("");
        try {
            await seatingService.unassign(invitationId, assignmentId);
            toast("Guest unassigned");
            await load();
        } catch (err) {
            setError(err.message || "Could not unassign guest");
        } finally {
            setSaving(false);
        }
    };

    const deleteTable = async (tableId) => {
        setSaving(true);
        setError("");
        try {
            await seatingService.deleteTable(invitationId, tableId);
            toast("Table deleted");
            await load();
        } catch (err) {
            setError(err.message || "Could not delete table");
        } finally {
            setSaving(false);
        }
    };

    const updateTable = async (tableId, payload) => {
        setSaving(true);
        setError("");
        try {
            await seatingService.updateTable(invitationId, tableId, payload);
            toast("Table updated");
            await load();
        } catch (err) {
            setError(err.message || "Could not update table");
        } finally {
            setSaving(false);
        }
    };

    const saveTablePositions = async (positionsMap) => {
        setSaving(true);
        setError("");
        try {
            const tables = plan?.tables || [];
            const updates = Object.entries(positionsMap).map(([tableId, pos]) => {
                const table = tables.find((t) => String(t.id) === String(tableId));
                if (!table) return null;

                const updatedNotes = writeTablePosition(table.notes, pos);

                return seatingService.updateTable(invitationId, table.id, {
                    tableName: table.tableName,
                    tableLabel: table.tableLabel,
                    capacity: table.capacity,
                    sortOrder: table.sortOrder,
                    notes: updatedNotes,
                });
            }).filter(Boolean);

            await Promise.all(updates);
            toast("បានរក្សាទុកប្លង់សាលការរួចរាល់ (Floor plan saved)");
            await load();
            return true;
        } catch (err) {
            setError(err.message || "Could not save floor plan");
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        invitation,
        plan,
        summary,
        tableForm,
        setTableForm,
        assignmentForm,
        setAssignmentForm,
        assignmentsByTable,
        loading,
        saving,
        error,
        createTable,
        createTableWithData,
        updateTable,
        saveTablePositions,
        assignGuest,
        unassign,
        deleteTable,
        exportCsv: () => seatingService.exportCsv(invitationId),
        refresh: load,
    };
}

export default useSeating;
