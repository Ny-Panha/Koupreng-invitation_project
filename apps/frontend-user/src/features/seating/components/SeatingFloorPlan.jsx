import { useEffect, useMemo, useRef, useState } from "react";
import {
    IoSaveOutline,
    IoSparkles,
    IoRefreshOutline,
    IoCloseOutline,
    IoRestaurantOutline,
    IoPeopleOutline,
    IoAddCircleOutline,
} from "react-icons/io5";
import "./SeatingFloorPlan.css";

// Check if candidate position collides with any other table
function hasCollision(x, y, otherPositions = {}, ignoreId = null, minDistance = 11.5) {
    return Object.entries(otherPositions).some(([id, pos]) => {
        if (ignoreId && String(id) === String(ignoreId)) return false;
        if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") return false;
        return Math.hypot(x - pos.x, y - pos.y) < minDistance;
    });
}

// Find a guaranteed non-overlapping position for a newly created table (scales up to 100 tables)
function findNonOverlappingPosition(existingPositions = {}, totalTables = 0, tableScale = 1.0) {
    const minDistance = Math.max(6.0, 11.5 * tableScale);
    const candidateSpots = [];

    // Dynamically generate spots according to venue scale
    const cols = totalTables > 50 ? 5 : totalTables > 20 ? 3 : 2;
    const leftCols = [];
    const rightCols = [];
    const leftMinX = totalTables > 50 ? 7 : 10;
    const leftMaxX = totalTables > 50 ? 43 : 40;
    const rightMinX = totalTables > 50 ? 57 : 60;
    const rightMaxX = totalTables > 50 ? 93 : 90;

    for (let c = 0; c < cols; c++) {
        const frac = cols === 1 ? 0.5 : c / (cols - 1);
        leftCols.push(Math.round((leftMinX + frac * (leftMaxX - leftMinX)) * 10) / 10);
        rightCols.push(Math.round((rightMinX + frac * (rightMaxX - rightMinX)) * 10) / 10);
    }

    const rowCount = totalTables > 50 ? 10 : totalTables > 20 ? 6 : 4;
    const topY = totalTables > 50 ? 17 : 21;
    const bottomY = totalTables > 50 ? 83 : 78;

    for (let r = 0; r < rowCount; r++) {
        const frac = rowCount === 1 ? 0.5 : r / (rowCount - 1);
        const y = Math.round((topY + frac * (bottomY - topY)) * 10) / 10;
        for (let c = 0; c < cols; c++) {
            candidateSpots.push({ x: leftCols[c], y });
            candidateSpots.push({ x: rightCols[c], y });
        }
    }

    for (const spot of candidateSpots) {
        if (!hasCollision(spot.x, spot.y, existingPositions, null, minDistance)) {
            return spot;
        }
    }

    // Fallback staggered placement
    return {
        x: 8 + (totalTables % 8) * 11,
        y: 18 + Math.floor(totalTables / 8) * 7.5,
    };
}

