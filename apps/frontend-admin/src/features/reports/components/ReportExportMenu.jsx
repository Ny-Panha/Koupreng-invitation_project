import { useEffect, useRef } from "react";
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Printer,
  Files,
} from "lucide-react";
import { workspaceText } from "../reportWorkspace";
export default function ReportExportMenu({
  disabled,
  onDownload,
  onPageCsv,
  lang,
}) {
  const menu = useRef(null),
    trigger = useRef(null),
    text = (key) => workspaceText(key, lang);
  useEffect(() => {
    const dismiss = (event) => {
      if (menu.current && !menu.current.contains(event.target))
        menu.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  const items = [
    ["excel", "xlsxHint", FileSpreadsheet, () => onDownload("xlsx")],
    ["csvAll", "csvAllHint", FileText, () => onDownload("csv")],
    ["csvPage", "csvPageHint", FileText, onPageCsv],
    ["print", "pdfHint", Printer, () => onDownload("html")],
    ["workbook", "workbookHint", Files, () => onDownload("xlsx", true)],
  ];
  return (
    <details
      ref={menu}
      className="report-export-menu"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          menu.current.open = false;
          trigger.current.focus();
        }
      }}
    >
      <summary
        ref={trigger}
        className="report-primary-button"
        onClick={(event) => {
          event.preventDefault();
          menu.current.open = !menu.current.open;
        }}
      >
        <Download size={17} aria-hidden="true" />
        {text("exportReport")}
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className="report-export-options" aria-label={text("exportReport")}>
        {items.map(([label, hint, Icon, action]) => (
          <button
            key={label}
            type="button"
            aria-label={text(label)}
            disabled={disabled}
            onClick={() => {
              menu.current.open = false;
              trigger.current.focus();
              action();
            }}
          >
            <Icon size={19} aria-hidden="true" />
            <span>
              <strong>{text(label)}</strong>
              <small>{text(hint)}</small>
            </span>
          </button>
        ))}
      </div>
    </details>
  );
}
