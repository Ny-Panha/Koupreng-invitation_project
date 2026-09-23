import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InvitationPreviewPage from "./InvitationPreviewFeature";

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    preview: vi.fn(),
  },
}));

vi.mock("@/features/invitations/api/mediaApi", () => ({
  mediaService: {
    list: vi.fn(),
  },
}));

vi.mock("@/features/templates/api/templateCatalogApi", () => ({
  templateCatalogService: {
    list: vi.fn(),
  },
}));

import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";

describe("InvitationPreviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mediaService.list.mockResolvedValue({ photos: [], cover: null, music: null });
    templateCatalogService.list.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading state initially and then displays the phone preview studio", async () => {
    invitationService.preview.mockResolvedValue({
      id: 12,
      title: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
      groomName: "វណ្ណដា",
      brideName: "ស្រីពេជ្រ",
      status: "PUBLISHED",
      templateId: "khmer-celestial",
      slug: "vanda-sreypich-wedding",
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/invitations/12/preview"]}>
        <Routes>
          <Route path="/dashboard/invitations/:id/preview" element={<InvitationPreviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/កំពុងរៀបចំការមើលជាមុន/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("វណ្ណដា & ស្រីពេជ្រ")).toBeInTheDocument();
    });

    const header = document.querySelector(".inv-preview-header");
    expect(header).toBeInTheDocument();

    // Check back button
    expect(within(header).getByRole("button", { name: /ត្រឡប់/ })).toBeInTheDocument();

    // Check gate toggle button
    expect(within(header).getByRole("button", { name: /គម្រប|ធៀប/ })).toBeInTheDocument();

    // Check edit button
    expect(within(header).getByRole("button", { name: /កែ/ })).toBeInTheDocument();

    // Check guest view link
    expect(within(header).getByRole("link", { name: /ភ្ញៀវ/ })).toHaveAttribute("href", "/i/vanda-sreypich-wedding");

    // Phone viewport is present
    expect(document.querySelector(".inv-phone-viewport")).toBeInTheDocument();

    // Ensure no fake notch/island is blocking the view
    expect(document.querySelector(".inv-phone-island")).not.toBeInTheDocument();
  }, 15000);

  it("toggles gate cover state when clicking the cover toggle button", async () => {
    invitationService.preview.mockResolvedValue({
      id: 12,
      title: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
      groomName: "ពិសិដ្ឋ",
      brideName: "សុខា",
      status: "DRAFT",
      templateId: "khmer-celestial",
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/invitations/12/preview"]}>
        <Routes>
          <Route path="/dashboard/invitations/:id/preview" element={<InvitationPreviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("ពិសិដ្ឋ & សុខា")).toBeInTheDocument();
    });

    const header = document.querySelector(".inv-preview-header");
    const gateBtn = within(header).getByRole("button", { name: /គម្រប/ });
    fireEvent.click(gateBtn);

    await waitFor(() => {
      expect(within(header).getByRole("button", { name: /ធៀប/ })).toBeInTheDocument();
    });
  });

  it("renders error state when API call fails", async () => {
    invitationService.preview.mockRejectedValue(new Error("Invitation not found"));

    render(
      <MemoryRouter initialEntries={["/dashboard/invitations/999/preview"]}>
        <Routes>
          <Route path="/dashboard/invitations/:id/preview" element={<InvitationPreviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Invitation not found")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /ត្រឡប់ទៅបញ្ជីធៀប/ })).toBeInTheDocument();
  });
});
