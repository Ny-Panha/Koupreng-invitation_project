import { useEffect, useState } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';
import UpgradeFeatureDialog from '../access/UpgradeFeatureDialog';
import { cancelFeedback, settleFeedback } from './feedback';

export default function FeedbackHost() {
  const [queue, setQueue] = useState([]);
  useEffect(() => {
    const show = ({ detail }) => {
      setQueue(current => {
        if (current.some(item => item.kind === detail.kind && (detail.kind === 'confirm'
          ? item.title === detail.title && item.message === detail.message
          : item.feature === detail.feature && item.decision?.reason === detail.decision?.reason && item.event?.eventId === detail.event?.eventId))) {
          settleFeedback(detail.id); return current;
        }
        return [...current, detail];
      });
    };
    window.addEventListener('koupreng:feedback', show);
    return () => { window.removeEventListener('koupreng:feedback', show); cancelFeedback(); };
  }, []);
  const request = queue[0];
  if (!request) return null;
  const close = value => { settleFeedback(request.id, value); setQueue(current => current.filter(item => item.id !== request.id)); };
  if (request.kind === 'confirm') return <ConfirmDialog isOpen title={request.title} message={request.message || request.description} confirmLabel={request.confirmText} cancelLabel={request.cancelText} isDestructive={request.destructive} onClose={() => close(false)} onConfirm={() => close(true)} />;
  return <UpgradeFeatureDialog key={request.id} request={request} onClose={() => close(false)} />;
}
