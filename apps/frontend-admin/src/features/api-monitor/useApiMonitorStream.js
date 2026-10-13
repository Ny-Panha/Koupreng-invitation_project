import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessToken } from "../../shared/utils/authStorage";

const MAX_CLIENT_BUFFER = 500;

export function useApiMonitorStream() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("connecting"); // "connecting" | "connected" | "disconnected" | "paused" | "error"
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const abortControllerRef = useRef(null);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;
  const lastEventIdRef = useRef(null);

  const connectStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setStatus("connecting");
    setErrorMessage(null);

    const token = getAccessToken();
    const headers = {
      Accept: "text/event-stream",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (lastEventIdRef.current) {
      headers["Last-Event-ID"] = String(lastEventIdRef.current);
    }

    const baseUrl = import.meta.env.VITE_API_URL || "/api";
    const lastIdParam = lastEventIdRef.current ? `?lastEventId=${lastEventIdRef.current}` : "";
    const streamUrl = `${baseUrl}/v1/admin/dev-monitor/stream${lastIdParam}`;

    fetch(streamUrl, {
      method: "GET",
      headers,
      credentials: "include",
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        if (!response.body) {
          throw new Error("ReadableStream not supported by browser");
        }

        setStatus("connected");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        let currentEvent = "message";
        let currentId = null;
        let currentData = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith(":")) {
              // Heartbeat comment
              continue;
            }

            if (!trimmed) {
              // Dispatch event on empty line
              if (currentData) {
                try {
                  const parsed = JSON.parse(currentData);
                  if (currentId) {
                    lastEventIdRef.current = currentId;
                  } else if (parsed?.id) {
                    lastEventIdRef.current = parsed.id;
                  }
                  handleSseEvent(currentEvent, parsed);
                } catch {
                  // Ignore JSON parse errors for non-json data
                }
              }
              currentEvent = "message";
              currentId = null;
              currentData = "";
              continue;
            }

            if (trimmed.startsWith("id:")) {
              currentId = trimmed.slice(3).trim();
            } else if (trimmed.startsWith("event:")) {
              currentEvent = trimmed.slice(6).trim();
            } else if (trimmed.startsWith("data:")) {
              const dataPiece = trimmed.slice(5).trim();
              currentData = currentData ? `${currentData}\n${dataPiece}` : dataPiece;
            }
          }
        }

        if (!abortController.signal.aborted) {
          setStatus("disconnected");
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        setStatus("error");
        setErrorMessage(err.message || "Failed to connect to monitor stream");
      });
  }, []);

  const handleSseEvent = useCallback((eventName, data) => {
    if (isPausedRef.current && eventName === "request") {
      return;
    }

    if (eventName === "init") {
      if (Array.isArray(data?.events)) {
        if (data.replayed) {
          // Merge replayed events avoiding duplicates
          setEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newEvents = data.events.filter((e) => !existingIds.has(e.id));
            return [...newEvents.reverse(), ...prev].slice(0, MAX_CLIENT_BUFFER);
          });
        } else {
          setEvents(data.events);
        }
      }
      if (data?.stats) {
        setStats(data.stats);
      }
    } else if (eventName === "request") {
      setEvents((prev) => {
        // Prevent duplicate insertion
        if (prev.some((e) => e.id === data.id)) return prev;
        const next = [data, ...prev];
        return next.length > MAX_CLIENT_BUFFER ? next.slice(0, MAX_CLIENT_BUFFER) : next;
      });
      // Incrementally update stats
      setStats((prev) => {
        if (!prev) return null;
        const isSuccess = data.status >= 200 && data.status < 400;
        const isClientErr = data.status >= 400 && data.status < 500;
        const isServerErr = data.status >= 500;
        return {
          ...prev,
          totalRequests: prev.totalRequests + 1,
          successCount: prev.successCount + (isSuccess ? 1 : 0),
          clientErrorCount: prev.clientErrorCount + (isClientErr ? 1 : 0),
          serverErrorCount: prev.serverErrorCount + (isServerErr ? 1 : 0),
          slowRequestsCount: prev.slowRequestsCount + (data.slow ? 1 : 0),
          totalSqlQueries: (prev.totalSqlQueries || 0) + (data.sqlQueryCount || 0),
          nPlusOneCount: (prev.nPlusOneCount || 0) + (data.nPlusOneDetected ? 1 : 0),
        };
      });
    } else if (eventName === "clear") {
      setEvents([]);
      lastEventIdRef.current = null;
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalRequests: 0,
              successCount: 0,
              clientErrorCount: 0,
              serverErrorCount: 0,
              slowRequestsCount: 0,
              totalSqlQueries: 0,
              nPlusOneCount: 0,
            }
          : null
      );
    }
  }, []);

  // Capture client-side network failures dispatched by httpClient or adminHttpClient
  useEffect(() => {
    const handleClientError = (e) => {
      if (e.detail && !isPausedRef.current) {
        setEvents((prev) => {
          const next = [e.detail, ...prev];
          return next.length > MAX_CLIENT_BUFFER ? next.slice(0, MAX_CLIENT_BUFFER) : next;
        });
      }
    };
    window.addEventListener("koupreng:api-error", handleClientError);
    return () => window.removeEventListener("koupreng:api-error", handleClientError);
  }, []);

  useEffect(() => {
    connectStream();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [connectStream]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const clearHistory = useCallback(async () => {
    const baseUrl = import.meta.env.VITE_API_URL || "/api";
    const token = getAccessToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      await fetch(`${baseUrl}/v1/admin/dev-monitor/clear`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      setEvents([]);
      lastEventIdRef.current = null;
    } catch {
      // Clear local state anyway
      setEvents([]);
      lastEventIdRef.current = null;
    }
  }, []);

  return {
    events,
    stats,
    status,
    errorMessage,
    isPaused,
    selectedEvent,
    setSelectedEvent,
    togglePause,
    clearHistory,
    reconnect: connectStream,
  };
}
