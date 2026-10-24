import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestQrModal from "./GuestQrModal";
import { guestService } from "@/features/guests/api/guestApi";
import { copyText } from "../model/guestMappers";
import { LOCAL_MESSAGES } from "@/shared/i18n/messagesDictionary";

vi.mock("../model/guestMappers", async importOriginal => ({
  ...await importOriginal(),
  copyText: vi.fn(),
}));

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
    vi.restoreAllMocks();
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

  const sharingGuest = { id: 101, name: "Sok Dara", source: "backend", inviteToken: "token-backend-123" };
  const t = key => LOCAL_MESSAGES.guests.en[key] || key;

  it.each(["Copy Link", "Copy invitation message"])("marks the guest sent after %s succeeds, with a single clipboard write", async action => {
    const onCopyLink = vi.fn().mockResolvedValue(true);
    const onMarkAsSent = vi.fn().mockResolvedValue(true);
    render(<GuestQrModal guest={sharingGuest} currentDraft={currentDraft} onCopyLink={onCopyLink} onMarkAsSent={onMarkAsSent} onClose={vi.fn()} t={t} />);
    fireEvent.click(screen.getByRole("button", { name: action, exact: true }));
    await waitFor(() => expect(onMarkAsSent).toHaveBeenCalledWith(sharingGuest));
    expect(onCopyLink).toHaveBeenCalledExactlyOnceWith(expect.stringContaining("token-backend-123"), sharingGuest);
    expect(copyText).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Copied", exact: true })).toBeInTheDocument();
  });

  it.each(["Copy Link", "Copy invitation message"])("does not mark sent when %s is denied and allows a successful retry", async action => {
    copyText.mockRejectedValueOnce(new Error("Clipboard permission denied")).mockResolvedValueOnce(true);
    const onMarkAsSent = vi.fn().mockResolvedValue(true);
    render(<GuestQrModal guest={sharingGuest} currentDraft={currentDraft} onMarkAsSent={onMarkAsSent} onClose={vi.fn()} t={t} />);
    fireEvent.click(screen.getByRole("button", { name: action, exact: true }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(t("linkCopyFailed")));
    expect(onMarkAsSent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: action, exact: true }));
    await waitFor(() => expect(onMarkAsSent).toHaveBeenCalledExactlyOnceWith(sharingGuest));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("marks the guest sent when Telegram is opened", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const onMarkAsSent = vi.fn().mockResolvedValue(true);
    render(<GuestQrModal guest={sharingGuest} currentDraft={currentDraft} onMarkAsSent={onMarkAsSent} onClose={vi.fn()} t={t} />);
    fireEvent.click(screen.getByRole("button", { name: "Share on Telegram" }));
    await waitFor(() => expect(onMarkAsSent).toHaveBeenCalledExactlyOnceWith(sharingGuest));
    expect(open).toHaveBeenCalledWith(expect.stringContaining("https://t.me/share/url?"), "_blank", "noopener,noreferrer");
    expect(open.mock.calls[0][0]).toContain("token-backend-123");
  });

  it("shows a save error when copying succeeds but the status cannot be saved", async () => {
    const onMarkAsSent = vi.fn().mockResolvedValue(false);
    copyText.mockResolvedValueOnce(true);
    render(<GuestQrModal guest={sharingGuest} currentDraft={currentDraft} onMarkAsSent={onMarkAsSent} onClose={vi.fn()} t={t} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy Link", exact: true }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(t("saveFailed")));
  });
});
