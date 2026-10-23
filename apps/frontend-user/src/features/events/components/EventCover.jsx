import { useState } from 'react';
import { eventCoverCandidates } from '../model/eventCover';

function CoverImage({ candidates, ...props }) {
  const [index, setIndex] = useState(0);
  return <img {...props} src={candidates[index].url} onError={() => setIndex(current => Math.min(current + 1, candidates.length - 1))} />;
}

export default function EventCover({ event, ...props }) {
  const candidates = eventCoverCandidates(event);
  return <CoverImage key={`${event?.id}:${candidates.map(item => item.url).join('|')}`} candidates={candidates} {...props} />;
}
