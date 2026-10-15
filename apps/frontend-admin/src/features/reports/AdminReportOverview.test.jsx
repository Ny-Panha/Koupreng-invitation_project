import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
const service = vi.hoisted(() => ({
  reportDefinitions: vi.fn(),
  managementReport: vi.fn(),
  invitationsReport: vi.fn(),
  exportManagementReport: vi.fn(),
}));
vi.mock("../../shared/api/adminService", () => ({ default: service }));
import AdminReportsPage from "../../pages/reports/AdminReportsPage";
import {
  AdminLanguageProvider,
  useAdminLanguage,
} from "../../app/providers/AdminLanguageProvider";
const codes = [
  "executive",
  "payments",
  "reconciliation",
  "invitations",
  "users",
  "templates",
  "subscriptions",
  "engagement",
  "system",
  "dictionary",
];
const definitions = codes.map((code) => ({
  code,
  titleEn: code,
  titleKm: `ខ្មែរ ${code}`,
  defaultDateDimension: code === "executive" ? "metric" : "createdAt",
  dateDimensions: code === "executive" ? ["metric"] : ["createdAt", "paidAt"],
  filters:
    code === "executive" || code === "dictionary"
      ? []
      : code === "payments"
        ? ["paymentType", "currency", "search"]
        : ["eventType", "search"],
  columns: [
    { key: "id", labelEn: "Record ID", labelKm: "លេខកំណត់ត្រា", type: "TEXT" },
    { key: "title", labelEn: "Record title", labelKm: "ចំណងជើង", type: "TEXT" },
  ],
  notes: ["Server definition"],
}));
function response(code, request = {}) {
  return {
    definition: definitions.find((item) => item.code === code),
    metadata: {
      snapshotId: `${code}-${request.page || 0}`,
      dateDimension: request.dateDimension,
      sort: request.sort || "id",
      direction: request.direction || "DESC",
      generatedAt: "2026-10-15T10:00:00Z",
      timezone: "Asia/Phnom_Penh",
      filters: {},
    },
    report: code,
    rows: [{ id: `${code}-${request.page || 0}`, title: "Server row" }],
    summary: {},
    filteredSummary: {
      totalInvitations: 42,
      confirmedReceiptsByCurrency: {
        USD: request.currency === "KHR" ? 0 : 47,
        KHR: request.currency === "USD" ? 0 : 40000,
      },
      pendingValueByCurrency: { USD: 999, KHR: 0 },
      failedValueByCurrency: { USD: 0, KHR: 0 },
    },
    series: [],
    notices: ["Server definition"],
    totalElements: 42,
    totalPages: 3,
    page: request.page || 0,
    size: request.size || 20,
  };
}
function Controls() {
  const location = useLocation(),
    { setLang } = useAdminLanguage();
  return (
    <>
      <output data-testid="location">{location.search}</output>
      <button onClick={() => setLang("km")}>Use Khmer</button>
    </>
  );
}
function mount(
  route = "/reports?report=invitations&from=2026-10-15&to=2026-10-16",
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AdminLanguageProvider>
        <Controls />
        <AdminReportsPage />
      </AdminLanguageProvider>
    </MemoryRouter>,
  );
}
async function loaded() {
  await screen.findByText("Server row");
}
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("koupreng.admin.lang", "en");
  service.reportDefinitions.mockResolvedValue({ definitions });
  service.managementReport.mockImplementation(async (code, query) =>
    response(code, query),
  );
  service.invitationsReport.mockImplementation(async (query) =>
    response("invitations", query),
  );
  service.exportManagementReport.mockResolvedValue(
    new Blob(["actual fixture bytes"], { type: "application/octet-stream" }),
  );
  URL.createObjectURL = vi.fn(() => "blob:report-test");
  URL.revokeObjectURL = vi.fn();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("active Reports route", () => {
  it("loads the existing paginated invitation API with the shared ledger contract", async () => {
    mount();
    await loaded();
    expect(service.invitationsReport).toHaveBeenCalledWith(
      expect.objectContaining({
        view: "ledger",
        from: "2026-10-15",
        to: "2026-10-16",
        page: 0,
        size: 20,
      }),
      expect.any(AbortSignal),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "report=invitations",
    );
    expect(screen.getByText("42", { selector: "strong" })).toBeInTheDocument();
  });
  it("mounts every family through the shared components", async () => {
    mount();
    await loaded();
    for (const code of codes) {
      fireEvent.click(
        within(
          screen.getByRole("navigation", { name: "Reports & Analytics" }),
        ).getByRole("button", { name: code, exact: true }),
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: code, exact: true }),
        ).toHaveAttribute("aria-current", "page"),
      );
      await screen.findByText("Server row");
    }
    expect(service.managementReport.mock.calls.map((call) => call[0])).toEqual(
      expect.arrayContaining(codes.filter((code) => code !== "invitations")),
    );
  });
  it("sends filter, sort and page changes to the server without local slicing", async () => {
    mount();
    await loaded();
    fireEvent.change(screen.getByLabelText("Event type"), {
      target: { value: "WEDDING" },
    });
    await waitFor(() =>
      expect(service.invitationsReport).toHaveBeenLastCalledWith(
        expect.objectContaining({ eventType: "WEDDING", page: 0 }),
        expect.anything(),
      ),
    );
    await loaded();
    fireEvent.click(screen.getByRole("button", { name: /Record title/ }));
    await waitFor(() =>
      expect(service.invitationsReport).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: "title", direction: "ASC" }),
        expect.anything(),
      ),
    );
    await loaded();
    fireEvent.click(screen.getByRole("button", { name: "Next", exact: true }));
    await waitFor(() =>
      expect(service.invitationsReport).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1 }),
        expect.anything(),
      ),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "eventType=WEDDING",
    );
  });
  it("preserves URL scope on refresh and uses server totals rather than page sums", async () => {
    mount(
      "/reports?report=payments&from=2026-10-15&to=2026-10-16&currency=KHR",
    );
    await loaded();
    expect(screen.getAllByText("0 USD").length).toBeGreaterThan(0);
    expect(screen.getByText("40,000 KHR")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Refresh", exact: true }),
    );
    await waitFor(() =>
      expect(service.managementReport).toHaveBeenCalledTimes(2),
    );
    expect(service.managementReport).toHaveBeenLastCalledWith(
      "payments",
      expect.objectContaining({ currency: "KHR", from: "2026-10-15" }),
      expect.anything(),
    );
  });
  it("keeps failed refresh data visibly stale and disables exports", async () => {
    mount();
    await loaded();
    service.invitationsReport.mockRejectedValueOnce(
      new Error("Network unavailable"),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Refresh", exact: true }),
    );
    await screen.findByText("Network unavailable");
    expect(
      screen.getByText(/Showing the last successful snapshot/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download Excel" }),
    ).toBeDisabled();
    expect(screen.getByText("Server row")).toBeInTheDocument();
  });
  it("discards late responses when scope changes", async () => {
    let resolve;
    service.invitationsReport.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    mount();
    await waitFor(() => expect(service.invitationsReport).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "users", exact: true }));
    await loaded();
    resolve({
      ...response("invitations"),
      rows: [{ id: "late", title: "Stale wrong scope" }],
    });
    await waitFor(() =>
      expect(screen.queryByText("Stale wrong scope")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("location")).toHaveTextContent("report=users");
  });
  it("distinguishes empty and unavailable values", async () => {
    service.invitationsReport.mockResolvedValueOnce({
      ...response("invitations"),
      rows: [],
      totalElements: 0,
      totalPages: 0,
    });
    mount();
    await screen.findByText("No records match these filters");
    expect(
      screen.getByRole("button", { name: "Next", exact: true }),
    ).toBeDisabled();
  });
  it("downloads all-filtered XLSX and CSV and keeps current-page CSV explicit", async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    mount();
    await loaded();
    fireEvent.click(screen.getByRole("button", { name: "Download Excel" }));
    await waitFor(() =>
      expect(service.exportManagementReport).toHaveBeenCalledWith(
        "invitations",
        "xlsx",
        expect.objectContaining({ from: "2026-10-15", to: "2026-10-16" }),
      ),
    );
    await waitFor(() => expect(click).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "CSV · All filtered records" }),
      ).toBeEnabled(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "CSV · All filtered records" }),
    );
    await waitFor(() =>
      expect(service.exportManagementReport).toHaveBeenLastCalledWith(
        "invitations",
        "csv",
        expect.anything(),
      ),
    );
  });
  it("uses one captured HTML preview and exits without losing scope", async () => {
    // Blob iframe navigation is a real-browser check; about:blank keeps this DOM-only test local.
    URL.createObjectURL.mockReturnValue("about:blank");
    service.exportManagementReport.mockResolvedValueOnce(
      new Blob(
        ["<!doctype html><html><head></head><body>Snapshot</body></html>"],
        { type: "text/html" },
      ),
    );
    mount();
    await loaded();
    fireEvent.click(
      screen.getByRole("button", { name: "Print preview", exact: true }),
    );
    await screen.findByRole("dialog");
    await waitFor(() =>
      expect(screen.getByTitle("Print preview")).toHaveAttribute(
        "src",
        "about:blank",
      ),
    );
    expect(
      screen.getByRole("button", { name: "Print / Save as PDF" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Page orientation"), {
      target: { value: "landscape" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Close", exact: true }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("location")).toHaveTextContent("from=2026-10-15");
    expect(service.exportManagementReport).toHaveBeenCalledTimes(1);
  });
  it("supports Khmer labels, column visibility and read-only row details", async () => {
    mount();
    await loaded();
    fireEvent.click(screen.getByText("Columns", { selector: "summary" }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Record title", exact: true }),
    );
    expect(
      screen.queryByRole("button", { name: /Record title/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Use Khmer" }));
    expect(
      screen.getByRole("heading", { name: "របាយការណ៍ និងវិភាគ" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /ព័ត៌មានលម្អិត #1/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAccessibleName("ព័ត៌មានលម្អិត");
    expect(
      screen.queryByRole("button", { name: /Delete|Approve payment|Edit/ }),
    ).not.toBeInTheDocument();
  });
  it("shows administrator permission errors and rejects misleading partial URL periods", async () => {
    service.invitationsReport.mockRejectedValueOnce(
      Object.assign(new Error("Forbidden"), { status: 403 }),
    );
    mount("/reports?report=invitations&from=2026-10-15");
    await screen.findByText("Administrator report access is required");
    expect(service.invitationsReport).toHaveBeenLastCalledWith(
      expect.objectContaining({ from: "2026-10-15", to: null }),
      expect.anything(),
    );
    expect(
      screen.getByRole("button", { name: "Download Excel" }),
    ).toBeDisabled();
  });
});
