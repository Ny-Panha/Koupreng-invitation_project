import { createContext, useContext, useState } from 'react';

export const initialContactForm = Object.freeze({ name: '', email: '', phone: '', plan: 'General inquiry', message: '' });
export const ContactDraftContext = createContext(null);

// Keep standalone consumers isolated; real marketing routes share only their
// shell's short-lived memory. No contact details enter browser storage.
export function useContactDraft() {
  const local = useState(initialContactForm);
  return useContext(ContactDraftContext) || local;
}
