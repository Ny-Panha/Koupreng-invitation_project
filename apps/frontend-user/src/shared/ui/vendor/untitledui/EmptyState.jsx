/**
 * Untitled UI Empty State Component (adapted for Koupreng E-Invitation)
 * Upstream Source: https://github.com/untitleduico/react
 * License: MIT (Copyright (c) Untitled UI)
 * Adapted to React 19 JSX, Koupreng luxury design tokens, and accessible action slots.
 */

import PropTypes from "prop-types";
import "./EmptyState.css";

export function EmptyState({
  icon: Icon,
  headline,
  description,
  primaryAction,
  secondaryAction,
  className = "",
  compact = false,
  role = "status",
  ...props
}) {
  return (
    <div
      role={role}
      className={`uui-empty-state ${compact ? "uui-empty-state--compact" : ""} ${className}`}
      {...props}
    >
      {Icon && (
        <div className="uui-empty-state__icon-wrap" aria-hidden="true">
          <Icon className="uui-empty-state__icon" size={24} />
        </div>
      )}
      <div className="uui-empty-state__content">
        {headline && <h3 className="uui-empty-state__headline">{headline}</h3>}
        {description && <p className="uui-empty-state__description">{description}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="uui-empty-state__actions">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  headline: PropTypes.node,
  description: PropTypes.node,
  primaryAction: PropTypes.node,
  secondaryAction: PropTypes.node,
  className: PropTypes.string,
  compact: PropTypes.bool,
  role: PropTypes.string,
};
