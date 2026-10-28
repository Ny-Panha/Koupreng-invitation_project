import { useCallback, useState } from 'react';

/** Keep the legacy inline message while retaining the server reason for access guidance. */
export function useAccessError() {
  const [state, setState] = useState({ message: '', failure: null });
  const setError = useCallback(value => setState({ message: typeof value === 'string' ? value : value?.message || 'Request failed', failure: value && typeof value === 'object' ? value : null }), []);
  return [state.message, setError, state.failure];
}
