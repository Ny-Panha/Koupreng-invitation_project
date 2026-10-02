import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestQrModal from "./GuestQrModal";
import { guestService } from "@/features/guests/api/guestApi";

vi.mock("@/features/guests/api/guestApi", () => ({
  guestService: {
    create: vi.fn(),
    createForInvitation: vi.fn(),
  },
}));

describe("GuestQrModal", () => {
  const currentDraft = {
    slug: "nha-pkay",
    title: "អាពាហ៍ពិពាហ៍ ពិសិដ្ឋ & កល្យាណ",
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders existing token immediately for backend guest without calling create", () => {
    const backendGuest = {
      id: 101,
      name: "Sok Dara",
      inviteToken: "token-backend-123",
      source: "backend",
    };

    render(
      <GuestQrModal
        guest={backendGuest}
        currentDraft={currentDraft}
        backendInvitationId={42}
        onClose={vi.fn()}
      />
    );

    expect(guestService.create).not.toHaveBeenCalled();
    const input = screen.getByRole("textbox");
    expect(input.value).toContain("/w/nha-pkay?token=token-backend-123");
    expect(screen.queryByText("កំពុងរៀបចំ link...")).not.toBeInTheDocument();
  });

  it("syncs manual guest to backend when token is missing and backendInvitationId is present", async () => {
    const manualGuest = {
      id: "host-rec-1",
      name: "Chan Vanna",
      phone: "012345678",
      seatCount: 2,
      source: "manual",
    };

    guestService.create.mockResolvedValueOnce({
      id: 202,
      guestName: "Chan Vanna",
      phone: "012345678",
      seatCount: 2,
      inviteToken: "token-synced-777",
    });

    const handleGuestSynced = vi.fn();

    render(
      <GuestQrModal
        guest={manualGuest}
        currentDraft={currentDraft}
        backendInvitationId={42}
        onGuestSynced={handleGuestSynced}
        onClose={vi.fn()}
      />
    );

    expect(guestService.create).toHaveBeenCalledWith(42, {
      guestName: "Chan Vanna",
      phone: "012345678",
      seatCount: 2,
    });

    await waitFor(() => {
      const input = screen.getByRole("textbox");
      expect(input.value).toContain("/w/nha-pkay?token=token-synced-777");
    });

    expect(handleGuestSynced).toHaveBeenCalledWith(
      expect.objectContaining({
        inviteToken: "token-synced-777",
        backendId: 202,
      })
    );
  });

  it("keeps generic link and does not crash when backendInvitationId is missing", () => {
    const manualGuest = {
      id: "host-rec-2",
      name: "Heng Sok",
      source: "manual",
    };

    render(
      <GuestQrModal
        guest={manualGuest}
        currentDraft={currentDraft}
        backendInvitationId={null}
        onClose={vi.fn()}
      />
    );

    expect(guestService.create).not.toHaveBeenCalled();
    const input = screen.getByRole("textbox");
    expect(input.value).toContain("/w/nha-pkay");
    expect(input.value).not.toContain("?token=");
    expect(screen.queryByText("កំពុងរៀបចំ link...")).not.toBeInTheDocument();
  });

  it("falls back to generic link if backend sync fails", async () => {
    const manualGuest = {
      id: "host-rec-3",
      name: "Rithy",
      source: "manual",
    };

    guestService.create.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <GuestQrModal
        guest={manualGuest}
        currentDraft={currentDraft}
        backendInvitationId={42}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("កំពុងរៀបចំ link...")).not.toBeInTheDocument();
    });

    const input = screen.getByRole("textbox");
    expect(input.value).toContain("/w/nha-pkay");
    expect(input.value).not.toContain("?token=");
  });
});
