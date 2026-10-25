import SaveTheDate from '../../../shared/SaveTheDate';

export default function TemplateCountdown({ content }) {
  return <section className="tx-section tx-countdown" data-tx-section="countdown"><div className="tx-shell tx-shell--narrow"><SaveTheDate content={content} /></div></section>;
}
