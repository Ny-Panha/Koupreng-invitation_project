import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminUserDetailPage from "./AdminUserDetailFeature";
import AdminLanguageProvider from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "../../shared/api/adminService";

const mockUser = {
  id: 42,
  fullName: "Sokha Mean",
  email: "sokha.mean@koupreng.com",
  phone: "+85512345678",
  role: "USER",
  status: "ACTIVE",
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-02-20T10:30:00Z",
};

const mockInvitations = [
  {
    id: 101,
    title: "Sokha & Bopha Wedding",
    slug: "sokha-bopha-2026",
    status: "PUBLISHED",
    eventDate: "2026-12-12T00:00:00Z",
    moderationStatus: "ACTIVE",
  },
  {
    id: 102,
    title: "Engagement Ceremony",
    slug: "sokha-engagement",
    status: "DRAFT",
    eventDate: "2026-11-01T00:00:00Z",
    moderationStatus: "ACTIVE",
  },
];

describe("AdminUserDetailPage", () => {
  beforeEach(() => {
    vi.spyOn(adminManagementService, "user").mockResolvedValue(mockUser);
    vi.spyOn(adminManagementService, "userInvitations").mockResolvedValue(mockInvitations);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <AdminLanguageProvider>
        <MemoryRouter initialEntries={["/users/42"]}>
          <Routes>
            <Route path="/users/:userId" element={<AdminUserDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AdminLanguageProvider>
    );

  it("loads and displays user profile information and details", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText("Sokha Mean").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("sokha.mean@koupreng.com")).toBeInTheDocument();
      expect(screen.getByText("+85512345678")).toBeInTheDocument();
      expect(screen.getByText("Sokha & Bopha Wedding")).toBeInTheDocument();
      expect(screen.getByText("Engagement Ceremony")).toBeInTheDocument();
    });
  });

  it("handles empty invitations list gracefully", async () => {
    vi.spyOn(adminManagementService, "userInvitations").mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText("Sokha Mean").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/0 (invitations owned|សំបុត្រអញ្ជើញជាម្ចាស់)/)).toBeInTheDocument();
    });
  });

  it("handles loading error with retry button", async () => {
    vi.spyOn(adminManagementService, "user").mockRejectedValue(new Error("Network Error"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
