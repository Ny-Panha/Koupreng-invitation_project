/**
 * Reusable framer-motion primitives and functional timings for Frontend User 2.0.
 * Restrained management pacing (120–240ms) contrasted with ceremonial timing (700ms).
 */
export const MOTION_EASE_STANDARD = [0.2, 0.7, 0.3, 1];
export const MOTION_EASE_ENTER = [0.16, 1, 0.3, 1];
export const MOTION_EASE_EXIT = [0.4, 0, 1, 1];

export const fadeUp = {
    hidden: { opacity: 0, y: 12, scale: 0.99 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.24, ease: MOTION_EASE_STANDARD },
    },
};

export const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
};

export const pageTransition = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.2, ease: MOTION_EASE_STANDARD },
};

export const panelReveal = {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: MOTION_EASE_ENTER } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.16, ease: MOTION_EASE_EXIT } },
};

export const overlayPanel = {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: MOTION_EASE_ENTER } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: MOTION_EASE_EXIT } },
};

export const tactilePress = {
    whileTap: { scale: 0.985, transition: { duration: 0.12, ease: MOTION_EASE_STANDARD } },
};

export const ceremonyReveal = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, ease: MOTION_EASE_ENTER },
    },
};
