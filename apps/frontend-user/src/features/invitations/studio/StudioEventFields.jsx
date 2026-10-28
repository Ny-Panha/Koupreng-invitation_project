import { DatePicker } from '@/shared/ui/DatePicker';
import { TimePicker } from '@/shared/ui/TimePicker';
import { StudioField, StudioFormRow, StudioDateTimeGroup } from './StudioFields';

export default function StudioEventFields({ form, authoredForm, fieldId, update, english, t, copy, errors = {} }) {
  const zone = form.eventTimezone || 'Asia/Phnom_Penh';
  const zones = [...new Set([zone,'Asia/Phnom_Penh','Asia/Bangkok','Asia/Singapore','UTC', ...(Intl.supportedValuesOf?.('timeZone') || [])])];
  return <section className="pe-section-card" aria-label={copy('ព័ត៌មានកម្មវិធី','Event information')}>
    <StudioField id={`${fieldId}-title`} english={english} label={t('mainTitle') || copy('ចំណងជើងធំលើក្រប','Cover title')}>
      <input type="text" className="pe-input" name="title" value={authoredForm.title} onChange={event => update('title',event.target.value)} placeholder={copy('សិរីមង្គលអាពាហ៍ពិពាហ៍','Wedding celebration')} />
    </StudioField>
    <StudioFormRow>
      <StudioField id={`${fieldId}-groom`} english={english} required label={t('groom') || copy('ឈ្មោះកូនកំលោះ','Groom name')}>
        <input type="text" className="pe-input" name="groomName" value={authoredForm.groomName} onChange={event => update('groomName',event.target.value)} placeholder={copy('វណ្ណដា','VannDa')} />
      </StudioField>
      <StudioField id={`${fieldId}-bride`} english={english} required label={t('bride') || copy('ឈ្មោះកូនក្រមុំ','Bride name')}>
        <input type="text" className="pe-input" name="brideName" value={authoredForm.brideName} onChange={event => update('brideName',event.target.value)} placeholder={copy('ស្រីពេជ្រ','Sreypich')} />
      </StudioField>
    </StudioFormRow>
    <StudioDateTimeGroup english={english}>
      <StudioField id={`${fieldId}-date`} english={english} required label={t('dateTime') || copy('កាលបរិច្ឆេទកម្មវិធី','Event date')}>
        <DatePicker value={form.eventDate} onChange={value => { update('eventDate',value); update('eventDateText',value); }} placeholder={copy('ជ្រើសកាលបរិច្ឆេទ','Choose date')} />
      </StudioField>
      <StudioField id={`${fieldId}-time`} english={english} error={errors.eventTime} label={t('timePicker') || copy('ម៉ោងទទួលភ្ញៀវ','Event time')}>
        <TimePicker value={form.eventTime} onChange={value => update('eventTime',value)} placeholder={copy('ជ្រើសម៉ោង','Choose time')} />
      </StudioField>
      <StudioField id={`${fieldId}-timezone`} english={english} error={errors.eventTimezone} label={copy('តំបន់ម៉ោងកម្មវិធី','Event timezone')}>
        <select name="eventTimezone" className="pe-input" value={zone} onChange={event => update('eventTimezone',event.target.value)}>{zones.map(value => <option value={value} key={value}>{value.replaceAll('_',' ')}</option>)}</select>
      </StudioField>
    </StudioDateTimeGroup>
  </section>;
}
