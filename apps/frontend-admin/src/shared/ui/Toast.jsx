import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return undefined;
        // Don't auto-dismiss error alerts too quickly so users have time to read and act
        const duration = toast.type === "error" ? 6000 : 3500;
        const id = setTimeout(onClose, duration);
        return () => clearTimeout(id);
    }, [toast, onClose]);

    if (!toast) return null;
    const isError = toast.type === "error";

    return (
        <div
            className={`toast${isError ? " toast-error" : ""}`}
            role={isError ? "alert" : "status"}
            aria-live={isError ? "assertive" : "polite"}
            aria-atomic="true"
        >
            <span>{toast.message}</span>
            {isError && (
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        marginLeft: 10,
                        background: "none",
                        border: "none",
                        color: "inherit",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 16,
                        lineHeight: 1,
                        padding: "0 4px",
                    }}
                    aria-label="Dismiss notification"
                >
                    ×
                </button>
            )}
        </div>
    );
}
