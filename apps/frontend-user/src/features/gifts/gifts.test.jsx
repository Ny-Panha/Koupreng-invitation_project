import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import GiftsFeature from "./GiftsFeature";
import { planningService } from "@/features/planning/api/planningApi";

afterEach(() => {
  cleanup();
});

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    listMine: vi.fn().mockResolvedValue([
      { id: 1, title: "Dara & Sophea Wedding", status: "PUBLISHED" },
    ]),
  },
  default: {
    listMine: vi.fn().mockResolvedValue([
      { id: 1, title: "Dara & Sophea Wedding", status: "PUBLISHED" },
    ]),
  },
}));

vi.mock("@/features/planning/api/planningApi", () => ({
  planningService: {
    listGifts: vi.fn().mockResolvedValue([
      { id: 101, name: "Uncle Sok", amount: 100, method: "Bakong QR", date: "2026-03-15", note: "Best wishes" },
      { id: 102, name: "Aunt Chann", amount: 50, method: "ABA", date: "2026-03-16", note: "Happy wedding" },
    ]),
    createGift: vi.fn().mockResolvedValue({ id: 103, name: "Keo Sophea", amount: 70, method: "ABA" }),
    updateGift: vi.fn().mockResolvedValue({ id: 101, name: "Uncle Sok", amount: 150 }),
    removeGift: vi.fn().mockResolvedValue({}),
  },
  default: {
    listGifts: vi.fn().mockResolvedValue([
      { id: 101, name: "Uncle Sok", amount: 100, method: "Bakong QR", date: "2026-03-15", note: "Best wishes" },
      { id: 102, name: "Aunt Chann", amount: 50, method: "ABA", date: "2026-03-16", note: "Happy wedding" },
    ]),
    createGift: vi.fn().mockResolvedValue({ id: 103, name: "Keo Sophea", amount: 70, method: "ABA" }),
    updateGift: vi.fn().mockResolvedValue({ id: 101, name: "Uncle Sok", amount: 150 }),
    removeGift: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/features/guests/api/guestApi", () => ({
  guestService: {
    listByInvitation: vi.fn().mockResolvedValue([
      { id: 201, guestName: "Uncle Sok" },
      { id: 202, guestName: "Aunt Chann" },
    ]),
  },
  default: {
    listByInvitation: vi.fn().mockResolvedValue([
      { id: 201, guestName: "Uncle Sok" },
      { id: 202, guestName: "Aunt Chann" },
    ]),
  },
}));

describe("GiftsFeature Module", () => {
  it("renders wedding gifts header, summary totals, and gift records", async () => {
    render(
      <BrowserRouter>
        <GiftsFeature />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(planningService.listGifts).toHaveBeenCalledWith(1);
      expect(screen.getByText("Uncle Sok")).toBeInTheDocument();
      expect(screen.getByText("Aunt Chann")).toBeInTheDocument();
      expect(screen.getByText("$150")).toBeInTheDocument();
      expect(screen.getByText("Bakong QR", { selector: ".wg-method-badge" })).toBeInTheDocument();
    });
  });

  it("opens gift record modal on add button click", async () => {
    const { container } = render(
      <BrowserRouter>
        <GiftsFeature />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Uncle Sok")).toBeInTheDocument();
    });

    const addBtn = container.querySelector(".wg-add-btn");
    expect(addBtn).not.toBeNull();
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(document.activeElement).toBe(container.querySelector("[data-gift-name-input]"));
    });
  });
});
