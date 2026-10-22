import { useState, useRef } from "react";
import {
    IoCardOutline,
    IoCashOutline,
    IoChevronDownOutline,
    IoPhonePortraitOutline,
} from "react-icons/io5";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";

const METHODS = [
    { value: "Bakong QR", label: "Bakong QR", Icon: IoPhonePortraitOutline, color: "#0369a1", bg: "#e0f2fe" },
    { value: "ABA", label: "ABA", Icon: IoCardOutline, color: "#b45309", bg: "#fef3c7" },
    { value: "សាច់ប្រាក់", label: "សាច់ប្រាក់", Icon: IoCashOutline, color: "#15803d", bg: "#dcfce7" },
];

export function PaymentMethodSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useClickOutside(ref, () => setOpen(false));

    const selected = METHODS.find((m) => m.value === value) || METHODS[0];
    const SelectedIcon = selected.Icon;

    return (
        <div ref={ref} style={{ position: "relative", width: "100%" }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.5px solid #eadfce",
                    borderRadius: "10px",
                    background: "#fdfaf5",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: "#2a1f10",
                    textAlign: "left",
                    fontFamily: "inherit",
                    minHeight: "44px",
                    transition: "border-color 0.2s",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "26px",
                            height: "26px",
                            borderRadius: "6px",
                            background: selected.bg,
                            color: selected.color,
                            fontSize: "14px",
                        }}
                    >
                        <SelectedIcon />
                    </span>
                    <span style={{ fontWeight: 600, color: "#2a1f10" }}>{selected.label}</span>
                </div>
                <IoChevronDownOutline
                    style={{
                        fontSize: "15px",
                        color: "#a8a096",
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                    }}
                />
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        background: "#ffffff",
                        border: "1px solid #eadfce",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(80, 55, 20, 0.12)",
                        zIndex: 30,
                        padding: "6px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                    }}
                >
                    {METHODS.map((method) => {
                        const isSelected = method.value === value;
                        const MethodIcon = method.Icon;
                        return (
                            <button
                                key={method.value}
                                type="button"
                                onClick={() => {
                                    onChange(method.value);
                                    setOpen(false);
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: isSelected ? "#f5efe5" : "transparent",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: isSelected ? 600 : 500,
                                    color: isSelected ? "#7d6443" : "#2a1f10",
                                    transition: "background 0.15s, color 0.15s",
                                    fontFamily: "inherit",
                                }}
                                onMouseOver={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = "#fdfaf5";
                                }}
                                onMouseOut={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "26px",
                                        height: "26px",
                                        borderRadius: "6px",
                                        background: method.bg,
                                        color: method.color,
                                        fontSize: "14px",
                                    }}
                                >
                                    <MethodIcon />
                                </span>
                                <span>{method.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default PaymentMethodSelect;
