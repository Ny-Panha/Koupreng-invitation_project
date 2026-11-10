import { DatePicker } from '@/shared/ui/DatePicker';
import { TimePicker } from '@/shared/ui/TimePicker';
import { StudioField, StudioFormRow, StudioDateTimeGroup } from './StudioFields';
import { getEventExamples, getFieldHelpers } from '@/shared/utils/eventPlaceholders';

export default function StudioEventFields({ form, authoredForm, fieldId, update, english, t, copy, errors = {} }) {
  const eventType = form.eventType || 'WEDDING';
  const examples = getEventExamples(eventType, english ? 'en' : 'km');
  const helpers = getFieldHelpers(english ? 'en' : 'km');
  const zone = form.eventTimezone || 'Asia/Phnom_Penh';
  const zones = [...new Set([zone,'Asia/Phnom_Penh','Asia/Bangkok','Asia/Singapore','UTC', ...(Intl.supportedValuesOf?.('timeZone') || [])])];
  return <section className="pe-section-card" aria-label={copy('ព័ត៌មានកម្មវិធី','Event information')}>
    <StudioField id={`${fieldId}-title`} english={english} help={helpers.title} label={t('mainTitle') || copy('ចំណងជើងធំលើក្រប','Cover title')}>
      <input type="text" className="pe-input" name="title" value={authoredForm.title} onChange={event => update('title',event.target.value)} placeholder={examples.title} />
    </StudioField>
    <StudioFormRow>
      <StudioField id={`${fieldId}-groom`} english={english} required help={helpers.groomName} label={t('groom') || copy('ឈ្មោះកូនកំលោះ','Groom name')}>
        <input type="text" className="pe-input" name="groomName" value={authoredForm.groomName} onChange={event => update('groomName',event.target.value)} placeholder={examples.groomName} />
      </StudioField>
      <StudioField id={`${fieldId}-bride`} english={english} required help={helpers.brideName} label={t('bride') || copy('ឈ្មោះកូនក្រមុំ','Bride name')}>
        <input type="text" className="pe-input" name="brideName" value={authoredForm.brideName} onChange={event => update('brideName',event.target.value)} placeholder={examples.brideName} />
      </StudioField>
    </StudioFormRow>
    <StudioDateTimeGroup english={english}>
      <StudioField id={`${fieldId}-date`} english={english} required help={helpers.eventDate} label={t('dateTime') || copy('កាលបរិច្ឆេទកម្មវិធី','Event date')}>
        <DatePicker value={form.eventDate} onChange={value => { update('eventDate',value); update('eventDateText',value); }} placeholder={copy('ជ្រើសកាលបរិច្ឆេទ','Choose date')} />
      </StudioField>
      <StudioField id={`${fieldId}-time`} english={english} error={errors.eventTime} help={helpers.eventTime} label={t('timePicker') || copy('ម៉ោងទទួលភ្ញៀវ','Event time')}>
        <TimePicker value={form.eventTime} onChange={value => update('eventTime',value)} placeholder={copy('ជ្រើសម៉ោង','Choose time')} />
      </StudioField>
      <StudioField id={`${fieldId}-timezone`} english={english} error={errors.eventTimezone} help={copy('តំបន់ម៉ោងស្តង់ដារសម្រាប់កម្មវិធី (UTC+7 សម្រាប់កម្ពុជា)', 'Standard timezone for the event (UTC+7 for Cambodia)')} label={copy('តំបន់ម៉ោងកម្មវិធី','Event timezone')}>
        <select name="eventTimezone" className="pe-input" value={zone} onChange={event => update('eventTimezone',event.target.value)}>{zones.map(value => <option value={value} key={value}>{value.replaceAll('_',' ')}</option>)}</select>
      </StudioField>
    </StudioDateTimeGroup>
  </section>;
}
