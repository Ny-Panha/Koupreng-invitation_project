import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestTable from "./GuestTable";

afterEach(cleanup);

const groups = [
  { id: "groom", name: "Groom Side" },
  { id: "bride", name: "Bride Side" },
];
const categories = [
  { id: "friend", name: "Friend" },
  { id: "family", name: "Family" },
];

describe("GuestTable inline guest entry", () => {
  it("keeps the input row visible and returns focus after Enter saves a guest", async () => {
    const onSaveGuest = vi.fn().mockResolvedValue(true);
    render(<GuestTable groups={groups} categories={categories} onSaveGuest={onSaveGuest} />);

    const nameInput = screen.getByRole("textbox", { name: "ឈ្មោះ" });
    expect(nameInput).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "ចំនួនកៅអី" })).toHaveValue(1);
    fireEvent.change(nameInput, { target: { value: "Sok Dara" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ឈ្មោះអ្នកភ្ជាប់" }), { target: { value: "Srey Mom" } });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "លេខទូរស័ព្ទ" }), { key: "Enter" });

    await waitFor(() => expect(onSaveGuest).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Sok Dara", companionName: "Srey Mom", count: "1" }),
      null
    ));
    await waitFor(() => expect(nameInput).toHaveValue(""));
    expect(document.activeElement).toBe(nameInput);
  });

  it("edits an existing guest in place", async () => {
    const onSaveGuest = vi.fn().mockResolvedValue(true);
    render(
      <GuestTable
        groups={groups}
        categories={categories}
        onSaveGuest={onSaveGuest}
        guests={[{ id: 14, name: "Old Name", count: 1, group: "Groom Side", category: "Friend" }]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "កែប្រែ" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ឈ្មោះ 14" }), { target: { value: "New Name" } });
    fireEvent.click(screen.getByRole("button", { name: "រក្សាទុក" }));

    await waitFor(() => expect(onSaveGuest).toHaveBeenCalledWith(
      expect.objectContaining({ name: "New Name" }),
      14
    ));
  });
});