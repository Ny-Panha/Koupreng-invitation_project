import { resolveEvent } from '../../templates/shared/eventDateTime';

/** Preview-only examples never enter the authored form or save payload. */
export function stylePreviewContent(form, english) {
  const dateIsSample = !resolveEvent(form).validDate;
  const programIsSample = !form.schedule?.some(item => item.enabled !== false);
  const date = dateIsSample ? { ...form, eventDate: '2030-12-05', eventTime: '17:30' } : form;
  const program = programIsSample ? {
    ...date,
    programDays: [{ id: 'preview-day', date: date.eventDate, title: '' }],
    schedule: [
      { id: 'preview-ceremony', dayId: 'preview-day', time: '09:00', title: english ? 'Family blessing' : 'ពិធីសូត្រមន្ត', titleEn: 'Family blessing' },
      { id: 'preview-reception', dayId: 'preview-day', time: '17:30', title: english ? 'Wedding reception' : 'ពិធីទទួលភ្ញៀវ', titleEn: 'Wedding reception' },
    ],
  } : form;
  return { date, program, dateIsSample, programIsSample };
}
