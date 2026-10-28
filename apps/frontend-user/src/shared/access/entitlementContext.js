import { createContext, useContext } from 'react';
export const EntitlementContext = createContext(null);
const unavailable = { verified: false, value: null, loading: false, refresh: () => {} };
export function useAccountEntitlements() { return useContext(EntitlementContext) || unavailable; }
