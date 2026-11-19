import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import TemplateBoilerplateLayout from './layouts/TemplateBoilerplate/TemplateBoilerplateLayout';
import WithJoyPortalLayout from './layouts/WithJoyPortalLayout';
import BlissEditorialLayout from './layouts/BlissEditorialLayout';
import DigitalYesLayout from './layouts/DigitalYes/DigitalYesLayout';
import EmeraldLuxeLayout from './layouts/EmeraldLuxe/EmeraldLuxeLayout';
import CanvaKhmerWeddingTemplate from './experience/components/canva-khmer/CanvaKhmerWeddingTemplate';
import RsvpContainer from './shared/RSVP/RsvpContainer';
import DigitalYesRsvpModal from './layouts/DigitalYes/components/DigitalYesRsvpModal';
import GalleryGrid from './shared/Gallery/GalleryGrid';

const content = { groom: 'សុវណ្ណ វិសាល', bride: 'សុភា ច័ន្ទរស្មី', languageMode: 'en', gallery: ['/images/wedding/couple-hero-meadow.webp', '/images/wedding/couple-garden-rings.webp'], enabledSections: { countdown: false } };
const show = (Component, props = {}) => render(<MemoryRouter><Component content={content} {...props} /></MemoryRouter>);
afterEach(cleanup);

describe('Phase 10 Codex negative regressions', () => {
  for (const [name, Component] of [['Boilerplate', TemplateBoilerplateLayout], ['WithJoy', WithJoyPortalLayout], ['Bliss', BlissEditorialLayout], ['Shared RSVP', RsvpContainer], ['Digital RSVP', DigitalYesRsvpModal]]) {
    it(`${name}: unauthorised demo cannot imply delivery to a host`, () => {
      show(Component);
      if (name === 'Bliss') fireEvent.click(screen.getAllByRole('button', { name: /RSVP/ })[0]);
      expect(screen.getByText(/Demo only.*not sent/i)).toBeInTheDocument();
    });
    it(`${name}: owner-provided RSVP keeps its real request/error surface`, () => {
      show(Component, { children: <div role="alert">Server request failed. Retry.</div> });
      if (name === 'Bliss') fireEvent.click(screen.getAllByRole('button', { name: /RSVP/ })[0]);
      expect(screen.getByRole('alert')).toHaveTextContent('Server request failed. Retry.');
      expect(screen.queryByText(/Demo only.*not sent/i)).not.toBeInTheDocument();
    });
  }
  for (const [name, Component] of [['DigitalYes', DigitalYesLayout], ['Emerald', EmeraldLuxeLayout]]) {
    it(`${name}: skip gives essential content keyboard focus`, () => {
      show(Component, { preview: true, previewStartClosed: true });
      fireEvent.click(screen.getByRole('button', { name: /Skip/ }));
      expect(screen.getByRole('main')).toHaveFocus();
    });
  }
  it('Canva: explicitly closed embedded preview survives effects', () => {
    show(CanvaKhmerWeddingTemplate, { preview: true, previewStartClosed: true });
    expect(screen.getByRole('button', { name: /Skip opening/ })).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
  it('Canva: Skip removes the cover immediately without waiting for its exit animation', () => {
    const { container } = show(CanvaKhmerWeddingTemplate);
    fireEvent.click(screen.getByRole('button', { name: /Skip/ }));
    expect(container.querySelector('.ck-cover')).toBeNull();
  });
  it('Canva: a demo RSVP explains its local-only outcome', () => {
    const { container } = show(CanvaKhmerWeddingTemplate, { preview: true });
    expect(screen.getByText(/Demo only.*not sent/i)).toBeInTheDocument();
    fireEvent.submit(container.querySelector('.ck-demo-rsvp'));
    expect(screen.getByRole('status')).toHaveTextContent('Nothing has been sent to the host.');
  });
  it('Canva: real RSVP children retain their error surface', () => {
    show(CanvaKhmerWeddingTemplate, { preview: true, children: <div role="alert">Server request failed. Retry.</div> });
    expect(screen.getByRole('alert')).toHaveTextContent('Server request failed. Retry.');
    expect(screen.queryByText(/Demo only.*not sent/i)).not.toBeInTheDocument();
  });
  it('Bliss: closing and reopening the drawer preserves a hosted RSVP draft', () => {
    show(BlissEditorialLayout, { children: <textarea aria-label="Hosted draft" defaultValue="" /> });
    const trigger = screen.getAllByRole('button', { name: /RSVP/ })[0];
    fireEvent.click(trigger);
    fireEvent.change(screen.getByLabelText('Hosted draft'), { target: { value: 'Keep this draft' } });
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.getByLabelText('Hosted draft')).toHaveValue('Keep this draft');
  });
  it('Shared gallery: thumbnails are keyboard controls with an isolated dialog', () => {
    const { container } = render(<GalleryGrid images={content.gallery} />);
    const trigger = container.querySelector('.gallery-item');
    expect(trigger.tagName).toBe('BUTTON');
    trigger.focus(); fireEvent.click(trigger);
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });
  it('Shared gallery: shrinking an open album announces the actual displayed image', () => {
    const view = render(<GalleryGrid images={[...content.gallery, '/third-photo.webp']} />);
    fireEvent.click(view.container.querySelectorAll('.gallery-item')[2]);
    view.rerender(<GalleryGrid images={content.gallery} />);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', content.gallery[1]);
    expect(within(dialog).getByRole('img')).toHaveAttribute('alt', expect.stringContaining('Photo 2'));
    expect(within(dialog).getByText('2 / 2')).toBeInTheDocument();
  });
  it('DigitalYes: photo thumbnails can be opened without a pointer', () => {
    const { container } = show(DigitalYesLayout, { preview: true });
    const trigger = container.querySelector('[aria-label="View photo 1"]');
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });
  for (const [name, Component] of [['Boilerplate',TemplateBoilerplateLayout],['WithJoy',WithJoyPortalLayout],['Bliss',BlissEditorialLayout]]) it(`${name}: an authored empty album never becomes stock couple photos`, () => {
    const { container } = show(Component, { content:{...content,hasHostContent:true,gallery:[],coverImage:'',music:''} });
    expect(container.querySelector('img[src*="couple-hero-meadow"], img[src*="03-card/03-"]')).toBeNull();
  });
  for (const [name, Component, selector] of [['Boilerplate', TemplateBoilerplateLayout, '[data-tx-section="gallery"] button'], ['WithJoy', WithJoyPortalLayout, '.wj-gallery-item']]) {
    it(`${name}: modal initially focuses inside and makes background inert`, () => {
      const { container } = show(Component);
      const trigger = container.querySelector(selector);
      trigger.focus(); fireEvent.click(trigger);
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(container.closest('[inert]')).not.toBeNull();
      fireEvent.keyDown(document.activeElement, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
    it(`${name}: ArrowRight changes photo while dialog stays open`, () => {
      const { container } = show(Component);
      fireEvent.click(container.querySelector(selector));
      const first = within(screen.getByRole('dialog')).getByRole('img').getAttribute('src');
      fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
      expect(within(screen.getByRole('dialog')).getByRole('img').getAttribute('src')).not.toBe(first);
    });
  }
});
