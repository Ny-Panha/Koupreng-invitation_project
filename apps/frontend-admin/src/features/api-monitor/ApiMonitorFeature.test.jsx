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
      slow: false,
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
      slow: true,
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

  it("renders request details drawer when an event is selected", () => {
    vi.spyOn(streamHook, "useApiMonitorStream").mockReturnValue({
      ...defaultHookReturn,
      selectedEvent: mockEvents[1],
    });

    renderComponent();

    expect(screen.getByText("req-xyz-67890")).toBeInTheDocument();
    expect(screen.getByText("TemplateController.update()")).toBeInTheDocument();
    expect(screen.getAllByText("INVALID_PAYLOAD").length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin@koupreng.com").length).toBeGreaterThan(0);
  });
});

