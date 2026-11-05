import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InvitationStyleEditor from './InvitationStyleEditor';

afterEach(cleanup);

describe('InvitationStyleEditor', () => {
  const defaultForm = {
    title: 'Bopha & Vibol',
    monogramText: 'B & V',
    coverBackgroundImage: '',
    invitationStyleV1: {
      version: 1,
      date: 'traditional',
      program: 'classic',
      guestFrame: 'khmer',
      motion: 'none',
      headingMode: 'text',
      headingSize: 28,
      headingAlign: 'center',
      monogramMode: 'text',
      monogram: 'ornate',
      backgroundFit: 'cover',
      backgroundX: 50,
      backgroundY: 50,
      backgroundOverlay: 0.2,
      backgroundBlur: 0,
      portraitFrame: 'torn',
      gallery: 'carousel',
      map: 'framed',
      florals: true,
    },
    weddingDate: '2026-12-25',
  };

  const capabilities = {
    coverStyles: true,
    dateStyles: true,
    programStyles: true,
  };

  it('renders date styles and handles style selection', () => {
    const update = vi.fn();
    render(
      <InvitationStyleEditor
        form={defaultForm}
        update={update}
        capabilities={capabilities}
        english={true}
        eventId="101"
      />
    );

    expect(screen.getByText('Date / calendar')).toBeInTheDocument();
    const minimalRadio = screen.getByRole('radio', { name: 'Minimal calendar' });
    expect(minimalRadio).toBeInTheDocument();

    fireEvent.click(minimalRadio);
    expect(update).toHaveBeenCalledWith('invitationStyleV1', expect.objectContaining({
      version: 1,
      date: 'minimal',
    }));
  });

  it('renders program styles and handles program selection', () => {
    const update = vi.fn();
    render(
      <InvitationStyleEditor
        form={defaultForm}
        update={update}
        capabilities={capabilities}
        english={true}
        eventId="101"
      />
    );

    expect(screen.getByText('Wedding program')).toBeInTheDocument();
    const goldCurveRadio = screen.getByRole('radio', { name: 'Gold curved timeline' });
    expect(goldCurveRadio).toBeInTheDocument();

    fireEvent.click(goldCurveRadio);
    expect(update).toHaveBeenCalledWith('invitationStyleV1', expect.objectContaining({
      version: 1,
      program: 'gold-curve',
    }));
  });

  it('renders guest frame selection options', () => {
    const update = vi.fn();
    render(
      <InvitationStyleEditor
        form={defaultForm}
        update={update}
        capabilities={capabilities}
        english={true}
        eventId="101"
      />
    );

    expect(screen.getByText('Guest frame')).toBeInTheDocument();
    const royalRadio = screen.getByRole('radio', { name: 'Royal' });
    expect(royalRadio).toBeInTheDocument();

    fireEvent.click(royalRadio);
    expect(update).toHaveBeenCalledWith('invitationStyleV1', expect.objectContaining({
      version: 1,
      guestFrame: 'royal',
    }));
  });

  it('renders in Khmer when english is false', () => {
    render(
      <InvitationStyleEditor
        form={defaultForm}
        update={vi.fn()}
        capabilities={capabilities}
        english={false}
        eventId="101"
      />
    );

    expect(screen.getByText('កាលបរិច្ឆេទ / ប្រតិទិន')).toBeInTheDocument();
    expect(screen.getByText('កម្មវិធីមង្គលការ')).toBeInTheDocument();
    expect(screen.getByText('ស៊ុមឈ្មោះភ្ញៀវ')).toBeInTheDocument();
  });
});
