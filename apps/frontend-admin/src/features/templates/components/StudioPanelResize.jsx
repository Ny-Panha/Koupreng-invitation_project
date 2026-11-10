import { useRef } from 'react';

export default function StudioPanelResize({ value, min, max, onChange, workspaceRef, onDraggingChange, english }) {
  const drag = useRef(null);
  const copy = (en, kh) => english ? en : kh;
  const stop = () => { drag.current = null; onDraggingChange(false); };
  return <div className="studio-resize-controls">
    <div role="separator" tabIndex={0} aria-orientation="vertical"
      aria-label={copy('Resize editing panel', 'ប្ដូរទទឹងផ្ទាំងកែសម្រួល')}
      aria-controls="template-studio-controls" aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)}
      aria-valuetext={`${Math.round(value)}%`} className="studio-resize-handle"
      onKeyDown={event => {
        const next = { ArrowLeft: value - 2, ArrowRight: value + 2, Home: min, End: max, Enter: 48, Escape: 48 }[event.key];
        if (next !== undefined) { event.preventDefault(); onChange(next); }
      }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault(); drag.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId); onDraggingChange(true);
      }}
      onPointerMove={event => {
        if (drag.current !== event.pointerId || !workspaceRef.current) return;
        const rect = workspaceRef.current.getBoundingClientRect();
        if (rect.width) onChange(Math.round((event.clientX - rect.left) / rect.width * 100));
      }}
      onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
      onDoubleClick={() => onChange(48)}>
      <span aria-hidden="true">⋮</span>
    </div>
    <div className="studio-resize-buttons">
      <button type="button" aria-label={copy('Narrow editing panel', 'បង្រួមផ្ទាំងកែសម្រួល')} disabled={value <= min} onClick={() => onChange(value - 5)}>−</button>
      <button type="button" aria-label={copy('Reset panel widths', 'កំណត់ទទឹងផ្ទាំងឡើងវិញ')} onClick={() => onChange(48)}>↔</button>
      <button type="button" aria-label={copy('Widen editing panel', 'ពង្រីកផ្ទាំងកែសម្រួល')} disabled={value >= max} onClick={() => onChange(value + 5)}>+</button>
    </div>
  </div>;
}
