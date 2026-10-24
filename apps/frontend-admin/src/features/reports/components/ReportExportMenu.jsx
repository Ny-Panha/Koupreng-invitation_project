import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Printer, Files, ShieldCheck } from "lucide-react";
import { workspaceText } from "../reportWorkspace";
import ReportDrawer from "./ReportDrawer";

export default function ReportExportMenu({ disabled, onDownload, onPageCsv, lang, reportName, rowCount, filters, columns = [] }) {
  const [open, setOpen] = useState(false);
  const text = key => workspaceText(key, lang);
  const copy = (kh, en) => lang === "en" ? en : kh;
  const filterNames = { status: ['ស្ថានភាព', 'Status'], paymentStatus: ['ការទូទាត់', 'Payment status'], currency: ['រូបិយប័ណ្ណ', 'Currency'], provider: ['អ្នកផ្តល់សេវា', 'Provider'], eventType: ['ប្រភេទកម្មវិធី', 'Event type'], packageId: ['កញ្ចប់', 'Package'], search: ['ស្វែងរក', 'Search'] };
  const items = [
    ["excel", "xlsxHint", FileSpreadsheet, () => onDownload("xlsx")],
    ["csvAll", "csvAllHint", FileText, () => onDownload("csv")],
    ["csvPage", "csvPageHint", FileText, onPageCsv],
    ["print", "pdfHint", Printer, () => onDownload("html")],
    ["workbook", "workbookHint", Files, () => onDownload("xlsx", true)],
  ];
  return <>
    <button type="button" className="report-primary-button" aria-haspopup="dialog" onClick={() => setOpen(true)}><Download size={17} aria-hidden="true" />{text("exportReport")}</button>
    <ReportDrawer open={open} onClose={() => setOpen(false)} title={text("exportReport")} lang={lang}>
      {open && <div className="report-export-dialog">
        <p className="report-export-eyebrow">KOUPRENG · {copy("របាយការណ៍", "REPORT STUDIO")}</p>
        <h4>{reportName}</h4>
        <dl className="report-export-scope"><div><dt>{copy("កំណត់ត្រាដែលត្រូវគ្នា", "Matching records")}</dt><dd>{rowCount ?? "—"}</dd></div><div><dt>{copy("រយៈពេល", "Period")}</dt><dd>{filters?.from || "—"} → {filters?.to || "—"}</dd></div><div><dt>{copy("តំបន់ម៉ោង", "Timezone")}</dt><dd>Asia/Phnom_Penh</dd></div></dl>
        <p>{copy("CSV និង Excel មានកំណត់ត្រាទាំងអស់តាមលក្ខខណ្ឌ។ ថ្ងៃបញ្ចប់មិនរាប់បញ្ចូលទេ។", "CSV and Excel include all matching records. The end date is exclusive.")}</p>
        {Object.entries(filters || {}).filter(([key, value]) => filterNames[key] && value != null && value !== '').map(([key, value]) => <p key={key}><strong>{filterNames[key][lang === 'en' ? 1 : 0]}:</strong> {String(value)}</p>)}
        <details className="report-export-columns"><summary>{copy("ជួរឈរដែលរួមបញ្ចូល", "Included columns")} · {columns.length}</summary><p>{columns.map(column => lang === "en" ? column.labelEn : column.labelKm).join(" · ")}</p></details>
        <p className="report-export-privacy"><ShieldCheck size={18} aria-hidden="true" />{copy("ប្រើសម្រាប់អ្នកគ្រប់គ្រងប៉ុណ្ណោះ។ ទិន្នន័យសម្ងាត់ និង QR ឯកជនមិនរួមបញ្ចូលទេ។", "Administrator use. Secrets and private QR credentials are excluded by the server.")}</p>
        <div className="report-export-actions">{items.map(([label, hint, Icon, action]) => <button type="button" key={label} aria-label={text(label)} disabled={disabled} onClick={() => { setOpen(false); void action(); }}><Icon size={22} aria-hidden="true" /><span><strong>{text(label)}</strong><small>{text(hint)}</small></span><Download size={16} aria-hidden="true" /></button>)}</div>
        <p className="report-export-note">{copy("មិនមានឯកសារ PDF ទាញយកផ្ទាល់ទេ។ អាចប្រើផ្ទាំងមើលមុនសម្រាប់បោះពុម្ព។", "Direct PDF download is unavailable. Print preview uses your browser’s print controls.")}</p>
      </div>}
    </ReportDrawer>
  </>;
}
