import { createContext, useContext } from "react";
export const EventContext = createContext(null);
export function useEventWorkspace() { return useContext(EventContext); }
