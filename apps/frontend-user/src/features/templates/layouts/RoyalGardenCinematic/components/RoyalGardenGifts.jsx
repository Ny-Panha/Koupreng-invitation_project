import { useState } from 'react';
import { Modal } from '@/shared/ui';
export default function RoyalGardenGifts({ items, english }) {
  const [chosen, setChosen] = useState(null), [expanded, setExpanded] = useState(false), [status, setStatus] = useState('');
  const item = items.find(entry => entry.id === chosen) || items[0];
  if (!item) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(item.number); setStatus(english ? 'Account number copied.' : 'បានចម្លងលេខគណនី។'); }
    catch { setStatus(english ? 'Please select and copy the account number below.' : 'សូមជ្រើស និងចម្លងលេខគណនីខាងក្រោម។'); }
  };
  return <div className="rg-gifts">
    {items.length > 1 && <div className="rg-gift-currencies" role="group" aria-label={english ? 'Gift currency' : 'រូបិយប័ណ្ណចំណងដៃ'}>{items.map(entry => <button type="button" key={entry.id} aria-pressed={entry.id === item.id} onClick={() => { setChosen(entry.id); setStatus(''); }}>{entry.currency}</button>)}</div>}
    <h3>{item.currency}{item.bank && ` · ${item.bank}`}</h3>
    <button type="button" className="rg-gift-enlarge" onClick={() => setExpanded(true)} aria-label={english ? 'Enlarge gift QR' : 'ពង្រីក QR ចំណងដៃ'}><img src={item.src} alt={`${item.currency} ${english ? 'gift QR' : 'QR ចំណងដៃ'}`} width="280" height="280" loading="lazy" /></button>
    {item.name && <p>{item.name}</p>}{item.number && <><p className="rg-account-number">{item.number}</p><button type="button" className="rg-calendar-return" onClick={copy}>{english ? 'Copy account number' : 'ចម្លងលេខគណនី'}</button></>}
    <p className="rg-muted">{english ? 'Scan with your banking app to send a wedding gift. Confirm the recipient and currency in your banking app.' : 'ស្កេនតាមកម្មវិធីធនាគារដើម្បីផ្ញើចំណងដៃ។ សូមពិនិត្យឈ្មោះអ្នកទទួល និងរូបិយប័ណ្ណក្នុងកម្មវិធីធនាគារ។'}</p>
    <p role="status">{status}</p>
    <Modal isOpen={expanded} onClose={() => setExpanded(false)} title={english ? `${item.currency} wedding gift QR` : `${item.currency} QR ចំណងដៃ`} closeLabel={english ? 'Close gift QR' : 'បិទ QR ចំណងដៃ'}><img src={item.src} className="rg-expanded-qr" alt={`${item.currency} gift QR`} /></Modal>
  </div>;
}
