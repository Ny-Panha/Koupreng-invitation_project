// UI guidance mirrors the existing publish fields; the backend remains authoritative.
export function publishReadiness(form, eventType = 'WEDDING') {
  const couple = ['WEDDING', 'ENGAGEMENT'].includes(eventType);
  const fields = [
    ['title', 'title', 'eventInfo', 'Event title', 'ចំណងជើងកម្មវិធី'],
    ...(couple ? [
      ['groomName', 'groom', 'eventInfo', 'First host', 'ម្ចាស់កម្មវិធីទីមួយ'],
      ['brideName', 'bride', 'eventInfo', 'Partner', 'ដៃគូ'],
    ] : [['hostName', 'groom', 'eventInfo', 'Host', 'ម្ចាស់កម្មវិធី']]),
    ['eventDate', 'date', 'eventInfo', 'Event date', 'កាលបរិច្ឆេទ'],
    ['eventTime', 'time', 'eventInfo', 'Event time', 'ម៉ោងកម្មវិធី'],
    ['venueName', 'venueName', 'venue', 'Venue name', 'ឈ្មោះទីកន្លែង'],
    ['venueAddress', 'venueAddress', 'venue', 'Venue address', 'អាសយដ្ឋានទីកន្លែង'],
  ];
  return fields.map(([key, field, section, en, km]) => ({ key, field, section, en, km,
    complete: Boolean(String(form[key] || (key === 'hostName' ? form.groomName : '') || '').trim()) }));
}
