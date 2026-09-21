import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminUsersPage from "./AdminUsersPage";
import AdminPaymentsPage from "./AdminPaymentsPage";
import AdminPackagesPage from "./AdminPackagesPage";
import AdminNotificationsPage from "./AdminNotificationsPage";
import adminManagementService from "./adminManagementService";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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
      expect(screen.getByText("Koupreng Admin")).toBeInTheDocument();
      expect(screen.getByText("Sophea User")).toBeInTheDocument();
      expect(screen.getByText("sophea@koupreng.com")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Regular User")).toBeInTheDocument();
    });
  });

  it("filters users by role and requires an email address for new admins", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Routes>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Koupreng Admin")).toBeInTheDocument());

    const emailInput = screen.getByPlaceholderText("admin@koupreng.local");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    expect(emailInput).not.toBeValid();

    fireEvent.click(screen.getByRole("tab", { name: "អ្នកប្រើប្រាស់" }));
    expect(screen.queryByText("Koupreng Admin")).not.toBeInTheDocument();
    expect(screen.getByText("Sophea User")).toBeInTheDocument();
  });

  it("offers only admin roles in the create-admin role dropdown", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Routes>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Koupreng Admin")).toBeInTheDocument());

    const roleSelect = screen.getByRole("combobox");
    expect([...roleSelect.options].map((option) => option.value)).toEqual(["ADMIN"]);
    expect(screen.queryByRole("option", { name: "USER" })).not.toBeInTheDocument();
  });

  it("refetches the admin list immediately after creating a new admin account", async () => {
    adminManagementService.users.mockResolvedValueOnce([
      { id: 1, fullName: "Sophea User", email: "sophea@koupreng.com", role: "USER", status: "ACTIVE", active: true, createdAt: "2026-08-01T00:00:00Z" },
    ]);
    adminManagementService.users.mockResolvedValueOnce([
      { id: 1, fullName: "Sophea User", email: "sophea@koupreng.com", role: "USER", status: "ACTIVE", active: true, createdAt: "2026-08-01T00:00:00Z" },
      { id: 7, fullName: "New Admin", email: "new.admin@koupreng.local", role: "ADMIN", status: "ACTIVE", active: true, createdAt: "2026-08-02T00:00:00Z" },
    ]);
    adminManagementService.createUser = vi.fn().mockResolvedValue({
      id: 7,
      fullName: "New Admin",
      email: "new.admin@koupreng.local",
      role: "ADMIN",
      status: "ACTIVE",
      active: true,
      createdAt: "2026-08-02T00:00:00Z",
    });

    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Routes>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. Sok Dara"), { target: { value: "New Admin" } });
    fireEvent.change(screen.getByPlaceholderText("admin@koupreng.local"), { target: { value: "new.admin@koupreng.local" } });
    fireEvent.change(screen.getByPlaceholderText("Minimum 8 characters"), { target: { value: "StrongPass123" } });
    fireEvent.click(screen.getByRole("button", { name: /create admin/i }));

    await waitFor(() => {
      expect(adminManagementService.createUser).toHaveBeenCalled();
    });
    expect(adminManagementService.createUser).toHaveBeenCalledWith(expect.objectContaining({ role: "ADMIN" }));

    await waitFor(() => {
      expect(screen.getByText("New Admin")).toBeInTheDocument();
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
