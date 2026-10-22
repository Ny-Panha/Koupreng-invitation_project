import { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { i18nService } from "../api/i18nService";
import { LOCAL_MESSAGES } from "./messagesDictionary";
const EMPTY_MESSAGES = Object.freeze({});

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
                    setResponseState({ namespace, lang, messages: response?.messages || EMPTY_MESSAGES });
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
            const localVal = LOCAL_MESSAGES[namespace]?.[lang]?.[key] || LOCAL_MESSAGES[namespace]?.["en"]?.[key] || LOCAL_MESSAGES[namespace]?.["km"]?.[key];
            const isRawKey = typeof serverVal === "string" && (
                serverVal === `${namespace}.${key}` ||
                serverVal.toLowerCase() === `${namespace}.${key}`.toLowerCase() ||
                serverVal === key ||
                serverVal.startsWith(`${namespace}.`)
            );
            const validServerVal = (!isRawKey && typeof serverVal === "string" && serverVal.trim()) ? serverVal : null;
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

