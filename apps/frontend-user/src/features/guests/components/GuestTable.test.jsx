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
  it("marks the guest as sent when Telegram sharing is clicked", () => {
    useLanguageStore.setState({ lang: 'en' });
    const onMarkAsSent = vi.fn();
    render(<GuestTable guests={[{id:501,name:'Sample guest',source:'backend',inviteToken:'fixture-link-only',sendStatus:'PENDING'}]} currentDraft={{slug:'sample-event'}} onMarkAsSent={onMarkAsSent} />);
    fireEvent.click(screen.getByLabelText('More actions: Sample guest'));
    const share=screen.getByRole('link',{name:'Share invitation for Sample guest via Telegram'});
    expect(share).toHaveAttribute('target','_blank');
    fireEvent.click(share);
    expect(onMarkAsSent).toHaveBeenCalledTimes(1);
    expect(onMarkAsSent).toHaveBeenCalledWith(expect.objectContaining({ id: 501 }));
    useLanguageStore.setState({lang:'km'});
  });

  it.each([true, false])("updates send status only when copying a message succeeds (%s)", async copied => {
    useLanguageStore.setState({ lang: "en" });
    const guest = { id: 501, name: "Sample guest", inviteToken: "fixture-link-only", sendStatus: "PENDING" };
    const onCopyLink = vi.fn().mockResolvedValue(copied);
    const onMarkAsSent = vi.fn();
    render(<GuestTable guests={[guest]} currentDraft={{ slug: "sample-event" }} onCopyLink={onCopyLink} onMarkAsSent={onMarkAsSent} />);
    fireEvent.click(screen.getByLabelText("More actions: Sample guest"));
    fireEvent.click(screen.getByRole("button", { name: "Copy invitation message" }));
    await waitFor(() => expect(onCopyLink).toHaveBeenCalledWith(expect.stringContaining("fixture-link-only"), guest));
    expect(onMarkAsSent).toHaveBeenCalledTimes(copied ? 1 : 0);
    useLanguageStore.setState({ lang: "km" });
  });
  it("localizes RSVP and ticket actions without changing the guest passed to the ticket flow", () => {
    useLanguageStore.setState({ lang: "km" });
    const guest = { id: 501, name: "Sokha", source: "backend", rsvpStatus: "ATTENDING", count: 2 };
    const onShowTicket = vi.fn();
    render(<GuestTable guests={[guest]} onShowTicket={onShowTicket} />);
    expect(screen.getByText("RSVP: ចូលរួម")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("សកម្មភាពផ្សេងទៀត: Sokha"));
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
    const addBtn = screen.getByRole("button", { name: "បន្ថែមភ្ញៀវ" });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(onOpenAddGuest).toHaveBeenCalledTimes(1);
  });

  it("uses the host add-dialog action without showing the competing inline editor", () => {
    const onOpenAddGuest = vi.fn();
    render(<GuestTable guests={[]} groups={groups} categories={categories} onOpenAddGuest={onOpenAddGuest} />);
    expect(screen.queryByRole("textbox", { name: "ឈ្មោះ" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /បន្ថែមភ្ញៀវ/ }));
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
