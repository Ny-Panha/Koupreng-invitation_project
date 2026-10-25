import { createContext, useContext } from 'react';

export const CinematicOpeningContext = createContext(() => false);
export function useCinematicOpening() { return useContext(CinematicOpeningContext); }
