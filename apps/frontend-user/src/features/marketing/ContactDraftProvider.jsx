import { useState } from 'react';
import { ContactDraftContext, initialContactForm } from './contactDraft';

export default function ContactDraftProvider({ children }) {
  const draft = useState(initialContactForm);
  return <ContactDraftContext.Provider value={draft}>{children}</ContactDraftContext.Provider>;
}
