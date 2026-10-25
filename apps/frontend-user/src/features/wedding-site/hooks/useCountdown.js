import { useEffect, useState } from "react";
import { absoluteInstant, countdownParts } from '../../templates/shared/eventDateTime';

/**
 * Returns days/hours/minutes/seconds until the given target date.
 * Recalculates from the clock; hidden tabs suspend updates and resume immediately.
 */
export default function useCountdown(target) {
    const [now, setNow] = useState(() => Date.now());
    const instant = absoluteInstant(target);

    useEffect(() => {
        let id;
        const tick = () => { setNow(Date.now()); if (instant <= Date.now()) clearInterval(id); };
        const resume = () => {
            clearInterval(id);
            tick();
            if (!document.hidden && instant !== null && instant > Date.now()) id = setInterval(tick, 1000);
        };
        resume();
        document.addEventListener('visibilitychange', resume);
        window.addEventListener('pageshow', resume);
        return () => { clearInterval(id); document.removeEventListener('visibilitychange', resume); window.removeEventListener('pageshow', resume); };
    }, [instant]);
    return countdownParts(instant, now);
}
