import { CalendarDays, Users, HandHeart, Gift, UtensilsCrossed, Music2 } from 'lucide-react';
const icons = { calendar: CalendarDays, gathering: Users, blessing: HandHeart, offering: Gift, meal: UtensilsCrossed, reception: Music2 };
export default function CeremonyIcon({ iconKey, size = 22 }) {
  const Icon = icons[iconKey] || CalendarDays;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" focusable="false" />;
}