// Calculate clean, symmetrical banquet hall grid positions for Auto-Arrange (clean rows & columns)
export function calculateAutoArrangePositions(tableList = [], venueLayout = {}) {
    if (!tableList || tableList.length === 0) return {};

    // Sort tables naturally by number so តុ 1, តុ 2, ... are sequential
    const sorted = [...tableList].sort((a, b) => {
        const numA = parseInt(String(a.tableName || "").replace(/\D+/g, ""), 10);
        const numB = parseInt(String(b.tableName || "").replace(/\D+/g, ""), 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;
        return (a.tableName || "").localeCompare(b.tableName || "");
    });

    const total = sorted.length;
    const isWalkwayEnabled = venueLayout?.walkway?.enabled !== false;
    const walkwayOrientation = venueLayout?.walkway?.orientation || "vertical";
    const result = {};

    if (isWalkwayEnabled && walkwayOrientation === "vertical") {
        // Two symmetrical wings flanking the center aisle (Walkway at x=50%)
        // Left Wing: x in [7%, 43%], Right Wing: x in [57%, 93%]
        const half = Math.ceil(total / 2);

        // Determine number of columns per wing based on table count (supports up to 100+ tables)
        let colsPerWing = 1;
        if (half <= 3) colsPerWing = 1;
        else if (half <= 10) colsPerWing = 2;
        else if (half <= 18) colsPerWing = 3;
        else if (half <= 32) colsPerWing = 4;
        else if (half <= 55) colsPerWing = 5; // for 50 tables per wing = 100 tables total!
        else colsPerWing = 6;

        const rowsPerWing = Math.max(1, Math.ceil(half / colsPerWing));

        // Generate X coordinates for Left and Right wings
        const leftX = [];
        const rightX = [];
        const leftMinX = total > 50 ? 7 : 10;
        const leftMaxX = total > 50 ? 43 : 40;
        const rightMinX = total > 50 ? 57 : 60;
        const rightMaxX = total > 50 ? 93 : 90;

        if (colsPerWing === 1) {
            leftX.push(25);
            rightX.push(75);
        } else {
            for (let c = 0; c < colsPerWing; c++) {
                const fraction = c / (colsPerWing - 1);
                leftX.push(Math.round((leftMinX + fraction * (leftMaxX - leftMinX)) * 10) / 10);
                rightX.push(Math.round((rightMinX + fraction * (rightMaxX - rightMinX)) * 10) / 10);
            }
        }

        // Generate Y coordinates for rows
        const topY = total > 50 ? 17 : 21;
        const bottomY = total > 50 ? 83 : 78;
        const rowY = [];
        if (rowsPerWing === 1) {
            rowY.push(48);
        } else {
            for (let r = 0; r < rowsPerWing; r++) {
                const fraction = r / (rowsPerWing - 1);
                rowY.push(Math.round((topY + fraction * (bottomY - topY)) * 10) / 10);
            }
        }

        // Distribute tables into the grid:
        // Symmetrical row-by-row across Left and Right wings:
        // Row 0: Left wing cols [0..colsPerWing-1], then Right wing cols [0..colsPerWing-1]
        // This guarantees Row 1 contains តុ 1, តុ 2, តុ 3... in the front row!
        let tableIdx = 0;
        for (let r = 0; r < rowsPerWing && tableIdx < total; r++) {
            // Left wing tables for row r
            for (let c = 0; c < colsPerWing && tableIdx < total; c++) {
                const table = sorted[tableIdx++];
                result[table.id] = { x: leftX[c], y: rowY[r] };
            }
            // Right wing tables for row r
            for (let c = 0; c < colsPerWing && tableIdx < total; c++) {
                const table = sorted[tableIdx++];
                result[table.id] = { x: rightX[c], y: rowY[r] };
            }
        }
    } else if (isWalkwayEnabled && walkwayOrientation === "horizontal") {
        // Horizontal Walkway (Walkway at y=50%)
        const half = Math.ceil(total / 2);
        const cols = Math.max(2, Math.min(10, Math.ceil(half / 4)));
        const rowsPerWing = Math.max(1, Math.ceil(half / cols));

        const xCoords = [];
        for (let c = 0; c < cols; c++) {
            const fraction = cols === 1 ? 0.5 : c / (cols - 1);
            xCoords.push(Math.round((10 + fraction * 80) * 10) / 10);
        }

        const topY = [];
        const bottomY = [];
        for (let r = 0; r < rowsPerWing; r++) {
            const frac = rowsPerWing === 1 ? 0.5 : r / (rowsPerWing - 1);
            topY.push(Math.round((18 + frac * 24) * 10) / 10);
            bottomY.push(Math.round((58 + frac * 26) * 10) / 10);
        }

        let tableIdx = 0;
        // Top wing
        for (let r = 0; r < rowsPerWing && tableIdx < total; r++) {
            for (let c = 0; c < cols && tableIdx < total; c++) {
                const table = sorted[tableIdx++];
                result[table.id] = { x: xCoords[c], y: topY[r] };
            }
        }
        // Bottom wing
        for (let r = 0; r < rowsPerWing && tableIdx < total; r++) {
            for (let c = 0; c < cols && tableIdx < total; c++) {
                const table = sorted[tableIdx++];
                result[table.id] = { x: xCoords[c], y: bottomY[r] };
            }
        }
    } else {
        // Walkway Disabled — Full open hall grid (scales to 100 tables)
        let cols = Math.max(2, Math.min(10, Math.ceil(Math.sqrt(total * 1.3))));
        let rows = Math.max(1, Math.ceil(total / cols));

        const xCoords = [];
        for (let c = 0; c < cols; c++) {
            const fraction = cols === 1 ? 0.5 : c / (cols - 1);
            xCoords.push(Math.round((10 + fraction * 80) * 10) / 10);
        }

        const yCoords = [];
        for (let r = 0; r < rows; r++) {
            const fraction = rows === 1 ? 0.5 : r / (rows - 1);
            yCoords.push(Math.round((18 + fraction * 64) * 10) / 10);
        }

        let tableIdx = 0;
        for (let r = 0; r < rows && tableIdx < total; r++) {
            for (let c = 0; c < cols && tableIdx < total; c++) {
                const table = sorted[tableIdx++];
                result[table.id] = { x: xCoords[c], y: yCoords[r] };
            }
        }
    }

    return result;
}

function parsePosition(table, index, total, fallbackGrid = {}) {
    if (table?.notes && typeof table.notes === "string" && table.notes.trim().startsWith("{")) {
        try {
            const parsed = JSON.parse(table.notes);
            if (typeof parsed.x === "number" && typeof parsed.y === "number") {
                return { x: parsed.x, y: parsed.y };
            }
        } catch {
            // fallback
        }
    }
    if (fallbackGrid && fallbackGrid[table?.id]) {
        return fallbackGrid[table.id];
    }
    return { x: 25, y: 35 };
}

// Generate chair positions around a circular table with dynamic scaling
function renderChairs(capacity = 10, scale = 1.0) {
    const chairCount = Math.min(12, Math.max(4, capacity || 10));
    const radius = Math.max(18, Math.round(46 * scale));
    const dotSize = Math.max(4, Math.round(9 * scale));
    const chairs = [];

    for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * 2 * Math.PI - Math.PI / 2;
        const x = Math.round(Math.cos(angle) * radius);
        const y = Math.round(Math.sin(angle) * radius);
        chairs.push(
            <span
                key={i}
                className="sfp-chair-dot"
                style={{
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    left: `calc(50% + ${x}px - ${dotSize / 2}px)`,
                    top: `calc(50% + ${y}px - ${dotSize / 2}px)`,
                }}
            />
        );
    }
    return chairs;
}

