import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/stores/useLanguageStore";
import WishesPage from "./WishesPage";
import { wishesApi } from "./api/wishesApi";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  useLanguageStore.setState({ lang: "en" });
});

vi.mock("./api/wishesApi", () => ({
  wishesApi: {
    listByInvitation: vi.fn(),
    deleteWish: vi.fn(),
  },
}));

vi.mock("@/features/events/workspace/EventContext", () => ({
  useEventWorkspace: () => ({
    event: { id: "101", title: "Wedding of Sok & Dara", status: "PUBLISHED" },
    isOwner: true,
  }),
}));

vi.mock("@/shared/ui/toast", () => {
  const fn = vi.fn();
  fn.success = vi.fn();
  fn.error = vi.fn();
  return {
    toast: fn,
    default: fn,
  };
});

describe("WishesPage Feature & Deletion Error Safety", () => {
  const mockWishes = [
    { id: "w-1", guestName: "Chann Sokha", message: "Congratulations on your special day!", createdAt: "2026-06-01T10:00:00Z" },
    { id: "w-2", guestName: "Vannak Bopha", message: "Wishing you both a lifetime of happiness!", createdAt: "2026-06-02T12:00:00Z" },
  ];

  it("renders wishes cards, counter badge, and search filter", async () => {
    wishesApi.listByInvitation.mockResolvedValue(mockWishes);

    render(
      <MemoryRouter initialEntries={["/app/events/101/wishes"]}>
        <Routes>
          <Route path="/app/events/:eventId/wishes" element={<WishesPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Wishes from your guests" })).toBeInTheDocument();
      expect(screen.getByText("2 wishes")).toBeInTheDocument();
      expect(screen.getByText("Chann Sokha")).toBeInTheDocument();
      expect(screen.getByText("Vannak Bopha")).toBeInTheDocument();
    });

    // Test search filter
    const searchInput = screen.getByLabelText("Search wishes");
    fireEvent.change(searchInput, { target: { value: "lifetime" } });

    expect(screen.queryByText("Chann Sokha")).not.toBeInTheDocument();
    expect(screen.getByText("Vannak Bopha")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("keeps the confirmation modal open and displays error when deletion fails", async () => {
    wishesApi.listByInvitation.mockResolvedValue(mockWishes);
    wishesApi.deleteWish.mockRejectedValue(new Error("Server error: database timeout"));

    render(
      <MemoryRouter initialEntries={["/app/events/101/wishes"]}>
        <Routes>
          <Route path="/app/events/:eventId/wishes" element={<WishesPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Chann Sokha")).toBeInTheDocument();
    });

    // Click delete on the first wish
    const deleteButtons = screen.getAllByRole("button", { name: "Delete wish" });
    fireEvent.click(deleteButtons[0]);

    // Modal opens
    let dialog;
    await waitFor(() => {
      dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText("Delete this wish?")).toBeInTheDocument();
    });

    // Click confirm delete inside modal
    const confirmButton = within(dialog).getByRole("button", { name: "Delete wish" });
    fireEvent.click(confirmButton);

    // CRITICAL: Modal must stay OPEN on failure, error message is displayed
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(within(screen.getByRole("dialog")).getByRole("alert")).toHaveTextContent("Server error: database timeout");
    });

    // Wish is NOT removed from list
    expect(wishesApi.deleteWish).toHaveBeenCalledWith("101", "w-1");
  });

  it("closes the modal and removes the wish when deletion succeeds", async () => {
    wishesApi.listByInvitation.mockResolvedValue(mockWishes);
    wishesApi.deleteWish.mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={["/app/events/101/wishes"]}>
        <Routes>
          <Route path="/app/events/:eventId/wishes" element={<WishesPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Chann Sokha")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Delete wish" });
    fireEvent.click(deleteButtons[0]);

    let dialog;
    await waitFor(() => {
      dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    const confirmButton = within(dialog).getByRole("button", { name: "Delete wish" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Chann Sokha")).not.toBeInTheDocument();
      expect(screen.getByText("Vannak Bopha")).toBeInTheDocument();
    });
  });

  it("renders luxury empty state when there are no wishes", async () => {
    wishesApi.listByInvitation.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/app/events/101/wishes"]}>
        <Routes>
          <Route path="/app/events/:eventId/wishes" element={<WishesPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Wishes Yet")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Share your invitation" })).toBeInTheDocument();
    });
  });
});
