/**
 * Secure CSV export utility with UTF-8 BOM and formula injection protection.
 */

export function sanitizeCsvCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }
  let s = String(value);

  // Include Unicode format/control prefixes that spreadsheet importers may ignore.
  if (
    /^[\s\p{Cc}\p{Cf}]*[=+\-@\uFF1D\uFF0B\uFF0D\uFF20]/u.test(s) ||
    /^[\t\r\n]/.test(s)
  )
    s = "'" + s;

  // Escape inner double quotes
  return `"${s.replace(/"/g, '""')}"`;
}

export function exportCsv(filename, headers, rows, metadata = []) {
  const headerLine = headers.map(sanitizeCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(sanitizeCsvCell).join(","));
  const content = [
    ...metadata.map((row) => row.map(sanitizeCsvCell).join(",")),
    ...(metadata.length ? [""] : []),
    headerLine,
    ...dataLines,
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default exportCsv;
