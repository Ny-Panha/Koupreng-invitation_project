import { cloneElement, isValidElement, useId } from "react";
import "./FormField.css";

export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  children,
  className = "",
}) {
  const generatedId = useId();
  const simpleControl = isValidElement(children) && ["input", "select", "textarea"].includes(children.type);
  const controlId = htmlFor || (simpleControl ? children.props.id || generatedId : undefined);
  const Label = controlId ? "label" : "span";
  const labelId = `${generatedId}-label`;
  const descriptionId = `${controlId || generatedId}-description`;
  const control = simpleControl ? cloneElement(children, {
    id: controlId,
    required: required || children.props.required,
    "aria-invalid": error ? true : children.props["aria-invalid"],
    "aria-describedby": [children.props["aria-describedby"], error || helperText ? descriptionId : null].filter(Boolean).join(" ") || undefined,
  }) : children;
  return (
    <div className={`k-form-field ${error ? "k-form-field-has-error" : ""} ${className}`}
      role={!controlId && label ? "group" : undefined}
      aria-labelledby={!controlId && label ? labelId : undefined}
      aria-describedby={!controlId && (error || helperText) ? descriptionId : undefined}>
      {label && (
        <Label id={labelId} htmlFor={controlId} className="k-form-label">
          {label}
          {required && <span className="k-form-required" aria-hidden="true">*</span>}
        </Label>
      )}
      <div className="k-form-control-wrap">{control}</div>
      {error ? (
        <p id={descriptionId} className="k-form-error" role="alert">{error}</p>
      ) : helperText ? (
        <p id={descriptionId} className="k-form-helper">{helperText}</p>
      ) : null}
    </div>
  );
}
