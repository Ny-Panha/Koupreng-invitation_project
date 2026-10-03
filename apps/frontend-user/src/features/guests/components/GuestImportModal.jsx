import { useEffect, useRef, useState } from "react";
import { IoCloudUploadOutline, IoDownloadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { FormField, LoadingButton, Modal } from "@/shared/ui";
import { downloadSampleGuestTemplateCsv, parseGuestCsvText } from "../model/guestCsvUtils";
import { guestService } from "../api/guestApi";

export default function GuestImportModal({
  isOpen,
  onClose,
  saving,
  onImport,
  error: externalError,
  t,
  invitationId,
  onFileImported,
}) {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [text, setText] = useState("");
  const [parsedGuests, setParsedGuests] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileGeneration = useRef(0);
  const fileInputRef = useRef(null);
  useEffect(() => {
    fileGeneration.current += 1; setSelectedFile(null); setPreview(null); setImportResult(null); setParsedGuests([]); setFileName(""); setText(""); setError(""); setProcessing(false);
  }, [invitationId]);

  const displayError = error || externalError;

  const handleFileChange = async (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const generation = ++fileGeneration.current;
    setSelectedFile(file); setPreview(null); setImportResult(null); setParsedGuests([]);
    setFileName(file.name);
    if (invitationId) {
      setProcessing(true);
      try {
        const response = await guestService.previewFile(invitationId, file);
        if (generation !== fileGeneration.current) return;
        if (!response || !Array.isArray(response.validRows) || !Number.isInteger(response.acceptedCount) || response.acceptedCount < 0 || response.validRows.length !== response.acceptedCount || !Number.isInteger(response.skippedCount) || response.skippedCount < 0 || response.validRows.some((row) => !Number.isInteger(row.rowNumber) || typeof row.guest?.guestName !== "string" || !row.guest.guestName.trim())) throw new Error("The server returned an invalid import preview. Please retry.");
        setPreview(response);
        setParsedGuests(response.validRows.map(({ guest }) => ({ name: guest.guestName, phone: guest.phone, email: guest.email, group: guest.guestGroup, tableNumber: guest.tableNumber })));
      } catch (failure) { if (generation === fileGeneration.current) setError(failure.message || "Could not validate the import file"); }
      finally { if (generation === fileGeneration.current) setProcessing(false); }
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === "string") {
          const results = parseGuestCsvText(content);
          if (!results.length) {
            setError("មិនអាចអានទិន្នន័យពី File នេះបានទេ។ សូមពិនិត្យមើលទ្រង់ទ្រាយ CSV។");
            return;
          }
          setParsedGuests(results);
        }
      } catch (err) {
        setError(err.message || "មានបញ្ហាក្នុងការអាន File");
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (val) => {
    setText(val);
    setError("");
    const results = parseGuestCsvText(val);
    setParsedGuests(results);
  };

  const handleProcessImport = () => {
    setError("");
    if (invitationId && activeTab === "file") {
      if (!selectedFile || !preview?.acceptedCount) { setError("Choose and preview a valid file before importing."); return; }
      const generation = fileGeneration.current;
      setProcessing(true);
      guestService.importFile(invitationId, selectedFile).then(async (result) => {
        if (generation !== fileGeneration.current) return;
        if (!result || !Number.isInteger(result.importedCount) || !Number.isInteger(result.skippedCount)) throw new Error("The server returned an invalid import result. Refresh the guest list before retrying.");
        setImportResult(result); setPreview(null); setParsedGuests([]); setSelectedFile(null);
        await onFileImported?.();
      }).catch((failure) => {
        if (generation !== fileGeneration.current) return;
        setPreview(null);
        setError(`${failure.message || "Could not confirm the import result"}. Your file is retained. Refresh the guest list and preview the file again before retrying.`);
      }).finally(() => { if (generation === fileGeneration.current) setProcessing(false); });
      return;
    }
    const listToImport = activeTab === "text" ? parseGuestCsvText(text) : parsedGuests;

    if (!listToImport.length) {
      setError(t ? t("importEmptyErr") : "សូមបញ្ចូលឈ្មោះភ្ញៀវយ៉ាងហោចណាស់ ១ នាក់");
      return;
    }

    onImport(listToImport)
      .then((res) => {
        if (res === true || (res && res.success)) {
          setText("");
          setParsedGuests([]);
          setFileName("");
          onClose();
        } else if (res && res.error) {
          setError(res.error);
        }
      })
      .catch((err) => {
        setError(err?.message || "បរាជ័យក្នុងការនាំចូលភ្ញៀវ");
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !processing && !saving && onClose()}
      title={t ? t("importTitle") : "នាំចូលបញ្ជីភ្ញៀវ (Import Guests)"}
      subtitle={t ? t("importSubtitle") : "នាំចូលតាមរយៈ File Excel/CSV ឬចម្លងដាក់តាមប្រអប់អត្ថបទ"}
      size="md"
      closeOnBackdropClick={!saving && !processing}
      closeOnEscape={!saving && !processing}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          <button
            type="button"
            className={`pe-lang-pill-btn ${activeTab === "file" ? "is-active" : ""}`}
            onClick={() => setActiveTab("file")}
            disabled={saving || processing}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <IoCloudUploadOutline /> <span>Upload File CSV</span>
          </button>
          <button
            type="button"
            className={`pe-lang-pill-btn ${activeTab === "text" ? "is-active" : ""}`}
            onClick={() => setActiveTab("text")}
            disabled={saving || processing}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <IoDocumentTextOutline /> <span>វាយអក្សរដោយដៃ (Paste Text)</span>
          </button>
        </div>

        {displayError && (
          <div style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid #fecaca" }}>
            {displayError}
          </div>
        )}

        {processing && <p role="status">Processing file…</p>}
        {preview && <div role="status"><p>Preview: {preview.acceptedCount} valid rows · {preview.skippedCount} skipped rows. Nothing has been imported yet.</p>
          <ul>{preview.errorRows?.map((row) => <li key={row.rowNumber}>Row {row.rowNumber}: {row.reason}</li>)}</ul></div>}
        {importResult && <div role="status"><p>Imported: {importResult.importedCount} · Skipped: {importResult.skippedCount}</p>
          <ul>{importResult.errorRows?.map((row) => <li key={row.rowNumber}>Row {row.rowNumber}: {row.reason}</li>)}</ul></div>}
        {activeTab === "file" ? (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Choose guest import file"
              onKeyDown={(e) => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); fileInputRef.current?.click(); } }}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "10px",
                padding: "24px",
                textAlign: "center",
                cursor: "pointer",
                background: "#f8fafc",
                transition: "all 0.2s ease"
              }}
            >
              <IoCloudUploadOutline style={{ fontSize: "2rem", color: "#64748b", marginBottom: "8px" }} />
              <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                {fileName ? `File ជ្រើសរើស៖ ${fileName}` : "ចុចទីនេះដើម្បីជ្រើសរើស File CSV / Excel"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {invitationId ? "CSV / XLSX · server validation and preview before import" : "CSV / TXT · UTF-8"}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={invitationId ? ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : ".csv,text/csv,text/plain"}
                aria-label="Guest import file"
                disabled={processing || saving}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
              <button
                type="button"
                onClick={downloadSampleGuestTemplateCsv}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#d97706",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <IoDownloadOutline /> ទាញយកគំរូ File (Sample CSV)
              </button>
              {parsedGuests.length > 0 && (
                <span style={{ fontSize: "0.82rem", color: "#16a34a", fontWeight: 700 }}>
                  ✓ រកឃើញភ្ញៀវចំនួន {parsedGuests.length} នាក់
                </span>
              )}
            </div>
          </div>
        ) : (
          <FormField label={t ? t("importDataLabel") : "ទិន្នន័យភ្ញៀវ"} error={error}>
            <textarea
              rows="6"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`ជា វណ្ណដា, 012345678, មិត្តភក្តិ, ខាងកូនកំលោះ, 01\nសុខ ស្រីពេជ្រ, 098765432, សាច់ញាតិ, ខាងកូនក្រមុំ, 02`}
            />
          </FormField>
        )}

        {/* Parsed Preview Table if guests found */}
        {parsedGuests.length > 0 && (
          <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
              មើលគំរូទិន្នន័យដែលបានអាន ({parsedGuests.length} នាក់)៖
            </div>
            <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                  <th style={{ padding: "4px 8px" }}>ឈ្មោះ</th>
                  <th style={{ padding: "4px 8px" }}>ទូរស័ព្ទ</th>
                  <th style={{ padding: "4px 8px" }}>ក្រុម</th>
                  <th style={{ padding: "4px 8px" }}>លេខតុ</th>
                </tr>
              </thead>
              <tbody>
                {parsedGuests.slice(0, 5).map((g, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "4px 8px", fontWeight: 600 }}>{g.name}</td>
                    <td style={{ padding: "4px 8px" }}>{g.phone || "—"}</td>
                    <td style={{ padding: "4px 8px" }}>{g.group || "—"}</td>
                    <td style={{ padding: "4px 8px" }}>{g.tableNumber || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedGuests.length > 5 && (
              <div style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center", marginTop: "4px" }}>
                ...និង {parsedGuests.length - 5} នាក់ផ្សេងទៀត
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "8px" }}>
          <button type="button" className="pe-secondary-btn" onClick={onClose} disabled={saving || processing}>
            {t ? t("cancel") : "បោះបង់"}
          </button>
          <LoadingButton
            type="button"
            isLoading={saving || processing}
            className="pe-primary-btn"
            onClick={handleProcessImport}
            disabled={processing || saving || (invitationId && activeTab === "file" ? !preview?.acceptedCount : parsedGuests.length === 0 && !text.trim())}
          >
            {t ? t("importSubmitBtn") : `នាំចូល ${parsedGuests.length ? `(${parsedGuests.length} នាក់)` : ""}`}
          </LoadingButton>
        </div>
      </div>
    </Modal>
  );
}
