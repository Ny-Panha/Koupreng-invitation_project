/**
 * Aceternity UI Card Hover Effect (adapted for Koupreng E-Invitation)
 * Upstream Source: https://ui.aceternity.com/components/card-hover-effect
 * License: Custom Aceternity License (Permitted for end-application; strictly prohibited from redistributing source or selling in marketplace packs)
 * Usage: Restricted to Koupreng SaaS marketing application; NOT distributed into user-generated invitations.
 * Adapted to React 19 JSX, framer-motion gliding hover pill, and accessible keyboard focus.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import "./CardHoverEffect.css";

export function CardHoverEffect({ items, className = "" }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className={`aceternity-card-grid ${className}`}>
      {items.map((item, idx) => (
        <div
          key={item.title || idx}
          className="aceternity-card-wrapper"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setHoveredIndex(idx)}
          onBlur={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="aceternity-card-hover-pill"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.1 },
                }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <div className="aceternity-card-inner">
            {item.icon && <div className="aceternity-card-icon">{item.icon}</div>}
            <h3 className="aceternity-card-title">{item.title}</h3>
            <p className="aceternity-card-description">{item.description}</p>
            {item.link && (
              <div className="aceternity-card-link-wrap">
                {item.link}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

CardHoverEffect.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      title: PropTypes.node.isRequired,
      description: PropTypes.node.isRequired,
      link: PropTypes.node,
    })
  ).isRequired,
  className: PropTypes.string,
};
