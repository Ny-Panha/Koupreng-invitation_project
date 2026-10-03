import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";

function downloadPngDataUri(dataUri, filename) {
  if (typeof dataUri !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUri)) {
    throw new Error("The server did not return a valid PNG QR image.");
  }
  let bytes;
  try { bytes = atob(dataUri.slice(dataUri.indexOf(",") + 1)); }
  catch (error) { throw new Error("The server returned an invalid PNG QR image.", { cause: error }); }
  if (!bytes.startsWith("\x89PNG\r\n\x1a\n")) throw new Error("The server returned an invalid PNG QR image.");
  const link = document.createElement("a");
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  try { link.click(); } finally { link.remove(); }
}

export const qrApi = {
  /** GET /v1/invitations/:id/qr – get invitation QR code payload/image */
  getInvitationQr: (invitationId) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve(null);
    }
    return api.get(`/v1/invitations/${invitationId}/qr`).then(unwrap);
  },

  /** GET /v1/invitations/:id/guests/:guestId/qr – get guest QR code */
  getGuestQr: (invitationId, guestId) =>
    api.get(`/v1/invitations/${invitationId}/guests/${guestId}/qr`).then(unwrap),

  /** Download QR code as PNG image */
  downloadQrPng: async (invitationId, guestId = null, existingData = null) => {
    const data = existingData || await (guestId ? qrApi.getGuestQr(invitationId, guestId) : qrApi.getInvitationQr(invitationId));
    const name = guestId ? `qr-guest-${guestId}.png` : `qr-invitation-${invitationId}.png`;
    return downloadPngDataUri(data?.qrCodeDataUri, name);
  },
};

export default qrApi;
