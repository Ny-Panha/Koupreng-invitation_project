import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GuestImportModal from "./components/GuestImportModal";
import { guestService } from "./api/guestApi";
vi.mock("./api/guestApi", () => ({ guestService: { previewFile: vi.fn(), importFile: vi.fn() } }));
afterEach(cleanup); beforeEach(() => vi.clearAllMocks());
const preview = { acceptedCount: 1, skippedCount: 1, errorRows: [{ rowNumber: 3, reason: "Duplicate contact" }], validRows: [{ rowNumber: 2, guest: { guestName: "Sok Dara", phone: "012345678" } }] };
describe("BG-05 server guest workflow", () => {
  it("previews XLSX without importing and displays actual commit counts/errors", async () => {
    guestService.previewFile.mockResolvedValue(preview); guestService.importFile.mockResolvedValue({ importedCount: 1, skippedCount: 1, errorRows: preview.errorRows });
    const refresh = vi.fn(); const close = vi.fn();
    render(<GuestImportModal isOpen invitationId={42} onFileImported={refresh} onClose={close} />);
    const file = new File(["PK"], "guests.xlsx");
    fireEvent.change(screen.getByLabelText("Guest import file"), { target: { files: [file] } });
    await screen.findByText(/Nothing has been imported yet/); expect(guestService.importFile).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /នាំចូល \(/ }));
    await screen.findByText(/Imported: 1 · Skipped: 1/); expect(refresh).toHaveBeenCalledOnce(); expect(close).not.toHaveBeenCalled();
    expect(guestService.importFile).toHaveBeenCalledWith(42, file);
  });
  it("blocks import after a rejected preview and retains file after a failed commit", async () => {
    guestService.previewFile.mockRejectedValueOnce(new Error("Invalid file"));
    render(<GuestImportModal isOpen invitationId={42} onClose={vi.fn()} />);
    const file = new File(["bad"], "guests.csv");
    fireEvent.change(screen.getByLabelText("Guest import file"), { target: { files: [file] } });
    await screen.findByText("Invalid file"); expect(guestService.importFile).not.toHaveBeenCalled();
    guestService.previewFile.mockResolvedValueOnce(preview); guestService.importFile.mockRejectedValueOnce(new Error("Server unavailable"));
    fireEvent.change(screen.getByLabelText("Guest import file"), { target: { files: [file] } });
    await screen.findByText(/Nothing has been imported yet/); fireEvent.click(screen.getByRole("button", { name: /នាំចូល \(/ }));
    await screen.findByText(/Server unavailable/); expect(screen.getByText("Sok Dara")).toBeInTheDocument();
  });
});
