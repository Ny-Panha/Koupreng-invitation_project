import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPaymentsPage from "./AdminPaymentsFeature";
import AdminLanguageProvider from "../../app/providers/AdminLanguageProvider";

const mockPayments = [
  {
    orderCode: "KPR-TMP-101",
    templateName: "Khmer Celestial",
    itemType: "TEMPLATE",
    amount: 15.00,
    currency: "USD",
    status: "PENDING",
    provider: "ABA PayWay",
    createdAt: "2026-11-01T10:00:00Z",
    paidAt: null,
  },
  {
    orderCode: "SUB-PKG-202",
    packageName: "Diamond Wedding VIP",
    itemType: "SUBSCRIPTION",
    amount: 29.00,
    currency: "USD",
    status: "REVIEW_REQUIRED",
    provider: "ABA PayWay",
    createdAt: "2026-11-02T11:00:00Z",
    paidAt: null,
  },
  {
    orderCode: "KPR-TMP-303",
    templateName: "Emerald Luxe",
    itemType: "TEMPLATE",
    amount: 12.00,
    currency: "USD",
    status: "PAID",
    provider: "ABA PayWay",
    createdAt: "2026-10-28T09:00:00Z",
    paidAt: "2026-10-28T09:05:00Z",
  },
];

const mockAdminService = vi.hoisted(() => ({
  payments: vi.fn(),
  confirmPayment: vi.fn(),
}));

vi.mock("../../shared/api/adminService", () => ({
  default: mockAdminService,
  adminService: mockAdminService,
  adminManagementService: mockAdminService,
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("AdminPaymentsFeature Financial Verification & Safety", () => {
  beforeEach(() => {
    localStorage.setItem("koupreng.admin.lang", "en");
    localStorage.setItem("koupreng.lang", "en");
    mockAdminService.payments.mockResolvedValue(mockPayments);
    mockAdminService.confirmPayment.mockResolvedValue({
      status: "PAID",
      orderCode: "KPR-TMP-101",
    });
  });

  it("renders payment order rows and summary counts accurately", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminPaymentsPage />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("KPR-TMP-101")).toBeInTheDocument();
    });

    expect(screen.getByText("SUB-PKG-202")).toBeInTheDocument();
    expect(screen.getByText("KPR-TMP-303")).toBeInTheDocument();

    // Summary counts: Total 3, Pending 2, Paid 1, Failed 0
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    // Check money formatting
    expect(screen.getByText("USD 15.00")).toBeInTheDocument();
    expect(screen.getByText("USD 29.00")).toBeInTheDocument();
    expect(screen.getByText("USD 12.00")).toBeInTheDocument();
  });

  it("filters orders dynamically via search query", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminPaymentsPage />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("KPR-TMP-101")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search payments/i);
    fireEvent.change(searchInput, { target: { value: "Diamond" } });

    expect(screen.queryByText("KPR-TMP-101")).not.toBeInTheDocument();
    expect(screen.getByText("SUB-PKG-202")).toBeInTheDocument();
  });

  it("opens manual verification modal for pending order with authoritative amount", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminPaymentsPage />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("KPR-TMP-101")).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole("button", { name: /Confirm Payment/i });
    expect(confirmButtons.length).toBe(2);

    // Open modal for first order (KPR-TMP-101)
    fireEvent.click(confirmButtons[0]);

    // Modal is opened
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByRole("heading", { name: /Manual Payment Verification/i })).toBeInTheDocument();
    expect(within(modal).getByText("USD 15.00")).toBeInTheDocument();
    expect(within(modal).getByText("Khmer Celestial")).toBeInTheDocument();

    // Close with Cancel
    fireEvent.click(within(modal).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockAdminService.confirmPayment).not.toHaveBeenCalled();
  });

  it("submits manual verification with authoritative amount and verified transaction reference", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminPaymentsPage />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("KPR-TMP-101")).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole("button", { name: /Confirm Payment/i });
    fireEvent.click(confirmButtons[0]);

    const txInput = screen.getByLabelText(/ABA PayWay Transaction Reference/i);
    fireEvent.change(txInput, { target: { value: "ABA-TXN-987654" } });

    const submitBtn = screen.getByRole("button", { name: /Confirm & Settle Order/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockAdminService.confirmPayment).toHaveBeenCalledWith({
        orderCode: "KPR-TMP-101",
        amount: 15.00,
        confirmedBy: "admin",
        itemType: "TEMPLATE",
        paywayTransactionId: "ABA-TXN-987654",
      });
    });
  });

  it("displays server rejection error inside modal when settlement fails", async () => {
    mockAdminService.confirmPayment.mockRejectedValueOnce(
      new Error("Transaction reference already used for another order")
    );

    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminPaymentsPage />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("KPR-TMP-101")).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole("button", { name: /Confirm Payment/i });
    fireEvent.click(confirmButtons[0]);

    const txInput = screen.getByLabelText(/ABA PayWay Transaction Reference/i);
    fireEvent.change(txInput, { target: { value: "DUPLICATE-TXN" } });

    fireEvent.click(screen.getByRole("button", { name: /Confirm & Settle Order/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Transaction reference already used for another order")).toBeInTheDocument();
    });

    // Modal stays open so admin can fix transaction ID
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
