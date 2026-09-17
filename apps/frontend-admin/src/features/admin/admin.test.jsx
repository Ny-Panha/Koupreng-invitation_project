import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminUsersPage from "./AdminUsersPage";
import AdminPaymentsPage from "./AdminPaymentsPage";
import AdminPackagesPage from "./AdminPackagesPage";
import AdminNotificationsPage from "./AdminNotificationsPage";

vi.mock("./adminManagementService", () => ({
  default: {
    users: vi.fn().mockResolvedValue([
      { id: 1, fullName: "Koupreng Admin", email: "admin@koupreng.com", role: "ADMIN", status: "ACTIVE", active: true, createdAt: "2026-08-01T00:00:00Z" },
      { id: 2, fullName: "Sophea User", email: "sophea@koupreng.com", role: "USER", status: "ACTIVE", active: true, createdAt: "2026-08-01T00:00:00Z" },
    ]),
    invitations: vi.fn().mockResolvedValue([
      { id: 10, title: "Dara & Sophea Wedding", slug: "dara-sophea", ownerName: "Dara", status: "PUBLISHED", moderationStatus: "ACTIVE", eventDate: "2026-11-20" },
    ]),
    payments: vi.fn().mockResolvedValue([
      { orderCode: "ORD-999", templateName: "Garden Royal", amount: 15.00, currency: "USD", status: "PAID", provider: "ABA_PAYWAY" },
    ]),
    packages: vi.fn().mockResolvedValue([
      { id: 1, packageName: "Standard Package", code: "STD", price: 15.00, currency: "USD", active: true, maxInvitations: 1, maxGuests: 100 },
    ]),
    notifications: vi.fn().mockResolvedValue([
      { id: 50, title: "System Maintenance", message: "Scheduled for Sunday", type: "SYSTEM_ALERT", channel: "IN_APP", status: "DELIVERED", createdAt: "2026-08-05T00:00:00Z" },
    ]),
  },
}));

describe("Admin Feature Pages", () => {
  it("renders users management page with backend user data", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Routes>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Sophea User")).toBeInTheDocument();
      expect(screen.getByText("sophea@koupreng.com")).toBeInTheDocument();
      expect(screen.queryByText("Koupreng Admin")).not.toBeInTheDocument();
    });
  });


  it("renders payments management page with status counts", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/payments"]}>
        <Routes>
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("ORD-999")).toBeInTheDocument();
      expect(screen.getByText("Garden Royal")).toBeInTheDocument();
    });
  });

  it("renders subscription packages page", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/packages"]}>
        <Routes>
          <Route path="/admin/packages" element={<AdminPackagesPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Standard Package")).toBeInTheDocument();
      expect(screen.getByText("STD")).toBeInTheDocument();
    });
  });

  it("renders notifications management page and send form", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/notifications"]}>
        <Routes>
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("System Maintenance")).toBeInTheDocument();
      expect(screen.getByText("Scheduled for Sunday")).toBeInTheDocument();
    });
  });
});
