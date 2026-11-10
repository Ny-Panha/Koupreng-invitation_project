import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp } from "../motion/variants";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * ScrollReveal — animates children into view on scroll.
 * When prefers-reduced-motion is active, renders children statically without motion/transforms.
 */
export function ScrollReveal({
    children,
    className = "",
    delay = 0,
    variants = fadeUp,
    as = "div",
}) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
        const Tag = as;
        return (
            <Tag ref={ref} className={className} data-reduced-motion="true">
                {children}
            </Tag>
        );
    }

    const MotionTag = motion[as] || motion.div;

    return (
        <MotionTag
            ref={ref}
            className={className}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={variants}
            transition={{ delay }}
        >
            {children}
        </MotionTag>
    );
}

export default ScrollReveal;
