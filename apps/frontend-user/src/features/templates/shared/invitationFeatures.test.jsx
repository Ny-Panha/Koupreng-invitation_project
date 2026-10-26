import { mkdirSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FamilyNames from './FamilyNames';
import IllustratedMap from './IllustratedMap';
import IllustratedMapEditor from '../../invitations/studio/IllustratedMapEditor';
import { COUPLE_LAYOUTS, safeDirections } from './invitationFeatures';
import { WORDING_PRESETS, wordingPresetId, interpolateWording } from '../../invitations/studio/wordingPresets';
import { TEMPLATES } from '../data/templatesData';
import { templateCapabilities } from '../registry/templateCapabilities';
import { publicInvitationToDraft } from '../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../wedding-builder/utils/draftToTemplate';
import TemplateExperience from '../experience/TemplateExperience';

const diagram = { version: 1, enabled: true, aspectRatio: 'landscape', theme: 'ivory', description: { km: 'គំនូរទីតាំង', en: 'Illustrative venue' }, nodes: [{ id: 'venue', type: 'destination', x: .6, y: .4, width: .1, height: .1, rotation: 0, label: { km: 'ទីតាំង', en: 'Venue' } }] };
const contractRows = [];
afterAll(() => {
  if (process.env.PHASE11_WRITE_MATRIX !== 'true') return;
  mkdirSync('../../docs/phase11/evidence', { recursive: true });
  writeFileSync('../../docs/phase11/evidence/feature-contract-matrix.json', JSON.stringify({ source: 'actual Vitest rendered DOM; hosted fictitious data', rows: contractRows }, null, 2) + '\n');
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe('portable invitation features', () => {
  it('handles unknown stored presets and validates the family wording before substitution', () => {
    expect(wordingPresetId('__proto__')).toBe('formal');
    expect(wordingPresetId('removed-preset')).toBe('formal');
    expect(wordingPresetId('modern')).toBe('modern');
    const result = interpolateWording(WORDING_PRESETS.family.en.messageText, { groom_name: 'A', bride_name: 'B' });
    expect(result.missing).toEqual(['venue_name']);
    expect(result.text).toContain('A and B');
  });
  it.each(COUPLE_LAYOUTS)('keeps semantic identities and optional hosts in %s', layout => {
    const { container } = render(<FamilyNames content={{ groom: 'First partner', bride: 'Second partner', coupleLayout: layout, languageMode: 'EN', familyGroupsV1: [{ side: 'groom', label: { en: 'Our hosts' }, members: [{ id: 'host', name: { en: 'Guardian' }, honorific: { en: 'Dr' }, relationship: { en: 'Family' } }, { id: 'empty', name: { en: '' } }] }] }} />);
    expect(container.querySelector('.kp-family-names')).toHaveAttribute('data-couple-layout', layout);
    expect([...container.querySelectorAll('h3')].map(node => node.textContent)).toEqual(['First partner', 'Second partner']);
    expect(container.textContent).toContain('Dr Guardian'); expect(container.textContent).not.toContain('undefined');
  });
  it('escapes map labels and has readable alternate text without remote resources', () => {
    const value = { ...diagram, nodes: [{ ...diagram.nodes[0], label: { en: '<script>alert(1)</script>' } }] };
    const { container } = render(<IllustratedMap content={{ illustratedMap: value, languageMode: 'EN', googleMapUrl: 'javascript:alert(1)' }} />);
    expect(container.querySelector('script')).toBeNull(); expect(container.querySelector('image')).toBeNull();
    expect(screen.getByRole('img')).toHaveAccessibleName('Illustrative venue');
    expect(container.textContent).toContain('<script>alert(1)</script>'); expect(container.querySelector('a')).toBeNull();
  });
  it('supports keyboard and numeric map edits and the existing history callbacks', () => {
    const onChange = vi.fn(), undo = vi.fn();
    render(<IllustratedMapEditor value={diagram} locale="en" entitled onChange={onChange} onUndo={undo} onRedo={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '1. destination Venue' }));
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
    expect(onChange.mock.calls.at(-1)[0].nodes[0].x).toBe(.625);
    fireEvent.change(screen.getByLabelText('rotation'), { target: { value: '999' } });
    expect(onChange.mock.calls.at(-1)[0].nodes[0].rotation).toBe(180);
    fireEvent.click(screen.getByRole('button', { name: 'Undo design' })); expect(undo).toHaveBeenCalledOnce();
  });
  it('keeps tokens as plain authored text and reports missing values', () => {
    expect(interpolateWording('Hello [guest_name]', { guest_name: '<img src=x onerror=alert(1)>' }).text).toBe('Hello <img src=x onerror=alert(1)>');
    expect(interpolateWording('[venue_name]', {}).missing).toEqual(['venue_name']);
    expect(safeDirections('https://google.com.evil.test/maps')).toBe('');
    expect(safeDirections('https://maps.google.com/?q=Venue')).toContain('maps.google.com');
  });
});

it.each([...TEMPLATES, { id: 'event-essential', code: 'event-essential' }].flatMap(template => ['KH', 'EN'].map(languageMode => ({ template, languageMode }))))('renders portable map data in $template.id / $languageMode', async ({ template, languageMode }) => {
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {}); vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const code = template.code || template.id;
  const content = { title: 'Authored event', groomName: 'First partner', brideName: 'Second partner', messageText: 'Authored invitation', coupleMonogram: { version: 1, enabled: true, text: 'A & B', color: '#996633', motif: 'diamond', layout: 'round', size: 100 }, venueName: 'Venue', venueAddress: 'Address', illustratedMap: diagram, coupleLayout: 'bride-left', schedule: [], programDays: [], photos: [] };
  const draft = publicInvitationToDraft({ id: 101, templateCode: code, title: content.title, groomName: content.groomName, brideName: content.brideName, hostName: content.groomName, languageMode, eventType: code === 'event-essential' ? 'BIRTHDAY' : 'WEDDING', contentJson: JSON.stringify(content), enabledSections: JSON.stringify({ map: true, rsvp: false, countdown: false }) });
  const { tpl } = draftToTemplate(draft);
  const { container } = render(<MemoryRouter><TemplateExperience tpl={tpl} preview showActions={false} showBreadcrumb={false} /></MemoryRouter>);
  if (templateCapabilities(template).illustratedMap) await waitFor(() => expect(container.querySelector('.kp-illustrated-map')).not.toBeNull(), { timeout: 5000 });
  const capabilities = templateCapabilities(template);
  if (capabilities.familyLayout) await waitFor(() => expect(container.querySelector('.kp-family-names')).not.toBeNull());
  if (capabilities.monogram) expect(container.querySelector('.kp-monogram')).not.toBeNull();
  expect(tpl.hostContent.coupleMonogram.text).toBe('A & B');
  contractRows.push({ code, languageMode, capabilities, mapRendered: !!container.querySelector('.kp-illustrated-map'), familyRendered: !!container.querySelector('.kp-family-names'), monogramRendered: !!container.querySelector('.kp-monogram'), retainedSource: true });

});
