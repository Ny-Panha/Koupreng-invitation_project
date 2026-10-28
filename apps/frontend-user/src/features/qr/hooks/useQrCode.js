import { useAccessError } from "@/shared/access/useAccessError";
import { useCallback, useEffect, useRef, useState } from "react";
import { qrApi } from "../api/qrApi";

export function useQrCode(invitationId, guestId = null) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError, failure] = useAccessError();
  const generation = useRef(0);

  const loadQr = useCallback(() => {
    const current = ++generation.current;
    setQrData(null);
    if (!invitationId) { setLoading(false); return; }
    setLoading(true);
    setError("");

    const fetcher = guestId
      ? qrApi.getGuestQr(invitationId, guestId)
      : qrApi.getInvitationQr(invitationId);

    fetcher
      .then((data) => {
        if (current !== generation.current) return;
        if (!guestId && (data?.guestName || data?.tokenType === 'GUEST')) throw new Error('Guest QR cannot be shown as a general event QR');
        if (data?.invitationUrl) {
          let url;
          try { url = new URL(data.invitationUrl); } catch { throw new Error('Invalid invitation QR destination'); }
          if (!['http:', 'https:'].includes(url.protocol) || (!guestId && (data.guestName || data.tokenType === 'GUEST' || url.searchParams.has('token'))) || (data.qrPayload && data.qrPayload !== data.invitationUrl)) throw new Error('QR purpose or destination does not match this invitation request');
        }
        setQrData(data || null);
      })
      .catch((err) => {
        if (current === generation.current) setError(err);
      })
      .finally(() => { if (current === generation.current) setLoading(false); });
  }, [invitationId, guestId, setError]);

  useEffect(() => {
    loadQr();
    return () => { generation.current += 1; };
  }, [loadQr]);

  const downloadPng = async () => {
    if (downloading || !qrData) return;
    setError("");
    setDownloading(true);
    try {
      await qrApi.downloadQrPng(invitationId, guestId, qrData);
    } catch (err) {
      setError(err);
    } finally {
      setDownloading(false);
    }
  };

  return { qrData, loading, downloading, error, failure, loadQr, downloadPng };
}

export default useQrCode;
