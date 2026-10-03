import { useCallback, useEffect, useState } from "react";
import { qrApi } from "../api/qrApi";

export function useQrCode(invitationId, guestId = null) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadQr = useCallback(() => {
    if (!invitationId) return;
    setLoading(true);
    setError("");

    const fetcher = guestId
      ? qrApi.getGuestQr(invitationId, guestId)
      : qrApi.getInvitationQr(invitationId);

    fetcher
      .then((data) => {
        setQrData(data || null);
      })
      .catch((err) => {
        setError(err?.message || "Could not load QR code");
      })
      .finally(() => setLoading(false));
  }, [invitationId, guestId]);

  useEffect(() => {
    loadQr();
  }, [loadQr]);

  const downloadPng = async () => {
    if (downloading || !qrData) return;
    setError("");
    setDownloading(true);
    try {
      await qrApi.downloadQrPng(invitationId, guestId, qrData);
    } catch (err) {
      setError(err?.message || "Could not download QR code");
    } finally {
      setDownloading(false);
    }
  };

  return { qrData, loading, downloading, error, loadQr, downloadPng };
}

export default useQrCode;
