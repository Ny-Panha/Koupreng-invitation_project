import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StudioSections from './StudioSections';

afterEach(cleanup);

describe('StudioSections', () => {
  const sections = ['eventInfo', 'schedule', 'gallery', 'cover', 'story', 'ticketsQr'];

  it('renders all 6 studio tabs in English', () => {
    render(
      <StudioSections
        sections={sections}
        active="eventInfo"
        onChange={vi.fn()}
        english={true}
      />
    );

    const tabs = screen.getAllByRole('button');
    expect(tabs).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Event Information' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Schedule & Venue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Media & Opening' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design & Cover' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guest Experience' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tickets & QR' })).toBeInTheDocument();
  });

  it('marks active section with aria-current="page"', () => {
    render(
      <StudioSections
        sections={sections}
        active="schedule"
        onChange={vi.fn()}
        english={true}
      />
    );

    const activeTab = screen.getByRole('button', { name: 'Schedule & Venue' });
    expect(activeTab).toHaveAttribute('aria-current', 'page');
  });

  it('calls onChange with resolved section when tab is clicked', () => {
    const onChange = vi.fn();
    render(
      <StudioSections
        sections={sections}
        active="eventInfo"
        onChange={onChange}
        english={true}
      />
    );

    const scheduleTab = screen.getByRole('button', { name: 'Schedule & Venue' });
    fireEvent.click(scheduleTab);
    expect(onChange).toHaveBeenCalledWith('schedule');
  });

  it('calls onChange when mobile select dropdown changes', () => {
    const onChange = vi.fn();
    render(
      <StudioSections
        sections={sections}
        active="eventInfo"
        onChange={onChange}
        english={true}
      />
    );

    const select = screen.getByRole('combobox', { name: 'Edit section' });
    fireEvent.change(select, { target: { value: 'designCover' } });
    expect(onChange).toHaveBeenCalledWith('cover');
  });

  it('supports arrow key navigation between tabs', () => {
    const onChange = vi.fn();
    render(
      <StudioSections
        sections={sections}
        active="eventInfo"
        onChange={onChange}
        english={true}
      />
    );

    const firstTab = screen.getByRole('button', { name: 'Event Information' });
    fireEvent.keyDown(firstTab, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('schedule');
  });
});
