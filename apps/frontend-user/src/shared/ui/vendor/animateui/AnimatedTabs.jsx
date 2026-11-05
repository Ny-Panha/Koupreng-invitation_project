/**
 * Animate UI Animated Tabs Component (adapted for Koupreng E-Invitation)
 * Upstream Source: https://github.com/imskyleen/animate-ui
 * License: MIT + Commons Clause (Copyright (c) Elliot Sutton)
 * Usage: Restricted to Koupreng SaaS marketing application; NOT distributed into user-generated invitations.
 * Adapted to React 19 JSX, framer-motion layoutId sliding active pill, and WAI-ARIA tablist.
 */

import { motion } from "framer-motion";
import PropTypes from "prop-types";
import "./AnimatedTabs.css";

export function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  layoutId = "animated-tab-pill",
  "aria-label": ariaLabel = "Navigation tabs",
}) {
  const handleKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      onChange(tabs[nextIndex].id);
      // Focus target element
      const nextTabEl = event.currentTarget.parentElement.children[nextIndex];
      nextTabEl?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`animate-ui-tabs ${className}`}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`animate-ui-tab ${isActive ? "is-active" : ""}`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="animate-ui-tab__pill"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <span className="animate-ui-tab__label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="animate-ui-tab__count">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

AnimatedTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  layoutId: PropTypes.string,
  "aria-label": PropTypes.string,
};
