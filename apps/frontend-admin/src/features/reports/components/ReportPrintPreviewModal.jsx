import { useCallback, useEffect, useRef, useState } from "react";
import { ActionButton } from "../../../shared/ui/AdminUI";
import { reportText } from "../reportModel";
import { periodLabel } from "../reportWorkspace";
import { trapDialogTab } from "../reportFocus";
export default function ReportPrintPreviewModal({ preview, onClose, lang }) {
  const dialog = useRef(null),
    frame = useRef(null);
  const [url, setUrl] = useState(""),
    [orientation, setOrientation] = useState(
      preview.wide ? "landscape" : "portrait",
    ),
    [zoom, setZoom] = useState(80),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  const text = (key) => reportText(key, lang);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  useEffect(() => {
    let alive = true,
      objectUrl;
    preview.blob
      .text()
      .then((html) => {
        const base = `<base href="${window.location.origin}/">`;
        objectUrl = URL.createObjectURL(
          new Blob([html.replace("<head>", `<head>${base}`)], {
            type: "text/html;charset=utf-8",
          }),
        );
        if (alive) setUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (alive) setError("exportError");
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [preview.blob]); // The captured HTML is immutable; language/filters never refetch it.
  const applyOrientation = useCallback(() => {
    const document = frame.current?.contentDocument;
    if (!document?.head) return;
    let style = document.getElementById("preview-orientation");
    if (!style) {
      style = document.createElement("style");
      style.id = "preview-orientation";
      document.head.append(style);
    }
    style.textContent = `@page{size:A4 ${orientation};}`;
  }, [orientation]);
  useEffect(applyOrientation, [applyOrientation, url]);
  return (
    <dialog
      ref={dialog}
      className="management-print-preview"
      onClose={onClose}
      aria-labelledby="report-preview-title"
      onKeyDown={trapDialogTab}
    >
      <header className="report-preview-controls">
        <h2 id="report-preview-title">{preview.title}</h2>
        <label>
          {text("orientation")}
          <select
            value={orientation}
            onChange={(event) => setOrientation(event.target.value)}
          >
            <option value="portrait">{text("portrait")}</option>
            <option value="landscape">{text("landscape")}</option>
          </select>
        </label>
        <label>
          {text("zoom")}
          <select
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            {[60, 80, 100, 125, 150].map((value) => (
              <option value={value} key={value}>
                {value}%
              </option>
            ))}
          </select>
        </label>
        <ActionButton
          disabled={!ready}
          onClick={(event) => {
            applyOrientation();
            frame.current.contentWindow.focus();
            frame.current.contentWindow.print();
            event.currentTarget.focus();
          }}
        >
          {text("print")}
        </ActionButton>
        <ActionButton onClick={() => dialog.current.close()}>
          {text("close")}
        </ActionButton>
      </header>
      <p role="status">
        {(error && text(error)) ||
          (!ready
            ? text("loading")
            : `${periodLabel(preview.from, preview.to, lang)} · Asia/Phnom_Penh`)}
      </p>
      <div className="report-preview-canvas">
        {url && (
          <iframe
            ref={frame}
            title={text("preview")}
            src={url}
            sandbox="allow-same-origin allow-modals"
            style={{
              width: orientation === "portrait" ? "794px" : "1123px",
              height: "1200px",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
            }}
            onLoad={async () => {
              applyOrientation();
              await frame.current?.contentDocument?.fonts?.ready;
              setReady(true);
            }}
          />
        )}
      </div>
    </dialog>
  );
}
