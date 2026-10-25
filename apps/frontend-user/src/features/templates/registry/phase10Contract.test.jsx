import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { TEMPLATES } from '../data/templatesData';
import { templateRegistry } from './templateRegistry';
import { templateCapabilities } from './templateCapabilities';
import { publicInvitationToDraft } from '../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../wedding-builder/utils/draftToTemplate';
import { buildTemplateContent } from '../experience/config/templateExperienceContent';
import TemplateExperience from '../experience/TemplateExperience';

const content = {
  title: 'Phase10 authored celebration', subtitle: 'Phase10 welcome',
  couple: { groom: 'សុវណ្ណ វិសាល', bride: 'សុភ័ក្រ ស្រីពេជ្រ', groomParents: ['Phase10 father', 'Phase10 mother'] },
  groomFather: 'Phase10 father', groomMother: 'Phase10 mother', messageTitle: 'Phase10 invitation heading', messageText: 'Phase10 authored invitation message',
  studioStyle: { primary: '#123456', motion: 'minimal', portraitY: 72 }, fontKhmer: 'Battambang', fontLatin: 'DM Sans',
  eventDate: '2027-12-05', eventTime: '17:30', eventTimezone: 'Asia/Phnom_Penh',
  programDays: [{ id: 'one', date: '2027-12-04', title: 'ពិធីទីមួយ', titleEn: 'First ceremony' }, { id: 'two', date: '2027-12-05', titleEn: 'Second ceremony' }],
  schedule: [{ id: 'row', dayId: 'one', day: 1, time: '15:00', title: 'ពិធីសិរីមង្គល', titleEn: 'Phase10 ceremony', description: 'Phase10 program description' }],
  saveTheDate: { enabled: true, showCalendar: true, showCountdown: true, showAddToCalendar: true, subtitle: 'Phase10 calendar subtitle' },
  venueName: 'Phase10 venue', venueAddress: 'Phase10 address', googleMapUrl: 'https://maps.google.com/?q=Phnom+Penh',
  storyChapters: [{ id: 'story', title: 'Phase10 story title', text: 'Phase10 story message' }],
  faq: [{ id: 'faq', q: 'Phase10 question', a: 'Phase10 answer' }], party: [{ id: 'party', name: 'Phase10 party member', role: 'Attendant' }],
  dressCode: { name: 'Phase10 dress name', description: 'Phase10 dress description', colors: [{ hex: '#123456', name: 'Jade' }] },
  thankYouTitle: 'Phase10 closing heading', thankYouText: 'Phase10 closing message', apologyText: 'Phase10 apology',
  gallery: [{ url: '/phase10-gallery.jpg', caption: 'Phase10 gallery caption' }], coverImage: '/phase10-cover.jpg',
};

const output = [];
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it.each([...TEMPLATES, { id: 'event-essential', code: 'event-essential' }])('retains authored data and renders the actual $id template', async template => {
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  const code = template.code || template.id;
  const saved = { id: 101, templateCode: code, templateId: 4, status: 'PUBLISHED', languageMode: 'BOTH', eventType: code === 'event-essential' ? 'BIRTHDAY' : 'WEDDING',
    eventDate: content.eventDate, eventTime: content.eventTime, title: content.title, venueName: content.venueName, venueAddress: content.venueAddress,
    contentJson: JSON.stringify(content), enabledSections: JSON.stringify({ rsvp: false, music: false, gift: false, faq: true, party: true, dressCode: true, story: true, gallery: true, countdown: true, schedule: true }) };
  const draft = publicInvitationToDraft(JSON.parse(JSON.stringify(saved)));
  const mapped = draftToTemplate(draft, draft.gallery);
  const vm = buildTemplateContent(mapped.tpl);
  expect(vm).toMatchObject({ groom: content.couple.groom, bride: content.couple.bride, studioStyle: content.studioStyle, fontKhmer: 'Battambang', fontLatin: 'DM Sans', eventDate: content.eventDate });
  expect(vm.schedule[0]).toMatchObject(content.schedule[0]);
  expect(vm.programDays).toEqual(content.programDays);
  const { container } = render(<MemoryRouter><TemplateExperience tpl={mapped.tpl} preview showActions={false} showBreadcrumb={false} /></MemoryRouter>);
  await screen.findAllByText(content.couple.groom, { exact: false });
  expect(container.textContent).toContain(content.couple.bride);
  expect(container.textContent).toContain(content.venueName);
  const probes = Object.fromEntries([
    ['title', content.title], ['subtitle', content.subtitle], ['messageTitle', content.messageTitle], ['messageText', content.messageText],
    ['groomFather', content.groomFather], ['thankYouText', content.thankYouText], ['apologyText', content.apologyText],
    ['faq', 'Phase10 question'], ['party', 'Phase10 party member'], ['dressCode', content.dressCode.name], ['storyChapters', 'Phase10 story title'],
    ['schedule', 'ពិធីសិរីមង្គល'], ['saveTheDate', content.saveTheDate.subtitle], ['venueName', content.venueName],
  ].map(([key, value]) => [key, container.textContent.includes(value)]));
  output.push({ code, category: template.category || 'generic', capabilities: templateCapabilities(template), renderedProbes: probes, adapter: 'passed' });
});

