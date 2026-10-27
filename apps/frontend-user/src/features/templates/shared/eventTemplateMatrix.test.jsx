import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import TemplateExperience from '../experience/TemplateExperience';
import { TEMPLATES } from '../data/templatesData';
import { templateCapabilities } from '../registry/templateCapabilities';
import { resolveTemplateRenderer } from '../registry/templateRegistry';
import { draftToTemplate } from '../../wedding-builder/utils/draftToTemplate';
import { publicInvitationToDraft } from '../../wedding-builder/utils/invitationDraftAdapter';

afterEach(cleanup);
const templates = [...TEMPLATES, { id: 'event-essential', code: 'event-essential' }].filter(tpl => resolveTemplateRenderer(tpl).available && templateCapabilities(tpl).schedule);
const row = { id: 'ceremony', dayId: 'first', time: '07:00', title: 'ពិធីដែលបានរក្សាទុក', titleEn: 'Authored ceremony', description: 'ពិធីមង្គលការ '.repeat(30), descriptionEn: 'An extended ceremony description '.repeat(20) };
const days = [{ id: 'first', date: '2028-02-29', title: 'ថ្ងៃដំបូង', titleEn: 'Our first day' }, { id: 'next', date: '2028-03-01', title: 'ពិធីទទួលភ្ញៀវ', titleEn: 'Our second day' }];
const scenarios = ['empty', 'single', 'multiple', 'khmer', 'english', 'past', 'all-day', 'disabled'];

describe('every available template through the public/draft renderer boundary', () => {
  for (const template of templates) for (const scenario of scenarios) it(`${template.code || template.id}: ${scenario}`, async () => {
    const disabled = scenario === 'disabled';
    const schedule = scenario === 'empty' ? [] : [row, ...(scenario === 'multiple' ? [{ ...row, id: 'reception', dayId: 'next', titleEn: 'Authored reception' }] : [])];
    const data = { programDays: days, schedule, showSchedule: !disabled, eventTimezone: 'America/New_York', saveTheDate: { enabled: !disabled, showCalendar: true, showAddToCalendar: true, countdownStyle: 'circles' } };
    const publicData = { id: 123, templateCode: template.code || template.id, eventType: template.id === 'event-essential' ? 'BIRTHDAY' : 'WEDDING', title: 'Fictional matrix event', languageMode: scenario === 'khmer' ? 'KH' : 'EN', eventDate: scenario === 'past' ? '2020-01-01' : '2028-02-29', eventTime: scenario === 'all-day' ? '' : '17:00', contentJson: JSON.stringify(data), enabledSections: JSON.stringify({ schedule: !disabled, countdown: !disabled, story: false, gallery: false, gift: false, dressCode: false, faq: false, rsvp: false }) };
    const draft = publicInvitationToDraft(publicData, {});
    const mapped = draftToTemplate(draft);
    expect(mapped).not.toBeNull();
    const view = render(<MemoryRouter><TemplateExperience tpl={mapped.tpl} variant={mapped.variant} preview showActions={false} /></MemoryRouter>);
    if (disabled) {
      await waitFor(() => expect(view.container.querySelector('[role="status"]')?.textContent || '').not.toMatch(/Loading/));
      expect(view.container.querySelector('.kp-program')).toBeNull(); expect(view.container.querySelector('.kp-save-date')).toBeNull();
    } else {
      await waitFor(() => expect(view.container.querySelector('.kp-calendar-event')).not.toBeNull());
      expect(view.container.querySelector('.kp-calendar-event').dateTime).toBe(publicData.eventDate);
      expect(view.container.querySelector('.kp-program')).toBe(scenario === 'empty' ? null : view.container.querySelector('.kp-program'));
      if (schedule.length) {
        expect(view.container.querySelector('.kp-program')).not.toBeNull();
        expect(view.container.querySelectorAll('.kp-timeline li')).toHaveLength(schedule.length);
      }
      if (scenario === 'all-day' || scenario === 'past') expect(view.container.querySelector('.kp-countdown')).toBeNull();
      if (scenario === 'past') expect(view.container.querySelector('.kp-event-started')).not.toBeNull();
    }
    expect(view.container.textContent).not.toContain('This template is unavailable');
  });
  it('keeps the developer boilerplate explicitly unsupported and preset aliases consistent', () => {
    expect(templateCapabilities({ code: 'template-boilerplate' })).toMatchObject({ schedule: false, saveTheDate: false, calendar: false });
    expect(templateCapabilities({ presetId: 'SILK_HERITAGE' })).toMatchObject({ schedule: true, sectionOrdering: true });
    expect(templateCapabilities({ code: 'silk-heritage', id: 5 }).schedule).toBe(true);
  });
});
