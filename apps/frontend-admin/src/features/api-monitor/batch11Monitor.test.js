import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useApiMonitorStream } from "./useApiMonitorStream";
import { useQaSessionRecorder } from "./useQaSessionRecorder";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function stream() {
  let controller;
  const body = new ReadableStream({ start(value) { controller = value; } });
  return {
    response: { ok: true, body },
    send(event, data) { controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); },
  };
}

it("counts duplicate stream frames once and clears selected private details", async () => {
  const source = stream();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(source.response));
  const { result } = renderHook(useApiMonitorStream);
  await waitFor(() => expect(result.current.status).toBe("connected"));
  await act(async () => {
    source.send("init", { events: [], stats: { totalRequests: 0, successCount: 0, clientErrorCount: 0, serverErrorCount: 0, slowRequestsCount: 0 } });
    source.send("request", { id: "b11-frame", status: 200, sqlQueryCount: 2 });
    source.send("request", { id: "b11-frame", status: 200, sqlQueryCount: 2 });
  });
  expect(result.current.events).toHaveLength(1);
  expect(result.current.stats).toMatchObject({ totalRequests: 1, successCount: 1, totalSqlQueries: 2 });
  act(() => { result.current.setSelectedEvent(result.current.events[0]); result.current.clearLocalBuffer(); });
  expect(result.current.selectedEvent).toBeNull();
  expect(result.current.events).toEqual([]);
});

it("ignores a response from an aborted connection after reconnect", async () => {
  let resolveOld;
  const source = stream();
  vi.stubGlobal("fetch", vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce(source.response));
  const { result } = renderHook(useApiMonitorStream);
  act(() => result.current.reconnect());
  await waitFor(() => expect(result.current.status).toBe("connected"));
  await act(async () => resolveOld({ ok: false, status: 403, statusText: "Forbidden" }));
  expect(result.current.status).toBe("connected");
  expect(result.current.errorMessage).toBeNull();
});

it("sanitizes session names, notes and event descriptions in downloaded JSON", async () => {
  let blob;
  vi.spyOn(URL, "createObjectURL").mockImplementation(value => { blob = value; return "blob:batch11"; });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const { result } = renderHook(useQaSessionRecorder);
  act(() => result.current.startSession("token=private-session"));
  act(() => result.current.addNote("Authorization: Bearer private-note"));
  act(() => result.current.exportSanitizedData([{ id: "fixture", timestamp: new Date().toISOString(), path: "/api?Guest%54oken=private-guest&page=2", clientAction: "paymentReference=private-bank", errorCode: "Bearer private-error" }]));
  const value = await blob.text();
  expect(value).not.toContain("private-");
  expect(value).toContain("page=2");
  expect(value).toContain("[REDACTED]");
});
