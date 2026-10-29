import "./Skeleton.css";

export function Skeleton({ width, height, borderRadius, className = "", style = {} }) {
  return (
    <div
      className={`k-skeleton ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
        borderRadius: borderRadius || "var(--radius-sm, 6px)",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ height = "180px", className = "" }) {
  return (
    <div className={`k-skeleton-card ${className}`} style={{ minHeight: height }} aria-hidden="true">
      <Skeleton height="24px" width="60%" />
      <Skeleton height="16px" width="85%" />
      <Skeleton height="16px" width="40%" />
      <div style={{ marginTop: "auto", display: "flex", gap: "0.5rem" }}>
        <Skeleton height="36px" width="90px" borderRadius="var(--radius-md, 10px)" />
        <Skeleton height="36px" width="90px" borderRadius="var(--radius-md, 10px)" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = "" }) {
  const columnCount = Math.min(8, Math.max(1, Math.floor(Number(columns) || 4)));
  const rowCount = Math.min(10, Math.max(1, Math.floor(Number(rows) || 5)));
  return (
    <div className={`k-skeleton-table ${className}`} aria-hidden="true" style={{ '--skeleton-columns': columnCount }}>
      <div className="k-skeleton-table-header">
        {Array.from({ length: columnCount }).map((_, i) => (
          <Skeleton key={i} height="18px" width={`${70 + (i % 3) * 10}%`} />
        ))}
      </div>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div key={rowIndex} className="k-skeleton-table-row">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" width={`${60 + (colIndex % 3) * 15}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
