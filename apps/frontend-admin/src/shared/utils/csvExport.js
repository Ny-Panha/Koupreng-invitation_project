/**
 * Secure CSV export utility with UTF-8 BOM and formula injection protection.
 */

export function sanitizeCsvCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }
  let s = String(value);

  // CSV Formula Injection guard: prefix dangerous leading characters with single quote
  const trimmed = s.replace(/^\s+/, "");
  if (trimmed.length > 0) {
    const firstChar = trimmed.charAt(0);
    if (
      firstChar === "=" ||
      firstChar === "+" ||
      firstChar === "-" ||
      firstChar === "@" ||
      firstChar === "\t" ||
      firstChar === "\r" ||
      firstChar === "\n" ||
      firstChar === "＝" ||
      firstChar === "＋" ||
      firstChar === "－" ||
      firstChar === "＠"
    ) {
      s = "'" + s;
    }
  }

  // Escape inner double quotes
  return `"${s.replace(/"/g, '""')}"`;
}

export function exportCsv(filename, headers, rows) {
  const headerLine = headers.map(sanitizeCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(sanitizeCsvCell).join(","));
  const content = [headerLine, ...dataLines].join("\r\n");

  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default exportCsv;

