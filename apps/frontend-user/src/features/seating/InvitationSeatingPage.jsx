import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    IoRestaurantOutline,
    IoSparkles,
    IoPeopleOutline,
    IoHourglassOutline,
    IoDownloadOutline,
    IoMapOutline,
    IoGridOutline,
} from "react-icons/io5";

import { useSeating } from "./hooks/useSeating";
import { SeatingForms } from "./components/SeatingForms";
import { SeatingTableCard } from "./components/SeatingTableCard";
import { SeatingFloorPlan } from "./components/SeatingFloorPlan";
import "./SeatingPage.css";

export default function InvitationSeatingPage() {
    const { invitationId } = useParams();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState("list"); // "list" | "plan"
    const {
        invitation,
        plan,
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
        saveTablePositions,
        assignGuest,
        unassign,
        deleteTable,
        exportCsv,
    } = useSeating(invitationId);

    // Compute KPI metrics
    const stats = useMemo(() => {
        const tables = plan?.tables || [];
        const totalTables = tables.length;
        const totalCapacity = tables.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
        const assignedSeats = tables.reduce((sum, t) => sum + (Number(t.assignedSeats) || 0), 0);
        const unassignedCount = (plan?.unassignedGuests || []).length;
        return { totalTables, totalCapacity, assignedSeats, unassignedCount };
    }, [plan]);

    if (loading) {
        return (
            <main className="seating-page">
                <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--brand-text-muted)" }}>
                    <p style={{ fontSize: "1.125rem", fontWeight: 700 }}>កំពុងទាញយកទិន្នន័យរៀបចំតុ (Loading seating plan)...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="seating-page">
            {/* Header */}
            <header className="seating-head">
                <div>
                    <span className="seating-eyebrow">
                        <IoSparkles />
                        <span>ការរៀបចំកន្លែងអង្គុយភ្ញៀវ (Seating Management)</span>
                    </span>
                    <h1>{invitation?.title || "រៀបចំកន្លែងអង្គុយ (Seating Plan)"}</h1>
                    <p>ចាត់ចែងភ្ញៀវតាមលេខតុ និងតាមដានចំនួនកៅអីទំនេរក្នុងពិធីមង្គលការឱ្យបានច្បាស់លាស់។</p>
                </div>

                <div className="seating-actions">
                    <button
                        className="seating-btn-outline"
                        type="button"
                        onClick={() => navigate(`/dashboard/invitations/${invitationId}/guests`)}
                    >
                        <IoPeopleOutline />
                        <span>បញ្ជីភ្ញៀវ (Guests)</span>
                    </button>
                    <button
                        className="seating-btn-outline"
                        type="button"
                        onClick={exportCsv}
                    >
                        <IoDownloadOutline />
                        <span>ទាញយក CSV (Export CSV)</span>
                    </button>
                </div>
            </header>

            {/* KPI Summary Cards */}
            <section className="seating-kpi-grid">
                <div className="seating-kpi-card">
                    <div className="seating-kpi-icon" style={{ background: "rgba(185, 139, 66, 0.12)", color: "#b98b42" }}>
                        <IoRestaurantOutline />
                    </div>
                    <div className="seating-kpi-info">
                        <span>តុសរុប (Tables)</span>
                        <strong>{stats.totalTables}</strong>
                    </div>
                </div>

                <div className="seating-kpi-card">
                    <div className="seating-kpi-icon" style={{ background: "rgba(79, 70, 229, 0.12)", color: "#4f46e5" }}>
                        <IoRestaurantOutline />
                    </div>
                    <div className="seating-kpi-info">
                        <span>កៅអីសរុប (Capacity)</span>
                        <strong>{stats.totalCapacity}</strong>
                    </div>
                </div>

                <div className="seating-kpi-card">
                    <div className="seating-kpi-icon" style={{ background: "rgba(15, 118, 110, 0.12)", color: "#0f766e" }}>
                        <IoPeopleOutline />
                    </div>
                    <div className="seating-kpi-info">
                        <span>ភ្ញៀវមានតុ (Assigned)</span>
                        <strong style={{ color: "#0f766e" }}>{stats.assignedSeats}</strong>
                    </div>
                </div>

                <div className="seating-kpi-card">
                    <div className="seating-kpi-icon" style={{ background: "rgba(225, 29, 72, 0.12)", color: "#e11d48" }}>
                        <IoHourglassOutline />
                    </div>
                    <div className="seating-kpi-info">
                        <span>មិនទាន់មានតុ (Unassigned)</span>
                        <strong style={{ color: stats.unassignedCount > 0 ? "#e11d48" : "inherit" }}>
                            {stats.unassignedCount}
                        </strong>
                    </div>
                </div>
            </section>

            {error && (
                <div style={{ padding: "14px 18px", borderRadius: "12px", background: "#fee2e2", color: "#b91c1c", marginBottom: "20px", fontWeight: 700 }}>
                    ⚠️ {error}
                </div>
            )}

            {/* View Switcher Tabs */}
            <div className="seating-view-switcher">
                <button
                    data-testid="tab-floor-plan"
                    type="button"
                    className={`seating-view-btn ${activeView === "plan" ? "active" : ""}`}
                    onClick={() => setActiveView("plan")}
                >
                    <IoMapOutline />
                    <span>🗺️ ប្លង់សាលការ Canva (Interactive Floor Plan)</span>
                </button>
                <button
                    type="button"
                    className={`seating-view-btn ${activeView === "list" ? "active" : ""}`}
                    onClick={() => setActiveView("list")}
                >
                    <IoGridOutline />
                    <span>📋 បញ្ជីតុ & ចាត់ភ្ញៀវ (List & Forms)</span>
                </button>
            </div>

            {/* View 1: Interactive Canva Floor Plan */}
            {activeView === "plan" && (
                <SeatingFloorPlan
                    tables={plan?.tables || []}
                    assignmentsByTable={assignmentsByTable}
                    onSavePositions={saveTablePositions}
                    onCreateTable={createTableWithData}
                    invitationId={invitationId}
                    saving={saving}
                />
            )}

            {/* View 2: Cards Grid + Forms Layout */}
            {activeView === "list" && (
                <section className="seating-layout">
                    <SeatingForms
                        tableForm={tableForm}
                        setTableForm={setTableForm}
                        assignmentForm={assignmentForm}
                        setAssignmentForm={setAssignmentForm}
                        createTable={createTable}
                        assignGuest={assignGuest}
                        plan={plan}
                        saving={saving}
                    />

                    <div className="seating-tables-grid">
                        {(plan?.tables || []).map((table) => (
                            <SeatingTableCard
                                key={table.id}
                                table={table}
                                assignments={assignmentsByTable.get(table.id) || []}
                                unassign={unassign}
                                deleteTable={deleteTable}
                                saving={saving}
                            />
                        ))}

                        {!plan?.tables?.length && (
                            <div className="seating-empty-state">
                                <IoRestaurantOutline style={{ fontSize: "3rem", color: "var(--brand-primary, #b98b42)", opacity: 0.6 }} />
                                <h3>មិនទាន់មានតុនៅឡើយទេ</h3>
                                <p>សូមបង្កើតតុដំបូងនៅផ្ទាំងខាងឆ្វេង ឬចុចចូល <strong>«ប្លង់សាលការ Canva»</strong> ដើម្បីគូស និងរៀបចំតុលើប្លង់!</p>
                                <button
                                    type="button"
                                    className="seating-btn-gold"
                                    style={{ marginTop: "14px" }}
                                    onClick={() => setActiveView("plan")}
                                >
                                    <IoMapOutline />
                                    <span>បើកផ្ទាំងគូសប្លង់សាលការ Canva</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </main>
    );
}
