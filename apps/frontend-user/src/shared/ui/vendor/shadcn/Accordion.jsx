/**
 * shadcn/ui Accordion Component (adapted for Koupreng E-Invitation)
 * Upstream Source: https://github.com/shadcn-ui/ui/blob/main/apps/www/registry/default/ui/accordion.tsx
 * License: MIT (Copyright (c) 2023 shadcn)
 * Adapted to React 19 JSX, Koupreng Khmer Floral Gold design tokens, and zero external primitive dependencies.
 */

import { createContext, useContext, useState, useId, useCallback } from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import "./Accordion.css";

const AccordionContext = createContext(null);

export function Accordion({
  type = "single",
  collapsible = true,
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = "",
  ...props
}) {
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined
      ? defaultValue
      : type === "multiple"
      ? []
      : ""
  );

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : internalValue;

  const toggleItem = useCallback(
    (itemValue) => {
      let nextValue;
      if (type === "multiple") {
        const currentList = Array.isArray(activeValue) ? activeValue : [];
        if (currentList.includes(itemValue)) {
          nextValue = currentList.filter((v) => v !== itemValue);
        } else {
          nextValue = [...currentList, itemValue];
        }
      } else {
        if (activeValue === itemValue) {
          nextValue = collapsible ? "" : itemValue;
        } else {
          nextValue = itemValue;
        }
      }

      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [type, collapsible, activeValue, isControlled, onValueChange]
  );

  const isItemOpen = useCallback(
    (itemValue) => {
      if (type === "multiple") {
        return Array.isArray(activeValue) && activeValue.includes(itemValue);
      }
      return activeValue === itemValue;
    },
    [type, activeValue]
  );

  return (
    <AccordionContext.Provider value={{ toggleItem, isItemOpen }}>
      <div className={`shadcn-accordion ${className}`} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

Accordion.propTypes = {
  type: PropTypes.oneOf(["single", "multiple"]),
  collapsible: PropTypes.bool,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onValueChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

const AccordionItemContext = createContext(null);

export function AccordionItem({ value, disabled = false, children, className = "", ...props }) {
  const generatedId = useId();
  const triggerId = `accordion-trigger-${generatedId}`;
  const contentId = `accordion-content-${generatedId}`;

  return (
    <AccordionItemContext.Provider value={{ value, disabled, triggerId, contentId }}>
      <div
        className={`shadcn-accordion-item ${disabled ? "is-disabled" : ""} ${className}`}
        data-state={value}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

AccordionItem.propTypes = {
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export function AccordionTrigger({ children, className = "", ...props }) {
  const { toggleItem, isItemOpen } = useContext(AccordionContext);
  const { value, disabled, triggerId, contentId } = useContext(AccordionItemContext);

  const isOpen = isItemOpen(value);

  return (
    <h3 className="shadcn-accordion-header">
      <button
        type="button"
        id={triggerId}
        aria-controls={contentId}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && toggleItem(value)}
        className={`shadcn-accordion-trigger ${isOpen ? "is-open" : ""} ${className}`}
        {...props}
      >
        <span className="shadcn-accordion-trigger-text">{children}</span>
        <ChevronDown
          size={18}
          className={`shadcn-accordion-chevron ${isOpen ? "is-open" : ""}`}
          aria-hidden="true"
        />
      </button>
    </h3>
  );
}

AccordionTrigger.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export function AccordionContent({ children, className = "", ...props }) {
  const { isItemOpen } = useContext(AccordionContext);
  const { value, triggerId, contentId } = useContext(AccordionItemContext);

  const isOpen = isItemOpen(value);

  if (!isOpen) return null;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={`shadcn-accordion-content ${className}`}
      {...props}
    >
      <div className="shadcn-accordion-content-inner">{children}</div>
    </div>
  );
}

AccordionContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
