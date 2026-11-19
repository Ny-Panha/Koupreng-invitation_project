export default function RsvpComposition({ dashboard, en }) {
  const rows = [
    ['attending', en ? 'Attending' : 'ចូលរួម', 'success'],
    ['declined', en ? 'Declined' : 'មិនចូលរួម', 'muted'],
    ['maybe', en ? 'Maybe' : 'ប្រហែល', 'info'],
    ['pending', en ? 'Awaiting reply' : 'រង់ចាំការឆ្លើយតប', 'warning'],
  ].map(([key,label,tone])=>({key,label,tone,value:dashboard?.[key]}));
  const known = value => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
  const total = dashboard?.totalGuests;
  const complete = known(total) && rows.every(row=>known(row.value)) && rows.reduce((sum,row)=>sum+row.value,0)===total;
  return <section className="workspace-section overview-rsvp" aria-labelledby="overview-rsvp-title" data-source="GET /api/v1/invitations/:id/dashboard">
    <div className="workspace-section-heading"><h2 id="overview-rsvp-title">{en ? 'Guest responses' : 'ការឆ្លើយតបរបស់ភ្ញៀវ'}</h2></div>
    <p className="workspace-muted">{en ? 'Current response status of guest records.' : 'ស្ថានភាពឆ្លើយតបបច្ចុប្បន្ននៃកំណត់ត្រាភ្ញៀវ។'}</p>
    {complete && total>0 ? <div className="overview-response-track" aria-hidden="true">{rows.map(row=><span key={row.key} className={`response-${row.tone}`} style={{width:`${row.value/total*100}%`}} />)}</div>
      : <p className="overview-response-empty">{complete && total===0 ? (en ? 'Add guests to start tracking responses.' : 'បន្ថែមភ្ញៀវដើម្បីតាមដានការឆ្លើយតប។') : (en ? 'A complete response breakdown is unavailable.' : 'មិនមានទិន្នន័យឆ្លើយតបពេញលេញ។')}</p>}
    <dl className="overview-response-legend">{rows.map(row=><div key={row.key} data-source={row.key}><dt><span aria-hidden="true" className={`response-dot response-${row.tone}`} />{row.label}</dt><dd>{known(row.value) ? `${row.value}${complete && total>0 ? ` (${Math.round(row.value/total*100)}%)` : ''}` : (en ? 'Unavailable' : 'មិនមានទិន្នន័យ')}</dd></div>)}</dl>
  </section>;
}
