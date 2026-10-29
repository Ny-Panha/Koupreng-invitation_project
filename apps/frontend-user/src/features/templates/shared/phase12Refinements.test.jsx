import { feedback } from "@/shared/feedback/feedback";
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import IllustratedMapEditor from '../../invitations/studio/IllustratedMapDesignerModal';
import { MonogramEditor } from '../../invitations/studio/FamilyDesignEditor';
import LocaleChecklist from '../../invitations/studio/LocaleChecklist';
import { translationSection } from '../../invitations/studio/localeNavigation';
import ProgramTimeline from './ProgramTimeline';
import CeremonyIcon from './CeremonyIcon';
import { MAP_PRESETS, createMapPreset } from './mapPresets';
import { cleanVector } from './vectorExport';

vi.mock("@/shared/feedback/feedback", () => ({ feedback: { confirm: vi.fn().mockResolvedValue(false) } }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const blank = { version: 1, enabled: true, aspectRatio: 'landscape', theme: 'ivory', description: { km: '', en: '' }, nodes: [] };
function MapEditor() { const [value, change] = useState(blank); return <IllustratedMapEditor value={value} locale="en" allowed onChange={change} onUndo={() => {}} onRedo={() => {}} />; }

describe('Phase 12 route, program and authoring refinements', () => {
  it.each(MAP_PRESETS)('$name creates independent bounded editable nodes without shared labels', preset => {
    const one = createMapPreset(preset.id), two = createMapPreset(preset.id);
    expect(one.length).toBeGreaterThan(2); expect(one.length).toBeLessThanOrEqual(80);
    expect(new Set([...one, ...two].map(node => node.id)).size).toBe(one.length * 2);
    one[0].label.en = 'Authored label'; expect(two[0].label.en).not.toBe('Authored label');
    for (const node of two) { expect(node.x).toBeGreaterThanOrEqual(.05); expect(node.x).toBeLessThanOrEqual(.95); expect(node.rotation).toBeGreaterThanOrEqual(-180); expect(node.rotation).toBeLessThanOrEqual(180); }
  });
  it('confirms preset replacement and keeps keyboard editing available when drag is disabled', async () => {
    render(<MapEditor />);
    fireEvent.click(screen.getByRole('button', { name: 'Straight road', exact: true }));
    fireEvent.change(screen.getByLabelText('English label'), { target: { value: 'My venue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Presets', exact: true }));
    feedback.confirm.mockResolvedValue(false);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Main road to venue/ })));
    expect(screen.getByLabelText('English label')).toHaveValue('My venue');
    fireEvent.click(screen.getByRole('button', { name: 'Pan canvas' }));
    expect(screen.getByRole('button', { name: 'Pan canvas' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
    expect(screen.getByLabelText('Position X', { exact: true })).toHaveValue(.505);
    feedback.confirm.mockResolvedValue(true);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Main road to venue/ })));
    expect(screen.queryByDisplayValue('My venue')).toBeNull();
    expect(screen.getByRole('button', { name: /Event venue/ })).toBeInTheDocument();
  });
  it('keeps original day/ceremony order, multiline copy and explicit icon opt-out', () => {
    const { container } = render(<ProgramTimeline content={{ eventDate: '2027-01-10', languageMode: 'EN', programDays: [{ id: 'two', titleEn: 'Second day', date: '2027-01-11' }], schedule: [{ id: 'stable', dayId: 'two', title: 'Reception\nwith family', titleEn: 'Reception\nwith family', iconKey: 'none' }] }} />);
    expect(screen.getByText('Reception with family')).toBeInTheDocument();
    expect(container.querySelector('time')).toHaveAttribute('dateTime', '2027-01-11');
    expect(container.querySelector('li svg')).toBeNull();
    expect(container.querySelector('li')).toHaveTextContent('Reception');
  });
  it('retains a generic icon for unknown legacy keys', () => {
    const { container } = render(<CeremonyIcon iconKey="legacy-unknown" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('rect')).not.toBeNull();
  });
  it('offers intentional Khmer copy for a missing English field and routes venue checks correctly', () => {
    const copy = vi.fn(), field = vi.fn();
    render(<LocaleChecklist form={{ title: 'ពិធី', eventType: 'WEDDING' }} locale="en" onCopy={copy} onField={field} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy Khmer value: Event title' })); expect(copy).toHaveBeenCalledWith('title');
    fireEvent.click(screen.getByRole('button', { name: 'Venue address', exact: true })); expect(field).toHaveBeenCalledWith('venueAddress');
    expect(translationSection('venueAddress')).toBe('venue'); expect(translationSection('schedule.row.locationEn')).toBe('schedule');
  });
  it('changes a monogram starting style while preserving authored initials', () => {
    const change = vi.fn();
    render(<MonogramEditor value={{ version: 1, enabled: true, text: 'Authored initials', color: '#996633', size: 100, layout: 'round', motif: 'diamond' }} entitled supported onChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Oval petals', exact: true }));
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ text: 'Authored initials', motif: 'petals', layout: 'oval' }));
    expect(screen.getByRole('button', { name: 'Export monogram SVG' })).toBeEnabled();
  });
  it.each(['script', 'foreignObject', 'image'])('rejects %s from the vector export boundary', tag => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.append(document.createElementNS('http://www.w3.org/2000/svg', tag));
    expect(() => cleanVector(svg)).toThrow('unsupported vector');
  });
  it('removes editor affordances and rejects external paint resources', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); rect.setAttribute('data-editor-only', 'true'); svg.append(rect);
    expect(cleanVector(svg).children).toHaveLength(0);
    rect.removeAttribute('data-editor-only'); rect.setAttribute('fill', 'url(https://example.test/resource)');
    expect(() => cleanVector(svg)).toThrow('external or executable');
  });
});
