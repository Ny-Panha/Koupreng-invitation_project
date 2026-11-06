import { useRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import useFloralScrollReveal from './useFloralScrollReveal';

let reveal, observer;
beforeEach(() => {
  observer = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  vi.stubGlobal('IntersectionObserver', vi.fn(function (callback) { reveal = callback; return observer; }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function Scene({ enabled }) {
  const root = useRef(null);
  useFloralScrollReveal(root, enabled);
  return <div ref={root}><main className="kfg-content"><section className="kfg-section">Family</section><section className="kfg-section">Map</section></main></div>;
}
it('reveals a section once when it enters view and releases observation', () => {
  const view = render(<Scene enabled />);
  const [family, map] = view.container.querySelectorAll('section');
  expect(family.dataset.scrollReveal).toBe('pending');
  expect(map.dataset.scrollReveal).toBe('pending');
  act(() => reveal([{ target: family, isIntersecting: true }, { target: map, isIntersecting: false }]));
  expect(family.dataset.scrollReveal).toBe('visible');
  expect(map.dataset.scrollReveal).toBe('pending');
  expect(observer.unobserve).toHaveBeenCalledWith(family);
  view.rerender(<Scene enabled={false} />);
  expect(observer.disconnect).toHaveBeenCalled();
  expect(family.dataset.scrollReveal).toBeUndefined();
  expect(map.dataset.scrollReveal).toBeUndefined();
});
it('leaves reduced-motion, data-saving and disabled scenes readable', () => {
  const view = render(<Scene enabled={false} />);
  expect(observer.observe).not.toHaveBeenCalled();
  expect(view.container.querySelector('[data-scroll-reveal]')).toBeNull();
});
it('keeps all sections visible when the browser cannot observe intersections', () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  const view = render(<Scene enabled />);
  expect(view.container.querySelector('[data-scroll-reveal]')).toBeNull();
});
