import { useRef, useState } from "react";
import { IoCloudUploadOutline, IoDownloadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { FormField, LoadingButton, Modal } from "@/shared/ui";
import { downloadSampleGuestTemplateCsv, parseGuestCsvText } from "../model/guestCsvUtils";

export default function GuestImportModal({
  isOpen,
  onClose,
  saving,
  onImport,
  error: externalError,
  t,
}) {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [text, setText] = useState("");
  const [parsedGuests, setParsedGuests] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const displayError = error || externalError;

  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
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
    const listToImport = parsedGuests.length > 0 ? parsedGuests : parseGuestCsvText(text);

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
      onClose={onClose}
      title={t ? t("importTitle") : "នាំចូលបញ្ជីភ្ញៀវ (Import Guests)"}
      subtitle={t ? t("importSubtitle") : "នាំចូលតាមរយៈ File Excel/CSV ឬចម្លងដាក់តាមប្រអប់អត្ថបទ"}
      size="md"
      closeOnBackdropClick={!saving}
      closeOnEscape={!saving}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          <button
            type="button"
            className={`pe-lang-pill-btn ${activeTab === "file" ? "is-active" : ""}`}
            onClick={() => setActiveTab("file")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <IoCloudUploadOutline /> <span>Upload File CSV</span>
          </button>
          <button
            type="button"
            className={`pe-lang-pill-btn ${activeTab === "text" ? "is-active" : ""}`}
            onClick={() => setActiveTab("text")}
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

        {activeTab === "file" ? (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
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
                គាំទ្រ File ប្រភេទ .csv ឬ .txt (អក្សរខ្មែរ UTF-8)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
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
          <button type="button" className="pe-secondary-btn" onClick={onClose} disabled={saving}>
            {t ? t("cancel") : "បោះបង់"}
          </button>
          <LoadingButton
            type="button"
            isLoading={saving}
            className="pe-primary-btn"
            onClick={handleProcessImport}
            disabled={parsedGuests.length === 0 && !text.trim()}
          >
            {t ? t("importSubmitBtn") : `នាំចូល ${parsedGuests.length ? `(${parsedGuests.length} នាក់)` : ""}`}
          </LoadingButton>
        </div>
      </div>
    </Modal>
  );
}
