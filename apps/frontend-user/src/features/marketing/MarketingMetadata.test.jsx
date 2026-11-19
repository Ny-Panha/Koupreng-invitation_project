import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { MemoryRouter, Link } from 'react-router-dom';
import MarketingMetadata from './MarketingMetadata';
import { useLanguageStore } from '../../stores/useLanguageStore';

beforeEach(() => useLanguageStore.setState({ lang: 'en' }));
afterEach(cleanup);

it('sets contact description/canonical and restores invitation social tags on unmount', () => {
  const social = document.createElement('meta');
  social.setAttribute('property', 'og:description'); social.content = 'Original invitation copy'; document.head.append(social);
  const view = render(<MemoryRouter initialEntries={['/contact?source=home#form']}><MarketingMetadata /></MemoryRouter>);
  expect(document.head.querySelector('meta[name=description]').content).toMatch(/Questions/);
  expect(document.head.querySelector('link[rel=canonical]').href).toBe(`${location.origin}/contact`);
  view.unmount();
  expect(social.content).toBe('Original invitation copy');
  expect(document.head.querySelector('meta[name=description]')).toBeNull();
  expect(document.head.querySelector('link[rel=canonical]')).toBeNull(); social.remove();
});

it('updates social title to the actual destination after client navigation', () => {
  render(<MemoryRouter><MarketingMetadata /><Link to="/contact">Contact</Link></MemoryRouter>);
  fireEvent.click(screen.getByRole('link', { name: 'Contact' }));
  expect(document.head.querySelector('meta[property="og:title"]').content).toBe('Contact | Koupreng');
  expect(document.head.querySelector('link[rel=canonical]').href).toBe(`${location.origin}/contact`);
});
