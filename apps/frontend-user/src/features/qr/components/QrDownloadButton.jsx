import { LoadingButton } from "@/shared/ui";
import { useLanguageStore } from "@/stores/useLanguageStore";

export function QrDownloadButton({ onDownload, downloading, disabled = false }) {
  const en = useLanguageStore(state => state.lang) === "en";
  return (
    <LoadingButton
      type="button"
      className="workspace-button primary"
      isLoading={downloading}
      onClick={onDownload}
      disabled={disabled}
    >
      {en ? "Download QR Code (PNG)" : "ទាញយក QR Code (PNG)"}
    </LoadingButton>
  );
}

export default QrDownloadButton;
