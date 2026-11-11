import "./ResponsiveTable.css";

export default function ResponsiveTable({
  children,
  className = "",
  containerClassName = "",
  ariaLabel = "Data Table",
}) {
  return (
    <div
      className={`k-responsive-table-container ${containerClassName}`}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <table className={`k-responsive-table ${className}`} aria-label={ariaLabel}>
        {children}
      </table>
    </div>
  );
}
