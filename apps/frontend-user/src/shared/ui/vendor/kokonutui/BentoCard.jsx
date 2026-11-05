/**
 * Kokonut UI Bento Card Component (adapted for Koupreng E-Invitation)
 * Upstream Source: https://github.com/kokonut-labs/kokonutui
 * License: MIT (Copyright (c) kokonutUI)
 * Adapted to React 19 JSX, mouse position tracking, and Koupreng gold illumination.
 */

import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import "./BentoCard.css";

export function BentoCard({
  icon: Icon,
  title,
  description,
  badge,
  action,
  children,
  className = "",
  ...props
}) {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      className={`kokonut-bento-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      {...props}
    >
      {/* Dynamic radial gradient glow */}
      <div
        className="kokonut-bento-card__glow"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(185, 139, 66, 0.14), transparent 80%)`,
        }}
        aria-hidden="true"
      />

      <div className="kokonut-bento-card__inner">
        <div className="kokonut-bento-card__header">
          {Icon && (
            <div className="kokonut-bento-card__icon-wrap">
              <Icon size={20} className="kokonut-bento-card__icon" aria-hidden="true" />
            </div>
          )}
          {badge && <span className="kokonut-bento-card__badge">{badge}</span>}
        </div>

        <div className="kokonut-bento-card__content">
          {title && <h3 className="kokonut-bento-card__title">{title}</h3>}
          {description && <p className="kokonut-bento-card__description">{description}</p>}
          {children}
        </div>

        {action && <div className="kokonut-bento-card__action">{action}</div>}
      </div>
    </div>
  );
}

BentoCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.node,
  description: PropTypes.node,
  badge: PropTypes.node,
  action: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