export function SeatingFloorPlan({
    tables = [],
    assignmentsByTable = new Map(),
    onSavePositions,
    onCreateTable,
    invitationId = null,
    saving = false,
    readOnly = false,
    highlightTableName = "",
    highlightTableId = null,
}) {
    const [positions, setPositions] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTableName, setNewTableName] = useState("");
    const [newTableLabel, setNewTableLabel] = useState("");
    const [newCapacity, setNewCapacity] = useState(10);
    const [collidingTableId, setCollidingTableId] = useState(null);
    const [canvasTheme, setCanvasTheme] = useState("light"); // "light" (Architectural) | "dark" (Night Ballroom)

    // Dynamic Table Scale: 1.0 (<=30 tables), 0.82 (31-50), 0.68 (51-75), 0.54 (76-100+)
    const tableScale = useMemo(() => {
        const count = tables.length;
        if (count <= 30) return 1.0;
        if (count <= 50) return 0.82;
        if (count <= 75) return 0.68;
        return 0.54;
    }, [tables.length]);

    // Draggable & Customizable Venue Elements (Stage, Walkway, Entrance)
    const [venueLayout, setVenueLayout] = useState(() => {
        try {
            if (invitationId) {
                const saved = localStorage.getItem(`koupreng_venue_layout_${invitationId}`);
                if (saved) return JSON.parse(saved);
            }
        } catch {
            // ignore
        }
        return {
            stage: { x: 50, y: 9 },
            entrance: { x: 50, y: 92 },
            walkway: { x: 50, y: 51, orientation: "vertical", enabled: true },
        };
    });

    // Unified drag target: { type: 'table', id } | { type: 'stage' } | { type: 'entrance' } | { type: 'walkway' }
    const [dragTarget, setDragTarget] = useState(null);
    const canvasRef = useRef(null);
    const dragStartRef = useRef({ clientX: 0, clientY: 0, initialX: 0, initialY: 0 });

    // Refs for buttery smooth dragging without re-attaching event listeners on every tick
    const positionsRef = useRef(positions);
    positionsRef.current = positions;

    const tableScaleRef = useRef(tableScale);
    tableScaleRef.current = tableScale;

    // Initialize positions on tables load
    useEffect(() => {
        const defaultGrid = calculateAutoArrangePositions(tables, venueLayout);
        const init = {};
        tables.forEach((t, i) => {
            init[t.id] = parsePosition(t, i, tables.length, defaultGrid);
        });
        setPositions(init);
        setIsDirty(false);
    }, [tables]);

    // Drag start for tables
    const handleStartDragTable = (e, tableId) => {
        if (readOnly) {
            setSelectedTableId(tableId);
            return;
        }
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const currentPos = positions[tableId] || { x: 50, y: 50 };
        dragStartRef.current = {
            clientX,
            clientY,
            initialX: currentPos.x,
            initialY: currentPos.y,
        };
        setDragTarget({ type: "table", id: tableId });
        setSelectedTableId(tableId);
    };

    // Drag start for venue elements (stage, walkway, entrance)
    const handleStartDragVenue = (e, elementKey) => {
        if (readOnly) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const currentPos = venueLayout[elementKey] || { x: 50, y: 50 };
        dragStartRef.current = {
            clientX,
            clientY,
            initialX: currentPos.x,
            initialY: currentPos.y,
        };
        setDragTarget({ type: elementKey });
    };

    useEffect(() => {
        if (!dragTarget) return;

        const handleMove = (e) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const deltaX = ((clientX - dragStartRef.current.clientX) / rect.width) * 100;
            const deltaY = ((clientY - dragStartRef.current.clientY) / rect.height) * 100;

            let nextX = Math.round((dragStartRef.current.initialX + deltaX) * 10) / 10;
            let nextY = Math.round((dragStartRef.current.initialY + deltaY) * 10) / 10;

            if (dragTarget.type === "table") {
                // Free movement across 100% of the ballroom canvas from edge to edge
                nextX = Math.max(3, Math.min(97, nextX));
                nextY = Math.max(4, Math.min(96, nextY));

                // Collision check (Anti-overlap: kom oy jun knea)
                const collisionDist = Math.max(6.0, 11.0 * tableScaleRef.current);
                const isColliding = hasCollision(nextX, nextY, positionsRef.current, dragTarget.id, collisionDist);
                setCollidingTableId(isColliding ? dragTarget.id : null);

                setPositions((prev) => ({
                    ...prev,
                    [dragTarget.id]: { x: nextX, y: nextY },
                }));
                setIsDirty(true);
            } else if (dragTarget.type === "stage") {
                nextX = Math.max(10, Math.min(90, nextX));
                nextY = Math.max(4, Math.min(96, nextY));
                setVenueLayout((prev) => ({ ...prev, stage: { x: nextX, y: nextY } }));
                setIsDirty(true);
            } else if (dragTarget.type === "entrance") {
                nextX = Math.max(10, Math.min(90, nextX));
                nextY = Math.max(4, Math.min(96, nextY));
                setVenueLayout((prev) => ({ ...prev, entrance: { x: nextX, y: nextY } }));
                setIsDirty(true);
            } else if (dragTarget.type === "walkway") {
                nextX = Math.max(5, Math.min(95, nextX));
                nextY = Math.max(5, Math.min(95, nextY));
                setVenueLayout((prev) => ({ ...prev, walkway: { ...prev.walkway, x: nextX, y: nextY } }));
                setIsDirty(true);
            }
        };

        const handleEnd = () => {
            // On drop: if table overlaps another table, gently push it to safe clearance
            if (dragTarget?.type === "table") {
                const currentPos = positionsRef.current[dragTarget.id];
                if (currentPos) {
                    const otherTables = Object.entries(positionsRef.current).filter(
                        ([id]) => String(id) !== String(dragTarget.id)
                    );
                    let closest = null;
                    let minDist = 999;
                    for (const [, otherPos] of otherTables) {
                        const d = Math.hypot(currentPos.x - otherPos.x, currentPos.y - otherPos.y);
                        if (d < minDist) {
                            minDist = d;
                            closest = otherPos;
                        }
                    }
                    const dropThreshold = Math.max(6.5, 11.5 * tableScaleRef.current);
                    const safeClearance = Math.max(7.2, 12.5 * tableScaleRef.current);
                    if (closest && minDist < dropThreshold) {
                        const angle = Math.atan2(currentPos.y - closest.y, currentPos.x - closest.x) || (Math.PI / 4);
                        const safeX = Math.max(
                            3,
                            Math.min(97, Math.round((closest.x + Math.cos(angle) * safeClearance) * 10) / 10)
                        );
                        const safeY = Math.max(
                            4,
                            Math.min(96, Math.round((closest.y + Math.sin(angle) * safeClearance) * 10) / 10)
                        );
                        setPositions((prev) => ({
                            ...prev,
                            [dragTarget.id]: { x: safeX, y: safeY },
                        }));
                    }
                }
            }
            setCollidingTableId(null);
            setDragTarget(null);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleEnd);
        window.addEventListener("touchmove", handleMove, { passive: false });
        window.addEventListener("touchend", handleEnd);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleEnd);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleEnd);
        };
    }, [dragTarget]);

    // Auto arrange into clean symmetrical multi-column rows flanking the walkway (like Canva grid)
    const handleAutoArrange = () => {
        const arranged = calculateAutoArrangePositions(tables, venueLayout);
        setPositions(arranged);
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!onSavePositions) return;
        if (invitationId) {
            try {
                localStorage.setItem(`koupreng_venue_layout_${invitationId}`, JSON.stringify(venueLayout));
            } catch {
                // ignore
            }
        }
        await onSavePositions(positions, venueLayout);
        setIsDirty(false);
    };

    const handleQuickAddTable = async (e) => {
        e.preventDefault();
        if (!newTableName.trim() || !onCreateTable) return;
        // Non-overlapping position calculation with tableScale (kom oy jun knea)
        const defaultPos = findNonOverlappingPosition(positions, tables.length, tableScale);
        await onCreateTable({
            tableName: newTableName.trim(),
            tableLabel: newTableLabel.trim(),
            capacity: Number(newCapacity) || 10,
            notes: JSON.stringify(defaultPos),
        });
        setShowAddModal(false);
        setNewTableName("");
        setNewTableLabel("");
        setNewCapacity(10);
    };

    const selectedTable = useMemo(() => {
        return tables.find((t) => t.id === selectedTableId);
    }, [tables, selectedTableId]);

    const selectedGuests = useMemo(() => {
        if (!selectedTableId) return [];
        return assignmentsByTable.get(selectedTableId) || [];
    }, [assignmentsByTable, selectedTableId]);

    return (
        <div className="sfp-container">
            {/* Toolbar (Only for Host Edit mode) */}
            {!readOnly && (
                <div className="sfp-toolbar">
                    <div className="sfp-toolbar__left">
                        <div className="sfp-toolbar__title">
                            <IoSparkles style={{ color: "#b98b42" }} />
                            <span>ប្លង់សាលមង្គលការ (Interactive Ballroom Plan)</span>
                        </div>
                        {isDirty && (
                            <span className="sfp-badge-dirty">● មានការកែប្រែទីតាំង (Unsaved changes)</span>
                        )}
                    </div>

                    <div className="sfp-toolbar__actions">
                        {/* Walkway orientation controls */}
                        <div className="sfp-segmented" title="ទិសដៅផ្លូវដើរ (Walkway layout)">
                            <span style={{ fontSize: "0.725rem", fontWeight: 800, color: "#78716c", padding: "0 4px" }}>
                                ផ្លូវដើរ:
                            </span>
                            <button
                                type="button"
                                className={`sfp-seg-btn ${
                                    venueLayout.walkway.orientation === "vertical" &&
                                    venueLayout.walkway.enabled !== false
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => {
                                    setVenueLayout((prev) => ({
                                        ...prev,
                                        walkway: { ...prev.walkway, orientation: "vertical", enabled: true },
                                    }));
                                    setIsDirty(true);
                                }}
                            >
                                ↕️ បញ្ឈរ
                            </button>
                            <button
                                type="button"
                                className={`sfp-seg-btn ${
                                    venueLayout.walkway.orientation === "horizontal" &&
                                    venueLayout.walkway.enabled !== false
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => {
                                    setVenueLayout((prev) => ({
                                        ...prev,
                                        walkway: { ...prev.walkway, orientation: "horizontal", enabled: true },
                                    }));
                                    setIsDirty(true);
                                }}
                            >
                                ↔️ ផ្ដេក
                            </button>
                            <button
                                type="button"
                                className={`sfp-seg-btn ${venueLayout.walkway.enabled === false ? "active" : ""}`}
                                onClick={() => {
                                    setVenueLayout((prev) => ({
                                        ...prev,
                                        walkway: { ...prev.walkway, enabled: false },
                                    }));
                                    setIsDirty(true);
                                }}
                            >
                                🚫 បិទ
                            </button>
                        </div>

                        {/* Table Density & Counter Badge */}
                        <div className="sfp-tables-counter-badge" title="ចំនួនតុសរុបក្នុងសាល">
                            <IoRestaurantOutline />
                            <span>{tables.length} តុ {tables.length >= 60 ? "🔥 (សាលធំ)" : ""}</span>
                        </div>

                        {/* Canvas Theme Toggle */}
                        <button
                            type="button"
                            className="sfp-btn sfp-btn--outline sfp-btn--theme"
                            onClick={() => setCanvasTheme((t) => (t === "light" ? "dark" : "light"))}
                            title="ប្តូរពណ៌ផ្ទៃប្លង់ (Light / Dark Canvas)"
                        >
                            <span>{canvasTheme === "light" ? "🌙 ផ្ទាំងរាត្រី" : "☀️ ផ្ទាំងស្ថាបត្យកម្ម"}</span>
                        </button>

                        {onCreateTable && (
                            <button
                                type="button"
                                className="sfp-btn sfp-btn--add"
                                onClick={() => {
                                    setNewTableName(`តុ ${tables.length + 1}`);
                                    setShowAddModal(true);
                                }}
                            >
                                <IoAddCircleOutline style={{ fontSize: "1.15rem" }} />
                                <span>+ បន្ថែមតុលើប្លង់ (Add Table)</span>
                            </button>
                        )}

                        <button
                            type="button"
                            className="sfp-btn sfp-btn--outline"
                            onClick={handleAutoArrange}
                            title="តម្រៀបតុជាពីរជួរសងខាងផ្លូវកណ្ដាលដោយស្វ័យប្រវត្តិ"
                            disabled={tables.length === 0}
                        >
                            <IoRefreshOutline />
                            <span>តម្រៀបស្វ័យប្រវត្តិ (Auto-Arrange)</span>
                        </button>

                        <button
                            type="button"
                            className={`sfp-btn ${isDirty ? "sfp-btn--save-dirty" : "sfp-btn--primary"}`}
                            onClick={handleSave}
                            disabled={saving || !isDirty}
                        >
                            <IoSaveOutline />
                            <span>{saving ? "កំពុងរក្សាទុក..." : "រក្សាទុកប្លង់ (Save Floor Plan)"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Add Table Modal */}
            {showAddModal && (
                <div className="sfp-add-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="sfp-add-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="sfp-add-modal-head">
                            <h4>➕ បន្ថែមតុថ្មីលើប្លង់សាលការ</h4>
                            <button type="button" className="sfp-detail-close" onClick={() => setShowAddModal(false)}>
                                <IoCloseOutline />
                            </button>
                        </div>
                        <form onSubmit={handleQuickAddTable} className="sfp-add-form">
                            <div className="sfp-field">
                                <label>ឈ្មោះតុ (Table Name) *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ឧ. តុ ១, VIP ១"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="sfp-field">
                                <label>ប្រភេទសម្គាល់ (Label)</label>
                                <input
                                    type="text"
                                    placeholder="ឧ. ក្រុមគ្រួសារ, មិត្តវិទ្យាល័យ"
                                    value={newTableLabel}
                                    onChange={(e) => setNewTableLabel(e.target.value)}
                                />
                            </div>
                            <div className="sfp-field">
                                <label>ចំនួនកៅអី (Capacity)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={newCapacity}
                                    onChange={(e) => setNewCapacity(e.target.value)}
                                />
                            </div>
                            <div className="sfp-form-actions">
                                <button type="button" className="sfp-btn sfp-btn--outline" onClick={() => setShowAddModal(false)}>
                                    បោះបង់
                                </button>
                                <button type="submit" className="sfp-btn sfp-btn--primary" disabled={saving || !newTableName.trim()}>
                                    {saving ? "កំពុងបន្ថែម..." : "ដាក់តុលើប្លង់ភ្លាម"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Interactive Ballroom Canvas */}
            <div
                className={`sfp-canvas-wrapper sfp-canvas--${canvasTheme}`}
                ref={canvasRef}
                onClick={(e) => {
                    if (e.target === canvasRef.current) {
                        setSelectedTableId(null);
                    }
                }}
            >
                {/* 1. Draggable Main Stage */}
                <div
                    className={`sfp-stage ${!readOnly ? "is-draggable" : ""} ${
                        dragTarget?.type === "stage" ? "is-dragging" : ""
                    }`}
                    style={{
                        left: `${venueLayout.stage.x}%`,
                        top: `${venueLayout.stage.y}%`,
                    }}
                    onMouseDown={(e) => handleStartDragVenue(e, "stage")}
                    onTouchStart={(e) => handleStartDragVenue(e, "stage")}
                >
                    <span className="sfp-stage__title">
                        🎤 ឆាកមង្គលការ (Main Wedding Stage)
                        {!readOnly && <span className="sfp-drag-handle-hint">⋮⋮ អូសបាន</span>}
                    </span>
                    <span className="sfp-stage__sub">ឆាកកិត្តិយស & ភ្លើងលម្អ</span>
                </div>

                {/* 2. Draggable & Orientable Red Carpet Walkway */}
                {venueLayout.walkway.enabled !== false && (
                    <div
                        className={`sfp-walkway ${
                            venueLayout.walkway.orientation === "horizontal"
                                ? "sfp-walkway--horizontal"
                                : "sfp-walkway--vertical"
                        } ${!readOnly ? "is-draggable" : ""} ${
                            dragTarget?.type === "walkway" ? "is-dragging" : ""
                        }`}
                        style={{
                            left: `${venueLayout.walkway.x}%`,
                            top: `${venueLayout.walkway.y}%`,
                        }}
                        onMouseDown={(e) => handleStartDragVenue(e, "walkway")}
                        onTouchStart={(e) => handleStartDragVenue(e, "walkway")}
                    >
                        <span className="sfp-walkway__label">
                            ផ្លូវកម្រាលព្រំក្រហម (AISLE)
                            {!readOnly && <span className="sfp-drag-handle-hint"> ⋮⋮ អូសបាន</span>}
                        </span>
                    </div>
                )}

                {/* 3. Draggable Entrance */}
                <div
                    className={`sfp-entrance ${!readOnly ? "is-draggable" : ""} ${
                        dragTarget?.type === "entrance" ? "is-dragging" : ""
                    }`}
                    style={{
                        left: `${venueLayout.entrance.x}%`,
                        top: `${venueLayout.entrance.y}%`,
                    }}
                    onMouseDown={(e) => handleStartDragVenue(e, "entrance")}
                    onTouchStart={(e) => handleStartDragVenue(e, "entrance")}
                >
                    <span>
                        🚪 ច្រកចូលសាលការ (Main Entrance & Foyer)
                        {!readOnly && <span className="sfp-drag-handle-hint">⋮⋮ អូសបាន</span>}
                    </span>
                </div>

                {/* Empty State when 0 tables */}
                {!readOnly && tables.length === 0 && (
                    <div className="sfp-canvas-empty">
                        <div className="sfp-canvas-empty__icon-wrap">
                            <IoRestaurantOutline />
                        </div>
                        <h3>ផ្ទាំងប្លង់សាលការទទេស្អាត (Empty Canvas)</h3>
                        <p>
                            សូមចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតតុដំបូង ហើយអូសដាក់ទីតាំងលើកម្រាលរៀបចំអាពាហ៍ពិពាហ៍ដូច Canva!
                        </p>
                        <button
                            type="button"
                            className="sfp-btn sfp-btn--add sfp-btn--lg"
                            onClick={() => {
                                setNewTableName("តុ ១");
                                setShowAddModal(true);
                            }}
                        >
                            <IoAddCircleOutline style={{ fontSize: "1.25rem" }} />
                            <span>+ បន្ថែមតុដំបូងឥឡូវនេះ</span>
                        </button>
                    </div>
                )}

                {/* 4. Tables with Collision Warning & Dynamic Scaling */}
                {tables.map((table) => {
                    const pos = positions[table.id] || { x: 50, y: 50 };
                    const isDragging = dragTarget?.type === "table" && dragTarget.id === table.id;
                    const isColliding = collidingTableId === table.id;
                    const assigned = table.assignedSeats || 0;
                    const cap = table.capacity || 10;
                    const isFull = assigned >= cap;
                    const isEmpty = assigned === 0;

                    // Match highlight for guest view
                    const isHighlighted =
                        (highlightTableId && String(table.id) === String(highlightTableId)) ||
                        (highlightTableName &&
                            (table.tableName?.trim() === highlightTableName?.trim() ||
                                table.tableLabel?.trim() === highlightTableName?.trim()));

                    return (
                        <div
                            key={table.id}
                            className={`sfp-table-node ${isDragging ? "is-dragging" : ""} ${
                                isColliding ? "is-colliding" : ""
                            } ${readOnly ? "is-readonly" : ""} ${isHighlighted ? "is-highlighted" : ""} ${
                                isFull ? "status-full" : isEmpty ? "status-empty" : ""
                            }`}
                            style={{
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                width: `${Math.round(82 * tableScale)}px`,
                                height: `${Math.round(82 * tableScale)}px`,
                            }}
                            onMouseDown={(e) => handleStartDragTable(e, table.id)}
                            onTouchStart={(e) => handleStartDragTable(e, table.id)}
                        >
                            {/* Collision Warning Tooltip */}
                            {isColliding && (
                                <div className="sfp-collision-tooltip">
                                    ⚠️ ជិតជាន់គ្នា!
                                </div>
                            )}

                            {/* Highlight Badge if this is guest's assigned table */}
                            {isHighlighted && (
                                <div className="sfp-highlight-badge">
                                    ⭐ តុរបស់អ្នកនៅត្រង់នេះ!
                                </div>
                            )}

                            {/* Circular table with chairs */}
                            <div className="sfp-table-circle">
                                {renderChairs(cap, tableScale)}
                                <span
                                    className="sfp-table-name"
                                    style={{
                                        fontSize: tableScale < 0.6 ? "0.62rem" : tableScale < 0.8 ? "0.72rem" : "0.85rem",
                                    }}
                                    title={table.tableName}
                                >
                                    {table.tableName}
                                </span>
                                {table.tableLabel && tableScale >= 0.7 && (
                                    <span className="sfp-table-label" title={table.tableLabel}>
                                        {table.tableLabel}
                                    </span>
                                )}
                                <span
                                    className="sfp-table-cap"
                                    style={{
                                        fontSize: tableScale < 0.6 ? "0.55rem" : tableScale < 0.8 ? "0.62rem" : "0.68rem",
                                        padding: tableScale < 0.6 ? "1px 3px" : "2px 6px",
                                    }}
                                >
                                    {assigned}/{cap}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Selected Table Detail Drawer */}
                {selectedTable && (
                    <div className="sfp-detail-panel">
                        <div className="sfp-detail-header">
                            <div>
                                <div className="sfp-detail-title">{selectedTable.tableName}</div>
                                <div className="sfp-detail-sub">
                                    {selectedTable.tableLabel ? `${selectedTable.tableLabel} • ` : ""}
                                    {selectedTable.assignedSeats || 0}/{selectedTable.capacity} នាក់
                                </div>
                            </div>
                            <button
                                type="button"
                                className="sfp-detail-close"
                                onClick={() => setSelectedTableId(null)}
                                title="បិទ"
                            >
                                <IoCloseOutline />
                            </button>
                        </div>

                        <div className="sfp-detail-guests">
                            {selectedGuests.length > 0 ? (
                                selectedGuests.map((assignment) => (
                                    <div key={assignment.id} className="sfp-detail-guest-item">
                                        <span>
                                            👤 {assignment.guestName || "ភ្ញៀវ"}
                                            {assignment.guestGroup ? ` (${assignment.guestGroup})` : ""}
                                        </span>
                                        <strong>{assignment.seatCount || 1} កៅអី</strong>
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", padding: "10px" }}>
                                    មិនទាន់មានភ្ញៀវក្នុងតុនេះទេ
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend / Guide */}
            <div className="sfp-legend">
                <div className="sfp-legend__item">
                    <span className="sfp-legend__dot sfp-legend__dot--stage" />
                    <span>ឆាកមង្គលការ (អូសប្ដូរទីតាំងបាន)</span>
                </div>
                <div className="sfp-legend__item">
                    <span className="sfp-legend__dot sfp-legend__dot--aisle" />
                    <span>ផ្លូវកម្រាលព្រំ (អូសប្ដូរទីតាំងបាន)</span>
                </div>
                <div className="sfp-legend__item">
                    <span className="sfp-legend__dot sfp-legend__dot--table" />
                    <span>តុមានកៅអីទំនេរ</span>
                </div>
                <div className="sfp-legend__item">
                    <span className="sfp-legend__dot sfp-legend__dot--full" />
                    <span>តុពេញកៅអី</span>
                </div>
                {(highlightTableName || highlightTableId) && (
                    <div className="sfp-legend__item">
                        <span className="sfp-legend__dot sfp-legend__dot--guest" />
                        <strong>តុរបស់អ្នក (Your Table)</strong>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeatingFloorPlan;
