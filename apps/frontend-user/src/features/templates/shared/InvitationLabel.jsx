import { useInvitationLocale } from './invitationLocaleContext';
import { invitationLabel } from './invitationLabels';
export default function InvitationLabel({ value }) { return invitationLabel(value, useInvitationLocale()); }
