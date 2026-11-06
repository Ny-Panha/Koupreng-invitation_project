import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import FloralAmbience, { FloralSceneCorners } from './FloralAmbience';

afterEach(cleanup);
it('uses three coordinated HD raster effects without video decoding or focusable content', () => {
  const view = render(<FloralAmbience enabled />);
  const layer = view.container.firstElementChild;
  expect(layer).toHaveAttribute('aria-hidden', 'true');
  expect(layer).toHaveAttribute('inert');
  expect([...layer.querySelectorAll('[data-effect]')].map(node => node.dataset.effect)).toEqual(['petal-rain', 'butterfly-flight']);
  expect(layer.querySelectorAll('.kfg-realistic-flight')).toHaveLength(12);
  expect(layer.querySelectorAll('.kfg-realistic-petal')).toHaveLength(12);
  expect(layer.querySelectorAll('.kfg-realistic-wing--body')).toHaveLength(12);
  expect(layer.querySelectorAll('video,audio,svg,canvas,button,a')).toHaveLength(0);
  expect([...layer.querySelectorAll('img')].every(image => image.getAttribute('src').includes('/realistic/') && image.getAttribute('alt') === '')).toBe(true);
  view.rerender(<FloralAmbience enabled paused />);
  expect(layer).toHaveAttribute('data-source-paused', 'true');
});
it('uses the same raster branch for four noninteractive scene corners', () => {
  const view = render(<FloralSceneCorners enabled />);
  expect(view.container.firstElementChild).toHaveAttribute('inert');
  expect(view.container.querySelectorAll('.kfg-blossom-corner')).toHaveLength(4);
  expect([...view.container.querySelectorAll('img')].every(image => image.getAttribute('src').endsWith('/blossom-branch.webp') && image.alt === '')).toBe(true);
  view.rerender(<FloralSceneCorners enabled={false} />);
  expect(view.container.querySelectorAll('img')).toHaveLength(0);
});
it('does not request decorative textures for static or data-saving guests', () => {
  const view = render(<FloralAmbience enabled={false} motion="none" />);
  expect(view.container.firstElementChild).toHaveAttribute('hidden');
  expect(view.container.querySelectorAll('img')).toHaveLength(0);
});
