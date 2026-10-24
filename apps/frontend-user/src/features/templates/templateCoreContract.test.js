import { describe, expect, it } from 'vitest';
import { TEMPLATES } from './data/templatesData';
import { publicInvitationToDraft } from '../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../wedding-builder/utils/draftToTemplate';
import { buildTemplateContent } from './experience/config/templateExperienceContent';
import { templateCapabilities } from './registry/templateCapabilities';

describe.each(TEMPLATES)('$id editor/storage/preview adapter contract', template => {
  it('retains program metadata and saved story through serialized reopen without template defaults overwriting edits', () => {
    const content = {
      schedule: [{ id: 'first', day: 1, date: '2028-02-29', time: '07:30', period: 'MORNING', title: 'ពិធី', description: 'Edited' },
        { id: 'second', day: 2, date: '2028-03-02', time: '17:30', endTime: '20:00', period: 'EVENING', title: 'Reception' }],
      showStory: true, storyChapters: [{ id: 'story', title: 'រឿងរ៉ាវ', text: 'ក្តីស្រឡាញ់\nLiteral <script>text</script>', image: '' }],
    };
    const draft = publicInvitationToDraft({ id: 101, templateCode: template.code || template.id, title: 'Owner title', eventType: 'WEDDING', eventDate: '2028-02-28',
      contentJson: JSON.stringify(content), enabledSections: JSON.stringify({ story: true, schedule: true }) });
    const reopened = draftToTemplate(JSON.parse(JSON.stringify(draft)), []);
    expect(reopened).not.toBeNull();
    const view = buildTemplateContent(reopened.tpl, reopened.variant);
    expect(view.schedule).toMatchObject(content.schedule);
    expect(view.story).toMatchObject(content.storyChapters);
    const hidden = draftToTemplate({ ...draft, showStory: false }, []);
    const hiddenView = buildTemplateContent(hidden.tpl, hidden.variant);
    expect(hiddenView.enabledSections.story).toBe(false);
    expect(hiddenView.story[0].text).toBe(content.storyChapters[0].text);
    expect(typeof templateCapabilities(template).story).toBe('boolean');
  });
});

it('nonwedding content retains its event type and empty program without wedding sample content', () => {
  const draft = publicInvitationToDraft({ id: 102, templateCode: 'event-essential', eventType: 'BIRTHDAY', eventDate: '2028-01-01', title: 'Birthday', contentJson: '{"schedule":[],"storyChapters":[]}' });
  const reopened = draftToTemplate(draft, []);
  expect(reopened.tpl.eventType).toBe('BIRTHDAY');
  expect(buildTemplateContent(reopened.tpl).schedule).toEqual([]);
});

it('admin-created aliases inherit the actual renderer capabilities', () => {
  expect(templateCapabilities({code:'admin-custom-layout',presetId:'EMERALD_GREEN'}).story).toBe(false);
  expect(templateCapabilities({code:'admin-custom-layout',presetId:'KHMER_CELESTIAL'}).story).toBe(true);
  expect(templateCapabilities({code:'admin-custom-layout',presetId:'custom-starter'}).schedule).toBe(false);
});
