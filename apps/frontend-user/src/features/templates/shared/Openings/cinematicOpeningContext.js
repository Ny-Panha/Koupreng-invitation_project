import { createContext, useContext } from 'react';

export const CinematicOpeningContext = createContext(() => false);
export function useCinematicOpening() { return useContext(CinematicOpeningContext); }
export const CinematicPlaybackContext = createContext({ active: false, stop: () => {} });
export function useCinematicPlayback() { return useContext(CinematicPlaybackContext); }
