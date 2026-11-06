import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import FloralAmbience from './FloralAmbience';

afterEach(cleanup);
it('uses downloaded raster textures across the invitation without focusable content', () => {
  const view = render(<FloralAmbience enabled />);
  const layer = view.container.firstElementChild;
  expect(layer).toHaveAttribute('aria-hidden', 'true');
  expect(layer).toHaveAttribute('inert');
  expect(layer.querySelectorAll('img')).toHaveLength(17);
  expect(layer.querySelectorAll('.kfg-ambient-butterfly')).toHaveLength(4);
  expect(layer.querySelector('.kfg-lotus-rain')).toHaveAttribute('data-petal-count', '7');
  expect(layer.querySelectorAll('.kfg-lotus-petal')).toHaveLength(7);
  expect([...layer.querySelectorAll('.kfg-lotus-petal')].every(image => image.getAttribute('src').endsWith('/lotus-petal.webp'))).toBe(true);
  expect(layer.querySelectorAll('svg,canvas,button,a')).toHaveLength(0);
  expect([...layer.querySelectorAll('img')].every(image => image.getAttribute('src').endsWith('.webp') && image.getAttribute('alt') === '')).toBe(true);
  expect(layer.querySelectorAll('[data-zone=center]').length).toBeGreaterThan(0);
});
it('does not request decorative textures for static or data-saving guests', () => {
  const view = render(<FloralAmbience enabled={false} motion="none" />);
  expect(view.container.firstElementChild).toHaveAttribute('hidden');
  expect(view.container.querySelectorAll('img')).toHaveLength(0);
});
