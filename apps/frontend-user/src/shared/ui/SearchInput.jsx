import { IoSearchOutline, IoCloseCircleOutline } from "react-icons/io5";
import "./SearchInput.css";
import { useUiCopy } from "../i18n/useUiCopy";

export default function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder,
  ariaLabel,
  clearLabel,
  className = "",
  disabled = false,
}) {
  const copy = useUiCopy();
  return (
    <div className={`k-search-input-wrap ${className}`}>
      <IoSearchOutline className="k-search-icon" aria-hidden="true" />
      <input
        type="search"
        className="k-search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? copy("ស្វែងរក...", "Search...")}
        aria-label={ariaLabel ?? copy("ស្វែងរក", "Search input")}
        disabled={disabled}
      />
      {value && onClear && (
        <button
          type="button"
          className="k-search-clear-btn"
          onClick={onClear}
          aria-label={clearLabel ?? copy("សម្អាតការស្វែងរក", "Clear search input")}
          disabled={disabled}
        >
          <IoCloseCircleOutline aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
