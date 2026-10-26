import { mkdirSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { afterAll, afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TEMPLATES } from '../data/templatesData';
import { templateCapabilities } from './templateCapabilities';
import { templateRegistry } from './templateRegistry';
import { publicInvitationToDraft } from '../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../wedding-builder/utils/draftToTemplate';
import TemplateExperience from '../experience/TemplateExperience';
import { createMapPreset } from '../shared/mapPresets';

const rows = [], presentations = [...TEMPLATES, { id: 'event-essential', code: 'event-essential' }];
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
afterAll(() => {
  if (process.env.PHASE12_WRITE_MATRIX !== 'true') return;
  mkdirSync('../../docs/phase12/evidence', { recursive: true });
  writeFileSync('../../docs/phase12/evidence/studio-template-locales-matrix.json', JSON.stringify({
    source: 'Current TEMPLATES, templateRegistry and templateCapabilities, rendered by Vitest through the public adapter. These are not HTTP journeys.',
    registryKeys: Object.keys(templateRegistry), presentations: presentations.map(template => ({ code: template.code || template.id, capabilities: templateCapabilities(template) })),
    stages: ['studioInput', 'livePreview', 'saveApi', 'persistence', 'reload', 'publish', 'publicResponse', 'publicRenderer', 'guestLocaleSwitch', 'identity'], rows,
  }, null, 2) + '\n');
});
it.each(presentations.flatMap(template => ['KH', 'EN'].map(languageMode => ({ template, languageMode }))))('Phase 12 current catalogue contract $template.id / $languageMode', async ({ template, languageMode }) => {
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {}); vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const code = template.code || template.id, capabilities = templateCapabilities(template);
  const content = { title: 'Authored celebration', groomName: 'Fictional first partner', brideName: 'Fictional second partner', hostName: 'Fictional first partner',
    messageText: 'Our authored invitation wording', venueName: 'Fictional venue name', venueAddress: 'Fictional venue address',
    thankYouTitle: 'Authored closing', thankYouText: 'Our authored closing wording', apologyText: '', showStory: false,
    coupleMonogram: { version: 1, enabled: true, text: 'A & B', color: '#996633', motif: 'petals', layout: 'oval', size: 100 }, coupleLayout: 'bride-left',
    familyGroupsV1: [{ side: 'groom', label: { km: 'Family', en: 'Family' }, members: [{ id: 'host', name: { km: 'Fictional guardian', en: 'Fictional guardian' }, honorific: { km: '', en: '' }, relationship: { km: '', en: '' } }] }],
    illustratedMap: { version: 1, enabled: true, aspectRatio: 'landscape', theme: 'ivory', description: { km: 'Our route schematic', en: 'Our route schematic' }, nodes: createMapPreset('landmarks') },
    programDays: [{ id: 'one', date: '2027-01-10', title: 'Our program day', titleEn: 'Our program day' }],
    schedule: [{ id: 'stable', dayId: 'one', title: 'Our authored ceremony', titleEn: 'Our authored ceremony', iconKey: 'offering', time: '17:30' }], photos: [],
  };
  const draft = publicInvitationToDraft({ id: 101, templateCode: code, title: content.title, groomName: content.groomName, brideName: content.brideName, hostName: content.hostName, languageMode, eventType: code === 'event-essential' ? 'BIRTHDAY' : 'WEDDING', contentJson: JSON.stringify(content), enabledSections: JSON.stringify({ rsvp: false, countdown: false, gallery: false, story: false, map: true, schedule: true }) });
  const { tpl } = draftToTemplate(draft);
  const { container } = render(<MemoryRouter><TemplateExperience tpl={tpl} preview showActions={false} showBreadcrumb={false} /></MemoryRouter>);
  await waitFor(() => expect(container.textContent).toContain('Fictional first partner'));
  const probes = {
    coupleNames: [true, container.textContent.includes(content.groomName) && (code === 'event-essential' || container.textContent.includes(content.brideName))],
    familyGroups: [capabilities.familyLayout, !!container.querySelector('.kp-family-names')],
    monogram: [capabilities.monogram, !!container.querySelector('.kp-monogram')],
    illustratedMap: [capabilities.illustratedMap, !!container.querySelector('.kp-illustrated-map')],
    program: [capabilities.schedule, container.textContent.includes('Our authored ceremony')],
    invitationWording: [true, container.textContent.includes(content.messageText)],
    venue: [true, container.textContent.includes(content.venueName)],
  };
  for (const [field, [supported, rendered]] of Object.entries(probes)) {
    if (supported) await waitFor(() => expect(rendered, `${code}/${languageMode}/${field}`).toBe(true));
  }
  const fields = ['coupleNames', 'familyGroups', 'monogram', 'invitationWording', 'formalGreeting', 'apologyClosing', 'story', 'program', 'programDatesTimezone', 'saveTheDate', 'countdown', 'calendar', 'venue', 'directions', 'mapImage', 'illustratedMap', 'gallery', 'couplePhoto', 'music', 'preWeddingFilm', 'ticketQr', 'guestPersonalization', 'sectionVisibilityOrder', 'themeTypography'];
  rows.push({ code, languageMode, fields: Object.fromEntries(fields.map(field => [field, Object.fromEntries(['studioInput', 'livePreview', 'saveApi', 'persistence', 'reload', 'publish', 'publicResponse', 'publicRenderer', 'guestLocaleSwitch', 'identity'].map(stage => [stage,
    probes[field]?.[0] === false ? 'UNSUPPORTED_BY_DESIGN' : stage === 'publicRenderer' && probes[field] ? probes[field][1] ? 'SUPPORTED_VERIFIED' : 'SUPPORTED_DEFECT' : 'NOT_TESTED',
  ]))])) });
});
