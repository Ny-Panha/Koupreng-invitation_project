/**
 * Guest CSV Export and Import Utilities
 * Supports UTF-8 BOM encoding for flawless Khmer Unicode text display in Microsoft Excel.
 */

export function exportGuestsToCsv(guests = [], eventTitle = "guests") {
  if (!guests.length) return false;

  const headers = [
    "ឈ្មោះភ្ញៀវ (Guest Name)",
    "លេខទូរស័ព្ទ (Phone)",
    "អ៊ីមែល (Email)",
    "ក្រុម (Group)",
    "ផ្នែក (Side)",
    "លេខតុ (Table)",
    "ស្ថានភាព RSVP (RSVP)",
    "ចំនួនអ្នកចូលរួម (Attendees)",
    "កំណត់ចំណាំ (Note)",
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = guests.map((g) => [
    escapeCsv(g.name || g.guestName || ""),
    escapeCsv(g.phone || ""),
    escapeCsv(g.email || ""),
    escapeCsv(g.group || g.guestGroup || ""),
    escapeCsv(g.side || g.sideType || ""),
    escapeCsv(g.tableNumber || ""),
    escapeCsv(g.rsvpStatus || (g.attending ? "Attending" : "Pending")),
    escapeCsv(g.seatCount || g.pax || 1),
    escapeCsv(g.note || g.wishes || ""),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sanitizedTitle = (eventTitle || "wedding")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, "_");
  const timestamp = new Date().toISOString().slice(0, 10);

  link.setAttribute("href", url);
  link.setAttribute("download", `guests_${sanitizedTitle}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function downloadSampleGuestTemplateCsv() {
  const sampleHeaders = [
    "ឈ្មោះភ្ញៀវ",
    "លេខទូរស័ព្ទ",
    "អ៊ីមែល",
    "ក្រុម",
    "ផ្នែក",
    "លេខតុ",
  ];

  const sampleRows = [
    ['"ជា វណ្ណដា"', '"012345678"', '"vanda@example.com"', '"មិត្តភក្តិ"', '"ខាងកូនកំលោះ"', '"01"'],
    ['"សុខ ស្រីពេជ្រ"', '"098765432"', '"sreypich@example.com"', '"សាច់ញាតិ"', '"ខាងកូនក្រមុំ"', '"02"'],
    ['"ហេង សុវណ្ណ"', '"077123456"', '"heng@example.com"', '"ភ្ញៀវកិត្តិយស VIP"', '"ខាងកូនកំលោះ"', '"VIP-A"'],
  ];

  const csvContent = "\uFEFF" + [sampleHeaders.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "sample_guests_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseGuestCsvText(text) {
  if (!text || !text.trim()) return [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  let startIndex = 0;
  const firstLineLower = lines[0].toLowerCase();
  if (
    firstLineLower.includes("name") ||
    firstLineLower.includes("ឈ្មោះ") ||
    firstLineLower.includes("phone") ||
    firstLineLower.includes("លេខ")
  ) {
    startIndex = 1;
  }

  const results = [];
  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
    const parts = [];
    let match;
    while ((match = regex.exec(rawLine)) !== null) {
      let val = match[1] || "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      parts.push(val.trim());
    }

    const name = parts[0] || "";
    if (!name) continue;

    results.push({
      name,
      phone: parts[1] || "",
      email: parts[2] && parts[2].includes("@") ? parts[2] : "",
      group: parts[3] || "Groom Side",
      side: parts[4] || "Groom",
      tableNumber: parts[5] || "",
      category: parts[3] || "General",
    });
  }

  return results;
}
