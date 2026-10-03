export function QrPreview({ qrData }) {
  if (!qrData) {
    return (
      <div className="qr-empty">
        <p>មិនមានទិន្នន័យ QR Code ទេ</p>
      </div>
    );
  }

  const qrImageUrl = qrData.qrCodeDataUri || qrData.qrImageUrl || qrData.qrUrl || qrData.imageUrl;
  const qrCodeText = qrData.qrPayload || qrData.qrCode || qrData.token || qrData.slug;

  return (
    <div className="qr-card">
      <div className="qr-frame">
        {qrImageUrl ? (
          <img src={qrImageUrl} alt="QR Code" className="qr-image" />
        ) : (
          <div className="qr-placeholder">
            <span style={{ fontSize: "64px" }}>📱</span>
            <p className="qr-code-text">{qrCodeText || "QR Code"}</p>
          </div>
        )}
      </div>

      <div className="qr-details">
        {qrCodeText && qrImageUrl && <p className="qr-code-text">{qrCodeText}</p>}
        {qrData.title && <h3 className="qr-title">{qrData.title}</h3>}
        {qrData.guestName && (
          <p className="qr-guest">
            ភ្ញៀវកិត្តិយស: <strong>{qrData.guestName}</strong>
          </p>
        )}
        {qrData.invitationUrl && (
          <a
            href={qrData.invitationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="qr-link"
          >
            {qrData.invitationUrl}
          </a>
        )}
      </div>
    </div>
  );
}

export default QrPreview;