it('records every registry alias and actual Studio field without guessing template IDs', () => {
  const groups = new Map();
  Object.entries(templateRegistry).forEach(([alias, renderer]) => {
    if (!groups.has(renderer)) groups.set(renderer, []);
    groups.get(renderer).push(alias);
  });
  expect(groups.size).toBeGreaterThan(5);
  const source = readFileSync(resolve('src/features/invitations/InvitationForm.jsx'), 'utf8');
  const defaults = source.split('const DEFAULT_STATE = {')[1].split('\n};')[0];
  const fields = [...new Set([...defaults.matchAll(/^ {4}(\w+):/gm)].map(match => match[1]).concat([...source.matchAll(/update\("(\w+)"/g)].map(match => match[1]), ['programDays', 'saveTheDate', 'eventEndDate', 'eventEndTime', 'calendarUid', 'preWeddingVideo', 'studioStyle', 'fontKhmer', 'fontLatin', 'elementFonts', 'sectionOrder']))].sort();
  if (process.env.PHASE10_GENERATE === 'true') {
    const folder = resolve('../../docs/phase10'); mkdirSync(folder, { recursive: true });
    const sectionFields = {
      eventInfo: ['title','subtitle','hostName','partnerName','groomName','brideName'],
      family: ['groomFather','groomMother','brideFather','brideMother'],
      invitation: ['messageTitle','messageText','invitationImage','invitationImage2'],
      closing: ['thankYouTitle','thankYouText','apologyTitle','apologyText'], languageMode: ['languageMode','language'],
      schedule: ['schedule','showSchedule','programDays'], countdown: ['eventDate','eventDateText','eventTime','eventTimezone','eventEndDate','eventEndTime','calendarUid','saveTheDate','showCountdown'],
      venue: ['venueName','venueAddress','googleMapUrl','sketchMapImage'], gallery: ['photos'],
      cover: ['templateId','coverImage','coverBackgroundImage','backgroundImage','brandMarkUrl','showBrandMark','hideCoupleNameOnCover','guestName','openingStyle','frontColor','bottomColor'],
      appearance: ['studioStyle','fontKhmer','fontLatin','elementFonts','backgroundColor','sectionOrder'],
      music: ['musicTrackId','musicUrl'], preWeddingVideo: ['preWeddingVideo'], story: ['showStory','storyChapters'],
      party: ['showParty','party'], faq: ['showFaq','faq'], dressCode: ['showDressCode','dressCode','dressColors'], khqr: ['khqrDollar','khqrRiel'],
    };
    const tabs = { eventInfo: 'eventInformation', family: 'eventInformation', invitation: 'eventInformation', closing: 'eventInformation', languageMode: 'eventInformation', schedule: 'scheduleVenue', countdown: 'scheduleVenue', venue: 'scheduleVenue', gallery: 'mediaOpening', music: 'mediaOpening', preWeddingVideo: 'mediaOpening', cover: 'designCover', appearance: 'designCover', story: 'guestExperience', party: 'guestExperience', faq: 'guestExperience', dressCode: 'guestExperience', khqr: 'guestExperience' };
    const fieldContracts = fields.map(field => {
      const section = Object.entries(sectionFields).find(([, list]) => list.includes(field))?.[0] || 'eventInfo';
      return { field, section, tab: tabs[section], control: `InvitationForm / ${section}; specialized Studio editor where present`, stateOwner: 'InvitationForm.form / useStudioPersistence',
        serialization: ['title','hostName','partnerName','groomName','brideName','eventDate','eventTime','venueName','venueAddress','googleMapUrl','languageMode','visibility','templateId'].includes(field) ? `InvitationRequest.${field} and existing JSON aliases where applicable` : `contentJson.${field} / existing designJson media or appearance aliases`,
        permission: field === 'preWeddingVideo' ? 'EDIT_EVENT + active owner PRE_WEDDING_VIDEO entitlement + same-event media IDs' : 'EDIT_EVENT + expectedUpdatedAt; owner-only access settings',
        preview: 'LivePhoneSimulator → authenticated preview channel → TemplateExperience', public: 'PublicInvitationFeature → publicInvitationToDraft → draftToTemplate → TemplateExperience',
      };
    });
    writeFileSync(resolve(folder, '01-studio-template-contract-matrix.json'), JSON.stringify({
      schemaVersion: 1, generatedBy: 'PHASE10_GENERATE=true vitest run phase10Contract.test.jsx',
      evidenceScope: 'Real React render + saved JSON/public adapter; HTTP and browser lifecycle results are separate. False rendered probes require the section-level audit; adapter presence alone is not renderer support.',
      registryAliasCount: Object.keys(templateRegistry).length, rendererAliases: [...groups.values()], studioFields: fields,
      fieldContracts,
      lifecycleScope: 'Every catalog template: title edit/preview/save/reload/fixture-publication/public DOM; complete native HTTP/MySQL media/ticket/program and Settings journeys separately. Individual atomic HTTP lifecycle for every one of the 70 state properties is not claimed.',
      templates: output.map(template => ({ ...template, fields: fieldContracts.map(contract => ({ field: contract.field,
        status: template.capabilities[contract.section] === false ? 'intentionally unsupported' : 'supported',
        rendererProbe: template.renderedProbes[contract.field] ?? null,
        evidence: template.capabilities[contract.section] === false ? 'Capability registry exclusion; saved JSON retained' : template.renderedProbes[contract.field] === true ? 'phase10Contract.test.jsx: actual mounted renderer text' : 'Source contract; cover/open-state and per-field browser evidence vary. See lifecycleScope.',
      })) })),
    }, null, 2) + '\n');
  }
});
