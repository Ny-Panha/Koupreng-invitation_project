export const IMPORT_FIELDS = [
  ['guestName', 'Guest name', 'ឈ្មោះភ្ញៀវ'], ['phone', 'Phone', 'លេខទូរស័ព្ទ'],
  ['email', 'Email', 'អ៊ីមែល'], ['seatCount', 'Party size', 'ចំនួនអ្នកចូលរួម'],
  ['guestGroup', 'Group / event side', 'ក្រុម / ខាងកម្មវិធី'], ['sideType', 'Category', 'ប្រភេទភ្ញៀវ'],
  ['companionName', 'Companion', 'អ្នករួមដំណើរ'], ['tableNumber', 'Table label (reference only)', 'ស្លាកតុ (ព័ត៌មានប៉ុណ្ណោះ)'],
  ['note', 'Notes', 'កំណត់ចំណាំ'],
];
const aliases = {
  guestName: ['guestname', 'name', 'ឈ្មោះភ្ញៀវ', 'ឈ្មោះ'],
  phone: ['phone', 'phonenumber', 'telephone', 'tel', 'លេខទូរស័ព្ទ'],
  email: ['email', 'អ៊ីមែល'], seatCount: ['seatcount', 'guestcount', 'partysize', 'attendees', 'ចំនួនអ្នកចូលរួម'],
  guestGroup: ['guestgroup', 'group', 'ក្រុម'], sideType: ['sidetype', 'category', 'ប្រភេទភ្ញៀវ'],
  companionName: ['companionname', 'companion', 'អ្នករួមដំណើរ'], tableNumber: ['tablenumber', 'table', 'លេខតុ'],
  note: ['note', 'notes', 'កំណត់ចំណាំ'],
};
const normalize = value => String(value).replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_()-]/g, '');

export function proposeImportMapping(headers) {
  const mapping = headers.map(header => Object.keys(aliases).find(field => aliases[field].includes(normalize(header))) || '');
  const counts = mapping.reduce((result, field) => ({ ...result, [field]: (result[field] || 0) + 1 }), {});
  return mapping.map(field => counts[field] === 1 ? field : '');
}

export function mappingError(mapping) {
  if (!mapping.includes('guestName')) return 'Map a source column to Guest name.';
  const assigned = mapping.filter(Boolean);
  if (new Set(assigned).size !== assigned.length) return 'Each Koupreng field can be mapped only once.';
  return '';
}

export function mapImportRows(sheet, mapping) {
  return sheet.rows.map(row => ({ rowNumber: row.rowNumber, skip: row.issues?.length > 0, allowNameMatch: false,
    guest: Object.fromEntries(IMPORT_FIELDS.map(([field]) => {
      const index = mapping.indexOf(field);
      return [field, index >= 0 ? String(row.values[index] ?? '').trim() : field === 'seatCount' ? '1' : ''];
    })), sourceIssues: row.issues || [],
  }));
}

export function importPayload(batchId, rows) {
  return { batchId, rows: rows.map(({ rowNumber, guest, skip, allowNameMatch }) => ({ rowNumber, guest, skip, allowNameMatch })) };
}

export function safeCsvCell(value) {
  let text = String(value ?? '');
  // Control characters before a formula prefix can bypass spreadsheet import detection.
  // eslint-disable-next-line no-control-regex
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadImportErrors(rows) {
  const csv = '\uFEFF' + [['rowNumber', 'status', 'problem'], ...rows.filter(row => row.status !== 'IMPORTED').map(row => [row.rowNumber, row.status, row.issues.join('; ')])].map(row => row.map(safeCsvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'Koupreng-Guest-Import-Errors.csv'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importIssueLabel(issue, en) {
  if (en) return issue;
  if (/name is required/i.test(issue)) return 'សូមបំពេញឈ្មោះភ្ញៀវ។';
  if (/email is invalid/i.test(issue)) return 'សូមពិនិត្យទម្រង់អ៊ីមែល។';
  if (/party size|seat count/i.test(issue)) return 'ចំនួនអ្នកចូលរួមត្រូវជាចំនួនគត់ពី 1 ដល់ 1000។';
  if (/phone must start/i.test(issue)) return 'លេខទូរស័ព្ទត្រូវចាប់ផ្តើមដោយ 0 ឬ +លេខប្រទេស។ សូមកែបើ Excel បានលុបលេខ 0។';
  if (/shares this phone|same email or phone|shared contact/i.test(issue)) return 'មានភ្ញៀវប្រើទូរស័ព្ទ ឬអ៊ីមែលដូចគ្នា។ សូមពិនិត្យ ឬរំលង។ មិនបញ្ចូលរួមដោយស្វ័យប្រវត្តិទេ។';
  if (/name matches/i.test(issue)) return 'មានភ្ញៀវឈ្មោះដូចគ្នា។ រំលង ឬបញ្ជាក់បង្កើតជាភ្ញៀវផ្សេង។';
  if (/skipped by host/i.test(issue)) return 'បានរំលងតាមជម្រើសរបស់អ្នក។';
  if (/formula/i.test(issue)) return 'មិននាំចូលរូបមន្តទេ។ សូមជំនួសរូបមន្តដោយតម្លៃអត្ថបទ រួចផ្ទុកឡើងវិញ។';
  if (/quote/i.test(issue)) return 'សញ្ញាសម្រង់ CSV មិនត្រឹមត្រូវ។ សូមកែឯកសាររួចផ្ទុកឡើងវិញ។';
  if (/size must be|characters/i.test(issue)) return 'ទិន្នន័យលើសប្រវែងអនុញ្ញាត។ សូមកាត់បន្ថយអត្ថបទ។';
  return 'សូមពិនិត្យ និងកែទិន្នន័យជួរនេះ មុននាំចូល។';
}
