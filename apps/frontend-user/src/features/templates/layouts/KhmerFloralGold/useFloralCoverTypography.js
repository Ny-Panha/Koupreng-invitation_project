import { useLayoutEffect } from 'react';

/** Keep ordinary cover text on one line; long names wrap at a readable minimum. */
export default function useFloralCoverTypography(rootRef, phase, title, guest, headingSize, guestSize) {
  useLayoutEffect(() => {
    if (phase !== 'closed' && phase !== 'opening') return undefined;
    const nodes = [...(rootRef.current?.querySelectorAll('.kfg-opening > h1:not(:has(img)),.kfg-guest-frame > span') || [])];
    const baselines = nodes.map(node => [node, node.style.fontSize, node.style.whiteSpace]);
    let active = true, frame;
    const fit = () => {
      if (!active) return;
      for (const [node, fontSize, whiteSpace] of baselines) {
        node.style.fontSize = fontSize;
        node.style.whiteSpace = 'nowrap';
        const pixels = parseFloat(getComputedStyle(node).fontSize);
        const ratio = Math.min(1, (node.clientWidth - 2) / Math.max(1,node.scrollWidth));
        if (ratio < 1) node.style.fontSize = `${Math.max(12,pixels * ratio)}px`;
        node.style.whiteSpace = whiteSpace;
      }
    };
    const schedule = () => { if (active) { cancelAnimationFrame(frame); frame = requestAnimationFrame(fit); } };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    nodes.forEach(node => observer?.observe(node));
    window.addEventListener('resize',schedule);
    document.fonts?.ready.then(schedule);
    fit();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize',schedule);
      baselines.forEach(([node,fontSize,whiteSpace]) => { node.style.fontSize = fontSize; node.style.whiteSpace = whiteSpace; });
    };
  }, [rootRef,phase,title,guest,headingSize,guestSize]);
}
