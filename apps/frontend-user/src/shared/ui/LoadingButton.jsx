import "./LoadingButton.css";

export default function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  type = "button",
  className = "",
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={`k-loading-btn ${isLoading ? "k-btn-loading" : ""} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="k-spinner" aria-hidden="true" />
          <span className="k-loading-btn-content">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
