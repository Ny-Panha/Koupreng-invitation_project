import { createContext, useContext } from 'react';
export const InvitationLocaleContext = createContext('both');
export const useInvitationLocale = () => useContext(InvitationLocaleContext);
