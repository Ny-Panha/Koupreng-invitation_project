import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Skeleton, SkeletonCard, SkeletonTable } from './Skeleton';
import { PageSkeleton, CardGridSkeleton } from './LoadingState';
import { useLanguageStore } from '@/stores/useLanguageStore';

afterEach(cleanup);

it('keeps the legacy primitive geometry and decorative contract', () => {
  const { container } = render(<><Skeleton width={0} height="24px" className="custom" style={{ borderRadius: '4px' }} /><SkeletonCard /><SkeletonTable rows={1000} columns={1000} /></>);
  expect(container.querySelector('.custom')).toHaveStyle({ width: '0px', height: '24px', borderRadius: '4px' });
  expect(container.querySelector('.k-skeleton-card')).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelectorAll('.k-skeleton-table-row')).toHaveLength(10);
  expect(container.querySelector('.k-skeleton-table-header').children).toHaveLength(8);
  expect(screen.queryByRole('button')).toBeNull();
});

for (const layout of ['studio', 'dashboard', 'public', 'preview', 'table', 'form', 'list', 'chart', 'ticket', 'event', 'template', 'gallery', 'pricing']) {
  it(`announces one ${layout} region with no interactive or fake content`, () => {
    const { container } = render(<PageSkeleton layout={layout} label="Loading content" />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Loading content');
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(container.querySelectorAll('a,button,input,select,textarea,[tabindex]')).toHaveLength(0);
    expect(container.textContent).not.toMatch(/\$|PAID|PUBLISHED|199/);
    expect(container.querySelectorAll('.k-skeleton').length).toBeLessThan(100);
  });
}

it('uses localized default status and deterministic geometry', () => {
  useLanguageStore.setState({ lang: 'en' });
  const { container, rerender } = render(<CardGridSkeleton variant="template" count={1000} />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  expect(container.querySelectorAll('.k-skeleton-card')).toHaveLength(8);
  const geometry = [...container.querySelectorAll('.k-skeleton')].map(el => el.style.cssText);
  rerender(<CardGridSkeleton variant="template" count={1000} />);
  expect([...container.querySelectorAll('.k-skeleton')].map(el => el.style.cssText)).toEqual(geometry);
  useLanguageStore.setState({ lang: 'km' });
});
