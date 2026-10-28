import { cloneElement, isValidElement, useEffect, useId, useRef } from 'react';
import './StudioFields.css';

export function StudioFieldError({ id, children }) { return children ? <p id={id} className="studio-field-error" role="alert">{children}</p> : null; }
export function StudioField({ id, label, required = false, help, error, children, english = false }) {
  const autoId = useId(); const fieldId = id || autoId;
  const hintId = `${fieldId}-help`, errorId = `${fieldId}-error`;
  const described = [help && hintId, error && errorId, children?.props?.['aria-describedby']].filter(Boolean).join(' ') || undefined;
  return <div className="studio-field pe-form-group"><label className="pe-label" htmlFor={fieldId}>{label}<span className="studio-field-state" aria-hidden="true">{required ? (english ? 'Required to publish' : 'ចាំបាច់សម្រាប់ផ្សព្វផ្សាយ') : (english ? 'Optional' : 'ជាជម្រើស')}</span></label>
    {isValidElement(children) ? cloneElement(children, { id: fieldId, 'aria-describedby': described, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined }) : children}
    {help && <p className="studio-field-help" id={hintId}>{help}</p>}<StudioFieldError id={errorId}>{error}</StudioFieldError></div>;
}
export function StudioFormRow({ children }) { return <div className="studio-form-row">{children}</div>; }
export function StudioFieldGroup({ legend, help, children }) { return <fieldset className="studio-field-group"><legend>{legend}</legend>{help && <p className="studio-field-help">{help}</p>}{children}</fieldset>; }
export function StudioDateTimeGroup({ children, english }) { return <StudioFieldGroup legend={english ? 'Date, time & timezone' : 'កាលបរិច្ឆេទ ម៉ោង និងតំបន់ម៉ោង'}><StudioFormRow>{children}</StudioFormRow></StudioFieldGroup>; }
export function StudioTextEditor({ value = '', onChange, maxLength, english, ...props }) {
  return <div className="studio-text-editor"><textarea rows={6} {...props} value={value} onChange={onChange} maxLength={maxLength} /><span className="studio-character-count">{String(value).length}{maxLength ? ` / ${maxLength}` : ''} {english ? 'characters' : 'តួអក្សរ'}</span></div>;
}
export function StudioValidationSummary({ issues, onField, english }) {
  const summary = useRef(null);
  const hadIssues = useRef(false);
  useEffect(() => { if (issues.length && !hadIssues.current) summary.current?.focus(); hadIssues.current = issues.length > 0; }, [issues]);
  if (!issues.length) return null;
  return <div className="studio-validation-summary" role="alert" tabIndex={-1} ref={summary}><h3>{english ? 'Check these details' : 'សូមពិនិត្យព័ត៌មានទាំងនេះ'}</h3><ul>{issues.map(issue => <li key={issue.field}><button type="button" onClick={() => onField(issue)}>{issue.message}</button></li>)}</ul></div>;
}
export function StudioSectionPanel({ label, help, optional = false, english, expanded, onToggle, advanced, children }) {
  return <details className="studio-subsection" open={expanded} onToggle={onToggle}><summary hidden={!advanced}>{label}{optional && <span className="studio-section-optional">{english ? 'Optional' : 'ជាជម្រើស'}</span>}</summary><div className="studio-subsection-body">{help && <p className="studio-section-guidance">{help}</p>}{children}</div></details>;
}
export function StudioActionBar({ children, ...props }) { return <div className="studio-toolbar-actions" {...props}>{children}</div>; }
