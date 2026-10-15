export default function ReportKpi({
  label,
  value,
  note,
  tone = "neutral",
  progress,
}) {
  return (
    <article className="report-kpi" data-tone={tone}>
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
      {note && <small>{note}</small>}
      {progress != null && (
        <progress aria-label={label} value={progress} max={1} />
      )}
    </article>
  );
}
