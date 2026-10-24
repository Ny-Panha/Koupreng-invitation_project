import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useQrCode } from "./hooks/useQrCode";
import { qrApi } from './api/qrApi';

vi.mock("./api/qrApi", () => ({
  qrApi: {
    getInvitationQr: vi.fn().mockResolvedValue({
      title: "Wedding of Sok & Dara",
      qrImageUrl: "https://cdn.test/qr.png",
      invitationUrl: "https://invitation.test/sok-dara",
    }),
    getGuestQr: vi.fn().mockResolvedValue({
      guestName: "John Doe",
      qrImageUrl: "https://cdn.test/guest-qr.png",
    }),
    downloadQrPng: vi.fn().mockResolvedValue({}),
  },
}));

describe("useQrCode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads invitation QR data on mount", async () => {
    const { result } = renderHook(() => useQrCode("101"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.qrData).toEqual(
      expect.objectContaining({ title: "Wedding of Sok & Dara" })
    );
    expect(result.current.error).toBe("");
  });

  it("loads guest QR data when guestId is passed", async () => {
    const { result } = renderHook(() => useQrCode("101", "guest-5"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.qrData).toEqual(
      expect.objectContaining({ guestName: "John Doe" })
    );
  });

  it("provides downloadPng action", async () => {
    const { result } = renderHook(() => useQrCode("101"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.downloadPng).toBe("function");
  });

  it('ignores an older event response after event switching', async () => {
    let resolveFirst;
    qrApi.getInvitationQr.mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }));
    qrApi.getInvitationQr.mockResolvedValueOnce({ title: 'Second event', invitationUrl: 'https://example.test/i/second' });
    const { result, rerender } = renderHook(({ id }) => useQrCode(id), { initialProps: { id: '101' } });
    rerender({ id: '102' });
    await waitFor(() => expect(result.current.qrData?.title).toBe('Second event'));
    await act(async () => resolveFirst({ title: 'First event', invitationUrl: 'https://example.test/i/first' }));
    expect(result.current.qrData.title).toBe('Second event');
  });
  it('rejects a guest bearer credential returned for the general event QR request', async () => {
    qrApi.getInvitationQr.mockResolvedValueOnce({ tokenType: 'GUEST', guestName: 'Fictional guest', invitationUrl: 'https://example.test/i/event?token=fixture' });
    const { result } = renderHook(() => useQrCode('101'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.qrData).toBeNull(); expect(result.current.error).toMatch(/Guest QR/);
  });
  it('rejects a payment payload or other QR that does not match its invitation URL', async () => {
    qrApi.getInvitationQr.mockResolvedValueOnce({ invitationUrl: 'https://example.test/i/event', qrPayload: 'KHQR-unrelated' });
    const { result } = renderHook(() => useQrCode('101'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.qrData).toBeNull(); expect(result.current.error).toMatch(/purpose or destination/);
  });
});
