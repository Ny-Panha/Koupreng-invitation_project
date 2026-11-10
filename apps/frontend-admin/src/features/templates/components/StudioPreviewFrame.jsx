import { useEffect, useRef, useState } from 'react';

// Scale the rendered viewport, keeping one iframe and its selected viewport intact.
export default function StudioPreviewFrame({ device, style, children }) {
  const stage = useRef(null);
  const [size, setSize] = useState({ width: 380, height: 600 });
  useEffect(() => {
    const element = stage.current;
    let frame;
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width > 0 && height > 0) setSize(current => current.width === width && current.height === height ? current : { width, height });
    };
    // Defer state-driven frame sizing beyond the observer delivery cycle.
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(element);
    schedule();
    window.addEventListener('resize', schedule);
    return () => { observer?.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', schedule); };
  }, []);
  const viewportWidth = device === 'mobile' ? 380 : device === 'tablet' ? 680 : 1024;
  const width = viewportWidth + 8; // The frame border must not reduce the simulated viewport.
  const scale = Math.min(1, size.width / width);
  return <div ref={stage} className="studio-preview-stage">
    <div className="studio-preview-footprint" style={{ width: width * scale, height: size.height }}>
      <div className="studio-preview-frame" style={{ ...style, width, height: size.height / scale, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  </div>;
}
