import { useLayoutEffect, useRef } from 'react';
import ProgramTimeline from '../../shared/ProgramTimeline';
import { programDayHeading } from '../../shared/program';
import { formatNumerals } from '../../shared/eventDateTime';

// One uninterrupted thread per day, measured from the existing ceremony markers.
export default function FloralProgramTimeline({ content, english, days }) {
  const rootRef = useRef(null), svgRef = useRef(null);
  const numerals = content.saveTheDate?.numerals || (english ? 'latin' : 'khmer');
  const labelledDays = days.map((day, index) => ({ ...day, title: day.title || programDayHeading(day, index, english, value => formatNumerals(value, numerals)) }));
  useLayoutEffect(() => {
    const root = rootRef.current, svg = svgRef.current;
    let frame, active = true;
    const draw = () => {
      if (!active) return;
      const origin = root.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 52 ${origin.height || 1}`);
      const paths = svg.querySelectorAll('path');
      root.querySelectorAll('.kp-program-day').forEach((day, index) => {
        const list = day.querySelector('.kp-timeline').getBoundingClientRect();
        const points = [[26, list.top - origin.top]];
        day.querySelectorAll('.kp-curve-dot').forEach(dot => {
          const bounds = dot.getBoundingClientRect();
          points.push([bounds.left + bounds.width / 2 - origin.left - (origin.width - 52) / 2, bounds.top + bounds.height / 2 - origin.top]);
        });
        points.push([26, list.bottom - origin.top]);
        let path = `M${points[0].join(' ')}`;
        for (let point = 1; point < points.length; point++) {
          const [x0, y0] = points[point - 1], [x1, y1] = points[point];
          const tangent = (y1 - y0) * .45;
          path += ` C${x0} ${y0 + tangent} ${x1} ${y1 - tangent} ${x1} ${y1}`;
        }
        paths[index]?.setAttribute('d', path);
      });
    };
    const schedule = () => { if (active) { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); } };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(root);
    root.querySelectorAll('.kp-timeline > li').forEach(row => observer?.observe(row));
    window.addEventListener('resize', schedule);
    document.fonts?.ready?.then(schedule);
    schedule();
    return () => { active = false; cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('resize', schedule); };
  }, [days, english]);

  return <div className="kfg-smooth-program" ref={rootRef}>
    <svg className="kfg-program-road" ref={svgRef} aria-hidden="true" focusable="false" preserveAspectRatio="none" fill="none">{days.map(day => <path key={day.id} data-program-road-day={day.id} vectorEffect="non-scaling-stroke" />)}</svg>
    <ProgramTimeline content={content} english={english} days={labelledDays} naturalTime />
  </div>;
}
