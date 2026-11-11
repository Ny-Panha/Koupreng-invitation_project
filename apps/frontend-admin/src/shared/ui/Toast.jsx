import { useEffect } from "react";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";

export default function Toast({ toast, onClose }) {
    const { lang } = useAdminLanguage();
    useEffect(() => {
        if (!toast) return undefined;
        // Operational errors stay available until the user dismisses them.
        if (toast.type === "error") return undefined;
        const id = setTimeout(onClose, 3500);
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
                    aria-label={lang === "km" ? "បិទការជូនដំណឹង" : "Dismiss notification"}
                >
                    ×
                </button>
            )}
        </div>
    );
}
