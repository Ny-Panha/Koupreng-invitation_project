import { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { i18nService } from "../api/i18nService";
import { LOCAL_MESSAGES } from "./messagesDictionary";
const EMPTY_MESSAGES = Object.freeze({});

// Product names, file formats, and currency codes can appear in either language.
const SHARED_TERMS = /\b(?:Koupreng|Telegram|Facebook|Google|Maps|ABA|PayWay|Bakong|KHQR|QR|RSVP|PDF|CSV|Excel|XLSX|TXT|PNG|URL|USD|KHR|UTF|HD|MB|API|A4|mm|Esc|Shift|Spotify|YouTube|VIP)\b/gi;
const KHMER_LETTERS = /[\u1780-\u17b3]/;

function matchesLanguage(value, lang, localValue) {
    if (lang === "en") return !KHMER_LETTERS.test(value);
    if (KHMER_LETTERS.test(localValue || "") && !KHMER_LETTERS.test(value)) return false;
    const prose = value.replace(/\{[^}]+\}/g, "").replace(SHARED_TERMS, "");
    return !/[a-z]{2,}/i.test(prose);
}

export function formatMessage(value, replacements = {}) {
    return Object.entries(replacements).reduce(
        (message, [key, replacement]) => message.replaceAll(`{${key}}`, String(replacement)),
        value
    );
}

export function useBackendMessages(namespace) {
    const lang = useLanguageStore((state) => state.lang);
    const [responseState, setResponseState] = useState(null);
    const messages = responseState?.namespace === namespace && responseState?.lang === lang ? responseState.messages : EMPTY_MESSAGES;

    useEffect(() => {
        let active = true;

        i18nService.messages(namespace, lang)
            .then((response) => {
                if (active) {
                    const responseLang = response?.locale?.split(/[-_]/)[0];
                    setResponseState({ namespace, lang, messages: responseLang && responseLang !== lang ? EMPTY_MESSAGES : response?.messages || EMPTY_MESSAGES });
                }
            })
            .catch(() => {
                if (active) {
                    setResponseState({ namespace, lang, messages: EMPTY_MESSAGES });
                }
            });

        return () => {
            active = false;
        };
    }, [lang, namespace]);

    const text = useCallback(
        (key, replacements) => {
            const serverVal = messages[key];
            const localVal = LOCAL_MESSAGES[namespace]?.[lang]?.[key];
            const isRawKey = typeof serverVal === "string" && (
                serverVal === `${namespace}.${key}` ||
                serverVal.toLowerCase() === `${namespace}.${key}`.toLowerCase() ||
                serverVal === key ||
                serverVal.startsWith(`${namespace}.`)
            );
            const validServerVal = (!isRawKey && typeof serverVal === "string" && serverVal.trim() && matchesLanguage(serverVal, lang, localVal)) ? serverVal : null;
            const finalVal = validServerVal || localVal || key;
            return formatMessage(finalVal, replacements);
        },
        [messages, namespace, lang]
    );

    return {
        lang,
        messages,
        text,
    };
}

