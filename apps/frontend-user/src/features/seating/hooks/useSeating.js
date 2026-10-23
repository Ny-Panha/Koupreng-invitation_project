import { useCallback, useEffect, useMemo, useState } from "react";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { seatingService } from "../seatingService";
import { toast } from "../../../shared/ui/toast";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";

const emptyTable = { tableName: "", tableLabel: "", capacity: 10, sortOrder: 0, notes: "" };
const emptyAssignment = { guestId: "", tableId: "", seatLabel: "", seatCount: 1, notes: "" };

export function useSeating(invitationId) {
    const { text: t } = useBackendMessages("seating");
    const [invitation, setInvitation] = useState(null);
    const [plan, setPlan] = useState(null);
    const [summary, setSummary] = useState(null);
    const [layout, setLayout] = useState(null);
    const [tableForm, setTableForm] = useState(emptyTable);
    const [assignmentForm, setAssignmentForm] = useState(emptyAssignment);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [invitationData, planData, summaryData, layoutData] = await Promise.all([
                invitationService.get(invitationId),
                seatingService.plan(invitationId),
                seatingService.summary?.(invitationId) ?? Promise.resolve(null),
                seatingService.layout?.(invitationId).catch(() => null) ?? Promise.resolve(null),
            ]);
            setInvitation(invitationData);
            setPlan(planData);
            setSummary(summaryData);
            setLayout(Number.isInteger(layoutData?.version) ? layoutData : null);
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
            seatingService.layout?.(invitationId).catch(() => null) ?? Promise.resolve(null),
        ])
            .then(([invitationData, planData, summaryData, layoutData]) => {
                if (!active) return;
                setInvitation(invitationData);
                setPlan(planData);
                setSummary(summaryData);
                setLayout(Number.isInteger(layoutData?.version) ? layoutData : null);
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
            toast(t("tableCreated"));
            await load();
            return true;
        } catch (err) {
            setError(err.message || "Could not create table");
            return false;
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
            toast(t("tableCreated"));
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
            toast(t("guestAssigned"));
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
            toast(t("guestUnassigned"));
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
            toast(t("tableDeleted"));
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
            toast(t("tableUpdated"));
            await load();
        } catch (err) {
            setError(err.message || "Could not update table");
        } finally {
            setSaving(false);
        }
    };

    const saveTablePositions = async (positionsMap, venue) => {
        setSaving(true);
        setError("");
        try {
            if (!layout || !seatingService.saveLayout) throw new Error('Saved event layout is unavailable. Reload before saving.');
            const saved = await seatingService.saveLayout(invitationId, { version: layout.version, data: { schemaVersion: 1, positions: positionsMap, venue } });
            if (saved?.eventId == null || String(saved.eventId) !== String(invitationId) || saved.version !== layout.version + 1 || !saved.data) throw new Error('Layout save was not confirmed. Reload the saved layout before retrying.');
            setLayout(saved);
            toast(t("planSaved"));
            return saved;
        } catch (err) {
            setError(err.message || "Could not save floor plan");
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return {
        invitation,
        plan,
        summary,
        layout,
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
