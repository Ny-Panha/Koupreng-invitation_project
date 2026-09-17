import { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { i18nService } from "../services/i18nService";
import { LOCAL_MESSAGES } from "./messagesDictionary";

export function formatMessage(value, replacements = {}) {
    return Object.entries(replacements).reduce(
        (message, [key, replacement]) => message.replaceAll(`{${key}}`, String(replacement)),
        value
    );
}

export function useBackendMessages(namespace) {
    const lang = useLanguageStore((state) => state.lang);
    const [messages, setMessages] = useState({});

    useEffect(() => {
        let active = true;

        i18nService.messages(namespace)
            .then((response) => {
                if (active) {
                    setMessages(response?.messages || {});
                }
            })
            .catch(() => {
                if (active) {
                    setMessages({});
                }
            });

        return () => {
            active = false;
        };
    }, [lang, namespace]);

    const text = useCallback(
        (key, replacements) => {
            const serverVal = messages[key];
            const localVal = LOCAL_MESSAGES[namespace]?.[lang]?.[key] || LOCAL_MESSAGES[namespace]?.["km"]?.[key];
            const isRawKey = typeof serverVal === "string" && (
                serverVal === `${namespace}.${key}` ||
                serverVal.toLowerCase() === `${namespace}.${key}`.toLowerCase() ||
                serverVal === key ||
                serverVal.startsWith(`${namespace}.`)
            );
            const validServerVal = (!isRawKey && serverVal) ? serverVal : null;
            const finalVal = validServerVal || localVal || serverVal || key;
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

