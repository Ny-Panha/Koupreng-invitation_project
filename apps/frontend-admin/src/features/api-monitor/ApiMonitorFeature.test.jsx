import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ApiMonitorFeature from "./ApiMonitorFeature";
import * as streamHook from "./useApiMonitorStream";
import { AdminLanguageProvider } from "../../app/providers/AdminLanguageProvider";

describe("ApiMonitorFeature", () => {
  const mockEvents = [
    {
      id: 1,
      requestId: "req-abc-12345",
      actionId: "act-reg-1",
      timestamp: "2026-10-13T15:00:00Z",
      clientApp: "frontend-user",
      frontendRoute: "/register",
      clientAction: "REGISTER_SUBMIT",
      method: "POST",
      path: "/api/v1/auth/register",
      target: "/api/v1/auth/register",
      matchedPattern: "/api/v1/auth/register",
      controller: "AuthController.register()",
      status: 201,
      durationMs: 45,
      clientDurationMs: 55,
      slow: false,
      sqlQueryCount: 2,
      sqlDurationMs: 12,
      nPlusOneDetected: false,
      source: "BACKEND_OBSERVED",
      contractStatus: "MATCHED",
      clientIp: "127.0.0.1",
      userPrincipal: "anonymous",
      userRole: "ANONYMOUS",
      authenticated: false,
      outcome: "SUCCESS",
      errorCode: "",
    },
    {
      id: 2,
      requestId: "req-xyz-67890",
      actionId: "act-tmpl-2",
      timestamp: "2026-10-13T15:01:00Z",
      clientApp: "frontend-admin",
      frontendRoute: "/templates",
      clientAction: "UPDATE_TEMPLATE",
      method: "PUT",
      path: "/api/v1/admin/templates/silk-heritage",
      target: "/api/v1/admin/templates/silk-heritage",
      matchedPattern: "/api/v1/admin/templates/{id}",
      controller: "TemplateController.update()",
      status: 400,
      durationMs: 620,
      clientDurationMs: 640,
      slow: true,
      sqlQueryCount: 5,
      sqlDurationMs: 45,
      nPlusOneDetected: true,
      source: "BACKEND_OBSERVED",
      contractStatus: "MATCHED",
      clientIp: "127.0.0.1",
      userPrincipal: "admin@koupreng.com",
      userRole: "ROLE_ADMIN",
      authenticated: true,
      outcome: "CLIENT_ERROR",
      errorCode: "INVALID_PAYLOAD",
    },
  ];

  const mockStats = {
    totalRequests: 2,
    successCount: 1,
    clientErrorCount: 1,
    serverErrorCount: 0,
    slowRequestsCount: 1,
    avgDurationMs: 332.5,
    p95DurationMs: 620.0,
    userAppCount: 1,
    adminAppCount: 1,
    otherAppCount: 0,
    totalSqlQueries: 7,
    nPlusOneCount: 1,
    topEndpoints: [
      { method: "POST", pattern: "/api/v1/auth/register", count: 1, avgDurationMs: 45.0, errorCount: 0 },
      { method: "PUT", pattern: "/api/v1/admin/templates/{id}", count: 1, avgDurationMs: 620.0, errorCount: 1 },
    ],
  };

  const defaultHookReturn = {
    events: mockEvents,
    stats: mockStats,
    status: "connected",
    errorMessage: null,
    isPaused: false,
    selectedEvent: null,
    setSelectedEvent: vi.fn(),
    togglePause: vi.fn(),
    clearHistory: vi.fn(),
    reconnect: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem("koupreng.admin.lang", "en");
    vi.spyOn(streamHook, "useApiMonitorStream").mockReturnValue({ ...defaultHookReturn });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <AdminLanguageProvider>
        <ApiMonitorFeature />
      </AdminLanguageProvider>
    );

  it("renders monitor dashboard header and metrics correctly", () => {
    renderComponent();

    expect(screen.getByText(/Developer API Live Monitor|ឧបករណ៍តាមដានសំណើ/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Requests|សំណើទាំងអស់/i)).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
    expect(screen.getByText("REGISTER_SUBMIT")).toBeInTheDocument();
    expect(screen.getByText("UPDATE_TEMPLATE")).toBeInTheDocument();
  });

  it("filters request list when searching by path or action", () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/Search path, request ID, action, user...|ស្វែងរកតាមផ្លូវ/i);
    fireEvent.change(searchInput, { target: { value: "register" } });

    expect(screen.getByText("REGISTER_SUBMIT")).toBeInTheDocument();
    expect(screen.queryByText("UPDATE_TEMPLATE")).not.toBeInTheDocument();
  });

  it("filters request list by client app dropdown", () => {
    renderComponent();

    const appSelect = screen.getByRole("combobox", { name: /App filter/i });
    fireEvent.change(appSelect, { target: { value: "frontend-admin" } });

    expect(screen.queryByText("REGISTER_SUBMIT")).not.toBeInTheDocument();
    expect(screen.getByText("UPDATE_TEMPLATE")).toBeInTheDocument();
  });

  it("filters slow requests when checkbox is selected", () => {
    renderComponent();

    const slowCheckbox = screen.getByRole("checkbox", { name: /Slow requests only/i });
    fireEvent.click(slowCheckbox);

    expect(screen.queryByText("REGISTER_SUBMIT")).not.toBeInTheDocument();
    expect(screen.getByText("UPDATE_TEMPLATE")).toBeInTheDocument();
  });

  it("calls togglePause when pause button is clicked", () => {
    const togglePauseSpy = vi.fn();
    vi.spyOn(streamHook, "useApiMonitorStream").mockReturnValue({
      ...defaultHookReturn,
      togglePause: togglePauseSpy,
    });

    renderComponent();

    const pauseBtn = screen.getByRole("button", { name: /Pause|ផ្អាក/i });
    fireEvent.click(pauseBtn);

    expect(togglePauseSpy).toHaveBeenCalled();
  });

  it("renders request details drawer with multi-tab structure when an event is selected", () => {
    vi.spyOn(streamHook, "useApiMonitorStream").mockReturnValue({
      ...defaultHookReturn,
      selectedEvent: mockEvents[1],
    });

    renderComponent();

    expect(screen.getByText("req-xyz-67890")).toBeInTheDocument();
    expect(screen.getAllByText("act-tmpl-2").length).toBeGreaterThan(0);

    // Check Database tab
    const dbTab = screen.getByRole("button", { name: /Database|ទិន្នន័យ SQL/i });
    fireEvent.click(dbTab);
    expect(screen.getByText("Development SQL Statement Diagnostics")).toBeInTheDocument();
    expect(screen.getByText(/Potential N\+1 Query Detected!/i)).toBeInTheDocument();

    // Check Contract tab
    const contractTab = screen.getByRole("button", { name: /Contract|កិច្ចសន្យា API/i });
    fireEvent.click(contractTab);
    expect(screen.getByText("OpenAPI Specification Alignment")).toBeInTheDocument();
  });

  it("switches to Waterfall view when button is toggled", () => {
    renderComponent();

    const waterfallBtn = screen.getByRole("button", { name: /Request Waterfall|គំនូសតាង Waterfall/i });
    fireEvent.click(waterfallBtn);

    expect(screen.getByText(/Interactive Request Waterfall/i)).toBeInTheDocument();
  });

  it("opens Command Palette when trigger button is clicked", () => {
    renderComponent();

    const cmdPaletteBtn = screen.getByRole("button", { name: /Command Palette/i });
    fireEvent.click(cmdPaletteBtn);

    expect(screen.getByPlaceholderText(/Type a command or choose an action/i)).toBeInTheDocument();
  });
});
