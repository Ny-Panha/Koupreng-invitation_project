import { useState, useCallback, useRef } from "react";

export function useQaSessionRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const sessionStartTimeRef = useRef(null);

  const startSession = useCallback((name = "QA Exploratory Test") => {
    const id = "qa-" + Date.now().toString(36);
    const now = new Date();
    sessionStartTimeRef.current = now.getTime();
    const session = {
      id,
      name,
      startedAt: now.toISOString(),
      notes: [],
    };
    setActiveSession(session);
    setIsRecording(true);
  }, []);

  const addNote = useCallback((text) => {
    if (!text?.trim()) return;
    setActiveSession((prev) => {
      if (!prev) return prev;
      const note = {
        id: "note-" + Date.now(),
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };
      return {
        ...prev,
        notes: [...prev.notes, note],
      };
    });
  }, []);

  const stopSession = useCallback(() => {
    setIsRecording(false);
    setActiveSession((prev) => (prev ? { ...prev, endedAt: new Date().toISOString() } : null));
  }, []);

  const exportSanitizedData = useCallback((events, format = "json") => {
    // Filter events to only those during active session if one exists
    const startTime = sessionStartTimeRef.current;
    const sessionEvents = startTime
      ? events.filter((e) => new Date(e.timestamp).getTime() >= startTime)
      : events;

    // Strict sanitization: preserve telemetry identifiers and timing metrics, never secret payloads
    const sanitizedEvents = sessionEvents.map((e) => ({
      id: e.id,
      requestId: e.requestId,
      actionId: e.actionId || "",
      method: e.method,
      path: e.path,
      status: e.status,
      durationMs: e.durationMs,
      clientDurationMs: e.clientDurationMs || 0,
      clientApp: e.clientApp,
      clientAction: e.clientAction || "",
      sqlQueryCount: e.sqlQueryCount || 0,
      nPlusOneDetected: Boolean(e.nPlusOneDetected),
      contractStatus: e.contractStatus || "UNTRACKED",
      source: e.source || "BACKEND_OBSERVED",
      outcome: e.outcome,
      errorCode: e.errorCode || "",
      timestamp: e.timestamp,
    }));

    const exportPayload = {
      session: activeSession || { id: "adhoc-export", name: "Manual Snapshot", exportedAt: new Date().toISOString() },
      totalEvents: sanitizedEvents.length,
      events: sanitizedEvents,
    };

    let blob;
    let extension;
    if (format === "csv") {
      const headers = [
        "id",
        "requestId",
        "actionId",
        "method",
        "path",
        "status",
        "durationMs",
        "clientDurationMs",
        "clientApp",
        "clientAction",
        "sqlQueryCount",
        "contractStatus",
        "outcome",
        "errorCode",
        "timestamp",
      ];
      const rows = sanitizedEvents.map((e) =>
        headers.map((h) => JSON.stringify(e[h] ?? "")).join(",")
      );
      const csvContent = [headers.join(","), ...rows].join("\n");
      blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      extension = "csv";
    } else {
      blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json;charset=utf-8;",
      });
      extension = "json";
    }

    const filename = `koupreng-api-session-${activeSession?.id || "snapshot"}-${Date.now()}.${extension}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [activeSession]);

  return {
    isRecording,
    activeSession,
    startSession,
    stopSession,
    addNote,
    exportSanitizedData,
  };
}

