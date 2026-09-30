import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsersFeature from "./AdminUsersFeature";
import AdminLanguageProvider from "../../app/providers/AdminLanguageProvider";

const mockUsers = [
  {
    id: 1,
    fullName: "Koupreng Admin",
    email: "admin@koupreng.com",
    role: "ADMIN",
    status: "ACTIVE",
    active: true,
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: 2,
    fullName: "Sophea User",
    email: "sophea@koupreng.com",
    role: "USER",
    status: "ACTIVE",
    active: true,
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: 3,
    fullName: "Vannak Seller",
    email: "vannak@koupreng.com",
    role: "USER",
    status: "ACTIVE",
    active: true,
    createdAt: "2026-08-03T00:00:00Z",
  },
];

const mockAdminService = vi.hoisted(() => ({
  users: vi.fn(),
  createUser: vi.fn(),
  activateUser: vi.fn(),
  deactivateUser: vi.fn(),
  updateUserRole: vi.fn(),
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

describe("AdminUsersFeature i18n & safety", () => {
  beforeEach(() => {
    mockAdminService.users.mockResolvedValue(mockUsers);
    mockAdminService.deactivateUser.mockImplementation(async (id) => ({
      id,
      fullName: "Vannak Seller",
      email: "vannak@koupreng.com",
      role: "USER",
      status: "INACTIVE",
      active: false,
    }));
  });

  it("renders all elements and filter tabs in English when EN is active", async () => {
    localStorage.setItem("koupreng.admin.lang", "en");

    render(
      <AdminLanguageProvider>
        <MemoryRouter initialEntries={["/users"]}>
          <Routes>
            <Route path="/users" element={<AdminUsersFeature />} />
          </Routes>
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Koupreng Admin")).toBeInTheDocument();
    });

    // Check filter pills
    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Admins" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Users" })).toBeInTheDocument();

    // Check create admin form
    expect(screen.getByText("Create New Admin Account")).toBeInTheDocument();
    expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText("e.g. Sok Dara")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("admin@koupreng.local")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    const passInput = screen.getByPlaceholderText("Minimum 8 characters");
    expect(passInput).toBeInTheDocument();
    expect(passInput).toHaveAttribute("minLength", "8");
    expect(screen.getAllByText("Role").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Create Admin" })).toBeInTheDocument();

    // Check table headers and role badges
    expect(screen.getByText("Account (Email / Phone)")).toBeInTheDocument();
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Regular User").length).toBeGreaterThanOrEqual(1);
  });

  it("renders all elements and filter tabs in Khmer when KM is active", async () => {
    localStorage.setItem("koupreng.admin.lang", "km");

    render(
      <AdminLanguageProvider>
        <MemoryRouter initialEntries={["/users"]}>
          <Routes>
            <Route path="/users" element={<AdminUsersFeature />} />
          </Routes>
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Koupreng Admin")).toBeInTheDocument();
    });

    // Check filter pills in Khmer
    expect(screen.getByRole("tab", { name: "ទាំងអស់" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "អ្នកគ្រប់គ្រង" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "អ្នកប្រើប្រាស់" })).toBeInTheDocument();

    // Check create admin form in Khmer
    expect(screen.getByText("បង្កើតគណនីអេដមីនថ្មី")).toBeInTheDocument();
    expect(screen.getAllByText("ឈ្មោះ").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText("ឧ. Sok Dara")).toBeInTheDocument();
    expect(screen.getByText("អ៊ីមែល")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("admin@koupreng.local")).toBeInTheDocument();
    expect(screen.getByText("ពាក្យសម្ងាត់")).toBeInTheDocument();
    const passInput = screen.getByPlaceholderText("យ៉ាងតិច 8 តួអក្សរ");
    expect(passInput).toBeInTheDocument();
    expect(passInput).toHaveAttribute("minLength", "8");
    expect(screen.getAllByText("តួនាទី").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "បង្កើតអេដមីន" })).toBeInTheDocument();

    // Check role badges in Khmer
    expect(screen.getAllByText("អ្នកគ្រប់គ្រង").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("អ្នកប្រើប្រាស់ទូទៅ").length).toBeGreaterThanOrEqual(1);
  });

  it("protects current logged in admin from self deactivation with a You badge", async () => {
    localStorage.setItem("koupreng.admin.lang", "en");
    const validFutureExpToken = `header.${btoa(JSON.stringify({ exp: 4102444800 }))}.signature`;
    localStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: validFutureExpToken,
      user: { id: 1, email: "admin@koupreng.com", role: "ADMIN" },
    }));

    render(
      <AdminLanguageProvider>
        <MemoryRouter initialEntries={["/users"]}>
          <Routes>
            <Route path="/users" element={<AdminUsersFeature />} />
          </Routes>
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Koupreng Admin")).toBeInTheDocument();
    });

    // Current user has You badge
    expect(screen.getAllByText("You").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("You (Protected)")).toBeInTheDocument();
  });

  it("opens confirmation modal when deactivating user and allows canceling or confirming", async () => {
    localStorage.setItem("koupreng.admin.lang", "en");

    render(
      <AdminLanguageProvider>
        <MemoryRouter initialEntries={["/users"]}>
          <Routes>
            <Route path="/users" element={<AdminUsersFeature />} />
          </Routes>
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Vannak Seller")).toBeInTheDocument();
    });

    const deactivateBtns = screen.getAllByRole("button", { name: "Deactivate" });
    expect(deactivateBtns.length).toBeGreaterThanOrEqual(1);

    // Click deactivate on the first deactivatable user (id 1)
    fireEvent.click(deactivateBtns[0]);

    // Confirmation modal appears
    expect(screen.getByRole("heading", { name: "Deactivate User" })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to deactivate/)).toBeInTheDocument();

    // Click Cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("heading", { name: "Deactivate User" })).not.toBeInTheDocument();
    expect(mockAdminService.deactivateUser).not.toHaveBeenCalled();

    // Click deactivate again and confirm
    const deactivateBtnsAgain = screen.getAllByRole("button", { name: "Deactivate" });
    fireEvent.click(deactivateBtnsAgain[0]);
    const modalDeactivateBtn = screen.getAllByRole("button", { name: "Deactivate" }).slice(-1)[0];
    fireEvent.click(modalDeactivateBtn);

    await waitFor(() => {
      expect(mockAdminService.deactivateUser).toHaveBeenCalledWith(1);
    });
  });

  it("calculates password strength dynamically", async () => {
    localStorage.setItem("koupreng.admin.lang", "en");

    render(
      <AdminLanguageProvider>
        <MemoryRouter initialEntries={["/users"]}>
          <Routes>
            <Route path="/users" element={<AdminUsersFeature />} />
          </Routes>
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    const passInput = screen.getByPlaceholderText("Minimum 8 characters");
    expect(screen.queryByText(/Password Strength:/)).not.toBeInTheDocument();

    // Weak
    fireEvent.change(passInput, { target: { value: "abc" } });
    expect(screen.getByText("Weak")).toBeInTheDocument();

    // Strong
    fireEvent.change(passInput, { target: { value: "StrongPass#123" } });
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });
});
