import { packageLimit, packagePrice } from '../marketing/model/packagePresentation';

export default function PackageComparison({ plans, lang, copy }) {
  const yesNo = value => value ? copy('រួមបញ្ចូល', 'Included') : copy('មិនរួមបញ្ចូល', 'Not included');
  const limit = value => value === undefined ? copy('មិនបានបញ្ជាក់', 'Not specified') : packageLimit(value, lang);
  const rows = [
    [copy('តម្លៃ និងរូបិយប័ណ្ណ', 'Price and currency'), p => packagePrice(p, lang) || copy('មិនមាន', 'Unavailable')],
    [copy('រយៈពេល (ថ្ងៃ)', 'Access duration (days)'), p => p.durationDays == null ? copy('មិនបានបញ្ជាក់', 'Not specified') : String(p.durationDays)],
    [copy('ចំនួនកម្មវិធី', 'Event records'), p => limit(p.maxInvitations)],
    [copy('កំណត់ត្រាភ្ញៀវសរុប', 'Guest records across account'), p => limit(p.maxGuests)],
    [copy('កំណត់ត្រាភ្ញៀវក្នុងមួយកម្មវិធី', 'Guest records per event'), p => limit(p.maxGuestsPerInvitation === undefined ? p.maxGuests : p.maxGuestsPerInvitation)],
    [copy('សមាជិកក្រុម (រួមម្ចាស់)', 'Team members (including owner)'), p => p.teamMembersEnabled ? limit(p.maxTeamMembers) : yesNo(false)],
    ...[
      ['premiumTemplatesEnabled', 'គំរូ Premium', 'Premium templates'], ['qrInvitationsEnabled', 'ធៀប QR', 'QR invitations'],
      ['qrCheckInEnabled', 'ចូលរួមតាម QR', 'QR check-in'], ['seatingEnabled', 'ប្លង់អង្គុយ', 'Seating'],
      ['advancedAnalyticsEnabled', 'វិភាគកម្រិតខ្ពស់', 'Advanced analytics'], ['customBrandingEnabled', 'អត្តសញ្ញាណផ្ទាល់ខ្លួន', 'Custom branding'],
    ].map(([key, km, en]) => [copy(km, en), p => yesNo(p[key])]),
  ];
  if (!plans.length) return null;
  return <section className="workspace-section pkg-comparison"><h2>{copy('ប្រៀបធៀបកញ្ចប់លម្អិត', 'Compare plan benefits')}</h2>
    <p id="package-unit-help">{copy('ចំនួនភ្ញៀវគិតតាមកំណត់ត្រាភ្ញៀវ មិនមែនចំនួនកៅអី ឬអ្នកចូលរួមទេ។ កំណត់ត្រាមួយអាចកក់ច្រើនកៅអី។ តម្លៃ និងកម្រិតខាងក្រោមមកពីការកំណត់ម៉ាស៊ីនមេ។', 'Guest limits count guest records. One record may reserve several seats; seats and attendees use separate counts. Prices and limits below come from server configuration.')}</p>
    <div className="pkg-comparison-scroll" role="region" tabIndex={0} aria-label={copy('តារាងប្រៀបធៀបកញ្ចប់ អាចរំកិល', 'Plan comparison, scrollable')}>
      <table aria-describedby="package-unit-help"><caption className="sr-only">{copy('អត្ថប្រយោជន៍កញ្ចប់បច្ចុប្បន្ន', 'Currently configured plan benefits')}</caption>
        <thead><tr><th scope="col">{copy('អត្ថប្រយោជន៍', 'Benefit')}</th>{plans.map(p => <th scope="col" key={p.id}>{p.packageName}</th>)}</tr></thead>
        <tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{plans.map(p => <td key={p.id}>{value(p)}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <p>{copy('សមត្ថភាពក្រុមរាប់សមាជិកសកម្ម និងការអញ្ជើញរង់ចាំ ក្នុងក្រុមទាំងអស់របស់ម្ចាស់ រួមទាំងកំណត់ត្រាម្ចាស់ក្នុងក្រុមនីមួយៗ។', 'Team capacity counts active and invited memberships across the owner’s workspaces, including an owner entry in each workspace.')}</p>
  </section>;
}
