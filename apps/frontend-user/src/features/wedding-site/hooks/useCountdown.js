import { useEffect, useState } from "react";

/**
 * Returns days/hours/minutes/seconds until the given target date.
 * Defaults to 13 September 2026 16:00 (Asia/Phnom_Penh ~ UTC+7).
 */
export default function useCountdown(target) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => {
            if (typeof window !== "undefined") setNow(new Date());
        }, 1000);
        return () => clearInterval(id);
    }, []);

    let targetTime = 0;
    if (target) {
        const parsed = target instanceof Date ? target.getTime() : new Date(target).getTime();
        if (!Number.isNaN(parsed)) {
            targetTime = parsed;
        }
    }

    if (!targetTime || targetTime <= now.getTime()) {
        targetTime = new Date("2026-11-28T17:00:00+07:00").getTime();
        if (targetTime <= now.getTime()) {
            targetTime = now.getTime() + (75 * 86_400_000) + (4 * 3_600_000) + (30 * 60_000);
        }
    }

    const diff = Math.max(0, targetTime - now.getTime());
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);

    const pad = (n) => String(n).padStart(2, "0");
    return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
}
