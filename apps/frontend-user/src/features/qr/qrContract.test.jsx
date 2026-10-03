import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/httpClient";
import { qrApi } from "./api/qrApi";
import QrPreview from "./components/QrPreview";

vi.mock("@/shared/api/httpClient", () => ({ api: { get: vi.fn() } }));
const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf4sAAAAASUVORK5CYII=";
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.clearAllMocks(); });

describe("FE-002/003 QR DTO and download contracts", () => {
  it("renders the actual backend QR image and payload", () => {
    render(<QrPreview qrData={{ qrCodeDataUri: png, qrPayload: "guest-token", guestName: "Known guest" }} />);
    expect(screen.getByRole("img", { name: "QR Code" })).toHaveAttribute("src", png);
    expect(screen.getByText("guest-token")).toBeInTheDocument();
  });

  it.each([[null, "qr-invitation-10.png"], [2, "qr-guest-2.png"]])("downloads returned PNG data without an invented endpoint (guest %s)", async (guestId, filename) => {
    api.get.mockResolvedValue({ data: { qrCodeDataUri: png } });
    let clicked;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () { clicked = { href: this.href, download: this.download }; });
    await qrApi.downloadQrPng(10, guestId);
    expect(api.get).toHaveBeenCalledWith(guestId ? "/v1/invitations/10/guests/2/qr" : "/v1/invitations/10/qr");
    expect(api.get).toHaveBeenCalledOnce();
    expect(clicked).toEqual({ href: png, download: filename });
  });

  it("does not download an invalid image or call missing download routes", async () => {
    api.get.mockResolvedValue({ data: { qrCodeDataUri: "data:text/html;base64,PHNjcmlwdD4=" } });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await expect(qrApi.downloadQrPng(10)).rejects.toThrow(/PNG/);
    expect(click).not.toHaveBeenCalled();
    expect(api.get).toHaveBeenCalledWith("/v1/invitations/10/qr");
  });
});
