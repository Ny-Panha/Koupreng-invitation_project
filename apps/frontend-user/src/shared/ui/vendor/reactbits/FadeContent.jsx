/**
 * React Bits FadeContent Component (adapted for Koupreng E-Invitation)
 * Upstream Source: https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/FadeContent/FadeContent.jsx
 * License: MIT + Commons Clause (Copyright (c) David Haz)
 * Usage: Restricted to Koupreng SaaS marketing application; NOT distributed into user-generated invitations.
 * Adapted to React 19 JSX, framer-motion viewport trigger, and prefers-reduced-motion.
 */

import { motion, useReducedMotion } from "framer-motion";
import PropTypes from "prop-types";

export function FadeContent({
  children,
  blur = true,
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  className = "",
  initialOpacity = 0,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      initial={{
        opacity: initialOpacity,
        filter: blur ? "blur(8px)" : "blur(0px)",
        y: 16,
      }}
      whileInView={{
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
      }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

FadeContent.propTypes = {
  children: PropTypes.node.isRequired,
  blur: PropTypes.bool,
  duration: PropTypes.number,
  delay: PropTypes.number,
  threshold: PropTypes.number,
  className: PropTypes.string,
  initialOpacity: PropTypes.number,
};
