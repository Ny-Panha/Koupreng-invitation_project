import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestTable from "./GuestTable";
import { useLanguageStore } from "@/stores/useLanguageStore";

afterEach(cleanup);

const groups = [
  { id: "groom", name: "Groom Side" },
  { id: "bride", name: "Bride Side" },
];
const categories = [
  { id: "friend", name: "Friend" },
  { id: "family", name: "Family" },
];

describe("GuestTable", () => {
  it("localizes RSVP and ticket actions without changing the guest passed to the ticket flow", () => {
    useLanguageStore.setState({ lang: "km" });
    const guest = { id: 501, name: "Sokha", source: "backend", rsvpStatus: "ATTENDING", count: 2 };
    const onShowTicket = vi.fn();
    render(<GuestTable guests={[guest]} onShowTicket={onShowTicket} />);
    expect(screen.getByText("RSVP: ចូលរួម")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "កាតអញ្ជើញ" }));
    expect(onShowTicket).toHaveBeenCalledWith(guest);
  });
  it("renders empty state with call to action when no guests are present", () => {
    const onOpenAddGuest = vi.fn();
    render(
      <GuestTable
        groups={groups}
        categories={categories}
        guests={[]}
        emptyMessage="មិនទាន់មានឈ្មោះភ្ញៀវទេ។"
        onOpenAddGuest={onOpenAddGuest}
      />
    );

    expect(screen.getByText("មិនទាន់មានឈ្មោះភ្ញៀវទេ។")).toBeInTheDocument();
    const addBtn = screen.getByRole("button", { name: "បន្ថែមភ្ញៀវដំបូង" });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(onOpenAddGuest).toHaveBeenCalledTimes(1);
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
