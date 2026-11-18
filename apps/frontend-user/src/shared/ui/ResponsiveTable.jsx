import "./ResponsiveTable.css";

function scrollWithHorizontalKey(event) {
  const region = event.currentTarget;
  // A focused scroll region owns these keys. Inputs, buttons and modified
  // shortcuts inside the table retain their own native behavior.
  if (event.target !== region || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || region.scrollWidth <= region.clientWidth) return;
  const distance = event.key === 'ArrowRight' ? 40 : event.key === 'ArrowLeft' ? -40 : 0;
  if (!distance) return;
  region.scrollLeft += distance;
  event.preventDefault();
}

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
      onKeyDown={scrollWithHorizontalKey}
    >
      <table className={`k-responsive-table ${className}`} aria-label={ariaLabel}>
        {children}
      </table>
    </div>
  );
}
