import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useTemplateMusicController(src) {
    const audioRef = useRef(null);
    const sourceRef = useRef(src || "");
    const requestRef = useRef(0);
    const statusRef = useRef(src ? "paused" : "missing");
    const [status, setStatus] = useState(src ? "paused" : "missing");

    const updateStatus = useCallback((next) => {
        statusRef.current = next;
        setStatus(next);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        sourceRef.current = src || "";
        requestRef.current += 1;
        updateStatus(src ? "paused" : "missing");
        if (!audio) return undefined;

        audio.pause();
        audio.currentTime = 0;
        if (src) audio.load?.();

        const playing = () => updateStatus("playing");
        const paused = () => {
            requestRef.current += 1;
            updateStatus(sourceRef.current ? "paused" : "missing");
        };
        const failed = () => {
            requestRef.current += 1;
            updateStatus("error");
        };
        audio.addEventListener("playing", playing);
        audio.addEventListener("pause", paused);
        audio.addEventListener("ended", paused);
        audio.addEventListener("error", failed);

        return () => {
            requestRef.current += 1;
            audio.removeEventListener("playing", playing);
            audio.removeEventListener("pause", paused);
            audio.removeEventListener("ended", paused);
            audio.removeEventListener("error", failed);
            audio.pause();
        };
    }, [src, updateStatus]);

    const play = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio || !sourceRef.current) {
            updateStatus("missing");
            return false;
        }

        if (statusRef.current === "loading") return false;
        const request = ++requestRef.current;
        updateStatus("loading");
        audio.volume = 0.5;
        try {
            await audio.play();
            // A source change, pause or unmount invalidates pending play promises.
            if (request !== requestRef.current) return false;
            updateStatus("playing");
            return true;
        } catch {
            if (request === requestRef.current) updateStatus("error");
            return false;
        }
    }, [updateStatus]);

    const pause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        requestRef.current += 1;
        audio.pause();
        updateStatus(sourceRef.current ? "paused" : "missing");
    }, [updateStatus]);

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (audio && (!audio.paused || ["playing", "loading"].includes(statusRef.current))) {
            pause();
            return Promise.resolve(false);
        }
        return play();
    }, [pause, play]);

    const controller = useMemo(() => ({
        hasMusic: Boolean(src),
        pause,
        play,
        playing: status === "playing",
        status,
        toggle,
    }), [pause, play, src, status, toggle]);

    return [audioRef, controller];
}

export default useTemplateMusicController;
