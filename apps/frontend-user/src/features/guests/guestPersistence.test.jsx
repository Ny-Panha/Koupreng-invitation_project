import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listManualGuests, saveManualGuests, setActiveEventId } from "@/shared/storage/hostPlanningStorage";
import { saveDraft } from "@/shared/storage/weddingStorage";
import { useGuests } from "./hooks/useGuests";
import { useGuestMutations } from "./hooks/useGuestMutations";
import { EMPTY_GUEST_FORM, SEND_STATUS } from "./model/guestConstants";

const invitationService = vi.hoisted(() => ({ listMine: vi.fn() }));
const guestService = vi.hoisted(() => ({
  listByInvitation: vi.fn(),
  createForInvitation: vi.fn(),
  updateForInvitation: vi.fn(),
  importForInvitation: vi.fn(),
}));
const rsvpService = vi.hoisted(() => ({ listByInvitation: vi.fn() }));

vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService }));
vi.mock("@/features/guests/api/guestApi", () => ({ guestService }));
vi.mock("@/features/rsvp/api/rsvpApi", () => ({ rsvpService }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 77 } }) }));

function Wrapper({ children }) {
  return <MemoryRouter initialEntries={["/dashboard/guests"]}>{children}</MemoryRouter>;
}

function useGuestPage() {
  const state = useGuests();
  const mutations = useGuestMutations(state);
  return { ...state, mutations };
}

async function openGuestPage() {
  const hook = renderHook(useGuestPage, { wrapper: Wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("guest persistence after refresh", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    saveDraft({ id: "wed-1", ownerUserId: 77, slug: "our-day" });
    setActiveEventId("wed-1");
    invitationService.listMine.mockResolvedValue([]);
    guestService.listByInvitation.mockResolvedValue([]);
    rsvpService.listByInvitation.mockResolvedValue([]);
  });

  it("reloads a newly created browser-only guest from the event's storage", async () => {
    const page = await openGuestPage();
    let success;
    await act(async () => {
      success = await page.result.current.mutations.saveGuest({ ...EMPTY_GUEST_FORM, name: "Sok Dara" });
    });

    expect(success).toBe(true);
    expect(page.result.current.guests).toEqual([expect.objectContaining({ name: "Sok Dara" })]);
    page.unmount();

    const refreshed = await openGuestPage();
    expect(refreshed.result.current.guests).toEqual([expect.objectContaining({ name: "Sok Dara" })]);
    expect(guestService.createForInvitation).not.toHaveBeenCalled();
  });

  it("reloads an edited browser-only guest without changing another event's list", async () => {
    saveManualGuests([{ id: "guest-1", name: "Old name" }], "wed-1");
    saveManualGuests([{ id: "other-guest", name: "Other event" }], "wed-2");
    const page = await openGuestPage();

    await act(async () => {
      await page.result.current.mutations.saveGuest({ ...EMPTY_GUEST_FORM, name: "Updated name", count: "2" }, "guest-1");
    });
    page.unmount();

    const refreshed = await openGuestPage();
    expect(refreshed.result.current.guests).toEqual([expect.objectContaining({ id: "guest-1", name: "Updated name", count: 2 })]);
    expect(listManualGuests("wed-2")).toEqual([{ id: "other-guest", name: "Other event" }]);
  });

  it("reloads imported browser-only guests", async () => {
    const page = await openGuestPage();
    await act(async () => {
      await page.result.current.mutations.importGuests([{ id: "imported-1", name: "Imported guest", count: 2 }]);
    });
    page.unmount();

    const refreshed = await openGuestPage();
    expect(refreshed.result.current.guests).toEqual([expect.objectContaining({ id: "imported-1", name: "Imported guest", count: 2 })]);
  });

  it("keeps the remaining browser-only guests after a deletion and refresh", async () => {
    saveManualGuests([{ id: "guest-1", name: "Delete me" }, { id: "guest-2", name: "Keep me" }], "wed-1");
    const page = await openGuestPage();
    await act(async () => {
      await page.result.current.mutations.deleteGuest(page.result.current.guests[0]);
    });
    page.unmount();

    const refreshed = await openGuestPage();
    expect(refreshed.result.current.guests).toEqual([expect.objectContaining({ id: "guest-2", name: "Keep me" })]);
  });

  it("reloads the sent status without losing the guest", async () => {
    saveManualGuests([{ id: "guest-1", name: "Sok Dara" }], "wed-1");
    const page = await openGuestPage();
    await act(async () => {
      await page.result.current.mutations.markGuestAsSent(page.result.current.guests[0]);
    });
    page.unmount();

    const refreshed = await openGuestPage();
    expect(refreshed.result.current.guests).toEqual([expect.objectContaining({ id: "guest-1", sendStatus: SEND_STATUS.sent })]);
  });

  it("reloads a guest created for a server invitation", async () => {
    invitationService.listMine.mockResolvedValue([{ id: 42, slug: "our-day", status: "PUBLISHED" }]);
    const serverGuests = [];
    guestService.listByInvitation.mockImplementation(async () => [...serverGuests]);
    guestService.createForInvitation.mockImplementation(async (invitationId, payload) => {
      const guest = { id: 7, invitationId, ...payload };
      serverGuests.push(guest);
      return guest;
    });
    const page = await openGuestPage();
    await act(async () => {
      await page.result.current.mutations.saveGuest({ ...EMPTY_GUEST_FORM, name: "Server guest" });
    });
    page.unmount();

    const refreshed = await openGuestPage();
    expect(refreshed.result.current.guests).toEqual([expect.objectContaining({ id: 7, name: "Server guest", source: "backend" })]);
    expect(listManualGuests("wed-1")).toEqual([]);
  });

  it.each(["create", "edit"])("reports a failed server %s without claiming a hidden local save", async (operation) => {
    invitationService.listMine.mockResolvedValue([{ id: 42, slug: "our-day", status: "PUBLISHED" }]);
    guestService.listByInvitation.mockResolvedValue([{ id: 7, guestName: "Original guest" }]);
    guestService.createForInvitation.mockRejectedValueOnce(new Error("Guest save rejected"));
    guestService.updateForInvitation.mockRejectedValueOnce(new Error("Guest save rejected"));
    const page = await openGuestPage();
    let success;
    await act(async () => {
      success = await page.result.current.mutations.saveGuest({ ...EMPTY_GUEST_FORM, name: "Unsaved guest" }, operation === "edit" ? 7 : null);
    });

    expect(success).toBe(false);
    expect(page.result.current.mutations.error).toBe("Guest save rejected");
    expect(listManualGuests("wed-1")).toEqual([]);
    expect(page.result.current.guests).toEqual([expect.objectContaining({ id: 7, name: "Original guest" })]);
  });
});
