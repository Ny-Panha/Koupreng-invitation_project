import { useEffect } from 'react';
import { isTrustedPreviewMessage, postPreviewMessage } from './previewMessaging';
import { STUDIO_EDIT_TARGETS } from './studioEditTargets';

export function useStudioPreviewEditing(channel) {
  useEffect(() => {
    if (!channel) return;
    let enabled = false;
    const mode = event => {
      if (isTrustedPreviewMessage(event, channel) && event.data.type === 'PREVIEW_EDIT_MODE') {
        enabled = event.data.open;
        document.documentElement.toggleAttribute('data-studio-click-edit', enabled);
      }
    };
    const edit = event => {
      // Preserve links, RSVP, opening controls, media and selectable controls.
      if (!enabled || event.defaultPrevented || event.target.closest('a,button,input,select,textarea,video,audio,summary,[role="button"]')) return;
      const section = Object.entries(STUDIO_EDIT_TARGETS).find(([, selector]) => event.target.closest(selector))?.[0];
      if (section) postPreviewMessage({ type: 'EDIT_STUDIO_SECTION', sectionKey: section }, channel);
    };
    window.addEventListener('message', mode);
    document.addEventListener('click', edit);
    return () => { window.removeEventListener('message', mode); document.removeEventListener('click', edit); document.documentElement.removeAttribute('data-studio-click-edit'); };
  }, [channel]);
}
