export function ReportTable({ data }) {
  const rows = data?.rows || data?.items || [];

  if (!rows.length) {
    return (
      <div className="report-empty">
        <p>មិនមានទិន្នន័យសម្រាប់របាយការណ៍ដែលបានជ្រើសរើសឡើយ។</p>
      </div>
    );
  }

  const columns = data?.columns || [
    { key: "name", title: "ឈ្មោះ" },
    { key: "category", title: "ប្រភេទ / តួនាទី" },
    { key: "status", title: "ស្ថានភាព" },
    { key: "date", title: "កាលបរិច្ឆេទ" },
  ];

  return (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key] !== undefined ? String(row[col.key]) : "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportTable;
