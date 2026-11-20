import { useLayoutEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

// A request belongs to one mounted document, session and permission grant.
// Abort synchronously on store changes, before Axios selects credentials.
export function useStudioAuthority(canEdit) {
  const [identity] = useState(() => {
    const state = useAuthStore.getState();
    return { userId: state.user?.id ?? state.user?.userId, token: state.accessToken, status: state.authStatus };
  });
  const scope = useRef(null);
  useLayoutEffect(() => {
    const controller = new AbortController();
    scope.current = controller;
    const matches = state => (state.user?.id ?? state.user?.userId) === identity.userId
      && state.accessToken === identity.token && state.authStatus === identity.status;
    if (!canEdit || !matches(useAuthStore.getState())) controller.abort();
    const unsubscribe = useAuthStore.subscribe(state => { if (!matches(state)) controller.abort(); });
    return () => { controller.abort(); unsubscribe(); };
  }, [canEdit, identity]);
  return {
    begin() {
      const controller = scope.current;
      return { signal: controller?.signal,
        isCurrent: () => Boolean(controller && controller === scope.current && !controller.signal.aborted) };
    },
  };
}
