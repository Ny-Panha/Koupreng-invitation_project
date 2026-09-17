import { useState } from "react";
import { IoQrCode } from "react-icons/io5";
import { QRCode } from "react-qr-code";
import { useLanguageStore } from "@/stores/useLanguageStore";

import TemplateImage from "../shared/TemplateImage";
import TemplateReveal from "../shared/TemplateReveal";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";

/**
 * TemplateGift — Cambodia-specific gift section (ABA / ACLEDA / Wing).
 * Demo placeholder cards for the template page only — no real account numbers.
 */
export default function TemplateGift({ content }) {
    const lang = useLanguageStore((state) => state.lang);
    const accounts = content.gift || [];
    const [copiedId, setCopiedId] = useState("");
    const CopyIcon = templateIcons.copy;
    const CopiedIcon = templateIcons.copied;
    if (!accounts.length) return null;

    const copyAccount = async (account, key) => {
        if (!account) return;
        let success = false;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(account);
                success = true;
            }
        } catch {
            success = false;
        }

        if (!success) {
            try {
                const input = document.createElement("textarea");
                input.value = account;
                input.setAttribute("readonly", "");
                input.style.position = "fixed";
                input.style.opacity = "0";
                input.style.left = "-9999px";
                document.body.appendChild(input);
                input.focus();
                input.select();
                document.execCommand("copy");
                input.remove();
            } catch {
                // Keep the existing optimistic copied indicator.
            }
        }

        setCopiedId(key);
        window.setTimeout(() => setCopiedId(""), 2000);
    };

    return (
        <section className="tx-section tx-gift" data-tx-section="gift" aria-labelledby="tx-gift-title">
            <div className="tx-shell">
                <TemplateSectionHeader
                    id="tx-gift-title"
                    icon={templateIcons.gift}
                    kicker={lang === "en" ? "WEDDING GIFTS" : "អំណោយមង្គល"}
                    title={lang === "en" ? "Gifts & Blessings" : "ចំណងដៃ"}
                    subtitle={lang === "en" ? "WEDDING GIFT" : "GIFT"}
                    lead={
                        content.giftNote ||
                        (lang === "en"
                            ? "Your presence and blessings are our greatest gifts. For those wishing to send gifts, details are below."
                            : "វត្តមានរបស់អ្នកគឺជាអំណោយដ៏ល្អបំផុត។ ប្រសិនបើអ្នកចង់ចែករំលែកពរជ័យបន្ថែម")
                    }
                />

                <div className="tx-gift__grid">
                    {accounts.map((acc, index) => {
                        const qrValue = acc.qrValue || [acc.bank, acc.account, acc.number, acc.note].filter(Boolean).join(" | ");
                        return (
                            <TemplateReveal as="article" key={acc.id || `${acc.bank}-${index}`} className="tx-gift__card" delay={index * 0.05}>
                                <div className="tx-gift__head">
                                    <span className="tx-gift__bank">{acc.bank}</span>
                                    {acc.note && <span className="tx-gift__tag">{acc.note}</span>}
                                </div>
                                <div className="tx-gift__qr">
                                    {acc.qrImage ? (
                                        <TemplateImage src={acc.qrImage} alt={`QR ${acc.bank || (lang === "en" ? "Account" : "គណនី")}`} />
                                    ) : qrValue ? (
                                        <QRCode value={qrValue} size={78} level="M" />
                                    ) : (
                                        <span className="tx-gift__qr-placeholder" aria-label="QR payment placeholder">
                                             <IoQrCode aria-hidden="true" />
                                             <small>QR</small>
                                        </span>
                                    )}
                                </div>
                                <p className="tx-gift__account">{acc.account}</p>
                                <p className="tx-gift__number">{acc.number}</p>
                                {acc.number && (
                                    <button
                                        type="button"
                                        className="tx-gift__copy"
                                        onClick={() => copyAccount(acc.number, acc.id || String(index))}
                                    >
                                        {copiedId === (acc.id || String(index)) ? (
                                            <CopiedIcon aria-hidden="true" />
                                        ) : (
                                            <CopyIcon aria-hidden="true" />
                                        )}
                                        {copiedId === (acc.id || String(index))
                                            ? (lang === "en" ? "Copied!" : "បានចម្លង")
                                            : (lang === "en" ? "Copy Account Number" : "ចម្លងលេខគណនី")}
                                    </button>
                                )}
                            </TemplateReveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
