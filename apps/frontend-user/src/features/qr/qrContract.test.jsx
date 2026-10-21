import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/httpClient";
import { qrApi } from "./api/qrApi";
import QrPreview from "./components/QrPreview";

vi.mock("@/shared/api/httpClient", () => ({ api: { get: vi.fn() } }));
const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf4sAAAAASUVORK5CYII=";
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.clearAllMocks(); });

describe("FE-002/003 QR DTO and download contracts", () => {
  it("keeps a missing QR image recoverable without printing its guest token or token-bearing URL", () => {
    const reload = vi.fn();
    const url = "https://koupreng.example/i/event?token=private-guest-token";
    const { container } = render(<QrPreview qrData={{ qrPayload: "private-guest-token", token: "private-guest-token", invitationUrl: url }} onRetry={reload} />);
    expect(container.textContent).not.toContain("private-guest-token");
    expect(screen.getByRole("link")).toHaveAttribute("href", url);
    fireEvent.click(screen.getByRole("button"));
    expect(reload).toHaveBeenCalledOnce();
  });
  it("renders the backend QR image without displaying its private token as text", () => {
    render(<QrPreview qrData={{ qrCodeDataUri: png, qrPayload: "guest-token", guestName: "Known guest" }} />);
    expect(screen.getByRole("img", { name: "QR Code" })).toHaveAttribute("src", png);
    expect(screen.queryByText("guest-token")).not.toBeInTheDocument();
    expect(screen.getByText("Known guest")).toBeInTheDocument();
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
